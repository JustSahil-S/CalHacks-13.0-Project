// AI brain: decides, before a day runs, which customers will notice a price change,
// and makes sure Claude's answer for each of their situations is cached first.
import { ScheduleAt } from 'spacetimedb';
import { roll } from './rng';
import type { Ctx } from './sim';
import { rivalSet } from './rivals';
import { choose, orderPrice } from './choice';
import { prepareDay, usesDailyChoice } from './today';

export { orderPrice };

export const BATCH_SIZE = 10;

type AgentRow = ReturnType<Ctx['db']['agent']['iter']> extends Iterable<infer R> ? R : never;

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** What makes two situations "the same" for caching: who, which price change, mood, rival. */
export function situationKey(a: AgentRow, newCents: number, competitorSig: string): string {
  const mood = Math.round(a.satisfaction * 2) / 2;
  return `${a.key}|${a.refPriceCents}>${newCents}|m${mood}|${competitorSig}`;
}

/** The café plus the alternatives in range: part of every situation key. */
export function competitorSignature(ctx: Ctx, universeId: bigint): string {
  const cafeName = ctx.db.cafe.universeId.find(universeId)?.name ?? '?';
  const set = rivalSet(ctx, universeId);
  if (set) return `${cafeName}|${set.signature}`;
  const comp = [...ctx.db.competitor.universeId.filter(universeId)][0];
  return `${cafeName}|${comp ? `${comp.key}:${comp.priceIndex.toFixed(2)}` : 'none'}`;
}

const miles = (m: number) => `${(m / 1609).toFixed(m < 1609 ? 2 : 1)} mi`;
const priceWords = (i: number) => (i < 0.95 ? 'cheaper' : i > 1.05 ? 'pricier' : 'similar prices');

/** The alternatives a customer would weigh: the strongest rivals in range, or the single legacy rival. */
function alternatives(ctx: Ctx, universeId: bigint) {
  const set = rivalSet(ctx, universeId);
  if (set) {
    return set.rivals.length
      ? set.rivals.slice(0, 5).map(r => ({ name: r.name, distance: miles(r.distanceM), rating: r.rating, prices: priceWords(r.priceIndex) }))
      : 'no other coffee place within range';
  }
  const comp = [...ctx.db.competitor.universeId.filter(universeId)][0];
  return comp ? [{ name: comp.name, rating: comp.rating, prices: priceWords(comp.priceIndex) }] : 'none known';
}

interface Noticer {
  agent: AgentRow;
  newCents: number;
  key: string;
}

/** Customers who will walk in tomorrow and see a different price for their usual order. */
export function findNoticers(ctx: Ctx, universeId: bigint, seed: bigint, tick: number): Noticer[] {
  const u = ctx.db.universe.id.find(universeId);
  if (u && usesDailyChoice(u.brain)) {
    // Exactly the choice the day loop will make (same inputs, same dice), but only for customers
    // whose usual order changed price: nobody else can notice (control copies skip the work).
    const prices = new Map<string, number>();
    for (const m of ctx.db.menuItem.universeId.filter(universeId)) prices.set(m.key, m.priceCents);
    const changed = [...ctx.db.agent.universeId.filter(universeId)].filter(a => orderPrice(prices, a.usualOrder) !== a.refPriceCents);
    if (!changed.length) return [];
    const today = prepareDay(ctx, universeId, tick);
    if (!today) return [];
    const sig = competitorSignature(ctx, universeId);
    const out: Noticer[] = [];
    for (const a of changed) {
      if (choose(today.input(a), seed, a.key).where !== 'here') continue;
      const now = orderPrice(prices, a.usualOrder);
      out.push({ agent: a, newCents: now, key: situationKey(a, now, sig) });
    }
    return out;
  }
  const prices = new Map<string, number>();
  for (const m of ctx.db.menuItem.universeId.filter(universeId)) prices.set(m.key, m.priceCents);
  const sig = competitorSignature(ctx, universeId);
  const out: Noticer[] = [];
  for (const a of ctx.db.agent.universeId.filter(universeId)) {
    if (roll(seed, tick, a.key, 'where') >= a.pHere) continue; // same dice stepUniverse uses
    const now = orderPrice(prices, a.usualOrder);
    if (now !== a.refPriceCents) out.push({ agent: a, newCents: now, key: situationKey(a, now, sig) });
  }
  return out;
}

