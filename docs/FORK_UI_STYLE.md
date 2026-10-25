# Fork UI style: build prompt and spec

Paste everything below the line into an AI coding tool, or follow it by hand. It reproduces
Fork's interface: the original viewer and the Mana app look the same. Swap in your own logic and
data; keep the look.

---

Build the interface in **Fork's visual style**, exactly as specified here. The concept is *an
architect's scale model of a real neighborhood on warm paper*: a full-screen map behind
everything, cream "paper sheets" floating on it, ink-black type, **one tomato-red accent for our
café** and **one teal accent for competitors**. It's editorial and calm. Not a dashboard, no
purple, no gradients except the masthead fade, no emoji in the UI.

## 1. Foundations

### Fonts (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

- **Fraunces** (display serif): wordmark, headings, verdicts, memories and quotes (italic 300).
- **IBM Plex Sans** (body): paragraphs, buttons, inputs.
- **IBM Plex Mono** (data): every number, price, label, eyebrow, legend and tally. Numbers are
  *always* mono.

### Design tokens (CSS variables, use only these)

```css
:root {
  --paper: #f3eee4;          /* page background */
  --paper-2: #ebe4d6;        /* map ground, secondary fills */
  --sheet: rgba(251, 248, 242, 0.92); /* floating cards */
  --ink: #1f1c18;            /* text, primary buttons */
  --ink-2: #5d564b;          /* secondary text */
  --ink-3: #958c7c;          /* labels, hints, axis text */
  --rule: rgba(31, 28, 24, 0.12); /* hairlines and borders */
  --cafe: #d9472b;           /* OUR café: tomato red */
  --rival: #1f6f6b;          /* competitors: deep teal */
  --home: #c9b99c;           /* homes / neutral */
  --good: #3f7d3a;           /* positive verdicts */
  --bad: #b23a2a;            /* negative numbers, errors */
  --shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 18px 40px -24px rgba(60,45,20,.45);
  --display: 'Fraunces', Georgia, serif;
  --body: 'IBM Plex Sans', 'Helvetica Neue', sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;
}
```

Color rules:
- **Red means our café**: its building, its pin, people heading to it, a changed price, the
  "price change" series. **Teal means competitors**: their buildings, pins, people at them,
  the radius slider and ring. Never swap them, and never use red for "bad". Use `--bad` for that.
- **Green (`--good`) only for a favorable verdict** (profit higher in 7 or more of 10 futures).
- Everything else is ink on paper.

### Paper grain (over everything, never blocks clicks)

```css
body::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; opacity: .35;
  mix-blend-mode: multiply; z-index: 30;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
html, body { margin: 0; height: 100%; overflow: hidden; }
body { font-family: var(--body); color: var(--ink); background: var(--paper); font-size: 14px; -webkit-font-smoothing: antialiased; }
* { box-sizing: border-box; }
```

## 2. Layout (desktop)

The map fills the whole window behind everything (`position: fixed; inset: 0`). Four layers float
on it:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Fork.  rehearse a price change before you make it   CAFÉ [select ▾]  ● live │  masthead
│ ┌─────────────┐                                        ┌────────────┐   │
│ │ THE TWIN    │                                        │ RESULT     │   │
│ │ Café name   │            full-bleed map              │ verdict    │   │
│ │ facts grid  │       (customers walking, pins)        │ ■■■■■■□□□□ │   │
│ ├─────────────┤                                        │ chart      │   │
│ │ FORK THE    │                                        ├────────────┤   │
│ │ FUTURE      │                                        │ customer   │   │
│ │ menu rows   │                                        │ card       │   │
│ │ radius      │                                        └────────────┘   │
│ │ [Run]       │                                                          │
│ └─────────────┘                                                          │
│ [no change|price change] (▶) DAY 12 / 60 ━━━●━━━  ½× 1× 4×  tally  ⟲ ⟳ │  deck
└────────────────────────────────────────────────────────────────────────┘
```

- **Masthead:** fixed top, `padding: 16px 24px`, background `linear-gradient(var(--paper) 55%, transparent)` so the map fades in under it.
- **Left column ("dossier"):** `top: 76px; left: 20px; bottom: 92px; width: 340px`, scrolls,
  cards stacked with `gap: 12px`.
- **Right column:** `top: 76px; right: 20px; width: 320px`, holds the result card and the
  customer card. Only its children take clicks (`pointer-events: none` on the column, `auto` on
  cards), so the map stays draggable between them.
- **Deck:** fixed bottom bar, `left: 20px; right: 20px; bottom: 18px`, one row.
- **Toast:** centered under the masthead (`top: 84px`), ink background, paper text.

## 3. Components (exact CSS)

```css
/* Small uppercase label above every section */
.eyebrow { font: 500 10.5px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 8px; }

