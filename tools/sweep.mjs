// "Find my best price" from the command line: forks no change plus each price x copies paired
// futures in one run (the same options the SDK's runSweep sends), waits, and prints the curve.
//   node tools/sweep.mjs <rootUniverseId> <itemKey> [price,price,...] [copies] [days]
// Without prices it tries -10%, +10%, +20%, +30%, +45%, +60% (rounded to 25¢), like the app.
import { call, sql } from './stdb.mjs';
const [root, itemKey, pricesArg, copiesArg = '8', daysArg = '60'] = process.argv.slice(2);
const n = x => Number(x);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const item = (await sql(`SELECT * FROM menu_item WHERE universe_id = ${root}`)).find(m => m.key === itemKey);
if (!item) throw new Error(`no ${itemKey} on universe ${root}`);
const current = n(item.price_cents);
const prices =
  pricesArg && pricesArg !== 'auto'
    ? pricesArg.split(',').map(Number)
    : [...new Set([0.9, 1.1, 1.2, 1.3, 1.45, 1.6].map(f => Math.max(25, Math.round((current * f) / 25) * 25)))].filter(p => p !== current);
const copies = n(copiesArg);
const days = n(daysArg);
const label = `Sweep · ${item.name} · cli ${Date.now() % 100000}`;
const options = [{ label: 'no change', prices: {} }, ...prices.map(p => ({ label: `${itemKey}=${p}`, prices: { [itemKey]: p } }))];
const t0 = Date.now();
await call('start_experiment_r', [n(root), label, JSON.stringify(options), copies, days, 'rules', 2414]);
let exp;
for (;;) {
  await sleep(2000);
  exp = (await sql(`SELECT * FROM experiment WHERE base_universe_id = ${root}`)).find(r => r.label === label);
  if (exp?.status === 'done') break;
  if (Date.now() - t0 > 15 * 60 * 1000) throw new Error('timed out');
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const unis = await sql(`SELECT * FROM universe WHERE experiment_id = ${exp.id}`);
const idNums = unis.map(u => n(u.id));
const metrics = await sql(
  `SELECT universe_id, profit_cents, visits, reviews, price_mentions FROM daily_metric WHERE universe_id >= ${Math.min(...idNums)} AND universe_id <= ${Math.max(...idNums)}`
);
const byUni = new Map(unis.map(u => [String(u.id), { u, profit: 0, visits: 0, reviews: 0, mentions: 0 }]));
for (const m of metrics) {
  const x = byUni.get(String(m.universe_id));
  if (!x) continue;
  x.profit += n(m.profit_cents) / 100;
  x.visits += n(m.visits);
  x.reviews += n(m.reviews);
  x.mentions += n(m.price_mentions);
}
const of = label => [...byUni.values()].filter(x => x.u.option_label === label);
const ctl = new Map(of('no change').map(x => [n(x.u.copy_number), x]));
const ctlVisits = of('no change').reduce((s, x) => s + x.visits, 0);
console.log(`${label}: ${options.length} prices x ${copies} futures x ${days} days = ${unis.length} worlds in ${secs}s\n`);
console.log('price     profit/mo vs now    range (worst..best)    wins   visits   price in reviews');
const rows = [{ price: current, mean: 0, lo: 0, hi: 0, wins: '-', visits: 0, share: 0, label: 'no change' }];
for (const o of options.slice(1)) {
  const xs = of(o.label);
  const d = xs.map(x => ((x.profit - ctl.get(n(x.u.copy_number)).profit) / days) * 30);
  const reviews = xs.reduce((s, x) => s + x.reviews, 0);
  rows.push({
    price: o.prices[itemKey],
    mean: d.reduce((s, x) => s + x, 0) / d.length,
    lo: Math.min(...d),
    hi: Math.max(...d),
    wins: `${d.filter(x => x > 0).length}/${d.length}`,
    visits: (xs.reduce((s, x) => s + x.visits, 0) / ctlVisits - 1) * 100,
    share: reviews ? xs.reduce((s, x) => s + x.mentions, 0) / reviews : 0,
  });
}
rows.sort((a, b) => a.price - b.price);
const best = rows.reduce((b, r) => (r.mean > b.mean ? r : b));
for (const r of rows) {
  const $ = v => `${v >= 0 ? '+' : '-'}$${Math.abs(v).toFixed(0)}`;
  console.log(
    `$${(r.price / 100).toFixed(2).padEnd(7)} ${(r.label === 'no change' ? '(current)' : $(r.mean)).padStart(12)}   ${(r.label === 'no change' ? '' : `${$(r.lo)}..${$(r.hi)}`).padStart(20)}   ${String(r.wins).padStart(5)}   ${(r.label === 'no change' ? '' : `${r.visits.toFixed(1)}%`).padStart(6)}   ${(r.share * 100).toFixed(0)}%${r === best ? '   <- best' : ''}`
  );
}
console.log(`\nexperiment ${exp.id}`);
