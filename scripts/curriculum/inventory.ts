/**
 * جرد المناهج: كل كورس ودروسه بالترتيب مع مؤشرات الجودة الأساسية.
 * التشغيل: npx tsx scripts/curriculum/inventory.ts [--json out.json]
 */
import { writeFileSync } from 'node:fs';
import { ALL_COURSES, ALL_LESSONS, ALL_CHALLENGES, getChallengesByCourse } from '../../src/constants/courseData';

type Row = {
  id: string;
  title: string;
  field: string;
  difficulty: string;
  declaredLessons: number;
  lessons: { id: string; order: number; title: string; chars: number; code: number; quiz: boolean; lang?: string }[];
  challenges: string[];
  dupOrders: number[];
};

const rows: Row[] = ALL_COURSES.map((c) => {
  const ls = ALL_LESSONS.filter((l) => l.courseId === c.id).sort((a, b) => a.order - b.order);
  const orders = ls.map((l) => l.order);
  return {
    id: c.id,
    title: c.title,
    field: c.fieldId,
    difficulty: c.difficulty,
    declaredLessons: c.totalLessons,
    lessons: ls.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      chars: (l.content || '').length,
      code: (l.codeExample || '').length,
      quiz: !!l.quiz,
      lang: l.language,
    })),
    challenges: getChallengesByCourse(c.id).map((ch) => ch.id),
    dupOrders: orders.filter((o, i) => orders.indexOf(o) !== i),
  };
});

const orphanLessons = ALL_LESSONS.filter((l) => !ALL_COURSES.some((c) => c.id === l.courseId));
const lessonIds = ALL_LESSONS.map((l) => l.id);
const dupLessonIds = lessonIds.filter((x, i) => lessonIds.indexOf(x) !== i);

if (process.argv.includes('--json')) {
  writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify({ rows, orphanLessons: orphanLessons.map((l) => l.id), dupLessonIds }, null, 1));
}

console.log(`courses=${ALL_COURSES.length} lessons=${ALL_LESSONS.length} challenges=${ALL_CHALLENGES.length} orphanLessons=${orphanLessons.length} dupLessonIds=${dupLessonIds.length}`);
for (const r of rows) {
  const avg = r.lessons.length ? Math.round(r.lessons.reduce((a, l) => a + l.chars, 0) / r.lessons.length) : 0;
  const thin = r.lessons.filter((l) => l.chars < 600).length;
  const noCode = r.lessons.filter((l) => l.code === 0).length;
  const noQuiz = r.lessons.filter((l) => !l.quiz).length;
  console.log(
    `${r.id.padEnd(30)} ${r.field.padEnd(10)} ${r.difficulty.padEnd(12)} lessons=${String(r.lessons.length).padStart(3)} (declared ${r.declaredLessons}) avgChars=${String(avg).padStart(5)} thin=${thin} noCode=${noCode} noQuiz=${noQuiz} ch=${r.challenges.length}${r.dupOrders.length ? ` DUP_ORDER=${r.dupOrders}` : ''}`
  );
}
if (orphanLessons.length) console.log('orphan lessons:', [...new Set(orphanLessons.map((l) => l.courseId))].join(', '));
if (dupLessonIds.length) console.log('duplicate lesson ids:', dupLessonIds.join(', '));
