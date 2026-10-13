import assert from 'node:assert/strict';
import { handleChat, clearMemoryCache, callGroq, violatesTeachingMode, groqTransformationOnly } from '../../supabase/functions/ai-chat/core';
import { callOpenAI } from '../../supabase/functions/ai-chat/openai';
import { clearProviderCooldowns, routeProviders, retryAfterMs, type ProviderResult } from '../../supabase/functions/ai-chat/routing';

async function main() {
  let checks = 0;
  assert(violatesTeachingMode('استخدم `text[::-1]`', 'challenge-hint'));
  assert(!violatesTeachingMode('```python\nprint(x)\n```', 'challenge-debug'));
  assert(!violatesTeachingMode('فكّر في اتجاه المرور على حروف النص.', 'challenge-hint'));
  checks++;
  assert(groqTransformationOnly('اختصر النص: نرحب بكم في المجتمع ونشكركم على المشاركة', 'general', []));
  for (const [text, mode] of [['اختصر كود Python', 'general'], ['اشرح null', 'general'], ['اختصر النص', 'challenge-hint']]) {
    assert(!groqTransformationOnly(text, mode, []));
  }
  assert(!groqTransformationOnly('اختصر النص', 'general', [{ role: 'user', content: 'code' }]));
  checks++;
  const ok = { ok: true, text: 'جواب صحيح', model: 'test', tokensUsed: 10 } as const;
  for (const simple of [true, false]) {
    for (const reason of ['rate_limited', 'timeout', 'network', 'empty', 'provider_error'] as const) {
      clearProviderCooldowns();
      const order: string[] = [];
      const first = simple ? 'groq' : 'gemini';
      const attempts = Object.fromEntries(['groq', 'gemini'].map(p => [p, { key: p, call: async () => {
        order.push(p); return p === first ? { ok: false, reason, status: 503 } as ProviderResult : ok;
      } }]));
      const result = await routeProviders({ simple, attempts });
      assert(result.ok); assert.deepEqual(order, simple ? ['groq', 'gemini'] : ['gemini', 'groq']); checks++;
    }
  }
  clearProviderCooldowns();
  let secondary = 0;
  const blocked = await routeProviders({ simple: true, attempts: {
    groq: { key: 'groq', call: async () => ({ ok: false, reason: 'blocked' }) },
    gemini: { key: 'gemini', call: async () => { secondary++; return ok; } },
  } });
  assert(!blocked.ok && blocked.reason === 'blocked'); assert.equal(secondary, 0); checks++;
  let clock = 0, firstCalls = 0;
  clearProviderCooldowns();
  const cooling = { simple: true, now: () => clock, attempts: {
    groq: { key: 'groq', call: async () => { firstCalls++; return { ok: false, reason: 'rate_limited', retryAfterMs: 1000 } as const; } },
    gemini: { key: 'gemini', call: async () => ok },
  } };
  await routeProviders(cooling); await routeProviders(cooling); assert.equal(firstCalls, 1);
  clock = 1001; await routeProviders(cooling); assert.equal(firstCalls, 2); checks++;
  clearProviderCooldowns();
  clock = 0; const budgets: number[] = [];
  await routeProviders({ simple: false, now: () => clock, attempts: {
    gemini: { key: 'g', call: async ms => { budgets.push(ms); clock += ms; return { ok: false, reason: 'timeout' }; } },
    groq: { key: 'q', call: async ms => { budgets.push(ms); return ok; } },
  } });
  assert.deepEqual(budgets, [25000, 20000]); checks++;
  assert.equal(retryAfterMs('2'), 2000); assert.equal(retryAfterMs('bad'), undefined); checks++;

  for (const bothFail of [false, true]) {
    clearMemoryCache(); clearProviderCooldowns();
    let reserves = 0, releases = 0; const requests: any[] = [];
    const result = await handleChat({
      getUser: async () => ({ id: 'qa' }), apiKey: 'gemini-secret', groqApiKey: 'groq-secret', openaiApiKey: 'openai-secret', routingEnabled: true,
      openaiSpend: { reserve: async () => 'hold', settle: async () => {} },
      reserveQuota: async () => { reserves++; return { allowed: true, quota: null }; },
      releaseQuota: async () => { releases++; return null; },
      fetchImpl: (async (url, init) => {
        const body = JSON.parse(init!.body as string); requests.push({ url, body, headers: init!.headers });
        if (String(url).includes('googleapis') || bothFail) return new Response('{}', { status: 503 });
        return Response.json({ choices: [{ message: { content: 'استخدم return text[::-1] لعكس النص.' } }], usage: { total_tokens: 55 } });
      }) as typeof fetch,
    }, { message: 'اشرح كيف تعمل النصوص', mode: 'lesson-explain', context: 'نص Unicode',
      history: [{ role: 'user', content: 'أريد عكس النص' }, { role: 'assistant', content: 'أرسل الدالة' }] });
    assert.equal(reserves, 1); assert.equal(releases, bothFail ? 1 : 0);
    assert.equal(result.status, bothFail ? 502 : 200); assert.equal(requests.length, 2);
    if (!bothFail) {
      assert.equal(result.body.source, 'gemini'); assert.equal(result.body.provider, 'openai');
      assert(requests[1].body.messages[0].content.includes('Unicode'));
      assert(requests[1].body.messages.some((m: any) => m.content === 'أرسل الدالة'));
      assert.equal(requests[1].body.reasoning_effort, 'none');
    }
    assert(!requests.some(r => String(r.url).includes('groq')));
    checks++;
  }
  clearProviderCooldowns(); clearMemoryCache();
  let groqCalls = 0;
  await handleChat({ getUser: async () => ({ id: 'normal' }), apiKey: 'g', groqApiKey: 'q',
    routingTestUserIds: ['qa'], reserveQuota: async () => ({ allowed: true }), releaseQuota: async () => null,
    fetchImpl: (async url => {
      if (String(url).includes('groq')) groqCalls++;
      return Response.json({ candidates: [{ content: { parts: [{ text: 'شرح' }] } }] });
    }) as typeof fetch,
  }, { message: 'فسر recursion بالتفصيل', mode: 'lesson-explain', routingEnabled: true });
  assert.equal(groqCalls, 0); checks++;
  for (const payload of [{ choices: [] }, { choices: [{ message: { content: '  ' } }] },
    { choices: [{ message: { content: 'x', refusal: 'no' } }] }]) {
    const result = await callGroq({ message: 'x', apiKey: 'q', fetchImpl: (async () => Response.json(payload)) as typeof fetch });
    assert(!result.ok); checks++;
  }
  let paidCalls = 0;
  const denied = await callOpenAI({ apiKey: 'secret', messages: [{ role: 'user', content: 'hi' }], maxTokens: 20, timeoutMs: 1000,
    spend: { reserve: async () => null, settle: async () => {} }, fetchImpl: (async () => { paidCalls++; return Response.json({}); }) as typeof fetch });
  assert(!denied.ok); assert.equal(paidCalls, 0); checks++;
  let charged = -1;
  const paid = await callOpenAI({ apiKey: 'secret', messages: [{ role: 'user', content: 'hi' }], maxTokens: 20, timeoutMs: 1000,
    spend: { reserve: async () => 'id', settle: async (_id, cost) => { charged = cost; } },
    fetchImpl: (async () => Response.json({ choices: [{ message: { content: 'جواب' } }], usage: { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 } })) as typeof fetch });
  assert(paid.ok); assert.equal(charged, 120); checks++;
  for (const mode of ['challenge-hint', 'challenge-debug', 'lesson-explain', 'challenge-fix']) {
    clearMemoryCache(); clearProviderCooldowns();
    const urls: string[] = []; let released = 0;
    const r = await handleChat({ getUser: async () => ({ id: 'qa' }), apiKey: 'g', groqApiKey: 'q', openaiApiKey: 'o', routingEnabled: true,
      openaiSpend: { reserve: async () => 'hold', settle: async () => {} },
      reserveQuota: async () => ({ allowed: true }), releaseQuota: async () => { released++; return null; },
      fetchImpl: (async url => { urls.push(String(url)); return new Response('{}', { status: 503 }); }) as typeof fetch,
    }, { message: 'صحح def add(a,b): return str(a)+str(b)', mode });
    assert.equal(r.status,502); assert.equal(released,1); assert.equal(urls.length,2);
    assert(!urls.some(u=>u.includes('groq'))); checks++;
  }
  for (const status of [401,429,503]) {
    let settlement: number | null = null;
    await callOpenAI({ apiKey: 'o', messages: [{ role: 'user', content: 'hi' }], maxTokens: 20, timeoutMs: 1000,
      spend: { reserve: async () => 'id', settle: async (_id,cost) => { settlement = cost; } },
      fetchImpl: (async () => Response.json({ error: { code: status === 401 ? 'invalid_api_key' : 'insufficient_quota' } }, { status })) as typeof fetch });
    assert.equal(settlement, status === 503 ? null : 0); checks++;
  }
  console.log(`${checks} routing checks passed`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
