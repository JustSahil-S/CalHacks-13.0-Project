// Fork — SpacetimeDB module entry. Tables live in schema.ts, simulation logic in sim.ts.
import { t, SenderError } from 'spacetimedb/server';
import { ScheduleAt, TimeDuration } from 'spacetimedb';
import spacetimedb, { clockJob, llmJob } from './schema';
import {
  applyPrices,
  loadTwin,
  maybeFinishExperiment,
  startExperiment,
  stepUniverse,
  type ExperimentOption,
  type PriceChanges,
  type TwinInput,
} from './sim';

export default spacetimedb;

function parseJson<T>(raw: string, what: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new SenderError(`${what} is not valid JSON`);
  }
}

// ---- Twins and universes ---------------------------------------------------

export const load_twin = spacetimedb.reducer({ twinJson: t.string() }, (ctx, { twinJson }) => {
  const twin = parseJson<TwinInput>(twinJson, 'twinJson');
  if (!twin.cafe || !twin.menu?.length || !twin.customers?.length) {
    throw new SenderError('twin needs cafe, menu and customers');
  }
  loadTwin(ctx, twin);
});

/** Run one universe forward by `days` (e.g. a warm-up for the root twin). */
export const run_universe = spacetimedb.reducer(
  { universeId: t.u64(), days: t.u32() },
  (ctx, { universeId, days }) => {
    const u = ctx.db.universe.id.find(universeId);
    if (!u) throw new SenderError(`no universe ${universeId}`);
    ctx.db.universe.id.update({ ...u, status: 'running', maxTick: u.currentTick + days });
  }
);

export const pause_universe = spacetimedb.reducer({ universeId: t.u64() }, (ctx, { universeId }) => {
  const u = ctx.db.universe.id.find(universeId);
  if (!u) throw new SenderError(`no universe ${universeId}`);
  ctx.db.universe.id.update({ ...u, status: 'paused' });
});

/** Change prices in one universe right now, e.g. {"oat_latte": 600}. */
export const set_prices = spacetimedb.reducer(
  { universeId: t.u64(), pricesJson: t.string() },
  (ctx, { universeId, pricesJson }) => {
    const u = ctx.db.universe.id.find(universeId);
    if (!u) throw new SenderError(`no universe ${universeId}`);
    applyPrices(ctx, universeId, parseJson<PriceChanges>(pricesJson, 'pricesJson'), u.currentTick);
  }
);

/**
 * Paired comparison. optionsJson: [{"label":"control","prices":{}},
 * {"label":"latte +50c","prices":{"oat_latte":600}}]. The first option is the control.
 */
export const start_experiment = spacetimedb.reducer(
  {
    baseUniverseId: t.u64(),
    label: t.string(),
    optionsJson: t.string(),
    copies: t.u32(),
    days: t.u32(),
  },
  (ctx, { baseUniverseId, label, optionsJson, copies, days }) => {
    const options = parseJson<ExperimentOption[]>(optionsJson, 'optionsJson');
    if (options.length < 2) throw new SenderError('need a control plus at least one option');
    if (copies < 1 || copies > 50) throw new SenderError('copies must be 1..50');
    startExperiment(ctx, baseUniverseId, label, options, copies, days);
  }
);

// ---- The clock: every fire advances every running universe by one day ---------

export const start_clock = spacetimedb.reducer({ everyMs: t.u32() }, (ctx, { everyMs }) => {
  for (const job of ctx.db.clockJob.iter()) ctx.db.clockJob.scheduledId.delete(job.scheduledId);
  ctx.db.clockJob.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(BigInt(Math.max(50, everyMs)) * 1000n),
  });
});

export const stop_clock = spacetimedb.reducer(ctx => {
  for (const job of ctx.db.clockJob.iter()) ctx.db.clockJob.scheduledId.delete(job.scheduledId);
});

