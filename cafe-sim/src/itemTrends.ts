export type CatalogItem = {
  placeId: string;
  storeName: string;
  name: string;
  section: string;
  priceCents: number;
};

export type Profile = {
  agentId: number;
  placeId: string;
  name: string;
  archetype: string;
  backstory: string;
  typicalOrder: string;
  priceSensitivity: number;
  foodWeight: number;
  representsCustomers: number;
};

export type SellerMatch = {
  placeId: string;
  storeName: string;
  name: string;
  priceCents: number;
  similarity: number;
};

export type DemandMatch = {
  agentId: number;
  name: string;
  archetype: string;
  placeId: string;
  priceSensitivity: number;
  represents: number;
  why: string;
};

export type ItemTrend = {
  name: string;
  priceCents: number;
  sellers: SellerMatch[];
  avgRivalCents: number | null;
  deltaVsAvg: number | null;
  cheapestRival: SellerMatch | null;
  demand: DemandMatch[];
  demandPeople: number;
  ownRegulars: number;
  rivalRegulars: number;
  summary: string;
};

const SKIP = new Set([
  "the",
  "and",
  "with",
  "for",
  "from",
  "iced",
  "hot",
  "cold",
  "large",
  "small",
  "cup",
  "pcs",
  "pc",
  "oz",
  "of",
  "st",
  "cafe",
]);

function foldText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const tokenCache = new Map<string, Set<string>>();

