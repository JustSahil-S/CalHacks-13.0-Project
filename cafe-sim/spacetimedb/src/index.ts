// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
import {
  schema,
  t,
  table,
  SenderError,
  type InferSchema,
  type ProcedureCtx,
  type TransactionCtx,
} from 'spacetimedb/server';

const user = table(
  { name: 'user', public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string().optional(),
    online: t.bool(),
  }
);

const message = table(
  { name: 'message', public: true },
  { sender: t.identity(), sent: t.timestamp(), text: t.string() }
);

const business = table(
  { name: 'business', public: true },
  {
    place_id: t.string().primaryKey(),
    name: t.string(),
    category: t.string(),
    address: t.string(),
    phone: t.string(),
    website: t.string(),
    price: t.string(),
    latitude: t.f64(),
    longitude: t.f64(),
    rating: t.f64(),
    reviews_count: t.u32(),
    maps_url: t.string(),
    // Full Google Maps record (hours, popular times, amenities, ...) as JSON
    details_json: t.string(),
    updated_at: t.timestamp(),
  }
);

const review = table(
  { name: 'review', public: true },
  {
    review_id: t.string().primaryKey(),
    // References business.place_id
    place_id: t.string().index(),
    reviewer_name: t.string(),
    reviewer_id: t.string(),
    stars: t.u32(),
    text: t.string(),
    published_at: t.string(),
    likes_count: t.u32(),
    owner_response: t.string(),
    review_url: t.string(),
    // e.g. {"Food": 5, "Service": 4, "Atmosphere": 5}
    detailed_rating_json: t.string(),
    updated_at: t.timestamp(),
  }
);

// Links a business to a nearby competitor; both sides are rows in `business`
const competitor = table(
  { name: 'competitor', public: true },
  {
    // `${place_id}:${competitor_place_id}`
    link_id: t.string().primaryKey(),
    place_id: t.string().index(),
    competitor_place_id: t.string().index(),
    distance_meters: t.f64(),
    search_radius_meters: t.f64(),
    found_at: t.timestamp(),
  }
);

// A simulated customer whose personality is derived from real reviews
const customer_agent = table(
  { name: 'customer_agent', public: true },
  {
    agent_id: t.u32().primaryKey().autoInc(),
    place_id: t.string().index(),
    name: t.string(),
    archetype: t.string(),
    backstory: t.string(),
    speaking_style: t.string(),
    typical_order: t.string(),
    // 0-1 importance of each part of a visit
    food_weight: t.f64(),
    service_weight: t.f64(),
    atmosphere_weight: t.f64(),
    patience_minutes: t.u32(),
    // 0 (doesn't care) - 1 (very price sensitive)
    price_sensitivity: t.f64(),
    // Chance of visiting during any simulated hour
    visits_per_hour: t.f64(),
    sample_quotes_json: t.string(),
    source_review_ids_json: t.string(),
    // How many of the store's Google reviewers this agent stands for (reviews_count / agents at the store)
    represents_customers: t.f64().default(0),
  }
);

const agent_state = table(
  { name: 'agent_state', public: true },
  {
    agent_id: t.u32().primaryKey(),
    place_id: t.string().index(),
    // home | waiting | eating
    activity: t.string(),
    minutes_in_activity: t.u32(),
    waited_minutes: t.u32(),
    // 0 (furious) - 1 (delighted); carries over between visits
    mood: t.f64(),
    visits: t.u32(),
  }
);

const agent_event = table(
  { name: 'agent_event', public: true },
  {
    event_id: t.u32().primaryKey().autoInc(),
    agent_id: t.u32().index(),
    place_id: t.string().index(),
    sim_minute: t.u32(),
    // arrived | served | walked_out | left_review
    kind: t.string(),
    stars: t.u32(),
    // What the agent said, written by Claude for walked_out and left_review
    text: t.string(),
  }
);

// One simulation per business. Time only moves when advance_time is called.
const simulation = table(
  { name: 'simulation', public: true },
  {
    place_id: t.string().primaryKey(),
    sim_minute: t.u32(),
    // What-if knobs that can be changed between time steps
    wait_minutes: t.u32(),
    price_multiplier: t.f64(),
    food_quality: t.f64(),
    atmosphere_quality: t.f64(),
  }
);

// Progress of the latest populate_store run, so every connected client can show it
const populate_job = table(
  { name: 'populate_job', public: true },
  {
    job_id: t.u32().primaryKey(),
    // idle | running | done | error
    status: t.string(),
    message: t.string(),
    maps_url: t.string(),
    place_id: t.string(),
    radius_km: t.f64(),
    competitors_found: t.u32(),
    updated_at: t.timestamp(),
  }
);

const spacetimedb = schema(
  {
    user,
    message,
    business,
    review,
    competitor,
    customer_agent,
    agent_state,
    agent_event,
    simulation,
    populate_job,
  },
  { env: { ANTHROPIC_API_KEY: t.string(), APIFY_API_TOKEN: t.string() } }
);
export default spacetimedb;

const businessFields = {
  place_id: t.string(),
  name: t.string(),
  category: t.string(),
  address: t.string(),
  phone: t.string(),
  website: t.string(),
  price: t.string(),
  latitude: t.f64(),
  longitude: t.f64(),
  rating: t.f64(),
  reviews_count: t.u32(),
  maps_url: t.string(),
  details_json: t.string(),
};

function upsertBusinessRow(
  ctx: Tx,
  args: Omit<NonNullable<ReturnType<Tx['db']['business']['place_id']['find']>>, 'updated_at'>
) {
  if (!args.place_id) throw new SenderError('place_id must not be empty');
  const row = { ...args, updated_at: ctx.timestamp };
  if (ctx.db.business.place_id.find(args.place_id)) {
    ctx.db.business.place_id.update(row);
  } else {
    ctx.db.business.insert(row);
  }
}