/* Masthead */
.masthead { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 28px; padding: 16px 24px; background: linear-gradient(var(--paper) 55%, transparent); z-index: 5; }
.brand { display: flex; align-items: baseline; gap: 14px; margin-right: auto; }
.brand-mark { font: 700 30px/1 var(--display); letter-spacing: -.02em; font-variation-settings: 'opsz' 144; }
.brand-mark::after { content: '.'; color: var(--cafe); }            /* "Fork." with a red period */
.brand-sub { font: italic 300 15px var(--display); color: var(--ink-2); }
.cafe-picker { display: flex; align-items: center; gap: 10px; }
.status { display: flex; align-items: center; gap: 8px; font: 12px var(--mono); color: var(--ink-2); }
.status .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-3); }
.status.live .dot { background: var(--good); box-shadow: 0 0 0 3px rgba(63,125,58,.18); }
.status.down .dot { background: var(--bad); }

/* Inputs */
select, input, textarea { font: 14px var(--body); color: var(--ink); background: rgba(255,255,255,.6); border: 1px solid var(--rule); border-radius: 6px; padding: 7px 9px; }
select:focus, input:focus, textarea:focus { outline: 2px solid var(--cafe); outline-offset: 1px; }

/* Cards ("sheets") */
.sheet { background: var(--sheet); border: 1px solid var(--rule); border-radius: 10px; padding: 16px 18px; box-shadow: var(--shadow); backdrop-filter: blur(6px); animation: rise .5s cubic-bezier(.2,.8,.2,1) both; }
.sheet:nth-child(2) { animation-delay: .06s; } .sheet:nth-child(3) { animation-delay: .12s; } .sheet:nth-child(4) { animation-delay: .18s; }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } }

/* Headings */
h1, h2 { font-family: var(--display); font-weight: 500; letter-spacing: -.015em; margin: 0 0 4px; font-variation-settings: 'opsz' 96; }
h1 { font-size: 26px; line-height: 1.1; }  h2 { font-size: 22px; }
.meta { margin: 0 0 12px; color: var(--ink-2); font-size: 13px; }

/* Fact grid: 2 columns, hairline above each fact, mono values */
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin: 0; }
.facts div { border-top: 1px solid var(--rule); padding-top: 6px; }
.facts div.wide { grid-column: 1 / -1; }
.facts dt { font: 10.5px var(--mono); color: var(--ink-3); text-transform: uppercase; letter-spacing: .08em; }
.facts dd { margin: 2px 0 0; font: 500 15px var(--mono); }

