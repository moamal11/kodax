-- ============================================================================
-- كتالوج التحديات على السيرفر + تشديد مكافأة التحديات
-- (مولّد من scripts/challenge-audit/gen-catalog-migration.ts — 169 تحدياً)
--
-- المشكلة: coins_reward_challenge كانت تأخذ الصعوبة من العميل (يمكن ادعاء "hard"
-- لتحدٍ سهل) وتقبل أي معرّف تحدٍ (يمكن اختلاق معرّفات حتى الحد اليومي).
-- الحل: الصعوبة تُقرأ من الكتالوج، والمعرّف غير الموجود يُرفض.
-- آمن: إضافة جدول + استبدال الدالة فقط. لا حذف لأي بيانات.
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_catalog (
  id TEXT PRIMARY KEY,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE challenge_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS challenge_catalog_read ON challenge_catalog;
DROP POLICY IF EXISTS challenge_catalog_admin_write ON challenge_catalog;
CREATE POLICY challenge_catalog_read ON challenge_catalog FOR SELECT USING (true);
CREATE POLICY challenge_catalog_admin_write ON challenge_catalog FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO challenge_catalog (id, difficulty) VALUES
  ('ch-1', 'easy'),
  ('ch-2', 'easy'),
  ('ch-3', 'easy'),
  ('ch-4', 'medium'),
  ('ch-5', 'medium'),
  ('ch-6', 'medium'),
  ('ch-7', 'medium'),
  ('ch-8', 'medium'),
  ('ch-9', 'hard'),
  ('css-ch-beg-1', 'easy'),
  ('css-ch-beg-2', 'easy'),
  ('css-ch-beg-3', 'easy'),
  ('css-ch-int-1', 'medium'),
  ('css-ch-int-2', 'medium'),
  ('css-ch-int-3', 'medium'),
  ('css-ch-int-4', 'medium'),
  ('css-ch-1', 'easy'),
  ('css-ch-2', 'medium'),
  ('css-ch-3', 'medium'),
  ('css-ch-4', 'hard'),
  ('css-ch-5', 'hard'),
  ('py-ch-beg-1', 'easy'),
  ('py-ch-beg-2', 'easy'),
  ('py-ch-beg-3', 'easy'),
  ('py-ch-beg-4', 'easy'),
  ('py-ch-beg-5', 'easy'),
  ('py-ch-int-1', 'medium'),
  ('py-ch-int-2', 'medium'),
  ('py-ch-int-3', 'medium'),
  ('py-ch-int-4', 'medium'),
  ('py-ch-int-5', 'medium'),
  ('py-ch-adv-1', 'hard'),
  ('py-ch-adv-2', 'hard'),
  ('py-ch-adv-3', 'hard'),
  ('cpp-ch-beg-1', 'easy'),
  ('cpp-ch-beg-2', 'easy'),
  ('cpp-ch-beg-3', 'easy'),
  ('cpp-ch-beg-4', 'easy'),
  ('cpp-ch-beg-5', 'easy'),
  ('cpp-ch-int-1', 'medium'),
  ('cpp-ch-int-2', 'medium'),
  ('cpp-ch-int-3', 'medium'),
  ('cpp-ch-int-4', 'medium'),
  ('cpp-ch-int-5', 'medium'),
  ('cpp-ch-1', 'easy'),
  ('cpp-ch-2', 'medium'),
  ('cpp-ch-3', 'medium'),
  ('cyber-ch-1', 'easy'),
  ('cyber-ch-2', 'medium'),
  ('cyber-ch-3', 'medium'),
  ('js-ch-beg-1', 'easy'),
  ('js-ch-beg-2', 'easy'),
  ('js-ch-beg-3', 'easy'),
  ('js-ch-beg-4', 'easy'),
  ('js-ch-beg-5', 'easy'),
  ('js-ch-int-1', 'medium'),
  ('js-ch-int-2', 'medium'),
  ('js-ch-int-3', 'medium'),
  ('js-ch-int-4', 'medium'),
  ('js-ch-int-5', 'medium'),
  ('js-challenge-1', 'easy'),
  ('js-challenge-2', 'easy'),
  ('js-challenge-3', 'medium'),
  ('js-challenge-4', 'medium'),
  ('js-challenge-5', 'hard'),
  ('react-ch-beg-1', 'easy'),
  ('react-ch-beg-2', 'easy'),
  ('react-ch-beg-3', 'easy'),
  ('react-ch-beg-4', 'easy'),
  ('react-ch-beg-5', 'easy'),
  ('react-ch-int-1', 'medium'),
  ('react-ch-int-2', 'medium'),
  ('react-ch-int-3', 'medium'),
  ('react-ch-int-4', 'medium'),
  ('react-ch-int-5', 'medium'),
  ('react-challenge-1', 'easy'),
  ('react-challenge-2', 'medium'),
  ('react-challenge-3', 'medium'),
  ('react-ch-4', 'medium'),
  ('react-ch-5', 'medium'),
  ('react-ch-6', 'medium'),
  ('react-ch-7', 'hard'),
  ('ai-challenge-1', 'easy'),
  ('ai-challenge-2', 'medium'),
  ('ai-challenge-3', 'medium'),
  ('ai-challenge-4', 'medium'),
  ('ai-challenge-5', 'hard'),
  ('ai-challenge-6', 'hard'),
  ('ai-challenge-7', 'medium'),
  ('ai-challenge-8', 'hard'),
  ('deploy-challenge-1', 'easy'),
  ('deploy-challenge-2', 'easy'),
  ('deploy-challenge-3', 'medium'),
  ('deploy-challenge-4', 'hard'),
  ('rn-challenge-001', 'easy'),
  ('rn-challenge-002', 'easy'),
  ('rn-challenge-003', 'medium'),
  ('rn-challenge-004', 'hard'),
  ('rn-challenge-005', 'hard'),
  ('flutter-challenge-001', 'easy'),
  ('flutter-challenge-002', 'medium'),
  ('flutter-challenge-003', 'hard'),
  ('flutter-challenge-004', 'hard'),
  ('flutter-challenge-005', 'hard'),
  ('backend-ch-1', 'medium'),
  ('backend-ch-2', 'medium'),
  ('backend-ch-3', 'medium'),
  ('backend-ch-4', 'medium'),
  ('backend-ch-5', 'medium'),
  ('backend-ch-6', 'hard'),
  ('backend-ch-7', 'medium'),
  ('backend-ch-8', 'hard'),
  ('html-ch-form-001', 'medium'),
  ('html-ch-semantic-001', 'easy'),
  ('html-ch-table-001', 'easy'),
  ('html-ch-media-001', 'easy'),
  ('html-ch-nav-001', 'medium'),
  ('html-ch-faq-001', 'medium'),
  ('git-ch-basics-001', 'easy'),
  ('json-ch-001', 'easy'),
  ('web-ch-slugify-001', 'easy'),
  ('web-ch-querystring-001', 'medium'),
  ('web-ch-truncate-001', 'easy'),
  ('web-ch-camelcase-001', 'easy'),
  ('web-ch-flatten-obj-001', 'medium'),
  ('web-ch-htmlentity-001', 'easy'),
  ('web-ch-debounce-impl-001', 'medium'),
  ('cyber-ch-http-001', 'easy'),
  ('cyber-ch-csrf-001', 'medium'),
  ('cyber-ch-hash-001', 'medium'),
  ('cyber-ch-xss-001', 'medium'),
  ('cyber-ch-base64-001', 'medium'),
  ('cyber-ch-vigenere-001', 'medium'),
  ('cyber-ch-ipvalidator-001', 'easy'),
  ('cyber-ch-urlparse-001', 'medium'),
  ('cyber-ch-emailval-001', 'easy'),
  ('cyber-ch-hash-compare-001', 'medium'),
  ('cyber-ch-jwt-decode-001', 'medium'),
  ('cyber-ch-bruteforce-001', 'easy'),
  ('cyber-ch-port-001', 'easy'),
  ('cyber-ch-xor-001', 'medium'),
  ('rn-ch-todo-001', 'medium'),
  ('flutter-ch-counter-001', 'medium'),
  ('algo-ch-linear-001', 'easy'),
  ('algo-ch-binary-001', 'easy'),
  ('algo-ch-selection-001', 'easy'),
  ('algo-ch-insertion-001', 'easy'),
  ('algo-ch-max-001', 'easy'),
  ('algo-ch-merge-001', 'medium'),
  ('algo-ch-quick-001', 'medium'),
  ('algo-ch-kadane-001', 'medium'),
  ('algo-ch-anagram-001', 'medium'),
  ('algo-ch-twopointer-001', 'medium'),
  ('algo-ch-lcs-001', 'hard'),
  ('algo-ch-knapsack-001', 'hard'),
  ('algo-ch-dijkstra-001', 'hard'),
  ('algo-ch-dp-coins-001', 'hard'),
  ('ds-ch-stack-001', 'easy'),
  ('ds-ch-queue-001', 'easy'),
  ('ds-ch-hashtable-001', 'easy'),
  ('ds-ch-set-001', 'easy'),
  ('ds-ch-linkedlist-001', 'easy'),
  ('ds-ch-minheap-001', 'medium'),
  ('ds-ch-treetraversal-001', 'medium'),
  ('ds-ch-bfs-001', 'medium'),
  ('ds-ch-dfs-001', 'medium'),
  ('ds-ch-trie-001', 'medium'),
  ('ds-ch-lru-001', 'hard'),
  ('ds-ch-graph-cycle-001', 'hard')
ON CONFLICT (id) DO UPDATE SET difficulty = EXCLUDED.difficulty, updated_at = now();

-- نفس التوقيع (توافق مع التطبيق الحالي)؛ p_difficulty يُتجاهل لصالح الكتالوج
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
