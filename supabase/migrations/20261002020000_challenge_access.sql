-- ============================================================================
-- فرض قفل التحديات على السيرفر
-- (مولّد من scripts/challenge-audit/gen-challenge-access-migration.ts — لا تعدّله يدوياً)
--
-- قبل هذا الملف: التطبيق يمنع فتح التحدي المقفول، لكن verify-challenge و record_challenge_submission
-- لا تتحققان، فمن يستدعي الدالة مباشرة يحصل على الإكمال و XP والكوينات.
--
-- بعد هذا الملف:
--   * challenge_catalog.required_course_id: الدورة المطلوبة (NULL = تحدٍ مجاني)، بنفس منطق التطبيق.
--     التحديات: 169، المقفولة خلف دورة: 95، المجانية: 74.
--   * الوصول يُحدَّد من بيانات السيرفر فقط: user_unlocked_courses (تُكتب عبر coins_unlock_course /
--     coins_unlock_field / المشرف)، أو دورة سعرها الحالي 0 في course_coin_catalog، أو مشرف.
--   * record_challenge_submission لا تسجّل إكمالاً ولا XP لتحدٍ مقفول، و XP التحديات يمر عبر
--     xp_awards (مرة واحدة لكل تحدٍ).
--   * coins_reward_challenge ترفض تحدياً مقفولاً (الحد اليومي ومفتاح عدم التكرار كما هما).
--
-- يعتمد على: 20261001010000 (record_challenge_submission) و 20261002010000 (_xp_award).
-- آمن: لا يحذف أي بيانات. قابل للتكرار.
-- ============================================================================
BEGIN;

-- 1) الدورة المطلوبة لكل تحدٍ
ALTER TABLE challenge_catalog ADD COLUMN IF NOT EXISTS required_course_id TEXT;

