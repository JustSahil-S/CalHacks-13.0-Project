// The simulation: loading a twin, copying universes, one simulated day, and
// summarizing an experiment. Reducers in index.ts call into these.
import type { InferSchema, ReducerCtx } from 'spacetimedb/server';
import spacetimedb from './schema';
import { hash32, roll } from './rng';
import { competitorSignature, orderPrice, situationKey } from './brain';
import { chooseRival, rivalSet, switchingEase } from './rivals';

export type Ctx = ReducerCtx<InferSchema<typeof spacetimedb>>;

// ---- Twin input (what the data pipeline produces) ------------------------

export interface TwinInput {
  cafe: {
    name: string;
    openHour: number;
    closeHour: number;
    servicePerHour: number;
    customerScale: number;
    rentPerDayCents: number;
    wagesPerDayCents: number;
  };
  menu: {
    key: string;
    name: string;
    category: string;
    priceCents: number;
    unitCostCents: number;
  }[];
  competitors: { key: string; name: string; priceIndex: number; rating: number }[];
  customers: {
    key: string;
    name: string;
    archetype: string;
    priceSensitivity: number;
    visitsPerWeek: number;
    loyalty: number;
    usualOrder: string[];
    cares: string;
    seedMemories: string[];
  }[];
}

export type PriceChanges = Record<string, number>; // menu item key -> new price in cents

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

function logEvent(
  ctx: Ctx,
  universeId: bigint,
  tick: number,
  kind: string,
  agentKey: string,
  detail: string
) {
  ctx.db.event.insert({ id: 0n, universeId, tick, kind, agentKey, detail });
}

// ---- Loading and copying ---------------------------------------------------

export function loadTwin(ctx: Ctx, twin: TwinInput): bigint {
  const u = ctx.db.universe.insert({
    id: 0n,
    parentId: 0n,
    experimentId: 0n,
    optionLabel: 'twin',
    copyNumber: 0,
    seed: 1n,
    forkTick: 0,
    currentTick: 0,
    maxTick: 0,
    status: 'paused',
    brain: 'rules',
  });
  const c = twin.cafe;
  ctx.db.cafe.insert({
    universeId: u.id,
    name: c.name,
    openHour: c.openHour,
    closeHour: c.closeHour,
    servicePerHour: c.servicePerHour,
    customerScale: c.customerScale,
    rentPerDayCents: c.rentPerDayCents,
    wagesPerDayCents: c.wagesPerDayCents,
    cashCents: 0n,
  });
  const prices = new Map<string, number>();
  for (const m of twin.menu) {
    prices.set(m.key, m.priceCents);
    ctx.db.menuItem.insert({ id: 0n, universeId: u.id, ...m });
  }
  for (const comp of twin.competitors) {
    ctx.db.competitor.insert({ id: 0n, universeId: u.id, ...comp });
  }
  for (const cu of twin.customers) {
    const usualOrder = JSON.stringify(cu.usualOrder);
    const pVisit = clamp(cu.visitsPerWeek / 7, 0.02, 0.95);
    const pHere = pVisit * (0.75 + 0.25 * cu.loyalty);
    ctx.db.agent.insert({
      id: 0n,
      universeId: u.id,
      key: cu.key,
      name: cu.name,
      archetype: cu.archetype,
      priceSensitivity: cu.priceSensitivity,
      visitsPerWeek: cu.visitsPerWeek,
      loyalty: cu.loyalty,
      usualOrder,
      cares: cu.cares,
      refPriceCents: orderPrice(prices, usualOrder),
      pHere,
      pCompetitor: pVisit - pHere,
      pSkip: 1 - pVisit,
      satisfaction: 4,
      lastNoticeTick: -1,
      lastNoticePct: 0,
      noticeReview: '',
      visitsHere: 0,
    });
    for (const text of cu.seedMemories) {
      ctx.db.memory.insert({ id: 0n, universeId: u.id, agentKey: cu.key, tick: -1, text });
    }
  }
  logEvent(ctx, u.id, 0, 'twin_loaded', '', `${c.name}: ${twin.customers.length} customers`);
  ctx.db.traced.insert({ universeId: u.id });
  return u.id;
}

