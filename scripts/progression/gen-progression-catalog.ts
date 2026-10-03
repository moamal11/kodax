/**
 * يولّد migration بيانات التقدم من المنهج الفعلي (لا تعدّل الناتج يدوياً):
 *   npx tsx scripts/progression/gen-progression-catalog.ts
 * الناتج: supabase/migrations/20261003000000_progression_catalog.sql
 *
 *  - lesson_catalog: xp + quiz_correct (فهرس الإجابة الصحيحة بالترتيب الأصلي للخيارات) + est_seconds.
 *    الإنتاج فيه lesson_catalog بلا عمود xp (نسخة أقدم من migration الكتالوج طُبّقت)، لذلك
 *    الأعمدة تُضاف بـ IF NOT EXISTS والقيم تُكتب لكل الدروس.
 *  - course_prereqs: الدورة السابقة في نفس المجال (التقدم بالتعلم بدل الكوينات).
 * آمن: لا يحذف شيئاً ولا يلمس تقدم المستخدمين أو أرصدتهم. قابل للتكرار.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_COURSES, ALL_LESSONS } from '../../src/constants/courseData';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const courseIds = new Set(ALL_COURSES.map((c) => c.id));
const lessons = ALL_LESSONS.filter((l) => courseIds.has(l.courseId)).sort((a, b) => a.courseId.localeCompare(b.courseId) || a.order - b.order);

/** مدة القراءة التقديرية: ~3 كلمات/ثانية للنص التقني مع الكود، بين دقيقة و20 دقيقة */
function estSeconds(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(1200, Math.max(60, Math.round(words / 3)));
}

/**
 * المتطلب السابق لكل دورة غير مبتدئة (نفس المجال). الدورات المبتدئة بلا متطلب: كل المسارات
 * مفتوحة للاستكشاف من أول يوم، والتقدم داخل كل مسار يعتمد على التعلم.
 */
const PREREQS: Record<string, string> = {
  'web-css-advanced': 'web-css-styling',
  'web-js-basics': 'web-html-basics',
  'web-deployment': 'web-html-basics',
  'web-react-intro': 'web-js-basics',
  'py-data-structures': 'py-basics',
  'py-oop': 'py-basics',
  'py-advanced': 'py-oop',
  'cpp-pointers': 'cpp-basics',
  'cpp-oop': 'cpp-pointers',
  'cpp-advanced': 'cpp-oop',
  'cyber-network': 'cyber-basics',
  'cyber-advanced': 'cyber-network',
  'cyber-ethical-hacking': 'cyber-network',
  'ai-ml-basics': 'ai-basics',
  'ai-deep-learning': 'ai-ml-basics',
  'rn-advanced': 'rn-basics',
  'flutter-advanced': 'flutter-basics',
  'backend-rest-api': 'backend-nodejs',
  'backend-auth': 'backend-nodejs',
  'backend-supabase': 'backend-sql',
  'backend-firebase': 'backend-sql',
  'backend-mongodb': 'backend-sql',
};
for (const c of ALL_COURSES) {
  const has = !!PREREQS[c.id];
  if (c.difficulty === 'beginner' && has) throw new Error(`beginner course with prereq: ${c.id}`);
  if (c.difficulty !== 'beginner' && !has) throw new Error(`missing prereq for ${c.id}`);
  if (has && !courseIds.has(PREREQS[c.id])) throw new Error(`unknown prereq ${PREREQS[c.id]}`);
}

const rows = lessons.map((l) => {
  const quiz = l.quiz && Number.isInteger(l.quiz.correctAnswer) ? l.quiz : null;
  const text = `${l.content ?? ''} ${l.codeExample ?? ''}`;
  return `  (${q(l.id)}, ${q(l.courseId)}, ${l.order}, ${l.xpReward}, ${quiz ? quiz.correctAnswer : 'NULL'}, ${quiz ? quiz.options.length : 'NULL'}, ${estSeconds(text)})`;
});
const prereqRows = Object.entries(PREREQS)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([c, r]) => `  (${q(c)}, ${q(r)})`);

const sql = `-- ============================================================================
-- بيانات التقدم من المنهج: XP الدرس، إجابة الاختبار، مدة القراءة، ومتطلبات الدورات
-- مولَّد تلقائياً بـ scripts/progression/gen-progression-catalog.ts — لا تعدّله يدوياً
-- الدروس: ${lessons.length} (منها ${lessons.filter((l) => l.quiz).length} باختبار)، متطلبات الدورات: ${prereqRows.length}
--
-- لماذا: الإنتاج فيه lesson_catalog بلا عمود xp (نسخة أقدم من 20261001020000)، بينما
-- _ulp_award_lesson_xp (20261002010000) يقرأ lesson_catalog.xp. هذا الملف يضيف العمود ويملؤه.
-- آمن: لا حذف، لا تغيير في تقدم المستخدمين أو أرصدتهم أو XP. قابل للتكرار.
-- ============================================================================
BEGIN;

ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS quiz_correct SMALLINT;
ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS quiz_options SMALLINT;
ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS est_seconds INTEGER;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_catalog_quiz_valid') THEN
    ALTER TABLE lesson_catalog ADD CONSTRAINT lesson_catalog_quiz_valid
      CHECK (xp >= 0 AND (quiz_correct IS NULL OR (quiz_correct >= 0 AND quiz_correct < quiz_options)));
  END IF;
END $$;

INSERT INTO lesson_catalog (lesson_id, course_id, position, xp, quiz_correct, quiz_options, est_seconds) VALUES
${rows.join(',\n')}
ON CONFLICT (lesson_id) DO UPDATE
  SET course_id = EXCLUDED.course_id, position = EXCLUDED.position, xp = EXCLUDED.xp,
      quiz_correct = EXCLUDED.quiz_correct, quiz_options = EXCLUDED.quiz_options,
      est_seconds = EXCLUDED.est_seconds, updated_at = NOW();

-- عدد الدروس الحقيقي لكل دورة (unlock_cost لا يتغير)
UPDATE course_coin_catalog c
SET total_lessons = sub.n
FROM (SELECT course_id, COUNT(*)::INTEGER AS n FROM lesson_catalog GROUP BY course_id) sub
WHERE sub.course_id = c.course_id AND c.total_lessons IS DISTINCT FROM sub.n;

-- متطلبات الدورات: الدورة السابقة في نفس المجال (النسبة المطلوبة في coin_config.progression)
CREATE TABLE IF NOT EXISTS course_prereqs (
  course_id TEXT PRIMARY KEY,
  requires_course_id TEXT NOT NULL,
  min_ratio NUMERIC(3, 2) CHECK (min_ratio IS NULL OR (min_ratio > 0 AND min_ratio <= 1)),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE course_prereqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS course_prereqs_read ON course_prereqs;
DROP POLICY IF EXISTS course_prereqs_admin_write ON course_prereqs;
CREATE POLICY course_prereqs_read ON course_prereqs FOR SELECT USING (true);
CREATE POLICY course_prereqs_admin_write ON course_prereqs FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO course_prereqs (course_id, requires_course_id) VALUES
${prereqRows.join(',\n')}
ON CONFLICT (course_id) DO UPDATE SET requires_course_id = EXCLUDED.requires_course_id, updated_at = NOW();

COMMIT;
`;

const out = join(__dirname, '../../supabase/migrations/20261003000000_progression_catalog.sql');
writeFileSync(out, sql);
console.log(`wrote ${out}: ${lessons.length} lessons, ${prereqRows.length} prereqs`);
