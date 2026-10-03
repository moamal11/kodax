import { ALL_CHALLENGES } from '../../src/constants/courseData';
import { validateChallenge } from '../../src/services/challengeValidator';
import { localExecute } from './localExecutor';
(async () => {
  const [id, which = 'solution'] = process.argv.slice(2);
  const c = (ALL_CHALLENGES as any[]).find((x) => x.id === id);
  const code = which === 'starter' ? c.starterCode : which === 'solution' ? c.solution : require('node:fs').readFileSync(which, 'utf8');
  const r = await validateChallenge(code, c.starterCode, c.language, c.testCases, { execute: localExecute, checks: c.checks, entryFunction: c.entryFunction, validation: c.validation, prelude: c.prelude });
  console.log(JSON.stringify({ ...r, results: r.results.map((x: any) => ({ p: x.passed, k: x.kind, d: x.description, a: x.actualOutput, e: x.expectedOutput, err: x.error?.slice?.(0, 300) })) }, null, 1));
})();
