// Twin pipeline: a Google Maps link becomes a real café twin, entirely inside the database.
// advanceBuild() moves one build a step forward and reschedules itself while Apify scrapes,
// so no procedure ever blocks for minutes. profileBatch() turns ~40 real reviews into
// customer profiles with Claude; batches run in parallel.
import { ScheduleAt } from 'spacetimedb';
import { callClaude, type ProcCtx } from './claude';
import { hash32 } from './rng';
import { loadTwin, type TwinInput } from './sim';
import { MAX_RADIUS_M, rivalsFromPlaces } from './rivals';
import { estimateMenu, isDeliveryUrl, MENU_CRAWLER, menuCrawlInput, menuSearchInput, pickMenuUrl, readMenuFromPages, SEARCH_ACTOR } from './menu';

const PLACES_ACTOR = 'compass~crawler-google-places';
const REVIEWS_ACTOR = 'compass~google-maps-reviews-scraper';
const PLACE_FIELDS = 'title,placeId,url,location,address,totalScore,reviewsCount,price,categoryName,openingHours,website,menu';

export const PROFILE_BATCH = 40;
export const MAX_PROFILES = 200;
export const CUSTOMERS = 200;

// ---- Apify (asynchronous runs) -------------------------------------------------

/** Apify said "too many runs right now" (free plan: 5 concurrent runs, 16 GB). Try again later. */
class ApifyBusy extends Error {}