export const upsert_business = spacetimedb.reducer(businessFields, (ctx, args) =>
  upsertBusinessRow(ctx, args)
);

const CompetitorInput = t.object('CompetitorInput', {
  ...businessFields,
  distance_meters: t.f64(),
});

// Replaces the competitor list for a business in one transaction, adding any
// competitor that isn't in the business table yet
export const set_competitors = spacetimedb.reducer(
  {
    place_id: t.string(),
    search_radius_meters: t.f64(),
    competitors: t.array(CompetitorInput),
  },
  (ctx, { place_id, search_radius_meters, competitors }) => {
    replaceCompetitors(ctx, place_id, search_radius_meters, competitors);
  }
);

type BusinessInput = Parameters<typeof upsertBusinessRow>[1];

function replaceCompetitors(
  tx: Tx,
  place_id: string,
  search_radius_meters: number,
  competitors: (BusinessInput & { distance_meters: number })[]
) {
  if (!tx.db.business.place_id.find(place_id)) {
    throw new SenderError(`No business with place_id ${place_id}`);
  }
  tx.db.competitor.place_id.delete(place_id);

  for (const { distance_meters, ...business } of competitors) {
    if (business.place_id === place_id) continue;
    upsertBusinessRow(tx, business);
    tx.db.competitor.insert({
      link_id: `${place_id}:${business.place_id}`,
      place_id,
      competitor_place_id: business.place_id,
      distance_meters,
      search_radius_meters,
      found_at: tx.timestamp,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POPULATE FROM A GOOGLE MAPS LINK
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_PLACES_ACTOR = 'compass~crawler-google-places';
const GOOGLE_REVIEWS_ACTOR = 'compass~Google-Maps-Reviews-Scraper';
// Newest reviews fetched per place; the selected store gets more for richer customer personas
const STORE_REVIEWS = 40;
const COMPETITOR_REVIEWS = 15;
const JOB_ID = 0;
const MAX_RADIUS_KM = 2;
const MAX_COMPETITORS = 50;
// Many search results are filtered out (wrong category or outside the radius), so crawl extra
const CRAWL_RESULTS_PER_COMPETITOR = 3;
const MIN_CRAWL_RESULTS = 20;
// A run left 'running' longer than this is assumed to have crashed
const STALE_JOB_MICROS = 10n * 60n * 1_000_000n;
const COMPETITOR_SEARCH_TERMS = ['cafe'];
// Only the primary category is checked, since many restaurants and stores list "Cafe" as a secondary one
const DRINK_CATEGORY_PATTERN = /\b(caf[eé]s?|coffee|espresso|tea|boba|juice|smoothie|kombucha|drinks?)\b/i;

type ApifyPlace = Record<string, any>;

// Apify holds each long-poll open for at most this long; the fetch timeout must exceed it
const APIFY_WAIT_SECS = 60;
const APIFY_FETCH_TIMEOUT = { __time_duration_micros__: BigInt(APIFY_WAIT_SECS + 30) * 1_000_000n } as any;
const APIFY_MAX_POLLS = 8;

function apifyRequest(ctx: ProcedureCtx<Db>, path: string, init: { method?: string; body?: string } = {}): any {
  const response = ctx.http.fetch(`https://api.apify.com/v2/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${ctx.env.APIFY_API_TOKEN}`,
      'content-type': 'application/json',
    },
    body: init.body,
    timeout: APIFY_FETCH_TIMEOUT,
  });
  if (!response.ok) {
    throw new SenderError(`Apify request failed: ${response.status} ${response.text().slice(0, 300)}`);
  }
  return response.json();
}

type ApifyRun = { id: string; status: string; defaultDatasetId: string };

function startApifyRun(ctx: ProcedureCtx<Db>, actor: string, input: object): ApifyRun {
  return apifyRequest(ctx, `acts/${actor}/runs`, { method: 'POST', body: JSON.stringify(input) }).data;
}

function waitForApifyRun(ctx: ProcedureCtx<Db>, run: ApifyRun): ApifyPlace[] {
  for (let polls = 0; run.status === 'READY' || run.status === 'RUNNING'; polls++) {
    if (polls >= APIFY_MAX_POLLS) {
      throw new SenderError(`Apify run ${run.id} is still running after ${APIFY_MAX_POLLS} minutes`);
    }
    run = apifyRequest(ctx, `actor-runs/${run.id}?waitForFinish=${APIFY_WAIT_SECS}`).data;
  }
  if (run.status !== 'SUCCEEDED') {
    throw new SenderError(`Apify run ${run.id} ended with status ${run.status}`);
  }
  return apifyRequest(ctx, `datasets/${run.defaultDatasetId}/items?clean=true&format=json`);
}

// Place links carry the pin as !3d<lat>!4d<lng>; the @lat,lng part is only the map viewport
function coordinatesFromMapsUrl(url: string): { lat: number; lng: number } | null {
  const match = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(decodeURIComponent(url));
  return match ? { lat: Number(match[1]), lng: Number(match[2]) } : null;
}

function startCompetitorSearch(ctx: ProcedureCtx<Db>, lat: number, lng: number, radiusKm: number, maxCompetitors: number) {
  return startApifyRun(ctx, GOOGLE_PLACES_ACTOR, {
    searchStringsArray: COMPETITOR_SEARCH_TERMS,
    // GeoJSON uses [longitude, latitude] order
    customGeolocation: { type: 'Point', coordinates: [lng, lat], radiusKm },
    maxCrawledPlacesPerSearch: Math.max(MIN_CRAWL_RESULTS, maxCompetitors * CRAWL_RESULTS_PER_COMPETITOR),
    language: 'en',
  });
}

function placeToBusiness(place: ApifyPlace, mapsUrl: string): BusinessInput {
  return {
    place_id: place.placeId ?? '',
    name: place.title ?? '',
    category: place.categoryName ?? '',
    address: place.address ?? '',
    phone: place.phone ?? '',
    website: place.website ?? '',
    price: place.price ?? '',
    latitude: Number(place.location?.lat ?? 0),
    longitude: Number(place.location?.lng ?? 0),
    rating: Number(place.totalScore ?? 0),
    reviews_count: Math.max(0, Math.round(Number(place.reviewsCount ?? 0))),
    maps_url: mapsUrl,
    details_json: JSON.stringify(place),
  };
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
}

function setJob(ctx: ProcedureCtx<Db>, fields: Partial<Omit<NonNullable<ReturnType<Tx['db']['populate_job']['job_id']['find']>>, 'job_id'>>) {
  ctx.withTx(tx => {
    const existing = tx.db.populate_job.job_id.find(JOB_ID);
    const row = {
      job_id: JOB_ID,
      status: 'idle',
      message: '',
      maps_url: '',
      place_id: '',
      radius_km: 0,
      competitors_found: 0,
      ...existing,
      ...fields,
      updated_at: tx.timestamp,
    };
    if (existing) tx.db.populate_job.job_id.update(row);
    else tx.db.populate_job.insert(row);
  });
}

function clearStoreData(tx: Tx) {
  tx.db.agent_event.clear();
  tx.db.agent_state.clear();
  tx.db.customer_agent.clear();
  tx.db.simulation.clear();
  tx.db.competitor.clear();
  tx.db.review.clear();
  tx.db.business.clear();
}

// Wipes the store data and rebuilds it from one Google Maps link: the store
// itself plus every drink-focused competitor within radius_km
export const populate_store = spacetimedb.procedure(
  { maps_url: t.string(), radius_km: t.f64(), max_competitors: t.u32() },
  t.u32(),
  (ctx, { maps_url, radius_km, max_competitors }) => {
    const url = maps_url.trim();
    // The scraper only accepts links to a specific place, not a plain map view (/maps/@lat,lng)
    if (!/^https:\/\/(www\.google\.[a-z.]+\/maps(\/place\/|\/search\/|\?.*\bcid=)|maps\.app\.goo\.gl\/|goo\.gl\/maps\/)/.test(url)) {
      throw new SenderError(
        'That link is a map view, not a place. Click the store on Google Maps, then copy the link (it should contain /maps/place/)'
      );
    }
    if (!(radius_km > 0 && radius_km <= MAX_RADIUS_KM)) {
      throw new SenderError(`Radius must be between 0 and ${MAX_RADIUS_KM} km`);
    }
    if (max_competitors < 1 || max_competitors > MAX_COMPETITORS) {
      throw new SenderError(`Max competitors must be between 1 and ${MAX_COMPETITORS}`);
    }
    const running = ctx.withTx(tx => {
      const job = tx.db.populate_job.job_id.find(JOB_ID);
      return (
        job?.status === 'running' &&
        tx.timestamp.microsSinceUnixEpoch - job.updated_at.microsSinceUnixEpoch < STALE_JOB_MICROS
      );
    });
    if (running) throw new SenderError('A populate run is already in progress');

    setJob(ctx, { status: 'running', message: 'Clearing old data...', maps_url: url, place_id: '', radius_km, competitors_found: 0 });
    try {
      ctx.withTx(tx => clearStoreData(tx));

      const pin = coordinatesFromMapsUrl(url);
      setJob(ctx, {
        message: pin
          ? `Scraping the store and competitors within ${radius_km} km...`
          : 'Scraping the store from Google Maps...',
      });
      const storeRun = startApifyRun(ctx, GOOGLE_PLACES_ACTOR, {
        startUrls: [{ url }],
        language: 'en',
        scrapePlaceDetailPage: true,
        maxReviews: 0,
        maxImages: 0,
        maxQuestions: 0,
      });
      let competitorRun = pin ? startCompetitorSearch(ctx, pin.lat, pin.lng, radius_km, max_competitors) : null;
      const storeReviewsRun = startReviewsRun(ctx, { startUrls: [{ url }] }, STORE_REVIEWS);

      const [place] = waitForApifyRun(ctx, storeRun);
      if (!place?.placeId) throw new SenderError('Google Maps did not return a place for that link');
      const store = placeToBusiness(place, url);
      ctx.withTx(tx => upsertBusinessRow(tx, store));

      if (!competitorRun) {
        setJob(ctx, { place_id: store.place_id, message: `Searching for competitors within ${radius_km} km...` });
        competitorRun = startCompetitorSearch(ctx, store.latitude, store.longitude, radius_km, max_competitors);
      } else {
        setJob(ctx, { place_id: store.place_id, message: `Finishing the competitor search within ${radius_km} km...` });
      }
      const nearby = waitForApifyRun(ctx, competitorRun);

      const competitors = new Map<string, BusinessInput & { distance_meters: number }>();
      for (const p of nearby) {
        if (!p.placeId || p.placeId === store.place_id || competitors.has(p.placeId)) continue;
        if (!p.location || p.permanentlyClosed || !DRINK_CATEGORY_PATTERN.test(p.categoryName ?? '')) continue;
        if (!(Number(p.reviewsCount) > 0)) continue;
        const distance = distanceMeters(store.latitude, store.longitude, p.location.lat, p.location.lng);
        if (distance > radius_km * 1000) continue;
        competitors.set(p.placeId, { ...placeToBusiness(p, p.url ?? ''), distance_meters: distance });
      }
      const closest = [...competitors.values()]
        .sort((a, b) => a.distance_meters - b.distance_meters)
        .slice(0, max_competitors);
      ctx.withTx(tx => replaceCompetitors(tx, store.place_id, radius_km * 1000, closest));

      setJob(ctx, {
        message: `Found ${closest.length} competitors, fetching the newest reviews...`,
        competitors_found: closest.length,
      });
      const competitorReviewsRun =
        closest.length > 0
          ? startReviewsRun(ctx, { placeIds: closest.map(c => c.place_id) }, COMPETITOR_REVIEWS)
          : null;
      const storeReviews = saveReviews(ctx, waitForApifyRun(ctx, storeReviewsRun));
      const competitorReviews = competitorReviewsRun ? saveReviews(ctx, waitForApifyRun(ctx, competitorReviewsRun)) : 0;

      setJob(ctx, {
        status: 'done',
        message:
          `Found ${closest.length} competitors within ${radius_km} km of ${store.name} · ` +
          `${storeReviews} store reviews, ${competitorReviews} competitor reviews`,
      });
      return closest.length;
    } catch (error) {
      setJob(ctx, { status: 'error', message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
);

export const clear_store_data = spacetimedb.reducer(ctx => {
  const job = ctx.db.populate_job.job_id.find(JOB_ID);
  if (job?.status === 'running') {
    throw new SenderError('Wait for the current populate run to finish');
  }
  clearStoreData(ctx);
  if (job) {
    ctx.db.populate_job.job_id.update({
      ...job,
      status: 'idle',
      message: 'Data cleared',
      place_id: '',
      competitors_found: 0,
      updated_at: ctx.timestamp,
    });
  }
});

export const upsert_review = spacetimedb.reducer(
  {
    review_id: t.string(),
    place_id: t.string(),
    reviewer_name: t.string(),
    reviewer_id: t.string(),
    stars: t.u32(),
    text: t.string(),
    published_at: t.string(),
    likes_count: t.u32(),
    owner_response: t.string(),
    review_url: t.string(),
    detailed_rating_json: t.string(),
  },
  (ctx, args) => upsertReviewRow(ctx, args)
);

type ReviewInput = Omit<NonNullable<ReturnType<Tx['db']['review']['review_id']['find']>>, 'updated_at'>;

function upsertReviewRow(tx: Tx, args: ReviewInput) {
  if (!args.review_id) throw new SenderError('review_id must not be empty');
  if (!tx.db.business.place_id.find(args.place_id)) {
    throw new SenderError(`No business with place_id ${args.place_id}`);
  }
  const row = { ...args, updated_at: tx.timestamp };
  if (tx.db.review.review_id.find(args.review_id)) {
    tx.db.review.review_id.update(row);
  } else {
    tx.db.review.insert(row);
  }
}

function apifyReviewToRow(review: ApifyPlace): ReviewInput {
  return {
    review_id: review.reviewId ?? '',
    place_id: review.placeId ?? '',
    reviewer_name: review.name ?? '',
    reviewer_id: review.reviewerId ?? '',
    stars: Math.max(0, Math.round(Number(review.stars ?? 0))),
    text: review.text ?? '',
    published_at: review.publishedAtDate ?? '',
    likes_count: Math.max(0, Math.round(Number(review.likesCount ?? 0))),
    owner_response: review.responseFromOwnerText ?? '',
    review_url: review.reviewUrl ?? '',
    detailed_rating_json: JSON.stringify(review.reviewDetailedRating ?? {}),
  };
}

// Skips reviews without text (useless for personas) and any for places not in the business table
function saveReviews(ctx: ProcedureCtx<Db>, reviews: ApifyPlace[]) {
  return ctx.withTx(tx => {
    let saved = 0;
    for (const review of reviews) {
      const row = apifyReviewToRow(review);
      if (!row.review_id || !row.text.trim() || !tx.db.business.place_id.find(row.place_id)) continue;
      upsertReviewRow(tx, row);
      saved++;
    }
    return saved;
  });
}

function startReviewsRun(ctx: ProcedureCtx<Db>, target: { startUrls: { url: string }[] } | { placeIds: string[] }, maxReviews: number) {
  return startApifyRun(ctx, GOOGLE_REVIEWS_ACTOR, {
    ...target,
    maxReviews,
    reviewsSort: 'newest',
    reviewsOrigin: 'google',
    language: 'en',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER AGENTS
// ─────────────────────────────────────────────────────────────────────────────
type Db = InferSchema<typeof spacetimedb>;
type Tx = TransactionCtx<Db>;
type Agent = NonNullable<ReturnType<Tx['db']['customer_agent']['agent_id']['find']>>;
type Simulation = NonNullable<ReturnType<Tx['db']['simulation']['place_id']['find']>>;

const PERSONA_MODEL = 'claude-sonnet-5-5';
const VOICE_MODEL = 'claude-haiku-5-5';
// Generating a batch of personas can take well over the default HTTP timeout
const CLAUDE_FETCH_TIMEOUT = { __time_duration_micros__: 180n * 1_000_000n } as any;
const TICK_MINUTES = 5;
const MEAL_MINUTES = 45;
const MAX_STEP_MINUTES = 24 * 60;
// Claude calls run sequentially inside the procedure, so cap them per step
const MAX_VOICED_EVENTS_PER_STEP = 6;

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function callClaude(
  ctx: ProcedureCtx<Db>,
  model: string,
  system: string,
  prompt: string,
  maxTokens: number
): string {
  const response = ctx.http.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ctx.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
    timeout: CLAUDE_FETCH_TIMEOUT,
  });
  if (!response.ok) {
    throw new Error(`Claude request failed: ${response.status} ${response.text()}`);
  }
  const result = response.json();
  const text = result.content
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('')
    .trim();
  if (!text) {
    throw new Error(`Claude returned no text (stop_reason ${result.stop_reason}, usage ${JSON.stringify(result.usage)})`);
  }
  return text;
}

// Uses structured outputs so the reply is guaranteed to be JSON matching `schema`
function callClaudeForJson(
  ctx: ProcedureCtx<Db>,
  model: string,
  system: string,
  prompt: string,
  maxTokens: number,
  schema: object
): any {
  const response = ctx.http.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ctx.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: { type: 'json_schema', schema } },
      // Without this the model can spend the whole token budget thinking before writing the JSON
      thinking: { type: 'between_tools' },
    }),
    timeout: CLAUDE_FETCH_TIMEOUT,
  });
  if (!response.ok) {
    throw new Error(`Claude request failed: ${response.status} ${response.text()}`);
  }
  const result = response.json();
  if (result.stop_reason !== 'end_turn') {
    throw new Error(`Claude stopped early (stop_reason ${result.stop_reason}, usage ${JSON.stringify(result.usage)})`);
  }
  const text = result.content
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('');
  return JSON.parse(text);
}

function parseJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`Claude did not return JSON: ${text}`);
  return JSON.parse(text.slice(start, end + 1));
}

