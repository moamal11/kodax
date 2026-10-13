/** Server-only routing. Cooldowns are per warm worker, not a global quota ledger. */
export type Provider = 'gemini' | 'groq' | 'openai';
export type ProviderAttempt = { provider: Provider; ok: boolean; status?: number; reason?: string; errorCode?: string };
export type ProviderResult =
  | { ok: true; text: string; tokensUsed: number; model: string; provider?: Provider; attempts?: ProviderAttempt[] }
  | { ok: false; reason: 'rate_limited' | 'provider_error' | 'timeout' | 'network' | 'empty' | 'blocked'; status?: number; errorCode?: string; retryAfterMs?: number; attempts?: ProviderAttempt[] };

export const ROUTING_BUDGET_MS = 45_000;
const cooldowns = new Map<string, number>();
export function clearProviderCooldowns() { cooldowns.clear(); }
export function retryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.min(ms, 15 * 60_000) : undefined;
}

export async function routeProviders(options: {
  simple: boolean;
  groqFirst?: boolean;
  order?: Provider[];
  attempts: Partial<Record<Provider, { key: string; call: (timeoutMs: number) => Promise<ProviderResult> }>>;
  now?: () => number;
}): Promise<ProviderResult> {
  const now = options.now ?? Date.now;
  const deadline = now() + ROUTING_BUDGET_MS;
  const order: Provider[] = options.order ?? (options.simple || options.groqFirst ? ['groq', 'gemini'] : ['gemini', 'groq']);
  let last: ProviderResult = { ok: false, reason: 'rate_limited' };
  const attempts: ProviderAttempt[] = [];
  for (const provider of order) {
    const attempt = options.attempts[provider];
    if (!attempt || (cooldowns.get(attempt.key) ?? 0) > now()) continue;
    const remaining = deadline - now();
    if (remaining <= 0) return { ok: false, reason: 'timeout' };
    // Leave time for the other provider, including response body consumption.
    const timeoutMs = Math.min(remaining, options.simple ? 12_000 : 25_000);
    const result = await attempt.call(timeoutMs);
    attempts.push({ provider, ok: result.ok, ...(!result.ok ? { status: result.status, reason: result.reason, errorCode: result.errorCode } : {}) });
    if (result.ok) { cooldowns.delete(attempt.key); return { ...result, provider, attempts }; }
    last = result;
    // Safety refusals must not be routed around.
    if (result.reason === 'blocked') return { ...result, attempts };
    const configError = result.reason === 'provider_error' && [400, 401, 403, 404].includes(result.status ?? 0);
    const transient = ['rate_limited', 'timeout', 'network', 'empty'].includes(result.reason)
      || (result.reason === 'provider_error' && (result.status ?? 0) >= 500);
    if (!transient && !configError) return result;
    cooldowns.set(attempt.key, now() + (configError ? 5 * 60_000 : result.retryAfterMs ?? (result.reason === 'rate_limited' ? 60_000 : 15_000)));
  }
  return { ...last, attempts };
}
