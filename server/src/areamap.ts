// The real neighborhood around a twin, from OpenStreetMap (Overpass API, no key), stored in
// the database so the viewer never depends on an outside map service at demo time.
// Coordinates are local meters: x = east, y = north, (0,0) = the café.
import { TimeDuration } from 'spacetimedb';
import type { ProcCtx } from './claude';
import { distanceKm, pickCompetitor, type Place } from './pipeline';

// Public Overpass mirrors, most reliable first (tested Oct 2026: the main server was timing out).
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const RESIDENTIAL = new Set([
  'house', 'residential', 'apartments', 'detached', 'semidetached_house', 'terrace', 'bungalow', 'dormitory',
]);

export interface AreaMap {
  v: 1;
  center: { lat: number; lng: number };
  radius: number;
  cafe: { x: number; y: number; name: string; building: number };
  competitors: { x: number; y: number; name: string; building: number }[];
  buildings: { p: number[]; h: number; home: boolean }[]; // p = flat [x0,y0,x1,y1,...]
  roads: { p: number[]; w: number; walk: boolean }[];
  parks: { p: number[] }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function pointInPolygon(x: number, y: number, p: number[]): boolean {
  let inside = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function centroidDistance(x: number, y: number, p: number[]): number {
  let cx = 0, cy = 0;
  for (let i = 0; i < p.length; i += 2) {
    cx += p[i];
    cy += p[i + 1];
  }
  const n = p.length / 2;
  return Math.hypot(cx / n - x, cy / n - y);
}

/** The building a point sits in (or the closest one within 30 m); -1 if none. */
function buildingAt(buildings: AreaMap['buildings'], x: number, y: number): number {
  let best = -1;
  let bestD = 30;
  for (let i = 0; i < buildings.length; i++) {
    if (pointInPolygon(x, y, buildings[i].p)) return i;
    const d = centroidDistance(x, y, buildings[i].p);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function roadWidth(kind: string): number {
  if (/^(motorway|trunk|primary)/.test(kind)) return 14;
  if (/^secondary/.test(kind)) return 12;
  if (/^(tertiary|residential|unclassified|living_street)/.test(kind)) return 9;
  if (kind === 'service') return 5;
  return 2.5; // footway, path, pedestrian, steps, cycleway
}

function buildingHeight(tags: Record<string, string>): number {
  const h = parseFloat(tags.height ?? '');
  if (h > 0) return Math.min(h, 120);
  const levels = parseFloat(tags['building:levels'] ?? '');
  if (levels > 0) return Math.min(levels * 3.2, 120);
  return RESIDENTIAL.has(tags.building) ? 9 : 7; // typical SF 2-3 storey
}

export function fetchAreaMap(ctx: ProcCtx, placeJson: string, competitorsJson: string): AreaMap {
  const place: Place = JSON.parse(placeJson);
  if (!place.location) throw new Error('café has no location');
  const rival = pickCompetitor(place, JSON.parse(competitorsJson || '[]'));
  const lat0 = place.location.lat;
  const lng0 = place.location.lng;
  const rivalKm = rival?.location ? distanceKm(place.location, rival.location) : 0;
  // Out to a little past the competitor; bounded so the scene stays fast to render.
  const radius = Math.round(Math.min(650, Math.max(220, rivalKm * 1000 * 1.25 + 80)));

  const mPerLat = 110540;
  const mPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const toXY = (lat: number, lng: number) => [round1((lng - lng0) * mPerLng), round1((lat - lat0) * mPerLat)];
  const s = lat0 - radius / mPerLat, n = lat0 + radius / mPerLat;
  const w = lng0 - radius / mPerLng, e = lng0 + radius / mPerLng;
  const bbox = `${s},${w},${n},${e}`;
  const query = `[out:json][timeout:60];(way["building"](${bbox});way["highway"](${bbox});way["leisure"="park"](${bbox}););out geom;`;

  let data: any = null;
  const errors: string[] = [];
  for (const url of OVERPASS) {
    try {
      const res = ctx.http.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'fork-calhacks/1.0 (CalHacks hackathon project)', // required by Overpass
        },
        body: `data=${encodeURIComponent(query)}`,
        timeout: TimeDuration.fromMillis(60_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = res.json();
      break;
    } catch (err) {
      errors.push(`${url.split('/')[2]}: ${String(err)}`); // (no URL class in the module runtime)
    }
  }
  if (!data) throw new Error(`OpenStreetMap unavailable (${errors.join('; ')})`);

  const map: AreaMap = {
    v: 1,
    center: { lat: lat0, lng: lng0 },
    radius,
    cafe: { x: 0, y: 0, name: place.title, building: -1 },
    competitors: [],
    buildings: [],
    roads: [],
    parks: [],
  };
  for (const el of data.elements ?? []) {
    if (el.type !== 'way' || !el.geometry?.length) continue;
    const tags: Record<string, string> = el.tags ?? {};
    const p: number[] = [];
    for (const g of el.geometry) p.push(...toXY(g.lat, g.lon));
    if (tags.building) {
      if (p.length < 6) continue;
      const home = RESIDENTIAL.has(tags.building) || (tags.building === 'yes' && !tags.amenity && !tags.shop && !tags.name);
      map.buildings.push({ p, h: buildingHeight(tags), home });
    } else if (tags.highway) {
      map.roads.push({ p, w: roadWidth(tags.highway), walk: tags.highway !== 'motorway' });
    } else if (tags.leisure === 'park') {
      map.parks.push({ p });
    }
  }

  map.cafe.building = buildingAt(map.buildings, 0, 0);
  if (rival?.location) {
    const [x, y] = toXY(rival.location.lat, rival.location.lng);
    map.competitors.push({ x, y, name: rival.title, building: buildingAt(map.buildings, x, y) });
  }
  // The café and competitor buildings are never homes.
  for (const i of [map.cafe.building, ...map.competitors.map(c => c.building)]) {
    if (i >= 0) map.buildings[i].home = false;
  }
  return map;
}
