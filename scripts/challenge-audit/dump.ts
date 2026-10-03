// طباعة تحديات للمراجعة اليدوية: npx tsx scripts/challenge-audit/dump.ts <prefix|lang>
import { ALL_CHALLENGES } from '../../src/constants/courseData';
const q = process.argv[2] || '';
for (const c of ALL_CHALLENGES as any[]) {
  if (!(c.id.startsWith(q) || c.language === q)) continue;
  console.log(`\n=========== ${c.id} | ${c.language} | ${c.difficulty} | ${c.title}`);
  console.log(`DESC: ${c.description}`);
  console.log(`--- STARTER\n${c.starterCode}`);
  console.log(`--- SOLUTION\n${c.solution}`);
  console.log(`--- TESTS`);
  for (const t of c.testCases) console.log(`  in=${JSON.stringify(t.input)} → ${JSON.stringify(t.expectedOutput)}  (${t.description})${t.hidden ? ' [hidden]' : ''}`);
  console.log(`--- HINTS: ${JSON.stringify(c.hints)}`);
}
