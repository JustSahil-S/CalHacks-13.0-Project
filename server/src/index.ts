// Fork — SpacetimeDB module entry. Tables live in schema.ts, simulation logic in sim.ts,
// the AI brain's caching and prompt in brain.ts.
import { t, SenderError } from 'spacetimedb/server';
import { ScheduleAt } from 'spacetimedb';
import spacetimedb, { buildJob, clockJob, decisionJob, mapJob, profileJob, rivalJob } from './schema';
import { fetchAreaMap } from './areamap';
import { syncCard } from './cards';
import { usesClaude } from './today';
import { realMenuItems } from './menu';
import { callClaude } from './claude';
import { advanceBuild, advanceRivalScan, fixedCosts, inspectMenuCrawl, inspectMenuSearch, testMenuRead, queueProfileJobs, usableReviews, nominalRevenuePerDay, profileBatch, SCAN } from './pipeline';
import { DEFAULT_RADIUS_M, MAX_RADIUS_M } from './rivals';
import {
  applyPrices,
  loadTwin,
  maybeFinishExperiment,
  startExperiment,
  stepUniverse,
  type Ctx,
  type ExperimentOption,
  type PriceChanges,
  type TwinInput,
} from './sim';
import { buildPrompt, decisionsReady, DECISIONS_SCHEMA, normalize, type Decision } from './brain';

export default spacetimedb;

const CLOCK_MS = 100n;

/** Start the clock if it isn't running. The clock stops itself once nothing is left to run. */
function ensureClock(ctx: Ctx) {
  if ([...ctx.db.clockJob.iter()].length > 0) return;
  ctx.db.clockJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.interval(CLOCK_MS * 1000n) });
}

// ---- Access ---------------------------------------------------------------------------
// Anyone can watch and run (limited) experiments. Builds, resets and the clock are admin-only.

const isAdmin = (ctx: Ctx) => ctx.db.admin.identity.find(ctx.sender) !== null;

function requireAdmin(ctx: Ctx) {
  if (!isAdmin(ctx)) throw new SenderError('Only the Fork team can do that.');
}

const PARTNER_BUILDS_PER_HOUR = 6;

/** Admins can build twins freely; partners (the Mana app's tools) up to 6 per hour. */
function requireBuilder(ctx: Ctx) {
  if (isAdmin(ctx)) return;
  if (ctx.db.partner.identity.find(ctx.sender) === null) throw new SenderError('Only the Fork team can do that.');
  const hourAgo = ctx.timestamp.microsSinceUnixEpoch - 3_600_000_000n;
  const recent = [...ctx.db.buildOwner.iter()].filter(
    o => o.identity.isEqual(ctx.sender) && o.createdAt.microsSinceUnixEpoch > hourAgo
  ).length;
  if (recent >= PARTNER_BUILDS_PER_HOUR) throw new SenderError('Build limit reached (6 per hour). Try again later.');
}

/** Join the partner list with the secret PARTNER_KEY stored in this database's settings. */
export const claim_partner = spacetimedb.reducer({ key: t.string() }, (ctx, { key }) => {
  const want = ctx.env.PARTNER_KEY;
  if (!want || key !== want) throw new SenderError('Wrong partner key.');
  if (ctx.db.partner.identity.find(ctx.sender) === null) ctx.db.partner.insert({ identity: ctx.sender });
});

/** Join the admin list with the secret ADMIN_KEY stored in this database's settings. */
export const claim_admin = spacetimedb.reducer({ key: t.string() }, (ctx, { key }) => {
  const want = ctx.env.ADMIN_KEY;
  if (!want || key !== want) throw new SenderError('Wrong admin key.');
  if (!isAdmin(ctx)) ctx.db.admin.insert({ identity: ctx.sender });
});

function parseJson<T>(raw: string, what: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new SenderError(`${what} is not valid JSON`);
  }
}

// ---- Twins and universes ---------------------------------------------------

// Admin: rebuild every build_card row (after adding the table, or to repair it).
export const sync_cards = spacetimedb.reducer(ctx => {
  requireAdmin(ctx);
  for (const b of ctx.db.twinBuild.iter()) syncCard(ctx, b.id);
});

