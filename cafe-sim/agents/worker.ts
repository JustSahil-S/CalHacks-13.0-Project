import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DbConnection } from "../src/module_bindings/index.ts";
import type {
  AgentJob,
  Business,
  CustomerAgent,
  SimVisit,
} from "../src/module_bindings/types.ts";

const HOST = process.env.SPACETIMEDB_HOST ?? "wss://maincloud.spacetimedb.com";
const DB_NAME = process.env.SPACETIMEDB_DB_NAME ?? "simulation-038f5";
const MODEL = "claude-haiku-5-5";
const AGENTS_PER_CALL = 10;
const CONCURRENCY = 8;
const MAX_VISITS = 2;
const MAX_ITEMS = 4;

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
  change: string;
};

async function callClaude(
  system: { type: "text"; text: string; cache_control?: { type: string } }[],
  prompt: string,
) {
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
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: prompt }],
      thinking: { type: "disabled" },
    }),
  });
  if (!response.ok)
    throw new Error(`Claude ${response.status}: ${await response.text()}`);
  return response.json() as Promise<{
    content?: { type: string; text?: string }[];
  }>;
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

function parsePlans(text: string): Map<number, Visit[]> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const plans = new Map<number, Visit[]>();
  if (start === -1 || end === -1) return plans;
  const parsed = JSON.parse(text.slice(start, end + 1));
  const rows = Array.isArray(parsed.plans)
    ? parsed.plans
    : Array.isArray(parsed.visits)
      ? [{ agent_id: parsed.agent_id, visits: parsed.visits }]
      : [];
  for (const row of rows) {
    const id = Number(row.agent_id ?? row.agentId);
    if (!Number.isFinite(id)) continue;
    plans.set(id, asVisits(row.visits));
  }
  return plans;
}

const BASE_SYSTEM = `You decide where each customer below goes today. The live menus were read from the SpacetimeDB universe_menu table for this universe.
Rules:
- Price-sensitive people compare similar items across stores.
- Reply with only JSON: {"plans":[{"agent_id":1,"visits":[{"place_id":"...","chance":0.6,"items":["Latte"],"reason":"under 15 words"}]}]}
- Include every agent_id you were given.
- At most ${MAX_VISITS} stores per person, usually 1 to ${MAX_ITEMS} items. Chances are 0 to 1 and add up to at most 1. The rest is stay-home.
- Use real place_id and item names from the menus.`;

const SCENARIO_SYSTEM = `${BASE_SYSTEM}
This is a what-if universe. Changed items are marked (was changed), (new), or (removed).
You also get your baseline plan from the real-price universe. Only change your plan if these edits would change what you do: add an item, switch stores, visit more or less, or order something else.
A new item that fills a gap is often added to an existing order, and can draw people who usually get it elsewhere.
If you would do the same thing, return {"visits":[]} and your baseline plan is kept.`;

