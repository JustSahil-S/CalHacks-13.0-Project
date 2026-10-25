import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DbConnection } from "../src/module_bindings/index.ts";
import type {
  AgentJob,
  Business,
  CustomerAgent,
  PriceEvent,
  SimVisit,
} from "../src/module_bindings/types.ts";
import {
  agentWantsTrend,
  itemTrend,
  trendLines,
  type ItemTrend,
  type Profile,
} from "../src/itemTrends.ts";
import { ENSEMBLE_RUNS } from "../src/ensemble.ts";

const HOST = process.env.SPACETIMEDB_HOST ?? "wss://maincloud.spacetimedb.com";
const DB_NAME = process.env.SPACETIMEDB_DB_NAME ?? "simulation-038f5";
const MODEL = "claude-haiku-5-5";
const AGENTS_PER_CALL = 10;
const CONCURRENCY = 8;
// Ensemble jobs share this cap so five parallel runs do not stampede the API.
const CLAUDE_SLOTS = 16;
const MAX_VISITS = 2;
const MAX_ITEMS = 4;
const MAX_TOKENS = 4096;

const PLAN_TOOL = {
  name: "submit_plans",
  description: "Submit where each customer goes today.",
  input_schema: {
    type: "object",
    properties: {
      plans: {
        type: "array",
        items: {
          type: "object",
          properties: {
            agent_id: { type: "integer" },
            visits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  place_id: { type: "string" },
                  chance: { type: "number" },
                  items: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                },
                required: ["place_id", "chance", "items", "reason"],
              },
            },
          },
          required: ["agent_id", "visits"],
        },
      },
    },
    required: ["plans"],
  },
};

function loadEnv() {
  const path = resolve(fileURLToPath(new URL("../../.env", import.meta.url)));
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // The key can also come from the environment
  }
}

loadEnv();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
if (!ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is missing. Put it in the repo .env or the environment.",
  );
  process.exit(1);
}

type QueryLog = { sql: string; rows?: number; error?: string };
type Visit = {
  place_id: string;
  chance: number;
  items: string[];
  reason: string;
};
type MenuRow = {
  placeId: string;
  storeName: string;
  name: string;
  section: string;
  priceCents: number;
  previousPriceCents: number;
  change: string;
};

let claudeInflight = 0;
const claudeWait: (() => void)[] = [];

async function withClaudeSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (claudeInflight >= CLAUDE_SLOTS) {
    await new Promise<void>((resolve) => claudeWait.push(resolve));
  }
  claudeInflight++;
  try {
    return await fn();
  } finally {
    claudeInflight--;
    claudeWait.shift()?.();
  }
}

async function callClaude(
  system: { type: "text"; text: string; cache_control?: { type: string } }[],
  prompt: string,
) {
  return withClaudeSlot(async () => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: prompt }],
      thinking: { type: "disabled" },
      tools: [PLAN_TOOL],
      tool_choice: { type: "tool", name: "submit_plans" },
    }),
  });
  if (!response.ok)
    throw new Error(`Claude ${response.status}: ${await response.text()}`);
  return response.json() as Promise<{
    content?: {
      type: string;
      text?: string;
      name?: string;
      input?: unknown;
    }[];
    stop_reason?: string;
  }>;
  });
}

function asVisits(visits: unknown): Visit[] {
  if (!Array.isArray(visits)) return [];
  return visits.slice(0, MAX_VISITS).map((visit: any) => ({
    place_id: String(visit.place_id ?? visit.placeId ?? ""),
    chance: Number(visit.chance) || 0,
    items: (Array.isArray(visit.items) ? visit.items : [])
      .map((item: unknown) => String(item))
      .slice(0, MAX_ITEMS),
    reason: String(visit.reason ?? ""),
  }));
}

function tryJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function repairJson(text: string) {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([\]}])/g, "$1");
}

function extractObjects(text: string) {
  const objects: string[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let j = i; j < text.length; j++) {
      const char = text[j];
      if (inString) {
        if (escape) escape = false;
        else if (char === "\\") escape = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === "{") depth++;
      else if (char === "}") {
        depth--;
        if (depth === 0) {
          objects.push(text.slice(i, j + 1));
          i = j;
          break;
        }
      }
    }
  }
  return objects;
}