// Admin: re-set rent and wages on every built twin from its own revenue (see fixedCosts).
export const refit_costs = spacetimedb.reducer(ctx => {
  requireAdmin(ctx);
  for (const u of ctx.db.universe.iter()) {
    if (u.parentId !== 0n) continue;
    const c = ctx.db.cafe.universeId.find(u.id);
    if (!c) continue;
    const prices = new Map([...ctx.db.menuItem.universeId.filter(u.id)].map(m => [m.key, m.priceCents]));
    const people = [...ctx.db.agent.universeId.filter(u.id)].map(a => ({ visitsPerWeek: a.visitsPerWeek, order: JSON.parse(a.usualOrder) as string[] }));
    ctx.db.cafe.universeId.update({ ...c, ...fixedCosts(nominalRevenuePerDay(people, prices, c.customerScale)) });
  }
});

export const load_twin = spacetimedb.reducer({ twinJson: t.string() }, (ctx, { twinJson }) => {
  requireAdmin(ctx);
  const twin = parseJson<TwinInput>(twinJson, 'twinJson');
  if (!twin.cafe || !twin.menu?.length || !twin.customers?.length) {
    throw new SenderError('twin needs cafe, menu and customers');
  }
  loadTwin(ctx, twin);
});

/** Run one universe forward by `days` (e.g. a warm-up for the root twin). */
export const run_universe = spacetimedb.reducer(
  { universeId: t.u64(), days: t.u32() },
  (ctx, { universeId, days }) => {
  requireAdmin(ctx);
    const u = ctx.db.universe.id.find(universeId);
    if (!u) throw new SenderError(`no universe ${universeId}`);
    ctx.db.universe.id.update({ ...u, status: 'running', maxTick: u.currentTick + days });
    ensureClock(ctx);
  }
);

export const pause_universe = spacetimedb.reducer({ universeId: t.u64() }, (ctx, { universeId }) => {
  requireAdmin(ctx);
  const u = ctx.db.universe.id.find(universeId);
  if (!u) throw new SenderError(`no universe ${universeId}`);
  ctx.db.universe.id.update({ ...u, status: 'paused' });
});

/** Change prices in one universe right now, e.g. {"oat_latte": 600}. */
export const set_prices = spacetimedb.reducer(
  { universeId: t.u64(), pricesJson: t.string() },
  (ctx, { universeId, pricesJson }) => {
  requireAdmin(ctx);
    const u = ctx.db.universe.id.find(universeId);
    if (!u) throw new SenderError(`no universe ${universeId}`);
    applyPrices(ctx, universeId, parseJson<PriceChanges>(pricesJson, 'pricesJson'), u.currentTick);
  }
);

/**
 * Paired comparison. optionsJson: [{"label":"control","prices":{}},
 * {"label":"latte +50c","prices":{"oat_latte":600}}]. The first option is the control.
 * brain: "ai" (Claude decides noticed changes) or "rules".
 */
function launchExperiment(
  ctx: Ctx,
  a: { baseUniverseId: bigint; label: string; optionsJson: string; copies: number; days: number; brain: string },
  radiusM: number
) {
  const options = parseJson<ExperimentOption[]>(a.optionsJson, 'optionsJson');
  if (options.length < 2) throw new SenderError('need a control plus at least one option');
  if (a.copies < 1 || a.copies > 50) throw new SenderError('copies must be 1..50');
  // "ai"/"rules": daily-choice model; "ai-odds"/"rules-odds": the original odds system (for comparison).
  if (!['ai', 'rules', 'ai-odds', 'rules-odds'].includes(a.brain)) throw new SenderError('brain must be ai, rules, ai-odds or rules-odds');
  if (radiusM < 100 || radiusM > MAX_RADIUS_M) throw new SenderError('radius must be 100 m to 7 miles');
  if (!isAdmin(ctx)) {
    // Public demo limits: keep Claude spend small and the shared database responsive.
    if (a.copies > 10 || a.days > 90) throw new SenderError('Demo limit: up to 10 copies and 90 days.');
    // A price search runs several prices at once: keep it to 7 prices plus no change, 80 futures.
    if (options.length > 8 || options.length * a.copies > 80) throw new SenderError('Demo limit: up to 7 prices and 80 futures per run.');
    // Claude reads every customer who notices, separately for each price: keep those runs to 2 prices.
    if (usesClaude(a.brain) && options.length > 3) throw new SenderError('Demo limit: a Claude run tests up to 2 prices. Use Find my best price to try more.');
    if ([...ctx.db.experiment.iter()].some(e => e.status === 'running')) {
      throw new SenderError('Another simulation is running. Try again in a minute.');
    }
  }
  startExperiment(ctx, a.baseUniverseId, a.label, options, a.copies, a.days, a.brain, radiusM);
  ensureClock(ctx);
}

