// Everything needed to decide where each customer goes on one day of one universe. The day loop
// (sim.ts) and the Claude prefetch (brain.ts) both build their inputs here, so they always agree on
// who walks in.
import { baselineOdds, ceilingFor, initialState, knownPlaces, orderPrice, type ChoiceState, type DayIn, type Place } from './choice';
import { rivalSet, switchingEase } from './rivals';
import type { Ctx } from './sim';

type AgentRow = ReturnType<Ctx['db']['agent']['iter']> extends Iterable<infer R> ? R : never;
type DayRow = ReturnType<Ctx['db']['agentDay']['iter']> extends Iterable<infer R> ? R : never;

/** "ai"/"rules" run the daily-choice model; "ai-odds"/"rules-odds" keep the original odds system. */
export const usesDailyChoice = (brain: string) => !brain.endsWith('-odds');
export const usesClaude = (brain: string) => brain.startsWith('ai');

export interface Today {
  tick: number;
  rivalRange: boolean; // false for old universes made before rivals existed (single legacy rival)
  prices: Map<string, number>;
  stateOf(a: AgentRow): ChoiceState;
  input(a: AgentRow, state?: ChoiceState, tick?: number): DayIn;
}

function menuPrices(ctx: Ctx, universeId: bigint): Map<string, number> {
  const prices = new Map<string, number>();
  for (const m of ctx.db.menuItem.universeId.filter(universeId)) prices.set(m.key, m.priceCents);
  return prices;
}

function fromRow(r: DayRow): ChoiceState {
  return {
    habitHere: r.habitHere,
    habitOut: r.habitOut,
    habitTick: r.habitTick,
    baseCents: r.baseCents,
    anchorCents: r.anchorCents,
    shift: r.shift,
    shiftTick: r.shiftTick,
    lastHereTick: r.lastHereTick,
  };
}

/** Save a customer's state (insert the first time). */
export function saveState(ctx: Ctx, a: AgentRow, s: ChoiceState) {
  const row = { agentId: a.id, universeId: a.universeId, ...s };
  if (ctx.db.agentDay.agentId.find(a.id)) ctx.db.agentDay.agentId.update(row);
  else ctx.db.agentDay.insert(row);
}

/**
 * The day before this universe's first daily-choice day. Customers without a saved state are
 * "settled" as of then, so a universe that ran earlier days under the old model starts cleanly.
 * The day loop records it on its first daily-choice day; until then (including in the prefetch for
 * that day) it is yesterday.
 */
export function choiceStart(ctx: Ctx, universeId: bigint, tick: number): number {
  return ctx.db.choiceStart.universeId.find(universeId)?.startTick ?? tick - 1;
}

export function prepareDay(ctx: Ctx, universeId: bigint, tick: number): Today | null {
  const u = ctx.db.universe.id.find(universeId);
  if (!u) return null;
  const prices = menuPrices(ctx, universeId);
  // What everyone paid before the experiment: the twin this universe was forked from.
  const basePrices = u.parentId !== 0n ? menuPrices(ctx, u.parentId) : prices;
  const start = choiceStart(ctx, universeId, tick);
  const rset = rivalSet(ctx, universeId);
  const ease = switchingEase(rset);
  const all: Place[] = rset ? rset.rivals.map(r => ({ key: r.key, weight: r.weight })) : [{ key: 'competitor', weight: 1 }];
  const byKey = new Map(all.map(p => [p.key, p]));
  // The places someone knows come from the current list (never saved), so a refreshed rival list
  // reaches everyone at once and paired copies stay in step.
  const placesSig = all.map(p => `${p.key}=${p.weight.toFixed(6)}`).join(',');
  const saved = new Map([...ctx.db.agentDay.universeId.filter(universeId)].map(r => [r.agentId, r]));
  const fresh = new Map<bigint, ChoiceState>();
  const today: Today = {
    tick,
    rivalRange: !!rset,
    prices,
    stateOf(a) {
      const row = saved.get(a.id);
      if (row) return fromRow(row);
      let s = fresh.get(a.id);
      if (!s) {
        s = initialState(baselineOdds(a.visitsPerWeek, a.loyalty), orderPrice(basePrices, a.usualOrder), start);
        fresh.set(a.id, s);
      }
      return s;
    },
    input(a, state, day = tick) {
      const st = state ?? today.stateOf(a);
      // The largest rise on an item of their usual order, once they've been in since the prices
      // changed (a visit, not their bill changing: a rise offset by a cut elsewhere still counts).
      let overCeiling = 0;
      if (st.lastHereTick > start) {
        let maxRise = 0;
        for (const k of JSON.parse(a.usualOrder) as string[]) {
          const before = basePrices.get(k) ?? 0;
          const now = prices.get(k) ?? before;
          if (before > 0) maxRise = Math.max(maxRise, (now - before) / before);
        }
        overCeiling = Math.max(0, maxRise - ceilingFor(a.priceSensitivity));
      }
      return {
        tick: day,
        base: baselineOdds(a.visitsPerWeek, a.loyalty),
        priceSensitivity: a.priceSensitivity,
        satisfaction: a.satisfaction,
        seenPriceCents: a.refPriceCents,
        ease,
        overCeiling,
        places: knownPlaces(a.key, all, placesSig)
          .map(k => byKey.get(k))
          .filter((p): p is Place => !!p),
        state: st,
      };
    },
  };
  return today;
}