function addParsed(plans: Map<number, Visit[]>, parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return;
  const value = parsed as {
    plans?: unknown;
    visits?: unknown;
    agent_id?: unknown;
    agentId?: unknown;
  };
  const rows = Array.isArray(value.plans)
    ? value.plans
    : Array.isArray(parsed)
      ? parsed
      : Array.isArray(value.visits)
        ? [{ agent_id: value.agent_id ?? value.agentId, visits: value.visits }]
        : value.agent_id != null || value.agentId != null
          ? [value]
          : [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const entry = row as { agent_id?: unknown; agentId?: unknown; visits?: unknown };
    const id = Number(entry.agent_id ?? entry.agentId);
    if (!Number.isFinite(id)) continue;
    plans.set(id, asVisits(entry.visits));
  }
}

function parsePlans(text: string): Map<number, Visit[]> {
  const plans = new Map<number, Visit[]>();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const slice = text.slice(start, end + 1);
    addParsed(plans, tryJson(slice) ?? tryJson(repairJson(slice)));
  }
  if (plans.size) return plans;
  for (const object of extractObjects(text)) {
    addParsed(plans, tryJson(object) ?? tryJson(repairJson(object)));
  }
  return plans;
}

const BASE_SYSTEM = `You decide where each customer below goes today. The live menus were read from the SpacetimeDB universe_menu table for this universe.
These people live in the same neighborhood. Each one is a regular at one cafe. That is usually where they go.
Each persona stands for a group of similar people (see "Stands for N"). chance is the share of that group who visit, not a yes/no for the whole group. 0.6 with 21 people means about 13 visits and 8 stay home. We count N × chance; never treat the group as all-or-nothing.
Rules:
- Default to their regular cafe. A typical regular has about 0.5-0.8 chance of going there today, and 0-0.15 chance of some other cafe, unless their story says they hop around.
- Do not send people to a cafe just because it is listed first, has a famous name, or is the shop we are studying. Most customers stay with their own regular.
- Other shops only if this person would actually go: they are trying something new, it is closer, cheaper for what they order, or their story says they shop around.
- Price-sensitive people compare similar items across stores. Loyal regulars mostly ignore other menus.
- Call submit_plans with every agent_id you were given.
- At most ${MAX_VISITS} stores per person, usually 1 to ${MAX_ITEMS} items. Chances are 0 to 1 and add up to at most 1. The rest is stay-home.
- Use real place_id and item names from the menus.
- Keep each reason under 12 words with no quotation marks.`;

const SCENARIO_SYSTEM = `${BASE_SYSTEM}
This is a what-if universe. Changed items show the last price these customers saw (was $X), or (new), or (removed).
You also get your baseline plan from the real-price universe, yesterday's visit, and the price path at the edited shop this week.
Customers remember earlier prices, not only today's price vs the original menu. If a price fell and then rose again, that rise is a hike even when it lands back on the original. A sale that disappears feels like a takeaway to people who noticed it. Price-sensitive people react more to increases they have lived through.
Only change your plan if these edits, that history, or yesterday's stuck experience would change what this person does: add an item, switch stores, visit more or less, or order something else.
When a change makes this group less likely, lower chance a bit (for example 0.70 → 0.45). That is fewer of the N people, not the whole group staying home. Do not drop a regular to 0 unless almost nobody of this kind would still come. When a change makes them more likely, raise chance a bit; do not jump the whole group to 1.
If yesterday's plan was different from the real-price universe, that visit is a new experience and it sticks. Default to going back to that same shop today with a similar chance. Do not snap back to the baseline just because it is a new day. Only drop the habit if the menu got worse for them or their story says this weekday is different.
Do not move extra people to the edited shop just because it changed. Regulars of other cafes stay put unless they order that item, a close substitute, they already shop around, or they came here yesterday.
A new item that fills a gap can be added to an existing order, and can draw people who usually get it elsewhere.
When NEW ITEM TRENDS list rival prices, price-sensitive people compare them. If yours is cheaper, rival regulars who already order that thing may switch or add a stop. If yours is pricier, bargain hunters stay put.
People whose usual order, archetype, or story matches the new item should actually order it — add it to a visit they already make, or come in for it. Do not invent demand for people who would not want it.
If you would keep yesterday's stuck experience, return {"visits":[]}. If they never changed, {"visits":[]} keeps the real-price baseline.`;

