// All Fork tables. Every simulation table carries universeId, so a fork is a copy of
// one universe's rows under a new id. Money is stored in cents.
import { schema, table, t } from 'spacetimedb/server';

// One timeline. The root universe is the twin as loaded; experiments fork copies of it.
export const universe = table(
  { name: 'universe', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    parentId: t.u64(), // 0 for a root twin
    experimentId: t.u64(), // 0 when not part of an experiment
    optionLabel: t.string(), // e.g. "control", "latte +50c"
    copyNumber: t.u32(), // 1..N; same number = same luck across options
    seed: t.u64(),
    forkTick: t.u32(),
    currentTick: t.u32(),
    maxTick: t.u32(),
    status: t.string(), // "paused" | "running" | "done"
    brain: t.string(), // "ai" = Claude decides noticed changes, "rules" = formula only
  }
);

export const cafe = table(
  { name: 'cafe', public: true },
  {
    universeId: t.u64().primaryKey(),
    name: t.string(),
    openHour: t.u32(),
    closeHour: t.u32(),
    servicePerHour: t.u32(), // customers the counter can serve per hour
    customerScale: t.u32(), // real customers each agent stands for
    rentPerDayCents: t.u32(),
    wagesPerDayCents: t.u32(),
    cashCents: t.i64(),
  }
);

export const menuItem = table(
  { name: 'menu_item', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    key: t.string(),
    name: t.string(),
    category: t.string(),
    priceCents: t.u32(),
    unitCostCents: t.u32(),
  }
);

export const competitor = table(
  { name: 'competitor', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    key: t.string(),
    name: t.string(),
    priceIndex: t.f64(), // their prices relative to ours at load time (1.05 = 5% pricier)
    rating: t.f64(),
  }
);

// A customer agent. pHere / pCompetitor / pSkip are today's odds; habit days roll
// dice with them, and a "notice" (price change, bad visit) updates them.
export const agent = table(
  { name: 'agent', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    key: t.string(), // stable across copies, e.g. "c017"
    name: t.string(), // made-up display name, never a real reviewer's name
    archetype: t.string(),
    priceSensitivity: t.f64(), // 0 = never notices price, 1 = very sensitive
    visitsPerWeek: t.f64(),
    loyalty: t.f64(),
    usualOrder: t.string(), // JSON array of menu item keys
    cares: t.string(),
    refPriceCents: t.u32(), // what they're used to paying for their usual order
    pHere: t.f64(),
    pCompetitor: t.f64(),
    pSkip: t.f64(),
    satisfaction: t.f64(), // rolling, 1..5
    lastNoticeTick: t.i32(), // -1 if never
    lastNoticePct: t.f64(), // size of the last price change they noticed (+0.08 = 8% up)
    noticeReview: t.string(), // AI-written review for the last noticed change, used if they review soon
    visitsHere: t.u32(),
  }
);

// Plain memory store; Moss replaces recall later.
export const memory = table(
  { name: 'memory', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    agentKey: t.string(),
    tick: t.i32(), // -1 for memories seeded from real reviews
    text: t.string(),
  }
);

export const review = table(
  { name: 'review', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    tick: t.u32(),
    agentKey: t.string(),
    stars: t.u32(),
    mentionsPrice: t.bool(),
    text: t.string(),
  }
);

export const dailyMetric = table(
  { name: 'daily_metric', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    tick: t.u32(),
    revenueCents: t.i64(),
    profitCents: t.i64(),
    visits: t.u32(), // scaled to real customers
    competitorVisits: t.u32(),
    avgWaitMin: t.f64(),
    regularsActive: t.u32(),
    avgSatisfaction: t.f64(),
    reviews: t.u32(),
    starsSum: t.u32(),
    priceMentions: t.u32(),
    notices: t.u32(),
  }
);

export const event = table(
  { name: 'event', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    tick: t.u32(),
    kind: t.string(),
    agentKey: t.string(),
    detail: t.string(),
  }
);

// A paired comparison: every option runs `copies` universes, copy k shares its seed.
export const experiment = table(
  { name: 'experiment', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    baseUniverseId: t.u64(),
    label: t.string(),
    optionsJson: t.string(),
    copies: t.u32(),
    days: t.u32(),
    status: t.string(), // "running" | "done"
  }
);

export const experimentResult = table(
  { name: 'experiment_result', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    experimentId: t.u64().index('btree'),
    optionLabel: t.string(),
    copies: t.u32(),
    meanRevenueCents: t.i64(),
    meanProfitCents: t.i64(),
    meanVisits: t.f64(),
    meanStars: t.f64(), // over simulated reviews; 0 if none
    priceMentionShare: t.f64(),
    revenueWins: t.u32(), // copies beating the paired control copy on revenue
    profitWins: t.u32(),
    ratingDrops: t.u32(), // copies whose stars fell > 0.2 below the paired control
  }
);

export const clockJob = table(
  { name: 'clock_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
  }
);

// ---- AI brain ----------------------------------------------------------------

