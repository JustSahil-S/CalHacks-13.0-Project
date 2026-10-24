Build a Mana app called **Fork**: a flight simulator for a café owner's price change. An owner picks their café, changes a menu price, and watches 10 possible futures of their real neighborhood play out before deciding. It must work for any visitor who opens the app (no sign-in to anything else).

## Engine (already built, do not rebuild it)
Import everything from this one ES module (it bundles SpacetimeDB + Three.js; IDs are BigInt):

```js
import { connectFork, ForkMap, DEFAULT_RADIUS_M, MAX_RADIUS_M } from 'https://cdn.jsdelivr.net/gh/JustSahil-S/CalHacks-13.0-Project@COMMIT/mana/sdk/fork-sdk.js';
const fork = await connectFork();               // live connection to the cloud database
fork.onChange(() => rerender());                // fires whenever live data changes
fork.cafes()            // [{ buildId, universeId, name, address, rating, reviewsCount, backtestCutoff, menuSource, mapReady }]
                        //   show only cafes with mapReady && backtestCutoff === ''
fork.menu(universeId)   // [{ key, name, category, priceCents }]
fork.rivals(buildId)    // [{ key, name, distanceM, rating, priceIndex, weight }]  real coffee places up to 7 mi
fork.experiments(universeId) // [{ id, label, status: 'running'|'done', copies, days, radiusM }]
await fork.runExperiment({ rootUniverseId: universeId, label, prices: { [key]: newPriceCents }, radiusM, copies: 10, days: 60 })
                        //   throws an Error with a readable message (e.g. one run at a time) -> show it
await fork.watchExperiment(id)  // needed before results / dailyRevenue / gainers update live
fork.results(id)        // { label, status, copies, profitWins, visitsChangePct, starsChange, priceMentionShare,
                        //   profitChangePerMonth, revenueChangePerMonth, baselineProfitPerMonth }  (dollars)
fork.dailyRevenue(id)   // Map<'no change'|'price change', number[copy][day]>  revenue in cents
fork.gainers(id)        // [{ name, perDay }]  rivals that won customers, visits per day

const map = new ForkMap(containerDiv, fork);    // live 3D isometric neighborhood with walking customers
await map.showCafe(buildId); map.setRadius(meters);
await map.showExperiment(id);                   // replay copy 1 of the price-change future
map.play(); map.pause(); map.seek(day); map.setSpeed(1|2|4); map.rotate(1|-1);
map.onDay = ({ day, of, tally }) => {}          // tally: { toCafe, inCafe, toRival, inRival, home }
map.onPick = (customer) => {}                   // click a person: { name, type, visitsPerWeek, priceSensitivity,
                        //   shareHere, mood, usualOrder, memories:[{day|null, text}], reviews:[{day, stars, text}] }
                        //   memories with day === null are quotes from that person's real Google review
```

## Screens
1. **Pick your café** – cards for each café (name, address, ★ rating · reviews, badge for menu source: "menu from website" / "estimated menu"). Remember the last pick per visitor.
2. **The rehearsal** (main screen) – the ForkMap fills most of the screen. A side panel holds:
   - **Menu**: every item with its current price and an editable new price. Changed rows highlight with the % change.
   - **Neighborhood radius** slider with steps 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7 mi (default 1.5) → `map.setRadius`; under it "N coffee places compete for your customers", listing the 3 strongest by `weight`.
   - **Run 10 futures** button (disabled with no change). Label the run like "Latte $5.50→$6.00 · 1.5 mi". While running (~1–2 min) show progress from the experiment status and start the replay as soon as it exists.
   - **Verdict** when done, in plain owner language: big line "Profit higher in X of 10 futures", then "+$Y / month" (profitChangePerMonth; red if negative), visits change %, rating change, "Z% of new reviews mention price", and "Who won your customers" from gainers. A small band chart of daily revenue: two bands (no change vs price change), min–max across the 10 copies with the mean as a line.
   - Playback bar over the map: play/pause, day scrubber "Day d of 60", speed 1×/2×/4×, rotate ⟲ ⟳, and a live tally (heading to you / in your café / at rivals / home).
   - **Customer card** when a person is clicked: name, type, habit, sensitivity, their memories (mark real-review quotes "from their real Google review") and any reviews they wrote in the simulation.
3. **Ask the advisor** – a chat drawer on the rehearsal screen. Use Mana's AI with the café, menu, rivals and the latest verdict as context; it explains the result and suggests the next price to test (and can fill the menu for it). Limit each visitor to 3 questions (use the visitor id), then say thanks.
4. **History** – past runs for this café with their verdict lines; clicking one replays it.

## Look
Warm, editorial, map-first: paper background #f3eee4, ink #1d1a16, the owner's café red #c8412f, rivals teal #1f6f6b, hairline borders, a characterful serif for headings (e.g. Fraunces) with a monospace for numbers and labels. No purple gradients, no generic dashboard look. Must work on a laptop screen; on a phone the panel stacks under the map.

## Rules
- Don't invent numbers: everything shown comes from the module above.
- Explain uncertainty honestly: it's 10 simulated futures, not a guarantee.
