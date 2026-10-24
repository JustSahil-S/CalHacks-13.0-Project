// Unit tests for the daily-choice model (server/src/choice.ts).
//   node --experimental-strip-types --no-warnings tools/choice.test.mjs
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Node strips the types itself, but needs explicit .ts extensions: load a copy with them.
const dir = await mkdtemp(join(tmpdir(), 'fork-choice-'));
for (const f of ['choice.ts', 'rng.ts']) {
  const code = await readFile(new URL(`../server/src/${f}`, import.meta.url), 'utf8');
  await writeFile(join(dir, f), code.replace("from './rng';", "from './rng.ts';"));
}
const { afterDay, baselineOdds, choose, dayOdds, initialState, knownPlaces, withClaude } = await import(pathToFileURL(join(dir, 'choice.ts')).href);

let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log('  ok  ', name);
  } catch (e) {
    failed++;
    console.log('  FAIL', name, '\n        ', String(e.message).split('\n').slice(0, 3).join('\n         '));
  }
};
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b} (tol ${tol})`);

const places = [
  { key: 'r1', weight: 0.9 },
  { key: 'r2', weight: 0.4 },
  { key: 'r3', weight: 0.15 },
];
const people = [
  { name: 'daily regular', v: 5, loyalty: 0.8, ps: 0.6 },
  { name: 'occasional', v: 0.5, loyalty: 0.3, ps: 0.3 },
  { name: 'fully loyal', v: 3, loyalty: 1, ps: 0.5 },
  { name: 'price hawk', v: 2, loyalty: 0.2, ps: 0.95 },
];
const dayIn = (p, over = {}) => {
  const base = baselineOdds(p.v, p.loyalty);
  return {
    tick: 10,
    base,
    priceSensitivity: p.ps,
    satisfaction: 4,
    seenPriceCents: 550,
    ease: 1,
    places,
    state: initialState(base, 550, 9), // settled as of yesterday evening
    ...over,
  };
};
const oldRule = (pct, ps, ease = 1) => 1 - Math.min(0.8, Math.max(0, pct * ps * 2.5 * ease));

console.log('calibration: unchanged prices reproduce the starting odds');
for (const p of people) {
  check(`${p.name}`, () => {
    const o = dayOdds(dayIn(p));
    const b = baselineOdds(p.v, p.loyalty);
    const tot = Math.max(b.pHere, 0.002) + Math.max(b.pOut, 0.002) + b.pSkip;
    near(o.pHere, Math.max(b.pHere, 0.002) / tot, 1e-9, 'pHere');
    near(o.pHere + o.pOut + o.pSkip, 1, 1e-12, 'sums to 1');
  });
}
check('no place in range: elsewhere folds into staying home', () => {
  const p = people[0];
  const o = dayOdds(dayIn(p, { places: [] }));
  near(o.pHere, baselineOdds(p.v, p.loyalty).pHere, 1e-9);
  near(o.pOut, 0, 1e-12);
});

console.log('sampling matches the probabilities (200k draws each)');
for (const p of [people[0], people[1]]) {
  check(`${p.name}`, () => {
    const d = dayIn(p, { seenPriceCents: 650 });
    const o = dayOdds(d);
    const n = 200000;
    const c = { here: 0, home: 0, r1: 0, r2: 0, r3: 0 };
    for (let i = 0; i < n; i++) c[choose({ ...d }, BigInt(i % 997), `c${i}`).where]++;
    near(c.here / n, o.pHere, 0.005, 'here');
    near(c.home / n, o.pSkip, 0.005, 'home');
    near((c.r1 + c.r2 + c.r3) / n, o.pOut, 0.005, 'elsewhere');
  });
}

console.log("day one of a rise matches the old rule's factor at ANY size (incl. its 80% cap)");
for (const p of people) {
  check(`${p.name}`, () => {
    const a = dayOdds(dayIn(p)).pHere;
    for (const pct of [0.01, 0.1, 0.25, 0.5, 1, 2]) {
      const b = dayOdds(dayIn(p, { seenPriceCents: 550 * (1 + pct) })).pHere;
      near(b / a, oldRule(pct, p.ps), 1e-6, `+${pct * 100}%`);
    }
  });
}
check('the radius matters: easier switching (more strong rivals) loses more', () => {
  const p = people[0];
  const a = dayOdds(dayIn(p)).pHere;
  near(dayOdds(dayIn(p, { seenPriceCents: 605, ease: 1.4 })).pHere / a, oldRule(0.1, p.ps, 1.4), 1e-6);
});
check('a rise hurts more than an equal cut helps', () => {
  const p = people[0];
  const a = dayOdds(dayIn(p)).pHere;
  assert.ok(a - dayOdds(dayIn(p, { seenPriceCents: 650 })).pHere > dayOdds(dayIn(p, { seenPriceCents: 450 })).pHere - a);
});
check('lost visits go partly to other cafés for regulars (nest), not only to staying home', () => {
  const p = people[0];
  const a = dayOdds(dayIn(p));
  const b = dayOdds(dayIn(p, { seenPriceCents: 700 }));
  assert.ok((b.pOut - a.pOut) / (a.pHere - b.pHere) > 0.3);
});

console.log('paired futures: raising a price can only move people away from here');
check('20k paired days per person: nobody is pushed INTO our café or between rivals', () => {
  for (const p of people) {
    for (let i = 0; i < 20000; i++) {
      const seed = BigInt(i % 101);
      const key = `c${i % 200}`;
      const ctl = choose(dayIn(p, { tick: i }), seed, key).where;
      const chg = choose(dayIn(p, { tick: i, seenPriceCents: 700 }), seed, key).where;
      if (chg === 'here') assert.equal(ctl, 'here', `${p.name}: here only in the change arm`);
      if (ctl !== 'here') assert.equal(chg, ctl, `${p.name}: a non-visitor changed place (${ctl} -> ${chg})`);
    }
  }
});

console.log('getting used to a new price');
check('the shock fades with visits: odds recover part of the way, not all', () => {
  const p = people[0];
  const base = baselineOdds(p.v, p.loyalty);
  const before = dayOdds(dayIn(p)).pHere;
  let s = initialState(base, 550, 9);
  const day1 = dayOdds(dayIn(p, { seenPriceCents: 825, state: s })).pHere;
  for (let t = 10; t < 40; t++) s = afterDay(s, 'here', t, 825);
  const settledHabit = initialState(base, 550, 39).habitHere;
  const later = dayOdds(dayIn(p, { tick: 40, seenPriceCents: 825, state: { ...s, habitHere: settledHabit, habitTick: 39 } })).pHere;
  assert.ok(day1 < later && later < before, `day1 ${day1.toFixed(3)} later ${later.toFixed(3)} before ${before.toFixed(3)}`);
  near(s.anchorCents, 825, 3, 'anchor reached the new price (99% after 30 visits)');
  near(s.baseCents, 550, 0, 'base price never moves');
});

console.log('habit');
check('a week away lowers the odds of coming back; a run of visits raises them', () => {
  const p = people[0];
  const s0 = initialState(baselineOdds(p.v, p.loyalty), 550, 9);
  const normal = dayOdds(dayIn(p, { state: s0 })).pHere;
  const away = dayOdds(dayIn(p, { tick: 17, state: s0 })).pHere;
  let s = s0;
  for (let t = 10; t <= 16; t++) s = afterDay(s, 'here', t, 550);
  const streak = dayOdds(dayIn(p, { tick: 17, state: s })).pHere;
  assert.ok(away < normal && normal < streak, `away ${away.toFixed(3)} normal ${normal.toFixed(3)} streak ${streak.toFixed(3)}`);
});

console.log("Claude's nudge");
check('lands exactly halfway (log scale) between the model and Claude tomorrow, then fades', () => {
  const p = people[0];
  const tomorrow = dayIn(p, { tick: 11, seenPriceCents: 650, state: initialState(baselineOdds(p.v, p.loyalty), 550, 10) });
  const model = dayOdds(tomorrow).pHere;
  for (const claude of [model * 0.3, model * 0.8, Math.min(0.95, model * 1.4)]) {
    const s = withClaude(tomorrow, claude, 10);
    const got = dayOdds({ ...tomorrow, state: s }).pHere;
    near(got, model * Math.sqrt(claude / model), 1e-6, `claude ${claude.toFixed(3)}`);
    const later = dayOdds({ ...tomorrow, tick: 53, state: { ...s, habitTick: 52 } }).pHere;
    assert.ok(Math.abs(Math.log(later / model)) < Math.abs(Math.log(got / model)), 'fades back toward the model');
  }
});
check('a second nudge replaces the first (no stacking)', () => {
  const p = people[0];
  const tomorrow = dayIn(p, { tick: 11, seenPriceCents: 650, state: initialState(baselineOdds(p.v, p.loyalty), 550, 10) });
  const model = dayOdds(tomorrow).pHere;
  const once = withClaude(tomorrow, model * 0.5, 10);
  const twice = withClaude({ ...tomorrow, state: once }, model * 0.5, 10);
  near(dayOdds({ ...tomorrow, state: twice }).pHere, dayOdds({ ...tomorrow, state: once }).pHere, 1e-6);
});

console.log('known places');
check('each person knows 3 places, the same every time, favouring strong ones', () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ key: `r${i}`, weight: i === 0 ? 5 : 0.05 }));
  const a = knownPlaces('c001', many);
  assert.equal(a.length, 3);
  assert.deepEqual(knownPlaces('c001', many), a);
  let hasStrong = 0;
  for (let i = 0; i < 200; i++) if (knownPlaces(`c${i}`, many).includes('r0')) hasStrong++;
  assert.ok(hasStrong > 150, `strong place known by ${hasStrong}/200`);
});

console.log('numerics');
check('extremes stay finite (zero base price, huge rise, loyalty 1, rare visitor)', () => {
  for (const p of [...people, { name: 'x', v: 0.05, loyalty: 1, ps: 1 }, { name: 'y', v: 7, loyalty: 0, ps: 0 }]) {
    for (const over of [{ seenPriceCents: 55000 }, { state: { ...initialState(baselineOdds(p.v, p.loyalty), 0, 9) } }, { satisfaction: 1 }, { places: [{ key: 'z', weight: 0 }] }]) {
      const o = dayOdds(dayIn(p, over));
      for (const v of [o.pHere, o.pOut, o.pSkip, o.vHere]) assert.ok(Number.isFinite(v), `${p.name} ${JSON.stringify(over).slice(0, 40)}: ${v}`);
      assert.ok(Number.isFinite(choose(dayIn(p, over), 7n, 'c1').odds.pHere));
    }
  }
});

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
