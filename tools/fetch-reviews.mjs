// Pull a café's Google reviews through Apify (compass/google-maps-reviews-scraper).
// Usage (PowerShell, from the fork folder):
//   $env:APIFY_TOKEN = "<your Apify token>"
//   node tools/fetch-reviews.mjs "Henry's House of Coffee San Francisco" 2020-07-01 data/henrys-reviews.json
// Reviewer names and profile data are not requested (personalData: false).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const [query, startDate, outFile] = process.argv.slice(2);
const token = process.env.APIFY_TOKEN;
if (!token || !query || !startDate || !outFile) {
  console.error(
    'Usage: set APIFY_TOKEN, then: node tools/fetch-reviews.mjs "<café name + city>" <YYYY-MM-DD> <out.json>'
  );
  process.exit(1);
}

const input = {
  startUrls: [
    { url: `https://www.google.com/maps/search/${encodeURIComponent(query)}` },
  ],
  reviewsSort: 'newest',
  reviewsStartDate: startDate,
  language: 'en',
  personalData: false,
};

console.log(`Scraping reviews for "${query}" since ${startDate}...`);
const res = await fetch(
  'https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/run-sync-get-dataset-items',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }
);
if (!res.ok) {
  console.error(`Apify returned HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const items = await res.json();
const place = items[0] ?? {};
const reviews = items
  .filter(r => r.publishedAtDate)
  .map(r => ({
    date: r.publishedAtDate.slice(0, 10),
    stars: r.stars,
    text: r.text ?? '',
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

await mkdir(dirname(outFile), { recursive: true });
await writeFile(
  outFile,
  JSON.stringify(
    {
      place: {
        title: place.title,
        address: place.address,
        totalScore: place.totalScore,
        reviewsCount: place.reviewsCount,
        price: place.price,
      },
      reviews,
    },
    null,
    2
  )
);
console.log(
  `Saved ${reviews.length} reviews (${reviews[0]?.date} to ${reviews.at(-1)?.date}) for ${place.title} to ${outFile}`
);
