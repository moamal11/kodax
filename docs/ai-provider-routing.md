# AI provider routing

`ai-chat` keeps the installed client response contract (`reply`, `source: gemini`, `model`, `tokensUsed`, `quota`). `provider` is an additive diagnostic field; no new Android build is required.

Server secrets:

- `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MODEL_LITE`: existing Gemini configuration.
- `GROQ_API_KEY`: backend only; never EXPO_PUBLIC or committed.
- `GROQ_MODEL`, `GROQ_MODEL_LITE`: optional Groq model overrides.
- `AI_ROUTING_ENABLED=true`: enable routing globally; false restores the original Gemini-only route.
- `AI_ROUTING_TEST_USER_IDS`: optional comma-separated authenticated QA UUIDs, enables only those users while global routing is off.
- `AI_ROUTING_TEST_GROQ_FIRST=true`: QA-only comparison of Groq responses at each complexity. Ignored for ordinary users. Clear canary secrets after evaluation.

Simple requests prefer Groq; explanations/code prefer Gemini. One alternative is attempted on rate limits, timeouts, network failures, empty responses, server failures or provider configuration failures. Safety refusals stop routing. No paid billing is enabled by this code. Verify the actual provider account plan separately.

Each attempt gets 12 seconds for simple requests or up to 25 seconds otherwise, bounded by a 45-second provider budget (authentication/database work is outside this budget). Cooldowns respect bounded Retry-After and skip unhealthy models in the same warm worker. They are not a distributed global quota manager and do not promise zero downtime.

Quota is reserved once before provider work, retained once on success, released once if all attempts fail. Existing user, advertisement, solution-reveal and project-wide quota limits still apply. This does not implement HTTP request idempotency for independently resubmitted client requests.

Both providers receive the sanitized conversation, context and relevant Kodax knowledge. Hidden reasoning is not returned. Hint validation rejects fenced code and inline expressions resembling a solution, but is a heuristic rather than a guarantee of model correctness.

Validation:

```
npx tsx scripts/challenge-audit/ai-chat-core.test.ts
npx tsx scripts/challenge-audit/ai-routing.test.ts
npx --yes deno check --no-config supabase/functions/ai-chat/index.ts
```

Live QA outputs and rollout decision: `reports/ai-routing-20261013/`. Test account quota reservations are restored after each completed trial; real-user quotas are untouched.
