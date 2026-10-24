# Fork × Mana — build brief

Paste this whole file into a Mana chat and ask Mana to build the app and the agent below.

## What Fork is

Fork lets an independent café owner rehearse a menu price change before making it. For a real
café, Fork builds a simulated twin: 200 customers based on its real Google reviewers, its real
menu, its real nearest competitor and its real neighborhood. When you test a price change, Fork
runs 10 paired "futures" with and without the change (Claude decides how each customer who
notices reacts) and reports the odds, e.g. "profit higher in 9 of 10 futures, visits −2%,
price complaints up". Everything lives in a SpacetimeDB database with a public HTTP API.

**In Mana we want two things:**

1. **A "Fork" app**: the owner's café dashboard.
2. **A "Fork advisor" agent**: the owner just asks "what if I raise my cappuccino to $6?" and the
   agent runs the experiment on Fork and explains the result in plain English. It should remember
   which café is the owner's and what they tested before.

## The Fork API (SpacetimeDB HTTP, no login needed to read)

Base: `https://maincloud.spacetimedb.com/v1/database/fork-calhacks`

### Read with SQL

`POST {base}/sql` · header `Content-Type: text/plain` · body = one SQL statement (string
literals in single quotes). Response:

```json
[{"schema":{"elements":[{"name":{"some":"id"}},{"name":{"some":"label"}}]},"rows":[[8,"Cappuccino $5.50→$6.00"]]}]
```

Turn it into objects:

```js
async function sql(query) {
  const res = await fetch('https://maincloud.spacetimedb.com/v1/database/fork-calhacks/sql', {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: query,
  });
  if (!res.ok) throw new Error(await res.text());
  const [r] = await res.json();
  const cols = r.schema.elements.map(e => e.name.some);
  return r.rows.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}
```

```python
import requests
BASE = "https://maincloud.spacetimedb.com/v1/database/fork-calhacks"
def sql(query):
    r = requests.post(f"{BASE}/sql", data=query.encode(), headers={"Content-Type": "text/plain"}, timeout=30)
    r.raise_for_status()
    res = r.json()[0]
    cols = [e["name"]["some"] for e in res["schema"]["elements"]]
    return [dict(zip(cols, row)) for row in res["rows"]]
```

**Never `SELECT *` from `twin_build`**: it has very large JSON columns. Select the columns you need.

### Write: start an experiment

1. Get an identity once and keep the token: `POST https://maincloud.spacetimedb.com/v1/identity`
   → `{"identity": "...", "token": "..."}`.
2. `POST {base}/call/start_experiment` · headers `Content-Type: application/json`,
   `Authorization: Bearer <token>` · body is a JSON **array** of 6 arguments in this order:

```json
[139, "Cappuccino $5.50→$6.00",
 "[{\"label\":\"no change\",\"prices\":{}},{\"label\":\"price change\",\"prices\":{\"cappuccino\":600}}]",
 10, 60, "ai"]
```

   - `139` = the café's twin universe id (`twin_build.universe_id`)
   - the 3rd argument is a **JSON string** (the options list, stringified). The first option must be
     the control. Prices are in **cents**, keyed by `menu_item.key`.
   - copies (max 10), days (max 90), and `"ai"`.
   - A non-200 response body is a readable message, e.g. "Another simulation is running. Try
     again in a minute." Only one simulation runs at a time; show the message and retry later.
3. Find it: `SELECT id, status FROM experiment WHERE base_universe_id = 139` → highest `id`.
4. Poll every ~5 s until `status = 'done'` (usually 30–120 s).
5. Results: `SELECT option_label, copies, mean_profit_cents, mean_revenue_cents, mean_visits, mean_stars, price_mention_share, profit_wins, revenue_wins, rating_drops FROM experiment_result WHERE experiment_id = <id>`

   How to explain: compare the `price change` row with the `no change` row.
   - **Profit odds**: `profit_wins` of `copies` futures had higher profit than their paired
     no-change future (same luck, only the price differs).
   - **Visits**: `mean_visits` change in %.
   - **Rating**: `mean_stars` difference.
   - **Price complaints**: `price_mention_share` = share of simulated reviews mentioning price.

### Useful tables (SQL column names)

| Table | Columns |
| --- | --- |
| `twin_build` | `id`, `query`, `label`, `status` (`done` = ready), `cutoff_date` (`''` = current café; a date = backtest twin), `universe_id` |
| `cafe` | `universe_id`, `name`, `open_hour`, `close_hour` |
| `menu_item` | `universe_id`, `key`, `name`, `category`, `price_cents` |
| `competitor` | `universe_id`, `name`, `rating`, `price_index` |
| `menu_source` | `build_id`, `source` (`website` / `menu photo` / `estimated` / `provided`), `detail` |
| `experiment` | `id`, `base_universe_id`, `label`, `status`, `copies`, `days` |
| `experiment_result` | see above |
| `agent` | `universe_id`, `name`, `archetype`, `visits_per_week`, `price_sensitivity`, `usual_order` (JSON list of menu keys) — 200 customers per café |

Current cafés right now: **Le Marais Bakery** (build 13, universe 139), **Equator Coffees Fort
Mason** (build 11, universe 137). Backtest twins (built only from reviews before a real price
change): builds 1, 8, 9, 10.

### The live 3D viewer (embed it)

`https://justsahil-s.github.io/CalHacks-13.0-Project/?cafe=<build id>` — e.g. `?cafe=13` for Le
Marais. It's an isometric model of the real neighborhood with customers walking to the café and
its competitor; it updates live.

## App spec: "Fork"

- Café picker: `twin_build` rows with `status = 'done'` and `cutoff_date = ''` (show `label` or
  the part of `query` before the first comma).
- Café card: name, hours, competitor, and where the menu came from (`menu_source`; say
  "estimated" plainly when it is).
- Menu table with current prices; let the owner type new prices and press **Run 10 futures**
  (calls `start_experiment`, polls, shows the result).
- Results card: "Profit higher in X of 10 futures", visits %, rating change, price complaints.
- The embedded 3D viewer for the selected café (`?cafe=<build id>`).
- A "Does it work?" section with the backtests:

| Café | Real change | Rating | Price complaints | Traffic |
| --- | --- | --- | --- | --- |
| Henry's House of Coffee, SF | drip $2.75→$3.00 (2021) | ✅ | ✅ | ❌ |
| Porto Rico Importing Co., NYC | latte $4.90→$5.20 (2025) | ✅ | ❌ | ❌ |
| Ntaba Coffee Haus, Louisville | drip +25¢, latte +50¢ (2022) | ✅ | ✅ | ❌ |
| Timeless Coffee, Oakland | espresso $4.25→$4.50 (2025) | ❌ | ✅ | ✅ |

  "Direction matched 6 of 8 on ratings and price complaints; traffic is hard to measure from
  public reviews."

## Agent spec: "Fork advisor"

- First time: ask which café is theirs (match against the café list) and remember it.
- Tools it needs (Python, using the helpers above): list cafés · get menu for a café · run a
  price test (item + new price → experiment → poll → results) · get the backtests.
- When asked "what if…", confirm the item and new price, run it, then answer in 3–4 plain
  sentences: the profit odds first, then visits, rating and complaints, and one sentence of
  advice. Mention that each run is 10 simulated futures and that results are odds, not
  guarantees. If the menu is estimated, say so.
- Remember past tests so it can compare ("last time you tried $6.00 on the cappuccino: 9 of 10").
- Never invent numbers; only report what Fork returned.