function menuSnapshot(stores: Business[], rows: MenuRow[]) {
  return [...stores]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((store) => {
      const items = rows.filter((row) => row.placeId === store.placeId);
      const sections = new Map<string, string[]>();
      for (const item of items) {
        const tag =
          item.change === "price" && item.previousPriceCents
            ? ` (was $${(item.previousPriceCents / 100).toFixed(2)})`
            : item.change === "price"
              ? " (was changed)"
              : item.change === "new"
                ? " (new)"
                : item.change === "removed"
                  ? " (removed)"
                  : "";
        const line = `${item.name} $${(item.priceCents / 100).toFixed(2)}${tag}`;
        const section = item.section || "Menu";
        sections.set(section, [...(sections.get(section) ?? []), line]);
      }
      const header = `${store.name} (${store.placeId}, ${store.category}, ${store.rating} stars, ${store.reviewsCount} reviews${store.price ? `, ${store.price}` : ""})`;
      return [
        header,
        ...[...sections].map(
          ([section, list]) => `  ${section}: ${list.join("; ")}`,
        ),
      ].join("\n");
    })
    .join("\n");
}

function tokens(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !["the", "and", "with", "for", "from"].includes(word),
      ),
  );
}

function agentCares(
  agent: CustomerAgent,
  homeId: string,
  changes: string,
  baseline: string,
  trends: ItemTrend[],
  hasHabit: boolean,
  seesEdits: boolean,
) {
  // No edits → keep the control plan. Re-asking Claude would resample noise, not a treatment effect.
  if (!changes && trends.length === 0) return false;
  if (hasHabit) return true;
  // Anyone who walks into the edited shop sees its new menu, whatever they usually order
  if (seesEdits) return true;
  if (
    agentWantsTrend(
      agent.agentId,
      agent.placeId,
      agent.priceSensitivity,
      homeId,
      trends,
    )
  )
    return true;
  const editTokens = tokens(changes);
  const person = tokens(
    `${agent.typicalOrder} ${agent.backstory} ${agent.archetype} ${baseline}`,
  );
  for (const word of editTokens) if (person.has(word)) return true;
  return false;
}

function storeNameOf(stores: Business[], placeId: string) {
  return (
    stores.find((store) => store.placeId === placeId)?.name ?? "your usual cafe"
  );
}

function groupSize(agent: CustomerAgent) {
  return Math.max(1, Math.round(agent.representsCustomers));
}

