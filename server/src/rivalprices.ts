// What nearby coffee places charge for our items. One Claude call per build: for the strongest
// rivals, the price of the closest equivalent of each of our menu items (chains from what Claude
// knows of them; independents from their Google price level, rating and the city). Customers then
// judge a rise against the neighborhood, not just against what they paid before (choice.ts risePct).
import { callClaude, type ProcCtx } from './claude';
import { pull } from './rivals';
import type { Ctx } from './sim';

// Big chains publish one national menu (or none per store); their prices are well known, so their
// estimates are already good and Mana's reads go to the independents, where estimates are guesses.
const CHAINS = /starbucks|peet'?s|philz|dunkin|mcdonald|mccaf|tim hortons|blue bottle|coffee bean|caribou|dutch bros|panera|7-eleven|krispy kreme|boba guys|tastea|sharetea|gong cha|kung fu tea|teaspoon|quickly/i;
export const isChain = (name: string) => CHAINS.test(name);

/** Fill rival_info (address, website, menu link) from the stored Google Maps results. */
export function syncRivalInfo(tx: Ctx, buildId: bigint) {
  const b = tx.db.twinBuild.id.find(buildId);
  if (!b) return;
  const names = new Map([...tx.db.rival.buildId.filter(buildId)].map(r => [r.key, r.name]));
  for (const row of [...tx.db.rivalInfo.buildId.filter(buildId)]) tx.db.rivalInfo.id.delete(row.id);
  for (const p of JSON.parse(b.competitorsJson || '[]')) {
    if (!p?.placeId) continue;
    const key = `r_${String(p.placeId).slice(-10)}`;
    const name = names.get(key);
    if (name === undefined) continue;
    names.delete(key); // once per rival
    tx.db.rivalInfo.insert({
      id: 0n,
      buildId,
      rivalKey: key,
      address: String(p.address ?? ''),
      website: String(p.website ?? ''),
      menuUrl: String(p.menu ?? ''),
      mapsUrl: String(p.url ?? ''),
      isChain: isChain(name),
    });
  }
}

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
    syncRivalInfo(tx as unknown as Ctx, buildId);
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
    // Keep prices read from real menus (in-store or delivery); re-estimate the rest.
    const read = new Set<string>();
    for (const row of [...tx.db.rivalPrice.buildId.filter(buildId)]) {
      if (row.source !== 'estimated') read.add(row.rivalKey);
      else tx.db.rivalPrice.id.delete(row.id);
    }
    for (const r of res.data.rivals ?? []) {
      if (!keys.has(r.key) || read.has(r.key)) continue;
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

const MATCH_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: { ours: { type: 'string' }, cents: { type: 'integer' }, theirs: { type: 'string' } },
        required: ['ours', 'cents', 'theirs'],
        additionalProperties: false,
      },
    },
  },
  required: ['matches'],
  additionalProperties: false,
};

/**
 * A nearby place's real menu (read by Mana's browser): match its items to ours with Claude and store
 * those prices as read ("menu"), replacing that place's estimates.
 */
export function setRivalMenu(
  ctx: ProcCtx,
  buildId: bigint,
  rivalKey: string,
  items: { name: string; price: number }[],
  sourceUrl: string,
  source: 'menu' | 'delivery' = 'menu'
): string {
  const got = ctx.withTx(tx => {
    const b = tx.db.twinBuild.id.find(buildId);
    if (!b || b.universeId === 0n) return null;
    const rival = [...tx.db.rival.buildId.filter(buildId)].find(r => r.key === rivalKey);
    if (!rival) return null;
    const menu = [...tx.db.menuItem.universeId.filter(b.universeId)].map(m => ({ key: m.key, name: m.name, cents: m.priceCents }));
    return { rival: rival.name, menu };
  });
  if (!got) return `error: no café ${buildId} with a nearby place ${rivalKey}`;
  const theirs = items
    .filter(i => i && typeof i.name === 'string' && Number(i.price) > 0)
    .slice(0, 400)
    .map(i => ({ name: i.name.slice(0, 80), cents: Math.round(Number(i.price) * 100) }));
  if (theirs.length < 3) return 'error: need at least 3 priced items';
  const prompt = [
    `Below is our café menu (keys, names, our prices in cents) and the real menu of ${got.rival}, a nearby coffee place.`,
    'For each of OUR items, find the closest equivalent on THEIR menu (same drink or food, regular size) and give',
    "their price in cents and their item's name. Skip our items they have no real equivalent for. Never invent",
    'prices that are not on their menu.',
    '',
    JSON.stringify({ ours: got.menu, theirs }),
  ].join('\n');
  const res = callClaude(ctx, prompt, MATCH_SCHEMA, 6000);
  if (!res.ok) return `error: Claude failed: ${res.error}`;
  // Trust names over numbers: take the price from their menu entry Claude named. Only if the name
  // doesn't match exactly, accept a number that is on their menu (or within 2% of one, or dollars).
  const norm = (s: string) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const ourKeys = new Set(got.menu.map(m => m.key));
  const ourByName = new Map(got.menu.map(m => [norm(m.name), m.key]));
  const theirByName = new Map(theirs.map(t => [norm(t.name), t.cents]));
  const theirPrices = theirs.map(t => t.cents);
  const priceOf = (m: any): number | null => {
    const named = theirByName.get(norm(m.theirs));
    if (named) return named;
    let c = Math.round(Number(m.cents));
    if (!Number.isFinite(c) || c <= 0) return null;
    if (c < 50 && theirPrices.includes(c * 100)) c *= 100; // dollars given as cents
    const near = theirPrices.find(p => Math.abs(p - c) <= p * 0.02);
    return near ?? null;
  };
  const raw: any[] = res.data.matches ?? [];
  const rows = new Map<string, number>();
  for (const m of raw) {
    const key = ourKeys.has(m.ours) ? m.ours : ourByName.get(norm(m.ours));
    const cents = priceOf(m);
    if (key && cents && !rows.has(key)) rows.set(key, cents);
  }
  if (rows.size) {
    ctx.withTx(tx => {
      for (const row of [...tx.db.rivalPrice.buildId.filter(buildId)]) if (row.rivalKey === rivalKey) tx.db.rivalPrice.id.delete(row.id);
      for (const [itemKey, priceCents] of rows) tx.db.rivalPrice.insert({ id: 0n, buildId, rivalKey, itemKey, priceCents, source });
    });
  }
  const n = rows.size;
  console.info(`real menu for ${got.rival} (build ${buildId}) from ${sourceUrl}: ${theirs.length} items sent, Claude matched ${raw.length}, kept ${n}`);
  return n
    ? `ok: ${n} of our items matched on ${got.rival}'s menu`
    : `error: none of our items matched ${got.rival}'s menu (${theirs.length} items received, ${raw.length} matches proposed)`;
}

