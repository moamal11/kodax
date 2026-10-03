import { ALL_CHALLENGES } from '../../src/constants/courseData';
for (const id of process.argv.slice(2)) { const c = (ALL_CHALLENGES as any[]).find((x) => x.id === id); console.log(`\n=== ${id}\n${c.starterCode}\n--- hints: ${JSON.stringify(c.hints)}`); }
