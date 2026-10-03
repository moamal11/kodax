import { ALL_CHALLENGES } from '../../src/constants/courseData';
const byLang: Record<string, number> = {};
const issues: string[] = [];
const ids = new Map<string, number>();
for (const c of ALL_CHALLENGES as any[]) {
  byLang[c.language] = (byLang[c.language] || 0) + 1;
  ids.set(c.id, (ids.get(c.id) || 0) + 1);
  if (!c.solution) issues.push(`${c.id}: no solution`);
  if (!c.testCases?.length) issues.push(`${c.id}: no testCases`);
  if (!c.hints?.length) issues.push(`${c.id}: no hints`);
}
for (const [id, n] of ids) if (n > 1) issues.push(`${id}: DUPLICATE id x${n}`);
console.log('TOTAL', ALL_CHALLENGES.length);
console.log(byLang);
const tc = (ALL_CHALLENGES as any[]).reduce((a, c) => a + (c.testCases?.length || 0), 0);
console.log('testCases', tc);
console.log(issues.length, 'structural issues'); console.log(issues.slice(0, 60).join('\n'));
