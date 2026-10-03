// ملخص مضغوط للمراجعة: npx tsx scripts/challenge-audit/brief.ts <lang> [from] [to]
import { ALL_CHALLENGES } from '../../src/constants/courseData';
const [lang, from = '0', to = '999'] = process.argv.slice(2);
const list = (ALL_CHALLENGES as any[]).filter((c) => c.language === lang).slice(+from, +to);
for (const c of list) {
  console.log(`\n### ${c.id} [${c.difficulty}] ${c.title}\nD: ${c.description.replace(/\s+/g, ' ').slice(0, 300)}`);
  console.log('S: ' + c.solution.replace(/\n\s*\n/g, '\n').split('\n').slice(0, 14).join('\n   '));
  console.log('T: ' + c.testCases.map((t: any) => `${JSON.stringify(t.input).slice(0, 70)}→${JSON.stringify(t.expectedOutput).slice(0, 50)}`).join(' | '));
}
