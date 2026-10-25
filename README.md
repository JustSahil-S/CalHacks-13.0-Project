# Fork

**Rehearse a menu price change before you make it.** Fork turns a real café into a living
simulation: 200 customers built from its real Google reviewers walk its real streets. Every
morning each one decides where to get coffee (here, one of the places they know, or nowhere),
and when you change a price, Claude judges how each customer who notices reacts. Fork runs 10
paired futures per option and tells you the odds: *"raising drip $0.50: profit higher in 10 of
10 futures, visits −5%, price complaints up."*

The app lives in [Mana](https://mana.space): pick or add a café, change prices, watch the
futures play out on a map of the real neighborhood, ask the advisor, and have Mana's browser
agent fetch the café's real menu.

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
   │  every morning each customer chooses (nested logit: here / places they know / home)
   │  customers who notice a change → Claude judges them (cached across copies)
   ▼
Mana app: live map of the real neighborhood (MapLibre + OpenStreetMap tiles), customers
walking, verdict + band chart, advisor, "Get my real menu" (Mana's browser agent)
```

Everything after "paste a link" runs **inside the database** as SpacetimeDB reducers and
procedures, including the Apify scraping, the Claude calls and the OpenStreetMap fetch.

| Piece | Where |
| --- | --- |
| Tables | [`server/src/schema.ts`](server/src/schema.ts) |
| Daily simulation, forks, experiment results | [`server/src/sim.ts`](server/src/sim.ts) |
| How customers decide each day (nested logit, reference prices, habit) | [`server/src/choice.ts`](server/src/choice.ts), [`server/src/today.ts`](server/src/today.ts) |
| AI customers (who notices, situation cache, Claude's judgment per person) | [`server/src/brain.ts`](server/src/brain.ts) |
| Real-café pipeline (place → reviews → menu → customer profiles → twin) | [`server/src/pipeline.ts`](server/src/pipeline.ts), [`server/src/menu.ts`](server/src/menu.ts) |
| Neighborhood map from OpenStreetMap | [`server/src/areamap.ts`](server/src/areamap.ts) |
| Seeded paired luck (copy #k of every option rolls the same dice) | [`server/src/rng.ts`](server/src/rng.ts) |
| SDK the Mana app imports (live data + the map) | [`client/src/sdk.ts`](client/src/sdk.ts), [`client/src/tilescene.ts`](client/src/tilescene.ts) → [`mana/sdk/fork-sdk.js`](mana/sdk/fork-sdk.js) |
| Original viewer (Three.js isometric scene) | [`client/src`](client/src) |
| Backtest scorer, model checks, unit tests | [`tools/backtest.mjs`](tools/backtest.mjs), [`tools/model-check.mjs`](tools/model-check.mjs), [`tools/choice.test.mjs`](tools/choice.test.mjs) |

## How customers decide

Each customer is an agent with a personality from one real review (type, visits per week, price
sensitivity, loyalty, usual order, a quote as their first memory). Every simulated morning they
choose between staying home, our café and the **3 coffee places they know** (drawn once, weighted
by rating, distance and price) with a **nested logit**, calibrated so that with unchanged prices
it reproduces exactly the odds they started with. A price change works through:

- **the dollars:** a lasting change in how much they like coming;
- **the shock** against what they're used to paying: it fades as they keep coming (their anchor
  moves 15% toward the new price per visit), and a rise hurts more than an equal cut pleases;
- **a ceiling:** every customer has a largest rise on an item they'll put up with, from +15% for
  the most price-sensitive to +75% for the least; past it, the extra rise counts six times as
  hard, so a silly increase loses money instead of looking like free profit;
- **habit:** a few days away make staying away stick, coming back rebuilds it;
- **Claude:** when someone first sees a new price, Claude reads their profile, memories and the
  alternatives nearby and estimates how often they'll keep coming; the model moves halfway (on a
  log scale) toward that estimate, and the nudge fades over a few weeks.

On the first day of a rise below a customer's ceiling, dollars + shock move them exactly as much
as the simpler rule Fork was first backtested with. Draws are exact random-utility draws
shared by copy *k* of every option, so a price change can only move people who would otherwise
have come here: the futures differ because of the price, not luck. The original odds system is
still available as `ai-odds` / `rules-odds` for comparison.

## Find my best price

Instead of testing one price, the owner can let Fork search: one run forks no change plus up to
7 prices for an item, 8 paired futures each (56 worlds, 200 customers, 60 days), on the customer
model without waiting on Claude, so it finishes in seconds. The SDK turns it into a profit curve:
mean paired profit change per price with the worst and best future, how often each price beat
today's, visits, and the share of reviews that mention price. The best price comes with a range
from resampling the futures 400 times, so a flat top reads as "anywhere from $A to $B". "Confirm
with Claude" then runs the best price as a normal experiment where Claude reads every customer who
notices. CLI: `node tools/sweep.mjs <rootUniverseId> <itemKey>`.

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
  images and PDFs), and judges how each customer who notices a change reacts.
- **Mana:** the app itself lives in Mana (built and styled there). Mana's browser agent finds and
  verifies a café's real menu and sends it to the engine, and Mana's AI runs the advisor.

## What is real and what is simulated

**Real:** the café, its hours, rating and location; every coffee place within 7 miles; the menu
when it can be read (from their site, or by Mana's browser agent, with the source page and how
the café was verified); every customer's
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
by review counts, a weak proxy). Rerun with the daily-choice model (Oct 24): the same directions
on all 12. Samples are small (6–36 reviews per window), so read this as early evidence, not proof.
The real increases here are 5–9%; larger changes are outside what the backtests cover.

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
node --experimental-strip-types tools/choice.test.mjs        # unit tests for the customer choice model
node tools/model-check.mjs <rootUniverseId> plan.json    # compare price changes / models on a café
```