function averageDetailedRating(reviews: { detailed_rating_json: string }[], key: string) {
  const scores = reviews
    .map(r => Number(JSON.parse(r.detailed_rating_json || '{}')[key]))
    .filter(n => Number.isFinite(n) && n > 0);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length / 5 : null;
}

const PERSONA_SYSTEM = `You design simulated customers for an agent-based restaurant simulation.
Ground every persona strictly in the provided Google reviews: traits must reflect what reviewers actually said, and every persona must cite the review_ids it is based on. Group similar reviewers into one persona rather than inventing new kinds of customers.
Respond with only a JSON object of this shape:
{"personas": [{
  "name": "first name",
  "archetype": "short label, e.g. 'dog-owning brunch regular'",
  "backstory": "1-2 sentences",
  "speaking_style": "how they talk",
  "typical_order": "what they usually order, from the reviews when possible",
  "food_weight": 0-1, "service_weight": 0-1, "atmosphere_weight": 0-1,
  "patience_minutes": 5-60,
  "price_sensitivity": 0-1,
  "visits_per_hour": 0.02-0.3,
  "sample_quotes": ["up to 3 short verbatim phrases from their reviews"],
  "source_review_ids": ["review_id", ...]
}]}`;

export const generate_personas = spacetimedb.procedure(
  { place_id: t.string(), count: t.u32() },
  t.u32(),
  (ctx, { place_id, count }) => {
    const { place, reviews } = ctx.withTx(tx => ({
      place: tx.db.business.place_id.find(place_id),
      reviews: [...tx.db.review.place_id.filter(place_id)],
    }));
    if (!place) throw new SenderError(`No business with place_id ${place_id}`);
    if (reviews.length === 0) throw new SenderError(`${place.name} has no reviews yet`);

    const prompt = JSON.stringify({
      business: { name: place.name, category: place.category, price: place.price, rating: place.rating },
      persona_count: Math.max(1, Math.min(count, reviews.length)),
      reviews: reviews.map(r => ({
        review_id: r.review_id,
        stars: r.stars,
        text: r.text,
        detailed_rating: JSON.parse(r.detailed_rating_json || '{}'),
      })),
    });
    const { personas } = parseJsonObject(callClaude(ctx, PERSONA_MODEL, PERSONA_SYSTEM, prompt, 4000));
    return ctx.withTx(tx => replaceAgents(tx, place, reviews, personas));
  }
);