export const clock = spacetimedb.reducer({ onSchedule: clockJob }, { job: clockJob.rowType }, ctx => {
  const running = [...ctx.db.universe.iter()].filter(u => u.status === 'running');
  for (const u of running) stepUniverse(ctx, u.id);
  const experiments = new Set(running.map(u => u.experimentId).filter(id => id !== 0n));
  for (const id of experiments) maybeFinishExperiment(ctx, id);
});

/** Dev helper: wipe every simulation table. */
export const reset_all = spacetimedb.reducer(ctx => {
  for (const r of ctx.db.universe.iter()) ctx.db.universe.id.delete(r.id);
  for (const r of ctx.db.cafe.iter()) ctx.db.cafe.universeId.delete(r.universeId);
  for (const r of ctx.db.menuItem.iter()) ctx.db.menuItem.id.delete(r.id);
  for (const r of ctx.db.competitor.iter()) ctx.db.competitor.id.delete(r.id);
  for (const r of ctx.db.agent.iter()) ctx.db.agent.id.delete(r.id);
  for (const r of ctx.db.memory.iter()) ctx.db.memory.id.delete(r.id);
  for (const r of ctx.db.review.iter()) ctx.db.review.id.delete(r.id);
  for (const r of ctx.db.dailyMetric.iter()) ctx.db.dailyMetric.id.delete(r.id);
  for (const r of ctx.db.event.iter()) ctx.db.event.id.delete(r.id);
  for (const r of ctx.db.experiment.iter()) ctx.db.experiment.id.delete(r.id);
  for (const r of ctx.db.experimentResult.iter()) ctx.db.experimentResult.id.delete(r.id);
});

// ---- Spike: LLM call from a procedure (replaced by the AI brain next) ----------

const MODEL = 'claude-haiku-5-5';
const EFFORT = 'low';

const DECISION_SCHEMA = {
  type: 'object',
  properties: {
    p_visit_here: { type: 'number' },
    p_visit_competitor: { type: 'number' },
    p_skip: { type: 'number' },
    satisfaction_if_visit: { type: 'integer' },
    memory: { type: 'string' },
  },
  required: ['p_visit_here', 'p_visit_competitor', 'p_skip', 'satisfaction_if_visit', 'memory'],
  additionalProperties: false,
};

export const queue_llm = spacetimedb.reducer(
  { batch: t.string(), count: t.u32(), prompt: t.string() },
  (ctx, { batch, count, prompt }) => {
    for (let i = 0; i < count; i++) {
      ctx.db.llmJob.insert({
        scheduledId: 0n,
        scheduledAt: ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch),
        batch,
        prompt,
      });
    }
  }
);

export const think = spacetimedb.procedure(
  { onSchedule: llmJob },
  { job: llmJob.rowType },
  t.unit(),
  (ctx, { job }) => {
    const startedMs = ctx.timestamp.toMillis();
    let ok = false;
    let output = '';
    const apiKey = ctx.env.ANTHROPIC_API_KEY;
    try {
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set for this database');
      const res = ctx.http.fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 4000,
          output_config: { effort: EFFORT, format: { type: 'json_schema', schema: DECISION_SCHEMA } },
          messages: [{ role: 'user', content: job.prompt }],
        }),
        timeout: TimeDuration.fromMillis(90_000),
      });
      const body = res.json();
      if (!res.ok) {
        output = `HTTP ${res.status}: ${JSON.stringify(body?.error ?? body)}`;
      } else if (body.stop_reason === 'refusal') {
        output = `refused: ${JSON.stringify(body.stop_details)}`;
      } else {
        const text = body.content.find((b: any) => b.type === 'text')?.text;
        ok = typeof text === 'string';
        output = text ?? `no text block: ${JSON.stringify(body.content)}`;
      }
    } catch (e) {
      output = `fetch failed: ${String(e)}`;
    }
    ctx.withTx(tx => {
      tx.db.llmResult.insert({
        id: 0n,
        batch: job.batch,
        ok,
        startedMs,
        finishedMs: tx.timestamp.toMillis(),
        output,
      });
    });
    return {};
  }
);
