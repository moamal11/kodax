import { retryAfterMs, type ProviderResult } from './routing.ts';

export const OPENAI_MODEL = 'gpt-5.4-mini';
/** No app spending ceiling unless the operator explicitly configures one. */
export function configuredOpenAISpendCap(value?: string): number | null {
  if (!value?.trim()) return null;
  const cap = Number(value);
  return Number.isSafeInteger(cap) && cap > 0 ? cap : 0;
}
export type SpendGuard = {
  reserve: (microUsd: number) => Promise<string | null>;
  settle: (id: string, microUsd: number) => Promise<void>;
};
export function openAIUpperCost(messages: { role: string; content: string }[], outputLimit: number) {
  // UTF-8 byte count is a conservative token bound for text, with chat framing margin.
  const inputBound = messages.reduce((sum, m) => sum + new TextEncoder().encode(m.content).length + 64, 256);
  return Math.ceil(inputBound * 0.75 + outputLimit * 4.5);
}
export async function callOpenAI(options: {
  messages: { role: string; content: string }[]; apiKey: string; maxTokens: number;
  timeoutMs: number; fetchImpl?: typeof fetch; spend: SpendGuard;
}): Promise<ProviderResult> {
  const ceiling = openAIUpperCost(options.messages, options.maxTokens);
  const id = await options.spend.reserve(ceiling).catch(() => null);
  if (!id) return { ok: false, reason: 'rate_limited' };
  // On an ambiguous timeout retain the ceiling, since the provider may have charged.
  try {
    const response = await (options.fetchImpl ?? fetch)('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: options.messages, reasoning_effort: 'none',
        max_completion_tokens: options.maxTokens, store: false }),
      signal: AbortSignal.timeout(options.timeoutMs),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const code = error?.error?.code;
      const errorCode = ['insufficient_quota', 'invalid_api_key', 'model_not_found', 'rate_limit_exceeded', 'credit_balance_exhausted'].includes(code) ? code : undefined;
      if ([400, 401, 403, 404, 429].includes(response.status)) await options.spend.settle(id, 0).catch(() => undefined);
      return { ok: false, reason: response.status === 429 ? 'rate_limited' : 'provider_error', status: response.status, errorCode,
        retryAfterMs: retryAfterMs(response.headers.get('retry-after')) };
    }
    const data = await response.json();
    if (Number.isFinite(data.usage?.prompt_tokens) && Number.isFinite(data.usage?.completion_tokens)) {
      const cost = Math.ceil(data.usage.prompt_tokens * 0.75 + data.usage.completion_tokens * 4.5);
      await options.spend.settle(id, cost).catch(() => undefined);
    }
    const choice = data.choices?.[0];
    if (choice?.finish_reason === 'content_filter' || choice?.message?.refusal) return { ok: false, reason: 'blocked' };
    const text = choice?.message?.content;
    if (typeof text !== 'string' || !text.trim() || choice?.finish_reason === 'length') return { ok: false, reason: 'empty' };
    return { ok: true, text, tokensUsed: data.usage?.total_tokens ?? 0, model: OPENAI_MODEL, provider: 'openai' };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return { ok: false, reason: name === 'AbortError' || name === 'TimeoutError' ? 'timeout' : 'network' };
  }
}
