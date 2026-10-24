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

// Spike leftovers, kept until the AI step replaces them.
export const llmJob = table(
  { name: 'llm_job' },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
    batch: t.string(),
    prompt: t.string(),
  }
);

export const llmResult = table(
  { name: 'llm_result', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    batch: t.string(),
    ok: t.bool(),
    startedMs: t.u64(),
    finishedMs: t.u64(),
    output: t.string(),
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
    llmJob,
    llmResult,
  },
  // Optional so the engine can publish and run on the rules brain without a key.
  { env: { ANTHROPIC_API_KEY: t.option(t.string()) } }
);
export default spacetimedb;
