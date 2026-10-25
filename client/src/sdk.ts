// Fork SDK: everything an app needs to embed Fork, as one ES module (three.js and the
// SpacetimeDB client are bundled in). Built to mana/sdk/fork-sdk.js and loaded by the Mana app:
//
//   const { connectFork, ForkMap } = await import('https://cdn.jsdelivr.net/gh/JustSahil-S/CalHacks-13.0-Project@main/mana/sdk/fork-sdk.js');
//   const fork = await connectFork();
//   const map = new ForkMap(document.getElementById('map'), fork);
//   await map.showCafe(fork.cafes()[0].buildId);
//
// Reads come straight from the live local cache (subscriptions keep it current); writes are
// reducer calls. Prices are in cents, distances in meters.
import { DbConnection, type SubscriptionHandle } from './module_bindings';
import { Neighborhood, type AreaMap } from './geo';
import { Crowd, type Tally } from './people';
import { TileScene } from './tilescene';

export const DEFAULT_RADIUS_M = 2414; // 1.5 miles
export const SWEEP_PREFIX = 'Sweep · '; // price searches are labeled "Sweep · Latte · 1.5 mi"
export const MAX_RADIUS_M = 11265; // 7 miles
const SECONDS_PER_DAY = 5;

// ---- Connection + data ----------------------------------------------------------------

export interface Fork {
  conn: DbConnection;
  identity: string;
  /** Run `cb` whenever subscribed data changes (debounced to one call per frame). */
  onChange(cb: () => void): () => void;
  /** Replace the subscription in a named slot with these SQL queries. Resolves when applied. */
  subscribe(slot: string, queries: string[]): Promise<void>;
  cafes(): CafeSummary[];
  /** Opening hours of a café (loads on first call; null until then, onChange fires when ready). */
  hours(universeId: bigint): { open: number; close: number } | null;
  /** Ask the engine to build a twin of a café (Google Maps link or "name, street, city").
   *  Resolves with the build id; follow it with builds(). Rejects with a readable limit message. */
  addCafe(query: string): Promise<bigint | null>;
  /** Where a café's menu came from (loads on first call; null until then). */
  menuSourceOf(buildId: bigint): { source: string; url: string; detail: string } | null;
  /** The café's Google Maps record: website, Maps link, address, phone-free. One request. */
  placeOf(buildId: bigint): Promise<{ title: string; address: string; website: string; mapsUrl: string; lat: number; lng: number } | null>;
  /** Builds that aren't ready yet (or failed), newest first, with live progress. */
  builds(): BuildProgress[];
  menu(universeId: bigint): { key: string; name: string; category: string; priceCents: number }[];
  rivals(buildId: bigint): { key: string; name: string; x: number; y: number; distanceM: number; rating: number; priceIndex: number; weight: number }[];
  experiments(rootUniverseId: bigint): { id: bigint; label: string; status: string; copies: number; days: number; radiusM: number; kind: 'single' | 'sweep' }[];
  results(experimentId: bigint): ExperimentSummary | null;
  /** Daily revenue per copy per option (for band charts). Needs watchExperiment(). */
  dailyRevenue(experimentId: bigint): Map<string, number[][]>;
  /** Rivals that gained customers vs no change, per day of real traffic. Needs watchExperiment(). For a price search, pass the option label. */
  gainers(experimentId: bigint, option?: string): { name: string; perDay: number }[];
  watchExperiment(experimentId: bigint): Promise<void>;
  runExperiment(a: { rootUniverseId: bigint; label: string; prices: Record<string, number>; radiusM?: number; copies?: number; days?: number }): Promise<void>;
  /** Prices worth trying for an item that costs `currentCents` (rounded to 25¢, current price excluded). */
  sweepPrices(currentCents: number): number[];
  /**
   * "Find my best price": one run that forks no change plus every price in `pricesCents` x `copies`
   * paired futures (same luck at every price). Runs on the customer model without Claude, so it
   * takes seconds. Then call watchExperiment and read sweep().
   */
  runSweep(a: { rootUniverseId: bigint; itemKey: string; pricesCents: number[]; copies?: number; days?: number; radiusM?: number }): Promise<void>;
  /** The live price curve of a price search (fills in while it runs). Needs watchExperiment(). */
  sweep(experimentId: bigint): SweepResult | null;
}

