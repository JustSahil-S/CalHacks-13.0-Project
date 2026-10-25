// What nearby coffee places charge for our items. One Claude call per build: for the strongest
// rivals, the price of the closest equivalent of each of our menu items (chains from what Claude
// knows of them; independents from their Google price level, rating and the city). Customers then
// judge a rise against the neighborhood, not just against what they paid before (choice.ts risePct).
import { callClaude, type ProcCtx } from './claude';
import { pull } from './rivals';

const MAX_RIVALS = 12; // the places customers most likely know (knownPlaces draws by pull)

const SCHEMA = {
  type: 'object',
  properties: {
    rivals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { item: { type: 'string' }, cents: { type: 'integer' } },
              required: ['item', 'cents'],
              additionalProperties: false,
            },
          },
        },
        required: ['key', 'items'],
        additionalProperties: false,
      },
    },
  },
  required: ['rivals'],
  additionalProperties: false,
};

const DOLLARS = ['', '$', '$$', '$$$', '$$$$'];

export function priceRivals(ctx: ProcCtx, buildId: bigint): string {
  const got = ctx.withTx(tx => {
    const b = tx.db.twinBuild.id.find(buildId);
    if (!b || b.universeId === 0n) return null;
    const menu = [...tx.db.menuItem.universeId.filter(b.universeId)].map(m => ({ key: m.key, name: m.name, cents: m.priceCents }));
    const rivals = [...tx.db.rival.buildId.filter(buildId)]
      .map(r => ({ r, w: pull(r) }))
      .sort((a, b) => b.w - a.w)
      .slice(0, MAX_RIVALS)
      .map(({ r }) => ({
        key: r.key,
        name: r.name,
        category: r.category,
        miles: +(r.distanceM / 1609).toFixed(2),
        rating: r.rating,
        priceVsUs: r.priceIndex,
      }));
    return { place: JSON.parse(b.placeJson || '{}'), menu, rivals };
  });
  if (!got) return 'no twin yet';
  if (!got.menu.length || !got.rivals.length) return 'no menu or no rivals';
  const { place, menu, rivals } = got;
  const prompt = [
    `Our café: ${place.title ?? 'a café'}, ${place.address ?? ''}. Google price level: ${place.price ?? 'unknown'}.`,
    'Below are our menu items with our prices (cents), and the coffee places near us.',
    "For each nearby place, estimate what it charges today for the closest equivalent of each of our items",
    '(same drink or food, regular size). Use what you know about chains (Starbucks, Peet\'s, Philz, McDonald\'s',
    'McCafé, etc.) and their usual prices in this city; for independents, use their category, rating, the',
    '"priceVsUs" ratio (their Google price level divided by ours; 1 = same) and typical prices in this city.',
    'Skip items the place would not sell (a donut shop has no avocado toast). Do not copy our prices; give',
    'your honest estimate of theirs. Use each place\'s key and our item keys exactly.',
    '',
    JSON.stringify({ ourMenu: menu, nearby: rivals, dollarLevels: DOLLARS }),
  ].join('\n');
  const res = callClaude(ctx, prompt, SCHEMA, 8000);
  if (!res.ok) return `Claude failed: ${res.error}`;
  const keys = new Set(rivals.map(r => r.key));
  const items = new Map(menu.map(m => [m.key, m.cents]));
  let n = 0;
  ctx.withTx(tx => {
    for (const row of tx.db.rivalPrice.buildId.filter(buildId)) tx.db.rivalPrice.id.delete(row.id);
    for (const r of res.data.rivals ?? []) {
      if (!keys.has(r.key)) continue;
      for (const it of r.items ?? []) {
        const ours = items.get(it.item);
        const cents = Math.round(Number(it.cents));
        // Drop nonsense (unknown item, or a price far outside anything plausible for it).
        if (!ours || !Number.isFinite(cents) || cents < Math.max(50, ours / 4) || cents > ours * 4) continue;
        tx.db.rivalPrice.insert({ id: 0n, buildId, rivalKey: r.key, itemKey: it.item, priceCents: cents, source: 'estimated' });
        n++;
      }
    }
  });
  return `${n} prices for ${rivals.length} nearby places`;
}