/* Menu editor rows: name | old price | new price input */
.menu-editor { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.menu-row { display: grid; grid-template-columns: 1fr 64px 76px; align-items: center; gap: 8px; }
.menu-row .name { font-size: 13.5px; }
.menu-row .name small { display: block; font: 11px var(--mono); color: var(--cafe); }   /* e.g. "+12%" */
.menu-row .old { font: 13px var(--mono); color: var(--ink-3); text-align: right; }
.menu-row input { font-family: var(--mono); padding: 5px 7px; text-align: right; width: 100%; }
.menu-row input.changed { border-color: var(--cafe); background: rgba(217,71,43,.07); }

/* Radius slider (teal) */
.radius { display: flex; flex-direction: column; gap: 4px; margin: 4px 0 12px; font-size: 12.5px; color: var(--ink-2); }
.radius b { font: 500 13px var(--mono); color: var(--rival); }
.radius input { width: 100%; accent-color: var(--rival); padding: 0; border: none; background: none; }
.radius small { font: 11px var(--mono); color: var(--ink-3); }

/* Buttons */
button { font: 500 13.5px var(--body); color: var(--ink); background: transparent; border: 1px solid var(--ink); border-radius: 6px; padding: 8px 14px; cursor: pointer; transition: transform .12s, background .12s; }
button:hover { background: rgba(31,28,24,.05); }
button:active { transform: translateY(1px); }
button:disabled { opacity: .45; cursor: default; }
button.primary { width: 100%; background: var(--ink); color: var(--paper); border-color: var(--ink); padding: 10px 14px; }   /* "Run 10 futures" */
button.primary:hover { background: #000; }
button.icon { width: 36px; height: 36px; padding: 0; font-size: 15px; border-radius: 50%; }   /* play, rotate */
button.quiet { border-color: var(--rule); }
button.mini { padding: 4px 10px; font-size: 12px; border-color: var(--cafe); color: var(--cafe); }
.hint { margin: 10px 0 0; font-size: 12px; color: var(--ink-3); line-height: 1.45; }
.hint.err { color: var(--bad); }

/* Result card */
.verdict { font: 500 21px/1.25 var(--display); margin: 0 0 10px; }       /* "Profit higher in <em>8 of 10</em> futures" */
.verdict em { font-style: normal; color: var(--cafe); }
.verdict.good em { color: var(--good); }
.futures { display: flex; gap: 4px; margin: 0 0 12px; }                  /* one square per future */
.futures i { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid var(--cafe); }
.futures i.win { background: var(--cafe); }
.futures.good i { border-color: var(--good); } .futures.good i.win { background: var(--good); }
.profit { font: 500 26px/1 var(--mono); margin: 0 0 4px; }              /* "+$1,316 / month" */
.profit.neg { color: var(--bad); }
.profit small { font: 13px var(--mono); color: var(--ink-3); }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0 10px; }
.stat-grid div { border-top: 1px solid var(--rule); padding-top: 5px; }
.stat-grid b { display: block; font: 500 15px var(--mono); }
.stat-grid span { font: 10px var(--mono); color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; }
.gainers { font-size: 12.5px; color: var(--ink-2); margin: 0 0 10px; line-height: 1.5; }
.gainers b { color: var(--rival); font-weight: 600; }                     /* rival names in teal */
.chart { width: 100%; height: 130px; display: block; }
.legend { display: flex; gap: 14px; font: 11px var(--mono); color: var(--ink-2); margin-top: 4px; flex-wrap: wrap; }
.legend i { display: inline-block; width: 10px; height: 3px; margin-right: 5px; vertical-align: middle; }

/* Customer card (opens when a person on the map is clicked; slides in from the right) */
.inspector { position: relative; padding: 18px; animation: slide .35s cubic-bezier(.2,.8,.2,1); }
@keyframes slide { from { opacity: 0; transform: translateX(16px); } }
.close { position: absolute; top: 10px; right: 10px; border: none; font-size: 20px; padding: 2px 8px; line-height: 1; }
.memories { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
.memories li { font: italic 300 14.5px/1.4 var(--display); color: var(--ink); }   /* quotes read like handwriting */
.memories li small { display: block; font: 10.5px var(--mono); font-style: normal; color: var(--ink-3); }   /* "day 12" */
.memories li small.real { color: var(--rival); }                         /* "from a real Google review" */

/* Bottom deck */
.deck { position: fixed; left: 20px; right: 20px; bottom: 18px; display: flex; align-items: center; gap: 18px; padding: 12px 16px; background: var(--sheet); border: 1px solid var(--rule); border-radius: 12px; box-shadow: var(--shadow); z-index: 5; }
.option-tabs { display: flex; gap: 4px; }
.option-tabs button { padding: 6px 11px; font-size: 12.5px; border-color: var(--rule); }
.option-tabs button.on { border-color: var(--ink); background: var(--ink); color: var(--paper); }
.day { display: flex; align-items: baseline; gap: 6px; min-width: 110px; }
.day-num { font: 500 24px var(--mono); }
.day-of { font: 13px var(--mono); color: var(--ink-3); }
.day-slider { flex: 1; accent-color: var(--cafe); background: none; border: none; padding: 0; }
.seg { display: flex; }                                                    /* ½× 1× 4×, Café | 1.5 mi */
.seg button { border-radius: 0; border-color: var(--rule); padding: 6px 9px; font: 12px var(--mono); }
.seg button + button { margin-left: -1px; }
.seg button:first-child { border-radius: 6px 0 0 6px; } .seg button:last-child { border-radius: 0 6px 6px 0; }
.seg button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.tally { display: flex; gap: 14px; font: 12px var(--mono); color: var(--ink-2); white-space: nowrap; }
.tally b { font-weight: 500; color: var(--ink); } .tally .c { color: var(--cafe); } .tally .r { color: var(--rival); }

/* Toast */
.toast { position: fixed; left: 50%; top: 84px; transform: translateX(-50%); background: var(--ink); color: var(--paper); padding: 9px 16px; border-radius: 8px; font-size: 13px; z-index: 10; box-shadow: var(--shadow); display: flex; align-items: center; gap: 12px; }

/* Map labels (HTML over the map) */
.fork-pin { pointer-events: none; font: 600 11px var(--mono); letter-spacing: .06em; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; color: #fff; white-space: nowrap; }
.fork-pin.cafe { background: var(--cafe); } .fork-pin.rival { background: var(--rival); }
.fork-pin span { opacity: .8; font-weight: 400; margin-left: 6px; }       /* "0.45 MI", "3 INSIDE" */

/* Thin progress bar (builds, runs, menu reads) */
.bar { height: 3px; background: var(--rule); border-radius: 2px; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--cafe); transition: width .4s; }
@keyframes pulse { 0%,100% { opacity: .4 } 50% { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .sheet, .inspector { animation: none; } }
```

## 4. Content of each card

**The twin** (left, first card): eyebrow `THE TWIN`, `h1` café name, `.meta` address, then a
`.facts` grid: Google rating (`4.8★`), reviews, customers (`200 · 147 reviewers`), hours
(`11–20`), rival (nearest), built from (`all reviews`), and a wide row for the menu source
("read by Mana's browser · site.com ↗", "read from their website" or "estimated (no menu online)").

**Fork the future** (left, second card): eyebrow, menu rows (name, old price grey, new price
input, changed rows turn red and show `+12%` under the name), the radius slider
(`Competitors within 1.5 mi`, steps 0.25/0.5/0.75/1/1.5/2/3/5/7 mi, then
`19 coffee places compete for your customers` plus the 3 strongest as a small mono list), the
primary button `Run 10 futures`, and a `.hint` line under it.

**Result** (right, first card): eyebrow `RESULT`, the run label in small text
(`Café de Olla $4.20→$4.70 · 1.5 mi`), the verdict
`Profit higher in <em>8 of 10</em> futures` (green when 7 or more), ten `.futures` squares, the
profit `+$1,316 / month` (red when negative) with a caption `average profit change vs. not
changing`, a 3-column stat grid (VISITS −15.8%, RATING −0.09★, REVIEWS ON PRICE 12.8%), the
gainers line `Who won your customers: <b>Binge Coffee House</b> +0.8/day · …`, the chart and its
legend, and a final honesty line in `.hint`: *"These are 10 simulated futures of the next 60
days, each with and without the change: odds to reason with, not a guarantee."* While running,
show `Simulating 10 futures per option…` with a pulsing dot.

**Customer card** (right, below the result, when a person is clicked): eyebrow = their type
(`daily regular`), `h2` name (`Maya R.`), facts (usual order, pays, visits/week, here vs rival
`72% here`, price sensitivity, mood `4.1 / 5`), eyebrow `MEMORIES` with a `.memories` list (their
real review quote first, tagged `from a real Google review` in teal; later memories tagged
`day 12`), then `REVIEWS` with stars if they wrote any.

**Deck** (bottom): option tabs (`no change` / `price change`), round play/pause button,
`DAY 12 / 60`, the red day scrubber, speed `½× 1× 4×`, the tally
(`4 at the café · 3 at rivals · 193 home`, numbers colored red/teal), and round rotate buttons
`⟲ ⟳`. Optional: a `Café | 1.5 mi` segmented toggle to zoom between street level and the whole
radius.

## 5. The chart (plain SVG, no chart library)

- `viewBox="0 0 320 150"`, `preserveAspectRatio="none"`, padding left 34, bottom 16, top 6.
- One series per option: **no change in `#958c7c` (ink-3), price change in `#d9472b` (café red)**.
- For each day: a **band** from the low to the high value across the 10 futures (fill = series
  color at `opacity .16`) and a **line** for the average or median (stroke 1.6). A 7-day rolling
  mean keeps it readable.
- Three faint gridlines (`rgba(31,28,24,.08)`) with mono 8px `$` labels in ink-3 on the left;
  `day 1` and `day 60` along the bottom.
- A dashed ink cursor line (`stroke-dasharray 2 2`, opacity .5) at the replay's current day.
- Legend below: `— no change   — price change   daily revenue · average + full range`.

## 6. The map

If you use our engine, import it and get the whole map for free:

```js
import { connectFork, ForkMap } from 'https://cdn.jsdelivr.net/gh/JustSahil-S/CalHacks-13.0-Project@main/mana/sdk/fork-sdk.js'; // pin a commit hash instead of @main for a demo
const fork = await connectFork();
const map = new ForkMap(document.getElementById('stage'), fork);
await map.showCafe(buildId); map.setRadius(2414); await map.showExperiment(experimentId); map.play();
```

If you draw your own map (MapLibre GL + OpenFreeMap tiles, free, no key:
`https://tiles.openfreemap.org/planet`), match this:

- **Camera:** near-isometric. Pitch `54.7°`, vertical field of view `8°` (`map.setVerticalFieldOfView(8)`),
  bearing `45°` and rotation only in 90° steps (no free rotate or pitch).
- **Palette:** ground `#ebe3d3`, water `#c9d3cd`, parks/grass `#c5cfa8`, roads `#fbf8f2` with a
  `#d9cdb8` casing, 3D buildings `#e1d6c2` (fill-extrusion from `render_height`, opacity .92,
  vertical gradient on). **The café's own building in `#d9472b`, rivals' buildings in
  `#1f6f6b`.** No map labels: our HTML pins are the only text.
- **Radius:** a dashed teal ring (`#1f6f6b`, width 2, opacity .75, dash 3 2), and everything
  outside it faded with paper (`#f3eee4` at opacity .88). Draw the outside as a band of quads,
  not a polygon with a hole: holes break at street zoom. Rivals are small teal dots with a white
  stroke; label the strongest (up to 12) with `.fork-pin.rival` and hide labels that would overlap.
- **People:** circle dots, radius 2.5 px at zoom 11 up to 7 px at zoom 17, white 1 px stroke.
  Colors: heading to or at our café `#d9472b`, at a rival `#1f6f6b`, noticed the new price today
  `#f0a020` (amber), walking home dimmed 25% toward `#8c8073`. Clicking a dot opens the customer
  card and puts an ink ring (`#1f1c18`, 2 px) around it.
- Keep the "© OpenStreetMap contributors · OpenFreeMap" attribution visible at bottom right.

## 7. Responsive

- **Under ~1100 px ("mid"):** tighten the deck (gap 12, shorter tally labels).
- **Under ~860 px ("narrow"):** hide the tagline, tally and option tabs. The left column becomes
  full width at the top (max 38% of the height), the map sits below it, the right column stacks
  over the map, and the deck shrinks (gap 10, padding 10 12).

## 8. Voice and copy

- Plain owner language: "futures", "your café", "who won your customers", "profit higher in 8
  of 10 futures". Avoid jargon such as "simulation run", "universe", "agents" or "p-value".
- Every number in mono. Dollars with `$` and two decimals for prices; profit rounded to whole
  dollars with a `/ month` unit.
- Always say what's estimated ("estimated menu", "odds to reason with, not a guarantee").
- Eyebrows are 1–3 words, uppercase: THE TWIN, FORK THE FUTURE, RESULT, MEMORIES.

## 9. Checklist before you call it done

- [ ] "Fork." wordmark with the red period, italic tagline, CAFÉ select and live dot.
- [ ] Full-bleed map; cream sheets with blur, hairline borders and the soft shadow; paper grain on top.
- [ ] Red only for our café and its price changes, teal only for competitors, green only for good verdicts.
- [ ] All numbers in IBM Plex Mono; headings and quotes in Fraunces.
- [ ] Cards rise in with a 60 ms stagger; the customer card slides in from the right.
- [ ] Verdict, futures squares, profit, stat grid, gainers, band chart, honesty line.
- [ ] Deck with option tabs, round play button, DAY n / N, red scrubber, speed segments, tally, rotate.
- [ ] Works at 1400 px and at 780 px.
