// Call a procedure as this machine's identity and print what it returns.
//   node tools/proc.mjs <procedure> '<json args array>'
import { readFile } from 'node:fs/promises';
const HOST = 'https://maincloud.spacetimedb.com', DB = 'fork-calhacks';
const token = JSON.parse(await readFile(new URL('../.stdb-identity.json', import.meta.url), 'utf8'))[HOST]; // same saved identity as stdb.mjs
const [name, args = '[]'] = process.argv.slice(2);
const res = await fetch(`${HOST}/v1/database/${DB}/call/${name}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: args,
});
const body = await res.text();
if (!res.ok) throw new Error(`${name} failed: HTTP ${res.status} ${body}`);
try {
  const v = JSON.parse(body);
  console.log(JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2));
} catch {
  console.log(body);
}
