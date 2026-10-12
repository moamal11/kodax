import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { ALL_CHALLENGES } from '../../src/constants/courseData';
import { JAVA_CHALLENGES } from '../../src/constants/javaContent';
import { validateChallenge, type CodeExecutor } from '../../src/services/challengeValidator';
import { localExecute } from './localExecutor';
import { executeCode } from '../../src/services/codeExecution';

const local: CodeExecutor = async req => {
  if (req.language !== 'sql') return localExecute(req);
  const r = spawnSync('sqlite3', [':memory:'], { input: req.code, encoding: 'utf8', timeout: 10000 });
  return { success: r.status === 0, output: r.stdout || '', error: r.stderr || r.error?.message || '' };
};
async function custom(lang: string, code: string, inputs: string[], expected: string[], executor = local, callsExpected = 1) {
  let calls = 0;
  const r = await validateChallenge(code, '', lang, inputs.map((input, i) => ({ input, expectedOutput: expected[i], description: 'case', hidden: i > 0 })), {
    batchExecution: true, execute: req => { calls++; return executor(req); },
  });
  assert.equal(calls, callsExpected, `${lang}: provider requests`);
  for (const row of r.results.filter(x => x.hidden)) {
    assert.equal(row.input, undefined); assert.equal(row.actualOutput, undefined); assert.equal(row.expectedOutput, undefined);
  }
  return r;
}
async function main() {
  assert.equal((await custom('python', 'import builtins\ndef value():\n    builtins.kx = getattr(builtins, "kx", 0) + 1\n    return builtins.kx', ['value()', 'value()'], ['1','1'])).allPassed, true);
  assert.equal((await custom('java', 'static int n=0; public static int value(){return ++n;}', ['value()', 'value()'], ['1','1'])).allPassed, true);
  assert.equal((await custom('java', 'public static int value(){System.out.println("أهلاً"); return 3;}', ['value()', 'value()'], ['أهلاً\n3','أهلاً\n3'])).allPassed, true);
  assert.equal((await custom('sql', 'SELECT count(*) FROM t;', ['CREATE TABLE t(n); INSERT INTO t VALUES(1);','CREATE TABLE t(n);'], ['1','0'])).allPassed, true);
  assert.equal((await custom('sql', 'SELECT n FROM t;', ['CREATE TABLE t(n);','CREATE TABLE t(n); INSERT INTO t VALUES(2);'], ['','2'])).allPassed, true);
  for (const lang of ['python','java','sql']) {
    const code = lang === 'python' ? 'def value(): return 0' : lang === 'java' ? 'public static int value(){return 0;}' : 'SELECT 0;';
    const inputs = lang === 'sql' ? ['',''] : ['value()','value()'];
    assert.equal((await custom(lang, code, inputs, ['1','2'])).allPassed, false);
    let calls=0;
    await validateChallenge(code, '', lang, inputs.map(input => ({ input, expectedOutput: '0', description: '' })), { execute: req => { calls++; return local(req); } });
    assert.equal(calls,2, `${lang}: explicit old-client executor stays per case`);
    const malformed: CodeExecutor = async req => ++calls === 1 ? { success:true, output:'invalid framing' } : local(req);
    calls=0;
    assert.equal((await custom(lang, code, inputs, ['0','0'], malformed,3)).allPassed,true);
    const outage: CodeExecutor = async () => ({ success:false, serviceError:true, error:'Provider unavailable' });
    assert.equal((await custom(lang, code, inputs, ['0','0'], outage)).serviceError,true);
  }
  assert.equal((await custom('python', 'def value():\n    raise ValueError("bad")', ['value()','value()'], ['1','1'])).allPassed,false);
  assert.equal((await custom('java', 'public static int value(){throw new RuntimeException("bad");}', ['value()','value()'], ['1','1'])).allPassed,false);
  assert.equal((await custom('sql', 'SELECT missing FROM t;', ['CREATE TABLE t(n);','CREATE TABLE t(n);'], ['1','1'], local,2)).allPassed,false);
  assert.equal((await custom('sql', '.mode csv\nSELECT 1;', ['',''], ['1','1'], local,2)).allPassed,true);
  assert.equal((await custom('python', 'import time\ndef value():\n    time.sleep(2.2)\n    return 1', ['value()','value()'], ['1','1'],local,3)).allPassed,true);
  assert.equal((await custom('java', 'public static int value(){try{Thread.sleep(2200);}catch(Exception e){} return 1;}', ['value()','value()'], ['1','1'],local,3)).allPassed,true);
  let suites=0;
  for (const c of [...ALL_CHALLENGES, ...JAVA_CHALLENGES].filter(c => ['python','java','sql'].includes(c.language.toLowerCase()) && c.solution)) {
    const options = { execute:local, checks:c.checks, prelude:c.prelude, entryFunction:c.entryFunction, validation:c.validation };
    const legacy = await validateChallenge(c.solution!, c.starterCode, c.language, c.testCases, options);
    const batch = await validateChallenge(c.solution!, c.starterCode, c.language, c.testCases, {...options,batchExecution:true});
    assert.equal(batch.allPassed, legacy.allPassed, `${c.id}: acceptance parity`);
    assert.equal(batch.passedTests, legacy.passedTests, `${c.id}: individual outcomes`);
    if (c.language === 'Java') assert.equal(batch.allPassed, true, `${c.id}: Java model must execute successfully`);
    suites++;
    if (suites % 25 === 0) console.log(`Checked ${suites} catalog suites`);
  }
  console.log(`PASS: ${suites} Python/Java/SQL catalog suites, isolation, Unicode, empty SQL results, wrong code, hidden privacy, rollback, outages and slow valid cases`);
  if (process.argv.includes('--live')) {
    for (const id of ['py-ch-beg-4','java-ch-2','java-ch-5','sql-ch-001','sql-ch-005']) {
      const c = [...ALL_CHALLENGES, ...JAVA_CHALLENGES].find(c=>c.id===id)!;
      let calls=0; const start=Date.now();
      const r=await validateChallenge(c.solution!,c.starterCode,c.language,c.testCases,{ batchExecution:true, checks:c.checks,prelude:c.prelude,entryFunction:c.entryFunction,validation:c.validation,execute:req=>{calls++;return executeCode(req);} });
      console.log(JSON.stringify({id,calls,ms:Date.now()-start,passed:r.passedTests,total:r.totalTests,errors:r.results.filter(x=>!x.passed)}));
      assert.equal(r.allPassed,true); assert.equal(calls,1);
    }
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
