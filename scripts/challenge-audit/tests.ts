import { ALL_CHALLENGES } from '../../src/constants/courseData';
for (const id of process.argv.slice(2)) {
  const c: any = (ALL_CHALLENGES as any[]).find((x) => x.id === id);
  console.log('==', id, c.entryFunction, c.description);
  for (const t of c.testCases) console.log('  ', t.hidden ? 'H' : 'V', JSON.stringify(t.input).slice(0, 220), '=>', JSON.stringify(t.expectedOutput).slice(0, 80));
}