// Claude's answer for one situation. Shared by every universe and copy that reaches the
// same situation, so 10 copies usually cost one call per customer, not ten.
// pHere < 0 means "no AI answer, use the rules brain".
export const decisionCache = table(
  { name: 'decision_cache', public: true },
  {
    situationKey: t.string().primaryKey(),
    agentKey: t.string(),
    pHere: t.f64(),
    pCompetitor: t.f64(),
    pSkip: t.f64(),
    satisfaction: t.f64(),
    memory: t.string(),
    reviewText: t.string(),
    source: t.string(), // "ai" | "fallback"
  }
);

// A situation waiting for Claude. Deleted once its answer is cached.
export const decisionRequest = table(
  { name: 'decision_request', public: true },
  {
    situationKey: t.string().primaryKey(),
    agentKey: t.string(),
    contextJson: t.string(),
  }
);

// One Claude call for up to 10 situations; fires immediately.
export const decisionJob = table(
  { name: 'decision_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
    payloadJson: t.string(), // [{situationKey, context}]
  }
);

// One row per Claude call: for debugging and watching the credit budget.
export const llmLog = table(
  { name: 'llm_log', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    ok: t.bool(),
    situations: t.u32(),
    inputTokens: t.u32(),
    outputTokens: t.u32(),
    startedMs: t.u64(),
    finishedMs: t.u64(),
    note: t.string(),
  }
);

// ---- Twin pipeline: Google Maps link -> real café twin, built inside the database --------

// One build. A scheduled procedure moves it through:
// queued -> place -> scraping -> profiling -> assembling -> done (or failed).
export const twinBuild = table(
  { name: 'twin_build', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    query: t.string(), // Google Maps URL, or "name, city"
    label: t.string(),
    cutoffDate: t.string(), // "" = use all reviews; "YYYY-MM-DD" = build only from reviews before it (backtest)
    menuJson: t.string(), // menu passed in by the caller (keys, names, prices)
    status: t.string(),
    detail: t.string(), // human-readable progress or error
    placeRunId: t.string(),
    reviewsRunId: t.string(),
    competitorsRunId: t.string(),
    placeJson: t.string(),
    reviewsJson: t.string(), // ALL scraped reviews [{date, stars, text}], before and after the cutoff
    competitorsJson: t.string(),
    batchesTotal: t.u32(),
    batchesDone: t.u32(),
    twinJson: t.string(),
    universeId: t.u64(), // the loaded twin, once done
  }
);

// Where a build's menu came from: read from their site/ordering page, from menu photos,
// estimated, or provided by the caller (e.g. documented old prices for a backtest).
// Menu pages still to try for a build, best first (the build crawls one at a time).
export const menuCandidate = table(
  { name: 'menu_candidate' },
  {
    buildId: t.u64().primaryKey(),
    remainingJson: t.string(), // string[] of URLs not tried yet
    triedJson: t.string(), // string[] of URLs tried, with why each failed
  }
);

export const menuSource = table(
  { name: 'menu_source', public: true },
  {
    buildId: t.u64().primaryKey(),
    status: t.string(), // "crawling" | "ready" | "none"
    source: t.string(), // "website" | "menu photo" | "estimated" | "provided"
    url: t.string(),
    runId: t.string(),
    detail: t.string(),
  }
);

// What each customer carries from day to day in the daily-choice model (choice.ts): habits, what
// they're used to paying, Claude's fading nudge and the places they know. One row per agent, made
// the first time they go out; agents who haven't yet use their starting values.
export const agentChoice = table(
  { name: 'agent_choice' },
  {
    agentId: t.u64().primaryKey(),
    universeId: t.u64().index('btree'),
    habitHere: t.f64(),
    habitOut: t.f64(),
    habitTick: t.u32(),
    anchorCents: t.f64(),
    shift: t.f64(),
    shiftTick: t.u32(),
    lastHereTick: t.u32(),
    knownJson: t.string(),
  }
);

// The daily-choice state per customer (choice.ts ChoiceState): habits, what they paid before the
// experiment, what they're used to paying, Claude's fading nudge. Made the first time they go out.
// (Supersedes agent_choice, kept only because dropping a table isn't an additive migration.)
export const agentDay = table(
  { name: 'agent_day' },
  {
    agentId: t.u64().primaryKey(),
    universeId: t.u64().index('btree'),
    habitHere: t.f64(),
    habitOut: t.f64(),
    habitTick: t.u32(),
    baseCents: t.f64(),
    anchorCents: t.f64(),
    shift: t.f64(),
    shiftTick: t.u32(),
    lastHereTick: t.u32(),
  }
);

// The day before a universe's first daily-choice day (today.ts choiceStart).
export const choiceStart = table(
  { name: 'choice_start' },
  {
    universeId: t.u64().primaryKey(),
    startTick: t.u32(),
  }
);

// One light row per build for clients: what a café picker and a build progress line need,
// without the scraped reviews and customer JSON that twin_build carries.
export const buildCard = table(
  { name: 'build_card', public: true },
  {
    buildId: t.u64().primaryKey(),
    universeId: t.u64(),
    query: t.string(),
    name: t.string(),
    address: t.string(),
    rating: t.f64(), // 0 = unknown
    reviewsCount: t.u32(),
    cutoffDate: t.string(),
    status: t.string(),
    detail: t.string(),
    batchesDone: t.u32(),
    batchesTotal: t.u32(),
    menuSource: t.string(),
    mapReady: t.bool(),
  }
);

