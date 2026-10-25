// Each customer's morning: where do I get coffee today? A nested logit (McFadden): first go out
// or stay home, then, if out, our café or one of the few coffee places this person knows.
// It is calibrated so that with prices unchanged it reproduces exactly the odds the twin was built
// with (from their visits per week and loyalty). A price change then works through three channels:
//   - the dollars: a lasting change in how much they like coming;
//   - the shock: the jump against what they're used to paying, fading as they keep coming and get
//     used to the new price (a rise hurts more than an equal cut pleases: prospect theory);
//   - habit: a few days away make staying away stick, coming back rebuilds it (Guadagni & Little).
// On the day someone first sees a rise, dollars + shock move their odds of coming back by exactly
// the factor of the rule Fork used before (rise x price sensitivity x 2.5 x ease, at most -80%),
// at any size of rise. The dynamics above take it from there. When someone notices, Claude's
// judgment of that person nudges how much they like our café, and the nudge fades.
// Pure functions only: the day loop and the Claude prefetch both call choose() with the same inputs,
// so they always agree on who walks in.
import { roll } from './rng';

export const NEST = 0.5; // 0..1: lower means people who stop coming here mostly go to another café
const LOSS = 1.7; // a cut against what they're used to pleases 1/1.7 as much as an equal rise hurts
const RULE = 2.5; // the old rule's share lost per unit of (rise x price sensitivity x ease)
const RULE_MAX = 0.8; // ... capped at 80% of their visits
const CUT_RULE = 1.5; // the old rule's response to a price cut
export const ADAPT = 0.15; // each visit moves what they're used to paying 15% toward the real price
export const HABIT_DECAY = 0.9; // a habit keeps 90% of its strength per day without a visit
const HABIT_WEIGHT = 0.12;
const MOOD_WEIGHT = 0.35;
const MOOD_CALM = 4; // where everyone starts; only a worse mood than this pushes people away
const MOOD_RECOVERY = 0.97; // a bad experience fades by 3% a day away
const SHIFT_HALF_LIFE = 21; // days for Claude's nudge to halve
export const KNOWN_PLACES = 3;
const MIN_SHARE = 0.002;
// Each customer's ceiling: the largest rise on an item of their usual order they'll put up with
// (measured against the neighborhood too, see risePct), from +15% (very price-sensitive) to +40%
// (doesn't think about price); a typical customer (sensitivity ~0.3) is at about +32%. Past it, every
// extra point pushes them away hard, so demand can fall to zero and profit has a real peak. Rises of
// 15% or less are never affected. CEIL_W = 0 switches it off.
const CEIL_W = 6;
export const ceilingFor = (priceSensitivity: number) => 0.15 + 0.25 * (1 - clamp(priceSensitivity, 0, 1));

// The neighborhood: a rise that keeps us at or below what nearby places charge mostly isn't felt as
// a hike (we're still the cheaper option), only BELOW_MARKET_W of it counts, for the edge it takes off
// "cheaper than elsewhere". Past the market price it counts in full, measured from the market price.
const BELOW_MARKET_W = 0.25;

/**
 * How big a rise from `ref` to `seen` feels (a fraction, like (seen - ref) / ref), given what nearby
 * places charge (`market`, 0 = unknown). With no market or a market at or below ref, it is exactly
 * (seen - ref) / ref, so cafés without neighbor prices behave as before.
 */
