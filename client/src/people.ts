// Turns the simulation's daily visit log into people walking: home -> café or rival -> home,
// along the real streets, at a time of day that's stable per customer and day.
import * as THREE from 'three';
import { hash01, pointAt, type Neighborhood, type Pt } from './geo';
import { PAWN, type IsoScene } from './scene';

type Place = 'here' | 'competitor';

const DIM = new THREE.Color(0.55, 0.5, 0.45);

export interface Tally {
  toCafe: number;
  inCafe: number;
  toRival: number;
  inRival: number;
  home: number;
}

export class Crowd {
  keys: string[] = [];
  private homeSlot: number[] = [];
  private visits = new Map<number, Map<string, Place>>(); // tick -> agentKey -> place
  private notices = new Map<number, Set<string>>(); // tick -> agentKeys who noticed a price change
  positions = new Map<number, Pt>(); // instance -> current position (visible people only)

  constructor(private scene: IsoScene, private hood: Neighborhood) {}

  setAgents(keys: string[]) {
    this.keys = [...keys].sort();
    this.homeSlot = this.keys.map(k => this.hood.homeOf(k));
    this.scene.setPeopleCount(this.keys.length);
  }

  setVisits(rows: { tick: number; agentKey: string; place: string }[]) {
    this.visits.clear();
    for (const r of rows) {
      let day = this.visits.get(r.tick);
      if (!day) this.visits.set(r.tick, (day = new Map()));
      day.set(r.agentKey, r.place === 'competitor' ? 'competitor' : 'here');
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

  /** Lay everyone out for `tick` at `frac` of the way through the day (0 = opening). */
  update(tick: number, frac: number): Tally {
    const tally: Tally = { toCafe: 0, inCafe: 0, toRival: 0, inRival: 0, home: 0 };
    const day = this.visits.get(tick);
    const noticed = this.notices.get(tick);
    // Walking speed scaled to the map: crossing the whole area takes ~1/5 of a day.
    const speed = (this.hood.map.radius * 2) / 0.2;
    this.positions.clear();

    this.keys.forEach((key, i) => {
      const place = day?.get(key);
      if (!place) {
        tally.home++;
        this.scene.hidePerson(i);
        return;
      }
      const route = this.hood.route(this.homeSlot[i], place);
      const walk = Math.max(0.03, route.length / speed);
      const depart = 0.04 + hash01('leave', key, tick) * Math.max(0.05, 0.9 - 2 * walk - 0.1);
      const stay = 0.05 + hash01('stay', key, tick) * 0.07;
      const arrive = depart + walk;
      const leave = arrive + stay;
      const back = leave + walk;
      const toCafe = place === 'here';
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
          else tally.inRival++;
        } else tally.home++;
      }
    });
    this.scene.commitPeople();
    return tally;
  }
}
