// Getting a café's real menu without anyone typing it:
//   1. Search Google for "<café> <city> menu" and rank the results that are really this café:
//      its online-ordering page, its own menu page, Google's menu link, then its website.
//   2. Crawl the best one and have Claude read items and prices (menu images and PDFs too);
//      if a page yields nothing priced, try the next (up to 4 pages).
//   3. If none works, Claude builds a clearly labeled estimate from what reviewers mention
//      and the café's price level. (Mana's browser agent can later replace it with the real one.)
import { callClaude, type ProcCtx } from './claude';
import type { Place, Review } from './pipeline';

export const MENU_CRAWLER = 'apify~website-content-crawler';

// The SpacetimeDB module runtime has no URL class, so these do the little URL work we need.
export function hostOf(url: string): string {
  return /^https?:\/\/([^/?#]+)/i.exec(url ?? '')?.[1]?.toLowerCase() ?? '';
}

export function resolveUrl(src: string, base: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  const origin = /^https?:\/\/[^/?#]+/i.exec(base)?.[0];
  if (!origin) return '';
  if (src.startsWith('/')) return origin + src;
  const dir = base.split(/[?#]/)[0].replace(/[^/]*$/, '');
  return dir + src;
}
export const SEARCH_ACTOR = 'apify~google-search-scraper';

/** The city in a Google Maps address ("street, City, ST 12345[, Country]"). */
export function cityOf(address: string): string {
  const parts = (address ?? '').split(',').map(x => x.trim()).filter(Boolean);
  const stateZip = parts.findIndex(x => /^[A-Z]{2}\s+\d{5}/.test(x));
  if (stateZip > 0) return parts[stateZip - 1];
  if (parts.length >= 3 && /^(usa|us|united states)$/i.test(parts[parts.length - 1])) return parts[parts.length - 3];
  return parts.length >= 2 ? parts[parts.length - 2] : '';
}

/** Search Google for the café's menu: priced menus often live on an ordering page, not the homepage. */
export function menuSearchInput(place: Place) {
  const queries = `${place.title} ${cityOf(place.address ?? '')} menu`.replace(/\s+/g, ' ');
  return { queries, maxPagesPerQuery: 1, countryCode: 'us', languageCode: 'en' };
}

// Online-ordering platforms a café runs itself list every item at (about) in-store prices.
const ORDERING = /toasttab\.com|square\.site|squareup\.com|order\.online|chownow\.com|clover\.com|spoton\.com|olo\.com|menufy\.com|popmenu\.com|bentobox|^https?:\/\/(www\.)?orders?\./i;
// Delivery marketplaces (prices usually marked up) and third-party menu sites (often stale or blocked).
const DELIVERY = /doordash\.com|ubereats\.com|grubhub\.com|seamless\.com|postmates\.com|fantuan|hungrypanda|ricepo|chowbus|caviar\.com/i;
const THIRD_PARTY = /res-discover\.com|allmenus\.com|menupages\.com|menupix\.com|sirved\.com|zmenu\.com|restaurantji\.com|menuweb|singlemenu|menu-world|shopcoffee\.com/i;
const SKIP = /google\.|yelp\.|instagram\.|facebook\.|tripadvisor\.|tiktok\.|reddit\.|x\.com|twitter\./i;

/** How good a search result looks as a menu page: ordering page > their own menu page > menu sites > delivery apps. */
export function menuUrlScore(url: string, website: string): number {
  const own = hostOf(website).replace(/^www\./, '');
  if (!url.startsWith('http') || SKIP.test(url)) return 0;
  if (DELIVERY.test(url) || THIRD_PARTY.test(url)) return 1;
  if (ORDERING.test(url)) return 6;
  const path = url.replace(/^https?:\/\/[^/?#]+/i, '').split(/[?#]/)[0];
  if (own && hostOf(url).endsWith(own)) {
    // Their own site: a menu page, or the homepage (crawled more widely for menu links). Other
    // pages of it (careers, stockists, about) aren't worth a crawl.
    if (/menu/i.test(path)) return 5;
    return path === '' || path === '/' ? 2 : 0;
  }
  if (/menu/i.test(url)) return 3;
  return 0;
}

const fold = (x: string) =>
  (x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const CORPORATE = new Set(['co', 'company', 'llc', 'inc', 'the', 'and', 'ltd']);
const GENERIC = new Set(['coffee', 'cafe', 'caffe', 'espresso', 'roasters', 'roastery', 'roasting', 'bakery', 'tea', 'house', 'shop', 'kitchen', 'bar', 'bread']);

/**
 * Is this search result about this café (not a namesake elsewhere)? Every word of its name must
 * appear in the result's title, URL or snippet, or at least the distinctive words plus the city.
 */
export function matchesCafe(r: { url?: string; title?: string; description?: string }, place: Place): boolean {
  const hay = fold(`${r.title ?? ''} ${r.url ?? ''} ${r.description ?? ''}`);
  const words = (place.title ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(w => w.length > 2 && !CORPORATE.has(w));
  if (!words.length) return false;
  if (words.every(w => hay.includes(w))) return true;
  const distinctive = words.filter(w => !GENERIC.has(w));
  const city = fold(cityOf(place.address ?? ''));
  return distinctive.length > 0 && distinctive.every(w => hay.includes(w)) && !!city && hay.includes(city);
}

/**
 * Menu pages worth crawling, best first (at most 4): search results that are this café,
 * Google's own menu link for the place, and finally the café's website.
 */
export function menuCandidates(results: { url: string; title?: string; description?: string }[], place: Place): string[] {
  const website = place.website ?? '';
  const own = hostOf(website).replace(/^www\./, '');
  const scored: { url: string; score: number; rank: number }[] = [];
  results.forEach((r, rank) => {
    // Google tags result links with a tracking id; it isn't part of the page.
    const url = (r.url ?? '').replace(/([?&])srsltid=[^&#]*&?/, '$1').replace(/[?&]$/, '');
    const ownSite = !!own && hostOf(url).endsWith(own);
    if (!ownSite && !matchesCafe(r, place)) return;
    const score = menuUrlScore(url, website);
    if (score > 0) scored.push({ url, score, rank });
  });
  // Google's menu link belongs to this exact place: trust it, ranked by what kind of page it is.
  if (place.menu?.startsWith('http')) {
    scored.push({ url: place.menu, score: Math.max(menuUrlScore(place.menu, website), 2) + 0.5, rank: -1 });
  }
  // Their own website, unless a page of it already made the list: above delivery and third-party pages.
  if (website.startsWith('http') && !scored.some(x => own && hostOf(x.url).endsWith(own))) {
    scored.push({ url: website, score: 2, rank: results.length });
  }
  scored.sort((a, b) => b.score - a.score || a.rank - b.rank);
  const urls: string[] = [];
  for (const x of scored) if (!urls.includes(x.url)) urls.push(x.url);
  return urls.slice(0, 4);
}

/** Best menu page among search results (the build crawls menuCandidates in this order). */
export function pickMenuUrl(results: { url: string; title?: string; description?: string }[], place: Place): string {
  return menuCandidates(results, place)[0] ?? '';
}

export const isDeliveryUrl = (url: string) => DELIVERY.test(url);
export const isThirdPartyUrl = (url: string) => THIRD_PARTY.test(url);

export interface MenuItemIn {
  key: string;
  name: string;
  category: string;
  priceCents: number;
}

export function menuCrawlInput(url: string, isMenuLink: boolean) {
  return {
    startUrls: [{ url }],
    // Ordering pages (Toast, Square...) build the menu with JavaScript, so always use a real
    // browser (adaptive mode can fall back to a plain fetch and see no items).
    crawlerType: 'playwright:firefox',
    htmlTransformer: 'none', // the readability filter strips product grids
    // A menu link is the page itself; a homepage may link to a menu or order page one hop away.
    maxCrawlDepth: isMenuLink ? 0 : 1,
    maxCrawlPages: isMenuLink ? 1 : 5,
    includeUrlGlobs: isMenuLink ? [] : [{ glob: '**/*menu*' }, { glob: '**/*order*' }, { glob: '**/*food*' }, { glob: '**/*drink*' }],
    saveMarkdown: true,
    saveHtml: true,
    removeElementsCssSelector: 'nav, footer, script, style, noscript, svg',
    dynamicContentWaitSecs: 15,
    maxScrollHeightPixels: 8000,
  };
}

/** Image and PDF links on the page that look like a menu. */
function menuAssets(pages: { url: string; html?: string }[]): { kind: 'image' | 'document'; url: string }[] {
  const out: { kind: 'image' | 'document'; url: string }[] = [];
  const seen = new Set<string>();
  const abs = resolveUrl;
  for (const page of pages) {
    const html = page.html ?? '';
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)) {
      const url = abs(m[1], page.url);
      if (url && !seen.has(url) && /menu|drink|food|cafe|coffee/i.test(m[1] + m[2])) {
        seen.add(url);
        out.push({ kind: 'document', url });
      }
    }
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const src = tag.match(/\s(?:data-src|src)=["']([^"']+)["']/i)?.[1] ?? '';
      const alt = tag.match(/\salt=["']([^"']*)["']/i)?.[1] ?? '';
      if (!src || src.startsWith('data:') || !/menu/i.test(src + alt)) continue;
      const url = abs(src, page.url);
      if (url && /^https:/.test(url) && !seen.has(url)) {
        seen.add(url);
        out.push({ kind: 'image', url });
      }
    }
  }
  return out.slice(0, 3);
}

const MENU_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'number' },
        },
        required: ['name', 'category', 'price'],
        additionalProperties: false,
      },
    },
    note: { type: 'string' },
  },
  required: ['items', 'note'],
  additionalProperties: false,
};

const MENU_RULES = [
  'Return up to 14 items: the things customers most often order at a café (coffee and espresso drinks,',
  'tea, a few pastries or food items; coffee beans only if the place sells them).',
  'Use the in-store price in US dollars for a regular or medium size. One entry per item, no duplicate sizes.',
  'category is one of: coffee, tea, other drink, pastry, food, retail.',
  'note: one short sentence on where the prices came from.',
].join('\n');

// Reading a real menu page: keep the everyday core rather than whatever the page features first.
const READ_RULES = [
  'Return up to 30 items, in this priority: every everyday coffee and espresso drink they sell (drip/brewed',
  'coffee, espresso, americano, latte, cappuccino, mocha, cold brew, iced versions), their teas and chai, then',
  'the pastries and food people most commonly order. Seasonal or signature specials only if there is room.',
  'Skip whole loaves, bulk or catering items, bags of beans, merchandise, add-ons and modifiers.',
  'Use the price for a regular or medium size (one entry per item, no duplicate sizes).',
  'category is one of: coffee, tea, other drink, pastry, food, retail.',
  'note: one short sentence on where the prices came from.',
].join('\n');
const READ_MAX = 30;

/** Page text for Claude: markdown without image and link addresses, which crowd out the menu. */
function pageText(p: { markdown?: string; text?: string }): string {
  return (p.markdown || p.text || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

function toItems(raw: { name: string; category: string; price: number }[], cap = 14): MenuItemIn[] {
  const used = new Set<string>();
  const items: MenuItemIn[] = [];
  for (const r of raw ?? []) {
    const cents = Math.round((r.price ?? 0) * 100);
    if (!r.name || cents < 50 || cents > 6000) continue;
    let key = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30) || 'item';
    while (used.has(key)) key += '_';
    used.add(key);
    items.push({ key, name: r.name.trim().slice(0, 60), category: r.category || 'menu', priceCents: cents });
  }
  return items.slice(0, cap);
}

/** A real menu read elsewhere (e.g. by Mana's browser agent): same cleaning, a fuller list. */
export const REAL_MENU_MAX = 60;
export function realMenuItems(raw: { name: string; category: string; price: number }[]): MenuItemIn[] {
  return toItems(raw, REAL_MENU_MAX);
}

/** Read the menu from crawled pages (text + menu images/PDFs). */
export function readMenuFromPages(
  ctx: ProcCtx,
  pages: { url: string; markdown?: string; text?: string; html?: string }[],
  place: Place
): { items: MenuItemIn[]; note: string; usedAssets: number; error: string } {
  const text = pages
    .map(p => `# ${p.url}\n${pageText(p).slice(0, 60000)}`)
    .join('\n\n')
    .slice(0, 90000);
  const assets = menuAssets(pages);
  if (text.trim().length < 80 && !assets.length) return { items: [], note: '', usedAssets: 0, error: 'menu page had no readable content' };
  const content: any[] = [
    {
      type: 'text',
      text: [
        `Below is the online menu or ordering page of ${place.title} (${place.address ?? ''}).`,
        assets.length ? 'Menu images or PDFs from the page are attached too; read prices from them as well.' : '',
        'Extract the menu with prices. If no prices are visible anywhere, return an empty items list.',
        READ_RULES,
        '',
        text,
      ].join('\n'),
    },
    ...assets.map(a =>
      a.kind === 'image'
        ? { type: 'image', source: { type: 'url', url: a.url } }
        : { type: 'document', source: { type: 'url', url: a.url } }
    ),
  ];
  const res = callClaude(ctx, content, MENU_SCHEMA, 8000);
  if (!res.ok && assets.length) {
    // An attached image/PDF Claude couldn't fetch shouldn't sink the whole read: retry text-only.
    const retry = callClaude(ctx, [content[0]], MENU_SCHEMA, 8000);
    return { items: retry.ok ? toItems(retry.data.items, READ_MAX) : [], note: retry.ok ? retry.data.note : '', usedAssets: 0, error: retry.error };
  }
  return { items: res.ok ? toItems(res.data.items, READ_MAX) : [], note: res.ok ? res.data.note : '', usedAssets: assets.length, error: res.error };
}

/** A review cut to ~300 characters, keeping every sentence that names a price. */
function snippet(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= 300 || !/\$\s?\d/.test(t)) return t.slice(0, 300);
  const priced = (t.match(/[^.!?]*\$\s?\d[^.!?]*[.!?]?/g) ?? []).map(x => x.trim()).join(' … ');
  return `${t.slice(0, 120)} … ${priced}`.slice(0, 420);
}

/** Last resort: a typical menu for this café, estimated from reviews and price level. Labeled as an estimate. */
export function estimateMenu(ctx: ProcCtx, place: Place, reviews: Review[]): { items: MenuItemIn[]; note: string; error: string } {
  const mentions = reviews
    .filter(r => /\$\s?\d|latte|espresso|cappuccino|mocha|drip|cold brew|matcha|chai|croissant|pastr|scone|muffin|bagel|toast|sandwich/i.test(r.text))
    .slice(-60)
    .map(r => snippet(r.text));
  const prompt = [
    `Estimate the everyday menu of ${place.title}, a ${place.categoryName ?? 'café'} at ${place.address ?? 'an unknown address'}.`,
    `Google price level: ${place.price ?? 'unknown'}. Its real menu could not be read online.`,
    'Use the items and any prices customers mention in the reviews below; fill gaps with prices typical for',
    'a café like this in this city today.',
    MENU_RULES,
    'In note, say plainly that this is an estimate.',
    '',
    JSON.stringify(mentions),
  ].join('\n');
  const res = callClaude(ctx, prompt, MENU_SCHEMA, 6000);
  return { items: res.ok ? toItems(res.data.items) : [], note: res.ok ? res.data.note : '', error: res.error };
}