function menuSnapshot(stores: Business[], rows: MenuRow[]) {
  return stores
    .map((store) => {
      const items = rows.filter((row) => row.placeId === store.placeId);
      const sections = new Map<string, string[]>();
      for (const item of items) {
        const tag =
          item.change === "price"
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
) {
  if (!changes) return true;
  if (agent.placeId === homeId) return true;
  if (baseline.toLowerCase().includes(homeId.toLowerCase())) return true;
  const editTokens = tokens(changes);
  const person = tokens(`${agent.typicalOrder} ${agent.backstory} ${baseline}`);
  for (const word of editTokens) if (person.has(word)) return true;
  return false;
}

function storeNameOf(stores: Business[], placeId: string) {
  return (
    stores.find((store) => store.placeId === placeId)?.name ?? "your usual cafe"
  );
}

function customerBlock(
  agent: CustomerAgent,
  stores: Business[],
  yesterday: string,
  baseline: string,
) {
  return [
    `agent_id=${agent.agentId}`,
    `${agent.name}, a ${agent.archetype}, regular at ${storeNameOf(stores, agent.placeId)}. ${agent.backstory}`,
    `Usually orders: ${agent.typicalOrder}. Price sensitivity ${agent.priceSensitivity.toFixed(1)} of 1; food ${agent.foodWeight.toFixed(1)}, service ${agent.serviceWeight.toFixed(1)}, atmosphere ${agent.atmosphereWeight.toFixed(1)}.`,
    yesterday ? `Yesterday: ${yesterday}.` : "",
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
  group: { agent: CustomerAgent; yesterday: string; baseline: string }[];
}) {
  const { job, home, stores, changes, group } = args;
  return [
    `Today is ${job.weekday}, ${job.date}. The selected store is ${home.name} (${home.placeId}).`,
    changes ? `Menu changes at ${home.name}:\n${changes}` : "",
    "CUSTOMERS",
    group
      .map((row) =>
        customerBlock(row.agent, stores, row.yesterday, row.baseline),
      )
      .join("\n\n"),
    "Decide for every customer.",
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
  const text = (Array.isArray(result.content) ? result.content : [])
    .filter((block: { type: string }) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("");
  return parsePlans(text);
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

function yesterdayOf(conn: DbConnection, job: AgentJob, agentId: number) {
  const previous = [...conn.db.simDay.iter()].find(
    (day) => day.scenarioId === job.scenarioId && day.day === job.day - 1,
  );
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
  return `most likely went to ${store?.name ?? visits[0].placeId} for ${(JSON.parse(visits[0].itemsJson) as string[]).join(", ")}`;
}

function baselineOf(conn: DbConnection, job: AgentJob, agentId: number) {
  const day = [...conn.db.simDay.iter()].find(
    (row) => row.scenarioId === 0 && row.day === job.day,
  );
  if (!day) return "";
  return [...conn.db.simVisit.iter()]
    .filter((visit) => visit.dayId === day.dayId && visit.agentId === agentId)
    .sort((a: SimVisit, b: SimVisit) => b.chance - a.chance)
    .map((visit) => {
      const store = [...conn.db.business.iter()].find(
        (b) => b.placeId === visit.placeId,
      );
      return `${Math.round(visit.chance * 100)}% ${store?.name ?? visit.placeId} (${(JSON.parse(visit.itemsJson) as string[]).join(", ")}): ${visit.reason}`;
    })
    .join("; ");
}

function changesOf(conn: DbConnection, job: AgentJob, homeId: string) {
  return [...conn.db.universeMenu.iter()]
    .filter(
      (row) =>
        row.scenarioId === job.scenarioId &&
        row.placeId === homeId &&
        row.change,
    )
    .map((row) => {
      if (row.change === "price")
        return `${row.name} now $${(row.priceCents / 100).toFixed(2)} (was $${(row.previousPriceCents / 100).toFixed(2)})`;
      if (row.change === "new")
        return `${row.name}: new item, $${(row.priceCents / 100).toFixed(2)} in ${row.section}`;
      return `${row.name}: removed`;
    })
    .join("\n");
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
  console.log(
    `Claiming job ${job.jobId}: day ${job.day} of universe ${job.scenarioId}`,
  );
  conn.reducers.claimAgentJob({ jobId: job.jobId });
  await waitFor(
    () =>
      [...conn.db.agentJob.iter()].find((row) => row.jobId === job.jobId)
        ?.status === "running",
    `job ${job.jobId} to start`,
  );
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
  const agents = stores.flatMap((store) =>
    [...conn.db.customerAgent.iter()].filter(
      (agent) => agent.placeId === store.placeId,
    ),
  );
  const menuRows: MenuRow[] = [...conn.db.universeMenu.iter()].filter(
    (row) => row.scenarioId === job.scenarioId,
  );
  const menus = menuSnapshot(stores, menuRows);
  const changes = job.scenarioId === 0 ? "" : changesOf(conn, job, homeId);
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
  const lookedUp: QueryLog[] = [
    {
      sql: `universe_menu snapshot for scenario ${job.scenarioId}`,
      rows: menuRows.length,
    },
  ];

  const submit = (agent: CustomerAgent, visits: Visit[], note: QueryLog[]) => {
    conn.reducers.submitAgentPlan({
      jobId: job.jobId,
      agentId: agent.agentId,
      visitsJson: JSON.stringify(visits),
      queriesJson: JSON.stringify(note),
    });
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

  const toCall: {
    agent: CustomerAgent;
    yesterday: string;
    baseline: string;
  }[] = [];
  for (const agent of agents) {
    const baseline =
      job.scenarioId === 0 ? "" : baselineOf(conn, job, agent.agentId);
    if (job.scenarioId !== 0 && !agentCares(agent, homeId, changes, baseline)) {
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
      yesterday:
        job.scenarioId === 0 ? yesterdayOf(conn, job, agent.agentId) : "",
      baseline,
    });
  }

  await mapPool(chunk(toCall, AGENTS_PER_CALL), CONCURRENCY, async (group) => {
    try {
      const plans = await runBatch(
        system,
        batchPrompt({ job, home, stores, changes, group }),
      );
      for (const row of group) {
        submit(row.agent, plans.get(row.agent.agentId) ?? [], lookedUp);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  batch of ${group.length} failed: ${message}`);
      for (const row of group) {
        submit(row.agent, [], [{ sql: "", error: message }]);
      }
    }
  });

  await waitFor(
    () =>
      ([...conn.db.agentJob.iter()].find((row) => row.jobId === job.jobId)
        ?.agentsDone ?? 0) >= agents.length,
    `all ${agents.length} plans`,
    180_000,
  );
  conn.reducers.finishAgentJob({ jobId: job.jobId, error: "" });
  await waitFor(
    () =>
      [...conn.db.agentJob.iter()].find((row) => row.jobId === job.jobId)
        ?.status === "done",
    `job ${job.jobId} to finish`,
  );
  console.log(`Finished job ${job.jobId}`);
}

async function main() {
  const conn = await new Promise<DbConnection>((resolve, reject) => {
    const connection = DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB_NAME)
      .onConnect((connected) => resolve(connected))
      .onConnectError((_ctx, error) => reject(error))
      .build();
    void connection;
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Subscription timed out")),
      20_000,
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
      ]);
  });

  console.log(
    `Agent worker connected to ${DB_NAME}. Waiting for queued days...`,
  );
  let busy = false;

  const pump = async () => {
    if (busy) return;
    const next = [...conn.db.agentJob.iter()]
      .filter((job) => job.status === "queued")
      .sort((a, b) => a.jobId - b.jobId)[0];
    if (!next) return;
    busy = true;
    try {
      await processJob(conn, next);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Job ${next.jobId} failed: ${message}`);
      try {
        conn.reducers.finishAgentJob({ jobId: next.jobId, error: message });
      } catch {
        // The job may already have finished
      }
    } finally {
      busy = false;
      setTimeout(pump, 250);
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
  process.exit(1);
});