UPDATE challenge_catalog c
SET required_course_id = v.req, updated_at = now()
FROM (VALUES
  ('ch-1', NULL),
  ('ch-2', NULL),
  ('ch-3', NULL),
  ('ch-4', NULL),
  ('ch-5', NULL),
  ('ch-6', NULL),
  ('ch-7', NULL),
  ('ch-8', NULL),
  ('ch-9', NULL),
  ('css-ch-beg-1', NULL),
  ('css-ch-beg-2', NULL),
  ('css-ch-beg-3', NULL),
  ('css-ch-int-1', NULL),
  ('css-ch-int-2', NULL),
  ('css-ch-int-3', 'web-css-advanced'),
  ('css-ch-int-4', 'web-css-advanced'),
  ('css-ch-1', 'web-css-advanced'),
  ('css-ch-2', 'web-css-advanced'),
  ('css-ch-3', 'web-css-advanced'),
  ('css-ch-4', 'web-css-advanced'),
  ('css-ch-5', 'web-css-advanced'),
  ('py-ch-beg-1', NULL),
  ('py-ch-beg-2', NULL),
  ('py-ch-beg-3', NULL),
  ('py-ch-beg-4', NULL),
  ('py-ch-beg-5', NULL),
  ('py-ch-int-1', NULL),
  ('py-ch-int-2', NULL),
  ('py-ch-int-3', NULL),
  ('py-ch-int-4', NULL),
  ('py-ch-int-5', NULL),
  ('py-ch-adv-1', NULL),
  ('py-ch-adv-2', NULL),
  ('py-ch-adv-3', NULL),
  ('cpp-ch-beg-1', NULL),
  ('cpp-ch-beg-2', NULL),
  ('cpp-ch-beg-3', NULL),
  ('cpp-ch-beg-4', NULL),
  ('cpp-ch-beg-5', NULL),
  ('cpp-ch-int-1', NULL),
  ('cpp-ch-int-2', 'cpp-pointers'),
  ('cpp-ch-int-3', 'cpp-pointers'),
  ('cpp-ch-int-4', 'cpp-pointers'),
  ('cpp-ch-int-5', 'cpp-pointers'),
  ('cpp-ch-1', 'cpp-pointers'),
  ('cpp-ch-2', 'cpp-pointers'),
  ('cpp-ch-3', 'cpp-pointers'),
  ('cyber-ch-1', NULL),
  ('cyber-ch-2', NULL),
  ('cyber-ch-3', NULL),
  ('js-ch-beg-1', NULL),
  ('js-ch-beg-2', NULL),
  ('js-ch-beg-3', NULL),
  ('js-ch-beg-4', NULL),
  ('js-ch-beg-5', NULL),
  ('js-ch-int-1', NULL),
  ('js-ch-int-2', NULL),
  ('js-ch-int-3', NULL),
  ('js-ch-int-4', NULL),
  ('js-ch-int-5', NULL),
  ('js-challenge-1', NULL),
  ('js-challenge-2', NULL),
  ('js-challenge-3', 'web-js-basics'),
  ('js-challenge-4', 'web-js-basics'),
  ('js-challenge-5', 'web-js-basics'),
  ('react-ch-beg-1', NULL),
  ('react-ch-beg-2', NULL),
  ('react-ch-beg-3', NULL),
  ('react-ch-beg-4', NULL),
  ('react-ch-beg-5', NULL),
  ('react-ch-int-1', NULL),
  ('react-ch-int-2', NULL),
  ('react-ch-int-3', NULL),
  ('react-ch-int-4', 'web-react-intro'),
  ('react-ch-int-5', 'web-react-intro'),
  ('react-challenge-1', 'web-react-intro'),
  ('react-challenge-2', 'web-react-intro'),
  ('react-challenge-3', 'web-react-intro'),
  ('react-ch-4', 'web-react-intro'),
  ('react-ch-5', 'web-react-intro'),
  ('react-ch-6', 'web-react-intro'),
  ('react-ch-7', 'web-react-intro'),
  ('ai-challenge-1', NULL),
  ('ai-challenge-2', NULL),
  ('ai-challenge-3', NULL),
  ('ai-challenge-4', NULL),
  ('ai-challenge-5', NULL),
  ('ai-challenge-6', 'ai-ml-basics'),
  ('ai-challenge-7', 'ai-ml-basics'),
  ('ai-challenge-8', 'ai-ml-basics'),
  ('deploy-challenge-1', NULL),
  ('deploy-challenge-2', 'web-deployment'),
  ('deploy-challenge-3', 'web-deployment'),
  ('deploy-challenge-4', NULL),
  ('rn-challenge-001', 'rn-advanced'),
  ('rn-challenge-002', 'rn-advanced'),
  ('rn-challenge-003', 'rn-advanced'),
  ('rn-challenge-004', 'rn-advanced'),
  ('rn-challenge-005', 'rn-advanced'),
  ('flutter-challenge-001', NULL),
  ('flutter-challenge-002', NULL),
  ('flutter-challenge-003', NULL),
  ('flutter-challenge-004', 'flutter-advanced'),
  ('flutter-challenge-005', 'flutter-advanced'),
  ('backend-ch-1', NULL),
  ('backend-ch-2', NULL),
  ('backend-ch-3', NULL),
  ('backend-ch-4', NULL),
  ('backend-ch-5', 'backend-rest-api'),
  ('backend-ch-6', 'backend-rest-api'),
  ('backend-ch-7', 'backend-rest-api'),
  ('backend-ch-8', 'backend-rest-api'),
  ('html-ch-form-001', NULL),
  ('html-ch-semantic-001', NULL),
  ('html-ch-table-001', 'web-css-advanced'),
  ('html-ch-media-001', 'web-css-advanced'),
  ('html-ch-nav-001', 'web-css-advanced'),
  ('html-ch-faq-001', 'web-css-advanced'),
  ('git-ch-basics-001', NULL),
  ('json-ch-001', 'web-js-basics'),
  ('web-ch-slugify-001', 'web-js-basics'),
  ('web-ch-querystring-001', 'web-js-basics'),
  ('web-ch-truncate-001', 'web-js-basics'),
  ('web-ch-camelcase-001', 'web-js-basics'),
  ('web-ch-flatten-obj-001', 'web-js-basics'),
  ('web-ch-htmlentity-001', 'web-js-basics'),
  ('web-ch-debounce-impl-001', 'web-js-basics'),
  ('cyber-ch-http-001', 'cyber-network'),
  ('cyber-ch-csrf-001', 'cyber-network'),
  ('cyber-ch-hash-001', 'cyber-network'),
  ('cyber-ch-xss-001', 'cyber-network'),
  ('cyber-ch-base64-001', 'cyber-network'),
  ('cyber-ch-vigenere-001', 'cyber-network'),
  ('cyber-ch-ipvalidator-001', 'cyber-network'),
  ('cyber-ch-urlparse-001', 'cyber-network'),
  ('cyber-ch-emailval-001', 'cyber-network'),
  ('cyber-ch-hash-compare-001', 'cyber-network'),
  ('cyber-ch-jwt-decode-001', 'cyber-network'),
  ('cyber-ch-bruteforce-001', 'cyber-network'),
  ('cyber-ch-port-001', 'cyber-network'),
  ('cyber-ch-xor-001', 'cyber-network'),
  ('rn-ch-todo-001', NULL),
  ('flutter-ch-counter-001', 'flutter-advanced'),
  ('algo-ch-linear-001', 'py-data-structures'),
  ('algo-ch-binary-001', 'py-data-structures'),
  ('algo-ch-selection-001', 'py-data-structures'),
  ('algo-ch-insertion-001', 'py-data-structures'),
  ('algo-ch-max-001', 'py-data-structures'),
  ('algo-ch-merge-001', 'py-data-structures'),
  ('algo-ch-quick-001', 'py-data-structures'),
  ('algo-ch-kadane-001', 'py-data-structures'),
  ('algo-ch-anagram-001', 'py-data-structures'),
  ('algo-ch-twopointer-001', 'py-data-structures'),
  ('algo-ch-lcs-001', 'py-data-structures'),
  ('algo-ch-knapsack-001', 'py-data-structures'),
  ('algo-ch-dijkstra-001', 'py-data-structures'),
  ('algo-ch-dp-coins-001', 'py-data-structures'),
  ('ds-ch-stack-001', 'py-data-structures'),
  ('ds-ch-queue-001', 'py-data-structures'),
  ('ds-ch-hashtable-001', 'py-data-structures'),
  ('ds-ch-set-001', 'py-data-structures'),
  ('ds-ch-linkedlist-001', 'py-data-structures'),
  ('ds-ch-minheap-001', 'py-data-structures'),
  ('ds-ch-treetraversal-001', 'py-data-structures'),
  ('ds-ch-bfs-001', 'py-data-structures'),
  ('ds-ch-dfs-001', 'py-data-structures'),
  ('ds-ch-trie-001', 'py-data-structures'),
  ('ds-ch-lru-001', 'py-data-structures'),
  ('ds-ch-graph-cycle-001', 'py-data-structures')
) AS v(id, req)
WHERE c.id = v.id AND c.required_course_id IS DISTINCT FROM v.req;

