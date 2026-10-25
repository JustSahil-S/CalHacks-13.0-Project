// Nearby places' real menus from DoorDash and Uber Eats (Apify), for the neighborhood prices
// customers compare against. Delivery apps mark prices up, so every price is cut by DELIVERY_MARKDOWN
// to approximate the in-store price. Steps (each a scheduled call, so no single call runs long):
//   queued    -> one Google search run finds each place's DoorDash / Uber Eats store page
//   searching -> one DoorDash run and one Uber Eats run read every store page found
//   scraping  -> menus collected per place
//   photos    -> places with neither app's menu: one Google Maps run for their photos
//   matching  -> one place per step: Claude matches its delivery menu to ours (source "delivery"), or
//                reads prices off its menu photos (source "photo")
// Whichever app has the menu is used (both: the fuller one). Places already read in-store by Mana's
// browser keep those prices. Places with no menu anywhere stay estimated.
import { ScheduleAt } from 'spacetimedb';
import type { ProcCtx } from './claude';
import { cityOf, SEARCH_ACTOR } from './menu';
import { ApifyBusy, datasetItems, runStatus, startRun, stillRunning, type Place } from './pipeline';
import { pull } from './rivals';
import { readRivalPhotos, setRivalMenu } from './rivalprices';

export const DELIVERY_MARKDOWN = 0.85; // delivery apps run ~15% above in-store prices
const DD_ACTOR = 'scrapesage~doordash-scraper'; // stealth_mode's store scraper returned no items for any store
const UE_ACTOR = 'memo23~uber-eats-scraper';
const MAX_PLACES = 12; // the same strongest-pull places that get estimates
const PLACES_ACTOR = 'compass~crawler-google-places';
const PHOTOS_PER_PLACE = 40;

