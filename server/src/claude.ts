// One place that talks to the Claude Messages API from inside a procedure.
import type { InferSchema, ProcedureCtx } from 'spacetimedb/server';
import { TimeDuration } from 'spacetimedb';
import type spacetimedb from './schema';

export type ProcCtx = ProcedureCtx<InferSchema<typeof spacetimedb>>;

export const MODEL = 'claude-haiku-5-5';
export const EFFORT = 'low';

export interface ClaudeResult {
  ok: boolean;
  data: any; // parsed JSON matching the schema, when ok
  inputTokens: number;
  outputTokens: number;
  error: string;
}

/**
 * Ask Claude for JSON matching `schema`. `prompt` is text, or content blocks (text plus
 * images/PDFs by URL). Never throws.
 */
export function callClaude(ctx: ProcCtx, prompt: string | object[], schema: object, maxTokens: number): ClaudeResult {
  const result: ClaudeResult = { ok: false, data: null, inputTokens: 0, outputTokens: 0, error: '' };
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
        max_tokens: maxTokens,
        output_config: { effort: EFFORT, format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content: prompt }],
      }),
      timeout: TimeDuration.fromMillis(180_000),
    });
    const body = res.json();
    result.inputTokens = body?.usage?.input_tokens ?? 0;
    result.outputTokens = body?.usage?.output_tokens ?? 0;
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body?.error ?? body)}`);
    if (body.stop_reason === 'refusal') throw new Error(`refused: ${JSON.stringify(body.stop_details)}`);
    if (body.stop_reason === 'max_tokens') throw new Error('response hit max_tokens');
    const text = body.content.find((b: any) => b.type === 'text')?.text;
    if (typeof text !== 'string') throw new Error('no text block in response');
    result.data = JSON.parse(text);
    result.ok = true;
  } catch (e) {
    result.error = String(e).slice(0, 500);
  }
  return result;
}
