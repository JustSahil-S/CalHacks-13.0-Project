// Nearby places' real menus from DoorDash and Uber Eats (Apify), for the neighborhood prices
// customers compare against. Delivery apps mark prices up, so every price is cut by DELIVERY_MARKDOWN
// to approximate the in-store price. Steps (each a scheduled call, so no single call runs long):
//   queued    -> one Google search run finds each place's DoorDash / Uber Eats store page
//   searching -> one DoorDash run and one Uber Eats run read every store page found
//   scraping  -> menus collected per place
//   matching  -> one place per step: Claude matches its menu to ours (setRivalMenu, source "delivery")
// Places already read in-store by Mana's browser keep those prices. Places with no store page stay
// estimated.
import { ScheduleAt } from 'spacetimedb';
import type { ProcCtx } from './claude';
import { cityOf, SEARCH_ACTOR } from './menu';
import { ApifyBusy, datasetItems, runStatus, startRun, stillRunning, type Place } from './pipeline';
import { pull } from './rivals';
import { setRivalMenu } from './rivalprices';

export const DELIVERY_MARKDOWN = 0.85; // delivery apps run ~15% above in-store prices
const DD_ACTOR = 'stealth_mode~doordash-store-menu-scraper';
const UE_ACTOR = 'memo23~uber-eats-scraper';
const MAX_PLACES = 12; // the same strongest-pull places that get estimates

interface Target {
  key: string;
  name: string;
  dd?: string; // DoorDash store page
  ue?: string; // Uber Eats store page
}
interface State {
  targets: Target[];
  menus: { key: string; url: string; items: { name: string; price: number }[] }[]; // waiting to be matched
  matched: string[]; // "name: result"
}

const norm = (s: string) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP = new Set([
  'coffee', 'coffeehouse', 'cafe', 'caf', 'the', 'and', 'tea', 'bar', 'shop', 'house', 'roasters', 'roastery', 'company',
  'co', 'inc', 'llc', 'bakery', 'san', 'francisco', 'store', 'st', 'ave', 'street', 'avenue', 'blvd', 'rd', 'en', 'us',
]);
const words = (s: string) => norm(s).split(' ').filter(w => w.length >= 3 && !STOP.has(w) && !/\d/.test(w));
/**
 * Does a delivery store page belong to this place? Its link slug must carry most of the place's
 * distinctive name words AND be mostly made of them (so "The Deli Lama" is not "The Coffee Lama",
 * and "Morning Due Cafe" is not "Sunday Morning Coffee Club"). A street name in the slug is allowed
 * once (chains add their branch: "-toland-st").
 */
