import { FIXED_CHALLENGE_IDS } from '../../src/constants/challengeFixes';
import { ALL_CHALLENGES } from '../../src/constants/courseData';
const ids = [...FIXED_CHALLENGE_IDS];
const by: Record<string, number> = {};
for (const id of ids) { const c: any = ALL_CHALLENGES.find((x) => x.id === id); const l = c?.language ?? '?'; by[l] = (by[l] || 0) + 1; }
const hidden = ALL_CHALLENGES.reduce((a: number, c: any) => a + c.testCases.filter((t: any) => t.hidden).length, 0);
const total = ALL_CHALLENGES.reduce((a: number, c: any) => a + c.testCases.length, 0);
console.log('total', ALL_CHALLENGES.length, 'fixed', ids.length, JSON.stringify(by));
console.log('tests', total, 'hidden', hidden, 'withChecks', ALL_CHALLENGES.filter((c: any) => c.checks?.length).length);
