# Challenge execution batching

The public `verify-challenge` request/response contract, completion RPCs, rewards,
and access checks are unchanged. Existing Android binaries remain supported.
They may still perform their original local checks before server verification.

Only the server opts into the new JavaScript/C++/Java/SQL/Python process batching.
The shared validator retains existing behavior without that opt-in, including
the previous Python namespace batch for legacy callers of the default executor.

- JavaScript: one Wandbox request; each test runs in a fresh Node subprocess,
  including asynchronous work. Output is captured separately.
- C++: one compilation; each test runs in a separate fork from the pristine
  parent. Mutable globals, stdout and stderr are isolated between tests.
- Python: one request with a fresh interpreter per case, isolating imported
  modules, interpreter settings and global state. UTF-8 output is explicit.
- Java: one compilation of independent nested case classes, followed by a fresh
  JVM per case. Imports/packages, self-referencing class names and whole-program
  cases keep the established executor. Compilation errors in the batch fall
  back to the original wrapper, preserving acceptance and error locations.
- SQL: one SQLite CLI request, reopening a fresh in-memory database for each
  test. Strict randomized markers split results, including empty result sets.
  CLI commands, connection settings/extensions, errors, timeouts and malformed
  framing fall back to the original cases. Provider outages remain service errors.
- Each batch child has a two-second deadline; cases exceeding it are rechecked
  through the original executor with its original allowance, preserving support
  for slow valid solutions. Suites above eight cases (sixteen for Python),
  whole-program C++ cases, and C++ preprocessor constructs other than includes
  retain the original path. Structural validation remains local and unchanged.
- Compiler/runtime failures and wrong outputs are rejected. Provider errors do
  not record attempts or reward users. Unsupported process creation or malformed
  batch framing falls back to the original per-case executor.
- C++ and Java batches, and Python batches above eight cases, allow up to 40 seconds for the single provider request;
  ordinary requests keep their existing 20-second deadline. If a batch request
  times out, verification falls back to the original per-case path.
- The existing output comparison and hidden-test redaction are reused.

## Emergency rollback

Set the Supabase function secret `CHALLENGE_BATCH_EXECUTION=false` and ensure
the verifier function picks up the new environment (redeploy if needed).
This disables the new process/SQL batches without requiring an app update.
The earlier Python optimization is unaffected. For full code rollback, deploy
the verifier from commit `c1a2ccd`.

## Validation

`npx tsx scripts/challenge-audit/batch-execution.test.ts` checks legacy parity
across the JavaScript catalog, process isolation, async code, incorrect output,
syntax/runtime errors, timeouts, hidden-result privacy and fallback behavior.
Add `--live` for representative JavaScript/C++ tests against Wandbox.

`npx tsx scripts/challenge-audit/remaining-batch.test.ts` checks complete
Python/Java/SQL catalog parity with the legacy validator, isolation, Unicode,
empty results, wrong answers, slow valid cases, outages and fallback. Add `--live`
for representative cases against Wandbox. The production test accepts
`--remaining` for the same legacy API contract with published Python/SQL cases.

Java fixtures live in `javaContent.ts` but are not part of the currently published
242-challenge catalog. They are tested locally and against Wandbox, without adding
new courses or challenge URLs. Java entry-function detection now handles indented
methods, and generated Main classes match Wandbox's `prog.java` compilation.

## Next Android build

The authenticated challenge screen already submits directly to the authoritative
server for every language, avoiding the old preliminary local execution. No new
APK/AAB is needed for server compatibility. Build from the current source whenever
the next release is desired; old installed builds can keep their slower local
check. No new runtime service, subscription or client request fields are needed.

`npx tsx scripts/challenge-audit/batch-production.test.ts` tests the deployed
verifier with the original request contract using the existing isolated QA user.
It requires the ignored local QA credentials and writes a report under reports.

## Deployment fallback

On 2026-10-12, remote bundling returned an internal 500 while local Deno checks
passed. Deployment succeeded with a local bundle of the same entry point and
dependencies. No function contract, JWT setting or database migration changed.
To repeat this fallback from the project root in PowerShell:

```powershell
$bundleDir = Join-Path (Get-Location) 'reports/challenge-verifier-deploy'
New-Item -ItemType Directory -Force -Path "$bundleDir/supabase/functions/verify-challenge" | Out-Null
npx --yes deno bundle --no-config --no-lock --platform deno --output "$bundleDir/supabase/functions/verify-challenge/index.ts" supabase/functions/verify-challenge/index.ts
# Continue only if bundling succeeds.
Set-Content -LiteralPath "$bundleDir/supabase/config.toml" -Encoding utf8 -Value "project_id = 'kodax'`n[functions.verify-challenge]`nverify_jwt = false"
npx supabase functions deploy verify-challenge --project-ref krtulodnhmfuoxjqajwl --workdir "$bundleDir"
```
