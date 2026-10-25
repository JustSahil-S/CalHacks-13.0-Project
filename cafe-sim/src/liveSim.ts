import type {
  AgentJob,
  AgentPlan,
  Business,
  CustomerAgent,
  SimVisit,
} from "./module_bindings/types";

export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 19;
export const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
export const DAILY_CUSTOMERS_PER_REVIEWER = 1;
// One simulated open-to-close day on the map. Spawn times are hour slots in 0..1.
export const DAY_PLAY_MS = 12000;
export const PLAY_HOLD_MS = 5000;

// Typical cafe traffic across opening hours. Sums to 1.
const HOUR_WEIGHTS = [
  0.05, 0.1, 0.11, 0.08, 0.09, 0.13, 0.12, 0.08, 0.07, 0.07, 0.06, 0.04,
];

export type LiveVisit = {
  agentId: number;
  placeId: string;
  chance: number;
  items: string[];
  customers: number;
  hour: number;
};

export type MapTrip = {
  id: string;
  agentId: number;
  placeId: string;
  own: boolean;
  from: [number, number];
  to: [number, number];
  customers: number;
  chance: number;
  hour: number;
  spawnAt: number;
};

export type HourBucket = {
  hour: number;
  yours: number;
  elsewhere: number;
};

type PlannedVisit = { placeId: string; chance: number; items: string[] };

function hash01(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function hourFor(agentId: number, placeId: string) {
  let pick = hash01(`${agentId}:${placeId}`);
  for (let i = 0; i < HOURS.length; i++) {
    pick -= HOUR_WEIGHTS[i];
    if (pick <= 0) return HOURS[i];
  }
  return HOURS[HOURS.length - 1];
}

function parseVisitsJson(raw: string): PlannedVisit[] {
  try {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.visits)
        ? parsed.visits
        : [];
    return rows
      .map((row: { place_id?: string; placeId?: string; chance?: number; items?: unknown }) => ({
        placeId: String(row?.place_id ?? row?.placeId ?? ""),
        chance: Number(row?.chance) || 0,
        items: Array.isArray(row?.items) ? row.items.map(String) : [],
      }))
      .filter((row: PlannedVisit) => row.placeId && row.chance > 0.03);
  } catch {
    return [];
  }
}

function offsetLngLat(
  lat: number,
  lng: number,
  angle: number,
  meters: number,
): [number, number] {
  const km = meters / 1000;
  const dLat = km / 111.32;
  const dLng = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [lng + Math.cos(angle) * dLng, lat + Math.sin(angle) * dLat];
}

function jitter(
  lat: number,
  lng: number,
  seed: string,
  meters: number,
): [number, number] {
  return offsetLngLat(
    lat,
    lng,
    hash01(`a:${seed}`) * Math.PI * 2,
    (0.25 + hash01(`d:${seed}`) * 0.75) * meters,
  );
}

export function routeCacheKey(from: [number, number], to: [number, number]) {
  return `${from[0].toFixed(4)},${from[1].toFixed(4)}:${to[0].toFixed(4)},${to[1].toFixed(4)}`;
}

const roadCache = new Map<string, Promise<[number, number][]>>();

export function fetchRoadPath(
  from: [number, number],
  to: [number, number],
): Promise<[number, number][]> {
  const key = routeCacheKey(from, to);
  const hit = roadCache.get(key);
  if (hit) return hit;
  const request = (async () => {
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const body = (await response.json()) as {
        routes?: { geometry?: { coordinates?: number[][] } }[];
      };
      const coords = body.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const road = coords.map(
          ([lng, lat]) => [lng, lat] as [number, number],
        );
        // OSRM snaps to streets; keep the outside spawn so dots enter the circle.
        return [from, ...road, to];
      }
    } catch {
      // Fall back to a straight line if routing is down.
    }
    return [from, to];
  })();
  roadCache.set(key, request);
  return request;
}

function pathLengthMeters(path: [number, number][]) {
  let meters = 0;
  for (let i = 1; i < path.length; i++) {
    const [lng0, lat0] = path[i - 1];
    const [lng1, lat1] = path[i];
    const x = (lng1 - lng0) * 111320 * Math.cos((lat0 * Math.PI) / 180);
    const y = (lat1 - lat0) * 110540;
    meters += Math.hypot(x, y);
  }
  return meters;
}

export function tripDurationMs(path: [number, number][]) {
  return 1400 + Math.min(2800, pathLengthMeters(path) * 2.5);
}

export function liveOwnRevenue(
  visits: LiveVisit[],
  ownPlaceId: string,
  priceOf: (item: string) => number,
) {
  return visits
    .filter((visit) => visit.placeId === ownPlaceId)
    .reduce((sum, visit) => {
      const spend = visit.items.reduce((total, name) => total + priceOf(name), 0);
      return sum + visit.customers * spend;
    }, 0);
}

