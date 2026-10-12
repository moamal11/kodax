import assert from 'node:assert/strict';
import { executeCode } from '../../src/services/codeExecution';
import { validateChallenge } from '../../src/services/challengeValidator';
import { handleVerify, type VerifyDeps } from '../../supabase/functions/verify-challenge/core';
import { CHALLENGE_SPECS } from '../../supabase/functions/verify-challenge/challenges.generated';

async function main() {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return calls === 1
        ? new Response('Too many requests', { status: 429 })
        : Response.json({ status: '0', program_output: '42\n' });
    };
    const recovered = await executeCode({ language: 'python', code: 'print(42)' });
    assert.equal(recovered.success, true);
    assert.equal(recovered.output, '42\n');
    assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return Response.json({ status: '1', compiler_error: 'SyntaxError' });
    };
    assert.equal((await executeCode({ language: 'python', code: 'invalid code' })).success, false);
    assert.equal(calls, 1, 'User errors must never be retried');
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return Response.json({ status: '0', program_output: JSON.stringify([
        { success: true, output: 'olleh\n', error: '' },
        { success: true, output: 'wrong\n', error: '' },
      ]) });
    };
    const validated = await validateChallenge('def reverse_string(text):\n return text[::-1]', 'def reverse_string(text):\n pass', 'python', [
      { input: '"hello"', expectedOutput: 'olleh', description: 'Visible case' },
      { input: '"abc"', expectedOutput: 'cba', description: 'Hidden case', hidden: true },
    ]);
    assert.equal(calls, 1, 'A Python suite must use one compiler request');
    assert.equal(validated.passedTests, 1);
    assert.equal(validated.allPassed, false, 'Batching must still reject an incorrect result');
    assert.equal(validated.results[1].input, undefined);
    assert.equal(validated.results[1].expectedOutput, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
  let recorded = 0;
  const deps: VerifyDeps = {
    specs: CHALLENGE_SPECS,
    getUserId: async () => 'test-user',
    checkAccess: async () => ({ allowed: true }),
    countRecentSubmissions: async () => 0,
    recordSubmission: async () => { recorded++; throw new Error('Must not record outage'); },
    rewardCoins: async () => { throw new Error('Must not reward outage'); },
    validate: async () => ({ allPassed: false, results: [], totalTests: 5, passedTests: 2, serviceError: true }),
  };
  const result = await handleVerify(deps, 'test-token', { challengeId: 'ch-3', code: 'def reverse_string(text):\n    return text[::-1]' });
  assert.equal(result.status, 503);
  assert.equal(recorded, 0, 'Provider outages must not consume user attempts');
  console.log('PASS: transient retry, no retry for code errors, no recorded outage');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
