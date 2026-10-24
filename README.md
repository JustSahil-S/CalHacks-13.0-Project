# Fork

**Rehearse a menu price change before you make it.** Fork turns a real café into a living
simulation: 200 customers built from its real Google reviewers walk its real streets, and when
you change a price, Claude decides how each customer who notices reacts. Fork runs 10 paired
futures per option and tells you the odds: *"raising drip $0.50: profit higher in 10 of 10
futures, visits −5%, price complaints up."*

Built at CalHacks 13 (Oct 24–26, 2026).

## How it works

```
Google Maps link
   │  Apify: place, reviews, nearby cafés · Google search + crawler: the menu
   ▼
Claude reads every review → one customer per real reviewer (type, usual order,
visits/week, price sensitivity, a quote from their review as a memory)
   │  OpenStreetMap: every building, road and park around the café and its rival
   ▼
SpacetimeDB runs the world: daily ticks, money, waits, reviews, forks into paired copies
   │  customers who notice a change → Claude gives odds (cached across copies)
   ▼
Viewer: isometric model of the real neighborhood, customers walking, results + band chart
```

Everything after "paste a link" runs **inside the database** as SpacetimeDB reducers and
procedures, including the Apify scraping, the Claude calls and the OpenStreetMap fetch.

| Piece | Where |
| --- | --- |
| Tables | [`server/src/schema.ts`](server/src/schema.ts) |
| Daily simulation, forks, experiment results | [`server/src/sim.ts`](server/src/sim.ts) |
| AI customers (who notices, situation cache, odds anchored to real visit frequency) | [`server/src/brain.ts`](server/src/brain.ts) |
| Real-café pipeline (place → reviews → menu → customer profiles → twin) | [`server/src/pipeline.ts`](server/src/pipeline.ts), [`server/src/menu.ts`](server/src/menu.ts) |
| Neighborhood map from OpenStreetMap | [`server/src/areamap.ts`](server/src/areamap.ts) |
| Seeded paired luck (copy #k of every option rolls the same dice) | [`server/src/rng.ts`](server/src/rng.ts) |
| Viewer (Three.js isometric scene, live subscriptions) | [`client/src`](client/src) |
| Backtest scorer | [`tools/backtest.mjs`](tools/backtest.mjs) |

## Sponsors

- **SpacetimeDB:** the whole backend. Tables hold every universe, customer, visit and review;
  a scheduled reducer is the simulation clock; experiments fork universes in one transaction;
  procedures call Claude, Apify and OpenStreetMap over HTTP; the viewer subscribes live, so
  every day, walk and result streams to everyone watching. Admin actions are gated by identity.
- **Apify:** Google Maps Scraper (place, nearby competitors), Google Maps Reviews Scraper
  (dated reviews, no personal data), Google Search Scraper + Website Content Crawler (menus).
  Runs are started asynchronously from database procedures and polled, with free-plan
  concurrency limits handled by waiting.
- **Claude (Haiku 5.5):** reads reviews into customer profiles, reads menus (including menu
  images and PDFs), and decides how customers react to changes.

## What is real and what is simulated

**Real:** the café, its hours, rating and location; its nearby competitor; every customer's
tastes, habits and starting memory (from a real review, never the reviewer's name); the
buildings and streets; for backtests, the documented before/after prices.

**Simulated or estimated:** the 200-customer crowd is a sample (each simulated customer stands
for ~4 real ones); daily traffic, rent, wages and item costs (30% of price) are estimates;
menus are read from the café's site when possible and otherwise **estimated and labeled**;
reactions to a price change are Claude's judgment for that specific person.

## Backtests

The twin is built only from reviews before a real, news-documented price increase, run
forward with Claude deciding, and compared with the café's real reviews afterward (180 days
before vs after). Reports: [`backtests/`](backtests).

| Café | Real change | Rating | Price complaints | Traffic |
| --- | --- | --- | --- | --- |
| Henry's House of Coffee, SF | drip $2.75→$3.00 (mid-2021) | ✅ | ✅ | ❌ |
| Porto Rico Importing Co., NYC | latte $4.90→$5.20 (Mar 2025) | ✅ | ❌ | ❌ |
| Ntaba Coffee Haus, Louisville | drip +25¢, latte +50¢ (Feb 2022) | ✅ | ✅ | ❌ |
| Timeless Coffee, Oakland | espresso $4.25→$4.50 (early 2025) | ❌ | ✅ | ✅ |

Direction matched **6 of 8** on ratings and price complaints, **1 of 4** on traffic (measured
by review counts, a weak proxy). Samples are small (6–36 reviews per window), so read this as
early evidence, not proof.

## Run it

Requirements: Node 22, the SpacetimeDB CLI 2.13.

```bash
cd server && npm install && cd ..
spacetime publish fork-calhacks --module-path server -s maincloud
```

Secrets live in the database's environment, never in the repo. Set them in your shell and run
`spacetime publish fork-calhacks --env-only -s maincloud`:
`ANTHROPIC_API_KEY`, `APIFY_TOKEN`, `ADMIN_KEY`.

Viewer:

```bash
cd client && npm install && npm run dev
```

Open http://localhost:5173 (add `?admin=<ADMIN_KEY>` once to unlock building twins).

Scripts (`tools/stdb.mjs`, talks to the cloud database over HTTP):

```bash
node tools/stdb.mjs claim-admin                       # reads .admin-key
node tools/stdb.mjs build auto "Café name, City"      # build a twin, menu found automatically
node tools/stdb.mjs builds                            # build progress
node tools/stdb.mjs experiment samples/ai-test.json 1 # run an experiment on universe 1
node tools/backtest.mjs <buildId> '{"drip":300}'      # backtest a build made with a cutoff date
```