function customerContext(ctx: Ctx, universeId: bigint, n: Noticer) {
  const menu = new Map<string, string>();
  for (const m of ctx.db.menuItem.universeId.filter(universeId)) menu.set(m.key, m.name);
  const memories = [...ctx.db.memory.universeId.filter(universeId)]
    .filter(m => m.agentKey === n.agent.key)
    .slice(-4)
    .map(m => m.text);
  const a = n.agent;
  const changePct = a.refPriceCents > 0 ? ((n.newCents - a.refPriceCents) / a.refPriceCents) * 100 : 0;
  const changeCents = n.newCents - a.refPriceCents;
  return {
    name: a.name,
    type: a.archetype,
    caresAbout: a.cares,
    priceChange: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(0)}% (${changeCents >= 0 ? '+' : '-'}${dollars(Math.abs(changeCents))} per visit)`,
    extraPerWeekIfHabitUnchanged: dollars(Math.max(0, changeCents) * a.visitsPerWeek),
    priceSensitivity: `${a.priceSensitivity.toFixed(2)} (0 = never thinks about price, 1 = very price-conscious)`,
    visitsPerWeek: a.visitsPerWeek,
    shareOfCoffeeTripsHereUntilNow:
      a.pHere + a.pCompetitor > 0 ? +(a.pHere / (a.pHere + a.pCompetitor)).toFixed(2) : 1,
    usualOrder: (JSON.parse(a.usualOrder) as string[]).map(k => menu.get(k) ?? k),
    usualOrderUsedToCost: dollars(a.refPriceCents),
    usualOrderNowCosts: dollars(n.newCents),
    currentMood: `${a.satisfaction.toFixed(1)} out of 5`,
    otherCoffeePlacesNearby: alternatives(ctx, universeId),
    memories,
  };
}

/**
 * True if every noticer for tomorrow has a cached answer (or the universe runs on rules).
 * Otherwise queues the missing situations for Claude and returns false: the universe
 * waits a clock tick or two.
 */
export function decisionsReady(ctx: Ctx, universeId: bigint, seed: bigint, tick: number): boolean {
  const missing = findNoticers(ctx, universeId, seed, tick).filter(
    n => !ctx.db.decisionCache.situationKey.find(n.key)
  );
  if (missing.length === 0) return true;

  const fresh = missing.filter(n => !ctx.db.decisionRequest.situationKey.find(n.key));
  const seen = new Set<string>();
  const payload: { situationKey: string; context: unknown }[] = [];
  for (const n of fresh) {
    if (seen.has(n.key)) continue;
    seen.add(n.key);
    const context = customerContext(ctx, universeId, n);
    ctx.db.decisionRequest.insert({
      situationKey: n.key,
      agentKey: n.agent.key,
      contextJson: JSON.stringify(context),
    });
    payload.push({ situationKey: n.key, context });
  }
  for (let i = 0; i < payload.length; i += BATCH_SIZE) {
    ctx.db.decisionJob.insert({
      scheduledId: 0n,
      scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch),
      payloadJson: JSON.stringify(payload.slice(i, i + BATCH_SIZE)),
    });
  }
  return false;
}

// ---- The Claude call (sent by the `decide` procedure via claude.ts) ------------

export const DECISIONS_SCHEMA = {
  type: 'object',
  properties: {
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          share_here: { type: 'number' },
          frequency_multiplier: { type: 'number' },
          satisfaction_if_visit: { type: 'integer' },
          memory: { type: 'string' },
          review_if_written: { type: 'string' },
        },
        required: [
          'id',
          'share_here',
          'frequency_multiplier',
          'satisfaction_if_visit',
          'memory',
          'review_if_written',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['decisions'],
  additionalProperties: false,
};

export function buildPrompt(customers: { id: string; context: unknown }[]): string {
  return [
    'You are simulating real customers of an independent café reacting to a menu price change.',
    'Each customer below just walked in and saw that their usual order now costs a different amount.',
    'For each one, judge realistically how this person would behave on a typical day over the next two weeks.',
    'Think about their habits, how much they care about price versus other things, their memories,',
    'and the other coffee places nearby (otherCoffeePlacesNearby). Base each answer on this specific person, not on a general rule.',
    'Weigh the size of the change (priceChange, extraPerWeekIfHabitUnchanged) against their priceSensitivity.',
    'A small bump of a few percent goes mostly unnoticed. A large jump on something they buy several times',
    'a week adds up, and price-conscious people respond by switching to the competitor or coming less often,',
    'even if they like the place; loyal people who care about other things may grumble and stay.',
    '',
    'For each customer return:',
    '- share_here: of the coffee trips they make in the next two weeks, the fraction (0 to 1) that',
    '  will be to this café rather than one of the other places. Start from shareOfCoffeeTripsHereUntilNow and',
    '  change it only as much as this person would really change their behavior.',
    '- frequency_multiplier: how often they will buy coffee out compared with their usual habit',
    '  (1.0 = same as usual, 0.8 = a bit less, 0.5 = half as often, never above 1.2).',
    '- satisfaction_if_visit: 1-5, how today\'s visit feels.',
    '- memory: one first-person sentence they would remember about today.',
    '- review_if_written: one or two first-person sentences they would post if they reviewed the café now.',
    'Use the id given for each customer.',
    '',
    JSON.stringify(customers, null, 1),
  ].join('\n');
}

export interface Decision {
  pHere: number;
  pCompetitor: number;
  pSkip: number;
  satisfaction: number;
  memory: string;
  reviewText: string;
}

/**
 * Turn Claude's relative answer into daily odds anchored to the customer's real habit:
 * daily chance of buying coffee = (visits per week / 7) x frequency_multiplier,
 * split between here and the competitor by share_here.
 */
export function normalize(
  d: {
    share_here: number;
    frequency_multiplier: number;
    satisfaction_if_visit: number;
    memory: string;
    review_if_written: string;
  },
  visitsPerWeek: number
): Decision {
  const share = Math.min(1, Math.max(0, d.share_here ?? 0.5));
  const freq = Math.min(1.2, Math.max(0, d.frequency_multiplier ?? 1));
  const pVisit = Math.min(0.95, Math.max(0.02, visitsPerWeek / 7) * freq);
  return {
    pHere: pVisit * share,
    pCompetitor: pVisit * (1 - share),
    pSkip: 1 - pVisit,
    satisfaction: Math.min(5, Math.max(1, d.satisfaction_if_visit || 3)),
    memory: d.memory ?? '',
    reviewText: d.review_if_written ?? '',
  };
}
