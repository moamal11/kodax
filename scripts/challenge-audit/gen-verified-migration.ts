/**
 * يولّد migration التحقق من التحديات على السيرفر.
 * التشغيل: npx tsx scripts/challenge-audit/gen-verified-migration.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const rows = ALL_CHALLENGES.map((c) => `  (${q(c.id)}, ${q(c.difficulty)}, ${Math.max(0, Math.round(c.points || 0))})`).join(',\n');
// أعلى XP يمنحه درس عادي (الـXP للتحديات صار يُمنح على السيرفر فقط)
const MAX_LESSON_XP = 350;

const sql = `-- ============================================================================
-- التحقق من حلول التحديات على السيرفر + إغلاق كتابة الإكمال من العميل
-- (مولّد من scripts/challenge-audit/gen-verified-migration.ts)
--
-- ما كان موجوداً في الإنتاج:
--   * user_lesson_progress بدون RLS ومع GRANT ALL لـ anon: أي شخص بمفتاح anon
--     (الموجود داخل التطبيق) يستطيع قراءة/تعديل/حذف تقدم أي مستخدم وتزوير إكمال التحديات.
--   * update_user_xp(user_id, xp_amount) SECURITY DEFINER بلا أي فحص: يغيّر XP أي مستخدم بأي قيمة.
--   * جداول محتوى (achievements, badges, challenges, programming_fields) بدون RLS ومع كتابة لـ anon.
--
-- بعد هذا الملف:
--   * إكمال التحديات يُكتب فقط عبر record_challenge_submission (service_role فقط)،
--     التي تستدعيها دالة verify-challenge بعد تشغيل اختبارات التحدي على السيرفر.
--   * العميل يكتب تقدم الدروس العادية لنفسه فقط، ولا يستطيع لمس صفوف التحديات.
--   * update_user_xp: للمستخدم نفسه فقط، ضمن حد XP الدرس.
-- آمن: لا يحذف أي بيانات. الصفوف الموجودة تبقى كما هي.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) نقاط التحديات في الكتالوج (مصدر XP على السيرفر)
-- ---------------------------------------------------------------------------
ALTER TABLE challenge_catalog ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 0);

INSERT INTO challenge_catalog (id, difficulty, points) VALUES
${rows}
ON CONFLICT (id) DO UPDATE SET difficulty = EXCLUDED.difficulty, points = EXCLUDED.points, updated_at = now();

-- ---------------------------------------------------------------------------
-- 2) سجل محاولات التحقق (تدقيق + حد لعدد المحاولات)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  passed_tests INTEGER NOT NULL,
  total_tests INTEGER NOT NULL,
  all_passed BOOLEAN NOT NULL,
  code_sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_time ON challenge_submissions (user_id, created_at DESC);

ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON challenge_submissions FROM anon, authenticated;
GRANT SELECT ON challenge_submissions TO authenticated;
DROP POLICY IF EXISTS challenge_submissions_select_own ON challenge_submissions;
CREATE POLICY challenge_submissions_select_own ON challenge_submissions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- ---------------------------------------------------------------------------
-- 3) تسجيل المحاولة والإكمال (service_role فقط)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_challenge_submission(
  p_user_id UUID,
  p_challenge_id TEXT,
  p_passed_tests INTEGER,
  p_total_tests INTEGER,
  p_all_passed BOOLEAN,
  p_code_sha256 TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_points INTEGER;
  v_first BOOLEAN := FALSE;
BEGIN
  SELECT points INTO v_points FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_points IS NULL THEN
    RAISE EXCEPTION 'unknown challenge %', p_challenge_id USING ERRCODE = '22023';
  END IF;

  INSERT INTO challenge_submissions (user_id, challenge_id, passed_tests, total_tests, all_passed, code_sha256)
  VALUES (p_user_id, p_challenge_id, p_passed_tests, p_total_tests, p_all_passed, p_code_sha256);

  IF NOT p_all_passed THEN
    RETURN jsonb_build_object('recorded', false, 'first_time', false, 'xp_awarded', 0);
  END IF;

  -- إكمال لأول مرة فقط (صف جديد، أو صف غير مكتمل) — ذري ضد الطلبات المتزامنة
  INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at, updated_at)
  VALUES (p_user_id, p_challenge_id, 'challenges', TRUE, v_points, now(), now())
  ON CONFLICT (user_id, lesson_id) DO UPDATE
    SET completed = TRUE, course_id = 'challenges', xp_earned = EXCLUDED.xp_earned,
        completed_at = now(), updated_at = now()
    WHERE user_lesson_progress.completed IS DISTINCT FROM TRUE
       OR user_lesson_progress.course_id <> 'challenges'
  RETURNING TRUE INTO v_first;

  IF COALESCE(v_first, FALSE) THEN
    UPDATE profiles
    SET xp = COALESCE(xp, 0) + v_points,
        level = FLOOR(SQRT((COALESCE(xp, 0) + v_points) / 100)),
        updated_at = now()
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'recorded', true,
    'first_time', COALESCE(v_first, FALSE),
    'xp_awarded', CASE WHEN COALESCE(v_first, FALSE) THEN v_points ELSE 0 END
  );
END;
$$;

REVOKE ALL ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- 4) RLS على user_lesson_progress
-- ---------------------------------------------------------------------------
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON user_lesson_progress FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON user_lesson_progress FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_lesson_progress TO authenticated;

DROP POLICY IF EXISTS ulp_select_own ON user_lesson_progress;
DROP POLICY IF EXISTS ulp_insert_own_lessons ON user_lesson_progress;
DROP POLICY IF EXISTS ulp_update_own_lessons ON user_lesson_progress;
DROP POLICY IF EXISTS ulp_delete_own_lessons ON user_lesson_progress;

CREATE POLICY ulp_select_own ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- الدروس العادية فقط: لا course_id='challenges' ولا معرّف تحدٍ من الكتالوج
CREATE POLICY ulp_insert_own_lessons ON user_lesson_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND course_id <> 'challenges'
    AND NOT EXISTS (SELECT 1 FROM challenge_catalog c WHERE c.id = lesson_id)
  );

CREATE POLICY ulp_update_own_lessons ON user_lesson_progress
  FOR UPDATE
  USING (auth.uid() = user_id AND course_id <> 'challenges')
  WITH CHECK (
    auth.uid() = user_id
    AND course_id <> 'challenges'
    AND NOT EXISTS (SELECT 1 FROM challenge_catalog c WHERE c.id = lesson_id)
  );

-- حذف صف تحدٍ ثم إعادة حله كان سيعيد منح XP — الحذف للدروس فقط
CREATE POLICY ulp_delete_own_lessons ON user_lesson_progress
  FOR DELETE USING (auth.uid() = user_id AND course_id <> 'challenges');

-- ---------------------------------------------------------------------------
-- 5) update_user_xp: للمستخدم نفسه فقط وضمن حد XP الدرس
--    (نفس التوقيع والأسماء حتى لا يتعطل التطبيق الحالي)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_user_xp(user_id UUID, xp_amount INTEGER) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> update_user_xp.user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  IF xp_amount IS NULL OR xp_amount <= 0 OR xp_amount > ${MAX_LESSON_XP} THEN
    RAISE EXCEPTION 'invalid xp amount' USING ERRCODE = '22023';
  END IF;
  UPDATE profiles
  SET xp = COALESCE(xp, 0) + xp_amount,
      level = FLOOR(SQRT((COALESCE(xp, 0) + xp_amount) / 100)),
      updated_at = now()
  WHERE id = update_user_xp.user_id;
END;
$$;

REVOKE ALL ON FUNCTION update_user_xp(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_user_xp(UUID, INTEGER) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 6) جداول المحتوى: قراءة للجميع، كتابة للمشرفين فقط
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['achievements', 'badges', 'challenges', 'programming_fields'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      -- الكتابة للمشرفين تمر عبر RLS (is_admin)؛ anon لا يكتب إطلاقاً
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t);
      EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_read_all', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', t || '_read_all', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (is_admin()) WITH CHECK (is_admin())', t || '_admin_write', t);
    END IF;
  END LOOP;
END $$;
`;

const out = join(__dirname, '../../supabase/migrations/20261001010000_server_verified_challenges.sql');
writeFileSync(out, sql, 'utf8');
console.log('wrote', out, ALL_CHALLENGES.length, 'challenges');