function customerBlock(
  agent: CustomerAgent,
  stores: Business[],
  yesterday: string,
  baseline: string,
  hasHabit: boolean,
) {
  const group = groupSize(agent);
  return [
    `agent_id=${agent.agentId}`,
    `${agent.name}, a ${agent.archetype}, regular at ${storeNameOf(stores, agent.placeId)}. ${agent.backstory}`,
    `Stands for ${group} similar people. chance is the share who visit today (0.60 means about ${Math.round(group * 0.6)} visits, not all ${group} or none).`,
    `Usually orders: ${agent.typicalOrder}. Price sensitivity ${agent.priceSensitivity.toFixed(1)} of 1; food ${agent.foodWeight.toFixed(1)}, service ${agent.serviceWeight.toFixed(1)}, atmosphere ${agent.atmosphereWeight.toFixed(1)}.`,
    yesterday ? `Yesterday: ${yesterday}.` : "",
    hasHabit
      ? "That plan was different from the real-price universe. This experience sticks: default to the same cafe today with a similar chance, unless this weekday or a worse menu would change their mind."
      : "",
    baseline ? `Baseline plan: ${baseline}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function batchPrompt(args: {
  job: AgentJob;
  home: Business;
  stores: Business[];
  changes: string;
  group: PromptRow[];
}) {
  const { job, home, stores, changes, group } = args;
  return [
    `Today is ${job.weekday}, ${job.date}. Treat every cafe as equal; each customer already has a regular.`,
    changes
      ? `Menu changes and price history at ${home.name} only (other shops are unchanged). Customers remember earlier prices this week, not only vs the original menu. Do not send extra people there unless this person would actually switch:\n${changes}`
      : "",
    "CUSTOMERS",
    group
      .map((row) =>
        customerBlock(
          row.agent,
          stores,
          row.yesterday,
          row.baseline,
          row.habitVisits.length > 0,
        ),
      )
      .join("\n\n"),
    "Decide for every customer, starting from their regular cafe unless yesterday's experience stuck.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

async function runBatch(
  system: { type: "text"; text: string; cache_control?: { type: string } }[],
  prompt: string,
) {
  const result = await callClaude(system, prompt);
  if (result.stop_reason === "max_tokens")
    throw new Error("reply truncated at max_tokens");
  const plans = new Map<number, Visit[]>();
  for (const block of result.content ?? []) {
    if (block.type === "tool_use" && block.input)
      addParsed(plans, block.input);
    if (block.type === "text" && block.text) {
      for (const [id, visits] of parsePlans(block.text)) {
        if (!plans.has(id)) plans.set(id, visits);
      }
    }
  }
  if (!plans.size) throw new Error("empty or invalid plans");
  return plans;
}

type PromptRow = {
  agent: CustomerAgent;
  yesterday: string;
  baseline: string;
  habitVisits: Visit[];
};

async function decideGroup(args: {
  system: { type: "text"; text: string; cache_control?: { type: string } }[];
  job: AgentJob;
  home: Business;
  stores: Business[];
  changes: string;
  group: PromptRow[];
}) {
  const { system, job, home, stores, changes, group } = args;
  const plans = new Map<number, Visit[]>();
  let pending = group;
  const sizes = [group.length];
  if (group.length > 1) {
    sizes.push(Math.max(1, Math.ceil(group.length / 2)), 1);
  }
  for (const size of sizes) {
    if (!pending.length) break;
    const leftover: PromptRow[] = [];
    for (const part of chunk(pending, size)) {
      try {
        const got = await runBatch(
          system,
          batchPrompt({ job, home, stores, changes, group: part }),
        );
        for (const row of part) {
          if (got.has(row.agent.agentId))
            plans.set(row.agent.agentId, got.get(row.agent.agentId) ?? []);
          else leftover.push(row);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `  batch of ${part.length} failed: ${message}; retrying`,
        );
        leftover.push(...part);
      }
    }
    pending = leftover;
  }
  return { plans, missing: pending };
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
) {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

function rows<T>(table: { iter: () => Iterable<T> } | undefined): T[] {
  return table ? [...table.iter()] : [];
}

async function callReducer(run: () => unknown) {
  try {
    await Promise.resolve(run());
    return true;
  } catch {
    return false;
  }
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function usualCents(conn: DbConnection, placeId: string, name: string) {
  const item = rows(conn.db.menuItem).find(
    (row) => row.placeId === placeId && row.name === name,
  );
  return item ? (item.overridePriceCents ?? item.predictedPriceCents) : null;
}

function priceAt(
  conn: DbConnection,
  scenarioId: number,
  placeId: string,
  name: string,
  at: bigint,
) {
  const usual = usualCents(conn, placeId, name);
  if (scenarioId === 0) return usual;
  const events = rows(conn.db.priceEvent)
    .filter(
      (event) =>
        event.scenarioId === scenarioId &&
        event.itemName === name &&
        event.createdAt.microsSinceUnixEpoch <= at,
    )
    .sort((a: PriceEvent, b: PriceEvent) => a.eventId - b.eventId);
  const last = events.at(-1);
  if (!last || last.kind === "remove") return last?.kind === "remove" ? null : usual;
  return last.priceCents;
}

function dayOf(conn: DbConnection, scenarioId: number, day: number) {
  return [...conn.db.simDay.iter()].find(
    (row) => row.scenarioId === scenarioId && row.day === day,
  );
}

function visitsOnDay(
  conn: DbConnection,
  scenarioId: number,
  day: number,
  agentId: number,
): Visit[] {
  const simDay = dayOf(conn, scenarioId, day);
  if (!simDay) return [];
  return [...conn.db.simVisit.iter()]
    .filter(
      (visit) => visit.dayId === simDay.dayId && visit.agentId === agentId,
    )
    .sort((a, b) => b.chance - a.chance)
    .map((visit) => ({
      place_id: visit.placeId,
      chance: visit.chance,
      items: JSON.parse(visit.itemsJson) as string[],
      reason: visit.reason,
    }));
}

function visitFingerprint(visits: Visit[]) {
  return visits
    .map(
      (visit) =>
        `${visit.place_id}|${visit.chance.toFixed(2)}|${[...visit.items].sort().join(",")}`,
    )
    .sort()
    .join(";");
}

/** Yesterday's scenario plan, if it differed from the real-price universe. */
function habitVisitsOf(conn: DbConnection, job: AgentJob, agentId: number) {
  if (job.scenarioId === 0 || job.day < 2) return [];
  const lived = visitsOnDay(conn, job.scenarioId, job.day - 1, agentId);
  if (lived.length === 0) return [];
  const control = visitsOnDay(conn, 0, job.day - 1, agentId);
  if (visitFingerprint(lived) === visitFingerprint(control)) return [];
  return lived;
}

function yesterdayOf(
  conn: DbConnection,
  job: AgentJob,
  agentId: number,
  homeId: string,
) {
  const previous = dayOf(conn, job.scenarioId, job.day - 1);
  if (!previous) return "";
  const visits = [...conn.db.simVisit.iter()]
    .filter(
      (visit) => visit.dayId === previous.dayId && visit.agentId === agentId,
    )
    .sort((a, b) => b.chance - a.chance);
  if (visits.length === 0) return "";
  const store = [...conn.db.business.iter()].find(
    (b) => b.placeId === visits[0].placeId,
  );
  const names = JSON.parse(visits[0].itemsJson) as string[];
  const at = previous.createdAt.microsSinceUnixEpoch;
  const items = names.map((name) => {
    const cents = priceAt(conn, job.scenarioId, visits[0].placeId, name, at);
    return cents === null ? name : `${name} ${dollars(cents)}`;
  });
  const own =
    visits[0].placeId === homeId && job.scenarioId !== 0
      ? " at the edited shop"
      : "";
  return `most likely went to ${store?.name ?? visits[0].placeId}${own} for ${items.join(", ")}`;
}

function baselineOf(conn: DbConnection, job: AgentJob, agent: CustomerAgent) {
  const day = [...conn.db.simDay.iter()].find(
    (row) => row.scenarioId === 0 && row.day === job.day,
  );
  if (!day) return "";
  const group = groupSize(agent);
  return [...conn.db.simVisit.iter()]
    .filter((visit) => visit.dayId === day.dayId && visit.agentId === agent.agentId)
    .sort((a: SimVisit, b: SimVisit) => b.chance - a.chance)
    .map((visit) => {
      const store = [...conn.db.business.iter()].find(
        (b) => b.placeId === visit.placeId,
      );
      const visits = Math.round(group * visit.chance);
      return `${Math.round(visit.chance * 100)}% of ${group} (~${visits} visits) ${store?.name ?? visit.placeId} (${(JSON.parse(visit.itemsJson) as string[]).join(", ")}): ${visit.reason}`;
    })
    .join("; ");
}

function baseVisitsHome(
  conn: DbConnection,
  job: AgentJob,
  agentId: number,
  homeId: string,
) {
  const day = [...conn.db.simDay.iter()].find(
    (row) => row.scenarioId === 0 && row.day === job.day,
  );
  if (!day) return false;
  return [...conn.db.simVisit.iter()].some(
    (visit) =>
      visit.dayId === day.dayId &&
      visit.agentId === agentId &&
      visit.placeId === homeId &&
      visit.chance > 0,
  );
}

function historyLines(conn: DbConnection, scenarioId: number, homeId: string) {
  const events = rows(conn.db.priceEvent)
    .filter((event) => event.scenarioId === scenarioId)
    .sort((a: PriceEvent, b: PriceEvent) => a.eventId - b.eventId);
  const byItem = new Map<string, PriceEvent[]>();
  for (const event of events) {
    byItem.set(event.itemName, [...(byItem.get(event.itemName) ?? []), event]);
  }
  const usual = new Map(
    rows(conn.db.menuItem)
      .filter((item) => item.placeId === homeId)
      .map((item) => [
        item.name,
        item.overridePriceCents ?? item.predictedPriceCents,
      ]),
  );
  const lines: string[] = [];
  for (const [name, path] of byItem) {
    const steps: string[] = [];
    const push = (step: string) => {
      if (steps.at(-1) !== step) steps.push(step);
    };
    if (path[0]?.kind !== "add" && usual.has(name))
      push(`${dollars(usual.get(name)!)} usual`);
    for (const event of path) {
      if (event.kind === "remove") push("taken off the menu");
      else if (event.kind === "add") push(`${dollars(event.priceCents)} added`);
      else if (event.kind === "restore")
        push(`${dollars(event.priceCents)} back to usual`);
      else push(dollars(event.priceCents));
    }
    if (steps.length < 2) continue;
    const shown = steps.length > 8 ? [steps[0], ...steps.slice(-7)] : steps;
    lines.push(`${name}: ${shown.join(" → ")}`);
  }
  return lines;
}

function changesOf(conn: DbConnection, job: AgentJob, homeId: string) {
  const history = historyLines(conn, job.scenarioId, homeId);
  const covered = new Set(history.map((line) => line.split(":")[0]));
  const current = [...conn.db.universeMenu.iter()]
    .filter(
      (row) =>
        row.scenarioId === job.scenarioId &&
        row.placeId === homeId &&
        row.change &&
        !covered.has(row.name),
    )
    .map((row) => {
      if (row.change === "price")
        return `${row.name} now ${dollars(row.priceCents)} (was ${dollars(row.previousPriceCents)})`;
      if (row.change === "new")
        return `${row.name}: new item, ${dollars(row.priceCents)} in ${row.section}`;
      return `${row.name}: removed`;
    });
  return [...history, ...current].join("\n");
}

function profilesOf(agents: CustomerAgent[]): Profile[] {
  return agents.map((agent) => ({
    agentId: agent.agentId,
    placeId: agent.placeId,
    name: agent.name,
    archetype: agent.archetype,
    backstory: agent.backstory,
    typicalOrder: agent.typicalOrder,
    priceSensitivity: agent.priceSensitivity,
    foodWeight: agent.foodWeight,
    representsCustomers: agent.representsCustomers,
  }));
}

function trendsForNewItems(
  menuRows: MenuRow[],
  homeId: string,
  agents: CustomerAgent[],
) {
  const catalog = menuRows
    .filter((row) => row.change !== "removed")
    .map((row) => ({
      placeId: row.placeId,
      storeName: row.storeName,
      name: row.name,
      section: row.section,
      priceCents: row.priceCents,
    }));
  const profiles = profilesOf(agents);
  const trends: ItemTrend[] = [];
  for (const row of menuRows) {
    if (row.placeId !== homeId || row.change !== "new") continue;
    const trend = itemTrend(row.name, row.priceCents, homeId, catalog, profiles);
    if (trend) trends.push(trend);
  }
  return trends;
}

function waitFor(predicate: () => boolean, label: string, ms = 20_000) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - start > ms)
        return reject(new Error(`Timed out waiting for ${label}`));
      setTimeout(tick, 50);
    };
    tick();
  });
}

async function processJob(conn: DbConnection, job: AgentJob) {
  const latest = rows(conn.db.agentJob).find((row) => row.jobId === job.jobId);
  if (!latest || latest.status === "done" || latest.status === "error") return;
  console.log(
    `${latest.status === "running" ? "Resuming" : "Claiming"} job ${job.jobId}: day ${job.day} of universe ${job.scenarioId}`,
  );
  if (latest.status === "queued") {
    const claimed = await callReducer(() =>
      conn.reducers.claimAgentJob({ jobId: job.jobId }),
    );
    if (!claimed) return;
    await waitFor(
      () =>
        rows(conn.db.agentJob).find((row) => row.jobId === job.jobId)
          ?.status === "running",
      `job ${job.jobId} to start`,
    );
  }
  const homeId = [...conn.db.populateJob.iter()][0]?.placeId ?? "";
  const home = [...conn.db.business.iter()].find((b) => b.placeId === homeId);
  if (!home) throw new Error("Populate a store first");
  const competitorIds = [...conn.db.competitor.iter()]
    .filter((link) => link.placeId === homeId)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .map((link) => link.competitorPlaceId);
  const stores = [
    home,
    ...competitorIds
      .map((id) => [...conn.db.business.iter()].find((b) => b.placeId === id))
      .filter((b): b is Business => !!b),
  ];
  const byStore = stores.map((store) =>
    [...conn.db.customerAgent.iter()].filter(
      (agent) => agent.placeId === store.placeId,
    ),
  );
  const agents: CustomerAgent[] = [];
  const maxInStore = Math.max(0, ...byStore.map((group) => group.length));
  for (let i = 0; i < maxInStore; i++) {
    for (const group of byStore) {
      if (i < group.length) agents.push(group[i]);
    }
  }
  const menuRows: MenuRow[] = [...conn.db.universeMenu.iter()].filter(
    (row) => row.scenarioId === job.scenarioId,
  );
  const menus = menuSnapshot(stores, menuRows);
  const computed =
    job.scenarioId === 0 ? [] : trendsForNewItems(menuRows, homeId, agents);
  const trends = Array.isArray(computed) ? computed : [];
  const edits = job.scenarioId === 0 ? "" : changesOf(conn, job, homeId);
  const trendBlock = trendLines(trends);
  const changes = [edits, trendBlock && `NEW ITEM TRENDS\n${trendBlock}`]
    .filter(Boolean)
    .join("\n\n");
  const system = [
    {
      type: "text" as const,
      text: job.scenarioId === 0 ? BASE_SYSTEM : SCENARIO_SYSTEM,
    },
    {
      type: "text" as const,
      text: `MENUS\n${menus}`,
      cache_control: { type: "ephemeral" },
    },
  ];
  if (trends.length) {
    console.log(`  new item trends\n${trendLines(trends)}`);
  }
  const lookedUp: QueryLog[] = [
    {
      sql: `universe_menu snapshot for scenario ${job.scenarioId}`,
      rows: menuRows.length,
    },
    ...trends.map((trend) => ({
      sql: `trend ${trend.name}: ${trend.summary}`,
      rows: trend.demand.length,
    })),
  ];

  const submit = (agent: CustomerAgent, visits: Visit[], note: QueryLog[]) => {
    void callReducer(() =>
      conn.reducers.submitAgentPlan({
        jobId: job.jobId,
        agentId: agent.agentId,
        visitsJson: JSON.stringify(visits),
        queriesJson: JSON.stringify(note),
      }),
    );
    console.log(
      `  ${agent.name} ${
        visits.length
          ? visits
              .map((v) => `${Math.round(v.chance * 100)}% ${v.place_id}`)
              .join(", ")
          : "kept baseline"
      }`,
    );
  };

  const already = new Set(
    rows(conn.db.agentPlan)
      .filter((plan) => plan.jobId === job.jobId)
      .map((plan) => plan.agentId),
  );
  const toCall: PromptRow[] = [];
  for (const agent of agents) {
    if (already.has(agent.agentId)) continue;
    const baseline =
      job.scenarioId === 0 ? "" : baselineOf(conn, job, agent);
    const habitVisits = habitVisitsOf(conn, job, agent.agentId);
    const seesEdits =
      agent.placeId === homeId || baseVisitsHome(conn, job, agent.agentId, homeId);
    if (
      job.scenarioId !== 0 &&
      !agentCares(
        agent,
        homeId,
        edits,
        baseline,
        trends,
        habitVisits.length > 0,
        seesEdits,
      )
    ) {
      submit(
        agent,
        [],
        [
          {
            sql: "kept baseline (edit does not affect this customer)",
            rows: 0,
          },
        ],
      );
      continue;
    }
    toCall.push({
      agent,
      yesterday: yesterdayOf(conn, job, agent.agentId, homeId),
      baseline,
      habitVisits,
    });
  }

  await mapPool(chunk(toCall, AGENTS_PER_CALL), CONCURRENCY, async (group) => {
    const { plans, missing } = await decideGroup({
      system,
      job,
      home,
      stores,
      changes,
      group,
    });
    for (const row of group) {
      if (plans.has(row.agent.agentId)) {
        const decided = plans.get(row.agent.agentId) ?? [];
        submit(
          row.agent,
          decided.length > 0 ? decided : row.habitVisits,
          decided.length > 0
            ? lookedUp
            : row.habitVisits.length > 0
              ? [{ sql: "kept yesterday (new experience sticks)", rows: 0 }]
              : lookedUp,
        );
        continue;
      }
      console.warn(`  ${row.agent.name} had no plan after retries`);
      submit(
        row.agent,
        row.habitVisits,
        [
          {
            sql: row.habitVisits.length
              ? "no plan after retries; kept yesterday"
              : "no plan after retries",
            rows: 0,
          },
        ],
      );
    }
    if (missing.length) {
      console.warn(
        `  missing after retries: ${missing.map((row) => row.agent.name).join(", ")}`,
      );
    }
  });

  await waitFor(
    () =>
      ([...conn.db.agentJob.iter()].find((row) => row.jobId === job.jobId)
        ?.agentsDone ?? 0) >= agents.length,
    `all ${agents.length} plans`,
    300_000,
  );
  await callReducer(() =>
    conn.reducers.finishAgentJob({ jobId: job.jobId, error: "" }),
  );
  await waitFor(
    () => {
      const status = rows(conn.db.agentJob).find(
        (row) => row.jobId === job.jobId,
      )?.status;
      return status === "done" || status === "error";
    },
    `job ${job.jobId} to finish`,
  );
  console.log(`Finished job ${job.jobId}`);
}

const LOCK = resolve(tmpdir(), `cafe-sim-worker-${DB_NAME}.pid`);

function takeLock() {
  try {
    const prev = Number(readFileSync(LOCK, "utf8"));
    if (prev && prev !== process.pid) {
      try {
        process.kill(prev, "SIGTERM");
      } catch {
        // already gone
      }
    }
  } catch {
    // no previous worker
  }
  writeFileSync(LOCK, String(process.pid));
}

function dropLock() {
  try {
    if (Number(readFileSync(LOCK, "utf8")) === process.pid) unlinkSync(LOCK);
  } catch {
    // lock already gone
  }
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    dropLock();
    process.exit(0);
  });
}

process.on("unhandledRejection", (error) => {
  console.warn(
    "Worker request failed:",
    error instanceof Error ? error.message : error,
  );
});

process.on("uncaughtException", (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn("Worker exception:", message);
  if (/No agent job|not running|not queued/.test(message)) return;
  dropLock();
  process.exit(1);
});

async function main() {
  takeLock();
  await new Promise((resolve) => setTimeout(resolve, 250));
  try {
    if (Number(readFileSync(LOCK, "utf8")) !== process.pid) {
      console.log("Another agent worker took over; exiting");
      process.exit(0);
    }
  } catch {
    writeFileSync(LOCK, String(process.pid));
  }
  const conn = await new Promise<DbConnection>((resolve, reject) => {
    const connection = DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB_NAME)
      .onConnect((connected) => resolve(connected))
      .onConnectError((_ctx, error) => reject(error))
      .onDisconnect(() => {
        console.warn("Lost SpacetimeDB connection; restarting worker");
        dropLock();
        process.exit(1);
      })
      .build();
    void connection;
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Subscription timed out")),
      60_000,
    );
    conn
      .subscriptionBuilder()
      .onApplied(() => {
        clearTimeout(timeout);
        resolve();
      })
      .subscribe([
        "SELECT * FROM agent_job",
        "SELECT * FROM customer_agent",
        "SELECT * FROM business",
        "SELECT * FROM competitor",
        "SELECT * FROM populate_job",
        "SELECT * FROM sim_day",
        "SELECT * FROM sim_visit",
        "SELECT * FROM universe_menu",
        "SELECT * FROM menu_item",
        "SELECT * FROM price_event",
        "SELECT * FROM agent_plan",
      ]);
  });

  console.log(
    `Agent worker connected to ${DB_NAME}. Waiting for queued days...`,
  );
  const inflight = new Set<number>();

  const readyJobs = () => {
    const pending = rows(conn.db.agentJob)
      .filter((job) => job.status === "queued" || job.status === "running")
      .sort(
        (a, b) => a.day - b.day || a.scenarioId - b.scenarioId || a.jobId - b.jobId,
      );
    if (pending.length === 0) return [];
    const day = pending[0].day;
    const ofDay = pending.filter((job) => job.day === day);
    const base = ofDay.filter((job) => job.scenarioId === 0);
    if (base.length) return base.slice(0, 1);
    return ofDay.slice(0, ENSEMBLE_RUNS);
  };

  const pump = async () => {
    for (const next of readyJobs()) {
      if (inflight.has(next.jobId) || inflight.size >= ENSEMBLE_RUNS) continue;
      inflight.add(next.jobId);
      void (async () => {
        try {
          await processJob(conn, next);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`Job ${next.jobId} failed: ${message}`);
          if (error instanceof Error && error.stack) console.error(error.stack);
          const still = rows(conn.db.agentJob).find(
            (row) => row.jobId === next.jobId,
          );
          if (still?.status === "running") {
            await callReducer(() =>
              conn.reducers.finishAgentJob({ jobId: next.jobId, error: message }),
            );
          }
        } finally {
          inflight.delete(next.jobId);
          setTimeout(pump, 250);
        }
      })();
    }
  };

  conn.db.agentJob.onInsert((_ctx, _job) => {
    void pump();
  });
  conn.db.agentJob.onUpdate((_ctx, _old, _job) => {
    void pump();
  });
  await pump();
}

main().catch((error) => {
  console.error(error);
  dropLock();
  process.exit(1);
});
