# AI provider routing

`ai-chat` keeps the installed client response contract (`reply`, `source: gemini`, `model`, `tokensUsed`, `quota`). `provider` is an additive diagnostic field; no new Android build is required.

Server secrets:

- `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MODEL_LITE`: existing Gemini configuration.
- `GROQ_API_KEY`: backend only; never EXPO_PUBLIC or committed.
- `GROQ_MODEL`, `GROQ_MODEL_LITE`: optional Groq model overrides.
- `OPENAI_API_KEY`: OpenAI API project key, not a ChatGPT subscription credential.
- `OPENAI_SPEND_CAP_MICRO_USD`: optional shared lifetime ceiling in millionths of USD. Unset/empty means no app ceiling: use OpenAI while its account permits requests. A positive safe integer enables an operator-selected ceiling; invalid/zero configuration blocks paid requests. No hardcoded $2.50 maximum. Includes trials and unknown in-flight charges when a ceiling is configured; changing it does not reset spend. The fixed model is GPT-5.4 mini with reasoning disabled, standard text prices $0.75/M input and $4.50/M output.
- `AI_ROUTING_ENABLED=true`: enable routing globally; false restores the original Gemini-only route.
- `AI_ROUTING_TEST_USER_IDS`: optional comma-separated authenticated QA UUIDs, enables only those users while global routing is off.
- `AI_ROUTING_TEST_OPENAI_FIRST=true`: QA-only OpenAI validation, still excludes Groq from educational requests. Clear canary secrets after evaluation.

Isolated general-mode summarization/rephrasing requests without history, context or programming terms may use Groq → Gemini → OpenAI. All other requests exclude Groq, including when both other providers fail. Code/debug/fix and advanced questions prefer OpenAI → Gemini; routine explanations and hints prefer Gemini → OpenAI. QA can force OpenAI first without changing ordinary users. Safety refusals stop routing. Paid requests require both a valid OpenAI key and a successful server spend reservation; no automatic credit recharge is enabled by the app.

`ai_provider_spend` has RLS and no client grants; reserve/settle RPCs are service-role only. A transaction advisory lock protects parallel reservations. The adapter reserves a conservative UTF-8 byte based input bound plus bounded output. Actual usage settles the hold once. Explicit authentication, quota and bad-request rejection settle zero. Ambiguous timeouts/network/5xx retain the ceiling until reconciled against billing. Settlements are idempotent. This only tracks calls through this app; other uses of the same OpenAI account are outside the app ledger. Future price changes need an updated estimator.

With no configured app ceiling, this ledger is accounting only: historical spend and unknown holds never disable OpenAI. A provider billing/quota error triggers the eligible fallback; if all eligible providers fail, the student's quota reservation is returned. After topping up the OpenAI account, requests can resume without resetting this ledger or releasing a new app binary; a warm worker may briefly remain in rate-limit cooldown. Auto-reload is managed in the OpenAI account and is not changed by Kodax.

Each attempt gets 12 seconds for simple requests or up to 25 seconds otherwise, bounded by a 45-second routing budget. Authentication/database work and spend RPC latency add overhead. Cooldowns respect bounded Retry-After and skip unhealthy models in the same warm worker. They are not a distributed provider quota manager and do not promise zero downtime.

Quota is reserved once before provider work, retained once on success, released once if all attempts fail. Existing user, advertisement, solution-reveal and project-wide quota limits still apply. This does not implement HTTP request idempotency for independently resubmitted client requests.

Both providers receive the sanitized conversation, context and relevant Kodax knowledge. Hidden reasoning is not returned. Hint validation rejects fenced code and inline expressions resembling a solution, but is a heuristic rather than a guarantee of model correctness.

Validation:

```
npx tsx scripts/challenge-audit/ai-chat-core.test.ts
npx tsx scripts/challenge-audit/ai-routing.test.ts
npx --yes deno check --no-config supabase/functions/ai-chat/index.ts
```

Live QA outputs and rollout decision: `reports/ai-routing-20261013/`. Test account quota reservations are restored after each completed trial; real-user quotas are untouched.

2026-10-13 rollout: the old OpenAI key returned `invalid_api_key` and was replaced by the user. Seven OpenAI quality cases passed review; four final routing cases confirmed Groq summarization, OpenAI code correction, Gemini 429 → OpenAI recovery, and debug explanation without the complete solution. The initial $2.50 lifetime ceiling was subsequently removed at the user's request. Global routing stays enabled and the OpenAI account's prepaid balance governs availability. Provider failures and quota exhaustion can still make all eligible providers unavailable; user quota is refunded on that path. This is a sampled evaluation, not a guarantee that every model answer is correct.