function nameTokens(name: string) {
  const cached = tokenCache.get(name);
  if (cached) return cached;
  const tokens = new Set(
    foldText(name)
      .replace(/\(.*?\)/g, " ")
      .replace(/\b\d+(\.\d+)?\s?(fl\.? ?oz|oz|ml|l)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((word) => word.length > 1 && !SKIP.has(word)),
  );
  tokenCache.set(name, tokens);
  return tokens;
}

function jaccard(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  const smaller = left.size <= right.size ? left : right;
  const larger = smaller === left ? right : left;
  for (const token of smaller) if (larger.has(token)) shared++;
  return shared / (left.size + right.size - shared);
}

export function nameSimilarity(a: string, b: string) {
  return jaccard(nameTokens(a), nameTokens(b));
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function signedDollars(cents: number) {
  const value = Math.round(cents / 100);
  if (value === 0) return "about even with";
  return value < 0
    ? `${dollars(Math.abs(cents))} below`
    : `${dollars(cents)} above`;
}

function similarItem(query: string, candidate: string) {
  return similarItemSets(nameTokens(query), nameTokens(candidate));
}

function profileText(profile: Profile) {
  return foldText(
    `${profile.archetype} ${profile.typicalOrder} ${profile.backstory}`,
  );
}

function demandWhy(item: string, profile: Profile) {
  const hay = profileText(profile);
  const hits = [...nameTokens(item)].filter(
    (word) => word.length > 2 && hay.includes(word),
  );
  if (hits.length) return `orders/mentions ${hits.slice(0, 3).join(", ")}`;
  if (profile.typicalOrder.trim())
    return `usual order: ${profile.typicalOrder.slice(0, 48)}`;
  return profile.archetype;
}

export function itemTrend(
  name: string,
  priceCents: number,
  homePlaceId: string,
  catalog: readonly CatalogItem[],
  profiles: readonly Profile[],
): ItemTrend | null {
  const trimmed = name.trim();
  if (trimmed.length < 3 || priceCents <= 0) return null;

  const sellers = catalog
    .filter((row) => row.placeId !== homePlaceId)
    .map((row) => ({
      placeId: row.placeId,
      storeName: row.storeName,
      name: row.name,
      priceCents: row.priceCents,
      similarity: similarItem(trimmed, row.name),
    }))
    .filter((row) => row.similarity > 0)
    .sort(
      (a, b) =>
        b.similarity - a.similarity || a.priceCents - b.priceCents,
    );

  const bestByStore = new Map<string, SellerMatch>();
  for (const seller of sellers) {
    const current = bestByStore.get(seller.placeId);
    if (!current || seller.similarity > current.similarity)
      bestByStore.set(seller.placeId, seller);
  }
  const uniqueSellers = [...bestByStore.values()].slice(0, 6);
  const avgRivalCents =
    uniqueSellers.length === 0
      ? null
      : Math.round(
          uniqueSellers.reduce((sum, row) => sum + row.priceCents, 0) /
            uniqueSellers.length,
        );
  const deltaVsAvg =
    avgRivalCents == null ? null : priceCents - avgRivalCents;
  const cheapestRival =
    uniqueSellers.length === 0
      ? null
      : uniqueSellers.reduce((best, row) =>
          row.priceCents < best.priceCents ? row : best,
        );

  const itemTokens = [...nameTokens(trimmed)].filter((word) => word.length > 2);
  const demand = profiles
    .map((profile) => {
      const hay = profileText(profile);
      const hits = itemTokens.filter((word) => hay.includes(word));
      if (hits.length === 0) return null;
      return {
        agentId: profile.agentId,
        name: profile.name,
        archetype: profile.archetype,
        placeId: profile.placeId,
        priceSensitivity: profile.priceSensitivity,
        represents: profile.representsCustomers,
        why: demandWhy(trimmed, profile),
      } satisfies DemandMatch;
    })
    .filter((row): row is DemandMatch => row != null)
    .sort(
      (a, b) =>
        Number(b.placeId === homePlaceId) - Number(a.placeId === homePlaceId) ||
        b.priceSensitivity - a.priceSensitivity,
    );

  const demandPeople = demand.reduce((sum, row) => sum + row.represents, 0);
  const ownRegulars = demand.filter((row) => row.placeId === homePlaceId).length;
  const rivalRegulars = demand.length - ownRegulars;

  const priceLine =
    uniqueSellers.length === 0
      ? "Nobody nearby sells this yet, so it fills a gap."
      : `${uniqueSellers.length} nearby shop${uniqueSellers.length === 1 ? "" : "s"} sell something like it (${uniqueSellers
          .slice(0, 3)
          .map(
            (row) =>
              `${row.storeName} ${row.name} ${dollars(row.priceCents)}`,
          )
          .join("; ")}). Yours is ${signedDollars(deltaVsAvg ?? 0)} the ${dollars(avgRivalCents!)} area average.`;

  const cheaper = uniqueSellers.filter(
    (row) => priceCents + 25 < row.priceCents,
  ).length;
  const pricier = uniqueSellers.filter(
    (row) => priceCents > row.priceCents + 25,
  ).length;
  const switchLine =
    uniqueSellers.length === 0
      ? ""
      : cheaper > pricier
        ? " Price-sensitive rival regulars may switch or add it."
        : pricier > cheaper
          ? " Bargain hunters stay put; loyal fans might still try it."
          : " Price is close, so only people who already want this item move.";

  const demandLine =
    demand.length === 0
      ? " No current personas mention it — only a first-try if their story fits."
      : ` ${demand.length} persona${demand.length === 1 ? "" : "s"} (~${Math.round(demandPeople)} people) already want something like this (${ownRegulars} of yours, ${rivalRegulars} at rivals). ${demand
          .slice(0, 3)
          .map((row) => `${row.name} (${row.archetype})`)
          .join("; ")}.`;

  return {
    name: trimmed,
    priceCents,
    sellers: uniqueSellers,
    avgRivalCents,
    deltaVsAvg,
    cheapestRival,
    demand,
    demandPeople,
    ownRegulars,
    rivalRegulars,
    summary: `${priceLine}${switchLine}${demandLine}`,
  };
}

export type MenuSuggestion = {
  name: string;
  section: string;
  priceCents: number;
  stores: number;
  demandPeople: number;
  why: string;
};

function alreadyOnMenu(
  name: string,
  ownFolded: Set<string>,
  ownTokens: Set<string>[],
) {
  if (ownFolded.has(foldText(name))) return true;
  const tokens = nameTokens(name);
  return ownTokens.some(
    (own) => similarItemSets(tokens, own) > 0 || jaccard(tokens, own) >= 0.45,
  );
}

function similarItemSets(left: Set<string>, right: Set<string>) {
  const sim = jaccard(left, right);
  if (sim >= 0.5) return sim;
  let shared = 0;
  for (const word of left) if (word.length > 2 && right.has(word)) shared++;
  if (shared >= 1 && sim >= 0.28) return sim;
  return 0;
}

function nicePrice(cents: number) {
  if (cents >= 1000) return Math.round(cents / 100) * 100;
  return Math.max(25, Math.round(cents / 25) * 25);
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function mostCommon<T>(values: T[], keyOf: (value: T) => string): T {
  const counts = new Map<string, { value: T; n: number }>();
  for (const value of values) {
    const key = keyOf(value);
    const current = counts.get(key);
    if (current) current.n += 1;
    else counts.set(key, { value, n: 1 });
  }
  return [...counts.values()].sort((a, b) => b.n - a.n)[0].value;
}

const GENERIC_DEMAND = new Set([
  "tea",
  "coffee",
  "latte",
  "milk",
  "drink",
  "drinks",
  "espresso",
  "cafe",
  "mocha",
  "brew",
  "soda",
  "juice",
  "water",
  "food",
  "cake",
  "pastry",
  "bread",
  "love",
  "real",
  "original",
  "classic",
  "special",
  "house",
  "new",
  "top",
  "best",
  "combo",
  "order",
  "style",
  "drip",
  "filter",
  "cup",
  "glass",
  "bottle",
  "fresh",
  "daily",
  "item",
  "menu",
  "regular",
  "minced",
  "crispy",
  "fillet",
  "chicken",
  "pork",
  "beef",
  "fish",
  "rice",
  "curry",
]);

function isCafeItem(name: string, section: string) {
  return /(tea|coffee|latte|espresso|drink|boba|matcha|chai|mocha|brew|smoothie|refresher|pastry|croissant|baklava|cake|cookie|scone|muffin|danish|bagel|chocolate|cocoa|lemonade|ade\b|milk)/i.test(
    `${name} ${section}`,
  );
}

function distinctiveTokens(name: string) {
  return [...nameTokens(name)].filter(
    (word) => word.length > 3 && !GENERIC_DEMAND.has(word),
  );
}

function suggestionDemand(
  name: string,
  profiles: readonly Profile[],
  hays: readonly string[],
) {
  const tokens = distinctiveTokens(name);
  if (tokens.length === 0) {
    return { people: 0, names: [] as string[], hits: 0 };
  }
  const hits: Profile[] = [];
  for (let i = 0; i < profiles.length; i++) {
    if (tokens.some((token) => hays[i].includes(token))) hits.push(profiles[i]);
  }
  return {
    people: hits.reduce((sum, row) => sum + row.representsCustomers, 0),
    names: hits.slice(0, 2).map((row) => row.name),
    hits: hits.length,
  };
}

function typicalPrices(values: number[]) {
  const sorted = [...values].filter((cents) => cents >= 50).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const mid = sorted[Math.floor(sorted.length / 2)];
  const kept = sorted.filter((cents) => cents <= Math.max(1600, mid * 1.8));
  return kept.length > 0 ? kept : sorted.slice(0, Math.ceil(sorted.length / 2));
}

function cleanSection(section: string, storeName: string) {
  const text = section.trim();
  if (!text) return "New items";
  if (/^from\s/i.test(text)) return "New items";
  const store = foldText(storeName).slice(0, 8);
  if (store.length > 3 && foldText(text).includes(store)) return "New items";
  return text;
}

/** Rival items you do not sell, ranked by persona demand then how many nearby cafes have them. */
export function suggestMenuGaps(
  homePlaceId: string,
  ownNames: readonly string[],
  catalog: readonly CatalogItem[],
  profiles: readonly Profile[],
  limit = 4,
): MenuSuggestion[] {
  const ownFolded = new Set(ownNames.map((name) => foldText(name)));
  const ownTokens = ownNames.map((name) => nameTokens(name));
  const hays = profiles.map((profile) => profileText(profile));
  const clusters: CatalogItem[][] = [];
  for (const item of catalog) {
    if (item.placeId === homePlaceId || item.priceCents <= 0) continue;
    if (!isCafeItem(item.name, item.section)) continue;
    if (alreadyOnMenu(item.name, ownFolded, ownTokens)) continue;
    const tokens = nameTokens(item.name);
    const hit = clusters.find(
      (cluster) => similarItemSets(nameTokens(cluster[0].name), tokens) > 0,
    );
    if (hit) hit.push(item);
    else clusters.push([item]);
  }

  return clusters
    .map((cluster) => {
      const tokensOk = cluster.filter((row) => distinctiveTokens(row.name).length > 0);
      const pool = tokensOk.length > 0 ? tokensOk : cluster;
      const canonical = mostCommon(pool, (row) => foldText(row.name));
      const name =
        canonical.name.length > 42
          ? [...pool].sort((a, b) => a.name.length - b.name.length)[0].name
          : canonical.name;
      const section = cleanSection(
        mostCommon(pool, (row) => foldText(row.section || "menu")).section,
        cluster[0].storeName,
      );
      if (!isCafeItem(name, section)) return null;
      if (distinctiveTokens(name).length === 0) return null;
      if (/(upgrade|add-?on|extra shot|substitute)/i.test(name)) return null;
      const prices = typicalPrices(pool.map((row) => row.priceCents));
      if (prices.length === 0) return null;
      const priceCents = nicePrice(median(prices));
      const stores = new Set(cluster.map((row) => row.placeId)).size;
      const demand = suggestionDemand(name, profiles, hays);
      if (demand.people <= 0 && stores < 2) return null;
      const nearby =
        stores > 1
          ? `${stores} nearby cafes sell it`
          : `sold at ${cluster[0].storeName}`;
      const why =
        demand.people > 0
          ? `~${Math.round(demand.people)} people already want this · ${nearby}${
              demand.names.length ? ` · ${demand.names.join(", ")}` : ""
            }`
          : nearby;
      return {
        name,
        section,
        priceCents,
        stores,
        demandPeople: demand.people,
        why,
        score: demand.people * 3 + demand.hits * 12 + stores * 8,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ score: _score, ...row }) => row);
}

export function trendLines(trends: ItemTrend[] | null | undefined) {
  if (!Array.isArray(trends) || trends.length === 0) return "";
  return trends.map((trend) => `${trend.name}: ${trend.summary}`).join("\n");
}

export function agentWantsTrend(
  agentId: number,
  placeId: string,
  priceSensitivity: number,
  homePlaceId: string,
  trends: ItemTrend[] | null | undefined,
) {
  if (!Array.isArray(trends)) return false;
  for (const trend of trends) {
    if (trend.demand?.some((row) => row.agentId === agentId)) return true;
    const sellsIt = trend.sellers?.some((row) => row.placeId === placeId);
    if (!sellsIt) continue;
    if (placeId === homePlaceId) return true;
    if (priceSensitivity >= 0.45) return true;
    if (
      trend.deltaVsAvg != null &&
      trend.deltaVsAvg < -25 &&
      priceSensitivity >= 0.3
    )
      return true;
  }
  return false;
}