function apify(ctx: ProcCtx, token: string, method: string, path: string, body?: unknown): any {
  const res = ctx.http.fetch(`https://api.apify.com/v2/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = res.json();
  if (!res.ok) {
    const type = json?.error?.type ?? '';
    if (res.status === 402 && /concurrent-runs-limit|memory-limit/.test(type)) throw new ApifyBusy(type);
    throw new Error(`Apify ${method} ${path.split('?')[0]}: HTTP ${res.status} ${JSON.stringify(json?.error ?? json).slice(0, 300)}`);
  }
  return json;
}

const RUN_MEMORY_MB = 2048;

function startRun(ctx: ProcCtx, token: string, actor: string, input: unknown): string {
  return apify(ctx, token, 'POST', `acts/${actor}/runs?memory=${RUN_MEMORY_MB}`, input).data.id;
}

function runStatus(ctx: ProcCtx, token: string, runId: string): { status: string; datasetId: string } {
  const d = apify(ctx, token, 'GET', `actor-runs/${runId}`).data;
  return { status: d.status, datasetId: d.defaultDatasetId };
}

function datasetItems(ctx: ProcCtx, token: string, datasetId: string, fields: string, limit: number): any[] {
  return apify(ctx, token, 'GET', `datasets/${datasetId}/items?clean=true&format=json&fields=${fields}&limit=${limit}`);
}

const stillRunning = (status: string) => status === 'READY' || status === 'RUNNING';

// ---- Shapes ------------------------------------------------------------------------

export interface Place {
  title: string;
  placeId: string;
  url: string;
  location?: { lat: number; lng: number };
  address?: string;
  totalScore?: number;
  reviewsCount?: number;
  price?: string;
  categoryName?: string;
  website?: string;
  menu?: string;
  openingHours?: { day: string; hours: string }[];
}

/** cutoffDate value meaning "only scrape reviews, don't build customers" (for finding backtest cafés). */
export const SCAN = 'scan';

export interface Review {
  date: string;
  stars: number;
  text: string;
}

interface MenuEntry {
  key: string;
  name: string;
  category?: string;
  priceCents: number;
  unitCostCents?: number;
}

interface Profile {
  i: number;
  type: string;
  visits_per_week: number;
  price_sensitivity: number;
  loyalty: number;
  usual_order: string[];
  cares: string;
  quote: string;
}

// ---- The build state machine ---------------------------------------------------------

type Patch = Record<string, unknown>;

export function advanceBuild(ctx: ProcCtx, buildId: bigint) {
  const b = ctx.withTx(tx => tx.db.twinBuild.id.find(buildId));
  if (!b || ['done', 'failed', 'profiling', 'scanned'].includes(b.status)) return;

  const update = (patch: Patch) =>
    ctx.withTx(tx => {
      const cur = tx.db.twinBuild.id.find(buildId);
      if (cur) tx.db.twinBuild.id.update({ ...cur, ...patch });
    });
  const checkBackIn = (seconds: number) =>
    ctx.withTx(tx => {
      tx.db.buildJob.insert({
        scheduledId: 0n,
        scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch + BigInt(seconds) * 1_000_000n),
        buildId,
      });
    });

  try {
    const token = ctx.env.APIFY_TOKEN;
    if (!token && b.status !== 'assembling') throw new Error('APIFY_TOKEN is not set for this database');

    if (b.status === 'queued') {
      const input = b.query.startsWith('http')
        ? { startUrls: [{ url: b.query }], maxCrawledPlacesPerSearch: 1, language: 'en' }
        : { searchStringsArray: [b.query], maxCrawledPlacesPerSearch: 1, language: 'en' };
      const runId = startRun(ctx, token!, PLACES_ACTOR, input);
      update({ status: 'place', placeRunId: runId, detail: 'Finding the café on Google Maps' });
      checkBackIn(8);
      return;
    }

    if (b.status === 'place') {
      const run = runStatus(ctx, token!, b.placeRunId);
      if (stillRunning(run.status)) return checkBackIn(8);
      if (run.status !== 'SUCCEEDED') throw new Error(`Google Maps lookup ${run.status}`);
      const place: Place | undefined = datasetItems(ctx, token!, run.datasetId, PLACE_FIELDS, 1)[0];
      if (!place?.url) throw new Error('No Google Maps place found for that link or name');

      const cutoff = b.cutoffDate === SCAN ? '' : b.cutoffDate;
      const reviewsInput: Record<string, unknown> = {
        startUrls: [{ url: place.url }],
        reviewsSort: 'newest',
        language: 'en',
        personalData: false,
        maxReviews: b.cutoffDate === SCAN ? 600 : cutoff ? 3000 : 400,
      };
      if (cutoff) reviewsInput.reviewsStartDate = monthsBefore(cutoff, 18);
      // Start each scrape once and save its run id right away, so a retry never starts it twice.
      let reviewsRunId = b.reviewsRunId;
      if (!reviewsRunId) {
        reviewsRunId = startRun(ctx, token!, REVIEWS_ACTOR, reviewsInput);
        update({ reviewsRunId, placeJson: JSON.stringify(place) });
      }
      let competitorsRunId = b.competitorsRunId;
      if (!competitorsRunId) {
        competitorsRunId =
          place.location && b.cutoffDate !== SCAN
            ? startRun(ctx, token!, PLACES_ACTOR, rivalSearchInput(place.location))
            : 'none';
        update({ competitorsRunId });
      }
      // No menu given: search Google for the café's menu (ordering pages carry real prices).
      if (b.cutoffDate !== SCAN && !hasMenu(b.menuJson) && !ctx.withTx(tx => tx.db.menuSource.buildId.find(buildId))) {
        const runId = startRun(ctx, token!, SEARCH_ACTOR, menuSearchInput(place));
        ctx.withTx(tx =>
          tx.db.menuSource.insert({
            buildId,
            status: 'searching',
            source: '',
            url: place.menu || place.website || '',
            runId,
            detail: `Searching for ${place.title}'s menu`,
          })
        );
      }
      update({
        status: 'scraping',
        placeJson: JSON.stringify(place),
        reviewsRunId,
        competitorsRunId,
        detail: `Scraping reviews${competitorsRunId === 'none' ? '' : ' and nearby cafés'} for ${place.title}`,
      });
      checkBackIn(10);
      return;
    }

    if (b.status === 'scraping') {
      const r = runStatus(ctx, token!, b.reviewsRunId);
      const c =
        b.competitorsRunId && b.competitorsRunId !== 'none'
          ? runStatus(ctx, token!, b.competitorsRunId)
          : { status: 'SUCCEEDED', datasetId: '' };
      let ms = ctx.withTx(tx => tx.db.menuSource.buildId.find(buildId));
      if (ms?.status === 'searching') {
        // Search finished? Pick the best menu page (or fall back to Google's menu link / website) and crawl it.
        const s = runStatus(ctx, token!, ms.runId);
        if (stillRunning(s.status)) return checkBackIn(8);
        const place: Place = JSON.parse(b.placeJson);
        const results = s.status === 'SUCCEEDED' ? datasetItems(ctx, token!, s.datasetId, 'organicResults', 1)[0]?.organicResults ?? [] : [];
        const picked = pickMenuUrl(results, place.website ?? '');
        const url = picked || place.menu || place.website || '';
        const runId = url ? startRun(ctx, token!, MENU_CRAWLER, menuCrawlInput(url, !!picked || !!place.menu)) : '';
        const next = {
          ...ms,
          status: url ? 'crawling' : 'none',
          url,
          runId,
          detail: url ? `Reading the menu at ${url}${isDeliveryUrl(url) ? ' (delivery app; prices may be marked up)' : ''}` : 'No menu page found online',
        };
        ctx.withTx(tx => tx.db.menuSource.buildId.update(next));
        ms = next;
      }
      const m = ms?.status === 'crawling' && ms.runId ? runStatus(ctx, token!, ms.runId) : null;
      if (stillRunning(r.status) || stillRunning(c.status) || (m && stillRunning(m.status))) return checkBackIn(10);
      if (r.status !== 'SUCCEEDED') throw new Error(`Review scrape ${r.status}`);

      const reviews: Review[] = datasetItems(ctx, token!, r.datasetId, 'text,stars,publishedAtDate', 5000)
        .filter((x: any) => x.publishedAtDate)
        .map((x: any) => ({ date: String(x.publishedAtDate).slice(0, 10), stars: x.stars ?? 0, text: x.text ?? '' }))
        .sort((x: Review, y: Review) => x.date.localeCompare(y.date));
      const competitors =
        c.status === 'SUCCEEDED' && c.datasetId ? datasetItems(ctx, token!, c.datasetId, PLACE_FIELDS, 100) : [];

      if (b.cutoffDate === SCAN) {
        update({
          status: 'scanned',
          reviewsJson: JSON.stringify(reviews),
          competitorsJson: JSON.stringify(competitors),
          detail: `Scanned ${reviews.length} reviews (${reviews[0]?.date ?? '?'} to ${reviews.at(-1)?.date ?? '?'})`,
        });
        return;
      }

      // Customers come only from reviews with real text, and (for a backtest) only from before the cutoff.
      const usable = reviews
        .filter(x => x.text.trim().length >= 30 && (!b.cutoffDate || x.date < b.cutoffDate))
        .slice(-MAX_PROFILES);
      if (usable.length < 20) {
        throw new Error(`Only ${usable.length} usable reviews${b.cutoffDate ? ' before the cutoff' : ''}; need at least 20`);
      }

      // The menu: as given (e.g. documented old prices for a backtest), read from the web, or estimated.
      const place: Place = JSON.parse(b.placeJson);
      let menuJson = b.menuJson;
      if (!hasMenu(menuJson)) {
        const beforeCutoff = reviews.filter(x => !b.cutoffDate || x.date < b.cutoffDate);
        const found = resolveMenu(ctx, token!, ms?.url ?? '', m, place, beforeCutoff);
        menuJson = JSON.stringify(found.items);
        ctx.withTx(tx => {
          const row = { buildId, status: 'ready', source: found.source, url: ms?.url ?? '', runId: ms?.runId ?? '', detail: found.detail };
          if (tx.db.menuSource.buildId.find(buildId)) tx.db.menuSource.buildId.update(row);
          else tx.db.menuSource.insert(row);
        });
        if (!hasMenu(menuJson)) throw new Error(`Could not read or estimate a menu: ${found.detail}`);
      } else if (!ms) {
        ctx.withTx(tx =>
          tx.db.menuSource.insert({
            buildId,
            status: 'ready',
            source: 'provided',
            url: '',
            runId: '',
            detail: b.cutoffDate ? `Documented prices from before ${b.cutoffDate}` : 'Entered by hand',
          })
        );
      }

      const menu: MenuEntry[] = JSON.parse(menuJson);
      const menuForPrompt = menu.map(m => ({ key: m.key, name: m.name, price: `$${(m.priceCents / 100).toFixed(2)}` }));
      const batches: { i: number; stars: number; date: string; text: string }[][] = [];
      usable.forEach((rev, i) => {
        if (i % PROFILE_BATCH === 0) batches.push([]);
        batches[batches.length - 1].push({ i, stars: rev.stars, date: rev.date, text: rev.text.slice(0, 700) });
      });

      ctx.withTx(tx => {
        for (const batch of batches) {
          tx.db.profileJob.insert({
            scheduledId: 0n,
            scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch),
            buildId,
            payloadJson: JSON.stringify({ menu: menuForPrompt, reviews: batch }),
          });
        }
        const cur = tx.db.twinBuild.id.find(buildId)!;
        tx.db.twinBuild.id.update({
          ...cur,
          status: 'profiling',
          menuJson,
          reviewsJson: JSON.stringify(reviews),
          competitorsJson: JSON.stringify(competitors),
          batchesTotal: batches.length,
          batchesDone: 0,
          detail: `Claude is reading ${usable.length} reviews (${reviews.length} scraped)`,
        });
      });
      return;
    }

    if (b.status === 'assembling') {
      const profiles: Profile[] = ctx
        .withTx(tx => [...tx.db.twinProfile.buildId.filter(buildId)])
        .map(p => JSON.parse(p.profileJson))
        .sort((x: Profile, y: Profile) => x.i - y.i);
      if (profiles.length < 10) throw new Error(`Only ${profiles.length} customer profiles came back from Claude`);
      const twin = assembleTwin(b.placeJson, b.competitorsJson, b.menuJson, profiles, b.label);
      ctx.withTx(tx => {
        const universeId = loadTwin(tx, twin);
        // Every coffee place within 7 miles, for the competitor radius.
        tx.db.universeBuild.insert({ universeId, buildId });
        for (const r of tx.db.rival.buildId.filter(buildId)) tx.db.rival.id.delete(r.id);
        for (const r of rivalsFromPlaces(JSON.parse(b.placeJson), JSON.parse(b.competitorsJson || '[]'))) {
          tx.db.rival.insert({ id: 0n, buildId, ...r });
        }
        const cur = tx.db.twinBuild.id.find(buildId)!;
        tx.db.twinBuild.id.update({
          ...cur,
          status: 'done',
          twinJson: JSON.stringify(twin),
          universeId,
          detail: `Twin ready: universe ${universeId}, ${twin.customers.length} customers from ${profiles.length} real reviewers`,
        });
        // Fetch the real neighborhood for the viewer (skipped if it already exists).
        if (!tx.db.areaMap.buildId.find(buildId)) {
          tx.db.mapJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch), buildId });
        }
      });
    }
  } catch (e) {
    if (e instanceof ApifyBusy) {
      // Free-plan limit reached: keep this stage and try again shortly.
      update({ detail: 'Waiting for a free Apify slot (free plan runs 5 at a time)' });
      checkBackIn(20);
      return;
    }
    update({ status: 'failed', detail: String(e).slice(0, 500) });
  }
}