const experimentArgs = {
  baseUniverseId: t.u64(),
  label: t.string(),
  optionsJson: t.string(),
  copies: t.u32(),
  days: t.u32(),
  brain: t.string(),
};

/** Original signature (used by the Mana advisor): competitors within the default 1.5 miles. */
export const start_experiment = spacetimedb.reducer(experimentArgs, (ctx, a) => launchExperiment(ctx, a, DEFAULT_RADIUS_M));

/** Same, with the competitor radius in meters (the app's radius slider), up to 7 miles. */
export const start_experiment_r = spacetimedb.reducer({ ...experimentArgs, radiusM: t.u32() }, (ctx, a) =>
  launchExperiment(ctx, a, a.radiusM)
);

// ---- The clock: every fire advances every ready universe by one day ------------

export const start_clock = spacetimedb.reducer({ everyMs: t.u32() }, (ctx, { everyMs }) => {
  requireAdmin(ctx);
  for (const job of ctx.db.clockJob.iter()) ctx.db.clockJob.scheduledId.delete(job.scheduledId);
  ctx.db.clockJob.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(BigInt(Math.max(50, everyMs)) * 1000n),
  });
});

export const stop_clock = spacetimedb.reducer(ctx => {
  requireAdmin(ctx);
  for (const job of ctx.db.clockJob.iter()) ctx.db.clockJob.scheduledId.delete(job.scheduledId);
});

export const clock = spacetimedb.reducer({ onSchedule: clockJob }, { job: clockJob.rowType }, ctx => {
  const running = [...ctx.db.universe.iter()].filter(u => u.status === 'running');
  for (const u of running) {
    // AI universes wait until Claude has answered for everyone who notices a change tomorrow.
    if (usesClaude(u.brain) && !decisionsReady(ctx, u.id, u.seed, u.currentTick + 1)) continue;
    stepUniverse(ctx, u.id);
  }
  const experiments = new Set(running.map(u => u.experimentId).filter(id => id !== 0n));
  for (const id of experiments) maybeFinishExperiment(ctx, id);
  // Nothing left to run: stop ticking (run_universe / start_experiment restart it).
  if (![...ctx.db.universe.iter()].some(u => u.status === 'running')) {
    for (const j of ctx.db.clockJob.iter()) ctx.db.clockJob.scheduledId.delete(j.scheduledId);
  }
});

/** Dev helper: wipe every simulation table (keeps the decision cache unless asked). */
export const reset_all = spacetimedb.reducer(ctx => {
  requireAdmin(ctx);
  for (const r of ctx.db.universe.iter()) ctx.db.universe.id.delete(r.id);
  for (const r of ctx.db.cafe.iter()) ctx.db.cafe.universeId.delete(r.universeId);
  for (const r of ctx.db.menuItem.iter()) ctx.db.menuItem.id.delete(r.id);
  for (const r of ctx.db.competitor.iter()) ctx.db.competitor.id.delete(r.id);
  for (const r of ctx.db.agent.iter()) ctx.db.agent.id.delete(r.id);
  for (const r of ctx.db.memory.iter()) ctx.db.memory.id.delete(r.id);
  for (const r of ctx.db.review.iter()) ctx.db.review.id.delete(r.id);
  for (const r of ctx.db.dailyMetric.iter()) ctx.db.dailyMetric.id.delete(r.id);
  for (const r of ctx.db.event.iter()) ctx.db.event.id.delete(r.id);
  for (const r of ctx.db.experiment.iter()) ctx.db.experiment.id.delete(r.id);
  for (const r of ctx.db.experimentResult.iter()) ctx.db.experimentResult.id.delete(r.id);
  for (const r of ctx.db.decisionRequest.iter()) ctx.db.decisionRequest.situationKey.delete(r.situationKey);
  for (const r of ctx.db.agentChoice.iter()) ctx.db.agentChoice.agentId.delete(r.agentId);
  for (const r of ctx.db.agentDay.iter()) ctx.db.agentDay.agentId.delete(r.agentId);
  for (const r of ctx.db.choiceStart.iter()) ctx.db.choiceStart.universeId.delete(r.universeId);
});