/** Copy one universe's world (not its history) into another. */
export function copyWorld(ctx: Ctx, fromId: bigint, toId: bigint) {
  const c = ctx.db.cafe.universeId.find(fromId);
  if (c) ctx.db.cafe.insert({ ...c, universeId: toId });
  for (const m of ctx.db.menuItem.universeId.filter(fromId)) {
    ctx.db.menuItem.insert({ ...m, id: 0n, universeId: toId });
  }
  for (const comp of ctx.db.competitor.universeId.filter(fromId)) {
    ctx.db.competitor.insert({ ...comp, id: 0n, universeId: toId });
  }
  for (const a of ctx.db.agent.universeId.filter(fromId)) {
    ctx.db.agent.insert({ ...a, id: 0n, universeId: toId });
  }
  for (const mem of ctx.db.memory.universeId.filter(fromId)) {
    ctx.db.memory.insert({ ...mem, id: 0n, universeId: toId });
  }
}

export function applyPrices(ctx: Ctx, universeId: bigint, changes: PriceChanges, tick: number) {
  for (const m of [...ctx.db.menuItem.universeId.filter(universeId)]) {
    const next = changes[m.key];
    if (next !== undefined && next !== m.priceCents) {
      ctx.db.menuItem.id.update({ ...m, priceCents: next });
      logEvent(ctx, universeId, tick, 'price_change', '', `${m.name}: ${m.priceCents} -> ${next} cents`);
    }
  }
}

// ---- Rules brain (used until the AI brain lands, and as the free fallback) ---

/** A customer saw a new price for their usual order. Shift their odds. */
function noticePrice(
  a: { priceSensitivity: number; pHere: number; pCompetitor: number; pSkip: number },
  oldCents: number,
  newCents: number,
  ease = 1 // how easy switching is given the rivals in range (rivals.ts switchingEase)
) {
  const pct = oldCents > 0 ? (newCents - oldCents) / oldCents : 0;
  let { pHere, pCompetitor, pSkip } = a;
  if (pct > 0) {
    const moved = pHere * clamp(pct * a.priceSensitivity * 2.5 * ease, 0, 0.8);
    pHere -= moved;
    pCompetitor += moved * 0.65;
    pSkip += moved * 0.35;
  } else if (pct < 0) {
    const moved = pCompetitor * clamp(-pct * a.priceSensitivity * 1.5, 0, 0.5);
    pCompetitor -= moved;
    pHere += moved;
  }
  return { pHere, pCompetitor, pSkip, pct };
}

// ---- One simulated day -------------------------------------------------------