// ---- Rivals within 7 miles ----------------------------------------------------------------

/** Coffee places within 7 miles; two searches so both "coffee shop" and "cafe" listings come back. */
function rivalSearchInput(location: { lat: number; lng: number }) {
  return {
    searchStringsArray: ['coffee shop', 'cafe'],
    customGeolocation: { type: 'Point', coordinates: [location.lng, location.lat], radiusKm: MAX_RADIUS_M / 1000 },
    maxCrawledPlacesPerSearch: 40,
    language: 'en',
  };
}

/** Re-scrape an existing build's rivals: queued -> running -> done (or failed). */
export function advanceRivalScan(ctx: ProcCtx, buildId: bigint) {
  const scan = ctx.withTx(tx => tx.db.rivalScan.buildId.find(buildId));
  const b = ctx.withTx(tx => tx.db.twinBuild.id.find(buildId));
  if (!scan || !b || scan.status === 'done' || scan.status === 'failed') return;
  const set = (patch: Partial<typeof scan>) =>
    ctx.withTx(tx => {
      const cur = tx.db.rivalScan.buildId.find(buildId);
      if (cur) tx.db.rivalScan.buildId.update({ ...cur, ...patch });
    });
  const later = (s: number) =>
    ctx.withTx(tx =>
      tx.db.rivalJob.insert({
        scheduledId: 0n,
        scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch + BigInt(s) * 1_000_000n),
        buildId,
      })
    );
  try {
    const token = ctx.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN is not set for this database');
    const place: Place = JSON.parse(b.placeJson);
    if (!place.location) throw new Error('café has no location');
    if (scan.status === 'queued') {
      const runId = startRun(ctx, token, PLACES_ACTOR, rivalSearchInput(place.location));
      set({ status: 'running', runId, detail: 'Finding coffee places within 7 miles' });
      later(10);
      return;
    }
    const run = runStatus(ctx, token, scan.runId);
    if (stillRunning(run.status)) return later(10);
    if (run.status !== 'SUCCEEDED') throw new Error(`rival search ${run.status}`);
    const places = datasetItems(ctx, token, run.datasetId, PLACE_FIELDS, 100);
    const rivals = rivalsFromPlaces(place, places);
    ctx.withTx(tx => {
      for (const r of tx.db.rival.buildId.filter(buildId)) tx.db.rival.id.delete(r.id);
      for (const r of rivals) tx.db.rival.insert({ id: 0n, buildId, ...r });
      // Map the twin (and its existing experiment copies) to this build so they use the rivals.
      const root = b.universeId;
      if (root !== 0n) {
        for (const u of tx.db.universe.iter()) {
          if ((u.id === root || u.parentId === root) && !tx.db.universeBuild.universeId.find(u.id)) {
            tx.db.universeBuild.insert({ universeId: u.id, buildId });
          }
        }
      }
      const cur = tx.db.twinBuild.id.find(buildId);
      if (cur) tx.db.twinBuild.id.update({ ...cur, competitorsJson: JSON.stringify(places) });
    });
    set({ status: 'done', detail: `${rivals.length} coffee places within 7 miles` });
  } catch (e) {
    if (e instanceof ApifyBusy) {
      set({ detail: 'Waiting for a free Apify slot' });
      later(20);
      return;
    }
    set({ status: 'failed', detail: String(e).slice(0, 400) });
  }
}