-- 2) هل يملك المستخدم الوصول إلى التحدي؟ (بيانات السيرفر فقط)
CREATE OR REPLACE FUNCTION _challenge_accessible(p_user UUID, p_challenge_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM challenge_catalog ch
    WHERE ch.id = p_challenge_id
      AND (
        ch.required_course_id IS NULL
        OR EXISTS (SELECT 1 FROM user_unlocked_courses u
                   WHERE u.user_id = p_user AND u.course_id = ch.required_course_id)
        OR EXISTS (SELECT 1 FROM course_coin_catalog cc
                   WHERE cc.course_id = ch.required_course_id AND cc.unlock_cost <= 0)
        OR is_admin(p_user)
      )
  );
$$;
REVOKE ALL ON FUNCTION _challenge_accessible(UUID, TEXT) FROM PUBLIC, anon, authenticated;

-- للدالة verify-challenge (service_role) قبل تشغيل كود المستخدم
CREATE OR REPLACE FUNCTION challenge_access_check(p_user_id UUID, p_challenge_id TEXT)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'allowed', _challenge_accessible(p_user_id, p_challenge_id),
    'required_course_id', (SELECT required_course_id FROM challenge_catalog WHERE id = p_challenge_id)
  );
$$;
REVOKE ALL ON FUNCTION challenge_access_check(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION challenge_access_check(UUID, TEXT) TO service_role;

-- 3) تسجيل المحاولة والإكمال (service_role فقط) — مع فرض القفل و XP عبر xp_awards
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
  v_xp INTEGER := 0;
BEGIN
  SELECT points INTO v_points FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_points IS NULL THEN
    RAISE EXCEPTION 'unknown challenge %', p_challenge_id USING ERRCODE = '22023';
  END IF;

  -- القفل يُفرض هنا أيضاً (حتى لو استُدعيت الدالة من مسار آخر غير verify-challenge)
  IF NOT _challenge_accessible(p_user_id, p_challenge_id) THEN
    RETURN jsonb_build_object('recorded', false, 'first_time', false, 'xp_awarded', 0, 'locked', true);
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
    -- مرة واحدة لكل تحدٍ (xp_awards) حتى لو حُذف صف التقدم لاحقاً
    v_xp := _xp_award(p_user_id, 'challenge', p_challenge_id, v_points);
  END IF;

  RETURN jsonb_build_object(
    'recorded', true,
    'first_time', COALESCE(v_first, FALSE),
    'xp_awarded', v_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) TO service_role;

-- 4) كوينات التحدي: نفس الدالة السابقة + رفض التحدي المقفول
CREATE OR REPLACE FUNCTION coins_reward_challenge(p_challenge_id TEXT, p_difficulty TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('challenge_rewards');
  v_cap INTEGER := COALESCE((v_cfg->>'daily_cap')::INTEGER, 60);
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_difficulty TEXT;
  v_earned INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  SELECT difficulty INTO v_difficulty FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_difficulty IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid');
  END IF;

  IF NOT _challenge_accessible(v_uid, p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'locked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_lesson_progress
                 WHERE user_id = v_uid AND lesson_id = p_challenge_id
                   AND course_id = 'challenges' AND completed = TRUE) THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed');
  END IF;

  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  SELECT COALESCE(SUM(amount), 0) INTO v_earned FROM point_transactions
  WHERE user_id = v_uid AND source = 'challenge'
    AND (created_at AT TIME ZONE v_tz)::date = v_today;

  v_amount := LEAST(COALESCE((v_cfg->>v_difficulty)::INTEGER, 5), v_cap - v_earned);
  IF v_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_cap', 'cap', v_cap);
  END IF;

  RETURN _coins_apply(v_uid, v_amount, 'challenge', 'حل تحدي', p_challenge_id,
                      'challenge:' || p_challenge_id) || jsonb_build_object('reward', v_amount);
END;
$$;
REVOKE ALL ON FUNCTION coins_reward_challenge(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coins_reward_challenge(TEXT, TEXT) TO authenticated;

COMMIT;