export interface BuildProgress {
  buildId: bigint;
  query: string;
  name: string;
  status: string; // queued | place | scraping | profiling | assembling | done | failed
  detail: string; // a readable line, e.g. "Claude read 3 of 5 review batches"
  progress: number; // 0..1, rough
  mine: boolean; // started from this browser
  ready: boolean; // done and its map is ready: it now appears in cafes()
}

export interface SweepPoint {
  option: string; // the option label ('no change' for the current price)
  priceCents: number;
  isCurrent: boolean;
  profitPerMonth: number; // mean paired change vs keeping the current price, $ per 30 days
  low: number; // worst and best of the paired futures, $ per 30 days
  high: number;
  wins: number; // futures where profit beat the current price
  visitsPct: number; // visits vs current price, %
  priceMentionShare: number; // share of new reviews that mention price
}

export interface SweepResult {
  experimentId: bigint;
  label: string;
  status: string; // running | done
  itemKey: string;
  itemName: string;
  currentCents: number;
  days: number;
  daysDone: number; // days every future has reached (the curve so far)
  copies: number;
  worlds: number; // futures forked in the one transaction
  points: SweepPoint[]; // by price, current price included
  best: SweepPoint | null;
  bestRange: [number, number] | null; // the best price across 400 resamples of the futures (5%-95%), cents
}

export interface CafeSummary {
  buildId: bigint;
  universeId: bigint;
  name: string;
  address: string;
  rating: number | null;
  reviewsCount: number | null;
  backtestCutoff: string; // '' for a current café
  menuSource: string; // website | menu photo | estimated | provided | read by Mana
  mapReady: boolean;
  customers: number; // simulated customers
  reviewers: number; // real Google reviewers they were built from
}

export interface ExperimentSummary {
  label: string;
  status: string;
  copies: number;
  /** The option these numbers describe: 'price change' for a single run; for a price search its best
   *  price ('latte=725'), or 'no change' when keeping today's price is best. '' until results are in. */
  option: string;
  profitWins: number;
  visitsChangePct: number;
  starsChange: number;
  priceMentionShare: number;
  /** Mean change vs no change, in dollars per 30 days (positive = the price change earns more). */
  profitChangePerMonth: number;
  revenueChangePerMonth: number;
  /** Mean profit per 30 days with no change, for scale. */
  baselineProfitPerMonth: number;
}

export const pull = (r: { distanceM: number; rating: number; priceIndex: number }) =>
  Math.pow(Math.max(1, r.rating) / 4.5, 3) * Math.exp(-r.distanceM / 1200) * (r.priceIndex < 0.95 ? 1.15 : r.priceIndex > 1.05 ? 0.85 : 1);

export function connectFork(opts: { host?: string; db?: string } = {}): Promise<Fork> {
  const host = opts.host ?? 'wss://maincloud.spacetimedb.com';
  const db = opts.db ?? 'fork-calhacks';
  const tokenKey = `fork-sdk-token:${host}/${db}`;
  let token: string | undefined;
  try {
    token = localStorage.getItem(tokenKey) ?? undefined;
  } catch {
    /* sandboxed frame: fresh identity each load */
  }
  return new Promise((resolve, reject) => {
    const attempt = (tok: string | undefined) =>
      DbConnection.builder()
        .withUri(host)
        .withDatabaseName(db)
        .withToken(tok)
        .onConnect((conn, identity, newToken) => {
          try {
            localStorage.setItem(tokenKey, newToken);
          } catch {
            /* ignore */
          }
          const fork = makeFork(conn, identity.toHexString(), host.replace(/^ws/, 'http'), db);
          fork
            // Light tables only; menus, hours and maps load per café when asked for.
            .subscribe('base', [
              'SELECT * FROM build_card',
              'SELECT * FROM build_owner',
              'SELECT * FROM universe',
              'SELECT * FROM experiment',
              'SELECT * FROM experiment_result',
              'SELECT * FROM experiment_radius',
              'SELECT * FROM rival',
            ])
            .then(() => resolve(fork));
        })
        .onConnectError((_ctx, err) => (tok ? attempt(undefined) : reject(err)))
        .build();
    attempt(token);
  });
}

