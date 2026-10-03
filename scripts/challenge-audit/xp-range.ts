import { ALL_CHALLENGES, ALL_LESSONS } from '../../src/constants/courseData';
const cp = ALL_CHALLENGES.map((c: any) => c.points || 0);
const lx = (ALL_LESSONS as any[]).map((l) => l.xpReward ?? l.xp ?? l.points ?? 0);
console.log('challenge points min/max', Math.min(...cp), Math.max(...cp));
console.log('lesson xp min/max', Math.min(...lx), Math.max(...lx), 'lessons', lx.length);
const lessonIds = new Set((ALL_LESSONS as any[]).map((l) => l.id));
console.log('lesson ids colliding with challenge ids:', ALL_CHALLENGES.filter((c) => lessonIds.has(c.id)).map((c) => c.id));
