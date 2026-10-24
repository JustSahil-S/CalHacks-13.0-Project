// Look through scanned cafés' real reviews for evidence of a price increase, to pick a backtest café.
// Usage: node tools/find-price-changes.mjs            (all scanned builds)
//        node tools/find-price-changes.mjs <buildId>  (one build, with example reviews)
import { sql } from './stdb.mjs';
import { mentionsPrice, mentionsPriceChange } from './price-mentions.mjs';

const only = process.argv[2];
const builds = await sql('SELECT id, query, status, reviews_json FROM twin_build');

for (const b of builds) {
  if (only && String(b.id) !== only) continue;
  if (!b.reviews_json) {
    console.log(`#${b.id} ${b.query}: ${b.status} (no reviews yet)`);
    continue;
  }
  const reviews = JSON.parse(b.reviews_json);
  const withText = reviews.filter(r => r.text.trim().length >= 30);
  const changes = withText.filter(r => mentionsPriceChange(r.text));
  const byHalf = new Map();
  for (const r of withText) {
    const half = `${r.date.slice(0, 4)}-H${Number(r.date.slice(5, 7)) <= 6 ? 1 : 2}`;
    const h = byHalf.get(half) ?? { text: 0, price: 0, change: 0 };
    h.text++;
    if (mentionsPrice(r.text)) h.price++;
    if (mentionsPriceChange(r.text)) h.change++;
    byHalf.set(half, h);
  }
  console.log(`\n#${b.id} ${b.query}`);
  console.log(`  ${reviews.length} reviews (${withText.length} with text), ${reviews[0]?.date} to ${reviews.at(-1)?.date}`);
  console.log(`  reviews describing a price change: ${changes.length}`);
  console.log('  half-year   text  price-mentions  change-mentions');
  for (const [half, h] of [...byHalf].sort()) {
    console.log(`  ${half}   ${String(h.text).padStart(4)}  ${String(h.price).padStart(14)}  ${String(h.change).padStart(15)}`);
  }
  if (only || changes.length) {
    for (const r of changes.slice(-8)) console.log(`   ${r.date} (${r.stars}*) ${r.text.replace(/\s+/g, ' ').slice(0, 220)}`);
  }
}