/** Forget cached AI answers: all of them, or only the rules fallbacks (to retry Claude). */
export const clear_cache = spacetimedb.reducer({ onlyFallbacks: t.bool() }, (ctx, { onlyFallbacks }) => {
  requireAdmin(ctx);
  for (const r of ctx.db.decisionCache.iter()) {
    if (!onlyFallbacks || r.source !== 'ai') ctx.db.decisionCache.situationKey.delete(r.situationKey);
  }
});

// ---- Twin pipeline: Google Maps link -> real café twin --------------------------------

/**
 * query: a Google Maps URL or "name, city". menuJson: [{"key","name","priceCents",
 * "category"?, "unitCostCents"?}]. cutoffDate: "" for a normal twin, or "YYYY-MM-DD" to build
 * customers only from reviews before that date (backtest). label: display name ("" = Google's).
 */
export const start_twin_build = spacetimedb.reducer(
  { query: t.string(), label: t.string(), menuJson: t.string(), cutoffDate: t.string() },
  (ctx, { query, label, menuJson, cutoffDate }) => {
    requireBuilder(ctx);
    // An empty menu means "find it": read from their site/ordering page, else estimate.
    const menu = parseJson<{ key: string; name: string; priceCents: number }[]>(menuJson || '[]', 'menuJson');
    if (!Array.isArray(menu)) throw new SenderError('menuJson must be a list');
    for (const m of menu) {
      if (!m.key || !m.name || !(m.priceCents > 0)) throw new SenderError(`bad menu item ${JSON.stringify(m)}`);
    }
    if (cutoffDate && !/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate)) throw new SenderError('cutoffDate must be YYYY-MM-DD');
    queueBuild(ctx, query, label, menuJson, cutoffDate);
  }
);

// Anyone can add their café. Off while only the team has the link; set to true before sharing
// it widely, to keep scraping and Claude costs bounded.
const LIMIT_PUBLIC_BUILDS = false;
const PUBLIC_BUILDS_PER_PERSON_PER_HOUR = 2;
const PUBLIC_BUILDS_PER_HOUR = 6;
const PUBLIC_BUILDS_PER_DAY = 20;
const normQuery = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Public: build a twin of a café from a Google Maps link or "name, address, city". */
export const add_cafe = spacetimedb.reducer({ query: t.string() }, (ctx, { query }) => {
  const q = query.trim();
  if (q.length < 3 || q.length > 300) throw new SenderError('Paste a Google Maps link or the café name, street and city.');
  // Same café already built or on its way: reuse it instead of paying for it twice.
  const want = normQuery(q);
  for (const b of ctx.db.twinBuild.iter()) {
    if (b.cutoffDate === '' && b.status !== 'failed' && normQuery(b.query) === want) return;
  }
  const builder = isAdmin(ctx) || ctx.db.partner.identity.find(ctx.sender) !== null;
  if (builder) requireBuilder(ctx);
  else if (LIMIT_PUBLIC_BUILDS) {
    const now = ctx.timestamp.microsSinceUnixEpoch;
    // Failed builds don't count: they stop at the cheap Google lookup.
    const owners = [...ctx.db.buildOwner.iter()].filter(o => ctx.db.twinBuild.id.find(o.buildId)?.status !== 'failed');
    const since = (micros: bigint) => owners.filter(o => o.createdAt.microsSinceUnixEpoch > now - micros);
    const hour = since(3_600_000_000n);
    if (hour.filter(o => o.identity.isEqual(ctx.sender)).length >= PUBLIC_BUILDS_PER_PERSON_PER_HOUR)
      throw new SenderError('You can add 2 cafés per hour. Try again a little later.');
    if (hour.length >= PUBLIC_BUILDS_PER_HOUR) throw new SenderError('Lots of cafés are being added right now. Try again in a few minutes.');
    if (since(86_400_000_000n).length >= PUBLIC_BUILDS_PER_DAY) throw new SenderError('Today’s café limit is reached. Try again tomorrow.');
  }
  queueBuild(ctx, q, '', '[]', '');
});