const PHOTO_SCHEMA = {
  type: 'object',
  properties: {
    menuPhotos: { type: 'integer' },
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: { ours: { type: 'string' }, cents: { type: 'integer' }, seen: { type: 'string' } },
        required: ['ours', 'cents', 'seen'],
        additionalProperties: false,
      },
    },
  },
  required: ['menuPhotos', 'matches'],
  additionalProperties: false,
};

/**
 * Last resort before estimating: a nearby place's Google Maps photos. Claude finds the ones that show
 * a menu (board, printed menu, price list) and reads the prices of the closest equivalents of our
 * items. Stored as source "photo". Only prices actually visible in a photo are kept.
 */
export function readRivalPhotos(ctx: ProcCtx, buildId: bigint, rivalKey: string, imageUrls: string[]): string {
  const got = ctx.withTx(tx => {
    const b = tx.db.twinBuild.id.find(buildId);
    if (!b || b.universeId === 0n) return null;
    const rival = [...tx.db.rival.buildId.filter(buildId)].find(r => r.key === rivalKey);
    if (!rival) return null;
    const menu = [...tx.db.menuItem.universeId.filter(b.universeId)].map(m => ({ key: m.key, name: m.name, cents: m.priceCents }));
    return { rival: rival.name, menu };
  });
  if (!got) return `error: no café ${buildId} with a nearby place ${rivalKey}`;
  // Google serves thumbnails (".../photo=w408-h306-k-no"); ask for a size where menu text is legible.
  const big = (u: string) => (/googleusercontent\.com/.test(u) ? u.replace(/=[swh]\d+[^/?#]*$/, '') + '=s1500' : u); // longest side 1500 px (Claude allows 2000 with many images)
  const urls = imageUrls.filter(u => /^https?:\/\//.test(u)).slice(0, 25).map(big);
  if (!urls.length) return 'error: no photos';
  const content: object[] = [
    ...urls.map(url => ({ type: 'image', source: { type: 'url', url } })),
    {
      type: 'text',
      text: [
        `These are customer and owner photos of ${got.rival}, a coffee place, from Google Maps.`,
        'Some may show its menu: a menu board, a printed menu, a price list or price tags. Ignore photos of food,',
        'drinks, people or the room. From the menu photos only, find the closest equivalent of each of OUR items',
        '(regular size) and give its price in cents exactly as shown, plus the text you read in "seen". Skip our',
        'items whose price is not clearly visible. Never guess a price. Set menuPhotos to how many photos show a menu.',
        '',
        JSON.stringify({ ours: got.menu }),
      ].join('\n'),
    },
  ];
  const res = callClaude(ctx, content, PHOTO_SCHEMA, 4000);
  if (!res.ok) return `error: Claude failed: ${res.error.slice(0, 200)}`;
  const ours = new Map(got.menu.map(m => [m.key, m.cents]));
  const rows = new Map<string, number>();
  for (const m of res.data.matches ?? []) {
    const c = Math.round(Number(m.cents));
    const our = ours.get(m.ours);
    // Keep plausible prices only (a misread digit shouldn't make a latte $45).
    if (our && Number.isFinite(c) && c >= Math.max(50, our / 4) && c <= our * 4 && !rows.has(m.ours)) rows.set(m.ours, c);
  }
  if (rows.size) {
    ctx.withTx(tx => {
      for (const row of [...tx.db.rivalPrice.buildId.filter(buildId)]) if (row.rivalKey === rivalKey) tx.db.rivalPrice.id.delete(row.id);
      for (const [itemKey, priceCents] of rows) tx.db.rivalPrice.insert({ id: 0n, buildId, rivalKey, itemKey, priceCents, source: 'photo' });
    });
  }
  console.info(`menu photos for ${got.rival} (build ${buildId}): ${urls.length} photos, ${res.data.menuPhotos} show a menu, ${rows.size} of our items priced`);
  return rows.size
    ? `ok: ${rows.size} of our items priced from ${res.data.menuPhotos} menu photos`
    : `error: no readable prices in ${urls.length} photos (${res.data.menuPhotos} looked like a menu)`;
}
