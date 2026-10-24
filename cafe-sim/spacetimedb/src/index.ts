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

// One menu item per store, merged from Uber Eats, Google Maps menu photos and the store's own website
const menu_item = table(
  { name: 'menu_item', public: true },
  {
    item_id: t.u32().primaryKey().autoInc(),
    place_id: t.string().index(),
    name: t.string(),
    // Normalized category used to compare stores, e.g. latte, drip_coffee, pastry
    category: t.string(),
    section: t.string(),
    description: t.string(),
    uber_price_cents: t.option(t.u32()),
    website_price_cents: t.option(t.u32()),
    // Best estimate of the in-store price
    predicted_price_cents: t.u32(),
    // photo | photo_aged | website | uber_adjusted | area_estimate
    price_source: t.string(),
    // 0-1, how much the predicted price can be trusted
    confidence: t.f64(),
    // Set when the owner enters the real price; takes precedence over predicted_price_cents
    override_price_cents: t.option(t.u32()),
    // Price read from a customer's menu photo on Google Maps, and that photo's upload date (YYYY-MM-DD)
    photo_price_cents: t.option(t.u32()).default(undefined),
    photo_date: t.string().default(''),
  }
);

// Where each store's menu came from and how its prices were predicted
const menu_source = table(
  { name: 'menu_source', public: true },
  {
    place_id: t.string().primaryKey(),
    uber_url: t.string(),
    uber_items: t.u32(),
    website_url: t.string(),
    // ok | no_website | no_prices | failed | skipped
    website_status: t.string(),
    website_items: t.u32(),
    // Uber Eats price divided by in-store price, used to convert Uber-only prices
    uber_markup: t.f64(),
    // store (measured on this store's items) | area (median of other stores) | default
    markup_basis: t.string(),
    // Median of this store's category prices relative to the area median (1 = typical)
    price_index: t.f64(),
    updated_at: t.timestamp(),
    menu_photos: t.u32().default(0),
    photo_items: t.u32().default(0),
    // Upload date of the newest menu photo (YYYY-MM-DD), empty when there are none
    newest_photo: t.string().default(''),
  }
);

// A what-if universe for the selected store. The base universe is the real data, and is never edited;
// a scenario only records its differences from it, so it picks up each refresh of the base data.
const scenario = table(
  { name: 'scenario', public: true },
  {
    scenario_id: t.u32().primaryKey().autoInc(),
    name: t.string(),
    created_at: t.timestamp(),
  }
);

// One change a scenario makes to the selected store's menu
const scenario_edit = table(
  { name: 'scenario_edit', public: true },
  {
    edit_id: t.u32().primaryKey().autoInc(),
    scenario_id: t.u32().index(),
    // price (new price for a base item) | remove (base item taken off the menu) | add (new item)
    kind: t.string(),
    // Name of the base menu item this edits; menu rows are recreated on refresh, so items are matched by name. Empty for added items.
    target_name: t.string(),
    name: t.string(),
    section: t.string(),
    category: t.string(),
    price_cents: t.u32(),
    updated_at: t.timestamp(),
  }
);

// One simulated day of one universe (scenario_id 0 is the base universe). Day numbers line up across
// universes, so day N of a scenario is compared with day N of the base.
const sim_day = table(
  { name: 'sim_day', public: true },
  {
    day_id: t.u32().primaryKey().autoInc(),
    scenario_id: t.u32().index(),
    day: t.u32(),
    // YYYY-MM-DD
    date: t.string(),
    weekday: t.string(),
    created_at: t.timestamp(),
  }
);

// Expected results for one store on one simulated day
const sim_store_day = table(
  { name: 'sim_store_day', public: true },
  {
    row_id: t.u32().primaryKey().autoInc(),
    day_id: t.u32().index(),
    scenario_id: t.u32().index(),
    place_id: t.string(),
    customers: t.f64(),
    revenue_cents: t.f64(),
    // Ingredient cost of what was sold, from each item's real price
    cost_cents: t.f64(),
  }
);

// A store an agent might visit on a simulated day, and what they would order there
const sim_visit = table(
  { name: 'sim_visit', public: true },
  {
    visit_id: t.u32().primaryKey().autoInc(),
    day_id: t.u32().index(),
    scenario_id: t.u32().index(),
    agent_id: t.u32(),
    place_id: t.string(),
    // 0-1 chance the agent makes this visit
    chance: t.f64(),
    // Real customers this visit stands for (the agent's group size times chance)
    customers: t.f64(),
    // Names of the items ordered
    items_json: t.string(),
    spend_cents: t.u32(),
    cost_cents: t.u32(),
    reason: t.string(),
  }
);

// A day for the agent worker (agents/worker.ts) to simulate in one universe
const agent_job = table(
  { name: 'agent_job', public: true },
  {
    job_id: t.u32().primaryKey().autoInc(),
    scenario_id: t.u32(),
    day: t.u32(),
    date: t.string(),
    weekday: t.string(),
    // queued | running | done | error
    status: t.string(),
    message: t.string(),
    agents_total: t.u32(),
    agents_done: t.u32(),
    created_at: t.timestamp(),
    updated_at: t.timestamp(),
  }
);

// Every store's menu as it is in one universe, for agents to query over MCP. Rebuilt when an agent day starts.
const universe_menu = table(
  { name: 'universe_menu', public: true },
  {
    row_id: t.u32().primaryKey().autoInc(),
    scenario_id: t.u32().index(),
    place_id: t.string(),
    store_name: t.string(),
    name: t.string(),
    section: t.string(),
    price_cents: t.u32(),
    // The real price when the scenario changed it, otherwise 0
    previous_price_cents: t.u32(),
    // '' | price | new | removed
    change: t.string(),
    cost_cents: t.u32(),
  }
);

// One agent's plan for an agent job, and the SQL it ran to make it
const agent_plan = table(
  { name: 'agent_plan', public: true },
  {
    plan_id: t.u32().primaryKey().autoInc(),
    job_id: t.u32().index(),
    agent_id: t.u32(),
    // [{ place_id, chance, items: [item names], reason }]
    visits_json: t.string(),
    queries_json: t.string(),
    created_at: t.timestamp(),
  }
);