function belongs(name: string, url: string): boolean {
  const slug = decodeURIComponent(/\/store\/([^/?#]+)/.exec(url)?.[1] ?? '').replace(/-\d{4,}$/, '');
  const ours = words(name);
  const theirs = words(slug);
  if (!ours.length || !theirs.length) return norm(slug).includes(norm(name)) && norm(name).length >= 4;
  const common = ours.filter(w => theirs.includes(w)).length;
  return common / ours.length >= 0.6 && common / Math.max(1, theirs.length - 1) >= 0.6 && common >= 1;
}
// DoorDash store links come as /store/<slug>/<id>/ or /store/<slug>-<id>/ (optionally after /en-US/).
const DD_STORE = /^https?:\/\/(www\.)?doordash\.com\/([a-z]{2}-[A-Z]{2}\/)?store\/[^/?#]*\d{4,}/i;
const UE_STORE = /^https?:\/\/(www\.)?ubereats\.com\/([a-z-]+\/)?store\/[^/?#]+\/[^/?#]+/i;
const ddKey = (url: string) => /\/store\/[^?#]*?(\d{4,})\/?(?:[?#]|$)/.exec(url)?.[1] ?? url;
const ueKey = (url: string) => /\/store\/[^/]+\/([^/?#]+)/.exec(url)?.[1] ?? url;

export function queueDeliveryScan(tx: any, buildId: bigint, delaySeconds = 0) {
  const row = { buildId, status: 'queued', detail: 'Queued', searchRunId: '', ddRunId: '', ueRunId: '', stateJson: '' };
  if (tx.db.deliveryScan.buildId.find(buildId)) tx.db.deliveryScan.buildId.update(row);
  else tx.db.deliveryScan.insert(row);
  tx.db.deliveryJob.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch + BigInt(delaySeconds) * 1_000_000n),
    buildId,
  });
}

export function advanceDeliveryScan(ctx: ProcCtx, buildId: bigint) {
  const scan = ctx.withTx(tx => tx.db.deliveryScan.buildId.find(buildId));
  if (!scan || scan.status === 'done' || scan.status === 'failed') return;
  const set = (patch: Partial<typeof scan>) =>
    ctx.withTx(tx => {
      const cur = tx.db.deliveryScan.buildId.find(buildId);
      if (cur) tx.db.deliveryScan.buildId.update({ ...cur, ...patch });
    });
  const later = (s: number) =>
    ctx.withTx(tx =>
      tx.db.deliveryJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch + BigInt(s) * 1_000_000n), buildId })
    );
  try {
    const token = ctx.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN is not set for this database');
    const state: State = scan.stateJson ? JSON.parse(scan.stateJson) : { targets: [], menus: [], matched: [] };

    if (scan.status === 'queued') {
      const got = ctx.withTx(tx => {
        const b = tx.db.twinBuild.id.find(buildId);
        if (!b || !b.placeJson) return null;
        const place: Place = JSON.parse(b.placeJson);
        const rivals = [...tx.db.rival.buildId.filter(buildId)]
          .map(r => ({ r, w: pull(r) }))
          .sort((a, b2) => b2.w - a.w)
          .slice(0, MAX_PLACES)
          .map(({ r }) => ({ key: r.key, name: r.name }));
        return { city: cityOf(place.address ?? ''), rivals };
      });
      if (!got || !got.rivals.length) return set({ status: 'done', detail: 'No nearby places to read' });
      // A fresh scan replaces the last one's delivery prices (a store page may have been the wrong place).
      ctx.withTx(tx => {
        for (const r of [...tx.db.rivalPrice.buildId.filter(buildId)]) if (r.source === 'delivery') tx.db.rivalPrice.id.delete(r.id);
      });
      state.targets = got.rivals;
      const queries = got.rivals.flatMap(r => [`${r.name} ${got.city} doordash`, `${r.name} ${got.city} ubereats`]).join('\n');
      const runId = startRun(ctx, token, SEARCH_ACTOR, { queries, maxPagesPerQuery: 1, resultsPerPage: 10, countryCode: 'us', languageCode: 'en' });
      set({ status: 'searching', searchRunId: runId, stateJson: JSON.stringify(state), detail: `Finding ${got.rivals.length} nearby places on DoorDash and Uber Eats` });
      return later(10);
    }

    if (scan.status === 'searching') {
      const run = runStatus(ctx, token, scan.searchRunId);
      if (stillRunning(run.status)) return later(10);
      if (run.status !== 'SUCCEEDED') throw new Error(`store page search ${run.status}`);
      const pages = datasetItems(ctx, token, run.datasetId, 'searchQuery,organicResults', 100);
      for (const page of pages) {
        const term: string = page?.searchQuery?.term ?? '';
        const t = state.targets.find(x => term.startsWith(x.name + ' '));
        if (!t) continue;
        for (const res of page.organicResults ?? []) {
          const url = String(res.url ?? '');
          if (!t.dd && DD_STORE.test(url) && belongs(t.name, url)) t.dd = url.split('?')[0];
          if (!t.ue && UE_STORE.test(url) && belongs(t.name, url)) t.ue = url.split('?')[0];
        }
      }
      const dd = state.targets.filter(t => t.dd).map(t => t.dd!);
      const ue = state.targets.filter(t => t.ue).map(t => t.ue!);
      const ddRunId = dd.length ? startRun(ctx, token, DD_ACTOR, { urls: dd, ignore_url_failures: true, max_items_per_url: 300 }) : '';
      const ueRunId = ue.length
        ? startRun(ctx, token, UE_ACTOR, { startUrls: ue.map(url => ({ url })), maxItems: 300, includeItemCustomizations: false })
        : '';
      const found = state.targets.filter(t => t.dd || t.ue).length;
      if (!found) return set({ status: 'done', stateJson: JSON.stringify(state), detail: 'None of the nearby places are on DoorDash or Uber Eats' });
      set({
        status: 'scraping',
        ddRunId,
        ueRunId,
        stateJson: JSON.stringify(state),
        detail: `Reading ${found} of ${state.targets.length} nearby places' delivery menus (${dd.length} DoorDash, ${ue.length} Uber Eats)`,
      });
      return later(15);
    }

    if (scan.status === 'scraping') {
      const dd = scan.ddRunId ? runStatus(ctx, token, scan.ddRunId) : null;
      const ue = scan.ueRunId ? runStatus(ctx, token, scan.ueRunId) : null;
      if ((dd && stillRunning(dd.status)) || (ue && stillRunning(ue.status))) return later(15);
      const byPlace = new Map<string, { url: string; items: { name: string; price: number }[] }>();
      const add = (key: string, url: string, items: { name: string; price: number }[]) => {
        // Prefer whichever app lists more of the place's menu.
        if (items.length >= 3 && (!byPlace.has(key) || byPlace.get(key)!.items.length < items.length)) byPlace.set(key, { url, items });
      };
      if (dd?.status === 'SUCCEEDED') {
        const rows = datasetItems(ctx, token, dd.datasetId, 'name,from_url,quick_add_context', 5000);
        for (const t of state.targets.filter(x => x.dd)) {
          const id = ddKey(t.dd!);
          const items = rows
            .filter(r => ddKey(String(r.from_url ?? '')) === id)
            .map(r => ({ name: String(r.name ?? ''), cents: Number(r.quick_add_context?.price?.unit_amount) }))
            .filter(r => r.name && r.cents > 0)
            .map(r => ({ name: r.name, price: Math.round(r.cents * DELIVERY_MARKDOWN) / 100 }));
          add(t.key, t.dd!, items);
        }
      }
      if (ue?.status === 'SUCCEEDED') {
        const stores = datasetItems(ctx, token, ue.datasetId, 'url,storeUrl,inputUrl,startUrl,menuItems', 200);
        for (const t of state.targets.filter(x => x.ue)) {
          const id = ueKey(t.ue!);
          const store = stores.find(s => [s.url, s.storeUrl, s.inputUrl, s.startUrl].some(u => typeof u === 'string' && ueKey(u) === id));
          const items = (store?.menuItems ?? [])
            .map((m: any) => ({ name: String(m.name ?? ''), dollars: Number(m.price) }))
            .filter((m: any) => m.name && m.dollars > 0)
            .map((m: any) => ({ name: m.name, price: Math.round(m.dollars * DELIVERY_MARKDOWN * 100) / 100 }));
          add(t.key, t.ue!, items);
        }
      }
      (state as any).sizes = state.targets.map(t => `${t.name}: ${byPlace.get(t.key)?.items.length ?? 0} items`);
      state.menus = [...byPlace].map(([key, v]) => ({ key, url: v.url, items: v.items.slice(0, 400) }));
      if (!state.menus.length) return set({ status: 'done', stateJson: JSON.stringify(state), detail: 'Store pages found, but no menus could be read' });
      set({ status: 'matching', stateJson: JSON.stringify(state), detail: `Matching ${state.menus.length} delivery menus to ours` });
      return later(1);
    }

    if (scan.status === 'matching') {
      const next = state.menus.shift();
      if (next) {
        // A place Mana's browser read in-store keeps that (better) reading.
        const inStore = ctx.withTx(tx => [...tx.db.rivalPrice.buildId.filter(buildId)].some(r => r.rivalKey === next.key && r.source === 'menu'));
        const name = state.targets.find(t => t.key === next.key)?.name ?? next.key;
        const res = inStore ? 'kept the in-store menu' : setRivalMenu(ctx, buildId, next.key, next.items, next.url, 'delivery');
        state.matched.push(`${name}: ${res}`);
      }
      if (state.menus.length) {
        set({ stateJson: JSON.stringify(state), detail: `Matched ${state.matched.length} delivery menus; ${state.menus.length} to go` });
        return later(1);
      }
      const ok = state.matched.filter(m => m.includes(': ok')).length;
      // Places without a real menu (none found, or the old delivery prices were cleared) get estimates.
      ctx.withTx(tx =>
        tx.db.rivalPriceJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch), buildId })
      );
      return set({
        status: 'done',
        stateJson: JSON.stringify(state),
        detail: `${ok} of ${state.targets.length} nearby places priced from DoorDash / Uber Eats menus (prices cut ${Math.round((1 - DELIVERY_MARKDOWN) * 100)}%)`,
      });
    }
  } catch (e) {
    if (e instanceof ApifyBusy) {
      set({ detail: 'Waiting for a free Apify slot' });
      return later(20);
    }
    set({ status: 'failed', detail: String(e).slice(0, 400) });
  }
}