interface Target {
  key: string;
  name: string;
  dd?: string; // DoorDash store page
  ue?: string; // Uber Eats store page
  maps?: string; // Google Maps page (for menu photos)
  lat?: number; // where the place really is, to reject a same-name store elsewhere
  lng?: number;
}
const MAX_STORE_M = 300;
const metersBetween = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dy = (a.lat - b.lat) * 110540;
  const dx = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dx, dy);
};
/** A store page's location matches the place (unknown location: trust the name check). */
const sameSpot = (t: Target, lat: unknown, lng: unknown) => {
  const la = Number(lat), lo = Number(lng);
  if (t.lat === undefined || t.lng === undefined || !Number.isFinite(la) || !Number.isFinite(lo) || (la === 0 && lo === 0)) return true;
  return metersBetween({ lat: t.lat, lng: t.lng }, { lat: la, lng: lo }) <= MAX_STORE_M;
};
interface State {
  targets: Target[];
  menus: { key: string; url: string; items: { name: string; price: number }[] }[]; // waiting to be matched
  photos?: { key: string; urls: string[] }[]; // waiting to be read
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
        const lat0 = place.location?.lat ?? 0;
        const lng0 = place.location?.lng ?? 0;
        const mPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
        const rivals = [...tx.db.rival.buildId.filter(buildId)]
          .map(r => ({ r, w: pull(r) }))
          .sort((a, b2) => b2.w - a.w)
          .slice(0, MAX_PLACES)
          .map(({ r }) => ({
            key: r.key,
            name: r.name,
            maps: [...tx.db.rivalInfo.buildId.filter(buildId)].find(i => i.rivalKey === r.key)?.mapsUrl || undefined,
            lat: place.location ? lat0 + r.y / 110540 : undefined,
            lng: place.location ? lng0 + r.x / mPerLng : undefined,
          }));
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
      const ddRunId = dd.length ? startRun(ctx, token, DD_ACTOR, { startUrls: dd, maxResults: dd.length }) : '';
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
        const stores = datasetItems(ctx, token, dd.datasetId, 'url,latitude,longitude,menu', 50);
        for (const t of state.targets.filter(x => x.dd)) {
          const id = ddKey(t.dd!);
          const store = stores.find(st => typeof st.url === 'string' && ddKey(st.url) === id);
          if (!store || !sameSpot(t, store.latitude, store.longitude)) continue;
          const items = (store.menu ?? [])
            .flatMap((sec: any) => sec?.items ?? [])
            .map((m: any) => ({ name: String(m?.name ?? ''), dollars: Number(m?.price) }))
            .filter((m: any) => m.name && m.dollars > 0)
            .map((m: any) => ({ name: m.name, price: Math.round(m.dollars * DELIVERY_MARKDOWN * 100) / 100 }));
          add(t.key, t.dd!, items);
        }
      }
      if (ue?.status === 'SUCCEEDED') {
        const stores = datasetItems(ctx, token, ue.datasetId, 'url,originalUrl,restaurantUrl,canonicalUrl,latitude,longitude,menuItems', 200);
        for (const t of state.targets.filter(x => x.ue)) {
          const id = ueKey(t.ue!);
          const store = stores.find(s => [s.url, s.originalUrl, s.restaurantUrl, s.canonicalUrl].some(u => typeof u === 'string' && ueKey(u) === id));
          if (!store || !sameSpot(t, store.latitude, store.longitude)) continue;
          const items = (store?.menuItems ?? [])
            .map((m: any) => ({ name: String(m.name ?? ''), dollars: Number(m.price) }))
            .filter((m: any) => m.name && m.dollars > 0)
            .map((m: any) => ({ name: m.name, price: Math.round(m.dollars * DELIVERY_MARKDOWN * 100) / 100 }));
          add(t.key, t.ue!, items);
        }
      }
      (state as any).sizes = state.targets.map(t => `${t.name}: ${byPlace.get(t.key)?.items.length ?? 0} items`);
      state.menus = [...byPlace].map(([key, v]) => ({ key, url: v.url, items: v.items.slice(0, 400) }));
      // Neither app has it (and Mana hasn't read it in-store): try the menu photos on Google Maps.
      const inStore = ctx.withTx(tx => new Set([...tx.db.rivalPrice.buildId.filter(buildId)].filter(r => r.source === 'menu').map(r => r.rivalKey)));
      const noMenu = state.targets.filter(t => !byPlace.has(t.key) && !inStore.has(t.key) && t.maps);
      if (noMenu.length) {
        const runId = startRun(ctx, token, PLACES_ACTOR, {
          startUrls: noMenu.map(t => ({ url: t.maps })),
          maxImages: PHOTOS_PER_PLACE,
          maxReviews: 0,
          language: 'en',
        });
        set({
          status: 'photos',
          searchRunId: runId,
          stateJson: JSON.stringify(state),
          detail: `${state.menus.length} delivery menus found; reading Google Maps menu photos for ${noMenu.length} more places`,
        });
        return later(15);
      }
      if (!state.menus.length) return set({ status: 'done', stateJson: JSON.stringify(state), detail: 'No menus found online for nearby places' });
      set({ status: 'matching', stateJson: JSON.stringify(state), detail: `Matching ${state.menus.length} delivery menus to ours` });
      return later(1);
    }

    if (scan.status === 'photos') {
      const run = runStatus(ctx, token, scan.searchRunId);
      if (stillRunning(run.status)) return later(15);
      state.photos = [];
      if (run.status === 'SUCCEEDED') {
        const places = datasetItems(ctx, token, run.datasetId, 'placeId,imageUrls,images', 50);
        for (const p of places) {
          const key = `r_${String(p.placeId ?? '').slice(-10)}`;
          if (!state.targets.some(t => t.key === key)) continue;
          const urls: string[] = [...(p.imageUrls ?? []), ...(p.images ?? []).map((i: any) => i?.imageUrl)].filter(
            (u: unknown, i: number, all: unknown[]) => typeof u === 'string' && all.indexOf(u) === i
          );
          if (urls.length) state.photos.push({ key, urls: urls.slice(0, PHOTOS_PER_PLACE) });
        }
      }
      if (!state.menus.length && !state.photos.length) return set({ status: 'done', stateJson: JSON.stringify(state), detail: 'No menus found online for nearby places' });
      set({
        status: 'matching',
        stateJson: JSON.stringify(state),
        detail: `Matching ${state.menus.length} delivery menus and reading photos of ${state.photos.length} places`,
      });
      return later(1);
    }

    if (scan.status === 'matching') {
      const next = state.menus.shift();
      const readInStore = (key: string) =>
        ctx.withTx(tx => [...tx.db.rivalPrice.buildId.filter(buildId)].some(r => r.rivalKey === key && r.source === 'menu'));
      const nameOf = (key: string) => state.targets.find(t => t.key === key)?.name ?? key;
      if (next) {
        // A place Mana's browser read in-store keeps that (better) reading.
        const res = readInStore(next.key) ? 'kept the in-store menu' : setRivalMenu(ctx, buildId, next.key, next.items, next.url, 'delivery');
        state.matched.push(`${nameOf(next.key)}: ${res}`);
      } else {
        const ph = state.photos?.shift();
        if (ph) {
          const res = readInStore(ph.key) ? 'kept the in-store menu' : `photos: ${readRivalPhotos(ctx, buildId, ph.key, ph.urls)}`;
          state.matched.push(`${nameOf(ph.key)}: ${res}`);
        }
      }
      if (state.menus.length || state.photos?.length) {
        set({ stateJson: JSON.stringify(state), detail: `Matched ${state.matched.length} menus; ${state.menus.length + (state.photos?.length ?? 0)} to go` });
        return later(1);
      }
      const fromPhotos = state.matched.filter(m => m.includes('photos: ok')).length;
      const fromApps = state.matched.filter(m => m.includes(': ok') && !m.includes('photos: ok')).length;
      const inStoreCount = ctx.withTx(tx => new Set([...tx.db.rivalPrice.buildId.filter(buildId)].filter(r => r.source === 'menu').map(r => r.rivalKey)).size);
      // Places without a real menu (none found, or the old delivery prices were cleared) get estimates.
      ctx.withTx(tx =>
        tx.db.rivalPriceJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch), buildId })
      );
      return set({
        status: 'done',
        stateJson: JSON.stringify(state),
        detail: `${inStoreCount + fromApps + fromPhotos} of ${state.targets.length} nearby places priced from real menus: ${inStoreCount} read in-store by Mana, ${fromApps} from DoorDash / Uber Eats (prices cut ${Math.round((1 - DELIVERY_MARKDOWN) * 100)}%), ${fromPhotos} from Google Maps menu photos; the rest estimated`,
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

/** Debug (admin): what the last scan's DoorDash and Uber Eats runs returned. */
export function inspectDelivery(ctx: ProcCtx, buildId: bigint): string {
  const scan = ctx.withTx(tx => tx.db.deliveryScan.buildId.find(buildId));
  if (!scan) return JSON.stringify({ error: 'no scan' });
  const token = ctx.env.APIFY_TOKEN!;
  const out: any = { status: scan.status };
  const state: State = scan.stateJson ? JSON.parse(scan.stateJson) : { targets: [], menus: [], matched: [] };
  out.ddInput = state.targets.filter(t => t.dd).map(t => t.dd);
  for (const [name, id] of [['dd', scan.ddRunId], ['ue', scan.ueRunId]] as const) {
    if (!id) continue;
    const run = runStatus(ctx, token, id);
    const rows = run.datasetId ? datasetItems(ctx, token, run.datasetId, '', 5) : [];
    out[name] = {
      status: run.status,
      rows: rows.length,
      sample: rows.slice(0, 3).map(r => {
        const flat: any = {};
        for (const [k, v] of Object.entries(r ?? {})) flat[k] = typeof v === 'object' ? JSON.stringify(v).slice(0, 160) : String(v).slice(0, 160);
        return flat;
      }),
    };
  }
  return JSON.stringify(out);
}
