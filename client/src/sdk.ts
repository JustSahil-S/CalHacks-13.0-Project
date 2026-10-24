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
import { IsoScene } from './scene';

export const DEFAULT_RADIUS_M = 2414; // 1.5 miles
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
  menu(universeId: bigint): { key: string; name: string; category: string; priceCents: number }[];
  rivals(buildId: bigint): { key: string; name: string; x: number; y: number; distanceM: number; rating: number; priceIndex: number; weight: number }[];
  experiments(rootUniverseId: bigint): { id: bigint; label: string; status: string; copies: number; days: number; radiusM: number }[];
  results(experimentId: bigint): ExperimentSummary | null;
  /** Daily revenue per copy per option (for band charts). Needs watchExperiment(). */
  dailyRevenue(experimentId: bigint): Map<string, number[][]>;
  /** Rivals that gained customers vs no change, per day of real traffic. Needs watchExperiment(). */
  gainers(experimentId: bigint): { name: string; perDay: number }[];
  watchExperiment(experimentId: bigint): Promise<void>;
  runExperiment(a: { rootUniverseId: bigint; label: string; prices: Record<string, number>; radiusM?: number; copies?: number; days?: number }): Promise<void>;
}

export interface CafeSummary {
  buildId: bigint;
  universeId: bigint;
  name: string;
  address: string;
  rating: number | null;
  reviewsCount: number | null;
  backtestCutoff: string; // '' for a current café
  menuSource: string; // website | menu photo | estimated | provided
  mapReady: boolean;
}

export interface ExperimentSummary {
  label: string;
  status: string;
  copies: number;
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
          const fork = makeFork(conn, identity.toHexString());
          fork
            .subscribe('base', [
              'SELECT * FROM twin_build',
              'SELECT * FROM area_map',
              'SELECT * FROM universe',
              'SELECT * FROM experiment',
              'SELECT * FROM experiment_result',
              'SELECT * FROM experiment_radius',
              'SELECT * FROM cafe',
              'SELECT * FROM menu_item',
              'SELECT * FROM menu_source',
              'SELECT * FROM rival',
            ])
            .then(() => resolve(fork));
        })
        .onConnectError((_ctx, err) => (tok ? attempt(undefined) : reject(err)))
        .build();
    attempt(token);
  });
}

