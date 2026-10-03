/**
 * يولّد migration تحفظ كتالوج الدروس الفعلي في قاعدة البيانات.
 *   npx tsx scripts/curriculum/gen-lesson-catalog.ts
 * الناتج: supabase/migrations/20261001020000_curriculum_lesson_catalog.sql
 * لا تُنشر تلقائياً — راجعها ثم: npx supabase db push
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_COURSES, ALL_LESSONS } from '../../src/constants/courseData';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const courseIds = new Set(ALL_COURSES.map((c) => c.id));
const lessons = ALL_LESSONS.filter((l) => courseIds.has(l.courseId)).sort((a, b) => a.courseId.localeCompare(b.courseId) || a.order - b.order);
const counts = new Map<string, number>();
for (const l of lessons) counts.set(l.courseId, (counts.get(l.courseId) ?? 0) + 1);

const values = lessons.map((l) => `  (${q(l.id)}, ${q(l.courseId)}, ${l.order}, ${l.xpReward})`).join(',\n');
const ids = lessons.map((l) => q(l.id)).join(', ');

const sql = `-- ============================================================================
-- كتالوج الدروس + مزامنة تقدم المستخدمين بعد مراجعة المناهج
-- مولَّد تلقائياً بـ scripts/curriculum/gen-lesson-catalog.ts — لا تعدّله يدوياً
-- عدد الدروس: ${lessons.length} في ${counts.size} دورة
--
-- آمن:
--   * لا يحذف أي صف من تقدم المستخدمين ولا من النقاط ولا التحديات.
--   * unlock_cost (السعر الذي يدفعه المستخدم) لا يتغير؛ total_lessons فقط.
--   * إعادة التشغيل آمنة (idempotent).
-- ============================================================================
BEGIN;

-- 1) كتالوج الدروس الفعلي
CREATE TABLE IF NOT EXISTS lesson_catalog (
  lesson_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- XP الدرس كما في المحتوى: مصدر XP الدروس على السيرفر (لا يُقبل XP يرسله العميل)
ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0);
CREATE INDEX IF NOT EXISTS lesson_catalog_course_idx ON lesson_catalog(course_id);

ALTER TABLE lesson_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lesson_catalog_read ON lesson_catalog;
DROP POLICY IF EXISTS lesson_catalog_admin_write ON lesson_catalog;
CREATE POLICY lesson_catalog_read ON lesson_catalog FOR SELECT USING (true);
CREATE POLICY lesson_catalog_admin_write ON lesson_catalog FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO lesson_catalog (lesson_id, course_id, position, xp) VALUES
${values}
ON CONFLICT (lesson_id) DO UPDATE
  SET course_id = EXCLUDED.course_id, position = EXCLUDED.position, xp = EXCLUDED.xp, updated_at = NOW();

-- دروس لم تعد في المحتوى تُزال من الكتالوج فقط (لا من تقدم المستخدمين)
DELETE FROM lesson_catalog WHERE lesson_id NOT IN (${ids});

-- 2) المعرّف المكرر cpp-adv-4
-- كان نفس المعرّف لدرسين (cpp-oop: تعدد الأشكال، cpp-advanced: حاويات STL)، والتقدم مفتاحه
-- (user_id, lesson_id) فكان صف واحد يُستبدل course_id فيه بآخر درس حُفظ.
-- درس cpp-advanced صار cpp-advanced-stl-containers: ننقل صفوفه فقط.
UPDATE user_lesson_progress p
SET lesson_id = 'cpp-advanced-stl-containers', updated_at = NOW()
WHERE p.lesson_id = 'cpp-adv-4'
  AND p.course_id = 'cpp-advanced'
  AND NOT EXISTS (
    SELECT 1 FROM user_lesson_progress x
    WHERE x.user_id = p.user_id AND x.lesson_id = 'cpp-advanced-stl-containers'
  );

-- 3) دروس نُقلت لدورة أخرى (js-adv-1/2 ← web-js-basics، rn-state-001/rn-navigation-001 ← rn-basics):
-- نصحح course_id في التقدم ليطابق الكتالوج (التحديات course_id = 'challenges' لا تُلمس)
UPDATE user_lesson_progress p
SET course_id = lc.course_id, updated_at = NOW()
FROM lesson_catalog lc
WHERE lc.lesson_id = p.lesson_id
  AND p.course_id IS DISTINCT FROM lc.course_id
  AND p.course_id <> 'challenges'
  -- صف cpp-adv-4 القديم الذي لم يُنقل في الخطوة 2 (للمستخدم صف للدرس الجديد مسبقاً) يبقى كما هو:
  -- نقله إلى cpp-oop يمنح المستخدم درس cpp-oop لم يكمله
  AND NOT (p.lesson_id = 'cpp-adv-4' AND p.course_id = 'cpp-advanced');

-- 4) عدد الدروس الحقيقي لكل دورة (كان مثلاً 12 لـ HTML و 8 فقط موجودة ← الدورة لا تكتمل)
UPDATE course_coin_catalog c
SET total_lessons = sub.n
FROM (SELECT course_id, COUNT(*)::INTEGER AS n FROM lesson_catalog GROUP BY course_id) sub
WHERE sub.course_id = c.course_id AND c.total_lessons IS DISTINCT FROM sub.n;

-- اقتراح السعر يُحدَّث فقط؛ unlock_cost لا يتغير إلا بقرار المشرف (admin_apply_suggested_prices)
UPDATE course_coin_catalog
SET suggested_cost = coins_suggest_price(difficulty, total_lessons, has_project, demand_factor);

-- 5) مكافأة إكمال الدورة: تُحسب دروس الكتالوج فقط (لا معرّفات مختلقة يرسلها العميل)
CREATE OR REPLACE FUNCTION coins_reward_course_completion(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_c course_coin_catalog%ROWTYPE;
  v_total INTEGER;
  v_done INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  SELECT * INTO v_c FROM course_coin_catalog WHERE course_id = p_course_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_course');
  END IF;
  IF v_c.unlock_cost > 0 AND NOT EXISTS (
    SELECT 1 FROM user_unlocked_courses WHERE user_id = v_uid AND course_id = p_course_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'locked');
  END IF;

  SELECT COUNT(*) INTO v_total FROM lesson_catalog WHERE course_id = p_course_id;
  IF v_total = 0 THEN
    v_total := v_c.total_lessons;   -- احتياط إن لم يُملأ الكتالوج
  END IF;

  SELECT COUNT(DISTINCT p.lesson_id) INTO v_done
  FROM user_lesson_progress p
  JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = p_course_id
  WHERE p.user_id = v_uid AND p.completed = TRUE;

  IF v_done < v_total THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed', 'completed', v_done, 'total', v_total);
  END IF;

  v_amount := COALESCE((_coin_cfg('course_completion_rewards')->>v_c.difficulty)::INTEGER, 30);
  RETURN _coins_apply(v_uid, v_amount, 'course_complete', 'إكمال دورة: ' || v_c.title,
                      p_course_id, 'course_complete:' || p_course_id)
         || jsonb_build_object('reward', v_amount);
END;
$$;

REVOKE ALL ON FUNCTION coins_reward_course_completion(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coins_reward_course_completion(TEXT) TO authenticated;

COMMIT;
`;

const out = join(__dirname, '..', '..', 'supabase', 'migrations', '20261001020000_curriculum_lesson_catalog.sql');
writeFileSync(out, sql);
console.log(`كُتب ${out}`);
console.log([...counts].map(([c, n]) => `${c}=${n}`).join(' '));
