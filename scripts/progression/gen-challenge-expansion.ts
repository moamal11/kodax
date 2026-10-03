/**
 * يولّد migration كتالوج تحديات التوسعة (لا تعدّل الناتج يدوياً):
 *   npx tsx scripts/progression/gen-challenge-expansion.ts
 * الناتج: supabase/migrations/20261003030000_challenge_expansion.sql
 *
 * - يضيف تحديات التوسعة إلى challenge_catalog (الصعوبة، XP، الدورة المطلوبة، الدرس المرتبط).
 * - يتحقق أن وصول التحديات القديمة لم يتغير مقارنة بـ migration القفل المطبّقة (20261002020000).
 * الحلول تُولَّد في 20261003020000_challenge_solutions (gen-challenge-solutions.ts).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES, ALL_COURSES, ALL_LESSONS, getChallengeAccessType, getChallengeRequiredCourseId } from '../../src/constants/courseData';
import { EXPANSION_CHALLENGES } from '../../src/constants/challengeExpansion';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const ROOT = join(__dirname, '../..');

// 1) القديمة: نفس الوصول المطبّق في الإنتاج
const applied = readFileSync(join(ROOT, 'supabase/migrations/20261002020000_challenge_access.sql'), 'utf8');
const appliedMap = new Map<string, string | null>();
for (const m of applied.matchAll(/\('([^']+)', (NULL|'[^']*')\)/g)) appliedMap.set(m[1], m[2] === 'NULL' ? null : m[2].slice(1, -1));
const expansionIds = new Set(EXPANSION_CHALLENGES.map((c) => c.id));
const drift: string[] = [];
for (const c of ALL_CHALLENGES.filter((x) => !expansionIds.has(x.id))) {
  const req = getChallengeAccessType(c) === 'course-required' ? getChallengeRequiredCourseId(c) ?? null : null;
  if (appliedMap.get(c.id) !== req) drift.push(`${c.id}: applied=${appliedMap.get(c.id)} now=${req}`);
}
if (drift.length) throw new Error(`legacy challenge access changed:\n${drift.join('\n')}`);

// 2) التوسعة
const courseIds = new Set(ALL_COURSES.map((c) => c.id));
const lessonIds = new Set(ALL_LESSONS.map((l) => l.id));
const BANDS: Record<string, [number, number]> = { easy: [15, 30], medium: [30, 60], hard: [60, 120] };
const rows = EXPANSION_CHALLENGES.map((c) => {
  if (!c.courseId || !courseIds.has(c.courseId)) throw new Error(`${c.id}: unknown course ${c.courseId}`);
  if (!c.afterLessonId || !lessonIds.has(c.afterLessonId)) throw new Error(`${c.id}: unknown lesson ${c.afterLessonId}`);
  const lesson = ALL_LESSONS.find((l) => l.id === c.afterLessonId)!;
  if (lesson.courseId !== c.courseId) throw new Error(`${c.id}: lesson ${c.afterLessonId} not in ${c.courseId}`);
  const [lo, hi] = BANDS[c.difficulty];
  if (c.points < lo || c.points > hi) throw new Error(`${c.id}: ${c.points} XP outside ${c.difficulty} band ${lo}-${hi}`);
  if (!c.testCases.some((t) => t.hidden) && !c.checks?.length) throw new Error(`${c.id}: needs hidden tests`);
  const req = getChallengeAccessType(c) === 'course-required' ? getChallengeRequiredCourseId(c) ?? null : null;
  return `  (${q(c.id)}, ${q(c.difficulty)}, ${c.points}, ${req ? q(req) : 'NULL'}, ${q(c.afterLessonId)})`;
});

const byCourse = new Map<string, number>();
for (const c of EXPANSION_CHALLENGES) byCourse.set(c.courseId!, (byCourse.get(c.courseId!) ?? 0) + 1);
const sql = `-- ============================================================================
-- تحديات التوسعة: ${rows.length} تحدياً مرتبطة بدروس محددة لسد فجوات الدورات
-- مولَّد تلقائياً بـ scripts/progression/gen-challenge-expansion.ts — لا تعدّله يدوياً
-- ${[...byCourse].map(([c, n]) => `${c}: ${n}`).join('، ')}
--
-- XP حسب الصعوبة (سهل 15–30، متوسط 30–60، صعب 60–120). وصول التحديات القديمة (169) لم يتغير.
-- الحلول النموذجية في challenge_solutions (20261003020000) وتُعرض فقط بعد إعلان معتمد أو بعد الحل.
-- آمن: إضافة فقط. قابل للتكرار.
-- ============================================================================
BEGIN;

ALTER TABLE challenge_catalog ADD COLUMN IF NOT EXISTS after_lesson_id TEXT;

INSERT INTO challenge_catalog (id, difficulty, points, required_course_id, after_lesson_id) VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET difficulty = EXCLUDED.difficulty, points = EXCLUDED.points,
  required_course_id = EXCLUDED.required_course_id, after_lesson_id = EXCLUDED.after_lesson_id, updated_at = NOW();

COMMIT;
`;
const out = join(ROOT, 'supabase/migrations/20261003030000_challenge_expansion.sql');
writeFileSync(out, sql);
console.log(`wrote ${out}: ${rows.length} challenges; legacy access unchanged (${appliedMap.size} checked)`);