type Business = NonNullable<ReturnType<Tx['db']['business']['place_id']['find']>>;
type Review = NonNullable<ReturnType<Tx['db']['review']['review_id']['find']>>;

// Replaces a business's agents with new personas and resets its simulation
function replaceAgents(tx: Tx, place: Business, reviews: Review[], personas: any[]) {
  const place_id = place.place_id;
  for (const agent of [...tx.db.customer_agent.place_id.filter(place_id)]) {
    tx.db.agent_state.agent_id.delete(agent.agent_id);
    tx.db.customer_agent.agent_id.delete(agent.agent_id);
  }
  tx.db.agent_event.place_id.delete(place_id);

  const represents = personas.length ? Math.max(1, place.reviews_count) / personas.length : 0;
  for (const p of personas) {
    const agent = tx.db.customer_agent.insert({
      agent_id: 0,
      place_id,
      name: String(p.name ?? 'Customer'),
      archetype: String(p.archetype ?? ''),
      backstory: String(p.backstory ?? ''),
      speaking_style: String(p.speaking_style ?? ''),
      typical_order: String(p.typical_order ?? ''),
      food_weight: clamp(p.food_weight, 0, 1, 0.5),
      service_weight: clamp(p.service_weight, 0, 1, 0.5),
      atmosphere_weight: clamp(p.atmosphere_weight, 0, 1, 0.5),
      patience_minutes: Math.round(clamp(p.patience_minutes, 5, 60, 20)),
      price_sensitivity: clamp(p.price_sensitivity, 0, 1, 0.5),
      visits_per_hour: clamp(p.visits_per_hour, 0.01, 0.5, 0.1),
      sample_quotes_json: JSON.stringify(p.sample_quotes ?? []),
      source_review_ids_json: JSON.stringify(p.source_review_ids ?? []),
      represents_customers: represents,
    });
    tx.db.agent_state.insert({
      agent_id: agent.agent_id,
      place_id,
      activity: 'home',
      minutes_in_activity: 0,
      waited_minutes: 0,
      mood: 0.5,
      visits: 0,
    });
  }

  const fallbackQuality = place.rating / 5;
  const simulation = {
    place_id,
    sim_minute: 0,
    wait_minutes: 15,
    price_multiplier: 1,
    food_quality: averageDetailedRating(reviews, 'Food') ?? fallbackQuality,
    atmosphere_quality: averageDetailedRating(reviews, 'Atmosphere') ?? fallbackQuality,
  };
  if (tx.db.simulation.place_id.find(place_id)) {
    tx.db.simulation.place_id.update(simulation);
  } else {
    tx.db.simulation.insert(simulation);
  }
  return personas.length;
}