const spacetimedb = schema(
  {
    scenario,
    scenario_edit,
    sim_day,
    sim_store_day,
    sim_visit,
    agent_job,
    universe_menu,
    agent_plan,
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
    menu_item,
    menu_source,
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

function clearTimeline(tx: Tx) {
  tx.db.agent_plan.clear();
  tx.db.agent_job.clear();
  tx.db.universe_menu.clear();
  tx.db.sim_visit.clear();
  tx.db.sim_store_day.clear();
  tx.db.sim_day.clear();
}

function clearStoreData(tx: Tx) {
  clearTimeline(tx);
  // Scenarios edit the selected store's menu, so they mean nothing once the store changes
  tx.db.scenario_edit.clear();
  tx.db.scenario.clear();
  tx.db.menu_item.clear();
  tx.db.menu_source.clear();
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
  // A plain prompt, or content blocks (text, image and document) for multimodal input
  content: string | object[],
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
      messages: [{ role: 'user', content }],
      output_config: { format: { type: 'json_schema', schema } },
      // Thinking can use up the token budget before the JSON is written, and roughly doubles the time.
      // Sonnet only accepts between_tools for this; Haiku only accepts disabled.
      thinking: { type: model === PERSONA_MODEL ? 'between_tools' : 'disabled' },
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
          // Simulated days refer to the old agents
          if (i === 0) clearTimeline(tx);
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

// ─────────────────────────────────────────────────────────────────────────────
// MENUS AND PRICE PREDICTION
// ─────────────────────────────────────────────────────────────────────────────
const UBER_EATS_ACTOR = 'borderline~uber-eats-scraper-ppr';
const MENU_MODEL = VOICE_MODEL;
// An Uber Eats store this close to the Google Maps location (and with a similar name) is the same store
const UBER_MATCH_METERS = 150;
const UBER_SAME_PLACE_METERS = 40;
const APIFY_CONCURRENT_RUNS = 5;
const UBER_MAX_POLLS = 30;
// Delivery-app markup used only when no store has counter and Uber Eats prices to measure it.
// Many small cafes charge the same on Uber Eats, so this is kept low.
const DEFAULT_UBER_MARKUP = 1.1;
const MIN_UBER_MARKUP = 1;
const MAX_UBER_MARKUP = 1.6;
const MIN_PAIRS_FOR_STORE_MARKUP = 2;
const MENU_PHOTOS_ACTOR = 'solidcode~google-maps-photos-scraper';
const MAX_MENU_PHOTOS_PER_STORE = 8;
// Customer photos can be years old; older ones only fill gaps, with prices raised for their age
const RECENT_PHOTO_MONTHS = 18;
const DEFAULT_YEARLY_PRICE_GROWTH = 1.05;
const MAX_YEARLY_PRICE_GROWTH = 1.15;
const MIN_PAIRS_FOR_PRICE_GROWTH = 3;
const MIN_STORES_FOR_AREA_GROWTH = 3;
// Website reading is off for now; menu photos and Uber Eats cover more cafes
const READ_STORE_WEBSITES = false;
const MAX_ITEM_PRICE_CENTS = 10_000;
const WEBSITE_FETCH_TIMEOUT = { __time_duration_micros__: 20n * 1_000_000n } as any;
const MAX_MENU_PAGES = 4;
const MAX_MENU_PDFS = 2;
const MAX_MENU_IMAGES = 3;
const MAX_MENU_TEXT_CHARS = 24_000;
const MAX_MENU_FILE_BYTES = 3_500_000;
const BROWSER_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,*/*',
};
// Online-ordering hosts show in-store prices, so menu links to them are followed even though they are off-site
const ORDERING_HOSTS = /toasttab\.com|square\.site|squareup\.com|clover\.com|chownow\.com|order\.online|olo\.com|bentobox|popmenu|spoton|menufy|order\.store/i;
// Delivery apps carry the markup we are trying to avoid, and social sites have no menu text
const SKIPPED_HOSTS = /ubereats|doordash|grubhub|postmates|seamless|instagram|facebook|twitter|x\.com|tiktok|yelp|google\.|apple\.com|linkedin/i;

// Checked in order, so more specific drinks come first
const MENU_CATEGORIES: [string, RegExp][] = [
  ['matcha_latte', /matcha/],
  ['chai_latte', /\bchai\b/],
  ['boba_milk_tea', /\bboba\b|bubble tea|milk tea|tapioca/],
  ['mocha', /\bmocha\b/],
  ['cold_brew', /cold brew/],
  ['cappuccino', /cappuccino/],
  ['flat_white', /flat white|cortado|gibraltar/],
  ['latte', /\blatte\b/],
  ['americano', /americano/],
  ['espresso', /espresso|macchiato/],
  ['drip_coffee', /drip|brewed coffee|house coffee|coffee of the day|pour.?over|^(hot |iced )?coffee$/],
  ['tea', /\btea\b|chamomile|earl grey|london fog/],
  ['smoothie', /smoothie|acai/],
  ['juice', /juice|lemonade/],
  ['soda', /root beer|ginger beer|ginger ale|\bsoda\b|\bcola\b|coke|sprite|sparkling water|kombucha/],
  ['alcohol', /\bbeer\b|\bwine\b|cocktail|margarita|martini|mimosa|bloody mary|spritz|\bipa\b|whiske?y|vodka|tequila|\bgin\b/],
  ['breakfast_sandwich', /breakfast sandwich|\beggs?\b.*(croissant|bagel|sandwich|muffin|biscuit|roll)|(croissant|bagel|biscuit) .*\beggs?\b/],
  ['croissant', /croissant/],
  ['bagel', /bagel/],
  ['breakfast', /pancake|waffle|french toast/],
  ['pastry', /muffin|scone|danish|cookie|brownie|pastry|cinnamon roll|donut|doughnut|\bcake\b|cheesecake|cupcake|banana bread|loaf|\btart\b/],
  ['breakfast', /burrito|omelet|pancake|waffle|french toast|\beggs?\b|benedict|granola|oatmeal|yogurt|toast\b/],
  ['sandwich', /sandwich|panini|\bwrap\b|\bmelt\b|\bclub\b|\bblt\b|burger/],
  ['salad', /salad|\bbowl\b/],
];
// Categories shown as estimates for stores with no menu found anywhere
const ESTIMATED_CATEGORIES: Record<string, string> = {
  latte: 'Latte',
  cappuccino: 'Cappuccino',
  americano: 'Americano',
  drip_coffee: 'Drip coffee',
  cold_brew: 'Cold brew',
  tea: 'Tea',
  croissant: 'Croissant',
  pastry: 'Pastry',
  breakfast: 'Breakfast item',
  breakfast_sandwich: 'Breakfast sandwich',
  sandwich: 'Sandwich',
};

type RawMenuItem = {
  name: string;
  section: string;
  description: string;
  price_cents: number;
  category: string;
  // Upload date of the menu photo the price was read from
  photo_date?: string;
};
type StoreMenu = {
  store: Business;
  uber: RawMenuItem[];
  uber_url: string;
  web: RawMenuItem[];
  website_url: string;
  website_status: string;
  photos: RawMenuItem[];
  menu_photos: number;
  newest_photo: string;
};
type MenuItemRow = Omit<NonNullable<ReturnType<Tx['db']['menu_item']['item_id']['find']>>, 'item_id'>;
type MenuSourceRow = Omit<NonNullable<ReturnType<Tx['db']['menu_source']['place_id']['find']>>, 'updated_at'>;

function foldText(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function categorizeMenuItem(name: string, section: string) {
  const item = foldText(name).replace(/\(.*?\)/g, '').trim();
  for (const [category, pattern] of MENU_CATEGORIES) if (pattern.test(item)) return category;
  const heading = foldText(section);
  if (/coffee|espresso/.test(heading)) return 'specialty_coffee';
  if (/\btea\b/.test(heading)) return 'tea';
  if (/pastr|bak/.test(heading)) return 'pastry';
  if (/drink|beverage/.test(heading)) return 'other_drink';
  return 'other';
}

function nameTokens(name: string) {
  return new Set(
    foldText(name)
      .replace(/\(.*?\)/g, ' ')
      .replace(/\b\d+(\.\d+)?\s?(fl\.? ?oz|oz|ml|l)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter(word => word.length > 1 && !['the', 'and', 'with', 'of', 'st', 'cafe'].includes(word))
  );
}

function nameSimilarity(a: string, b: string) {
  const left = nameTokens(a);
  const right = nameTokens(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared++;
  return shared / (left.size + right.size - shared);
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function roundToNickel(cents: number) {
  return Math.max(5, Math.round(cents / 5) * 5);
}

// ── Uber Eats ────────────────────────────────────────────────────────────────

function startUberEatsSearch(ctx: ProcedureCtx<Db>, store: Business) {
  return startApifyRun(ctx, UBER_EATS_ACTOR, {
    query: store.name,
    latitude: store.latitude,
    longitude: store.longitude,
    maxRows: 3,
    diningMode: 'PICKUP',
  });
}

function matchUberEatsStore(store: Business, results: ApifyPlace[]) {
  let best: { result: ApifyPlace; score: number } | null = null;
  for (const result of results) {
    const lat = Number(result.location?.latitude);
    const lng = Number(result.location?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const distance = distanceMeters(store.latitude, store.longitude, lat, lng);
    const similarity = nameSimilarity(store.name, result.title ?? '');
    const sameStore = distance <= UBER_SAME_PLACE_METERS || (distance <= UBER_MATCH_METERS && similarity >= 0.3);
    if (sameStore && (!best || similarity > best.score)) best = { result, score: similarity };
  }
  return best?.result ?? null;
}

function uberEatsItems(result: ApifyPlace): RawMenuItem[] {
  const sections: ApifyPlace[] = Array.isArray(result.menu) ? result.menu : [];
  // Featured sections repeat items from the real sections, so read those last
  const isFeatured = (s: ApifyPlace) => /featured|picked for you|popular|most liked/i.test(s.catalogName ?? '');
  const ordered = [...sections.filter(s => !isFeatured(s)), ...sections.filter(isFeatured)];
  const seen = new Set<string>();
  const items: RawMenuItem[] = [];
  for (const section of ordered) {
    for (const item of section.catalogItems ?? []) {
      const price = Math.round(Number(item.price));
      // Stores often list the same item in several catalogs (e.g. "Hot Drinks" and "HOT DRINKS") under new ids
      const key = [...nameTokens(item.title ?? '')].sort().join(' ') || item.uuid;
      if (!item.title || seen.has(key) || !(price > 0 && price <= MAX_ITEM_PRICE_CENTS)) continue;
      seen.add(key);
      const sectionName = section.catalogName ?? '';
      items.push({
        name: item.title,
        section: sectionName,
        description: item.itemDescription ?? '',
        price_cents: price,
        category: categorizeMenuItem(item.title, sectionName),
      });
    }
  }
  return items;
}

// The Apify free plan allows only a few concurrent runs, so searches are started as earlier ones finish
function uberEatsQueue(ctx: ProcedureCtx<Db>, menus: StoreMenu[], maxRuns: number) {
  const waiting = menus.map((_, i) => i);
  const active = new Map<number, ApifyRun>();
  const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

  const collect = (i: number, run: ApifyRun) => {
    const store = menus[i].store;
    if (run.status !== 'SUCCEEDED') {
      console.warn(`Uber Eats search for ${store.name} ended with status ${run.status}`);
      return;
    }
    try {
      const match = matchUberEatsStore(store, apifyRequest(ctx, `datasets/${run.defaultDatasetId}/items?clean=true&format=json`));
      if (match) {
        menus[i].uber = uberEatsItems(match);
        menus[i].uber_url = match.url ?? '';
      }
    } catch (error) {
      console.warn(`Uber Eats results for ${store.name} could not be read: ${describe(error)}`);
    }
  };

  const settle = (i: number, run: ApifyRun) => {
    if (run.status === 'READY' || run.status === 'RUNNING') active.set(i, run);
    else {
      active.delete(i);
      collect(i, run);
    }
  };

  // Collects finished runs and starts waiting searches without blocking
  const pump = () => {
    for (const [i, run] of [...active]) {
      try {
        settle(i, apifyRequest(ctx, `actor-runs/${run.id}`).data);
      } catch (error) {
        console.warn(`Uber Eats run ${run.id} could not be checked: ${describe(error)}`);
      }
    }
    while (active.size < maxRuns && waiting.length > 0) {
      const i = waiting[0];
      try {
        active.set(i, startUberEatsSearch(ctx, menus[i].store));
        waiting.shift();
      } catch (error) {
        if (/concurrent-runs-limit/.test(describe(error))) break;
        waiting.shift();
        console.warn(`Uber Eats search failed to start for ${menus[i].store.name}: ${describe(error)}`);
      }
    }
  };

  // Blocks until every search has finished, or gives up after the poll budget
  const finish = (onProgress: (remaining: number) => void) => {
    for (let polls = 0; active.size + waiting.length > 0; polls++) {
      if (polls >= UBER_MAX_POLLS) {
        console.warn(`Gave up on ${active.size + waiting.length} Uber Eats searches`);
        return;
      }
      pump();
      onProgress(active.size + waiting.length);
      const [first] = active;
      if (!first) continue;
      try {
        settle(first[0], apifyRequest(ctx, `actor-runs/${first[1].id}?waitForFinish=${APIFY_WAIT_SECS}`).data);
      } catch (error) {
        console.warn(`Uber Eats run ${first[1].id} could not be checked: ${describe(error)}`);
      }
    }
  };

  return { pump, finish };
}

// ── Store websites ───────────────────────────────────────────────────────────

function hostOf(url: string) {
  return (/^https?:\/\/([^/?#:]+)/i.exec(url)?.[1] ?? '').toLowerCase().replace(/^www\./, '');
}

// The module runtime has no URL class, so relative links are resolved by hand
function resolveUrl(base: string, href: string) {
  const link = href.trim().replace(/&amp;/g, '&');
  if (!link || /^(mailto|tel|javascript|data|sms):/i.test(link)) return null;
  if (/^https?:\/\//i.test(link)) return link.replace(/#.*$/, '');
  const origin = /^(https?:\/\/[^/?#]+)/i.exec(base)?.[1];
  if (!origin) return null;
  if (link.startsWith('//')) return `${origin.split('//')[0]}${link}`.replace(/#.*$/, '');
  if (link.startsWith('#')) return null;
  if (link.startsWith('/')) return `${origin}${link}`.replace(/#.*$/, '');
  const path = base.slice(origin.length).replace(/[?#].*$/, '');
  const dir = path.includes('/') ? path.replace(/[^/]*$/, '') : '/';
  return `${origin}${dir}${link}`.replace(/#.*$/, '');
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|head)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|tr|h[1-6]|section|article)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function fetchPage(ctx: ProcedureCtx<Db>, url: string) {
  try {
    const response = ctx.http.fetch(url, { headers: BROWSER_HEADERS, timeout: WEBSITE_FETCH_TIMEOUT });
    if (!response.ok) return null;
    return { url: response.url || url, response, contentType: response.headers.get('content-type') ?? '' };
  } catch {
    return null;
  }
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// The module runtime has no btoa or Buffer
function toBase64(bytes: Uint8Array) {
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    chunks.push(
      BASE64_CHARS[(n >> 18) & 63] +
        BASE64_CHARS[(n >> 12) & 63] +
        (i + 1 < bytes.length ? BASE64_CHARS[(n >> 6) & 63] : '=') +
        (i + 2 < bytes.length ? BASE64_CHARS[n & 63] : '=')
    );
  }
  return chunks.join('');
}

// Claude can't always download menu files itself (many sit behind redirects), so they are sent inline
function fetchMenuFile(ctx: ProcedureCtx<Db>, url: string) {
  const file = fetchPage(ctx, url);
  if (!file) return null;
  const bytes = file.response.bytes();
  if (bytes.length === 0 || bytes.length > MAX_MENU_FILE_BYTES) return null;
  const type = file.contentType.split(';')[0].trim().toLowerCase();
  const data = toBase64(bytes);
  if (type === 'application/pdf' || (/\.pdf(\?|$)/i.test(url) && !type.startsWith('text/'))) {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } };
  }
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type)) {
    return { type: 'image', source: { type: 'base64', media_type: type, data } };
  }
  return null;
}

type MenuLink = { url: string; score: number; pdf: boolean };

function menuLinks(html: string, pageUrl: string, siteHosts: Set<string>) {
  const links: MenuLink[] = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = resolveUrl(pageUrl, match[1]);
    if (!url) continue;
    const host = hostOf(url);
    const pdf = /\.pdf(\?|$)/i.test(url);
    const ordering = ORDERING_HOSTS.test(host);
    if (SKIPPED_HOSTS.test(host) || (!siteHosts.has(host) && !ordering && !pdf)) continue;
    const label = foldText(`${url} ${htmlToText(match[2])}`);
    let score = 0;
    if (/menu/.test(label)) score += 3;
    if (/order|food|drink|coffee|cafe|eat|breakfast|lunch|brunch|all.?day|bev/.test(label)) score += 1;
    if (/wine|reserve|dessert|cocktail|happy.?hour|catering|event|press|career|job|gift/.test(label)) score -= 2;
    if (ordering) score += 2;
    if (score > 0 || (pdf && score === 0)) links.push({ url, score, pdf });
  }
  return links;
}

function menuImages(html: string, pageUrl: string) {
  const images: string[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = /\b(?:data-src|src)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    const alt = /\balt\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    if (!src || !/menu/i.test(`${src} ${alt}`)) continue;
    const url = resolveUrl(pageUrl, src);
    if (!url || !/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) continue;
    // Squarespace serves the original upload by default, which can be many megabytes
    images.push(/squarespace-cdn\.com/.test(url) ? `${url.replace(/\?.*$/, '')}?format=1500w` : url);
  }
  return images;
}

function bestLinks(links: MenuLink[], count: number, skip: Set<string>) {
  const best = new Map<string, number>();
  for (const link of links) if (!skip.has(link.url)) best.set(link.url, Math.max(best.get(link.url) ?? -Infinity, link.score));
  return [...best].sort((a, b) => b[1] - a[1]).slice(0, count).map(([url]) => url);
}

const WEBSITE_MENU_SYSTEM = `You extract menu items and their in-store prices from a cafe or restaurant's own website, including page text, menu photos and menu PDFs.
Only include items whose price is shown. When several sizes are listed, use the smallest or regular size. Ignore add-on charges (like +$0.75 oat milk), gift cards, merchandise, retail bags of beans, catering trays and delivery fees.
If the pages do not contain a priced menu, return an empty items list.`;

const WEBSITE_MENU_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'section', 'price_dollars'],
        properties: {
          name: { type: 'string' },
          section: { type: 'string', description: 'menu heading the item is listed under, or empty' },
          price_dollars: { type: 'number' },
        },
      },
    },
  },
};

function scrapeWebsiteMenu(ctx: ProcedureCtx<Db>, store: Business): { items: RawMenuItem[]; status: string; url: string } {
  const website = store.website.trim();
  if (!/^https?:\/\//i.test(website) || SKIPPED_HOSTS.test(hostOf(website))) {
    return { items: [], status: 'no_website', url: website };
  }
  const home = fetchPage(ctx, website);
  if (!home) return { items: [], status: 'failed', url: website };

  // Sites often redirect to a new domain, so links on either one count as on-site
  const siteHosts = new Set([hostOf(website), hostOf(home.url)]);
  const pages = [{ url: home.url, html: home.response.text() }];
  const links = menuLinks(pages[0].html, home.url, siteHosts);
  const visited = new Set([website, home.url]);
  for (const url of bestLinks(links.filter(l => !l.pdf), MAX_MENU_PAGES - 1, visited)) {
    visited.add(url);
    const page = fetchPage(ctx, url);
    if (!page || !/html|text/i.test(page.contentType)) continue;
    const html = page.response.text();
    pages.push({ url: page.url, html });
    links.push(...menuLinks(html, page.url, siteHosts));
  }

  let text = '';
  for (const page of pages) {
    const pageText = htmlToText(page.html);
    if (pageText) text += `\n\n=== ${page.url}\n${pageText}`;
  }
  text = text.slice(0, MAX_MENU_TEXT_CHARS);

  const media: object[] = [];
  for (const url of bestLinks(links.filter(l => l.pdf), MAX_MENU_PDFS, new Set())) {
    const file = fetchMenuFile(ctx, url);
    if (file) media.push(file);
  }
  const imageUrls = [...new Set(pages.flatMap(p => menuImages(p.html, p.url)))].slice(0, MAX_MENU_IMAGES);
  for (const url of imageUrls) {
    const file = fetchMenuFile(ctx, url);
    if (file) media.push(file);
  }

  const hasPrices = /\$\s?\d|\d+\.\d{2}\b/.test(text);
  if (!hasPrices && media.length === 0) return { items: [], status: 'no_prices', url: website };

  const prompt = { type: 'text', text: `Store: ${store.name} (${store.category})\nWebsite pages:${text}` };
  let extracted: any = null;
  // One unreadable PDF or image makes Claude reject the whole request, so fall back to the page text alone
  for (const content of media.length ? [[...media, prompt], [prompt]] : [[prompt]]) {
    try {
      extracted = callClaudeForJson(ctx, MENU_MODEL, WEBSITE_MENU_SYSTEM, content, 8000, WEBSITE_MENU_SCHEMA);
      break;
    } catch (error) {
      console.warn(`Menu extraction failed for ${store.name}: ${error instanceof Error ? error.message : error}`);
      extracted = null;
    }
  }
  if (!extracted) return { items: [], status: 'failed', url: website };

  const items: RawMenuItem[] = [];
  for (const item of extracted.items ?? []) {
    const price = Math.round(Number(item.price_dollars) * 100);
    if (!item.name || !(price > 0 && price <= MAX_ITEM_PRICE_CENTS)) continue;
    items.push({
      name: String(item.name),
      section: String(item.section ?? ''),
      description: '',
      price_cents: price,
      category: categorizeMenuItem(String(item.name), String(item.section ?? '')),
    });
  }
  return { items, status: items.length ? 'ok' : 'no_prices', url: website };
}

// ── Google Maps menu photos ─────────────────────────────────────────────────

type MenuPhoto = { url: string; date: string };

function startMenuPhotosRun(ctx: ProcedureCtx<Db>, stores: Business[]) {
  return startApifyRun(ctx, MENU_PHOTOS_ACTOR, {
    placeIds: stores.map(s => s.place_id),
    photoCategories: ['menu'],
    maxPhotosPerPlace: MAX_MENU_PHOTOS_PER_STORE,
    imageSize: 'large',
    concurrentPlaces: 4,
  });
}

// Results are keyed by hex CID, but each one's url still contains the place ID we asked for
function menuPhotosByPlace(results: ApifyPlace[]) {
  const byPlace = new Map<string, MenuPhoto[]>();
  for (const result of results) {
    const placeId = /place_id:([^&]+)/.exec(result.url ?? '')?.[1];
    if (!placeId) continue;
    const photos: MenuPhoto[] = (result.photos ?? [])
      .filter((p: ApifyPlace) => p.imageUrl)
      .map((p: ApifyPlace) => ({ url: p.imageUrl, date: /^\d{4}-\d{2}-\d{2}/.exec(String(p.uploadDate ?? ''))?.[0] ?? '' }));
    byPlace.set(placeId, photos.sort((a, b) => b.date.localeCompare(a.date)));
  }
  return byPlace;
}

const MENU_PHOTO_SYSTEM = `You read customer photos of a cafe or restaurant's menu, posted on Google Maps, and extract menu items with their prices.
Skip photos that are not menus or price boards. When several sizes are listed, use the smallest or regular size. Ignore add-on charges (like +$0.75 oat milk).
When the same item appears in more than one photo, return it once, with the price from the most recently uploaded photo and that photo's upload date.`;

const MENU_PHOTO_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'section', 'price_dollars', 'photo_date'],
        properties: {
          name: { type: 'string' },
          section: { type: 'string', description: 'menu heading the item is listed under, or empty' },
          price_dollars: { type: 'number' },
          photo_date: { type: 'string', description: 'upload date of the photo the price was read from' },
        },
      },
    },
  },
};

function readMenuPhotos(ctx: ProcedureCtx<Db>, store: Business, photos: MenuPhoto[]): RawMenuItem[] {
  const prompt = { type: 'text', text: `Store: ${store.name} (${store.category}). Extract every menu item with a price.` };
  const withPhotos = (image: (photo: MenuPhoto) => object | null) => {
    const content: object[] = [];
    for (const photo of photos) {
      const block = image(photo);
      if (block) content.push({ type: 'text', text: `Photo uploaded ${photo.date || 'on an unknown date'}:` }, block);
    }
    return content.length ? [...content, prompt] : null;
  };
  // Claude downloads the photos itself; if one can't be fetched, send them all inline instead
  const attempts = [
    () => withPhotos(photo => ({ type: 'image', source: { type: 'url', url: photo.url } })),
    () => withPhotos(photo => fetchMenuFile(ctx, photo.url)),
  ];
  let extracted: any = null;
  for (const attempt of attempts) {
    const content = attempt();
    if (!content) continue;
    try {
      extracted = callClaudeForJson(ctx, MENU_MODEL, MENU_PHOTO_SYSTEM, content, 12000, MENU_PHOTO_SCHEMA);
      break;
    } catch (error) {
      console.warn(`Reading menu photos failed for ${store.name}: ${error instanceof Error ? error.message : error}`);
    }
  }

  const dates = new Set(photos.map(p => p.date));
  const newest = photos[0]?.date ?? '';
  const byName = new Map<string, RawMenuItem>();
  for (const item of extracted?.items ?? []) {
    const price = Math.round(Number(item.price_dollars) * 100);
    const name = String(item.name ?? '').trim();
    if (!name || !(price > 0 && price <= MAX_ITEM_PRICE_CENTS)) continue;
    const photoDate = dates.has(item.photo_date) ? String(item.photo_date) : newest;
    const key = [...nameTokens(name)].sort().join(' ') || foldText(name);
    const existing = byName.get(key);
    if (existing && (existing.photo_date ?? '') >= photoDate) continue;
    const section = String(item.section ?? '');
    byName.set(key, {
      name,
      section,
      description: '',
      price_cents: price,
      category: categorizeMenuItem(name, section),
      photo_date: photoDate,
    });
  }
  return [...byName.values()];
}

function photoAgeYears(date: string | undefined, nowMicros: bigint) {
  const taken = Date.parse(`${date}T00:00:00Z`);
  if (!date || !Number.isFinite(taken)) return null;
  return Math.max(0, (Number(nowMicros / 1000n) - taken) / (365.25 * 24 * 3600 * 1000));
}

// ── Price prediction ─────────────────────────────────────────────────────────

// Pairs counter-price items with the same item on Uber Eats so the delivery-app markup can be measured
function pairMenuItems(counter: RawMenuItem[], uber: RawMenuItem[]) {
  const used = new Set<number>();
  const pairs: { counter: RawMenuItem; uber: RawMenuItem }[] = [];
  for (const counterItem of counter) {
    let bestIndex = -1;
    let bestScore = 0.6;
    uber.forEach((uberItem, index) => {
      if (used.has(index) || uberItem.category !== counterItem.category) return;
      const score = nameSimilarity(counterItem.name, uberItem.name);
      if (score >= bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    if (bestIndex >= 0) {
      used.add(bestIndex);
      pairs.push({ counter: counterItem, uber: uber[bestIndex] });
    }
  }
  return pairs;
}

function googlePriceLevel(price: string) {
  const dollars = /^\s*(\$+)\s*$/.exec(price)?.[1].length;
  if (dollars) return [0, 0.85, 1, 1.25, 1.5][Math.min(dollars, 4)];
  const range = /(\d+)\D+(\d+)/.exec(price);
  return range ? (Number(range[1]) + Number(range[2])) / 2 : null;
}

function predictMenus(menus: StoreMenu[], nowMicros: bigint) {
  // 1. Counter prices come from the store's website and recent menu photos; older photos only fill gaps
  const ageYears = (item: RawMenuItem) => photoAgeYears(item.photo_date, nowMicros);
  const isRecent = (item: RawMenuItem) => (ageYears(item) ?? Infinity) * 12 <= RECENT_PHOTO_MONTHS;
  const plans = menus.map(menu => {
    const recentPhotos = menu.photos.filter(isRecent);
    const photosOnWebsite = new Set(pairMenuItems(recentPhotos, menu.web).map(p => p.counter));
    const counter = [...menu.web, ...recentPhotos.filter(p => !photosOnWebsite.has(p))];
    const pairs = pairMenuItems(counter, menu.uber);
    const pairedUber = new Set(pairs.map(p => p.uber));
    const oldPairs = pairMenuItems(
      menu.photos.filter(p => !isRecent(p)),
      menu.uber.filter(u => !pairedUber.has(u))
    );
    return { menu, counter, pairs, oldPairs };
  });

  // 2. Measure the Uber Eats markup per store, then for the area
  const storeMarkups = new Map<string, number>();
  for (const { menu, pairs } of plans) {
    const ratios = pairs.map(p => p.uber.price_cents / p.counter.price_cents).filter(r => r >= 0.8 && r <= 2);
    if (ratios.length >= MIN_PAIRS_FOR_STORE_MARKUP) {
      storeMarkups.set(menu.store.place_id, clamp(median(ratios), MIN_UBER_MARKUP, MAX_UBER_MARKUP, DEFAULT_UBER_MARKUP));
    }
  }
  const measuredAreaMarkup = median([...storeMarkups.values()]);
  const areaMarkup = measuredAreaMarkup ?? DEFAULT_UBER_MARKUP;
  const markupFor = (placeId: string) => storeMarkups.get(placeId) ?? areaMarkup;

  // 3. Measure how fast prices rose since old photos, by comparing them with today's Uber Eats prices
  const storeGrowth = new Map<string, number>();
  for (const { menu, oldPairs } of plans) {
    const rates = oldPairs.flatMap(({ counter: old, uber }) => {
      const years = ageYears(old);
      if (!years || years < 1) return [];
      return [(uber.price_cents / markupFor(menu.store.place_id) / old.price_cents) ** (1 / years)];
    });
    const usable = rates.filter(r => r >= 0.9 && r <= 1.5);
    // Floored at the default: a stale Uber Eats listing, or one part of the menu that hasn't changed
    // (e.g. brunch), makes old photos look current even when other prices have risen
    if (usable.length >= MIN_PAIRS_FOR_PRICE_GROWTH) {
      storeGrowth.set(
        menu.store.place_id,
        clamp(median(usable), DEFAULT_YEARLY_PRICE_GROWTH, MAX_YEARLY_PRICE_GROWTH, DEFAULT_YEARLY_PRICE_GROWTH)
      );
    }
  }
  const areaGrowth =
    storeGrowth.size >= MIN_STORES_FOR_AREA_GROWTH ? median([...storeGrowth.values()])! : DEFAULT_YEARLY_PRICE_GROWTH;

  // 4. Merge the sources into predicted in-store prices
  const items: MenuItemRow[] = [];
  const sources: MenuSourceRow[] = [];
  for (const { menu, counter, pairs, oldPairs } of plans) {
    const placeId = menu.store.place_id;
    const storeMarkup = storeMarkups.get(placeId);
    const markup = markupFor(placeId);
    const markupBasis = storeMarkup ? 'store' : measuredAreaMarkup ? 'area' : 'default';
    const uberConfidence = storeMarkup ? 0.8 : measuredAreaMarkup ? 0.65 : 0.5;
    const growth = storeGrowth.get(placeId) ?? areaGrowth;
    const row = (item: RawMenuItem, fields: Partial<MenuItemRow>): MenuItemRow => ({
      place_id: placeId,
      name: item.name,
      category: item.category,
      section: item.section,
      description: item.description,
      uber_price_cents: undefined,
      website_price_cents: undefined,
      photo_price_cents: undefined,
      photo_date: '',
      predicted_price_cents: item.price_cents,
      price_source: item.photo_date !== undefined ? 'photo' : 'website',
      confidence: item.photo_date !== undefined ? 0.85 : 0.9,
      override_price_cents: undefined,
      ...fields,
    });
    const counterPrice = (item: RawMenuItem): Partial<MenuItemRow> =>
      item.photo_date !== undefined
        ? { photo_price_cents: item.price_cents, photo_date: item.photo_date }
        : { website_price_cents: item.price_cents };
    const uberAdjusted = (uber: RawMenuItem): Partial<MenuItemRow> => ({
      description: uber.description,
      uber_price_cents: uber.price_cents,
      predicted_price_cents: roundToNickel(uber.price_cents / markup),
      price_source: 'uber_adjusted',
      confidence: uberConfidence,
    });

    const paired = new Set<RawMenuItem>();
    for (const { counter: item, uber } of pairs) {
      paired.add(item).add(uber);
      items.push(row(item, { ...counterPrice(item), description: uber.description, uber_price_cents: uber.price_cents, confidence: 0.92 }));
    }
    for (const item of counter) if (!paired.has(item)) items.push(row(item, counterPrice(item)));
    // Today's Uber Eats price beats an old photo; the photo price is kept for reference
    for (const { counter: old, uber } of oldPairs) {
      paired.add(old).add(uber);
      items.push(row(uber, { ...uberAdjusted(uber), photo_price_cents: old.price_cents, photo_date: old.photo_date ?? '' }));
    }
    for (const uber of menu.uber) if (!paired.has(uber)) items.push(row(uber, uberAdjusted(uber)));
    for (const old of menu.photos) {
      if (isRecent(old) || paired.has(old)) continue;
      items.push(row(old, {
        ...counterPrice(old),
        predicted_price_cents: roundToNickel(old.price_cents * growth ** (ageYears(old) ?? 0)),
        price_source: 'photo_aged',
        confidence: 0.45,
      }));
    }

    sources.push({
      place_id: placeId,
      uber_url: menu.uber_url,
      uber_items: menu.uber.length,
      website_url: menu.website_url,
      website_status: menu.website_status,
      website_items: menu.web.length,
      uber_markup: menu.uber.length ? markup : 0,
      markup_basis: menu.uber.length ? markupBasis : 'none',
      price_index: 1,
      menu_photos: menu.menu_photos,
      photo_items: menu.photos.length,
      newest_photo: menu.newest_photo,
    });
  }

  // 3. Typical price of each category in the area (median of each store's median, so big menus don't dominate)
  const storeCategoryMedians = new Map<string, Map<string, number>>();
  for (const menu of menus) {
    const byCategory = new Map<string, number[]>();
    for (const item of items) {
      if (item.place_id !== menu.store.place_id) continue;
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item.predicted_price_cents]);
    }
    storeCategoryMedians.set(menu.store.place_id, new Map([...byCategory].map(([c, prices]) => [c, median(prices)!])));
  }
  const areaCategoryMedians = new Map<string, number>();
  const categoryStoreCounts = new Map<string, number>();
  for (const category of new Set([...storeCategoryMedians.values()].flatMap(m => [...m.keys()]))) {
    const values = [...storeCategoryMedians.values()].map(m => m.get(category)).filter((v): v is number => v !== undefined);
    areaCategoryMedians.set(category, median(values)!);
    categoryStoreCounts.set(category, values.length);
  }

  // 4. Price index for stores with menus; estimated menus for stores without one
  const priceLevels = menus.map(m => googlePriceLevel(m.store.price)).filter((v): v is number => v !== null && v > 2);
  const areaPriceLevel = median(priceLevels);
  for (const source of sources) {
    const own = storeCategoryMedians.get(source.place_id)!;
    const ratios = [...own]
      .filter(([category]) => (categoryStoreCounts.get(category) ?? 0) >= 2 && !['other', 'alcohol'].includes(category))
      .map(([category, price]) => price / areaCategoryMedians.get(category)!);
    if (ratios.length > 0) {
      // Geometric mean: with few shared categories a median is usually one store's own price, and a plain mean overweights outliers
      source.price_index = Math.exp(ratios.reduce((sum, r) => sum + Math.log(r), 0) / ratios.length);
      continue;
    }
    const store = menus.find(m => m.store.place_id === source.place_id)!.store;
    const level = googlePriceLevel(store.price);
    const factor = level === null ? 1 : level <= 2 ? level : areaPriceLevel ? clamp(level / areaPriceLevel, 0.7, 1.5, 1) : 1;
    source.price_index = factor;
    for (const [category, label] of Object.entries(ESTIMATED_CATEGORIES)) {
      const areaPrice = areaCategoryMedians.get(category);
      if (!areaPrice) continue;
      items.push({
        place_id: source.place_id,
        name: `${label} (estimated)`,
        category,
        section: 'Estimated from nearby stores',
        description: '',
        uber_price_cents: undefined,
        website_price_cents: undefined,
        photo_price_cents: undefined,
        photo_date: '',
        predicted_price_cents: roundToNickel(areaPrice * factor),
        price_source: 'area_estimate',
        confidence: 0.3,
        override_price_cents: undefined,
      });
    }
  }
  return { items, sources, areaMarkup, measuredAreaMarkup };
}

// Collects menus for the selected store and every competitor and predicts in-store prices
export const fetch_menus = spacetimedb.procedure({}, t.u32(), ctx => {
  const { running, stores, previousUber } = ctx.withTx(tx => {
    const job = tx.db.populate_job.job_id.find(JOB_ID);
    const storeId = job?.place_id ?? '';
    const placeIds = [storeId, ...[...tx.db.competitor.place_id.filter(storeId)].map(c => c.competitor_place_id)];
    // Uber Eats only shows the menu active right now (e.g. brunch), so earlier fetches fill in the rest
    const previousUber = new Map<string, { url: string; items: RawMenuItem[] }>();
    for (const placeId of placeIds) {
      const items: RawMenuItem[] = [...tx.db.menu_item.place_id.filter(placeId)]
        .filter(item => item.uber_price_cents !== undefined)
        .map(item => ({
          name: item.name,
          section: item.section,
          description: item.description,
          price_cents: item.uber_price_cents!,
          category: item.category,
        }));
      const url = tx.db.menu_source.place_id.find(placeId)?.uber_url ?? '';
      if (items.length > 0) previousUber.set(placeId, { url, items });
    }
    return {
      running:
        job?.status === 'running' &&
        tx.timestamp.microsSinceUnixEpoch - job.updated_at.microsSinceUnixEpoch < STALE_JOB_MICROS,
      stores: placeIds.map(id => tx.db.business.place_id.find(id)).filter((b): b is Business => !!b),
      previousUber,
    };
  });
  if (running) throw new SenderError('Wait for the current run to finish');
  if (stores.length === 0) throw new SenderError('Populate a store first');

  setJob(ctx, { status: 'running', message: `Finding menu photos and Uber Eats menus for ${stores.length} stores...` });
  try {
    const menus: StoreMenu[] = stores.map(store => ({
      store,
      uber: [],
      uber_url: '',
      web: [],
      website_url: store.website,
      website_status: READ_STORE_WEBSITES ? 'no_website' : 'skipped',
      photos: [],
      menu_photos: 0,
      newest_photo: '',
    }));
    let photoRun: ApifyRun | null = null;
    try {
      photoRun = startMenuPhotosRun(ctx, stores);
    } catch (error) {
      console.warn(`Menu photo search failed to start: ${error instanceof Error ? error.message : error}`);
    }
    // The photo run holds one of the account's concurrent Apify runs
    const uber = uberEatsQueue(ctx, menus, APIFY_CONCURRENT_RUNS - (photoRun ? 1 : 0));
    uber.pump();

    let photosByPlace = new Map<string, MenuPhoto[]>();
    if (photoRun) {
      for (let polls = 0; photoRun.status === 'READY' || photoRun.status === 'RUNNING'; polls++) {
        if (polls >= UBER_MAX_POLLS) break;
        photoRun = apifyRequest(ctx, `actor-runs/${photoRun.id}?waitForFinish=20`).data as ApifyRun;
        uber.pump();
      }
      if (photoRun.status === 'SUCCEEDED') {
        photosByPlace = menuPhotosByPlace(apifyRequest(ctx, `datasets/${photoRun.defaultDatasetId}/items?clean=true&format=json`));
      } else {
        console.warn(`Menu photo search ended with status ${photoRun.status}`);
      }
    }

    for (const [i, menu] of menus.entries()) {
      uber.pump();
      const photos = photosByPlace.get(menu.store.place_id) ?? [];
      if (photos.length > 0) {
        setJob(ctx, { message: `Reading ${photos.length} menu photos for ${menu.store.name} (${i + 1} of ${menus.length})...` });
        Object.assign(menu, {
          photos: readMenuPhotos(ctx, menu.store, photos),
          menu_photos: photos.length,
          newest_photo: photos[0].date,
        });
      }
      if (READ_STORE_WEBSITES) {
        setJob(ctx, { message: `Reading ${menu.store.name}'s website for prices (${i + 1} of ${menus.length})...` });
        const web = scrapeWebsiteMenu(ctx, menu.store);
        Object.assign(menu, { web: web.items, website_url: web.url, website_status: web.status });
      }
    }
    uber.finish(remaining => setJob(ctx, { message: `Collecting Uber Eats menus (${remaining} left)...` }));
    for (const menu of menus) {
      const previous = previousUber.get(menu.store.place_id);
      if (!previous) continue;
      const key = (item: RawMenuItem) => [...nameTokens(item.name)].sort().join(' ');
      const seen = new Set(menu.uber.map(key));
      for (const item of previous.items) {
        if (seen.has(key(item))) continue;
        seen.add(key(item));
        menu.uber.push(item);
      }
      menu.uber_url ||= previous.url;
    }

    const { items, sources, areaMarkup, measuredAreaMarkup } = predictMenus(menus, ctx.timestamp.microsSinceUnixEpoch);
    ctx.withTx(tx => {
      for (const source of sources) {
        tx.db.menu_item.place_id.delete(source.place_id);
        const row = { ...source, updated_at: tx.timestamp };
        if (tx.db.menu_source.place_id.find(source.place_id)) tx.db.menu_source.place_id.update(row);
        else tx.db.menu_source.insert(row);
      }
      for (const item of items) tx.db.menu_item.insert({ item_id: 0, ...item });
    });

    const withPhotos = sources.filter(s => s.photo_items > 0).length;
    const withWebsite = sources.filter(s => s.website_items > 0).length;
    const withUber = sources.filter(s => s.uber_items > 0).length;
    const markupNote = measuredAreaMarkup
      ? `Uber Eats markup measured at ${Math.round((areaMarkup - 1) * 100)}%`
      : `Uber Eats markup assumed ${Math.round((areaMarkup - 1) * 100)}%`;
    const found = [
      `${withPhotos} from menu photos`,
      ...(READ_STORE_WEBSITES ? [`${withWebsite} from websites`] : []),
      `${withUber} from Uber Eats`,
    ].join(', ');
    setJob(ctx, {
      status: 'done',
      message: `Menus for ${stores.length} stores: ${found} · ${items.length} items · ${markupNote}`,
    });
    return items.length;
  } catch (error) {
    setJob(ctx, { status: 'error', message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────
const MAX_SCENARIO_NAME_CHARS = 60;
const MAX_ITEM_NAME_CHARS = 80;

type ScenarioEdit = NonNullable<ReturnType<Tx['db']['scenario_edit']['edit_id']['find']>>;

function requireScenario(tx: Tx, scenario_id: number) {
  const found = tx.db.scenario.scenario_id.find(scenario_id);
  if (!found) throw new SenderError(`No scenario with id ${scenario_id}`);
  return found;
}

function cleanText(value: string, label: string, maxChars: number, required = true) {
  const text = value.trim().replace(/\s+/g, ' ');
  if (required && !text) throw new SenderError(`${label} must not be empty`);
  if (text.length > maxChars) throw new SenderError(`${label} must be at most ${maxChars} characters`);
  return text;
}

function validatePrice(price_cents: number) {
  if (!Number.isInteger(price_cents) || price_cents < 1 || price_cents > MAX_ITEM_PRICE_CENTS) {
    throw new SenderError(`Price must be between $0.01 and $${MAX_ITEM_PRICE_CENTS / 100}`);
  }
}

// Scenarios only edit the selected store's menu, never a competitor's
function ownMenuItem(tx: Tx, item_name: string) {
  const storeId = tx.db.populate_job.job_id.find(JOB_ID)?.place_id ?? '';
  const item = [...tx.db.menu_item.place_id.filter(storeId)].find(i => i.name === item_name);
  if (!item) throw new SenderError(`"${item_name}" is not on your store's menu`);
  return item;
}

function findEdit(tx: Tx, scenario_id: number, kind: string, target_name: string) {
  return [...tx.db.scenario_edit.scenario_id.filter(scenario_id)].find(
    e => e.kind === kind && e.target_name === target_name
  );
}

function saveEdit(tx: Tx, existing: ScenarioEdit | undefined, fields: Omit<ScenarioEdit, 'edit_id' | 'updated_at'>) {
  if (existing) tx.db.scenario_edit.edit_id.update({ ...existing, ...fields, updated_at: tx.timestamp });
  else tx.db.scenario_edit.insert({ edit_id: 0, ...fields, updated_at: tx.timestamp });
}

export const create_scenario = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  ctx.db.scenario.insert({
    scenario_id: 0,
    name: cleanText(name, 'Scenario name', MAX_SCENARIO_NAME_CHARS),
    created_at: ctx.timestamp,
  });
});

export const rename_scenario = spacetimedb.reducer({ scenario_id: t.u32(), name: t.string() }, (ctx, { scenario_id, name }) => {
  const found = requireScenario(ctx, scenario_id);
  ctx.db.scenario.scenario_id.update({ ...found, name: cleanText(name, 'Scenario name', MAX_SCENARIO_NAME_CHARS) });
});

export const delete_scenario = spacetimedb.reducer({ scenario_id: t.u32() }, (ctx, { scenario_id }) => {
  requireScenario(ctx, scenario_id);
  deleteUniverseDays(ctx, scenario_id);
  ctx.db.scenario_edit.scenario_id.delete(scenario_id);
  ctx.db.scenario.scenario_id.delete(scenario_id);
});

// Setting an item back to its real price removes the edit
export const set_item_price = spacetimedb.reducer(
  { scenario_id: t.u32(), item_name: t.string(), price_cents: t.u32() },
  (ctx, { scenario_id, item_name, price_cents }) => {
    requireScenario(ctx, scenario_id);
    validatePrice(price_cents);
    const item = ownMenuItem(ctx, item_name);
    const existing = findEdit(ctx, scenario_id, 'price', item.name);
    if (price_cents === (item.override_price_cents ?? item.predicted_price_cents)) {
      if (existing) ctx.db.scenario_edit.edit_id.delete(existing.edit_id);
      return;
    }
    saveEdit(ctx, existing, {
      scenario_id,
      kind: 'price',
      target_name: item.name,
      name: item.name,
      section: item.section,
      category: item.category,
      price_cents,
    });
  }
);

export const remove_item = spacetimedb.reducer(
  { scenario_id: t.u32(), item_name: t.string() },
  (ctx, { scenario_id, item_name }) => {
    requireScenario(ctx, scenario_id);
    const item = ownMenuItem(ctx, item_name);
    saveEdit(ctx, findEdit(ctx, scenario_id, 'remove', item.name), {
      scenario_id,
      kind: 'remove',
      target_name: item.name,
      name: item.name,
      section: item.section,
      category: item.category,
      price_cents: item.override_price_cents ?? item.predicted_price_cents,
    });
  }
);

export const add_item = spacetimedb.reducer(
  { scenario_id: t.u32(), name: t.string(), section: t.string(), price_cents: t.u32() },
  (ctx, { scenario_id, name, section, price_cents }) => {
    requireScenario(ctx, scenario_id);
    validatePrice(price_cents);
    const itemName = cleanText(name, 'Item name', MAX_ITEM_NAME_CHARS);
    const itemSection = cleanText(section, 'Section', MAX_ITEM_NAME_CHARS, false) || 'New items';
    ctx.db.scenario_edit.insert({
      edit_id: 0,
      scenario_id,
      kind: 'add',
      target_name: '',
      name: itemName,
      section: itemSection,
      category: categorizeMenuItem(itemName, itemSection),
      price_cents,
      updated_at: ctx.timestamp,
    });
  }
);

export const update_added_item = spacetimedb.reducer(
  { edit_id: t.u32(), name: t.string(), section: t.string(), price_cents: t.u32() },
  (ctx, { edit_id, name, section, price_cents }) => {
    const edit = ctx.db.scenario_edit.edit_id.find(edit_id);
    if (!edit || edit.kind !== 'add') throw new SenderError('Only added items can be changed this way');
    validatePrice(price_cents);
    const itemName = cleanText(name, 'Item name', MAX_ITEM_NAME_CHARS);
    const itemSection = cleanText(section, 'Section', MAX_ITEM_NAME_CHARS, false) || 'New items';
    ctx.db.scenario_edit.edit_id.update({
      ...edit,
      name: itemName,
      section: itemSection,
      category: categorizeMenuItem(itemName, itemSection),
      price_cents,
      updated_at: ctx.timestamp,
    });
  }
);

// Undoes one edit: restores a price or a removed item, or deletes an added item
export const revert_edit = spacetimedb.reducer({ edit_id: t.u32() }, (ctx, { edit_id }) => {
  if (!ctx.db.scenario_edit.edit_id.find(edit_id)) throw new SenderError(`No edit with id ${edit_id}`);
  ctx.db.scenario_edit.edit_id.delete(edit_id);
});

// ─────────────────────────────────────────────────────────────────────────────
// MARKET SIMULATION
// ─────────────────────────────────────────────────────────────────────────────
// Each simulated day, Claude sees every agent and every store's menu and estimates where each agent goes and
// what they order. A scenario's day starts from the base universe's plans for that day and only changes the
// customers its menu edits affect, so the difference between the two comes from the edits, not from sampling noise.
const MARKET_MODEL = VOICE_MODEL;
const MAX_DAYS_PER_RUN = 7;
const MAX_VISITS_PER_AGENT = 2;
const MAX_ITEMS_PER_VISIT = 4;
const MARKET_TOKENS_PER_AGENT = 220;
// Real customers per Google reviewer who decide where to go on a given day; turns each agent into a group of people
const DAILY_CUSTOMERS_PER_REVIEWER = 0.4;
// Ingredient cost as a share of an item's real price. Scenario price changes don't change what an item costs to make.
const DRINK_COST_SHARE = 0.25;
const FOOD_COST_SHARE = 0.32;
const DRINK_CATEGORIES = new Set([
  'matcha_latte', 'chai_latte', 'boba_milk_tea', 'mocha', 'cold_brew', 'cappuccino', 'flat_white', 'latte',
  'americano', 'espresso', 'drip_coffee', 'specialty_coffee', 'tea', 'smoothie', 'juice', 'soda', 'alcohol', 'other_drink',
]);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MILLIS = 86_400_000;

type SimItem = { code: string; name: string; section: string; price_cents: number; real_price_cents: number | null; cost_cents: number };
type SimStore = { code: string; place: Business; distance: number; items: SimItem[]; itemsByCode: Map<string, SimItem> };
type SimVisit = NonNullable<ReturnType<Tx['db']['sim_visit']['visit_id']['find']>>;
// One customer's plan for the day, in the shape Claude returns
type Plan = { customer: string; visits: { store: string; chance: number; items: string[]; reason: string }[] };
type Universe = {
  scenario_id: number;
  name: string;
  stores: SimStore[];
  // Base universe only: each agent's most likely visit the day before
  yesterday: Map<number, string>;
  // Scenarios only: the base universe's plans for the same day, and how the scenario's menu differs from the real one
  baseline: Plan[];
  changes: string[];
};
type MarketDay = { day: number; date: string; weekday: string; agents: Agent[]; places: Business[]; universeIds: number[] };

function costShare(category: string) {
  return DRINK_CATEGORIES.has(category) ? DRINK_COST_SHARE : FOOD_COST_SHARE;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Item codes come from the base menu's order, so they are the same in every universe
function simMenu(code: string, items: MenuItemRow[], edits: ScenarioEdit[]): SimItem[] {
  const base = [...items].sort((a, b) =>
    a.section !== b.section ? (a.section < b.section ? -1 : 1) : a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );
  const menu: SimItem[] = [];
  base.forEach((item, index) => {
    if (edits.some(e => e.kind === 'remove' && e.target_name === item.name)) return;
    const price = item.override_price_cents ?? item.predicted_price_cents;
    const changed = edits.find(e => e.kind === 'price' && e.target_name === item.name);
    menu.push({
      code: `${code}-${index + 1}`,
      name: item.name,
      section: item.section,
      price_cents: changed?.price_cents ?? price,
      real_price_cents: changed ? price : null,
      cost_cents: Math.round(price * costShare(item.category)),
    });
  });
  edits
    .filter(e => e.kind === 'add')
    .forEach((edit, index) =>
      menu.push({
        code: `${code}-${base.length + index + 1}`,
        name: edit.name,
        section: edit.section,
        price_cents: edit.price_cents,
        real_price_cents: null,
        cost_cents: Math.round(edit.price_cents * costShare(edit.category)),
      })
    );
  return menu;
}

function jobRunning(tx: Tx) {
  const job = tx.db.populate_job.job_id.find(JOB_ID);
  return (
    job?.status === 'running' && tx.timestamp.microsSinceUnixEpoch - job.updated_at.microsSinceUnixEpoch < STALE_JOB_MICROS
  );
}

function deleteUniverseDays(tx: Tx, scenario_id: number) {
  for (const job of [...tx.db.agent_job.iter()].filter(j => j.scenario_id === scenario_id)) {
    tx.db.agent_plan.job_id.delete(job.job_id);
    tx.db.agent_job.job_id.delete(job.job_id);
  }
  tx.db.universe_menu.scenario_id.delete(scenario_id);
  tx.db.sim_visit.scenario_id.delete(scenario_id);
  tx.db.sim_store_day.scenario_id.delete(scenario_id);
  tx.db.sim_day.scenario_id.delete(scenario_id);
}

// Everything needed to simulate the next day of `scenario_id`, plus the base universe when it hasn't reached that day yet
// The selected store first, then its competitors from nearest to farthest, and every store's agents
function marketPlaces(tx: Tx) {
  const storeId = tx.db.populate_job.job_id.find(JOB_ID)?.place_id ?? '';
  const home = tx.db.business.place_id.find(storeId);
  if (!home) throw new SenderError('Populate a store first');
  const places = [
    home,
    ...[...tx.db.competitor.place_id.filter(storeId)]
      .sort((a, b) => a.distance_meters - b.distance_meters)
      .map(c => tx.db.business.place_id.find(c.competitor_place_id))
      .filter((b): b is Business => !!b),
  ];
  const agents = places.flatMap(p => [...tx.db.customer_agent.place_id.filter(p.place_id)]);
  if (agents.length === 0) throw new SenderError('Create customer agents first');
  return { places, agents };
}

function loadMarket(tx: Tx, scenario_id: number): MarketDay {
  const { places, agents } = marketPlaces(tx);

  const daysOf = (id: number) => [...tx.db.sim_day.scenario_id.filter(id)];
  const day = Math.max(0, ...daysOf(scenario_id).map(d => d.day)) + 1;
  const baseDays = daysOf(0);
  const universeIds = scenario_id === 0 ? [0] : baseDays.some(d => d.day === day) ? [scenario_id] : [0, scenario_id];

  const firstDay = baseDays.find(d => d.day === 1);
  const startMillis = firstDay
    ? Date.parse(`${firstDay.date}T12:00:00Z`)
    : Number(tx.timestamp.microsSinceUnixEpoch / 1000n);
  const date = new Date(startMillis + (day - 1) * DAY_MILLIS);
  return { day, date: date.toISOString().slice(0, 10), weekday: WEEKDAYS[date.getUTCDay()], agents, places, universeIds };
}

function visitsByAgent(tx: Tx, scenario_id: number, day: number) {
  const simDay = [...tx.db.sim_day.scenario_id.filter(scenario_id)].find(d => d.day === day);
  const visits = new Map<number, SimVisit[]>();
  if (!simDay) return visits;
  for (const visit of [...tx.db.sim_visit.day_id.filter(simDay.day_id)].sort((a, b) => b.chance - a.chance)) {
    visits.set(visit.agent_id, [...(visits.get(visit.agent_id) ?? []), visit]);
  }
  return visits;
}

// A scenario's day starts from the base universe's plans for the same day, so it must be loaded after the base day is saved
function loadUniverse(tx: Tx, market: MarketDay, scenario_id: number): Universe {
  const [home] = market.places;
  const edits =
    scenario_id === 0 ? [] : [...tx.db.scenario_edit.scenario_id.filter(scenario_id)].sort((a, b) => a.edit_id - b.edit_id);
  const realMenus = new Map<string, SimItem[]>();
  const stores = market.places.map((place, index): SimStore => {
    const code = `s${index + 1}`;
    const menuItems = [...tx.db.menu_item.place_id.filter(place.place_id)];
    realMenus.set(place.place_id, simMenu(code, menuItems, []));
    const items = index === 0 ? simMenu(code, menuItems, edits) : realMenus.get(place.place_id)!;
    return {
      code,
      place,
      distance: distanceMeters(home.latitude, home.longitude, place.latitude, place.longitude),
      items,
      itemsByCode: new Map(items.map(i => [i.code, i])),
    };
  });
  const codeOf = new Map(stores.map(s => [s.place.place_id, s.code]));
  const name = scenario_id === 0 ? 'the base universe' : tx.db.scenario.scenario_id.find(scenario_id)?.name ?? `scenario ${scenario_id}`;

  if (scenario_id === 0) {
    const yesterday = new Map<number, string>();
    for (const [agent_id, [visit]] of visitsByAgent(tx, 0, market.day - 1)) {
      const items = JSON.parse(visit.items_json) as string[];
      yesterday.set(agent_id, `most likely went to ${codeOf.get(visit.place_id)} for ${items.join(', ')}`);
    }
    return { scenario_id, name, stores, yesterday, baseline: [], changes: [] };
  }

  // Base plans are stored by item name; map them back to codes on the real menu
  const basePlans = visitsByAgent(tx, 0, market.day);
  const baseline = market.agents.map((agent, index): Plan => ({
    customer: `a${index + 1}`,
    visits: (basePlans.get(agent.agent_id) ?? []).map(visit => {
      const menu = realMenus.get(visit.place_id) ?? [];
      const names = JSON.parse(visit.items_json) as string[];
      return {
        store: codeOf.get(visit.place_id) ?? '',
        chance: visit.chance,
        items: names.map(n => menu.find(i => i.name === n)?.code ?? '').filter(Boolean),
        reason: visit.reason,
      };
    }),
  }));

  const realHome = realMenus.get(home.place_id)!;
  const ownMenu = stores[0].items;
  const changes = [
    ...ownMenu
      .filter(i => i.real_price_cents !== null)
      .map(i => `${i.code} ${i.name}: now ${formatCents(i.price_cents)}, was ${formatCents(i.real_price_cents!)}`),
    ...realHome.filter(i => !stores[0].itemsByCode.has(i.code)).map(i => `${i.code} ${i.name}: removed from the menu`),
    ...ownMenu
      .filter(i => !realHome.some(r => r.code === i.code))
      .map(i => `${i.code} ${i.name}: new item, ${formatCents(i.price_cents)}`),
  ];
  return { scenario_id, name, stores, yesterday: new Map(), baseline, changes };
}

const MARKET_SYSTEM = `You simulate one day of customers choosing between nearby cafes. Each customer is a persona built from real Google reviews and stands for a group of similar people.
For every customer, estimate the chance (0 to 1) that they visit each store today and what they would order on that visit, using only item codes from that store's menu. List at most ${MAX_VISITS_PER_AGENT} stores per customer. The chances must add up to at most 1; the rest is the chance they visit none of these stores today.
Base it on the persona's habits and regular store, what they care about, the day of the week, the distance and the prices. Price-sensitive customers compare prices for similar items across stores and notice price changes; they may switch stores, order less, or stay home. Order what this person really would on one visit, usually 1 to 3 items.
Return every customer exactly once. Keep each reason under 15 words.`;

const SCENARIO_MARKET_SYSTEM = `You simulate how cafe customers react when store s1 changes its menu. Each customer is a persona built from real Google reviews and stands for a group of similar people.
You get every store's menu as it is today, each customer's baseline plan for today (made with s1's usual menu), and the list of changes s1 has made.
Return an updated plan only for customers who would act differently because of these changes: visit s1 more or less often, switch stores, add an item to their order, or order something else or less. A new item that fills a gap in s1's menu (for example a drink at a store whose regulars want one with their meal) is often added to existing orders, and can draw customers who usually get it elsewhere. A plan gives the chance (0 to 1) of visiting each store today and what they would order there, using only item codes from that store's menu, with at most ${MAX_VISITS_PER_AGENT} stores and chances adding up to at most 1. You must return every customer whose baseline order includes an item that was removed.
Everyone you don't return keeps their baseline plan and pays s1's new prices. Most people don't notice or care about small changes, so only change a plan when this kind of person really would. A price change mainly affects customers who order that item or a close substitute; leave customers who order other things alone unless the change makes the whole store feel much cheaper or pricier to them. Price-sensitive customers react more to price increases, and a price cut can win customers from other stores. New items only matter to customers who would want them. Return an empty list if nobody is affected. Keep each reason under 15 words and about the change.`;

const MARKET_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['customers'],
  properties: {
    customers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['customer', 'visits'],
        properties: {
          customer: { type: 'string', description: 'customer code, e.g. a1' },
          visits: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['store', 'chance', 'items', 'reason'],
              properties: {
                store: { type: 'string', description: 'store code, e.g. s2' },
                chance: { type: 'number', description: '0 to 1' },
                items: { type: 'array', items: { type: 'string' }, description: 'item codes from that store, e.g. s2-14' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};

function marketPrompt(market: MarketDay, universe: Universe) {
  const [home] = universe.stores;
  const codeOf = new Map(universe.stores.map(s => [s.place.place_id, s.code]));
  const stores = universe.stores.map(store => {
    const { place } = store;
    const header = `${store.code} ${place.name} (${place.category}, ${place.rating} stars from ${place.reviews_count} reviews${
      place.price ? `, ${place.price}` : ''
    }, ${Math.round(store.distance)} m from ${home.code})`;
    const sections = new Map<string, string[]>();
    for (const item of store.items) {
      const was = item.real_price_cents === null ? '' : ` (was ${formatCents(item.real_price_cents)})`;
      const section = item.section || 'Menu';
      sections.set(section, [...(sections.get(section) ?? []), `${item.code} ${item.name} ${formatCents(item.price_cents)}${was}`]);
    }
    return [header, ...[...sections].map(([section, items]) => `  ${section}: ${items.join('; ')}`)].join('\n');
  });
  const customers = market.agents.map((agent, index) => {
    const yesterday = universe.yesterday.get(agent.agent_id);
    return [
      `a${index + 1} ${agent.name}, ${agent.archetype}, regular at ${codeOf.get(agent.place_id)}. ${agent.backstory}`,
      `Usually orders: ${agent.typical_order}.`,
      `Price sensitivity ${agent.price_sensitivity.toFixed(1)} of 1; cares about food ${agent.food_weight.toFixed(1)}, service ${agent.service_weight.toFixed(1)}, atmosphere ${agent.atmosphere_weight.toFixed(1)}.`,
      yesterday ? `Yesterday they ${yesterday}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
  const prompt = `Today is ${market.weekday}, ${market.date}.\n\nSTORES\n${stores.join('\n')}\n\nCUSTOMERS\n${customers.join('\n')}`;
  if (universe.scenario_id === 0) return prompt;

  const baseline = universe.baseline.map(plan => {
    const visits = plan.visits.map(
      v => `${v.store} ${Math.round(v.chance * 100)}% (${v.items.join(', ')}): ${v.reason}`
    );
    return `${plan.customer}: ${visits.length ? visits.join('; ') : 'not visiting any of these stores'}`;
  });
  return `${prompt}\n\nBASELINE PLANS FOR TODAY\n${baseline.join('\n')}\n\nCHANGES AT ${home.code}\n${universe.changes.join('\n')}`;
}

// Customers Claude returned replace their baseline plan; everyone else keeps it
function mergePlans(baseline: Plan[], changed: unknown): Plan[] {
  const updates = new Map<string, Plan>();
  for (const plan of Array.isArray(changed) ? changed : []) {
    const customer = String(plan?.customer ?? '').trim();
    if (customer && !updates.has(customer)) updates.set(customer, plan);
  }
  return baseline.map(plan => updates.get(plan.customer) ?? plan);
}

function saveMarketDay(tx: Tx, market: MarketDay, universe: Universe, reply: any) {
  const storesByCode = new Map(universe.stores.map(s => [s.code, s]));
  const plans: DayPlan[] = [];
  const seen = new Set<number>();
  for (const entry of Array.isArray(reply?.customers) ? reply.customers : []) {
    const agent = market.agents[Number(String(entry.customer).replace(/\D/g, '')) - 1];
    if (!agent || seen.has(agent.agent_id)) continue;
    seen.add(agent.agent_id);
    const visits = (Array.isArray(entry.visits) ? entry.visits : []).map((visit: any): DayVisit | null => {
      const store = storesByCode.get(String(visit.store).trim());
      if (!store) return null;
      const items = (Array.isArray(visit.items) ? visit.items : [])
        .map((code: unknown) => store.itemsByCode.get(String(code).trim()))
        .filter((item: SimItem | undefined): item is SimItem => !!item);
      return { place_id: store.place.place_id, items, chance: clamp(visit.chance, 0, 1, 0), reason: String(visit.reason ?? '') };
    });
    plans.push({ agent, visits: visits.filter((v: DayVisit | null): v is DayVisit => !!v) });
  }
  writeDay(tx, universe.scenario_id, market, universe.stores.map(s => s.place.place_id), plans);
}

type DayVisit = { place_id: string; items: { name: string; price_cents: number; cost_cents: number }[]; chance: number; reason: string };
type DayPlan = { agent: Agent; visits: DayVisit[] };

// Saves one universe's day: each agent's visits, scaled to real customers, and every store's totals
function writeDay(
  tx: Tx,
  scenario_id: number,
  when: { day: number; date: string; weekday: string },
  place_ids: string[],
  plans: DayPlan[]
) {
  if ([...tx.db.sim_day.scenario_id.filter(scenario_id)].some(d => d.day === when.day)) return;
  const { day_id } = tx.db.sim_day.insert({
    day_id: 0,
    scenario_id,
    day: when.day,
    date: when.date,
    weekday: when.weekday,
    created_at: tx.timestamp,
  });

  const totals = new Map(place_ids.map(id => [id, { customers: 0, revenue: 0, cost: 0 }]));
  for (const { agent, visits: allVisits } of plans) {
    const visits = allVisits
      .filter(v => totals.has(v.place_id))
      .map(v => ({ ...v, items: v.items.slice(0, MAX_ITEMS_PER_VISIT) }))
      .filter(v => v.items.length > 0)
      .slice(0, MAX_VISITS_PER_AGENT);
    const totalChance = visits.reduce((sum, v) => sum + v.chance, 0);
    const scale = totalChance > 1 ? 1 / totalChance : 1;
    const group = agent.represents_customers * DAILY_CUSTOMERS_PER_REVIEWER;
    for (const visit of visits) {
      const chance = visit.chance * scale;
      if (chance <= 0) continue;
      const spend = visit.items.reduce((sum, i) => sum + i.price_cents, 0);
      const cost = visit.items.reduce((sum, i) => sum + i.cost_cents, 0);
      const customers = group * chance;
      tx.db.sim_visit.insert({
        visit_id: 0,
        day_id,
        scenario_id,
        agent_id: agent.agent_id,
        place_id: visit.place_id,
        chance,
        customers,
        items_json: JSON.stringify(visit.items.map(i => i.name)),
        spend_cents: spend,
        cost_cents: cost,
        reason: visit.reason,
      });
      const total = totals.get(visit.place_id)!;
      total.customers += customers;
      total.revenue += customers * spend;
      total.cost += customers * cost;
    }
  }

  for (const [place_id, total] of totals) {
    tx.db.sim_store_day.insert({
      row_id: 0,
      day_id,
      scenario_id,
      place_id,
      customers: total.customers,
      revenue_cents: total.revenue,
      cost_cents: total.cost,
    });
  }
}

// Simulates the next `days` days of a universe (0 for the base). A scenario's days are always compared with the
// base's days of the same number, so the base is simulated alongside it whenever it is behind.
export const simulate_days = spacetimedb.procedure(
  { scenario_id: t.u32(), days: t.u32() },
  t.u32(),
  (ctx, { scenario_id, days }) => {
    if (days < 1 || days > MAX_DAYS_PER_RUN) {
      throw new SenderError(`Simulate between 1 and ${MAX_DAYS_PER_RUN} days at a time`);
    }
    const running = ctx.withTx(tx => {
      if (scenario_id !== 0) requireScenario(tx, scenario_id);
      return jobRunning(tx) || !!activeAgentJob(tx);
    });
    if (running) throw new SenderError('Wait for the current run to finish');

    setJob(ctx, { status: 'running', message: 'Starting the simulation...' });
    try {
      for (let i = 0; i < days; i++) {
        const market = ctx.withTx(tx => loadMarket(tx, scenario_id));
        for (const id of market.universeIds) {
          const universe = ctx.withTx(tx => loadUniverse(tx, market, id));
          let customers: unknown = universe.baseline;
          if (id === 0 || universe.changes.length > 0) {
            setJob(ctx, {
              message:
                id === 0
                  ? `Simulating day ${market.day} (${market.weekday}) in the base universe: ${market.agents.length} customers are choosing where to go...`
                  : `Simulating day ${market.day} (${market.weekday}) in ${universe.name}: customers are reacting to your menu changes...`,
            });
            const reply = callClaudeForJson(
              ctx,
              MARKET_MODEL,
              id === 0 ? MARKET_SYSTEM : SCENARIO_MARKET_SYSTEM,
              marketPrompt(market, universe),
              600 + market.agents.length * MARKET_TOKENS_PER_AGENT,
              MARKET_SCHEMA
            );
            customers = id === 0 ? reply.customers : mergePlans(universe.baseline, reply.customers);
            if (id !== 0) {
              const changed = Array.isArray(reply.customers) ? reply.customers.length : 0;
              console.info(`Day ${market.day} of ${universe.name}: ${changed} customers changed their plans`);
              setJob(ctx, { message: `Day ${market.day} of ${universe.name}: ${changed} customers changed their plans` });
            }
          }
          ctx.withTx(tx => saveMarketDay(tx, market, universe, { customers }));
        }
      }
      setJob(ctx, { status: 'done', message: `Simulated ${days} day${days === 1 ? '' : 's'}` });
      return days;
    } catch (error) {
      setJob(ctx, { status: 'error', message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
);

// Clearing the base clears every scenario too, since scenarios are compared with the base day by day
export const reset_timeline = spacetimedb.reducer({ scenario_id: t.u32() }, (ctx, { scenario_id }) => {
  if (jobRunning(ctx)) throw new SenderError('Wait for the current run to finish');
  if (scenario_id === 0) clearTimeline(ctx);
  else deleteUniverseDays(ctx, scenario_id);
});

// ── Agent mode ───────────────────────────────────────────────────────────────
// Each agent is its own Claude conversation that looks things up in this database through SpacetimeDB's MCP
// endpoint. Procedures make HTTP calls one at a time, so the agents run in parallel in the agent worker
// (agents/worker.ts): it claims a queued job, submits each agent's plan, then finishes the job, which saves the day.
const MAX_PLAN_JSON_CHARS = 4_000;
const MAX_QUERIES_JSON_CHARS = 12_000;

function activeAgentJob(tx: Tx) {
  return [...tx.db.agent_job.iter()].find(
    j =>
      (j.status === 'queued' || j.status === 'running') &&
      tx.timestamp.microsSinceUnixEpoch - j.updated_at.microsSinceUnixEpoch < STALE_JOB_MICROS
  );
}

function buildUniverseMenu(tx: Tx, scenario_id: number, places: Business[]) {
  tx.db.universe_menu.scenario_id.delete(scenario_id);
  const edits =
    scenario_id === 0 ? [] : [...tx.db.scenario_edit.scenario_id.filter(scenario_id)].sort((a, b) => a.edit_id - b.edit_id);
  places.forEach((place, index) => {
    const items = [...tx.db.menu_item.place_id.filter(place.place_id)];
    const real = simMenu('s', items, []);
    const menu = index === 0 ? simMenu('s', items, edits) : real;
    const realCodes = new Set(real.map(i => i.code));
    const row = (item: SimItem, change: string, price_cents: number) =>
      tx.db.universe_menu.insert({
        row_id: 0,
        scenario_id,
        place_id: place.place_id,
        store_name: place.name,
        name: item.name,
        section: item.section,
        price_cents,
        previous_price_cents: item.real_price_cents ?? 0,
        change,
        cost_cents: item.cost_cents,
      });
    for (const item of menu) {
      row(item, item.real_price_cents !== null ? 'price' : realCodes.has(item.code) ? '' : 'new', item.price_cents);
    }
    const kept = new Set(menu.map(i => i.code));
    for (const item of real) if (!kept.has(item.code)) row(item, 'removed', item.price_cents);
  });
}

function requireAgentJob(tx: Tx, job_id: number, status: string) {
  const job = tx.db.agent_job.job_id.find(job_id);
  if (!job) throw new SenderError(`No agent job ${job_id}`);
  if (job.status !== status) throw new SenderError(`Agent job ${job_id} is ${job.status}, not ${status}`);
  return job;
}

// Queues the next `days` of `scenario_id` for the agent worker. A scenario always gets the matching base-universe
// days first, so the worker can compare them. Jobs are processed in insert order, one universe-day at a time.
export const start_agent_day = spacetimedb.reducer({ scenario_id: t.u32(), days: t.u32() }, (ctx, { scenario_id, days }) => {
  if (days < 1 || days > MAX_DAYS_PER_RUN) {
    throw new SenderError(`Simulate between 1 and ${MAX_DAYS_PER_RUN} days at a time`);
  }
  if (scenario_id !== 0) requireScenario(ctx, scenario_id);
  if (jobRunning(ctx) || activeAgentJob(ctx)) throw new SenderError('Wait for the current run to finish');
  for (const stale of [...ctx.db.agent_job.iter()].filter(j => j.status === 'queued' || j.status === 'running')) {
    ctx.db.agent_job.job_id.update({
      ...stale,
      status: 'error',
      message: 'The agent worker stopped responding',
      updated_at: ctx.timestamp,
    });
  }

  const { places, agents } = marketPlaces(ctx);
  const daysOf = (id: number) => [...ctx.db.sim_day.scenario_id.filter(id)];
  const next = Math.max(0, ...daysOf(scenario_id).map(d => d.day)) + 1;
  const firstDay = daysOf(0).find(d => d.day === 1);
  const startMillis = firstDay
    ? Date.parse(`${firstDay.date}T12:00:00Z`)
    : Number(ctx.timestamp.microsSinceUnixEpoch / 1000n);
  const queued = [...ctx.db.agent_job.iter()].filter(j => j.status === 'queued' || j.status === 'running' || j.status === 'done');
  const already = (id: number, day: number) =>
    daysOf(id).some(d => d.day === day) || queued.some(j => j.scenario_id === id && j.day === day);

  const universeIds = scenario_id === 0 ? [0] : [0, scenario_id];
  for (const id of universeIds) buildUniverseMenu(ctx, id, places);

  for (let day = next; day < next + days; day++) {
    const date = new Date(startMillis + (day - 1) * DAY_MILLIS);
    for (const id of universeIds) {
      if (already(id, day)) continue;
      ctx.db.agent_job.insert({
        job_id: 0,
        scenario_id: id,
        day,
        date: date.toISOString().slice(0, 10),
        weekday: WEEKDAYS[date.getUTCDay()],
        status: 'queued',
        message: 'Waiting for the agent worker',
        agents_total: agents.length,
        agents_done: 0,
        created_at: ctx.timestamp,
        updated_at: ctx.timestamp,
      });
    }
  }
});

export const claim_agent_job = spacetimedb.reducer({ job_id: t.u32() }, (ctx, { job_id }) => {
  const job = requireAgentJob(ctx, job_id, 'queued');
  if ([...ctx.db.agent_job.iter()].some(j => j.job_id < job_id && (j.status === 'queued' || j.status === 'running'))) {
    throw new SenderError('An earlier agent job has to finish first');
  }
  ctx.db.agent_job.job_id.update({ ...job, status: 'running', message: 'Agents are deciding...', updated_at: ctx.timestamp });
});

export const submit_agent_plan = spacetimedb.reducer(
  { job_id: t.u32(), agent_id: t.u32(), visits_json: t.string(), queries_json: t.string() },
  (ctx, { job_id, agent_id, visits_json, queries_json }) => {
    const job = requireAgentJob(ctx, job_id, 'running');
    if (!ctx.db.customer_agent.agent_id.find(agent_id)) throw new SenderError(`No agent ${agent_id}`);
    if (visits_json.length > MAX_PLAN_JSON_CHARS || queries_json.length > MAX_QUERIES_JSON_CHARS) {
      throw new SenderError('Agent plan is too long');
    }
    if (!Array.isArray(JSON.parse(visits_json)) || !Array.isArray(JSON.parse(queries_json))) {
      throw new SenderError('Agent plans must be JSON arrays');
    }
    const plans = [...ctx.db.agent_plan.job_id.filter(job_id)];
    for (const plan of plans) if (plan.agent_id === agent_id) ctx.db.agent_plan.plan_id.delete(plan.plan_id);
    ctx.db.agent_plan.insert({ plan_id: 0, job_id, agent_id, visits_json, queries_json, created_at: ctx.timestamp });
    const done = new Set([...plans.map(p => p.agent_id), agent_id]).size;
    ctx.db.agent_job.job_id.update({
      ...job,
      agents_done: done,
      message: `${done} of ${job.agents_total} agents decided`,
      updated_at: ctx.timestamp,
    });
  }
);

// Saves the job's day from the submitted plans. In a scenario, agents without a plan keep their base-universe plan.
export const finish_agent_job = spacetimedb.reducer({ job_id: t.u32(), error: t.string() }, (ctx, { job_id, error }) => {
  const job = requireAgentJob(ctx, job_id, 'running');
  if (error) {
    ctx.db.agent_job.job_id.update({ ...job, status: 'error', message: error.slice(0, 500), updated_at: ctx.timestamp });
    for (const later of [...ctx.db.agent_job.iter()].filter(j => j.job_id > job_id && j.status === 'queued')) {
      ctx.db.agent_job.job_id.update({ ...later, status: 'error', message: 'Skipped because an earlier job failed', updated_at: ctx.timestamp });
    }
    return;
  }

  const { places, agents } = marketPlaces(ctx);
  const menus = new Map<string, Map<string, { name: string; price_cents: number; cost_cents: number }>>();
  for (const row of ctx.db.universe_menu.scenario_id.filter(job.scenario_id)) {
    if (row.change === 'removed') continue;
    const menu = menus.get(row.place_id) ?? new Map();
    menu.set(row.name.toLowerCase(), { name: row.name, price_cents: row.price_cents, cost_cents: row.cost_cents });
    menus.set(row.place_id, menu);
  }
  const toVisit = (place_id: string, names: unknown[], chance: unknown, reason: unknown): DayVisit => ({
    place_id,
    items: names
      .map(n => menus.get(place_id)?.get(String(n).trim().toLowerCase()))
      .filter((i): i is { name: string; price_cents: number; cost_cents: number } => !!i),
    chance: clamp(chance, 0, 1, 0),
    reason: String(reason ?? ''),
  });

  const submitted = new Map([...ctx.db.agent_plan.job_id.filter(job_id)].map(p => [p.agent_id, p]));
  const basePlans = job.scenario_id === 0 ? new Map<number, SimVisit[]>() : visitsByAgent(ctx, 0, job.day);
  const plans: DayPlan[] = agents.map(agent => {
    const plan = submitted.get(agent.agent_id);
    const visits = plan ? (JSON.parse(plan.visits_json) as any[]) : [];
    // In a scenario, an empty plan means the agent kept its base-universe plan
    if (plan && (job.scenario_id === 0 || visits.length > 0)) {
      return {
        agent,
        visits: visits.map(v => toVisit(String(v?.place_id ?? ''), Array.isArray(v?.items) ? v.items : [], v?.chance, v?.reason)),
      };
    }
    return {
      agent,
      visits: (basePlans.get(agent.agent_id) ?? []).map(v =>
        toVisit(v.place_id, JSON.parse(v.items_json), v.chance, v.reason)
      ),
    };
  });
  writeDay(ctx, job.scenario_id, job, places.map(p => p.place_id), plans);
  ctx.db.agent_job.job_id.update({
    ...job,
    status: 'done',
    message: `${submitted.size} of ${job.agents_total} agents decided`,
    updated_at: ctx.timestamp,
  });
});

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
