import { ALL_LESSONS } from '../../src/constants/courseData';
const n = Number(process.env.N || 18);
for (const id of process.argv.slice(2)) {
  const l: any = ALL_LESSONS.find((x) => x.id === id);
  if (!l) { console.log('missing', id); continue; }
  console.log(`===== ${l.id} [${l.courseId} #${l.order}] ${l.title} (content ${l.content.length}, code ${(l.codeExample||'').length})`);
  console.log((l.codeExample || '').split('\n').filter((x: string) => x.trim()).slice(0, n).join('\n'));
}
