// Deterministic dice. A roll depends only on (seed, tick, agent, purpose), so copy k of
// the control and copy k of a price change see the same luck: any difference between
// them comes from the price, not from chance.

export function hash32(...parts: (string | number | bigint)[]): number {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Uniform number in [0, 1) for this exact (seed, tick, agent, purpose). */
export function roll(
  seed: bigint,
  tick: number,
  agentKey: string,
  purpose: string
): number {
  let x = hash32(seed, tick, agentKey, purpose);
  x = (x + 0x6d2b79f5) | 0;
  let t = Math.imul(x ^ (x >>> 15), 1 | x);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