// Splits `total` agents across stores in proportion to their Google review counts.
// Every store gets at least one, and none gets more than it has loaded reviews to base personas on.
function allocateAgents(stores: { place_id: string; weight: number; max: number }[], total: number) {
  const eligible = stores.filter(s => s.max > 0);
  const allocation = new Map(eligible.map(s => [s.place_id, 1]));
  const totalWeight = eligible.reduce((sum, s) => sum + s.weight, 0) || 1;
  let remaining = Math.max(0, total - eligible.length);
  while (remaining > 0) {
    let best: (typeof eligible)[number] | undefined;
    let bestGap = -Infinity;
    for (const s of eligible) {
      const current = allocation.get(s.place_id)!;
      if (current >= s.max) continue;
      const gap = (s.weight / totalWeight) * total - current;
      if (gap > bestGap) {
        bestGap = gap;
        best = s;
      }
    }
    if (!best) break;
    allocation.set(best.place_id, allocation.get(best.place_id)! + 1);
    remaining--;
  }
  return allocation;
}

const BATCH_PERSONA_SYSTEM = `${PERSONA_SYSTEM.split('Respond with only')[0]}
You will receive several businesses. Create exactly persona_count personas for each one, using only that business's reviews.`;

const unitInterval = { type: 'number', description: '0 to 1' };
const PERSONA_PROPERTIES = {
  name: { type: 'string', description: 'first name' },
  archetype: { type: 'string', description: "short label, e.g. 'laptop-working regular'" },
  backstory: { type: 'string', description: '1 sentence' },
  speaking_style: { type: 'string', description: 'a few words' },
  typical_order: { type: 'string', description: 'what they usually order, from the reviews when possible' },
  food_weight: unitInterval,
  service_weight: unitInterval,
  atmosphere_weight: unitInterval,
  patience_minutes: { type: 'integer', description: '5 to 60' },
  price_sensitivity: unitInterval,
  visits_per_hour: { type: 'number', description: '0.02 to 0.3' },
  sample_quotes: { type: 'array', items: { type: 'string' }, description: 'up to 2 short verbatim phrases from their reviews' },
  source_review_ids: { type: 'array', items: { type: 'string' }, description: 'ids like "r3" of up to 3 reviews it is based on' },
};
const PERSONA_BATCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['businesses'],
  properties: {
    businesses: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['place_id', 'personas'],
        properties: {
          place_id: { type: 'string' },
          personas: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: Object.keys(PERSONA_PROPERTIES),
              properties: PERSONA_PROPERTIES,
            },
          },
        },
      },
    },
  },
};

