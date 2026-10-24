// Tiny SpacetimeDB HTTP helper for scripts. Works against the local server by default.
//   node tools/stdb.mjs load-twin samples/sample-twin.json
//   node tools/stdb.mjs call <reducer> '<json args array>'
//   node tools/stdb.mjs sql "SELECT * FROM universe"
//   node tools/stdb.mjs experiment samples/latte-test.json   (file: {baseUniverseId,label,copies,days,options})
import { readFile } from 'node:fs/promises';

const HOST = process.env.STDB_HOST ?? 'http://127.0.0.1:3000';
const DB = process.env.STDB_DB ?? 'fork';

export async function call(reducer, args) {
  const res = await fetch(`${HOST}/v1/database/${DB}/call/${reducer}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`${reducer} failed: HTTP ${res.status} ${await res.text()}`);
}

/** Returns an array of row objects. */
export async function sql(query) {
  const res = await fetch(`${HOST}/v1/database/${DB}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });
  if (!res.ok) throw new Error(`sql failed: HTTP ${res.status} ${await res.text()}`);
  const [result] = await res.json();
  const names = result.schema.elements.map(e => e.name?.some ?? e.name);
  return result.rows.map(row => Object.fromEntries(names.map((n, i) => [n, row[i]])));
}

const [cmd, a1, a2] = process.argv.slice(2);
if (cmd === 'load-twin') {
  const twin = await readFile(a1, 'utf8');
  await call('load_twin', [twin]);
  console.log(`Loaded ${a1}`);
} else if (cmd === 'call') {
  await call(a1, JSON.parse(a2 ?? '[]'));
  console.log(`Called ${a1}`);
} else if (cmd === 'experiment') {
  const e = JSON.parse(await readFile(a1, 'utf8'));
  await call('start_experiment', [e.baseUniverseId, e.label, JSON.stringify(e.options), e.copies, e.days]);
  console.log(`Started "${e.label}": ${e.options.length} options x ${e.copies} copies x ${e.days} days`);
} else if (cmd === 'sql') {
  console.table(await sql(a1));
}