// ---- The menu ----------------------------------------------------------------------------

/** Debug: what did a build's menu crawl actually see? Returns a JSON summary. */
export function inspectMenuCrawl(ctx: ProcCtx, buildId: bigint): string {
  const token = ctx.env.APIFY_TOKEN;
  const ms = ctx.withTx(tx => tx.db.menuSource.buildId.find(buildId));
  if (!token || !ms?.runId) return JSON.stringify({ error: 'no token or no crawl run for this build' });
  const run = runStatus(ctx, token, ms.runId);
  const pages: any[] =
    run.status === 'SUCCEEDED' ? datasetItems(ctx, token, run.datasetId, 'url,markdown,text,html,crawl,metadata', 5) : [];
  return JSON.stringify({
    url: ms.url,
    runStatus: run.status,
    pages: pages.map(p => ({
      url: p.url,
      loadedUrl: p.crawl?.loadedUrl,
      title: p.metadata?.title,
      textChars: (p.text ?? '').length,
      markdownChars: (p.markdown ?? '').length,
      htmlChars: (p.html ?? '').length,
      dollarSigns: ((p.markdown || p.text || '').match(/\$\s?\d/g) ?? []).length,
      htmlDollarSigns: ((p.html ?? '').match(/\$\s?\d/g) ?? []).length,
      snippet: (p.markdown || p.text || '').replace(/\s+/g, ' ').slice(0, 700),
    })),
  });
}

