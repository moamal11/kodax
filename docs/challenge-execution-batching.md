# Challenge execution batching

The public `verify-challenge` request/response contract, completion RPCs, rewards,
and access checks are unchanged. Existing Android binaries remain supported.
They may still perform their original local checks before server verification.

Only the server opts into JavaScript/C++ batching. The shared validator defaults
to its existing per-case execution behavior for those languages.

- JavaScript: one Wandbox request; each test runs in a fresh Node subprocess,
  including asynchronous work. Output is captured separately.
- C++: one compilation; each test runs in a separate fork from the pristine
  parent. Mutable globals, stdout and stderr are isolated between tests.
- Each batch child has a two-second deadline; cases exceeding it are rechecked
  through the original executor with its original allowance, preserving support
  for slow valid solutions. Suites above eight cases,
  whole-program C++ cases, and C++ preprocessor constructs other than includes
  retain the original path. No changes to SQL or structural validation.
- Compiler/runtime failures and wrong outputs are rejected. Provider errors do
  not record attempts or reward users. Unsupported process creation or malformed
  batch framing falls back to the original per-case executor.
- C++ batches allow up to 40 seconds for the single provider compilation request;
  ordinary requests keep their existing 20-second deadline. If a batch request
  times out, verification falls back to the original per-case path.
- The existing output comparison and hidden-test redaction are reused.

## Emergency rollback

Set the Supabase function secret `CHALLENGE_BATCH_EXECUTION=false` and ensure
the verifier function picks up the new environment (redeploy if needed).
This disables the new JavaScript/C++ batches without requiring an app update.
The earlier Python optimization is unaffected. For full code rollback, deploy
the verifier from commit `c1a2ccd`.

## Validation

`npx tsx scripts/challenge-audit/batch-execution.test.ts` checks legacy parity
across the JavaScript catalog, process isolation, async code, incorrect output,
syntax/runtime errors, timeouts, hidden-result privacy and fallback behavior.
Add `--live` for representative JavaScript/C++ tests against Wandbox.

`npx tsx scripts/challenge-audit/batch-production.test.ts` tests the deployed
verifier with the original request contract using the existing isolated QA user.
It requires the ignored local QA credentials and writes a report under reports.