export function stepUniverse(ctx: Ctx, universeId: bigint) {
  const u = ctx.db.universe.id.find(universeId);
  const c = ctx.db.cafe.universeId.find(universeId);
  if (!u || !c) return;
  const tick = u.currentTick + 1;

  const prices = new Map<string, number>();
  const costs = new Map<string, number>();
  for (const m of ctx.db.menuItem.universeId.filter(universeId)) {
    prices.set(m.key, m.priceCents);
    costs.set(m.key, m.unitCostCents);
  }
  const scale = c.customerScale;
  const agents = [...ctx.db.agent.universeId.filter(universeId)];
  const compSig = competitorSignature(ctx, universeId);
  const isTraced = ctx.db.traced.universeId.find(universeId) !== null;
  const rset = rivalSet(ctx, universeId); // null for universes made before rivals existed
  const ease = switchingEase(rset);
  const rivalVisits = new Map<string, number>();

  // Pass 1: where does everyone go today?
  let hereCount = 0;
  let competitorCount = 0;
  let revenue = 0;
  let cogs = 0;
  let notices = 0;
  const visitors: { a: (typeof agents)[number]; feltOverride: number | null }[] = [];
  for (const a of agents) {
    const r = roll(u.seed, tick, a.key, 'where');
    if (r < a.pHere) {
      const now = orderPrice(prices, a.usualOrder);
      let next = a;
      let feltOverride: number | null = null;
      if (now !== a.refPriceCents) {
        const pricePct = a.refPriceCents > 0 ? (now - a.refPriceCents) / a.refPriceCents : 0;
        const row =
          u.brain === 'ai'
            ? ctx.db.decisionCache.situationKey.find(situationKey(a, now, compSig))
            : null;
        const ai = row && row.pHere >= 0 ? row : null; // null -> rules brain only
        // Blend: Claude judges the person; an economic rule (bigger jump x more price-conscious
        // x easier switching = more leaving) keeps extreme prices from looking free.
        const rules = noticePrice(a, a.refPriceCents, now, ease);
        const odds = ai
          ? {
              pHere: (ai.pHere + rules.pHere) / 2,
              pCompetitor: (ai.pCompetitor + rules.pCompetitor) / 2,
              pSkip: (ai.pSkip + rules.pSkip) / 2,
            }
          : rules;
        next = {
          ...a,
          pHere: odds.pHere,
          pCompetitor: odds.pCompetitor,
          pSkip: odds.pSkip,
          refPriceCents: now,
          lastNoticeTick: tick,
          lastNoticePct: pricePct,
          noticeReview: ai ? ai.reviewText : '',
        };
        if (ai) feltOverride = ai.satisfaction;
        notices++;
        const dir = pricePct > 0 ? 'up' : 'down';
        ctx.db.memory.insert({
          id: 0n,
          universeId,
          agentKey: a.key,
          tick,
          text: ai
            ? ai.memory
            : `My usual order went ${dir} from $${(a.refPriceCents / 100).toFixed(2)} to $${(now / 100).toFixed(2)}.`,
        });
        logEvent(
          ctx,
          universeId,
          tick,
          'notice_price',
          a.key,
          `${Math.round(pricePct * 100)}% (${ai ? 'ai' : 'rules'}): here ${odds.pHere.toFixed(2)}`
        );
      }
      hereCount++;
      if (isTraced) ctx.db.visit.insert({ id: 0n, universeId, tick, agentKey: a.key, place: 'here' });
      revenue += now * scale;
      cogs += orderPrice(costs, a.usualOrder) * scale;
      visitors.push({ a: { ...next, visitsHere: next.visitsHere + 1 }, feltOverride });
    } else if (r < a.pHere + a.pCompetitor) {
      // Which rival? Weighted by rating, distance and price, among those in this experiment's radius.
      const rivalKey = rset ? chooseRival(rset, roll(u.seed, tick, a.key, 'which')) : null;
      if (rset && !rivalKey) continue; // no coffee place in range: they go without
      competitorCount++;
      if (rivalKey) rivalVisits.set(rivalKey, (rivalVisits.get(rivalKey) ?? 0) + 1);
      if (isTraced) {
        ctx.db.visit.insert({ id: 0n, universeId, tick, agentKey: a.key, place: rivalKey ? `rival:${rivalKey}` : 'competitor' });
      }
    }
  }
  if (rivalVisits.size) {
    const tallies = new Map([...ctx.db.rivalTally.universeId.filter(universeId)].map(t => [t.rivalKey, t]));
    for (const [rivalKey, n] of rivalVisits) {
      const t = tallies.get(rivalKey);
      if (t) ctx.db.rivalTally.id.update({ ...t, visits: t.visits + n });
      else ctx.db.rivalTally.insert({ id: 0n, universeId, rivalKey, visits: n });
    }
  }

  // Wait time from how busy the counter was.
  const capacity = c.servicePerHour * Math.max(1, c.closeHour - c.openHour);
  const util = (hereCount * scale) / capacity;
  const waitMin = clamp(2 + 25 * Math.max(0, util - 0.55), 2, 30);

  // Pass 2: how did the visit feel? Bad visits push people away; some write reviews.
  let reviews = 0;
  let starsSum = 0;
  let priceMentions = 0;
  for (const { a, feltOverride } of visitors) {
    // Annoyance at a price increase fades over two weeks.
    const sinceNotice = a.lastNoticeTick >= 0 ? tick - a.lastNoticeTick : Infinity;
    const recentIncrease = sinceNotice <= 14 && a.lastNoticePct > 0;
    const pricePain = recentIncrease
      ? a.lastNoticePct * a.priceSensitivity * 4 * (1 - sinceNotice / 15)
      : 0;
    const felt =
      feltOverride ?? clamp(4.4 - 0.08 * Math.max(0, waitMin - 5) - pricePain, 1, 5);
    let next = { ...a, satisfaction: 0.75 * a.satisfaction + 0.25 * felt };
    if (felt < 3) {
      const moved = next.pHere * 0.06;
      next = { ...next, pHere: next.pHere - moved, pCompetitor: next.pCompetitor + moved };
      logEvent(ctx, universeId, tick, 'bad_visit', a.key, `felt ${felt.toFixed(1)}/5`);
    }
    if (roll(u.seed, tick, a.key, 'review') < 0.02) {
      const stars = clamp(Math.round(felt + (roll(u.seed, tick, a.key, 'stars') - 0.5)), 1, 5);
      const mentionsPrice = recentIncrease && felt < 4.3;
      const text = recentIncrease && a.noticeReview
        ? a.noticeReview
        : mentionsPrice
        ? 'Prices went up and it is starting to feel expensive for an everyday stop.'
        : stars >= 4
          ? 'Reliable as always, my usual order hit the spot.'
          : 'Not my best visit here.';
      ctx.db.review.insert({ id: 0n, universeId, tick, agentKey: a.key, stars, mentionsPrice, text });
      reviews++;
      starsSum += stars;
      if (mentionsPrice) priceMentions++;
    }
    ctx.db.agent.id.update(next);
  }

  let regularsActive = 0;
  let satisfactionSum = 0;
  for (const a of ctx.db.agent.universeId.filter(universeId)) {
    if (a.visitsPerWeek >= 3 && a.pHere >= 0.25) regularsActive++;
    satisfactionSum += a.satisfaction;
  }

  const profit = revenue - cogs - c.rentPerDayCents - c.wagesPerDayCents;
  ctx.db.dailyMetric.insert({
    id: 0n,
    universeId,
    tick,
    revenueCents: BigInt(Math.round(revenue)),
    profitCents: BigInt(Math.round(profit)),
    visits: hereCount * scale,
    competitorVisits: competitorCount * scale,
    avgWaitMin: waitMin,
    regularsActive,
    avgSatisfaction: agents.length ? satisfactionSum / agents.length : 0,
    reviews,
    starsSum,
    priceMentions,
    notices,
  });
  ctx.db.cafe.universeId.update({ ...c, cashCents: c.cashCents + BigInt(Math.round(profit)) });
  ctx.db.universe.id.update({
    ...u,
    currentTick: tick,
    status: tick >= u.maxTick ? 'done' : u.status,
  });
}