export function hasMenu(menuJson: string): boolean {
  try {
    const m = JSON.parse(menuJson || '[]');
    return Array.isArray(m) && m.length > 0;
  } catch {
    return false;
  }
}

function resolveMenu(
  ctx: ProcCtx,
  token: string,
  url: string,
  crawl: { status: string; datasetId: string } | null,
  place: Place,
  reviews: Review[]
): { items: ReturnType<typeof estimateMenu>['items']; source: string; detail: string } {
  let why = url ? '' : 'No website or menu link on Google. ';
  if (crawl?.status === 'SUCCEEDED') {
    const pages = datasetItems(ctx, token, crawl.datasetId, 'url,markdown,text,html', 5);
    const read = readMenuFromPages(ctx, pages, place);
    if (read.items.length >= 3) {
      const isDrink = (c: string) => /coffee|tea|drink/i.test(c);
      // A café menu with no drinks usually means we found the food page only: add estimated drinks.
      if (read.items.filter(i => isDrink(i.category)).length < 2) {
        const est = estimateMenu(ctx, place, reviews);
        const names = new Set(read.items.map(i => i.name.toLowerCase()));
        const keys = new Set(read.items.map(i => i.key));
        const drinks = est.items.filter(i => isDrink(i.category) && !names.has(i.name.toLowerCase()) && !keys.has(i.key));
        if (drinks.length) {
          return {
            items: [...drinks.slice(0, 8), ...read.items].slice(0, 16),
            source: read.usedAssets ? 'menu photo' : 'website',
            detail: `${read.items.length} items read from ${url}; ${Math.min(8, drinks.length)} drinks estimated (the page we found had no drink prices). ${read.note}`.trim(),
          };
        }
      }
      return {
        items: read.items,
        source: read.usedAssets ? 'menu photo' : 'website',
        detail: `${read.items.length} items read from ${url}. ${read.note}`.trim(),
      };
    }
    why = `Menu page had no readable prices${read.error ? ` (${read.error.slice(0, 120)})` : ''}. `;
  } else if (crawl) {
    why = `Menu crawl ${crawl.status}. `;
  }
  const est = estimateMenu(ctx, place, reviews);
  return { items: est.items, source: 'estimated', detail: `${why}Estimated: ${est.note || est.error}`.trim() };
}

