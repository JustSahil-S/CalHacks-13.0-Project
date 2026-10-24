// Runs a list of experiments on one café, one after another, and reports how each behaves:
// verdict, visit curve over time (dip and rebound), where lost visits went, run time, and whether
// the Claude prefetch ever disagreed with the day loop (notices decided by rules in an "ai" run).
//   node tools/model-check.mjs <rootUniverseId> <plan.json>
// plan.json: [{ "label": "...", "brain": "rules", "prices": { "latte": 600 }, "copies": 10, "days": 60, "radiusM": 2414 }]
import { readFile } from 'node:fs/promises';
import { call, sql } from './stdb.mjs';

const [root, planFile] = process.argv.slice(2);
const plan = JSON.parse(await readFile(planFile, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const n = x => Number(x);

for (const p of plan) {
  const label = `${p.label} [${p.brain}]`;
  const options = [
    { label: 'no change', prices: {} },
    { label: 'price change', prices: p.prices },
  ];
  const t0 = Date.now();
  await call('start_experiment_r', [n(root), label, JSON.stringify(options), p.copies ?? 10, p.days ?? 60, p.brain, p.radiusM ?? 2414]);
  let exp;
  for (;;) {
    await sleep(3000);
    const rows = await sql(`SELECT * FROM experiment WHERE base_universe_id = ${root}`);
    exp = rows.filter(r => r.label === label).sort((a, b) => n(b.id) - n(a.id))[0];
    if (exp && exp.status === 'done') break;
    if (Date.now() - t0 > 15 * 60 * 1000) throw new Error(`timed out on ${label}`);
  }
  const secs = Math.round((Date.now() - t0) / 1000);
  const results = await sql(`SELECT * FROM experiment_result WHERE experiment_id = ${exp.id}`);
  const ctl = results.find(r => r.option_label === 'no change');
  const chg = results.find(r => r.option_label === 'price change');
  const unis = await sql(`SELECT * FROM universe WHERE experiment_id = ${exp.id}`);
  // Visits per day, averaged over copies, in four windows of the run.
  const curve = { 'no change': [0, 0, 0, 0], 'price change': [0, 0, 0, 0] };
  const rivalsBy = { 'no change': 0, 'price change': 0 };
  let aiNotices = 0;
  let rulesNotices = 0;
  for (const u of unis) {
    const days = await sql(`SELECT * FROM daily_metric WHERE universe_id = ${u.id}`);
    const span = n(u.max_tick) - n(u.fork_tick);
    for (const d of days) {
      const q = Math.min(3, Math.floor(((n(d.tick) - n(u.fork_tick) - 1) / span) * 4));
      curve[u.option_label][q] += n(d.visits) / (span / 4) / (p.copies ?? 10);
      rivalsBy[u.option_label] += n(d.competitor_visits) / span / (p.copies ?? 10);
    }
    if (u.option_label === 'price change') {
      const ev = await sql(`SELECT * FROM event WHERE universe_id = ${u.id}`);
      for (const e of ev.filter(e => e.kind === 'notice_price')) (/\(ai\)/.test(e.detail) ? aiNotices++ : rulesNotices++);
    }
  }
  const visits = (o, i) => curve[o][i].toFixed(1);
  console.log(`\n${label}  (${secs}s)`);
  console.log(`  verdict: profit higher in ${chg.profit_wins}/${chg.copies}; profit/day ${(n(chg.mean_profit_cents - ctl.mean_profit_cents) / 100 / (p.days ?? 60)).toFixed(2)}; visits ${(((chg.mean_visits / ctl.mean_visits) - 1) * 100).toFixed(1)}%; stars ${(chg.mean_stars - ctl.mean_stars).toFixed(2)}; price mentions ${(chg.price_mention_share * 100).toFixed(0)}%`);
  console.log(`  visits/day by quarter  no change: ${[0, 1, 2, 3].map(i => visits('no change', i)).join(' ')}   price change: ${[0, 1, 2, 3].map(i => visits('price change', i)).join(' ')}`);
  console.log(`  rival visits/day  no change ${rivalsBy['no change'].toFixed(1)}  price change ${rivalsBy['price change'].toFixed(1)}`);
  if (p.brain.startsWith('ai')) console.log(`  notices decided by Claude ${aiNotices}, by rules ${rulesNotices}${rulesNotices ? '  <- prefetch fell back' : ''}`);
}