// ---- Experiments -------------------------------------------------------------

export interface ExperimentOption {
  label: string;
  prices: PriceChanges;
}

export function startExperiment(
  ctx: Ctx,
  baseUniverseId: bigint,
  label: string,
  options: ExperimentOption[],
  copies: number,
  days: number,
  brain: string,
  radiusM: number
): bigint {
  const base = ctx.db.universe.id.find(baseUniverseId);
  if (!base) throw new Error(`no universe ${baseUniverseId}`);
  const exp = ctx.db.experiment.insert({
    id: 0n,
    baseUniverseId,
    label,
    optionsJson: JSON.stringify(options),
    copies,
    days,
    status: 'running',
  });
  ctx.db.experimentRadius.insert({ experimentId: exp.id, radiusM });
  const buildId = ctx.db.universeBuild.universeId.find(baseUniverseId)?.buildId;
  for (const option of options) {
    for (let k = 1; k <= copies; k++) {
      const u = ctx.db.universe.insert({
        id: 0n,
        parentId: baseUniverseId,
        experimentId: exp.id,
        optionLabel: option.label,
        copyNumber: k,
        seed: BigInt(hash32('experiment', exp.id, k)), // same for every option: paired luck
        forkTick: base.currentTick,
        currentTick: base.currentTick,
        maxTick: base.currentTick + days,
        status: 'running',
        brain,
      });
      copyWorld(ctx, baseUniverseId, u.id);
      applyPrices(ctx, u.id, option.prices, base.currentTick);
      if (buildId !== undefined) ctx.db.universeBuild.insert({ universeId: u.id, buildId });
      if (k === 1) ctx.db.traced.insert({ universeId: u.id }); // the copy the viewer animates
    }
  }
  return exp.id;
}