// ---- Claude reads real reviews -------------------------------------------------------

const PROFILES_SCHEMA = {
  type: 'object',
  properties: {
    reviewers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          i: { type: 'integer' },
          type: { type: 'string' },
          visits_per_week: { type: 'number' },
          price_sensitivity: { type: 'number' },
          loyalty: { type: 'number' },
          usual_order: { type: 'array', items: { type: 'string' } },
          cares: { type: 'string' },
          quote: { type: 'string' },
        },
        required: ['i', 'type', 'visits_per_week', 'price_sensitivity', 'loyalty', 'usual_order', 'cares', 'quote'],
        additionalProperties: false,
      },
    },
  },
  required: ['reviewers'],
  additionalProperties: false,
};

function profilePrompt(payload: { menu: unknown; reviews: unknown }): string {
  return [
    "You are turning a real café's public Google reviews into simulated customers.",
    'Each review below was written by one customer. For each, infer what kind of customer wrote it.',
    '',
    'Return one entry per review, using its i:',
    "- type: a short label, e.g. daily regular, student, remote worker, commuter, weekend brunch, tourist, occasional visitor.",
    '- visits_per_week: 0.1 to 7, from what the review suggests (first-timers and tourists ~0.2-0.5, "my daily spot" ~5).',
    '- price_sensitivity: 0 to 1. Complaints about price or value raise it; happily paying a premium lowers it.',
    '- loyalty: 0 to 1, how attached they seem to this café.',
    '- usual_order: 1 or 2 menu keys from the menu below that best match what they mention, or what such a person',
    '  most likely orders. Only use keys from the menu.',
    '- cares: a few words on what they value (coffee quality, price, wifi, speed, staff, vibe, food).',
    '- quote: a short phrase (max 20 words) taken from the review that captures their view. No names.',
    '',
    JSON.stringify(payload, null, 1),
  ].join('\n');
}

