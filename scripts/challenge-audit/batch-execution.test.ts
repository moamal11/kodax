import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validateChallenge, type CodeExecutor } from '../../src/services/challengeValidator';
import { executeCode } from '../../src/services/codeExecution';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

const localNode: CodeExecutor = async req => {
  const r = spawnSync(process.execPath, ['-e', req.code], { encoding: 'utf8', timeout: req.code.includes('const rows =') ? 15000 : 3000 });
  return { success: r.status === 0, output: r.stdout, error: r.error ? 'Time limit exceeded' : r.stderr };
};

async function check(language: string, code: string, expected: string[], inputs: string[], execute: CodeExecutor, expectedCalls = 1) {
  let calls = 0;
  const result = await validateChallenge(code, '', language, inputs.map((input, i) => ({ input, expectedOutput: expected[i], description: `Case ${i}`, hidden: i > 0 })), {
    batchExecution: true, execute: async req => { calls++; return execute(req); },
  });
  assert.equal(calls, expectedCalls, 'Eligible suites use one request; slow cases retain the legacy allowance');
  for (const row of result.results.filter(r => r.hidden)) {
    assert.equal(row.input, undefined); assert.equal(row.expectedOutput, undefined); assert.equal(row.actualOutput, undefined);
  }
  return result;
}

async function main() {
  const isolated = await check('javascript', 'let n = 0; function next() { return ++n; }', ['1','1'], ['next()','next()'], localNode);
  assert.equal(isolated.allPassed, true, 'Each case must reset global state');
  assert.equal((await check('javascript', 'async function value() { return 4; }', ['4','4'], ['const v = await value(); v','const v = await value(); v'], localNode)).allPassed, true);
  assert.equal((await check('javascript', 'function value() { return 0; }', ['1','2'], ['value()','value()'], localNode)).allPassed, false);
  assert.equal((await check('javascript', 'function value() { throw Error("bad"); }', ['',''], ['value()','value()'], localNode)).allPassed, false);
  assert.equal((await check('javascript', 'function value( {', ['1','1'], ['value()','value()'], localNode)).results[0].kind, 'syntax_error');
  const timeout = await check('javascript', 'function value() { while(true) {} }', ['1','1'], ['value()','value()'], localNode, 3);
  assert.equal(timeout.allPassed, false);
  assert.equal(timeout.results[0].kind, 'timeout');
  const slowValid = await check('javascript', 'function value() { const end=Date.now()+2200; while(Date.now()<end){} return 1; }', ['1','1'], ['value()','value()'], localNode, 3);
  assert.equal(slowValid.allPassed,true,'Batch deadlines must not reject a slow valid legacy solution');
  // Old clients and an explicit rollback keep per-case requests.
  let legacyCalls = 0;
  const legacy = await validateChallenge('function value() { return 1; }', '', 'javascript', [1,2].map(() => ({ input:'value()', expectedOutput:'1', description:'' })), { execute: async req => { legacyCalls++; return localNode(req); } });
  assert.equal(legacy.allPassed, true); assert.equal(legacyCalls, 2);
  // Unsupported whole-program C++ retains its established executor.
  let cppCalls = 0;
  await validateChallenge('int main(){return 0;}', '', 'cpp', [1,2].map(() => ({ input:'', expectedOutput:'', description:'' })), { batchExecution:true, execute:async () => { cppCalls++; return {success:true, output:''}; } });
  assert.equal(cppCalls, 2);
  let fallbackCalls = 0;
  const fallback = await validateChallenge('function value() { return 1; }', '', 'javascript', [1,2].map(() => ({input:'value()', expectedOutput:'1', description:''})), {
    batchExecution:true, execute:async req => { fallbackCalls++; return fallbackCalls === 1 ? {success:true, output:'invalid framing'} : localNode(req); },
  });
  assert.equal(fallback.allPassed,true); assert.equal(fallbackCalls,3);
  console.log('PASS: JS process isolation, async, wrong answers, runtime, syntax, timeout, hidden privacy, legacy fallback');
  for (const c of ALL_CHALLENGES.filter(c => !process.argv.includes('--quick') && c.language === 'JavaScript' && c.solution)) {
    const options = { execute:localNode, checks:c.checks, prelude:c.prelude, entryFunction:c.entryFunction, validation:c.validation };
    const original = await validateChallenge(c.solution!, c.starterCode, c.language, c.testCases, options);
    const batched = await validateChallenge(c.solution!, c.starterCode, c.language, c.testCases, {...options,batchExecution:true});
    assert.equal(batched.allPassed,original.allPassed,`${c.id}: acceptance changed`);
    assert.equal(batched.passedTests,original.passedTests,`${c.id}: test outcomes changed`);
  }
  if (!process.argv.includes('--quick')) console.log('PASS: complete JavaScript catalog agrees with legacy validator');
  if (!process.argv.includes('--live')) return;
  for (const id of ['js-ch-beg-1','js-ch-int-1','cpp-ch-beg-1','cpp-ch-int-1']) {
    const c = ALL_CHALLENGES.find(c => c.id === id)!;
    const start = Date.now(); let calls = 0;
    const r = await validateChallenge(c.solution!, c.starterCode, c.language, c.testCases, { batchExecution:true, checks:c.checks, prelude:c.prelude, entryFunction:c.entryFunction, execute:async req => { calls++; return executeCode(req); } });
    console.log(JSON.stringify({id, passed:r.passedTests, total:r.totalTests, calls, ms:Date.now()-start, errors:r.results.filter(row=>!row.passed).map(row=>({kind:row.kind,error:row.error,message:row.message}))}));
    assert.equal(r.allPassed,true); assert.equal(calls,1);
  }
  assert.equal((await check('cpp', 'int n=0; int next(){return ++n;}', ['1','1'], ['next()','next()'], executeCode)).allPassed,true);
  assert.equal((await check('cpp', 'int value(){return 0;}', ['1','2'], ['value()','value()'], executeCode)).allPassed,false);
  const cppTimeout = await check('cpp', 'int value(){while(true){} return 1;}', ['1','2'], ['value()','value()'], executeCode, 2);
  assert.equal(cppTimeout.allPassed,false);
  console.log('PASS: live C++ state isolation, incorrect solutions and timeouts');
}
main().catch(e => {console.error(e); process.exitCode=1;});