interface CopyTotals {
  revenue: number;
  profit: number;
  visits: number;
  reviews: number;
  starsSum: number;
  priceMentions: number;
}

function totals(ctx: Ctx, universeId: bigint): CopyTotals {
  const t: CopyTotals = { revenue: 0, profit: 0, visits: 0, reviews: 0, starsSum: 0, priceMentions: 0 };
  for (const d of ctx.db.dailyMetric.universeId.filter(universeId)) {
    t.revenue += Number(d.revenueCents);
    t.profit += Number(d.profitCents);
    t.visits += d.visits;
    t.reviews += d.reviews;
    t.starsSum += d.starsSum;
    t.priceMentions += d.priceMentions;
  }
  return t;
}

/** If every copy of an experiment is done, write its results. The first option is the control. */
export function maybeFinishExperiment(ctx: Ctx, experimentId: bigint) {
  const exp = ctx.db.experiment.id.find(experimentId);
  if (!exp || exp.status !== 'running') return;
  const universes = [...ctx.db.universe.iter()].filter(u => u.experimentId === experimentId);
  if (universes.some(u => u.status !== 'done')) return;

  const options: ExperimentOption[] = JSON.parse(exp.optionsJson);
  const byOption = new Map<string, Map<number, CopyTotals>>();
  for (const u of universes) {
    if (!byOption.has(u.optionLabel)) byOption.set(u.optionLabel, new Map());
    byOption.get(u.optionLabel)!.set(u.copyNumber, totals(ctx, u.id));
  }
  const control = byOption.get(options[0].label)!;
  const stars = (t: CopyTotals) => (t.reviews ? t.starsSum / t.reviews : 0);

  for (const option of options) {
    const copies = byOption.get(option.label)!;
    let revenue = 0, profit = 0, visits = 0, reviewCount = 0, starsSum = 0, mentions = 0;
    let revenueWins = 0, profitWins = 0, ratingDrops = 0;
    for (const [k, t] of copies) {
      revenue += t.revenue;
      profit += t.profit;
      visits += t.visits;
      reviewCount += t.reviews;
      starsSum += t.starsSum;
      mentions += t.priceMentions;
      const ctl = control.get(k)!;
      if (t.revenue > ctl.revenue) revenueWins++;
      if (t.profit > ctl.profit) profitWins++;
      if (t.reviews && ctl.reviews && stars(t) < stars(ctl) - 0.2) ratingDrops++;
    }
    const n = copies.size;
    ctx.db.experimentResult.insert({
      id: 0n,
      experimentId,
      optionLabel: option.label,
      copies: n,
      meanRevenueCents: BigInt(Math.round(revenue / n)),
      meanProfitCents: BigInt(Math.round(profit / n)),
      meanVisits: visits / n,
      meanStars: reviewCount ? starsSum / reviewCount : 0,
      priceMentionShare: reviewCount ? mentions / reviewCount : 0,
      revenueWins,
      profitWins,
      ratingDrops,
    });
  }
  ctx.db.experiment.id.update({ ...exp, status: 'done' });
}
