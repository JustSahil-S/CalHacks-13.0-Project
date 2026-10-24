// Tiny SpacetimeDB HTTP helper for scripts. Talks to the cloud database by default;
// for the local server set STDB_HOST=http://127.0.0.1:3000 and STDB_DB=fork.
//   node tools/stdb.mjs load-twin samples/sample-twin.json
//   node tools/stdb.mjs call <reducer> '<json args array>'
//   node tools/stdb.mjs sql "SELECT * FROM universe"
//   node tools/stdb.mjs experiment samples/latte-test.json   (file: {baseUniverseId,label,copies,days,options})
//   node tools/stdb.mjs build <menu.json> "<Google Maps URL or name, city>" [cutoff YYYY-MM-DD] [label]
//   node tools/stdb.mjs builds                                (progress of every twin build)
import { readFile } from 'node:fs/promises';

const HOST = process.env.STDB_HOST ?? 'https://maincloud.spacetimedb.com';
const DB = process.env.STDB_DB ?? 'fork-calhacks';
const ID_FILE = new URL('../.stdb-identity.json', import.meta.url); // gitignored

/** A saved SpacetimeDB identity for these scripts, so admin rights stick between runs. */
let tokenPromise;
function token() {
  tokenPromise ??= (async () => {
    const { readFile: rf, writeFile } = await import('node:fs/promises');
    let saved = {};
    try {
      saved = JSON.parse(await rf(ID_FILE, 'utf8'));
    } catch {
      /* first run */
    }
    if (saved[HOST]) return saved[HOST];
    const res = await fetch(`${HOST}/v1/identity`, { method: 'POST' });
    const { token: t } = await res.json();
    saved[HOST] = t;
    await writeFile(ID_FILE, JSON.stringify(saved, null, 2));
    return t;
  })();
  return tokenPromise;
}

export async function call(reducer, args) {
  const res = await fetch(`${HOST}/v1/database/${DB}/call/${reducer}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`${reducer} failed: HTTP ${res.status} ${await res.text()}`);
}

/** Returns an array of row objects. */
export async function sql(query) {
  const res = await fetch(`${HOST}/v1/database/${DB}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', Authorization: `Bearer ${await token()}` },
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
  if (a2) e.baseUniverseId = Number(a2); // optional override: node tools/stdb.mjs experiment <file> <baseUniverseId>
  await call("start_experiment", [e.baseUniverseId, e.label, JSON.stringify(e.options), e.copies, e.days, e.brain ?? "rules"]);
  console.log(`Started "${e.label}": ${e.options.length} options x ${e.copies} copies x ${e.days} days`);
} else if (cmd === 'build') {
  const [, , , menuFile, query, cutoff = '', label = ''] = process.argv;
  const menu = menuFile === 'auto' ? '[]' : await readFile(menuFile, 'utf8'); // auto = read it from their site
  await call('start_twin_build', [query, label, JSON.stringify(JSON.parse(menu)), cutoff]);
  console.log(`Started twin build for "${query}"${cutoff ? ` using reviews before ${cutoff}` : ''}`);
} else if (cmd === 'claim-admin') {
  // Reads the secret from .admin-key (gitignored) so it never appears in a command line.
  const key = (await readFile(new URL('../.admin-key', import.meta.url), 'utf8')).trim();
  await call('claim_admin', [key]);
  console.log('This script identity is now a Fork admin.');
} else if (cmd === 'scan') {
  for (const query of process.argv.slice(3)) {
    await call('start_review_scan', [query]);
    console.log(`Started review scan: ${query}`);
  }
} else if (cmd === 'builds') {
  console.table(
    await sql('SELECT id, query, cutoff_date, status, batches_done, batches_total, universe_id, detail FROM twin_build')
  );
} else if (cmd === 'sql') {
  console.table(await sql(a1));
}