function makeFork(conn: DbConnection, identity: string): Fork {
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
  const universes = (expId: bigint) => [...conn.db.universe.iter()].filter(u => u.experimentId === expId);

  const fork: Fork = {
    conn,
    identity,
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    subscribe(slot, queries) {
      slots.get(slot)?.unsubscribe();
      slots.delete(slot);
      if (!queries.length) return Promise.resolve();
      return new Promise(res => {
        slots.set(slot, conn.subscriptionBuilder().onApplied(() => (changed(), res())).subscribe(queries));
      });
    },
    cafes() {
      return [...conn.db.twinBuild.iter()]
        .filter(b => b.status === 'done' && b.universeId !== 0n)
        .map(b => {
          const place = b.placeJson ? JSON.parse(b.placeJson) : {};
          return {
            buildId: b.id,
            universeId: b.universeId,
            name: conn.db.cafe.universeId.find(b.universeId)?.name ?? place.title ?? b.query,
            address: place.address ?? '',
            rating: place.totalScore ?? null,
            reviewsCount: place.reviewsCount ?? null,
            backtestCutoff: b.cutoffDate === 'scan' ? '' : b.cutoffDate,
            menuSource: conn.db.menuSource.buildId.find(b.id)?.source ?? 'provided',
            mapReady: conn.db.areaMap.buildId.find(b.id)?.status === 'ready',
          };
        });
    },
    menu(universeId) {
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
        }));
    },
    results(expId) {
      const e = conn.db.experiment.id.find(expId);
      if (!e) return null;
      const rs = [...conn.db.experimentResult.iter()].filter(r => r.experimentId === expId);
      const ctl = rs.find(r => r.optionLabel === 'no change') ?? rs[0];
      const chg = rs.find(r => r !== ctl);
      return {
        label: e.label,
        status: e.status,
        copies: e.copies,
        profitWins: chg?.profitWins ?? 0,
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
    gainers(expId) {
      const e = conn.db.experiment.id.find(expId);
      const unis = universes(expId);
      if (!e || !unis.length) return [];
      const build = conn.db.universeBuild.universeId.find(e.baseUniverseId)?.buildId;
      const names = new Map([...conn.db.rival.iter()].filter(r => r.buildId === build).map(r => [r.key, r.name]));
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
      const chg = totals.get('price change') ?? new Map();
      return [...chg]
        .map(([k, v]) => ({ name: names.get(k) ?? k, perDay: perDay(v, 'price change') - perDay(ctl.get(k) ?? 0, 'no change') }))
        .filter(g => g.perDay >= 0.5)
        .sort((a, b) => b.perDay - a.perDay);
    },
    watchExperiment(expId) {
      return fork.subscribe(
        `exp:${expId}`,
        universes(expId).flatMap(u => [`SELECT * FROM daily_metric WHERE universe_id = ${u.id}`, `SELECT * FROM rival_tally WHERE universe_id = ${u.id}`])
      );
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
  shareHere: number;
  mood: number;
  usualOrder: string[];
  memories: { day: number | null; text: string }[]; // day null = from a real Google review
  reviews: { day: number; stars: number; text: string }[];
}

/** The live isometric neighborhood with walking customers, as one component. */
export class ForkMap {
  private scene: IsoScene;
  private hood: Neighborhood | null = null;
  private crowd: Crowd | null = null;
  private buildId: bigint | null = null;
  private root: bigint | null = null;
  private universeId: bigint | null = null;
  private dayFloat = 0;
  private selected: number | null = null;
  private dirty = true;
  playing = false;
  speed = 1;
  radiusM = DEFAULT_RADIUS_M;
  onDay: (info: DayInfo) => void = () => {};
  onPick: (customer: CustomerInfo | null) => void = () => {};

  constructor(container: HTMLElement, private fork: Fork) {
    injectPinStyles();
    this.scene = new IsoScene(container);
    this.scene.onFrame = dt => this.tick(dt);
    this.scene.onPick = i => {
      this.selected = i;
      this.onPick(i === null ? null : this.customer(i));
    };
    fork.onChange(() => (this.dirty = true));
  }

  /** Load a café's neighborhood, customers and rivals. */
  async showCafe(buildId: bigint) {
    const conn = this.fork.conn;
    const b = conn.db.twinBuild.id.find(buildId);
    const area = conn.db.areaMap.buildId.find(buildId);
    if (!b || !area || area.status !== 'ready') throw new Error('This café has no neighborhood map yet.');
    this.buildId = buildId;
    this.root = b.universeId;
    this.universeId = null;
    const map: AreaMap = JSON.parse(area.mapJson);
    this.hood = new Neighborhood(map);
    this.scene.setMap(map);
    this.crowd = new Crowd(this.scene, this.hood);
    await this.fork.subscribe('map-root', [`SELECT * FROM agent WHERE universe_id = ${this.root}`]);
    this.crowd.setAgents([...conn.db.agent.iter()].filter(a => a.universeId === this.root).map(a => a.key));
    this.setRadius(this.radiusM);
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
  async showExperiment(experimentId: bigint, option = 'price change') {
    const u = [...this.fork.conn.db.universe.iter()].find(
      x => x.experimentId === experimentId && x.optionLabel === option && x.copyNumber === 1
    );
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
.pin{position:fixed;pointer-events:none;transform:translate(-50%,-100%);font:600 11px ui-monospace,'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:4px;color:#fff;white-space:nowrap;z-index:3}
.pin.cafe{background:#d9472b}.pin.rival{background:#1f6f6b}.pin span{opacity:.8;font-weight:400;margin-left:6px}`;
  document.head.appendChild(s);
}