function queueBuild(ctx: Ctx, query: string, label: string, menuJson: string, cutoffDate: string) {
  const b = ctx.db.twinBuild.insert({
    id: 0n,
    query,
    label,
    cutoffDate,
    menuJson,
    status: 'queued',
    detail: 'Queued',
    placeRunId: '',
    reviewsRunId: '',
    competitorsRunId: '',
    placeJson: '',
    reviewsJson: '',
    competitorsJson: '',
    batchesTotal: 0,
    batchesDone: 0,
    twinJson: '',
    universeId: 0n,
  });
  ctx.db.buildOwner.insert({ buildId: b.id, identity: ctx.sender, createdAt: ctx.timestamp });
  ctx.db.buildJob.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch),
    buildId: b.id,
  });
  syncCard(ctx, b.id);
}

/**
 * Builder (the Mana menu service, admin): replace a café's menu with one read from the web, then
 * rebuild its customers from the reviews already scraped, so usual orders point at real items.
 * items: [{ name, category, price }] with price in dollars (regular size, in-store).
 */
export const set_real_menu = spacetimedb.reducer(
  { buildId: t.u64(), itemsJson: t.string(), sourceUrl: t.string(), evidence: t.string() },
  (ctx, { buildId, itemsJson, sourceUrl, evidence }) => {
    requireBuilder(ctx);
    const b = ctx.db.twinBuild.id.find(buildId);
    if (!b) throw new SenderError(`no café build ${buildId}`);
    if (b.cutoffDate !== '') throw new SenderError('only current cafés take a new menu (not backtests)');
    if (b.status !== 'done' && b.status !== 'failed') throw new SenderError(`café is busy (${b.status}); try again when it is ready`);
    if (!b.reviewsJson || !b.placeJson) throw new SenderError('this café has no stored reviews to rebuild from');
    const raw = parseJson<{ name: string; category: string; price: number }[]>(itemsJson, 'itemsJson');
    if (!Array.isArray(raw)) throw new SenderError('itemsJson must be a list of { name, category, price }');
    const items = realMenuItems(raw);
    if (items.length < 3) throw new SenderError(`need at least 3 priced items; got ${items.length} usable`);
    if (!/^https?:\/\//.test(sourceUrl)) throw new SenderError('sourceUrl must be the http(s) page the menu was read from');
    const usable = usableReviews(JSON.parse(b.reviewsJson), b.cutoffDate);
    if (usable.length < 10) throw new SenderError(`only ${usable.length} usable stored reviews`);

    const menuJson = JSON.stringify(items);
    // Fresh profiles against the real menu (old ones were read against the estimate).
    for (const p of [...ctx.db.twinProfile.buildId.filter(buildId)]) ctx.db.twinProfile.id.delete(p.id);
    const batches = queueProfileJobs(ctx, buildId, menuJson, usable);
    ctx.db.twinBuild.id.update({
      ...b,
      menuJson,
      status: 'profiling',
      batchesTotal: batches,
      batchesDone: 0,
      detail: `Real menu (${items.length} items) received; Claude is re-reading ${usable.length} reviews against it`,
    });
    const row = { buildId, status: 'ready', source: 'read by Mana', url: sourceUrl.slice(0, 500), runId: '', detail: evidence.slice(0, 800) };
    if (ctx.db.menuSource.buildId.find(buildId)) ctx.db.menuSource.buildId.update(row);
    else ctx.db.menuSource.insert(row);
    syncCard(ctx, buildId);
  }
);

/** Scrape a café's reviews only (no customers), to look for price changes worth backtesting. */
export const start_review_scan = spacetimedb.reducer({ query: t.string() }, (ctx, { query }) => {
  requireAdmin(ctx);
  const b = ctx.db.twinBuild.insert({
    id: 0n,
    query,
    label: '',
    cutoffDate: SCAN,
    menuJson: '[]',
    status: 'queued',
    detail: 'Queued scan',
    placeRunId: '',
    reviewsRunId: '',
    competitorsRunId: '',
    placeJson: '',
    reviewsJson: '',
    competitorsJson: '',
    batchesTotal: 0,
    batchesDone: 0,
    twinJson: '',
    universeId: 0n,
  });
  ctx.db.buildJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch), buildId: b.id });
});

