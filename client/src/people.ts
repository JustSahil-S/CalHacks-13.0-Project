// Turns the simulation's daily visit log into people walking: home -> café or a rival -> home,
// along the real streets, at a time of day that's stable per customer and day. Rivals beyond
// the detailed model are walked toward until the model's edge.
import * as THREE from 'three';
import { hash01, pointAt, type Neighborhood, type Pt, type Route } from './geo';
import { PAWN } from './scene';

/** What the crowd needs from a renderer (the 3D model or the tile map). */
export interface PeopleLayer {
  setPeopleCount(n: number): void;
  placePerson(i: number, x: number, y: number, color: THREE.Color): void;
  hidePerson(i: number): void;
  commitPeople(): void;
}

const DIM = new THREE.Color(0.55, 0.5, 0.45);

export interface Tally {
  toCafe: number;
  inCafe: number;
  toRival: number;
  inRival: number;
  home: number;
  inRivalByKey: Map<string, number>;
}

export interface RivalPoint {
  key: string;
  x: number;
  y: number;
}

/** A visit is 'here', 'competitor' (older single-rival universes) or 'rival:<key>'. */
type Visit = { kind: 'here' } | { kind: 'rival'; key: string | null };

export class Crowd {
  keys: string[] = [];
  private homeSlot: number[] = [];
  private visits = new Map<number, Map<string, Visit>>(); // tick -> agentKey -> visit
  private notices = new Map<number, Set<string>>(); // tick -> agentKeys who noticed a price change
  private rivals = new Map<string, RivalPoint>();
  positions = new Map<number, Pt>(); // instance -> current position (visible people only)

  constructor(private scene: PeopleLayer, private hood: Neighborhood) {}

  setAgents(keys: string[]) {
    this.keys = [...keys].sort();
    this.homeSlot = this.keys.map(k => this.hood.homeOf(k));
    this.scene.setPeopleCount(this.keys.length);
  }

  setRivals(rivals: RivalPoint[]) {
    this.rivals = new Map(rivals.map(r => [r.key, r]));
  }

  setVisits(rows: { tick: number; agentKey: string; place: string }[]) {
    this.visits.clear();
    for (const r of rows) {
      let day = this.visits.get(r.tick);
      if (!day) this.visits.set(r.tick, (day = new Map()));
      day.set(
        r.agentKey,
        r.place === 'here'
          ? { kind: 'here' }
          : { kind: 'rival', key: r.place.startsWith('rival:') ? r.place.slice(6) : null }
      );
    }
  }

  setNotices(rows: { tick: number; agentKey: string }[]) {
    this.notices.clear();
    for (const r of rows) {
      let s = this.notices.get(r.tick);
      if (!s) this.notices.set(r.tick, (s = new Set()));
      s.add(r.agentKey);
    }
  }

  private routeFor(i: number, v: Visit): Route {
    if (v.kind === 'here') return this.hood.route(this.homeSlot[i], 'here');
    const rv = v.key ? this.rivals.get(v.key) : undefined;
    return rv ? this.hood.routeToward(this.homeSlot[i], rv.key, rv.x, rv.y) : this.hood.route(this.homeSlot[i], 'competitor');
  }

  /** Lay everyone out for `tick` at `frac` of the way through the day (0 = opening). */
  update(tick: number, frac: number): Tally {
    const tally: Tally = { toCafe: 0, inCafe: 0, toRival: 0, inRival: 0, home: 0, inRivalByKey: new Map() };
    const day = this.visits.get(tick);
    const noticed = this.notices.get(tick);
    // Walking speed scaled to the map: crossing the whole area takes ~1/5 of a day.
    const speed = (this.hood.map.radius * 2) / 0.2;
    // Far rivals (miles away) would take days at that pace; any trip takes at most ~0.3 day.
    const tripDays = (len: number) => Math.min(0.3, Math.max(0.03, len / speed));
    this.positions.clear();

    this.keys.forEach((key, i) => {
      const v = day?.get(key);
      if (!v) {
        tally.home++;
        this.scene.hidePerson(i);
        return;
      }
      const route = this.routeFor(i, v);
      const walk = tripDays(route.length);
      const depart = 0.04 + hash01('leave', key, tick) * Math.max(0.05, 0.9 - 2 * walk - 0.1);
      const stay = 0.05 + hash01('stay', key, tick) * 0.07;
      const arrive = depart + walk;
      const leave = arrive + stay;
      const back = leave + walk;
      const toCafe = v.kind === 'here';
      let color = toCafe ? PAWN.toCafe : PAWN.toRival;
      if (noticed?.has(key) && frac > arrive) color = PAWN.noticed; // saw the new price today

      let at: Pt | null = null;
      if (frac >= depart && frac < arrive) {
        at = pointAt(route, (frac - depart) / walk);
      } else if (frac >= leave && frac < back) {
        at = pointAt(route, 1 - (frac - leave) / walk);
        color = color.clone().lerp(DIM, 0.25);
      }

      if (at) {
        this.scene.placePerson(i, at[0], at[1], color);
        this.positions.set(i, at);
        if (toCafe) tally.toCafe++;
        else tally.toRival++;
      } else {
        this.scene.hidePerson(i);
        if (frac >= arrive && frac < leave) {
          if (toCafe) tally.inCafe++;
          else {
            tally.inRival++;
            if (v.kind === 'rival' && v.key) tally.inRivalByKey.set(v.key, (tally.inRivalByKey.get(v.key) ?? 0) + 1);
          }
        } else tally.home++;
      }
    });
    this.scene.commitPeople();
    return tally;
  }
}
