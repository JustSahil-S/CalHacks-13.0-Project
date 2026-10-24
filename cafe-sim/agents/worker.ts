import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DbConnection } from '../src/module_bindings/index.ts';
import type { AgentJob, Business, CustomerAgent, SimVisit } from '../src/module_bindings/types.ts';

const HOST = process.env.SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
const DB_NAME = process.env.SPACETIMEDB_DB_NAME ?? 'simulation-038f5';
const MCP_URL = `https://maincloud.spacetimedb.com/v1/database/${DB_NAME}/mcp`;
const MODEL = 'claude-haiku-5-5';
const CONCURRENCY = 8;
const MAX_ROUNDS = 6;
const MAX_VISITS = 2;
const MAX_ITEMS = 4;

function loadEnv() {
  const path = resolve(fileURLToPath(new URL('../../.env', import.meta.url)));
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // The key can also come from the environment
  }
}

loadEnv();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is missing. Put it in the repo .env or the environment.');
  process.exit(1);
}

type QueryLog = { sql: string; rows?: number; error?: string };
type Visit = { place_id: string; chance: number; items: string[]; reason: string };

const SQL_TOOL = {
  name: 'sql',
  description:
    'Run a read-only SELECT against the live cafe simulation. No ORDER BY, LIKE, IN (...), or LIMIT. Filter with = and AND, one place_id at a time. Useful tables: ' +
    'business(place_id, name, category, rating, reviews_count, price), ' +
    'competitor(place_id, competitor_place_id, distance_meters) where place_id is the selected store, ' +
    'universe_menu(scenario_id, place_id, store_name, name, section, price_cents, previous_price_cents, change) ' +
    "where change is '' | price | new | removed, " +
    'review(place_id, reviewer_name, stars, text).',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['sql'],
    properties: { sql: { type: 'string', description: 'A single SELECT' } },
  },
};

function allowSql(sql: string) {
  const text = sql.trim().replace(/--.*$/gm, '');
  if (!/^\s*select\b/i.test(text)) throw new Error('Only SELECT is allowed');
  if (/\b(insert|update|delete|drop|alter|call|reducer|truncate)\b/i.test(text)) {
    throw new Error('That SQL is not allowed');
  }
  return text;
}

async function mcpSql(sql: string) {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'sql', arguments: { sql: allowSql(sql) } },
    }),
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message ?? JSON.stringify(body.error));
  const text = body.result?.content?.[0]?.text ?? '';
  try {
    const parsed = JSON.parse(text);
    const table = Array.isArray(parsed) ? parsed[0] : parsed;
    const names = (table?.schema?.elements ?? []).map((el: { name?: { some?: string } }) => el.name?.some ?? '');
    const rows = (table?.rows ?? []).slice(0, 40).map((row: unknown[]) => {
      const object: Record<string, unknown> = {};
      names.forEach((name: string, i: number) => {
        object[name] = row[i];
      });
      return object;
    });
    return { text: JSON.stringify(rows), rows: rows.length };
  } catch {
    return { text: String(text).slice(0, 4000), rows: 0 };
  }
}

async function callClaude(messages: object[], system: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system,
      messages,
      tools: [SQL_TOOL],
      thinking: { type: 'disabled' },
    }),
  });
  if (!response.ok) throw new Error(`Claude ${response.status}: ${await response.text()}`);
  return response.json();
}

function parseVisits(text: string): Visit[] {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return [];
  const visits = JSON.parse(text.slice(start, end + 1)).visits;
  if (!Array.isArray(visits)) return [];
  return visits.slice(0, MAX_VISITS).map((visit: any) => ({
    place_id: String(visit.place_id ?? visit.placeId ?? ''),
    chance: Number(visit.chance) || 0,
    items: (Array.isArray(visit.items) ? visit.items : []).map((item: unknown) => String(item)).slice(0, MAX_ITEMS),
    reason: String(visit.reason ?? ''),
  }));
}

const BASE_SYSTEM = `You are one customer deciding where to go today. Look things up with the sql tool, then decide.
Rules:
- Query universe_menu with the scenario_id you were given. That table is this universe's menu, including price changes and new or removed items.
- Start with nearby stores, then open only the menus you would actually consider.
- Price-sensitive people compare similar items across stores.
- Reply with only JSON of this shape: {"visits":[{"place_id":"...","chance":0.6,"items":["Latte"],"reason":"under 15 words"}]}
- At most ${MAX_VISITS} stores, usually 1 to ${MAX_ITEMS} items each. Chances are 0 to 1 and add up to at most 1. The rest is the chance you stay home.
- Use real place_id and item names from the tables.`;

