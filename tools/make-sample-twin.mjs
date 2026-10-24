// Writes a SYNTHETIC twin for testing the engine before the real data pipeline exists.
// Nothing here comes from a real café or real reviews.
// Usage: node tools/make-sample-twin.mjs samples/sample-twin.json
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const out = process.argv[2] ?? 'samples/sample-twin.json';

let s = 42;
const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = arr => arr[Math.floor(rand() * arr.length)];
const jitter = (x, spread, lo, hi) => Math.min(hi, Math.max(lo, x + (rand() * 2 - 1) * spread));

const menu = [
  { key: 'drip', name: 'Drip coffee', category: 'coffee', priceCents: 325, unitCostCents: 60 },
  { key: 'latte', name: 'Latte', category: 'coffee', priceCents: 550, unitCostCents: 130 },
  { key: 'oat_latte', name: 'Oat latte', category: 'coffee', priceCents: 625, unitCostCents: 170 },
  { key: 'cold_brew', name: 'Cold brew', category: 'coffee', priceCents: 525, unitCostCents: 110 },
  { key: 'matcha', name: 'Matcha latte', category: 'tea', priceCents: 650, unitCostCents: 190 },
  { key: 'croissant', name: 'Croissant', category: 'pastry', priceCents: 450, unitCostCents: 140 },
  { key: 'muffin', name: 'Blueberry muffin', category: 'pastry', priceCents: 400, unitCostCents: 110 },
  { key: 'bagel', name: 'Bagel and cream cheese', category: 'food', priceCents: 575, unitCostCents: 160 },
  { key: 'avo_toast', name: 'Avocado toast', category: 'food', priceCents: 1300, unitCostCents: 420 },
];

const archetypes = [
  { name: 'daily regular', weight: 0.25, priceSensitivity: 0.35, visitsPerWeek: 5, loyalty: 0.85,
    orders: [['drip'], ['latte'], ['oat_latte']], cares: 'consistency, friendly staff',
    memories: ['This is my daily stop, they know my order.', 'Coffee is consistent every single morning.'] },
  { name: 'student', weight: 0.2, priceSensitivity: 0.85, visitsPerWeek: 3, loyalty: 0.45,
    orders: [['drip'], ['cold_brew'], ['drip', 'muffin']], cares: 'price, wifi, outlets',
    memories: ['Good place to study but it is getting pricey.', 'Wifi is solid and there are outlets.'] },
  { name: 'remote worker', weight: 0.2, priceSensitivity: 0.5, visitsPerWeek: 3, loyalty: 0.6,
    orders: [['oat_latte'], ['matcha'], ['latte', 'croissant']], cares: 'wifi, seating, quiet',
    memories: ['I work here a few afternoons a week.', 'Seats fill up fast at lunch.'] },
  { name: 'commuter', weight: 0.15, priceSensitivity: 0.55, visitsPerWeek: 4, loyalty: 0.5,
    orders: [['drip'], ['cold_brew'], ['latte']], cares: 'speed, short lines',
    memories: ['Quick in and out on my way to the train.', 'The line can get long around 8.'] },
  { name: 'weekend brunch', weight: 0.12, priceSensitivity: 0.3, visitsPerWeek: 1, loyalty: 0.55,
    orders: [['latte', 'avo_toast'], ['oat_latte', 'bagel']], cares: 'food quality, vibe',
    memories: ['Great avocado toast on Saturdays.', 'Worth the wait for brunch.'] },
  { name: 'tourist', weight: 0.08, priceSensitivity: 0.25, visitsPerWeek: 0.5, loyalty: 0.2,
    orders: [['latte', 'croissant'], ['matcha']], cares: 'atmosphere, photos',
    memories: ['Cute spot we found while walking around.'] },
];

const firstNames = ['Maya', 'Leo', 'Priya', 'Sam', 'Ava', 'Noah', 'Iris', 'Omar', 'Lena', 'Kai',
  'Zoe', 'Ravi', 'Nina', 'Theo', 'Mila', 'Jon', 'Aria', 'Eli', 'Rosa', 'Ben'];

const customers = [];
for (let i = 0; i < 200; i++) {
  let r = rand();
  const a = archetypes.find(x => (r -= x.weight) < 0) ?? archetypes[0];
  customers.push({
    key: `c${String(i + 1).padStart(3, '0')}`,
    name: `${pick(firstNames)} ${String.fromCharCode(65 + (i % 26))}.`,
    archetype: a.name,
    priceSensitivity: +jitter(a.priceSensitivity, 0.15, 0.05, 1).toFixed(2),
    visitsPerWeek: +jitter(a.visitsPerWeek, a.visitsPerWeek * 0.3, 0.2, 7).toFixed(1),
    loyalty: +jitter(a.loyalty, 0.15, 0.05, 1).toFixed(2),
    usualOrder: pick(a.orders),
    cares: a.cares,
    seedMemories: a.memories,
  });
}

const twin = {
  source: 'synthetic sample for engine testing; not a real café',
  cafe: {
    name: 'Sample Corner Cafe (synthetic)',
    openHour: 7,
    closeHour: 18,
    servicePerHour: 60,
    customerScale: 4,
    rentPerDayCents: 40000,
    wagesPerDayCents: 90000,
  },
  menu,
  competitors: [{ key: 'joes', name: "Joe's Coffee (synthetic)", priceIndex: 0.95, rating: 4.3 }],
  customers,
};

await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(twin, null, 2));
console.log(`Wrote ${customers.length} synthetic customers to ${out}`);