const MAX_TOTAL_AGENTS = 100;
const MAX_AGENTS_PER_STORE = 15;
// Stores are sent to Claude in batches of about this many personas per call
const PERSONAS_PER_CLAUDE_CALL = 12;
const TOKENS_PER_PERSONA = 700;
const REVIEW_CHARS_FOR_PERSONAS = 600;

// Creates agents for the selected store and all its competitors, with agent counts
// proportional to each store's Google review count
export const generate_all_agents = spacetimedb.procedure(
  { total_agents: t.u32() },
  t.u32(),
  (ctx, { total_agents }) => {
    if (total_agents < 1 || total_agents > MAX_TOTAL_AGENTS) {
      throw new SenderError(`Total agents must be between 1 and ${MAX_TOTAL_AGENTS}`);
    }
    const { running, stores } = ctx.withTx(tx => {
      const job = tx.db.populate_job.job_id.find(JOB_ID);
      const storeId = job?.place_id ?? '';
      const placeIds = [storeId, ...[...tx.db.competitor.place_id.filter(storeId)].map(c => c.competitor_place_id)];
      return {
        running:
          job?.status === 'running' &&
          tx.timestamp.microsSinceUnixEpoch - job.updated_at.microsSinceUnixEpoch < STALE_JOB_MICROS,
        stores: placeIds
          .map(id => ({ place: tx.db.business.place_id.find(id), reviews: [...tx.db.review.place_id.filter(id)] }))
          .filter((s): s is { place: Business; reviews: Review[] } => !!s.place && s.reviews.length > 0),
      };
    });
    if (running) throw new SenderError('Wait for the current run to finish');
    if (stores.length === 0) throw new SenderError('Populate a store with reviews first');

    const allocation = allocateAgents(
      stores.map(s => ({
        place_id: s.place.place_id,
        weight: Math.max(1, s.place.reviews_count),
        max: Math.min(MAX_AGENTS_PER_STORE, s.reviews.length),
      })),
      total_agents
    );

    const batches: (typeof stores)[] = [];
    let batch: typeof stores = [];
    let batchPersonas = 0;
    for (const store of stores) {
      const count = allocation.get(store.place.place_id) ?? 0;
      if (batch.length > 0 && batchPersonas + count > PERSONAS_PER_CLAUDE_CALL) {
        batches.push(batch);
        batch = [];
        batchPersonas = 0;
      }
      batch.push(store);
      batchPersonas += count;
    }
    if (batch.length > 0) batches.push(batch);

    setJob(ctx, { status: 'running', message: `Creating agents for ${stores.length} stores...` });
    try {
      let created = 0;
      for (const [i, group] of batches.entries()) {
        setJob(ctx, {
          message: `Creating agents with Claude (batch ${i + 1} of ${batches.length}: ${group.map(s => s.place.name).join(', ')})...`,
        });
        const personaCount = group.reduce((sum, s) => sum + (allocation.get(s.place.place_id) ?? 0), 0);
        const prompt = JSON.stringify({
          businesses: group.map(s => ({
            place_id: s.place.place_id,
            name: s.place.name,
            category: s.place.category,
            price: s.place.price,
            rating: s.place.rating,
            persona_count: allocation.get(s.place.place_id),
            // Short ids keep Claude's output small; they are mapped back to real review ids below
            reviews: s.reviews.map((r, index) => ({
              id: `r${index + 1}`,
              stars: r.stars,
              text: r.text.slice(0, REVIEW_CHARS_FOR_PERSONAS),
              detailed_rating: JSON.parse(r.detailed_rating_json || '{}'),
            })),
          })),
        });
        const { businesses } = callClaudeForJson(
          ctx,
          PERSONA_MODEL,
          BATCH_PERSONA_SYSTEM,
          prompt,
          500 + personaCount * TOKENS_PER_PERSONA,
          PERSONA_BATCH_SCHEMA
        );
        created += ctx.withTx(tx => {
          let saved = 0;
          for (const store of group) {
            const result = (businesses ?? []).find((b: any) => b.place_id === store.place.place_id);
            const wanted = allocation.get(store.place.place_id) ?? 0;
            const personas = (Array.isArray(result?.personas) ? result.personas.slice(0, wanted) : []).map((p: any) => ({
              ...p,
              source_review_ids: (p.source_review_ids ?? [])
                .map((id: string) => store.reviews[Number(String(id).replace(/\D/g, '')) - 1]?.review_id)
                .filter(Boolean),
            }));
            if (personas.length > 0) saved += replaceAgents(tx, store.place, store.reviews, personas);
          }
          return saved;
        });
      }
      setJob(ctx, { status: 'done', message: `Created ${created} agents across ${stores.length} stores` });
      return created;
    } catch (error) {
      setJob(ctx, { status: 'error', message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
);

function visitSatisfaction(agent: Agent, sim: Simulation, waited: number) {
  const service = Math.max(0, 1 - Math.max(0, waited - agent.patience_minutes) / agent.patience_minutes);
  const priceFit = clamp(1 - agent.price_sensitivity * (sim.price_multiplier - 1) * 2, 0, 1, 1);
  const totalWeight = agent.food_weight + agent.service_weight + agent.atmosphere_weight || 1;
  const experience =
    (agent.food_weight * sim.food_quality +
      agent.service_weight * service +
      agent.atmosphere_weight * sim.atmosphere_quality) /
    totalWeight;
  return clamp(experience * (0.7 + 0.3 * priceFit), 0, 1, 0.5);
}

type VoicedEvent = { event_id: number; agent: Agent; kind: string; stars: number; waited: number };

// Advances every agent for this business through `minutes` of simulated time
function runSimulation(tx: Tx, place_id: string, minutes: number): VoicedEvent[] {
  const sim = tx.db.simulation.place_id.find(place_id);
  if (!sim) throw new SenderError('Generate personas for this business first');

  const voiced: VoicedEvent[] = [];
  const agents = [...tx.db.customer_agent.place_id.filter(place_id)];
  let minute = sim.sim_minute;

  for (let elapsed = 0; elapsed < minutes; elapsed += TICK_MINUTES) {
    minute += TICK_MINUTES;
    for (const agent of agents) {
      const state = tx.db.agent_state.agent_id.find(agent.agent_id);
      if (!state) continue;
      const logEvent = (kind: string, stars: number) =>
        tx.db.agent_event.insert({
          event_id: 0,
          agent_id: agent.agent_id,
          place_id,
          sim_minute: minute,
          kind,
          stars,
          text: '',
        });

      if (state.activity === 'home') {
        // Higher prices and bad past visits make agents less likely to come back
        const priceDeterrent = 1 - agent.price_sensitivity * Math.max(0, sim.price_multiplier - 1);
        const chance = agent.visits_per_hour * (TICK_MINUTES / 60) * Math.max(0, priceDeterrent) * (0.5 + state.mood);
        if (tx.random() < chance) {
          tx.db.agent_state.agent_id.update({ ...state, activity: 'waiting', minutes_in_activity: 0, waited_minutes: 0 });
          logEvent('arrived', 0);
        }
      } else if (state.activity === 'waiting') {
        const waited = state.minutes_in_activity + TICK_MINUTES;
        if (waited >= sim.wait_minutes) {
          tx.db.agent_state.agent_id.update({ ...state, activity: 'eating', minutes_in_activity: 0, waited_minutes: waited });
          logEvent('served', 0);
        } else if (waited >= agent.patience_minutes * 2) {
          tx.db.agent_state.agent_id.update({ ...state, activity: 'home', minutes_in_activity: 0, waited_minutes: waited, mood: 0.1 });
          voiced.push({ event_id: logEvent('walked_out', 1).event_id, agent, kind: 'walked_out', stars: 1, waited });
        } else {
          tx.db.agent_state.agent_id.update({ ...state, minutes_in_activity: waited });
        }
      } else if (state.activity === 'eating') {
        const eaten = state.minutes_in_activity + TICK_MINUTES;
        if (eaten >= MEAL_MINUTES) {
          const satisfaction = visitSatisfaction(agent, sim, state.waited_minutes);
          const stars = 1 + Math.round(satisfaction * 4);
          tx.db.agent_state.agent_id.update({
            ...state,
            activity: 'home',
            minutes_in_activity: 0,
            mood: satisfaction,
            visits: state.visits + 1,
          });
          voiced.push({
            event_id: logEvent('left_review', stars).event_id,
            agent,
            kind: 'left_review',
            stars,
            waited: state.waited_minutes,
          });
        } else {
          tx.db.agent_state.agent_id.update({ ...state, minutes_in_activity: eaten });
        }
      }
    }
  }

  tx.db.simulation.place_id.update({ ...sim, sim_minute: minute });
  return voiced;
}

function voicePrompt(event: VoicedEvent, sim: Simulation, businessName: string) {
  if (event.kind === 'walked_out') {
    return `You walked out of ${businessName} after waiting ${event.waited} minutes without being served. What do you mutter on your way out?`;
  }
  const price =
    sim.price_multiplier > 1.05 ? ' Prices felt higher than usual.' :
    sim.price_multiplier < 0.95 ? ' Prices felt lower than usual.' : '';
  return `You just finished a visit to ${businessName}. You waited ${event.waited} minutes to be served.${price} You had ${event.agent.typical_order || 'your usual'}. Overall it was a ${event.stars}/5 star visit. Write the short Google review you post.`;
}

export const advance_time = spacetimedb.procedure(
  { place_id: t.string(), minutes: t.u32() },
  t.u32(),
  (ctx, { place_id, minutes }) => {
    if (minutes === 0 || minutes > MAX_STEP_MINUTES) {
      throw new SenderError(`minutes must be between 1 and ${MAX_STEP_MINUTES}`);
    }
    const { voiced, sim, businessName } = ctx.withTx(tx => ({
      voiced: runSimulation(tx, place_id, minutes),
      sim: tx.db.simulation.place_id.find(place_id)!,
      businessName: tx.db.business.place_id.find(place_id)?.name ?? 'the restaurant',
    }));

    for (const event of voiced.slice(0, MAX_VOICED_EVENTS_PER_STEP)) {
      const { agent } = event;
      const system = `You are ${agent.name}, a ${agent.archetype}. ${agent.backstory}
Speaking style: ${agent.speaking_style}. Things you have said before: ${agent.sample_quotes_json}.
Stay in character. Reply with only what you say, 1-3 sentences, without quotation marks.`;
      const text = callClaude(ctx, VOICE_MODEL, system, voicePrompt(event, sim, businessName), 200);
      ctx.withTx(tx => {
        const row = tx.db.agent_event.event_id.find(event.event_id);
        if (row) tx.db.agent_event.event_id.update({ ...row, text });
      });
    }
    return voiced.length;
  }
);

export const update_simulation_settings = spacetimedb.reducer(
  {
    place_id: t.string(),
    wait_minutes: t.u32(),
    price_multiplier: t.f64(),
    food_quality: t.f64(),
    atmosphere_quality: t.f64(),
  },
  (ctx, settings) => {
    const sim = ctx.db.simulation.place_id.find(settings.place_id);
    if (!sim) throw new SenderError('Generate personas for this business first');
    ctx.db.simulation.place_id.update({
      ...sim,
      wait_minutes: Math.max(1, settings.wait_minutes),
      price_multiplier: clamp(settings.price_multiplier, 0.1, 5, 1),
      food_quality: clamp(settings.food_quality, 0, 1, sim.food_quality),
      atmosphere_quality: clamp(settings.atmosphere_quality, 0, 1, sim.atmosphere_quality),
    });
  }
);

export const reset_simulation = spacetimedb.reducer(
  { place_id: t.string() },
  (ctx, { place_id }) => {
    const sim = ctx.db.simulation.place_id.find(place_id);
    if (!sim) throw new SenderError('Generate personas for this business first');
    ctx.db.simulation.place_id.update({ ...sim, sim_minute: 0 });
    ctx.db.agent_event.place_id.delete(place_id);
    for (const state of [...ctx.db.agent_state.place_id.filter(place_id)]) {
      ctx.db.agent_state.agent_id.update({
        ...state,
        activity: 'home',
        minutes_in_activity: 0,
        waited_minutes: 0,
        mood: 0.5,
        visits: 0,
      });
    }
  }
);

function validateName(name: string) {
  if (!name) throw new SenderError('Names must not be empty');
}

export const set_name = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    validateName(name);
    const user = ctx.db.user.identity.find(ctx.sender);
    if (!user) throw new SenderError('Cannot set name for unknown user');
    console.info(`User ${ctx.sender} sets name to ${name}`);
    ctx.db.user.identity.update({ ...user, name });
  }
);

function validateMessage(text: string) {
  if (!text) throw new SenderError('Messages must not be empty');
}

export const send_message = spacetimedb.reducer(
  { text: t.string() },
  (ctx, { text }) => {
    // Things to consider:
    // - Rate-limit messages per-user.
    // - Reject messages from unnamed user.
    validateMessage(text);
    console.info(`User ${ctx.sender}: ${text}`);
    ctx.db.message.insert({
      sender: ctx.sender,
      text,
      sent: ctx.timestamp,
    });
  }
);

// Called when the module is initially published
export const init = spacetimedb.init(_ctx => {});

export const onConnect = spacetimedb.clientConnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    // If this is a returning user, i.e. we already have a `User` with this `Identity`,
    // set `online: true`, but leave `name` and `identity` unchanged.
    ctx.db.user.identity.update({ ...user, online: true });
  } else {
    // If this is a new user, create a `User` row for the `Identity`,
    // which is online, but hasn't set a name.
    ctx.db.user.insert({
      name: undefined,
      identity: ctx.sender,
      online: true,
    });
  }
});

export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: false });
  } else {
    // This branch should be unreachable,
    // as it doesn't make sense for a client to disconnect without connecting first.
    console.warn(
      `Disconnect event for unknown user with identity ${ctx.sender}`
    );
  }
});