const SCENARIO_SYSTEM = `${BASE_SYSTEM}
This is a what-if universe. The selected store changed its menu. Rows in universe_menu with change != '' are those edits.
You also get your baseline plan from the real-price universe. Only change your plan if these edits would change what you do: add an item, switch stores, visit more or less, or order something else.
A new item that fills a gap (a drink at a place whose regulars want one with their meal) is often added to an existing order, and can draw people who usually get it elsewhere.
If you would do the same thing, return {"visits":[]} and your baseline plan is kept.`;

function agentPrompt(args: {
  job: AgentJob;
  agent: CustomerAgent;
  home: Business;
  stores: Business[];
  yesterday: string;
  baseline: string;
  changes: string;
}) {
  const { job, agent, home, stores, yesterday, baseline, changes } = args;
  const nearby = stores
    .map(
      store =>
        `${store.name} (${store.placeId}, ${store.category}, ${store.rating} stars, ${store.reviewsCount} reviews${store.price ? `, ${store.price}` : ''})`,
    )
    .join('\n');
  return [
    `Today is ${job.weekday}, ${job.date}. scenario_id=${job.scenarioId}. The selected store is ${home.name} (${home.placeId}).`,
    `You are ${agent.name}, a ${agent.archetype}, regular at ${stores.find(s => s.placeId === agent.placeId)?.name ?? 'your usual cafe'}. ${agent.backstory}`,
    `Usually orders: ${agent.typicalOrder}. Price sensitivity ${agent.priceSensitivity.toFixed(1)} of 1; food ${agent.foodWeight.toFixed(1)}, service ${agent.serviceWeight.toFixed(1)}, atmosphere ${agent.atmosphereWeight.toFixed(1)}.`,
    yesterday ? `Yesterday you ${yesterday}.` : '',
    `Nearby stores:\n${nearby}`,
    baseline ? `Baseline plan for today:\n${baseline}` : '',
    changes ? `Menu changes at ${home.name}:\n${changes}` : '',
    'Look up what you need, then decide.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function runAgent(system: string, prompt: string) {
  const queries: QueryLog[] = [];
  const messages: object[] = [{ role: 'user', content: prompt }];
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const result = await callClaude(messages, system);
    const blocks = Array.isArray(result.content) ? result.content : [];
    const tools = blocks.filter((block: { type: string }) => block.type === 'tool_use');
    if (tools.length === 0) {
      const text = blocks
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('');
      return { visits: parseVisits(text), queries };
    }
    const results = [];
    for (const tool of tools) {
      try {
        const { text, rows } = await mcpSql(String(tool.input?.sql ?? ''));
        queries.push({ sql: String(tool.input?.sql ?? ''), rows });
        results.push({ type: 'tool_result', tool_use_id: tool.id, content: text });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        queries.push({ sql: String(tool.input?.sql ?? ''), error: message });
        results.push({ type: 'tool_result', tool_use_id: tool.id, content: message, is_error: true });
      }
    }
    messages.push({ role: 'assistant', content: blocks });
    messages.push({ role: 'user', content: results });
  }
  return { visits: [] as Visit[], queries };
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
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
  const previous = [...conn.db.simDay.iter()].find(day => day.scenarioId === job.scenarioId && day.day === job.day - 1);
  if (!previous) return '';
  const visits = [...conn.db.simVisit.iter()]
    .filter(visit => visit.dayId === previous.dayId && visit.agentId === agentId)
    .sort((a, b) => b.chance - a.chance);
  if (visits.length === 0) return '';
  const store = [...conn.db.business.iter()].find(b => b.placeId === visits[0].placeId);
  return `most likely went to ${store?.name ?? visits[0].placeId} for ${(JSON.parse(visits[0].itemsJson) as string[]).join(', ')}`;
}

function baselineOf(conn: DbConnection, job: AgentJob, agentId: number) {
  const day = [...conn.db.simDay.iter()].find(row => row.scenarioId === 0 && row.day === job.day);
  if (!day) return '';
  return [...conn.db.simVisit.iter()]
    .filter(visit => visit.dayId === day.dayId && visit.agentId === agentId)
    .sort((a: SimVisit, b: SimVisit) => b.chance - a.chance)
    .map(visit => {
      const store = [...conn.db.business.iter()].find(b => b.placeId === visit.placeId);
      return `${Math.round(visit.chance * 100)}% ${store?.name ?? visit.placeId} (${(JSON.parse(visit.itemsJson) as string[]).join(', ')}): ${visit.reason}`;
    })
    .join('; ');
}

