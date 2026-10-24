// The neighborhood as data: the OpenStreetMap area stored by the server, a walkable street
// graph, shortest paths from every street corner to the café and the rival, and homes.

export interface AreaMap {
  v: 1;
  center: { lat: number; lng: number };
  radius: number;
  cafe: { x: number; y: number; name: string; building: number };
  competitors: { x: number; y: number; name: string; building: number }[];
  buildings: { p: number[]; h: number; home: boolean }[];
  roads: { p: number[]; w: number; walk: boolean }[];
  parks: { p: number[] }[];
}

export type Pt = [number, number];

export function centroid(p: number[]): Pt {
  let x = 0, y = 0;
  const n = p.length / 2;
  for (let i = 0; i < p.length; i += 2) {
    x += p[i];
    y += p[i + 1];
  }
  return [x / n, y / n];
}

/** Stable string hash -> [0, 1). Everyone watching sees the same homes and timings. */
export function hash01(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e3779b9;
  }
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---- Street graph -------------------------------------------------------------

class Graph {
  pts: Pt[] = [];
  adj: { to: number; d: number }[][] = [];
  private index = new Map<string, number>();

  node(x: number, y: number): number {
    const key = `${Math.round(x * 2)},${Math.round(y * 2)}`; // merge points within ~0.5 m
    let i = this.index.get(key);
    if (i === undefined) {
      i = this.pts.length;
      this.pts.push([x, y]);
      this.adj.push([]);
      this.index.set(key, i);
    }
    return i;
  }

  link(a: number, b: number) {
    if (a === b) return;
    const d = Math.hypot(this.pts[a][0] - this.pts[b][0], this.pts[a][1] - this.pts[b][1]);
    this.adj[a].push({ to: b, d });
    this.adj[b].push({ to: a, d });
  }

  nearest(x: number, y: number): number {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < this.pts.length; i++) {
      const d = (this.pts[i][0] - x) ** 2 + (this.pts[i][1] - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  /** Shortest-path tree toward `source`: next[i] is the step from i toward the source. */
  treeTo(source: number): Int32Array {
    const n = this.pts.length;
    const dist = new Float64Array(n).fill(Infinity);
    const next = new Int32Array(n).fill(-1);
    const done = new Uint8Array(n);
    dist[source] = 0;
    // Graphs here are ~1-3k nodes, so a simple O(n^2) Dijkstra is fast enough.
    for (let iter = 0; iter < n; iter++) {
      let u = -1, best = Infinity;
      for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0) break;
      done[u] = 1;
      for (const { to, d } of this.adj[u]) {
        if (dist[u] + d < dist[to]) {
          dist[to] = dist[u] + d;
          next[to] = u;
        }
      }
    }
    return next;
  }
}

export interface Route {
  pts: Pt[];
  cum: number[]; // cumulative length at each point
  length: number;
}

function makeRoute(pts: Pt[]): Route {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, length: cum[cum.length - 1] };
}

export function pointAt(route: Route, t: number): Pt {
  const target = Math.max(0, Math.min(1, t)) * route.length;
  let i = 1;
  while (i < route.cum.length - 1 && route.cum[i] < target) i++;
  const seg = route.cum[i] - route.cum[i - 1] || 1;
  const f = (target - route.cum[i - 1]) / seg;
  const a = route.pts[i - 1], b = route.pts[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

export class Neighborhood {
  homes: number[] = []; // building indexes customers live in
  homeDoors: Pt[] = [];
  cafeDoor: Pt;
  rivalDoor: Pt | null;
  private graph = new Graph();
  private toCafe: Int32Array;
  private toRival: Int32Array | null;
  private routeCache = new Map<string, Route>();

  constructor(public map: AreaMap) {
    for (const road of map.roads) {
      if (!road.walk) continue;
      let prev = -1;
      for (let i = 0; i < road.p.length; i += 2) {
        const n = this.graph.node(road.p[i], road.p[i + 1]);
        if (prev >= 0) this.graph.link(prev, n);
        prev = n;
      }
    }
    this.cafeDoor = [map.cafe.x, map.cafe.y];
    this.rivalDoor = map.competitors[0] ? [map.competitors[0].x, map.competitors[0].y] : null;
    const cafeNode = this.graph.nearest(...this.cafeDoor);
    this.toCafe = this.graph.treeTo(cafeNode);
    this.toRival = this.rivalDoor ? this.graph.treeTo(this.graph.nearest(...this.rivalDoor)) : null;

    map.buildings.forEach((b, i) => {
      if (b.home) {
        this.homes.push(i);
        this.homeDoors.push(centroid(b.p));
      }
    });
  }

  /** Which home a customer lives in. Several customers can share one building. */
  homeOf(agentKey: string): number {
    return Math.floor(hash01('home', agentKey) * this.homes.length);
  }

  private trees = new Map<string, Int32Array>();

  /** Is a point inside the detailed model (the plinth)? */
  inside(x: number, y: number): boolean {
    return Math.abs(x) <= this.map.radius && Math.abs(y) <= this.map.radius;
  }

  /** Where a straight line from the café toward (x, y) leaves the model. */
  edgeToward(x: number, y: number): Pt {
    const R = this.map.radius * 0.98;
    const s = R / Math.max(Math.abs(x), Math.abs(y), 1e-6);
    return [x * s, y * s];
  }

  /**
   * Walking route from a home toward any target (a rival). Inside the model it follows the
   * streets to the target; a farther target is reached by the streets to the model's edge in
   * its direction, then straight on (the tile map shows the whole way).
   */
  routeToward(homeSlot: number, key: string, tx: number, ty: number): Route {
    const cacheKey = `${homeSlot}:${key}`;
    const cached = this.routeCache.get(cacheKey);
    if (cached) return cached;
    const dest: Pt = this.inside(tx, ty) ? [tx, ty] : this.edgeToward(tx, ty);
    let tree = this.trees.get(key);
    if (!tree && this.graph.pts.length) {
      tree = this.graph.treeTo(this.graph.nearest(dest[0], dest[1]));
      this.trees.set(key, tree);
    }
    const door = this.homeDoors[homeSlot] ?? [0, 0];
    const pts: Pt[] = [door];
    let n = this.graph.pts.length ? this.graph.nearest(...door) : -1;
    let guard = 0;
    while (tree && n >= 0 && guard++ < 5000) {
      pts.push(this.graph.pts[n]);
      const next = tree[n];
      if (next < 0) break;
      n = next;
    }
    pts.push(dest);
    if (dest[0] !== tx || dest[1] !== ty) pts.push([tx, ty]);
    const route = makeRoute(pts);
    this.routeCache.set(cacheKey, route);
    return route;
  }

  /** Walking route from a home to the café or rival, along the streets. */
  route(homeSlot: number, place: 'here' | 'competitor'): Route {
    const key = `${homeSlot}:${place}`;
    const cached = this.routeCache.get(key);
    if (cached) return cached;
    const door = this.homeDoors[homeSlot] ?? [0, 0];
    const dest = place === 'here' ? this.cafeDoor : this.rivalDoor ?? this.cafeDoor;
    const tree = place === 'here' ? this.toCafe : this.toRival ?? this.toCafe;
    const pts: Pt[] = [door];
    let n = this.graph.pts.length ? this.graph.nearest(...door) : -1;
    let guard = 0;
    while (n >= 0 && guard++ < 5000) {
      pts.push(this.graph.pts[n]);
      const next = tree[n];
      if (next < 0) break;
      n = next;
    }
    pts.push(dest);
    const route = makeRoute(pts);
    this.routeCache.set(key, route);
    return route;
  }
}