export function risePct(seen: number, ref: number, market = 0): number {
  if (ref <= 0) return 0;
  if (seen <= ref || market <= ref) return (seen - ref) / ref;
  const belowMarket = (Math.min(seen, market) - ref) / ref;
  const aboveMarket = Math.max(0, seen - market) / market;
  return BELOW_MARKET_W * belowMarket + aboveMarket;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Gumbel noise from a uniform roll in [0, 1). */
export const gumbel = (u: number) => -Math.log(-Math.log(clamp(u, 1e-12, 1 - 1e-12)));

/** What a usual order costs at these prices (cents). */
export function orderPrice(prices: Map<string, number>, usualOrder: string): number {
  const keys: string[] = JSON.parse(usualOrder);
  return keys.reduce((sum, k) => sum + (prices.get(k) ?? 0), 0);
}

export interface Odds {
  pHere: number;
  pOut: number; // at another coffee place
  pSkip: number;
}

/** The odds a customer starts with: from how often they get coffee and how loyal they are. */
export function baselineOdds(visitsPerWeek: number, loyalty: number): Odds {
  const pVisit = clamp(visitsPerWeek / 7, 0.02, 0.95);
  const pHere = pVisit * (0.75 + 0.25 * loyalty);
  return { pHere, pOut: pVisit - pHere, pSkip: 1 - pVisit };
}

export interface Place {
  key: string;
  weight: number; // rivals.ts pull: rating, distance and price
}

/**
 * The coffee places this person knows: a pull-weighted draw without replacement from the places
 * in range. A pure function of (person, place list), memoized under placesSig, the list's name.
 */
const knownMemo = new Map<string, string[]>();
export function knownPlaces(agentKey: string, places: Place[], placesSig = '', k = KNOWN_PLACES): string[] {
  const memoKey = placesSig ? `${agentKey}|${placesSig}` : '';
  const hit = memoKey ? knownMemo.get(memoKey) : undefined;
  if (hit) return hit;
  const known = places
    .map(p => ({ key: p.key, s: Math.log(Math.max(p.weight, 1e-12)) + gumbel(roll(0n, 0, agentKey, `know:${p.key}`)) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map(x => x.key);
  if (memoKey) {
    if (knownMemo.size > 50000) knownMemo.clear();
    knownMemo.set(memoKey, known);
  }
  return known;
}

/** What a customer carries from day to day. */
export interface ChoiceState {
  habitHere: number; // smoothed count of recent visits here
  habitOut: number; // ... and to other coffee places
  habitTick: number; // day the habit numbers were last brought up to date
  baseCents: number; // what their usual order cost before the experiment
  anchorCents: number; // what they're used to paying for it
  shift: number; // Claude's nudge to how much they like our café (utility units)
  shiftTick: number;
  lastHereTick: number;
}

export function initialState(base: Odds, priceCents: number, tick: number): ChoiceState {
  return {
    habitHere: base.pHere / (1 - HABIT_DECAY),
    habitOut: base.pOut / (1 - HABIT_DECAY),
    habitTick: tick,
    baseCents: priceCents,
    anchorCents: priceCents,
    shift: 0,
    shiftTick: tick,
    lastHereTick: tick,
  };
}

export interface DayIn {
  tick: number;
  base: Odds;
  priceSensitivity: number;
  satisfaction: number;
  seenPriceCents: number; // the price they believe it is now (what they saw last time)
  ease: number; // rivals.ts switchingEase: how easy leaving is given the rivals in range
  overCeiling?: number; // how far the largest item rise they've seen is past their ceiling (0 = within it)
  marketCents?: number; // what their usual order costs at the places they know (0/undefined = unknown)
  places: Place[]; // the places they know that are in range (weights)
  state: ChoiceState;
}

export interface DayOdds extends Odds {
  vHere: number;
  vPlaces: number[]; // same order as DayIn.places
  pOutAll: number; // going out at all (here or elsewhere)
}

/** The baseline utilities: with them, the nested logit gives exactly the starting odds. */
interface Calibrated {
  pHere0: number;
  po0: number; // going out at all
  hereInNest: number;
  vHere0: number;
  vPlaces0: number[];
  outSum: number; // sum over other places of e^(V/NEST)
}

function calibrate(base: Odds, places: Place[]): Calibrated {
  let pHere0 = Math.max(base.pHere, MIN_SHARE);
  let pOut0 = places.length ? Math.max(base.pOut, MIN_SHARE) : 0;
  let pSkip0 = Math.max(base.pSkip + (places.length ? 0 : base.pOut), MIN_SHARE);
  const total = pHere0 + pOut0 + pSkip0;
  pHere0 /= total;
  pOut0 /= total;
  pSkip0 /= total;
  const po0 = pHere0 + pOut0;
  const iv0 = Math.log(po0 / pSkip0);
  const hereInNest = pHere0 / po0;
  const wsum = places.reduce((s, p) => s + Math.max(p.weight, 1e-12), 0);
  const vPlaces0 = places.map(p => NEST * Math.log((pOut0 / po0) * (Math.max(p.weight, 1e-12) / wsum)) + iv0);
  return {
    pHere0,
    po0,
    hereInNest,
    vHere0: NEST * Math.log(hereInNest) + iv0,
    vPlaces0,
    outSum: vPlaces0.reduce((s, v) => s + Math.exp(v / NEST), 0),
  };
}

/** P(here) when only our café's utility moves by `delta` from the baseline. */
function pHereAt(c: Calibrated, delta: number): number {
  const a = Math.exp((c.vHere0 + delta) / NEST);
  const s = a + c.outSum;
  const iv = NEST * Math.log(s);
  return (a / s) / (1 + Math.exp(-iv));
}

/**
 * The utility drop on our café alone that scales P(here) by `factor` (0 < factor <= 1), solved
 * exactly by bisection (P(here) falls steadily as the drop grows). Memoized: the same few
 * customers and prices come up over and over.
 */
const dropMemo = new Map<string, number>();
function dropFor(c: Calibrated, factor: number): number {
  if (factor >= 1) return 0;
  // Exact key: a memo hit must equal a fresh solve, or the prefetch and the day loop could disagree.
  const key = `${c.vHere0}|${c.outSum}|${c.pHere0}|${factor}`;
  const hit = dropMemo.get(key);
  if (hit !== undefined) return hit;
  const target = c.pHere0 * factor;
  let lo = 0;
  let hi = 40;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (pHereAt(c, -mid) > target) lo = mid;
    else hi = mid;
  }
  if (dropMemo.size > 100000) dropMemo.clear();
  dropMemo.set(key, (lo + hi) / 2);
  return (lo + hi) / 2;
}

/** d ln P(here) / d V(here) at the baseline (nested logit). */
const sensitivity = (c: Calibrated) => (1 / NEST) * (1 - c.hereInNest) + c.hereInNest * (1 - c.po0);

/**
 * The utility effect of paying `seen` when the reference is `ref` (both cents): for a rise, the
 * drop that cuts P(here) by the old rule's factor; for a cut, the old rule's (smaller) gain.
 */
function priceEffect(c: Calibrated, d: DayIn, seen: number, ref: number): number {
  if (ref <= 0 || seen === ref) return 0;
  const pct = risePct(seen, ref, d.marketCents ?? 0);
  if (pct === 0) return 0;
  if (pct > 0) return -dropFor(c, 1 - clamp(pct * d.priceSensitivity * RULE * d.ease, 0, RULE_MAX));
  return (-pct * d.priceSensitivity * CUT_RULE * d.ease) / sensitivity(c);
}

/** Today's probabilities and utilities. With no change and settled habits, equals the baseline. */
export function dayOdds(d: DayIn): DayOdds {
  const c = calibrate(d.base, d.places);

  // Price: half of the effect against what they paid before (lasting), half against what they're
  // used to paying (fades as the anchor catches up). On the first day both references are the old
  // price, so the two halves add up to the old rule exactly; a cut's shock counts 1/LOSS.
  const seen = d.seenPriceCents;
  const lasting = 0.5 * priceEffect(c, d, seen, d.state.baseCents);
  const shockRaw = 0.5 * priceEffect(c, d, seen, d.state.anchorCents);
  const price = lasting + (shockRaw > 0 ? shockRaw / LOSS : shockRaw);

  // Habit: yesterday evening's stock against what's normal for them (initialState's level).
  const decay = Math.pow(HABIT_DECAY, Math.max(0, d.tick - 1 - d.state.habitTick));
  const habitHere = HABIT_WEIGHT * (d.state.habitHere * decay - d.base.pHere / (1 - HABIT_DECAY));
  const habitOut = HABIT_WEIGHT * (d.state.habitOut * decay - d.base.pOut / (1 - HABIT_DECAY));

  // Mood: only a worse-than-normal experience here counts, and it fades while they stay away.
  let mood = 0;
  if (d.satisfaction < MOOD_CALM) {
    const away = Math.max(0, d.tick - d.state.lastHereTick);
    mood = MOOD_WEIGHT * (d.satisfaction - MOOD_CALM) * Math.pow(MOOD_RECOVERY, away);
  }
  const shift = d.state.shift * Math.pow(0.5, Math.max(0, d.tick - d.state.shiftTick) / SHIFT_HALF_LIFE);

  const ceiling = -CEIL_W * Math.max(0, d.overCeiling ?? 0);
  const vHere = c.vHere0 + price + ceiling + habitHere + mood + shift;
  const vPlaces = c.vPlaces0.map(v => v + habitOut);

  // Nested logit: P(out) = e^IV / (e^IV + 1), P(here | out) = e^(V/mu) / sum e^(V/mu).
  const scaled = [vHere / NEST, ...vPlaces.map(v => v / NEST)];
  const top = Math.max(...scaled);
  const sum = scaled.reduce((s, x) => s + Math.exp(x - top), 0);
  const iv = NEST * (top + Math.log(sum));
  const pOutAll = 1 / (1 + Math.exp(-iv));
  const pHereNest = Math.exp(scaled[0] - top) / sum;
  return { pHere: pOutAll * pHereNest, pOut: pOutAll * (1 - pHereNest), pSkip: 1 - pOutAll, vHere, vPlaces, pOutAll };
}

/**
 * The shared "going out" shock of a nested logit (Cardell 1997): mu * ln(S), S positive stable with
 * index mu (Kanter's formula). Added to every going-out option, it makes the person's whole draw a
 * proper random-utility draw with exactly the nested-logit probabilities.
 */
function nestShock(u1: number, u2: number): number {
  const a = NEST;
  const t = Math.PI * clamp(u1, 1e-9, 1 - 1e-9);
  const w = -Math.log(clamp(u2, 1e-12, 1 - 1e-12));
  const A =
    (Math.pow(Math.sin(a * t), a / (1 - a)) * Math.sin((1 - a) * t)) / Math.pow(Math.sin(t), 1 / (1 - a));
  return a * Math.log(Math.pow(A / w, (1 - a) / a));
}

/**
 * Where this customer goes today: 'here', 'home', or a rival key. Each person-day gets one fixed set
 * of random tastes for every option, shared by the same copy of every option of an experiment. So a
 * price change at our café can only move people who would otherwise have come here.
 */
export function choose(d: DayIn, seed: bigint, agentKey: string): { where: string; odds: DayOdds } {
  const odds = dayOdds(d);
  const r = (purpose: string) => roll(seed, d.tick, agentKey, purpose);
  const shock = nestShock(r('nest:a'), r('nest:b'));
  let where = 'home';
  let best = gumbel(r('g:home')); // staying home has utility 0 plus its own taste
  const here = odds.vHere + NEST * gumbel(r('g:here')) + shock;
  if (here > best) [best, where] = [here, 'here'];
  d.places.forEach((p, i) => {
    const u = odds.vPlaces[i] + NEST * gumbel(r(`g:${p.key}`)) + shock;
    if (u > best) [best, where] = [u, p.key];
  });
  return { where, odds };
}

/** Bring habits up to date after today's choice; a visit here also nudges what they're used to paying. */
export function afterDay(s: ChoiceState, where: string, tick: number, paidCents: number): ChoiceState {
  const decay = Math.pow(HABIT_DECAY, Math.max(0, tick - s.habitTick));
  const here = where === 'here';
  return {
    ...s,
    habitHere: s.habitHere * decay + (here ? 1 : 0),
    habitOut: s.habitOut * decay + (!here && where !== 'home' ? 1 : 0),
    habitTick: tick,
    anchorCents: here ? s.anchorCents + ADAPT * (paidCents - s.anchorCents) : s.anchorCents,
    lastHereTick: here ? tick : s.lastHereTick,
  };
}

/**
 * Blend Claude's judgment of this person into the model. `tomorrow` is their input for tomorrow
 * (state after today's visit). The new nudge replaces any earlier one: it is solved so that their
 * odds of coming land halfway (log scale) between the model on its own and Claude's estimate.
 */
export function withClaude(tomorrow: DayIn, claudePHere: number, tick: number): ChoiceState {
  const at = (shift: number) => dayOdds({ ...tomorrow, state: { ...tomorrow.state, shift, shiftTick: tomorrow.tick } }).pHere;
  const model = at(0);
  const ratio = clamp(claudePHere / Math.max(model, 1e-4), 0.2, 5);
  const target = model * Math.sqrt(ratio);
  let lo = -12;
  let hi = 12;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) < target) lo = mid;
    else hi = mid;
  }
  // Stored so that it is exactly this strong tomorrow, then fades.
  const shift = (lo + hi) / 2;
  return { ...tomorrow.state, shift: shift * Math.pow(2, (tomorrow.tick - tick) / SHIFT_HALF_LIFE), shiftTick: tick };
}
