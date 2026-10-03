import { ALL_CHALLENGES } from '../../src/constants/courseData';
for (const id of process.argv.slice(2)) {
  const c = (ALL_CHALLENGES as any[]).find((x) => x.id === id);
  if (!c) { console.log('missing', id); continue; }
  console.log('=====', c.id, c.language, c.difficulty, '|', c.title, '| entry', c.entryFunction, c.validation);
  console.log('DESC:', c.description);
  console.log('STARTER:\n' + c.starterCode);
  console.log('SOLUTION:\n' + c.solution);
  console.log('TESTS:', JSON.stringify(c.testCases, null, 1));
  if (c.checks) console.log('CHECKS:', JSON.stringify(c.checks));
}