/** Start a failed build over from the beginning. */
export const retry_build = spacetimedb.reducer({ buildId: t.u64() }, (ctx, { buildId }) => {
  requireAdmin(ctx);
  const b = ctx.db.twinBuild.id.find(buildId);
  if (!b) throw new SenderError(`no build ${buildId}`);
  if (b.status !== 'failed') throw new SenderError(`build ${buildId} is ${b.status}, not failed`);
  ctx.db.twinBuild.id.update({
    ...b,
    status: 'queued',
    detail: 'Retrying',
    placeRunId: '',
    reviewsRunId: '',
    competitorsRunId: '',
  });
  ctx.db.buildJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch), buildId });
  syncCard(ctx, buildId);
});

/** Rebuild a finished build's twin from its stored data (no new scraping or Claude calls). */
export const reassemble_build = spacetimedb.reducer({ buildId: t.u64() }, (ctx, { buildId }) => {
  requireAdmin(ctx);
  const b = ctx.db.twinBuild.id.find(buildId);
  if (!b || !b.placeJson) throw new SenderError(`build ${buildId} has no scraped data`);
  ctx.db.twinBuild.id.update({ ...b, status: 'assembling', detail: 'Re-assembling from stored data' });
  ctx.db.buildJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch), buildId });
  syncCard(ctx, buildId);
});

/** (Re)fetch the OpenStreetMap neighborhood for a finished build. Runs automatically after a build. */
export const fetch_area_map = spacetimedb.reducer({ buildId: t.u64() }, (ctx, { buildId }) => {
  requireAdmin(ctx);
  const b = ctx.db.twinBuild.id.find(buildId);
  if (!b || !b.placeJson) throw new SenderError(`build ${buildId} has no place yet`);
  ctx.db.mapJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch), buildId });
});

export const build_area_map = spacetimedb.procedure(
  { onSchedule: mapJob },
  { job: mapJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    const buildId = job.buildId;
    const b = ctx.withTx(tx => tx.db.twinBuild.id.find(buildId));
    if (!b || !b.placeJson) return {};
    const save = (status: string, detail: string, mapJson: string) =>
      ctx.withTx(tx => {
        const row = { buildId, status, detail, mapJson };
        if (tx.db.areaMap.buildId.find(buildId)) tx.db.areaMap.buildId.update(row);
        else tx.db.areaMap.insert(row);
        syncCard(tx, buildId);
      });
    save('fetching', 'Fetching the neighborhood from OpenStreetMap', '');
    try {
      const map = fetchAreaMap(ctx, b.placeJson, b.competitorsJson);
      save(
        'ready',
        `${map.buildings.length} buildings, ${map.roads.length} roads, ${Math.round(map.radius)} m radius`,
        JSON.stringify(map)
      );
    } catch (e) {
      save('failed', String(e).slice(0, 400), '');
    }
    return {};
  }
);

/** Debug: summary of what a build's menu crawl saw (pages, text length, prices found, snippet). */
export const inspect_menu_crawl = spacetimedb.procedure({ buildId: t.u64() }, t.string(), (ctx, { buildId }) =>
  ctx.withTx(tx => tx.db.admin.identity.find(ctx.sender) !== null)
    ? inspectMenuCrawl(ctx, buildId)
    : JSON.stringify({ error: 'admin only' })
);