export function profileBatch(ctx: ProcCtx, buildId: bigint, payloadJson: string) {
  const payload = JSON.parse(payloadJson) as { menu: unknown; reviews: { i: number }[] };
  const startedMs = ctx.timestamp.toMillis();
  const res = callClaude(ctx, profilePrompt(payload), PROFILES_SCHEMA, 16000);
  const valid = new Set(payload.reviews.map(r => r.i));
  const profiles: Profile[] = res.ok ? (res.data.reviewers ?? []).filter((p: Profile) => valid.has(p.i)) : [];

  ctx.withTx(tx => {
    for (const p of profiles) {
      tx.db.twinProfile.insert({ id: 0n, buildId, reviewIndex: p.i, profileJson: JSON.stringify(p) });
    }
    tx.db.llmLog.insert({
      id: 0n,
      ok: res.ok,
      situations: profiles.length,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      startedMs,
      finishedMs: tx.timestamp.toMillis(),
      note: res.ok ? `profiles: ${profiles.length}/${payload.reviews.length}` : `profiles failed: ${res.error}`,
    });
    const cur = tx.db.twinBuild.id.find(buildId);
    if (!cur) return;
    const done = cur.batchesDone + 1;
    const allDone = done >= cur.batchesTotal;
    tx.db.twinBuild.id.update({
      ...cur,
      batchesDone: done,
      status: allDone ? 'assembling' : cur.status,
      detail: allDone ? 'Building customers from Claude profiles' : `Claude read ${done} of ${cur.batchesTotal} review batches`,
    });
    if (allDone) {
      tx.db.buildJob.insert({ scheduledId: 0n, scheduledAt: ScheduleAt.time(tx.timestamp.microsSinceUnixEpoch), buildId });
    }
  });
}

// ---- Assembly (pure) -----------------------------------------------------------------

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

