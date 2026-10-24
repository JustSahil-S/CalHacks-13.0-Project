// Backtest: does Fork predict what really happened after a real price change?
// The twin (built with a cutoff date) only knows reviews from before the change. We simulate
// control vs the real new prices, then compare with the café's real reviews after the cutoff.
//
// Usage: node tools/backtest.mjs <buildId> '<new prices JSON>' [windowDays=180] [copies=10]
//   e.g. node tools/backtest.mjs 1 '{"drip":300,"beans":1700}'
import { mkdir, writeFile } from 'node:fs/promises';
import { call, sql } from './stdb.mjs';
import { mentionsPrice } from './price-mentions.mjs';

const [buildId, pricesArg, windowArg = '180', copiesArg = '10'] = process.argv.slice(2);
if (!buildId || !pricesArg) {
  console.error(`Usage: node tools/backtest.mjs <buildId> '{"item":newPriceCents}' [windowDays] [copies]`);
  process.exit(1);
}
const newPrices = JSON.parse(pricesArg);
const W = Number(windowArg);
const copies = Number(copiesArg);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const addDays = (iso, d) => new Date(Date.parse(`${iso}T00:00:00Z`) + d * 864e5).toISOString().slice(0, 10);

const [build] = await sql(`SELECT id, query, cutoff_date, status, universe_id, reviews_json FROM twin_build WHERE id = ${buildId}`);
if (!build || build.status !== 'done') throw new Error(`build ${buildId} is not done`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(build.cutoff_date)) throw new Error('build has no cutoff date; rebuild it with one');
const cutoff = build.cutoff_date;
const twinId = Number(build.universe_id);

// ---- Reality: real reviews in the window before vs after the change ----
const reviews = JSON.parse(build.reviews_json);
const windowStats = (from, to) => {
  const rs = reviews.filter(r => r.date >= from && r.date < to);
  const text = rs.filter(r => r.text.trim().length >= 30);
  return {
    reviews: rs.length,
    avgStars: rs.length ? rs.reduce((s, r) => s + r.stars, 0) / rs.length : null,
    priceMentionShare: text.length ? text.filter(r => mentionsPrice(r.text)).length / text.length : null,
  };
};
const realBefore = windowStats(addDays(cutoff, -W), cutoff);
const realAfter = windowStats(cutoff, addDays(cutoff, W));

// ---- Simulation: warm up the twin, then control vs the real new prices ----
async function waitFor(check, label, timeoutMs = 15 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await sleep(3000);
  }
  throw new Error(`timed out waiting for ${label}`);
}

const [twin] = await sql(`SELECT current_tick FROM universe WHERE id = ${twinId}`);
if (Number(twin.current_tick) === 0) {
  console.log('Warming up the twin for 30 days...');
  await call('run_universe', [twinId, 30]);
  await waitFor(async () => (await sql(`SELECT status FROM universe WHERE id = ${twinId}`))[0].status === 'done', 'warm-up');
}

const label = `backtest build ${buildId}`;
const options = [
  { label: 'control', prices: {} },
  { label: 'real change', prices: newPrices },
];
console.log(`Simulating ${copies} paired copies x ${W} days, with Claude deciding...`);
await call('start_experiment', [twinId, label, JSON.stringify(options), copies, W, 'ai']);
const [exp] = (await sql(`SELECT id FROM experiment WHERE base_universe_id = ${twinId}`)).slice(-1);
await waitFor(async () => (await sql(`SELECT status FROM experiment WHERE id = ${exp.id}`))[0].status === 'done', 'experiment');
const results = await sql(`SELECT * FROM experiment_result WHERE experiment_id = ${exp.id}`);
const ctl = results.find(r => r.option_label === 'control');
const chg = results.find(r => r.option_label === 'real change');

// ---- Compare: direction (and size) of change, sim vs reality ----
const delta = (a, b) => (a == null || b == null ? null : b - a);
const rows = [
  {
    metric: 'average stars',
    real: delta(realBefore.avgStars, realAfter.avgStars),
    simulated: delta(Number(ctl.mean_stars), Number(chg.mean_stars)),
  },
  {
    metric: 'share of reviews mentioning price',
    real: delta(realBefore.priceMentionShare, realAfter.priceMentionShare),
    simulated: delta(Number(ctl.price_mention_share), Number(chg.price_mention_share)),
  },
  {
    metric: 'traffic (real: review count ratio; sim: visits ratio)',
    real: realBefore.reviews ? realAfter.reviews / realBefore.reviews - 1 : null,
    simulated: Number(chg.mean_visits) / Number(ctl.mean_visits) - 1,
  },
];
const sign = x => (x == null ? '?' : Math.abs(x) < 0.005 ? 'flat' : x > 0 ? 'up' : 'down');
const fmt = x => (x == null ? 'n/a' : (x >= 0 ? '+' : '') + x.toFixed(3));

console.log(`\nBACKTEST: ${build.query}, real change on ${cutoff}: ${pricesArg}`);
console.log(`Window: ${W} days before vs after. Real reviews: ${realBefore.reviews} before, ${realAfter.reviews} after.\n`);
console.log('metric'.padEnd(56), 'real'.padStart(9), 'simulated'.padStart(11), '  direction');
let agree = 0;
let scored = 0;
for (const r of rows) {
  const match = sign(r.real) === sign(r.simulated);
  if (r.real != null) {
    scored++;
    if (match) agree++;
  }
  console.log(r.metric.padEnd(56), fmt(r.real).padStart(9), fmt(r.simulated).padStart(11), `  ${sign(r.real)} vs ${sign(r.simulated)} ${match ? 'MATCH' : 'miss'}`);
}
console.log(`\nDirection matched on ${agree} of ${scored} metrics. Profit in simulation: higher in ${chg.profit_wins} of ${chg.copies} paired copies.`);
console.log('Caveat: real changes also reflect everything else that happened in that period, not just the price.');

await mkdir('data', { recursive: true });
const report = { buildId: Number(buildId), query: build.query, cutoff, newPrices, windowDays: W, copies, realBefore, realAfter, rows, agree, scored, simulated: { control: ctl, change: chg } };
await writeFile(`data/backtest-${buildId}.json`, JSON.stringify(report, (k, v) => (typeof v === 'bigint' ? Number(v) : v), 2));
console.log(`Saved data/backtest-${buildId}.json`);