function changesOf(conn: DbConnection, job: AgentJob, homeId: string) {
  return [...conn.db.universeMenu.iter()]
    .filter(row => row.scenarioId === job.scenarioId && row.placeId === homeId && row.change)
    .map(row => {
      if (row.change === 'price')
        return `${row.name} now $${(row.priceCents / 100).toFixed(2)} (was $${(row.previousPriceCents / 100).toFixed(2)})`;
      if (row.change === 'new') return `${row.name}: new item, $${(row.priceCents / 100).toFixed(2)} in ${row.section}`;
      return `${row.name}: removed`;
    })
    .join('\n');
}

function waitFor(predicate: () => boolean, label: string, ms = 20_000) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - start > ms) return reject(new Error(`Timed out waiting for ${label}`));
      setTimeout(tick, 50);
    };
    tick();
  });
}

async function processJob(conn: DbConnection, job: AgentJob) {
  console.log(`Claiming job ${job.jobId}: day ${job.day} of universe ${job.scenarioId}`);
  conn.reducers.claimAgentJob({ jobId: job.jobId });
  await waitFor(
    () => [...conn.db.agentJob.iter()].find(row => row.jobId === job.jobId)?.status === 'running',
    `job ${job.jobId} to start`,
  );
  const homeId = [...conn.db.populateJob.iter()][0]?.placeId ?? '';
  const home = [...conn.db.business.iter()].find(b => b.placeId === homeId);
  if (!home) throw new Error('Populate a store first');
  const competitorIds = [...conn.db.competitor.iter()]
    .filter(link => link.placeId === homeId)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .map(link => link.competitorPlaceId);
  const stores = [
    home,
    ...competitorIds
      .map(id => [...conn.db.business.iter()].find(b => b.placeId === id))
      .filter((b): b is Business => !!b),
  ];
  const agents = stores.flatMap(store =>
    [...conn.db.customerAgent.iter()].filter(agent => agent.placeId === store.placeId),
  );
  const system = job.scenarioId === 0 ? BASE_SYSTEM : SCENARIO_SYSTEM;
  const changes = job.scenarioId === 0 ? '' : changesOf(conn, job, homeId);

  await mapPool(agents, CONCURRENCY, async (agent: CustomerAgent) => {
    try {
      const { visits, queries } = await runAgent(
        system,
        agentPrompt({
          job,
          agent,
          home,
          stores,
          yesterday: job.scenarioId === 0 ? yesterdayOf(conn, job, agent.agentId) : '',
          baseline: job.scenarioId === 0 ? '' : baselineOf(conn, job, agent.agentId),
          changes,
        }),
      );
      conn.reducers.submitAgentPlan({
        jobId: job.jobId,
        agentId: agent.agentId,
        visitsJson: JSON.stringify(visits),
        queriesJson: JSON.stringify(queries).slice(0, 12_000),
      });
      console.log(
        `  ${agent.name} ${visits.length ? visits.map(v => `${Math.round(v.chance * 100)}% ${v.place_id}`).join(', ') : 'kept baseline'} (${queries.length} queries)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  ${agent.name} failed: ${message}`);
      conn.reducers.submitAgentPlan({
        jobId: job.jobId,
        agentId: agent.agentId,
        visitsJson: '[]',
        queriesJson: JSON.stringify([{ sql: '', error: message }]),
      });
    }
  });

  await waitFor(
    () => ([...conn.db.agentJob.iter()].find(row => row.jobId === job.jobId)?.agentsDone ?? 0) >= agents.length,
    `all ${agents.length} plans`,
    60_000,
  );
  conn.reducers.finishAgentJob({ jobId: job.jobId, error: '' });
  await waitFor(
    () => [...conn.db.agentJob.iter()].find(row => row.jobId === job.jobId)?.status === 'done',
    `job ${job.jobId} to finish`,
  );
  console.log(`Finished job ${job.jobId}`);
}

async function main() {
  const conn = await new Promise<DbConnection>((resolve, reject) => {
    const connection = DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB_NAME)
      .onConnect(connected => resolve(connected))
      .onConnectError((_ctx, error) => reject(error))
      .build();
    void connection;
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Subscription timed out')), 20_000);
    conn
      .subscriptionBuilder()
      .onApplied(() => {
        clearTimeout(timeout);
        resolve();
      })
      .subscribe([
        'SELECT * FROM agent_job',
        'SELECT * FROM customer_agent',
        'SELECT * FROM business',
        'SELECT * FROM competitor',
        'SELECT * FROM populate_job',
        'SELECT * FROM sim_day',
        'SELECT * FROM sim_visit',
        'SELECT * FROM universe_menu',
      ]);
  });

  console.log(`Agent worker connected to ${DB_NAME}. Waiting for queued days...`);
  let busy = false;

  const pump = async () => {
    if (busy) return;
    const next = [...conn.db.agentJob.iter()]
      .filter(job => job.status === 'queued')
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