function monthsBefore(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/** "$$" -> 2, "$10–20" -> 2, unknown -> 2. */
function priceLevel(price: string | undefined): number {
  if (!price) return 2;
  const dollars = (price.match(/\$/g) ?? []).length;
  const num = price.match(/\d+/);
  if (num) {
    const lo = Number(num[0]);
    return lo < 10 ? 1 : lo < 20 ? 2 : lo < 30 ? 3 : 4;
  }
  return clamp(dollars || 2, 1, 4);
}

/** Opening and closing hour from Google's hours text, e.g. "7 AM to 6 PM". */
function parseHours(hours: { day: string; hours: string }[] | undefined): { open: number; close: number } {
  const sample = hours?.find(h => /\d/.test(h.hours))?.hours ?? '';
  const times = [...sample.matchAll(/(\d{1,2})(?::(\d{2}))?\s*([AaPp])?/g)].map(m => ({
    h: Number(m[1]),
    pm: m[3] ? m[3].toLowerCase() === 'p' : null,
  }));
  if (times.length < 2) return { open: 7, close: 18 };
  const to24 = (t: { h: number; pm: boolean | null }, fallbackPm: boolean) => {
    const pm = t.pm ?? fallbackPm;
    return (t.h % 12) + (pm ? 12 : 0);
  };
  const open = to24(times[0], false);
  const close = to24(times[times.length - 1], true);
  return close > open ? { open, close } : { open: 7, close: 18 };
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = (a.lat - b.lat) * 111;
  const dLng = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/** The nearest real coffee place; falls back to the nearest anything if none is tagged as one. */
export function pickCompetitor(place: Place, competitors: Place[]): Place | undefined {
  const self = place.location;
  const others = competitors
    .filter(c => c.placeId !== place.placeId && c.location && self)
    .sort((a, b) => distanceKm(self!, a.location!) - distanceKm(self!, b.location!));
  const isCoffee = (c: Place) => /coffee|caf[eé]|espresso|roaster|tea/i.test(c.categoryName ?? '');
  return others.find(isCoffee) ?? others[0];
}

const NAMES = ['Maya', 'Leo', 'Priya', 'Sam', 'Ava', 'Noah', 'Iris', 'Omar', 'Lena', 'Kai', 'Zoe', 'Ravi',
  'Nina', 'Theo', 'Mila', 'Jon', 'Aria', 'Eli', 'Rosa', 'Ben', 'Tara', 'Max', 'Ines', 'Yuki', 'Dev'];

export function assembleTwin(
  placeJson: string,
  competitorsJson: string,
  menuJson: string,
  profiles: Profile[],
  label: string
): TwinInput {
  const place: Place = JSON.parse(placeJson);
  const competitors: Place[] = JSON.parse(competitorsJson || '[]');
  const menu: MenuEntry[] = JSON.parse(menuJson);
  const menuKeys = new Set(menu.map(m => m.key));
  const level = priceLevel(place.price);
  const { open, close } = parseHours(place.openingHours);

  // Most common usual order, for profiles whose items didn't match the menu.
  const counts = new Map<string, number>();
  for (const p of profiles) for (const k of p.usual_order) if (menuKeys.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  const popular = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? menu[0].key;

  const customers: TwinInput['customers'] = [];
  for (let k = 0; k < CUSTOMERS; k++) {
    const p = profiles[k % profiles.length];
    const clone = k >= profiles.length; // more customers than reviewers: vary the copies a little
    const j = (salt: string) => (clone ? ((hash32('jitter', k, salt) % 1000) / 1000 - 0.5) : 0);
    const order = p.usual_order.filter(x => menuKeys.has(x)).slice(0, 2);
    customers.push({
      key: `c${String(k + 1).padStart(3, '0')}`,
      name: `${NAMES[hash32('name', k) % NAMES.length]} ${String.fromCharCode(65 + (k % 26))}.`,
      archetype: p.type,
      priceSensitivity: +clamp(p.price_sensitivity + j('ps') * 0.2, 0.02, 1).toFixed(2),
      visitsPerWeek: +clamp(p.visits_per_week * (1 + j('v') * 0.4), 0.1, 7).toFixed(1),
      loyalty: +clamp(p.loyalty + j('l') * 0.2, 0.02, 1).toFixed(2),
      usualOrder: order.length ? order : [popular],
      cares: p.cares,
      seedMemories: p.quote ? [p.quote] : [],
    });
  }

  const nearest = pickCompetitor(place, competitors);
  const prices = new Map(menu.map(m => [m.key, m.priceCents]));
  const costs = fixedCosts(nominalRevenuePerDay(customers.map(c => ({ visitsPerWeek: c.visitsPerWeek, order: c.usualOrder })), prices, 4));

  return {
    cafe: {
      name: label || place.title,
      openHour: open,
      closeHour: close,
      servicePerHour: 60, // estimate
      customerScale: 4, // estimate: each simulated customer stands for 4 real ones
      ...costs, // estimate: scaled to this cafe's own revenue
    },
    menu: menu.map(m => ({
      key: m.key,
      name: m.name,
      category: m.category ?? 'menu',
      priceCents: m.priceCents,
      unitCostCents: m.unitCostCents ?? Math.round(m.priceCents * 0.3), // estimate: 30% cost of goods
    })),
    competitors: nearest
      ? [
          {
            key: 'rival1',
            name: nearest.title,
            priceIndex: +(priceLevel(nearest.price) / level).toFixed(2),
            rating: nearest.totalScore ?? 4.2,
          },
        ]
      : [],
    customers,
  };
}

// What the cafe takes in on a normal day if everyone keeps their habit (cents).
export function nominalRevenuePerDay(
  customers: { visitsPerWeek: number; order: string[] }[],
  prices: Map<string, number>,
  scale: number
): number {
  let total = 0;
  for (const c of customers) total += (c.visitsPerWeek / 7) * c.order.reduce((s, k) => s + (prices.get(k) ?? 0), 0) * scale;
  return total;
}

// Rent and wages as typical shares of a cafe's revenue (about 12% and 36%), so with ~30% cost of
// goods a twin earns a normal ~15% margin instead of a flat cost that small cafes can never cover.
export function fixedCosts(revenuePerDayCents: number) {
  const r = Math.max(revenuePerDayCents, 20000);
  return { rentPerDayCents: Math.round(r * 0.12), wagesPerDayCents: Math.round(r * 0.36) };
}