// Claude's reading of one real review (one reviewer -> one customer profile).
export const twinProfile = table(
  { name: 'twin_profile', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    buildId: t.u64().index('btree'),
    reviewIndex: t.u32(),
    profileJson: t.string(),
  }
);

export const buildJob = table(
  { name: 'build_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
    buildId: t.u64(),
  }
);

export const profileJob = table(
  { name: 'profile_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
    buildId: t.u64(),
    payloadJson: t.string(), // {menu, reviews: [{i, stars, date, text}]}
  }
);

// ---- Competitors within a radius ------------------------------------------------------

// Every coffee place within 7 miles of a built café (static facts, per build).
export const rival = table(
  { name: 'rival', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    buildId: t.u64().index('btree'),
    key: t.string(),
    name: t.string(),
    x: t.f64(), // meters east of the café
    y: t.f64(), // meters north of the café
    distanceM: t.u32(),
    rating: t.f64(),
    reviewsCount: t.u32(),
    priceIndex: t.f64(),
    category: t.string(),
  }
);

// Which café build a universe belongs to (twin roots and their experiment copies).
export const universeBuild = table(
  { name: 'universe_build', public: true },
  { universeId: t.u64().primaryKey(), buildId: t.u64() }
);

// The competitor radius an experiment was run with.
export const experimentRadius = table(
  { name: 'experiment_radius', public: true },
  { experimentId: t.u64().primaryKey(), radiusM: t.u32() }
);

// Visits each rival received in a universe (for "where did customers go").
export const rivalTally = table(
  { name: 'rival_tally', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    rivalKey: t.string(),
    visits: t.u32(), // simulated customers, not scaled
  }
);

// Refreshing an existing build's rivals (scrape coffee places within 7 miles).
export const rivalScan = table(
  { name: 'rival_scan', public: true },
  { buildId: t.u64().primaryKey(), status: t.string(), runId: t.string(), detail: t.string() }
);

export const rivalJob = table(
  { name: 'rival_job' },
  { scheduledId: t.u64().primaryKey().autoInc(), scheduledAt: t.scheduleAt(), buildId: t.u64() }
);

// Partners (the Mana app's server-side tools) may build twins, rate-limited. Join with
// claim_partner + PARTNER_KEY. They can't reset, run the clock or do other admin actions.
export const partner = table({ name: 'partner', public: true }, { identity: t.identity().primaryKey() });

// Who started each build, and when (for the partner rate limit).
export const buildOwner = table(
  { name: 'build_owner', public: true },
  { buildId: t.u64().primaryKey(), identity: t.identity(), createdAt: t.timestamp() }
);

// Identities allowed to run admin actions (builds, resets, clock). Join with claim_admin + ADMIN_KEY.
export const admin = table({ name: 'admin', public: true }, { identity: t.identity().primaryKey() });

// ---- Viewer support -----------------------------------------------------------------

// Universes whose individual customer trips are recorded (the twin itself and copy #1 of each
// experiment option). Logging every copy would be hundreds of thousands of rows.
export const traced = table(
  { name: 'traced', public: true },
  { universeId: t.u64().primaryKey() }
);

// Who went where on which day, in traced universes. Customers with no row that day stayed home.
export const visit = table(
  { name: 'visit', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    universeId: t.u64().index('btree'),
    tick: t.u32(),
    agentKey: t.string(),
    place: t.string(), // "here" | "competitor"
  }
);

// The real neighborhood around a built café, from OpenStreetMap, in local meters.
export const areaMap = table(
  { name: 'area_map', public: true },
  {
    buildId: t.u64().primaryKey(),
    status: t.string(), // "fetching" | "ready" | "failed"
    detail: t.string(),
    mapJson: t.string(),
  }
);

export const mapJob = table(
  { name: 'map_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
    buildId: t.u64(),
  }
);

const spacetimedb = schema(
  {
    universe,
    cafe,
    menuItem,
    competitor,
    agent,
    memory,
    review,
    dailyMetric,
    event,
    experiment,
    experimentResult,
    clockJob,
    decisionCache,
    decisionRequest,
    decisionJob,
    llmLog,
    twinBuild,
    buildCard,
    agentChoice,
    agentDay,
    choiceStart,
    menuSource,
    menuCandidate,
    twinProfile,
    buildJob,
    profileJob,
    traced,
    visit,
    areaMap,
    mapJob,
    admin,
    partner,
    buildOwner,
    rival,
    universeBuild,
    experimentRadius,
    rivalTally,
    rivalScan,
    rivalJob,
  },
  // Optional so the engine can publish and run on the rules brain without keys.
  {
    env: {
      ANTHROPIC_API_KEY: t.option(t.string()),
      APIFY_TOKEN: t.option(t.string()),
      ADMIN_KEY: t.option(t.string()),
      PARTNER_KEY: t.option(t.string()),
    },
  }
);
export default spacetimedb;