export const test_menu_read = spacetimedb.procedure({ buildId: t.u64() }, t.string(), (ctx, { buildId }) =>
  ctx.withTx(tx => tx.db.admin.identity.find(ctx.sender) !== null)
    ? testMenuRead(ctx, buildId)
    : JSON.stringify({ error: 'admin only' })
);

export const inspect_menu_search = spacetimedb.procedure({ buildId: t.u64() }, t.string(), (ctx, { buildId }) =>
  ctx.withTx(tx => tx.db.admin.identity.find(ctx.sender) !== null)
    ? inspectMenuSearch(ctx, buildId)
    : JSON.stringify({ error: 'admin only' })
);

/** Scrape every coffee place within 7 miles of a built café (for the radius slider). */
export const refresh_rivals = spacetimedb.reducer({ buildId: t.u64() }, (ctx, { buildId }) => {
  requireAdmin(ctx);
  const b = ctx.db.twinBuild.id.find(buildId);
  if (!b || !b.placeJson) throw new SenderError(`build ${buildId} has no place yet`);
  const row = { buildId, status: 'queued', runId: '', detail: 'Queued' };
  if (ctx.db.rivalScan.buildId.find(buildId)) ctx.db.rivalScan.buildId.update(row);
  else ctx.db.rivalScan.insert(row);
  ctx.db.rivalJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch), buildId });
});

export const scan_rivals = spacetimedb.procedure(
  { onSchedule: rivalJob },
  { job: rivalJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    advanceRivalScan(ctx, job.buildId);
    return {};
  }
);

export const advance_build = spacetimedb.procedure(
  { onSchedule: buildJob },
  { job: buildJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    try {
      advanceBuild(ctx, job.buildId);
    } finally {
      ctx.withTx(tx => syncCard(tx, job.buildId));
    }
    return {};
  }
);

export const profile_batch = spacetimedb.procedure(
  { onSchedule: profileJob },
  { job: profileJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    try {
      profileBatch(ctx, job.buildId, job.payloadJson);
    } finally {
      ctx.withTx(tx => syncCard(tx, job.buildId));
    }
    return {};
  }
);

// ---- The AI brain: one Claude call per batch of up to 10 situations -------------

interface JobItem {
  situationKey: string;
  context: { name: string; visitsPerWeek: number };
}

export const decide = spacetimedb.procedure(
  { onSchedule: decisionJob },
  { job: decisionJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    const startedMs = ctx.timestamp.toMillis();
    const items: JobItem[] = JSON.parse(job.payloadJson);
    const byId = new Map(items.map((item, i) => [`k${i + 1}`, item]));
    const answers = new Map<string, Decision>();
    const prompt = buildPrompt([...byId].map(([id, item]) => ({ id, context: item.context })));
    const res = callClaude(ctx, prompt, DECISIONS_SCHEMA, 8000);
    if (res.ok) {
      for (const d of res.data.decisions ?? []) {
        const item = byId.get(d.id);
        if (item) answers.set(d.id, normalize(d, item.context.visitsPerWeek));
      }
    }
    const { ok, inputTokens, outputTokens } = res;
    const note = ok ? `${answers.size}/${items.length} answered` : `${res.error} (rules brain used)`;

    ctx.withTx(tx => {
      for (const [id, item] of byId) {
        const d = answers.get(id);
        if (!tx.db.decisionCache.situationKey.find(item.situationKey)) {
          tx.db.decisionCache.insert({
            situationKey: item.situationKey,
            agentKey: item.situationKey.split('|')[0],
            pHere: d ? d.pHere : -1,
            pCompetitor: d ? d.pCompetitor : -1,
            pSkip: d ? d.pSkip : -1,
            satisfaction: d ? d.satisfaction : 0,
            memory: d ? d.memory : '',
            reviewText: d ? d.reviewText : '',
            source: d ? 'ai' : 'fallback',
          });
        }
        tx.db.decisionRequest.situationKey.delete(item.situationKey);
      }
      tx.db.llmLog.insert({
        id: 0n,
        ok,
        situations: items.length,
        inputTokens,
        outputTokens,
        startedMs,
        finishedMs: tx.timestamp.toMillis(),
        note,
      });
    });
    return {};
  }
);
