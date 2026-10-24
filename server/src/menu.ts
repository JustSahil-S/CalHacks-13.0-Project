// Getting a café's real menu without anyone typing it:
//   1. Crawl the menu link Google gives us (their site or online-ordering page) and have
//      Claude read the items and prices, including menu images and PDFs on that page.
//   2. If that finds nothing priced, Claude builds a clearly labeled estimate from what
//      reviewers mention and the café's price level.
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

/** Search Google for the café's menu: priced menus often live on an ordering page, not the homepage. */
export function menuSearchInput(place: Place) {
  const city = (place.address ?? '').split(',').slice(-3, -2)[0]?.trim() ?? '';
  return { queries: `${place.title} ${city} menu`, maxPagesPerQuery: 1, countryCode: 'us', languageCode: 'en' };
}

// Online-ordering platforms list every item with in-store prices.
const ORDERING = /toasttab\.com|square\.site|squareup\.com|order\.online|chownow\.com|clover\.com|spoton\.com|olo\.com|menufy\.com|popmenu\.com|bentobox|orders?\./i;
const DELIVERY = /doordash\.com|ubereats\.com|grubhub\.com|seamless\.com|postmates\.com/i; // prices usually marked up
const SKIP = /google\.|yelp\.|instagram\.|facebook\.|tripadvisor\.|tiktok\.|reddit\.|x\.com|twitter\./i;

/** Best menu page among search results: ordering page > their own menu page > menu sites > delivery apps. */
export function pickMenuUrl(results: { url: string; title?: string }[], website: string): string {
  const own = hostOf(website).replace(/^www\./, '');
  let best = '';
  let bestScore = 0;
  for (const r of results) {
    const url = r.url ?? '';
    if (!url.startsWith('http') || SKIP.test(url)) continue;
    let score = 0;
    if (ORDERING.test(url)) score = 6;
    else if (own && url.includes(own) && /menu/i.test(url)) score = 5;
    else if (/menu/i.test(url) && !DELIVERY.test(url)) score = 3;
    else if (own && url.includes(own)) score = 2;
    else if (DELIVERY.test(url)) score = 1;
    if (score > bestScore) {
      best = url;
      bestScore = score;
    }
  }
  return best;
}

export const isDeliveryUrl = (url: string) => DELIVERY.test(url);

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

function toItems(raw: { name: string; category: string; price: number }[]): MenuItemIn[] {
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
  return items.slice(0, 14);
}

/** Read the menu from crawled pages (text + menu images/PDFs). */
export function readMenuFromPages(
  ctx: ProcCtx,
  pages: { url: string; markdown?: string; text?: string; html?: string }[],
  place: Place
): { items: MenuItemIn[]; note: string; usedAssets: number; error: string } {
  const text = pages
    .map(p => `# ${p.url}\n${(p.markdown || p.text || '').slice(0, 15000)}`)
    .join('\n\n')
    .slice(0, 40000);
  const assets = menuAssets(pages);
  if (text.trim().length < 80 && !assets.length) return { items: [], note: '', usedAssets: 0, error: 'menu page had no readable content' };
  const content: any[] = [
    {
      type: 'text',
      text: [
        `Below is the online menu or ordering page of ${place.title} (${place.address ?? ''}).`,
        assets.length ? 'Menu images or PDFs from the page are attached too; read prices from them as well.' : '',
        'Extract the menu with prices. If no prices are visible anywhere, return an empty items list.',
        MENU_RULES,
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
  const res = callClaude(ctx, content, MENU_SCHEMA, 6000);
  if (!res.ok && assets.length) {
    // An attached image/PDF Claude couldn't fetch shouldn't sink the whole read: retry text-only.
    const retry = callClaude(ctx, [content[0]], MENU_SCHEMA, 6000);
    return { items: retry.ok ? toItems(retry.data.items) : [], note: retry.ok ? retry.data.note : '', usedAssets: 0, error: retry.error };
  }
  return { items: res.ok ? toItems(res.data.items) : [], note: res.ok ? res.data.note : '', usedAssets: assets.length, error: res.error };
}

/** Last resort: a typical menu for this café, estimated from reviews and price level. Labeled as an estimate. */
export function estimateMenu(ctx: ProcCtx, place: Place, reviews: Review[]): { items: MenuItemIn[]; note: string; error: string } {
  const mentions = reviews
    .filter(r => /\$\s?\d|latte|espresso|cappuccino|mocha|drip|cold brew|matcha|chai|croissant|pastr|scone|muffin|bagel|toast|sandwich/i.test(r.text))
    .slice(-60)
    .map(r => r.text.replace(/\s+/g, ' ').slice(0, 300));
  const prompt = [
    `Estimate the everyday menu of ${place.title}, a ${place.categoryName ?? 'café'} at ${place.address ?? 'an unknown address'}.`,
    `Google price level: ${place.price ?? 'unknown'}. Its real menu could not be found online.`,
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