function makeFork(conn: DbConnection, identity: string, httpHost: string, dbName: string): Fork {
  const listeners = new Set<() => void>();
  let queued = false;
  const changed = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      for (const l of listeners) l();
    });
  };
  for (const t of Object.values(conn.db) as any[]) {
    t?.onInsert?.(changed);
    t?.onUpdate?.(changed);
    t?.onDelete?.(changed);
  }
  const slots = new Map<string, SubscriptionHandle>();
  const pending = new Map<string, () => void>();
  const loaded = new Set<string>();
  // Subscribe once per slot, in the background; onChange fires when the rows arrive.
  const lazy = (slot: string, queries: string[]) => {
    if (loaded.has(slot)) return;
    loaded.add(slot);
    fork.subscribe(slot, queries).catch(() => loaded.delete(slot));
  };
  const norm = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const universes = (expId: bigint) => [...conn.db.universe.iter()].filter(u => u.experimentId === expId);
  const isSweep = (label: string) => label.startsWith(SWEEP_PREFIX);

  const fork: Fork = {
    conn,
    identity,
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    subscribe(slot, queries) {
      // A newer subscription in the same slot replaces this one; settle the old promise so
      // nothing awaiting it hangs (fast café switches, React mounting twice).
      pending.get(slot)?.();
      pending.delete(slot);
      slots.get(slot)?.unsubscribe();
      slots.delete(slot);
      if (!queries.length) return Promise.resolve();
      return new Promise((res, rej) => {
        const settle = () => {
          if (pending.get(slot) === settle) pending.delete(slot);
          res();
        };
        pending.set(slot, settle);
        slots.set(
          slot,
          conn
            .subscriptionBuilder()
            .onApplied(() => (changed(), settle()))
            .onError(ctx => {
              if (pending.get(slot) === settle) pending.delete(slot);
              rej(new Error(`Live data failed to load: ${(ctx as any)?.event?.message ?? 'subscription error'}`));
            })
            .subscribe(queries)
        );
      });
    },
    cafes() {
      return [...conn.db.buildCard.iter()]
        // A café with a twin stays usable while a new menu is being applied (or if that fails).
        .filter(c => c.universeId !== 0n && c.cutoffDate !== 'scan')
        .map(c => {
          const m = /(\d+) customers from (\d+)/.exec(c.detail);
          return {
            buildId: c.buildId,
            universeId: c.universeId,
            name: c.name,
            address: c.address,
            rating: c.rating || null,
            reviewsCount: c.reviewsCount || null,
            backtestCutoff: c.cutoffDate,
            menuSource: c.menuSource || 'provided',
            mapReady: c.mapReady,
            customers: m ? Number(m[1]) : 200,
            reviewers: m ? Number(m[2]) : 0,
          };
        });
    },
    hours(universeId) {
      lazy(`cafe:${universeId}`, [`SELECT * FROM cafe WHERE universe_id = ${universeId}`]);
      const c = conn.db.cafe.universeId.find(universeId);
      return c ? { open: c.openHour, close: c.closeHour } : null;
    },
    menuSourceOf(buildId) {
      lazy(`menu-source:${buildId}`, [`SELECT * FROM menu_source WHERE build_id = ${buildId}`]);
      const m = conn.db.menuSource.buildId.find(buildId);
      return m ? { source: m.source, url: m.url, detail: m.detail } : null;
    },
    async placeOf(buildId) {
      const res = await fetch(`${httpHost}/v1/database/${dbName}/sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `SELECT place_json FROM twin_build WHERE id = ${BigInt(buildId)}`,
      });
      if (!res.ok) return null;
      const raw = (await res.json())?.[0]?.rows?.[0]?.[0];
      if (!raw) return null;
      const p = JSON.parse(raw);
      return { title: p.title ?? '', address: p.address ?? '', website: p.website ?? '', mapsUrl: p.url ?? '', lat: p.location?.lat ?? 0, lng: p.location?.lng ?? 0 };
    },
    async addCafe(query) {
      await conn.reducers.addCafe({ query });
      const want = norm(query);
      const mine = [...conn.db.buildCard.iter()].filter(c => norm(c.query) === want && c.status !== 'failed');
      return mine.sort((a, b) => Number(b.buildId - a.buildId))[0]?.buildId ?? null;
    },
    builds() {
      const me = new Set([...conn.db.buildOwner.iter()].filter(o => o.identity.toHexString() === identity).map(o => o.buildId));
      const step: Record<string, number> = { queued: 0.03, place: 0.1, scraping: 0.25, profiling: 0.45, assembling: 0.9, done: 1, failed: 0 };
      return [...conn.db.buildCard.iter()]
        .filter(c => c.cutoffDate === '' && (c.status !== 'done' || me.has(c.buildId)))
        .map(c => ({
          buildId: c.buildId,
          query: c.query,
          name: c.name,
          status: c.status,
          detail: c.detail,
          progress:
            c.status === 'profiling' && c.batchesTotal
              ? 0.45 + 0.4 * (c.batchesDone / c.batchesTotal)
              : c.status === 'done' && !c.mapReady
                ? 0.95
                : step[c.status] ?? 0.05,
          mine: me.has(c.buildId),
          ready: c.status === 'done' && c.mapReady,
        }))
        .sort((a, b) => Number(b.buildId - a.buildId));
    },
    menu(universeId) {
      lazy(`menu:${universeId}`, [`SELECT * FROM menu_item WHERE universe_id = ${universeId}`]);
      return [...conn.db.menuItem.iter()]
        .filter(m => m.universeId === universeId)
        .map(m => ({ key: m.key, name: m.name, category: m.category, priceCents: m.priceCents }));
    },
    rivals(buildId) {
      return [...conn.db.rival.iter()]
        .filter(r => r.buildId === buildId)
        .map(r => ({ key: r.key, name: r.name, x: r.x, y: r.y, distanceM: r.distanceM, rating: r.rating, priceIndex: r.priceIndex, weight: pull(r) }))
        .sort((a, b) => a.distanceM - b.distanceM);
    },
    experiments(root) {
      return [...conn.db.experiment.iter()]
        .filter(e => e.baseUniverseId === root)
        .sort((a, b) => Number(b.id - a.id))
        .map(e => ({
          id: e.id,
          label: e.label,
          status: e.status,
          copies: e.copies,
          days: e.days,
          radiusM: conn.db.experimentRadius.experimentId.find(e.id)?.radiusM ?? DEFAULT_RADIUS_M,
          kind: isSweep(e.label) ? ('sweep' as const) : ('single' as const),
        }));
    },
    results(expId) {
      const e = conn.db.experiment.id.find(expId);
      if (!e) return null;
      const rs = [...conn.db.experimentResult.iter()].filter(r => r.experimentId === expId);
      const ctl = rs.find(r => r.optionLabel === 'no change') ?? rs[0];
      const others = rs.filter(r => r !== ctl);
      // A single run's headline is its one change. A price search's is its most profitable price,
      // or no change at all when none beat today's (then every change below is 0).
      const top = others.reduce<(typeof rs)[number] | undefined>((b, r) => (!b || r.meanProfitCents > b.meanProfitCents ? r : b), undefined);
      const chg = isSweep(e.label) ? (top && ctl && top.meanProfitCents > ctl.meanProfitCents ? top : ctl) : others[0];
      return {
        label: e.label,
        status: e.status,
        copies: e.copies,
        option: chg?.optionLabel ?? '',
        profitWins: chg && chg !== ctl ? chg.profitWins : 0,
        visitsChangePct: chg && ctl ? (chg.meanVisits / (ctl.meanVisits || 1) - 1) * 100 : 0,
        starsChange: chg && ctl ? chg.meanStars - ctl.meanStars : 0,
        priceMentionShare: chg?.priceMentionShare ?? 0,
        profitChangePerMonth: chg && ctl ? (Number(chg.meanProfitCents - ctl.meanProfitCents) / 100 / e.days) * 30 : 0,
        revenueChangePerMonth: chg && ctl ? (Number(chg.meanRevenueCents - ctl.meanRevenueCents) / 100 / e.days) * 30 : 0,
        baselineProfitPerMonth: ctl ? (Number(ctl.meanProfitCents) / 100 / e.days) * 30 : 0,
      };
    },
    dailyRevenue(expId) {
      const out = new Map<string, number[][]>();
      const metrics = [...conn.db.dailyMetric.iter()];
      for (const u of universes(expId)) {
        const series = metrics.filter(m => m.universeId === u.id).sort((a, b) => a.tick - b.tick).map(m => Number(m.revenueCents) / 100);
        if (!series.length) continue;
        if (!out.has(u.optionLabel)) out.set(u.optionLabel, []);
        out.get(u.optionLabel)!.push(series);
      }
      return out;
    },
    gainers(expId, option) {
      const e = conn.db.experiment.id.find(expId);
      const unis = universes(expId);
      if (!e || !unis.length) return [];
      // Rival keys come from Google place ids, so a key names the same place in every build
      // (also after a café is rebuilt with a new menu).
      const names = new Map([...conn.db.rival.iter()].map(r => [r.key, r.name]));
      const scale = conn.db.cafe.universeId.find(e.baseUniverseId)?.customerScale ?? 4;
      const totals = new Map<string, Map<string, number>>();
      const copies = new Map<string, number>();
      for (const u of unis) {
        copies.set(u.optionLabel, (copies.get(u.optionLabel) ?? 0) + 1);
        const m = totals.get(u.optionLabel) ?? new Map<string, number>();
        for (const t of conn.db.rivalTally.iter()) if (t.universeId === u.id) m.set(t.rivalKey, (m.get(t.rivalKey) ?? 0) + t.visits);
        totals.set(u.optionLabel, m);
      }
      const perDay = (n: number, label: string) => (n / (copies.get(label) || 1) / Math.max(1, e.days)) * scale;
      const ctl = totals.get('no change') ?? new Map();
      const chg = totals.get(option ?? 'price change') ?? new Map();
      return [...chg]
        .map(([k, v]) => ({ name: names.get(k) ?? k, perDay: perDay(v, option ?? 'price change') - perDay(ctl.get(k) ?? 0, 'no change') }))
        .filter(g => g.perDay >= 0.5)
        .sort((a, b) => b.perDay - a.perDay);
    },
    watchExperiment(expId) {
      const base = conn.db.experiment.id.find(expId)?.baseUniverseId;
      return fork.subscribe(`exp:${expId}`, [
        // The café's menu too, so a price search knows today's price on the first read.
        ...(base !== undefined ? [`SELECT * FROM menu_item WHERE universe_id = ${base}`] : []),
        ...universes(expId).flatMap(u => [`SELECT * FROM daily_metric WHERE universe_id = ${u.id}`, `SELECT * FROM rival_tally WHERE universe_id = ${u.id}`]),
      ]);
    },
    sweepPrices(current) {
      const steps = [0.9, 1.1, 1.2, 1.3, 1.45, 1.6];
      const out: number[] = [];
      for (const f of steps) {
        const p = Math.max(25, Math.round((current * f) / 25) * 25);
        if (p !== current && !out.includes(p)) out.push(p);
      }
      return out;
    },
    runSweep(a) {
      const name = fork.menu(a.rootUniverseId).find(m => m.key === a.itemKey)?.name ?? a.itemKey;
      const radiusM = a.radiusM ?? DEFAULT_RADIUS_M;
      const miles = radiusM / 1609.34;
      const prices = [...new Set(a.pricesCents)].sort((x, y) => x - y);
      if (!prices.length || prices.some(p => !Number.isInteger(p) || p < 25 || p > 100_000))
        return Promise.reject(new Error('runSweep: prices are whole cents from 25 to 100000 (e.g. 650 for $6.50)'));
      return conn.reducers.startExperimentR({
        baseUniverseId: a.rootUniverseId,
        label: `${SWEEP_PREFIX}${name} · ${miles < 1 ? miles.toFixed(2) : miles.toFixed(1)} mi`,
        optionsJson: JSON.stringify([
          { label: 'no change', prices: {} },
          ...prices.map(p => ({ label: `${a.itemKey}=${p}`, prices: { [a.itemKey]: p } })),
        ]),
        copies: a.copies ?? 8,
        days: a.days ?? 60,
        brain: 'rules', // the daily-choice customer model on its own: no Claude waits
        radiusM,
      });
    },
    sweep(expId) {
      const e = conn.db.experiment.id.find(expId);
      if (!e || !isSweep(e.label)) return null;
      const options: { label: string; prices: Record<string, number> }[] = JSON.parse(e.optionsJson);
      const itemKey = Object.keys(options.find(o => Object.keys(o.prices).length)?.prices ?? {})[0] ?? '';
      const menu = fork.menu(e.baseUniverseId);
      const item = menu.find(m => m.key === itemKey);
      const currentCents = item?.priceCents ?? 0;
      const unis = universes(expId);
      const totals = new Map<string, Map<number, { profit: number; visits: number; reviews: number; mentions: number }>>();
      const byId = new Map(unis.map(u => [u.id, { u, t: { profit: 0, visits: 0, reviews: 0, mentions: 0 } }]));
      // Compare only days every future has reached and whose numbers are loaded here (they arrive with
      // watchExperiment), so the curve stays paired while it fills in and is empty, not flat, before.
      const reached = new Map<bigint, number>();
      for (const m of conn.db.dailyMetric.iter()) {
        const x = byId.get(m.universeId);
        if (x) reached.set(m.universeId, Math.max(reached.get(m.universeId) ?? 0, m.tick - x.u.forkTick));
      }
      const daysDone = unis.length ? Math.min(...unis.map(u => reached.get(u.id) ?? 0)) : 0;
      for (const m of conn.db.dailyMetric.iter()) {
        const x = byId.get(m.universeId);
        if (!x || m.tick > x.u.forkTick + daysDone) continue;
        x.t.profit += Number(m.profitCents) / 100;
        x.t.visits += m.visits;
        x.t.reviews += m.reviews;
        x.t.mentions += m.priceMentions;
      }
      for (const { u, t } of byId.values()) {
        if (!totals.has(u.optionLabel)) totals.set(u.optionLabel, new Map());
        totals.get(u.optionLabel)!.set(u.copyNumber, t);
      }
      const ctl = totals.get('no change') ?? new Map();
      const perMonth = (x: number) => (daysDone ? (x / daysDone) * 30 : 0);
      const deltasOf = (label: string) =>
        [...(totals.get(label) ?? new Map()).entries()].filter(([k]) => ctl.has(k)).map(([k, t]) => perMonth(t.profit - ctl.get(k)!.profit));
      const sumOf = (label: string, f: 'visits' | 'reviews' | 'mentions') =>
        [...(totals.get(label) ?? new Map()).values()].reduce((s, t) => s + t[f], 0);
      const ctlVisits = sumOf('no change', 'visits');
      const points: SweepPoint[] = options.map(o => {
        const isCurrent = o.label === 'no change';
        const d = isCurrent ? [] : deltasOf(o.label);
        const mean = d.length ? d.reduce((s, x) => s + x, 0) / d.length : 0;
        const reviews = sumOf(o.label, 'reviews');
        return {
          option: o.label,
          priceCents: isCurrent ? currentCents : o.prices[itemKey],
          isCurrent,
          profitPerMonth: mean,
          low: d.length ? Math.min(...d) : 0,
          high: d.length ? Math.max(...d) : 0,
          wins: d.filter(x => x > 0).length,
          visitsPct: isCurrent || !ctlVisits ? 0 : (sumOf(o.label, 'visits') / ctlVisits - 1) * 100,
          priceMentionShare: reviews ? sumOf(o.label, 'mentions') / reviews : 0,
        };
      });
      points.sort((x, y) => x.priceCents - y.priceCents);
      const best = daysDone ? points.reduce((b, p) => (p.profitPerMonth > b.profitPerMonth ? p : b), points.find(p => p.isCurrent) ?? points[0]) : null;
      // How sure is "best"? Resample the paired futures (seeded, so it's stable) and see where the peak lands.
      let bestRange: [number, number] | null = null;
      const copies = [...ctl.keys()];
      if (daysDone && copies.length > 1) {
        let seed = Number(expId % 2147483647n) || 1;
        const rand = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
        const peaks: number[] = [];
        for (let r = 0; r < 400; r++) {
          const pick = copies.map(() => copies[Math.floor(rand() * copies.length)]);
          let top = { price: currentCents, v: 0 };
          for (const o of options) {
            if (o.label === 'no change') continue;
            const rows = totals.get(o.label);
            if (!rows) continue;
            const v = pick.reduce((s, k) => s + ((rows.get(k)?.profit ?? 0) - (ctl.get(k)?.profit ?? 0)), 0) / pick.length;
            if (v > top.v) top = { price: o.prices[itemKey], v };
          }
          peaks.push(top.price);
        }
        peaks.sort((x, y) => x - y);
        bestRange = [peaks[Math.floor(peaks.length * 0.05)], peaks[Math.floor(peaks.length * 0.95)]];
      }
      return {
        experimentId: expId,
        label: e.label,
        status: e.status,
        itemKey,
        itemName: item?.name ?? itemKey,
        currentCents,
        days: e.days,
        daysDone,
        copies: e.copies,
        worlds: unis.length,
        points,
        best,
        bestRange,
      };
    },
    runExperiment(a) {
      return conn.reducers.startExperimentR({
        baseUniverseId: a.rootUniverseId,
        label: a.label,
        optionsJson: JSON.stringify([
          { label: 'no change', prices: {} },
          { label: 'price change', prices: a.prices },
        ]),
        copies: a.copies ?? 10,
        days: a.days ?? 60,
        brain: 'ai',
        radiusM: a.radiusM ?? DEFAULT_RADIUS_M,
      });
    },
  };
  return fork;
}

// ---- The 3D map ------------------------------------------------------------------------

export interface DayInfo {
  day: number; // 1-based day of the experiment
  of: number;
  tally: Tally;
}

export interface CustomerInfo {
  key: string;
  name: string;
  type: string;
  visitsPerWeek: number;
  priceSensitivity: number;
  priceCeilingPct: number; // the largest rise on an item they'll put up with (choice.ts ceilingFor)
  shareHere: number;
  mood: number;
  usualOrder: string[];
  memories: { day: number | null; text: string }[]; // day null = from a real Google review
  reviews: { day: number; stars: number; text: string }[];
}

/** The live isometric neighborhood with walking customers, as one component. */
export class ForkMap {
  private scene: TileScene;
  private hood: Neighborhood | null = null;
  private crowd: Crowd | null = null;
  private buildId: bigint | null = null;
  private root: bigint | null = null;
  private universeId: bigint | null = null;
  private dayFloat = 0;
  private selected: number | null = null;
  private dirty = true;
  private showCall = 0;
  playing = false;
  speed = 1;
  radiusM = DEFAULT_RADIUS_M;
  onDay: (info: DayInfo) => void = () => {};
  onPick: (customer: CustomerInfo | null) => void = () => {};

  constructor(container: HTMLElement, private fork: Fork) {
    injectPinStyles();
    this.scene = new TileScene(container);
    this.scene.onFrame = dt => this.tick(dt);
    this.scene.onPick = i => {
      this.selected = i;
      this.onPick(i === null ? null : this.customer(i));
    };
    fork.onChange(() => (this.dirty = true));
  }

  /** Load a café's neighborhood, customers and rivals. */
  async showCafe(buildId: bigint) {
    const call = ++this.showCall;
    const conn = this.fork.conn;
    const card = conn.db.buildCard.buildId.find(buildId);
    if (!card || card.status !== 'done' || !card.mapReady) throw new Error('This café has no neighborhood map yet.');
    this.buildId = buildId;
    this.root = card.universeId;
    this.universeId = null;
    // Only this café's map and customers come down, not every café's.
    await Promise.all([
      this.fork.subscribe('map-area', [`SELECT * FROM area_map WHERE build_id = ${buildId}`]),
      this.fork.subscribe('map-root', [`SELECT * FROM agent WHERE universe_id = ${card.universeId}`]),
    ]);
    if (call !== this.showCall) return; // another café was picked meanwhile
    const area = conn.db.areaMap.buildId.find(buildId);
    if (!area || area.status !== 'ready') throw new Error('This café has no neighborhood map yet.');
    const map: AreaMap = JSON.parse(area.mapJson);
    this.hood = new Neighborhood(map);
    this.scene.setMap(map);
    this.crowd = new Crowd(this.scene, this.hood);
    this.crowd.setAgents([...conn.db.agent.iter()].filter(a => a.universeId === this.root).map(a => a.key));
    this.setRadius(this.radiusM);
  }

  /** Stop and remove the map (call when your app unmounts it). */
  dispose() {
    this.playing = false;
    this.scene.dispose();
  }

  /** Zoom to the café's streets ('street', people readable) or out to the whole radius ('radius'). */
  frame(mode: 'street' | 'radius') {
    this.scene.frame(mode);
  }

  /** Show competitors within this many meters (ring, pins) and zoom out to fit them. */
  setRadius(radiusM: number) {
    this.radiusM = radiusM;
    if (!this.crowd || this.buildId === null) return;
    const all = this.fork.rivals(this.buildId);
    this.crowd.setRivals(all.map(r => ({ key: r.key, x: r.x, y: r.y })));
    this.scene.setRivals(all.filter(r => r.distanceM <= radiusM), radiusM);
  }

  /** Animate copy #1 of an experiment option ('price change' or 'no change'). Frames 'street'. */
  async showExperiment(experimentId: bigint, option?: string) {
    const sweep = this.fork.sweep(experimentId);
    const label = option ?? (sweep ? this.fork.results(experimentId)?.option || sweep.best?.option : 'price change');
    const unis = [...this.fork.conn.db.universe.iter()].filter(x => x.experimentId === experimentId && x.copyNumber === 1);
    // A price search replays its best price (or its first price until results arrive).
    const u = unis.find(x => x.optionLabel === label) ?? unis.find(x => x.optionLabel !== 'no change');
    if (!u) throw new Error('That experiment has no animated copy.');
    const r = this.fork.conn.db.experimentRadius.experimentId.find(experimentId)?.radiusM;
    if (r) this.setRadius(r);
    this.frame('street'); // a replay is about the people walking, so start close in
    this.universeId = u.id;
    this.dayFloat = u.forkTick + 1;
    this.selected = null;
    await this.fork.subscribe('map-play', [
      `SELECT * FROM visit WHERE universe_id = ${u.id}`,
      `SELECT * FROM event WHERE universe_id = ${u.id}`,
      `SELECT * FROM agent WHERE universe_id = ${u.id}`,
      `SELECT * FROM memory WHERE universe_id = ${u.id}`,
      `SELECT * FROM review WHERE universe_id = ${u.id}`,
    ]);
    this.dirty = true;
  }

  play() {
    this.playing = true;
  }
  pause() {
    this.playing = false;
  }
  /** Jump to a day (1-based within the experiment). */
  seek(day: number) {
    const u = this.universe();
    if (u) this.dayFloat = u.forkTick + Math.max(1, day) + 0.001;
  }
  setSpeed(x: number) {
    this.speed = x;
  }
  rotate(dir: 1 | -1) {
    this.scene.rotate(dir);
  }

  private universe() {
    return this.universeId !== null ? this.fork.conn.db.universe.id.find(this.universeId) : undefined;
  }

  private tick(dt: number) {
    const u = this.universe();
    if (!this.crowd || !u) return;
    const first = u.forkTick + 1;
    const last = u.currentTick;
    if (last < first) return;
    if (this.playing) this.dayFloat += (dt * this.speed) / SECONDS_PER_DAY;
    if (this.dayFloat >= last + 1) this.dayFloat = this.playing ? first : last + 0.999;
    if (this.dayFloat < first) this.dayFloat = first;
    if (this.dirty) {
      this.dirty = false;
      const db = this.fork.conn.db;
      this.crowd.setVisits([...db.visit.iter()].filter(v => v.universeId === u.id));
      this.crowd.setNotices([...db.event.iter()].filter(e => e.universeId === u.id && e.kind === 'notice_price'));
    }
    const tick = Math.floor(this.dayFloat);
    const tally = this.crowd.update(tick, this.dayFloat - tick);
    const pos = this.selected !== null ? this.crowd.positions.get(this.selected) : undefined;
    this.scene.ringAt(pos ? pos[0] : null, pos ? pos[1] : 0);
    this.scene.setPinNote('cafe', `${tally.inCafe} inside`);
    this.onDay({ day: tick - first + 1, of: last - first + 1, tally });
  }

  /** Everything about one customer in the shown universe. */
  customer(index: number): CustomerInfo | null {
    const u = this.universe();
    const key = this.crowd?.keys[index];
    if (!u || !key) return null;
    const db = this.fork.conn.db;
    const a = [...db.agent.iter()].find(x => x.universeId === u.id && x.key === key);
    if (!a) return null;
    const menu = new Map([...db.menuItem.iter()].filter(m => m.universeId === u.id).map(m => [m.key, m.name]));
    return {
      key,
      name: a.name,
      type: a.archetype,
      visitsPerWeek: a.visitsPerWeek,
      priceSensitivity: a.priceSensitivity,
      priceCeilingPct: Math.round((0.15 + 0.6 * (1 - Math.min(1, Math.max(0, a.priceSensitivity)))) * 100),
      shareHere: a.pHere / (a.pHere + a.pCompetitor || 1),
      mood: a.satisfaction,
      usualOrder: (JSON.parse(a.usualOrder) as string[]).map(k => menu.get(k) ?? k),
      memories: [...db.memory.iter()]
        .filter(m => m.universeId === u.id && m.agentKey === key)
        .sort((x, y) => x.tick - y.tick)
        .map(m => ({ day: m.tick < 0 ? null : m.tick - u.forkTick, text: m.text })),
      reviews: [...db.review.iter()]
        .filter(r => r.universeId === u.id && r.agentKey === key)
        .map(r => ({ day: r.tick - u.forkTick, stars: r.stars, text: r.text })),
    };
  }
}

/** The café and rival labels are HTML; give them their look without the viewer's stylesheet. */
function injectPinStyles() {
  if (document.getElementById('fork-sdk-styles')) return;
  const s = document.createElement('style');
  s.id = 'fork-sdk-styles';
  s.textContent = `
.fork-pin{position:absolute;pointer-events:none;transform:translate(-50%,-100%);font:600 11px ui-monospace,'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:4px;color:#fff;white-space:nowrap;z-index:3}
.fork-pin.cafe{background:#d9472b}.fork-pin.rival{background:#1f6f6b}.fork-pin span{opacity:.8;font-weight:400;margin-left:6px}`;
  document.head.appendChild(s);
}
