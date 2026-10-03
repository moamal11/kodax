-- ============================================================================
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
  ('ch-1', 'easy', 10),
  ('ch-2', 'easy', 15),
  ('ch-3', 'easy', 20),
  ('ch-4', 'medium', 30),
  ('ch-5', 'medium', 40),
  ('ch-6', 'medium', 50),
  ('ch-7', 'medium', 70),
  ('ch-8', 'medium', 80),
  ('ch-9', 'hard', 100),
  ('css-ch-beg-1', 'easy', 10),
  ('css-ch-beg-2', 'easy', 15),
  ('css-ch-beg-3', 'easy', 15),
  ('css-ch-int-1', 'medium', 25),
  ('css-ch-int-2', 'medium', 30),
  ('css-ch-int-3', 'medium', 35),
  ('css-ch-int-4', 'medium', 30),
  ('css-ch-1', 'easy', 15),
  ('css-ch-2', 'medium', 30),
  ('css-ch-3', 'medium', 35),
  ('css-ch-4', 'hard', 50),
  ('css-ch-5', 'hard', 60),
  ('py-ch-beg-1', 'easy', 15),
  ('py-ch-beg-2', 'easy', 15),
  ('py-ch-beg-3', 'easy', 10),
  ('py-ch-beg-4', 'easy', 15),
  ('py-ch-beg-5', 'easy', 15),
  ('py-ch-int-1', 'medium', 25),
  ('py-ch-int-2', 'medium', 30),
  ('py-ch-int-3', 'medium', 35),
  ('py-ch-int-4', 'medium', 25),
  ('py-ch-int-5', 'medium', 30),
  ('py-ch-adv-1', 'hard', 80),
  ('py-ch-adv-2', 'hard', 50),
  ('py-ch-adv-3', 'hard', 100),
  ('cpp-ch-beg-1', 'easy', 15),
  ('cpp-ch-beg-2', 'easy', 15),
  ('cpp-ch-beg-3', 'easy', 15),
  ('cpp-ch-beg-4', 'easy', 20),
  ('cpp-ch-beg-5', 'easy', 15),
  ('cpp-ch-int-1', 'medium', 35),
  ('cpp-ch-int-2', 'medium', 30),
  ('cpp-ch-int-3', 'medium', 40),
  ('cpp-ch-int-4', 'medium', 35),
  ('cpp-ch-int-5', 'medium', 35),
  ('cpp-ch-1', 'easy', 30),
  ('cpp-ch-2', 'medium', 50),
  ('cpp-ch-3', 'medium', 50),
  ('cyber-ch-1', 'easy', 30),
  ('cyber-ch-2', 'medium', 50),
  ('cyber-ch-3', 'medium', 50),
  ('js-ch-beg-1', 'easy', 15),
  ('js-ch-beg-2', 'easy', 15),
  ('js-ch-beg-3', 'easy', 15),
  ('js-ch-beg-4', 'easy', 10),
  ('js-ch-beg-5', 'easy', 10),
  ('js-ch-int-1', 'medium', 25),
  ('js-ch-int-2', 'medium', 30),
  ('js-ch-int-3', 'medium', 35),
  ('js-ch-int-4', 'medium', 40),
  ('js-ch-int-5', 'medium', 35),
  ('js-challenge-1', 'easy', 15),
  ('js-challenge-2', 'easy', 20),
  ('js-challenge-3', 'medium', 30),
  ('js-challenge-4', 'medium', 35),
  ('js-challenge-5', 'hard', 50),
  ('react-ch-beg-1', 'easy', 15),
  ('react-ch-beg-2', 'easy', 15),
  ('react-ch-beg-3', 'easy', 15),
  ('react-ch-beg-4', 'easy', 15),
  ('react-ch-beg-5', 'easy', 20),
  ('react-ch-int-1', 'medium', 30),
  ('react-ch-int-2', 'medium', 35),
  ('react-ch-int-3', 'medium', 35),
  ('react-ch-int-4', 'medium', 30),
  ('react-ch-int-5', 'medium', 35),
  ('react-challenge-1', 'easy', 25),
  ('react-challenge-2', 'medium', 35),
  ('react-challenge-3', 'medium', 45),
  ('react-ch-4', 'medium', 70),
  ('react-ch-5', 'medium', 80),
  ('react-ch-6', 'medium', 80),
  ('react-ch-7', 'hard', 100),
  ('ai-challenge-1', 'easy', 150),
  ('ai-challenge-2', 'medium', 200),
  ('ai-challenge-3', 'medium', 180),
  ('ai-challenge-4', 'medium', 200),
  ('ai-challenge-5', 'hard', 250),
  ('ai-challenge-6', 'hard', 300),
  ('ai-challenge-7', 'medium', 220),
  ('ai-challenge-8', 'hard', 280),
  ('deploy-challenge-1', 'easy', 100),
  ('deploy-challenge-2', 'easy', 40),
  ('deploy-challenge-3', 'medium', 60),
  ('deploy-challenge-4', 'hard', 80),
  ('rn-challenge-001', 'easy', 200),
  ('rn-challenge-002', 'easy', 150),
  ('rn-challenge-003', 'medium', 350),
  ('rn-challenge-004', 'hard', 500),
  ('rn-challenge-005', 'hard', 600),
  ('flutter-challenge-001', 'easy', 200),
  ('flutter-challenge-002', 'medium', 350),
  ('flutter-challenge-003', 'hard', 500),
  ('flutter-challenge-004', 'hard', 600),
  ('flutter-challenge-005', 'hard', 700),
  ('backend-ch-1', 'medium', 50),
  ('backend-ch-2', 'medium', 80),
  ('backend-ch-3', 'medium', 60),
  ('backend-ch-4', 'medium', 70),
  ('backend-ch-5', 'medium', 80),
  ('backend-ch-6', 'hard', 100),
  ('backend-ch-7', 'medium', 70),
  ('backend-ch-8', 'hard', 90),
  ('html-ch-form-001', 'medium', 60),
  ('html-ch-semantic-001', 'easy', 40),
  ('html-ch-table-001', 'easy', 30),
  ('html-ch-media-001', 'easy', 35),
  ('html-ch-nav-001', 'medium', 55),
  ('html-ch-faq-001', 'medium', 45),
  ('git-ch-basics-001', 'easy', 25),
  ('json-ch-001', 'easy', 20),
  ('web-ch-slugify-001', 'easy', 15),
  ('web-ch-querystring-001', 'medium', 30),
  ('web-ch-truncate-001', 'easy', 15),
  ('web-ch-camelcase-001', 'easy', 20),
  ('web-ch-flatten-obj-001', 'medium', 35),
  ('web-ch-htmlentity-001', 'easy', 15),
  ('web-ch-debounce-impl-001', 'medium', 35),
  ('cyber-ch-http-001', 'easy', 40),
  ('cyber-ch-csrf-001', 'medium', 60),
  ('cyber-ch-hash-001', 'medium', 70),
  ('cyber-ch-xss-001', 'medium', 60),
  ('cyber-ch-base64-001', 'medium', 20),
  ('cyber-ch-vigenere-001', 'medium', 35),
  ('cyber-ch-ipvalidator-001', 'easy', 20),
  ('cyber-ch-urlparse-001', 'medium', 30),
  ('cyber-ch-emailval-001', 'easy', 20),
  ('cyber-ch-hash-compare-001', 'medium', 30),
  ('cyber-ch-jwt-decode-001', 'medium', 35),
  ('cyber-ch-bruteforce-001', 'easy', 50),
  ('cyber-ch-port-001', 'easy', 15),
  ('cyber-ch-xor-001', 'medium', 30),
  ('rn-ch-todo-001', 'medium', 80),
  ('flutter-ch-counter-001', 'medium', 70),
  ('algo-ch-linear-001', 'easy', 15),
  ('algo-ch-binary-001', 'easy', 20),
  ('algo-ch-selection-001', 'easy', 20),
  ('algo-ch-insertion-001', 'easy', 20),
  ('algo-ch-max-001', 'easy', 15),
  ('algo-ch-merge-001', 'medium', 40),
  ('algo-ch-quick-001', 'medium', 45),
  ('algo-ch-kadane-001', 'medium', 40),
  ('algo-ch-anagram-001', 'medium', 30),
  ('algo-ch-twopointer-001', 'medium', 35),
  ('algo-ch-lcs-001', 'hard', 60),
  ('algo-ch-knapsack-001', 'hard', 70),
  ('algo-ch-dijkstra-001', 'hard', 80),
  ('algo-ch-dp-coins-001', 'hard', 60),
  ('ds-ch-stack-001', 'easy', 20),
  ('ds-ch-queue-001', 'easy', 20),
  ('ds-ch-hashtable-001', 'easy', 25),
  ('ds-ch-set-001', 'easy', 15),
  ('ds-ch-linkedlist-001', 'easy', 35),
  ('ds-ch-minheap-001', 'medium', 35),
  ('ds-ch-treetraversal-001', 'medium', 40),
  ('ds-ch-bfs-001', 'medium', 40),
  ('ds-ch-dfs-001', 'medium', 40),
  ('ds-ch-trie-001', 'medium', 50),
  ('ds-ch-lru-001', 'hard', 60),
  ('ds-ch-graph-cycle-001', 'hard', 55)
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
  IF xp_amount IS NULL OR xp_amount <= 0 OR xp_amount > 350 THEN
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