export function pointAlongPath(path: [number, number][], t: number): [number, number] {
  if (path.length === 0) return [0, 0];
  if (path.length === 1 || t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const total = pathLengthMeters(path);
  if (total <= 0) return path[0];
  let left = total * t;
  for (let i = 1; i < path.length; i++) {
    const [lng0, lat0] = path[i - 1];
    const [lng1, lat1] = path[i];
    const x = (lng1 - lng0) * 111320 * Math.cos((lat0 * Math.PI) / 180);
    const y = (lat1 - lat0) * 110540;
    const seg = Math.hypot(x, y);
    if (left <= seg || i === path.length - 1) {
      const u = seg === 0 ? 1 : left / seg;
      return [lng0 + (lng1 - lng0) * u, lat0 + (lat1 - lat0) * u];
    }
    left -= seg;
  }
  return path[path.length - 1];
}

function toLiveVisit(
  agent: CustomerAgent,
  placeId: string,
  chance: number,
  items: string[],
): LiveVisit {
  const group = agent.representsCustomers * DAILY_CUSTOMERS_PER_REVIEWER;
  return {
    agentId: agent.agentId,
    placeId,
    chance,
    items,
    customers: group * chance,
    hour: hourFor(agent.agentId, placeId),
  };
}

// One map dot per expected person in the group, capped so a huge cafe does not flood the map.
const MAX_PEOPLE_DOTS = 20;

function peopleDots(customers: number) {
  return Math.max(1, Math.min(MAX_PEOPLE_DOTS, Math.round(customers)));
}

export function liveVisitsForJob(args: {
  job: AgentJob | undefined;
  plans: readonly AgentPlan[];
  agents: readonly CustomerAgent[];
  baseVisits: readonly SimVisit[];
}): LiveVisit[] {
  const { job, plans, agents, baseVisits } = args;
  if (!job) return [];
  const agentsById = new Map(agents.map((agent) => [agent.agentId, agent]));
  const baseByAgent = new Map<number, SimVisit[]>();
  for (const visit of baseVisits) {
    baseByAgent.set(visit.agentId, [
      ...(baseByAgent.get(visit.agentId) ?? []),
      visit,
    ]);
  }
  const live: LiveVisit[] = [];
  for (const plan of plans) {
    if (plan.jobId !== job.jobId) continue;
    const agent = agentsById.get(plan.agentId);
    if (!agent) continue;
    let planned = parseVisitsJson(plan.visitsJson);
    if (planned.length === 0 && job.scenarioId !== 0) {
      planned = (baseByAgent.get(plan.agentId) ?? []).map((visit) => ({
        placeId: visit.placeId,
        chance: visit.chance,
        items: (() => {
          try {
            return JSON.parse(visit.itemsJson) as string[];
          } catch {
            return [];
          }
        })(),
      }));
    }
    for (const visit of planned) {
      live.push(toLiveVisit(agent, visit.placeId, visit.chance, visit.items));
    }
  }
  return live;
}

// Map window is 1.25× the competitor radius; spawn just outside the dashed ring.
const SPAWN_RING = 1.12;
const SPAWN_GATES = 16;

export function tripsFromVisits(
  visits: LiveVisit[],
  agents: readonly CustomerAgent[],
  stores: readonly Business[],
  ownPlaceId: string,
  radiusKm = 1,
): MapTrip[] {
  const storesById = new Map(stores.map((store) => [store.placeId, store]));
  const agentsById = new Map(agents.map((agent) => [agent.agentId, agent]));
  const origin = storesById.get(ownPlaceId);
  const ringMeters = Math.max(radiusKm, 0.2) * 1000 * SPAWN_RING;
  const trips: MapTrip[] = [];
  for (const visit of visits) {
    const dest = storesById.get(visit.placeId);
    const agent = agentsById.get(visit.agentId);
    if (!dest || !agent) continue;
    const seed = `${visit.agentId}:${visit.placeId}`;
    const centerLat = origin?.latitude ?? dest.latitude;
    const centerLng = origin?.longitude ?? dest.longitude;
    const dLat = dest.latitude - centerLat;
    const dLng = dest.longitude - centerLng;
    const destAngle =
      visit.placeId === ownPlaceId || Math.hypot(dLat, dLng) < 1e-5
        ? hash01(`ang:${seed}`) * Math.PI * 2
        : Math.atan2(dLat, dLng);
    const destGate = Math.round((destAngle / (Math.PI * 2)) * SPAWN_GATES);
    const offset = Math.floor(hash01(`gate:${seed}`) * 5) - 2;
    const gate = ((destGate + offset) % SPAWN_GATES + SPAWN_GATES) % SPAWN_GATES;
    const from = offsetLngLat(
      centerLat,
      centerLng,
      (gate / SPAWN_GATES) * Math.PI * 2,
      ringMeters,
    );
    const to = jitter(dest.latitude, dest.longitude, `to:${seed}`, 12);
    const hourSlot = (visit.hour - OPEN_HOUR) / (HOURS.length || 1);
    const baseSpawn = hourSlot + hash01(`spawn:${seed}`) / HOURS.length;
    const count = peopleDots(visit.customers);
    for (let i = 0; i < count; i++) {
      trips.push({
        id: `${seed}:${i}`,
        agentId: visit.agentId,
        placeId: visit.placeId,
        own: visit.placeId === ownPlaceId,
        from,
        to,
        customers: visit.customers / count,
        chance: visit.chance,
        hour: visit.hour,
        spawnAt: baseSpawn + (i / Math.max(count, 1)) * (0.55 / HOURS.length),
      });
    }
  }
  return trips;
}

export function hourlyBuckets(
  visits: LiveVisit[],
  ownPlaceId: string,
): HourBucket[] {
  return HOURS.map((hour) => {
    const rows = visits.filter((visit) => visit.hour === hour);
    return {
      hour,
      yours: rows
        .filter((visit) => visit.placeId === ownPlaceId)
        .reduce((sum, visit) => sum + visit.customers, 0),
      elsewhere: rows
        .filter((visit) => visit.placeId !== ownPlaceId)
        .reduce((sum, visit) => sum + visit.customers, 0),
    };
  });
}

export function clockHour(done: number, total: number) {
  if (total <= 0) return OPEN_HOUR;
  const t = Math.min(1, Math.max(0, done / total));
  return HOURS[Math.min(HOURS.length - 1, Math.floor(t * HOURS.length))];
}

export function formatHour(hour: number) {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}
