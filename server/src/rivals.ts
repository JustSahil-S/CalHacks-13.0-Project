// Competitors within a chosen radius. Each café stores every coffee place within 7 miles once;
// an experiment's radius decides which of them its customers can choose from. A rival's pull
// fades with distance and grows with its rating, so a wider radius adds options without
// pretending people cross the city for coffee.
import type { Ctx } from './sim';
import { distanceKm, type Place } from './pipeline';

export const MAX_RADIUS_M = 11265; // 7 miles
export const DEFAULT_RADIUS_M = 2414; // 1.5 miles
const PULL_FADE_M = 1200; // a rival 1.2 km away pulls ~37% as hard as one next door

export interface RivalIn {
  key: string;
  name: string;
  x: number; // meters east of the café
  y: number; // meters north of the café
  distanceM: number;
  rating: number;
  reviewsCount: number;
  priceIndex: number; // their price level relative to ours (1 = same)
  category: string;
}

/** "$$" -> 2, "$10–20" -> 2, unknown -> 2 (same rule as the twin builder). */
export function priceLevel(price: string | undefined): number {
  if (!price) return 2;
  const num = price.match(/\d+/);
  if (num) {
    const lo = Number(num[0]);
    return lo < 10 ? 1 : lo < 20 ? 2 : lo < 30 ? 3 : 4;
  }
  return Math.min(4, Math.max(1, (price.match(/\$/g) ?? []).length || 2));
}

const COFFEE = /coffee|caf[eé]|espresso|roaster|tea|bakery|donut|bagel/i;

/** Every coffee place in the scrape, nearest first, with local coordinates. */
export function rivalsFromPlaces(place: Place, places: Place[], max = 60): RivalIn[] {
  if (!place.location) return [];
  const lat0 = place.location.lat;
  const lng0 = place.location.lng;
  const mPerLat = 110540;
  const mPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ours = priceLevel(place.price);
  const seen = new Set<string>([place.placeId]);
  const out: RivalIn[] = [];
  for (const p of places) {
    if (!p.location || !p.placeId || seen.has(p.placeId)) continue;
    if (!COFFEE.test(p.categoryName ?? '')) continue;
    seen.add(p.placeId);
    const distanceM = distanceKm(place.location, p.location) * 1000;
    if (distanceM > MAX_RADIUS_M || distanceM < 5) continue;
    out.push({
      key: `r_${p.placeId.slice(-10)}`,
      name: p.title,
      x: Math.round((p.location.lng - lng0) * mPerLng * 10) / 10,
      y: Math.round((p.location.lat - lat0) * mPerLat * 10) / 10,
      distanceM: Math.round(distanceM),
      rating: p.totalScore ?? 4.2,
      reviewsCount: p.reviewsCount ?? 0,
      priceIndex: Math.round((priceLevel(p.price) / ours) * 100) / 100,
      category: p.categoryName ?? '',
    });
  }
  return out.sort((a, b) => a.distanceM - b.distanceM).slice(0, max);
}

/** How strongly a rival pulls a customer from this café. */
export function pull(r: { distanceM: number; rating: number; priceIndex: number }): number {
  const quality = Math.pow(Math.max(1, r.rating) / 4.5, 3);
  const nearness = Math.exp(-r.distanceM / PULL_FADE_M);
  const price = r.priceIndex < 0.95 ? 1.15 : r.priceIndex > 1.05 ? 0.85 : 1;
  return quality * nearness * price;
}

export interface RivalSet {
  radiusM: number;
  rivals: { key: string; name: string; distanceM: number; rating: number; priceIndex: number; weight: number }[];
  totalPull: number; // how easy it is to go elsewhere (sum of pulls)
  signature: string; // part of the AI cache key
}

/** The café build behind a universe (roots are mapped at load; copies inherit). */
export function buildOf(ctx: Ctx, universeId: bigint): bigint | null {
  return ctx.db.universeBuild.universeId.find(universeId)?.buildId ?? null;
}

/** The rivals customers in this universe can choose from, strongest pull first. */
export function rivalSet(ctx: Ctx, universeId: bigint): RivalSet | null {
  const buildId = buildOf(ctx, universeId);
  if (buildId === null) return null;
  const u = ctx.db.universe.id.find(universeId);
  const radiusM =
    (u && u.experimentId !== 0n ? ctx.db.experimentRadius.experimentId.find(u.experimentId)?.radiusM : undefined) ??
    DEFAULT_RADIUS_M;
  const rivals = [...ctx.db.rival.buildId.filter(buildId)]
    .filter(r => r.distanceM <= radiusM)
    .map(r => ({ key: r.key, name: r.name, distanceM: r.distanceM, rating: r.rating, priceIndex: r.priceIndex, weight: pull(r) }))
    .sort((a, b) => b.weight - a.weight);
  if (!rivals.length) return { radiusM, rivals, totalPull: 0, signature: `r${radiusM}:none` };
  const totalPull = rivals.reduce((s, r) => s + r.weight, 0);
  return {
    radiusM,
    rivals,
    totalPull,
    signature: `r${radiusM}:${rivals.slice(0, 3).map(r => r.key).join(',')}`,
  };
}

/** Pick which rival a customer goes to, given a uniform roll in [0, 1). */
export function chooseRival(set: RivalSet, r: number): string | null {
  if (!set.rivals.length) return null;
  let x = r * set.totalPull;
  for (const rv of set.rivals) {
    x -= rv.weight;
    if (x <= 0) return rv.key;
  }
  return set.rivals[set.rivals.length - 1].key;
}

/** How much easier switching is than with a single typical rival next door (0.3–1.4). */
export function switchingEase(set: RivalSet | null): number {
  if (!set) return 1;
  return Math.min(1.4, Math.max(0.3, set.totalPull / 0.9));
}
