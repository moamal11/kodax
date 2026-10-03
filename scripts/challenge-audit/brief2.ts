import { ALL_CHALLENGES } from '../../src/constants/courseData';
const langs = process.argv.slice(2);
for (const c of (ALL_CHALLENGES as any[]).filter((c) => langs.includes(c.language) || langs.includes(c.id))) {
  console.log(`\n### ${c.id} [${c.language}/${c.difficulty}] ${c.title}\nD: ${c.description.replace(/\s+/g, ' ')}`);
  console.log('STARTER: ' + c.starterCode.replace(/\s+/g, ' ').slice(0, 420));
  console.log('SOL: ' + c.solution.replace(/\s+/g, ' ').slice(0, 520));
  console.log('T: ' + c.testCases.map((t: any) => `${JSON.stringify(t.input).slice(0, 60)}→${JSON.stringify(t.expectedOutput).slice(0, 60)}`).join(' | '));
}
