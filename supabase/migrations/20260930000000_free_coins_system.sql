-- ============================================================================
-- Kodax — Free Coins System (replaces paid points / subscriptions)
-- ============================================================================
-- What this migration does:
--   1. Retires every payment / subscription write path (payment_orders,
--      user_subscriptions, subscriptions, receipts bucket, approve RPC).
--      Historical rows are KEPT untouched — nothing is deleted.
--   2. Locks the coin tables (user_points, point_transactions,
--      user_unlocked_courses, user_unlocked_sections) so the client can only
--      READ them. Every balance change now goes through SECURITY DEFINER RPCs
--      that derive the user from auth.uid() and prices/rewards from the server.
--   3. Adds: coin_config, course_coin_catalog (stable coin prices),
--      user_daily_rewards (7-day ladder), ad_reward_sessions (rewarded ads,
--      one-time sessions + optional AdMob server-side verification),
--      ai_daily_usage (AI fair-use quota, enforced by the ai-chat function).
--   4. Fixes user_roles having RLS disabled (anyone could grant themselves
--      admin through the REST API).
--
-- Safe to run more than once (idempotent). Run in the Supabase SQL editor or
-- with `supabase db push`.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Admin helper + user_roles hardening
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- SECURITY DEFINER + owner bypasses RLS → no policy recursion.
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid()) AND role = 'admin'
  );
END;
$$;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'user_roles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.policyname);
  END LOOP;
END $$;
CREATE POLICY user_roles_select_own_or_admin ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
-- No INSERT/UPDATE/DELETE policies: roles are granted from the SQL editor only.

-- ----------------------------------------------------------------------------
-- 1. Coin configuration (server-side source of truth for rewards)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coin_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO coin_config (key, value) VALUES
  ('ads', '{
      "reward_per_ad": 15,
      "daily_limit": 4,
      "daily_bonus": 20,
      "min_seconds_between_ads": 30,
      "min_seconds_to_complete": 5,
      "client_claim_enabled": true
   }'::jsonb),
  ('daily_ladder', '{
      "rewards": [5, 10, 15, 20, 25, 30, 50],
      "timezone": "Asia/Baghdad",
      "requires_activity": true
   }'::jsonb),
  ('challenge_rewards', '{"easy": 5, "medium": 10, "hard": 15, "daily_cap": 60}'::jsonb),
  ('course_completion_rewards', '{"beginner": 30, "intermediate": 50, "advanced": 75}'::jsonb),
  ('field_bundle', '{"discount": 0.15}'::jsonb),
  ('ai_quota', '{"chat": 30, "hint": 20, "explain": 15, "fix": 10, "solve": 5}'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE coin_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coin_config_read ON coin_config;
DROP POLICY IF EXISTS coin_config_admin_write ON coin_config;
CREATE POLICY coin_config_read ON coin_config FOR SELECT USING (true);
CREATE POLICY coin_config_admin_write ON coin_config FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION _coin_cfg(p_key TEXT)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT value FROM coin_config WHERE key = p_key), '{}'::jsonb);
$$;

CREATE OR REPLACE FUNCTION _coin_today()
RETURNS DATE LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (NOW() AT TIME ZONE COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad'))::date;
$$;

-- Admin restriction (for reward abuse). Reuses the existing
-- profiles.is_purchase_blocked flag that the admin panel toggles.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_purchase_blocked BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION _coins_restricted(p_user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_purchase_blocked FROM profiles WHERE id = p_user), FALSE);
$$;

-- ----------------------------------------------------------------------------
-- 2. Course coin catalog — stable prices
-- ----------------------------------------------------------------------------
-- Pricing formula (deterministic, explained in docs/COINS_SYSTEM.md):
--   beginner      → free (every field keeps a free entry course)
--   intermediate  → 40 + 8  × lessons
--   advanced      → 80 + 10 × lessons
--   + 20 if the course ends with a real project, × demand_factor (0.9–1.2)
--   rounded to the nearest 10, clamped to [50, 250].
-- `suggested_cost` is recomputed by the formula; `unlock_cost` (what users pay)
-- only changes when an admin explicitly calls admin_apply_suggested_prices().
CREATE TABLE IF NOT EXISTS course_coin_catalog (
  course_id TEXT PRIMARY KEY,
  field_id TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  total_lessons INTEGER NOT NULL CHECK (total_lessons > 0),
  has_project BOOLEAN NOT NULL DEFAULT FALSE,
  demand_factor NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (demand_factor BETWEEN 0.9 AND 1.2),
  unlock_cost INTEGER NOT NULL CHECK (unlock_cost >= 0),
  suggested_cost INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  price_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION coins_suggest_price(
  p_difficulty TEXT, p_lessons INTEGER, p_has_project BOOLEAN, p_demand NUMERIC
) RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v NUMERIC;
BEGIN
  IF p_difficulty = 'beginner' THEN RETURN 0; END IF;
  v := CASE p_difficulty WHEN 'intermediate' THEN 40 + 8 * p_lessons ELSE 80 + 10 * p_lessons END;
  IF p_has_project THEN v := v + 20; END IF;
  v := v * COALESCE(p_demand, 1);
  RETURN LEAST(250, GREATEST(50, (ROUND(v / 10) * 10)::INTEGER));
END;
$$;

INSERT INTO course_coin_catalog (course_id, field_id, title, difficulty, total_lessons, has_project, unlock_cost) VALUES
  ('web-html-basics',       'web-dev',       'أساسيات HTML',            'beginner',     12, FALSE, 0),
  ('web-css-styling',       'web-dev',       'تصميم CSS',               'beginner',     15, FALSE, 0),
  ('web-css-advanced',      'web-dev',       'CSS المتقدم',             'intermediate',  5, FALSE, 0),
  ('web-js-basics',         'web-dev',       'JavaScript الأساسيات',    'intermediate', 13, FALSE, 0),
  ('web-react-intro',       'web-dev',       'مقدمة React',             'advanced',     15, FALSE, 0),
  ('web-deployment',        'web-dev',       'نشر المواقع والدومينات',   'intermediate',  6, FALSE, 0),
  ('py-basics',             'python',        'أساسيات Python',          'beginner',     10, FALSE, 0),
  ('py-data-structures',    'python',        'هياكل البيانات',          'intermediate',  8, FALSE, 0),
  ('py-oop',                'python',        'البرمجة الكائنية',        'intermediate', 10, FALSE, 0),
  ('py-advanced',           'python',        'Python المتقدم',          'advanced',     12, FALSE, 0),
  ('cpp-basics',            'cpp',           'أساسيات C++',             'beginner',     10, FALSE, 0),
  ('cpp-pointers',          'cpp',           'المؤشرات والذاكرة',       'intermediate',  8, FALSE, 0),
  ('cpp-oop',               'cpp',           'OOP في C++',              'advanced',     12, FALSE, 0),
  ('cpp-advanced',          'cpp',           'C++ المتقدم',             'advanced',     10, FALSE, 0),
  ('cyber-basics',          'cybersecurity', 'أساسيات الأمن السيبراني', 'beginner',      8, FALSE, 0),
  ('cyber-network',         'cybersecurity', 'أمن الشبكات',             'intermediate', 10, FALSE, 0),
  ('cyber-advanced',        'cybersecurity', 'الأمن المتقدم',           'advanced',      6, FALSE, 0),
  ('cyber-ethical-hacking', 'cybersecurity', 'الاختراق الأخلاقي',       'advanced',     15, FALSE, 0),
  ('ai-basics',             'ai-ml',         'أساسيات الذكاء الاصطناعي', 'beginner',     5, FALSE, 0),
  ('ai-ml-basics',          'ai-ml',         'تعلم الآلة',              'intermediate', 12, FALSE, 0),
  ('ai-deep-learning',      'ai-ml',         'التعلم العميق',           'advanced',     15, FALSE, 0),
  ('rn-basics',             'react-native',  'أساسيات React Native',    'beginner',     13, FALSE, 0),
  ('rn-advanced',           'react-native',  'React Native المتقدم',    'intermediate',  7, FALSE, 0),
  ('flutter-basics',        'flutter',       'أساسيات Flutter',         'beginner',     14, FALSE, 0),
  ('flutter-advanced',      'flutter',       'Flutter المتقدم',         'advanced',      9, FALSE, 0),
  ('backend-nodejs',        'backend',       'Node.js',                 'beginner',      5, FALSE, 0),
  ('backend-rest-api',      'backend',       'REST APIs',               'intermediate',  8, FALSE, 0),
  ('backend-auth',          'backend',       'المصادقة والأمان',        'intermediate',  6, FALSE, 0),
  ('backend-sql',           'database',      'SQL',                     'beginner',      7, FALSE, 0),
  ('backend-supabase',      'database',      'Supabase',                'intermediate',  6, FALSE, 0),
  ('backend-firebase',      'database',      'Firebase',                'intermediate',  5, FALSE, 0),
  ('backend-mongodb',       'database',      'MongoDB',                 'intermediate',  5, FALSE, 0)
ON CONFLICT (course_id) DO NOTHING;

-- First-time seed: set price = formula for rows that were just inserted at 0.
UPDATE course_coin_catalog
SET suggested_cost = coins_suggest_price(difficulty, total_lessons, has_project, demand_factor);
UPDATE course_coin_catalog
SET unlock_cost = suggested_cost, price_updated_at = NOW()
WHERE unlock_cost = 0 AND difficulty <> 'beginner';

ALTER TABLE course_coin_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS course_catalog_read ON course_coin_catalog;
DROP POLICY IF EXISTS course_catalog_admin_write ON course_coin_catalog;
CREATE POLICY course_catalog_read ON course_coin_catalog FOR SELECT USING (true);
CREATE POLICY course_catalog_admin_write ON course_coin_catalog FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin-only: recompute suggestions and (optionally) apply them. Prices never
-- change on their own — this must be called deliberately.
CREATE OR REPLACE FUNCTION admin_apply_suggested_prices(p_apply BOOLEAN DEFAULT FALSE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_changed INTEGER := 0;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden');
  END IF;
  UPDATE course_coin_catalog
  SET suggested_cost = coins_suggest_price(difficulty, total_lessons, has_project, demand_factor);
  IF p_apply THEN
    UPDATE course_coin_catalog
    SET unlock_cost = suggested_cost, price_updated_at = NOW()
    WHERE unlock_cost IS DISTINCT FROM suggested_cost;
    GET DIAGNOSTICS v_changed = ROW_COUNT;
  END IF;
  RETURN jsonb_build_object('success', true, 'applied', p_apply, 'changed', v_changed);
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Lock down coin tables (read-only for clients)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  purchased_points INTEGER DEFAULT 0,
  earned_points INTEGER DEFAULT 0,
  spent_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_unlocked_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);
CREATE TABLE IF NOT EXISTS user_unlocked_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  cost_paid INTEGER DEFAULT 0,
  UNIQUE (user_id, course_id, section_id)
);

ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS ref_id TEXT;
ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS balance_after INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS uq_point_transactions_idem
  ON point_transactions (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_source_date
  ON point_transactions (user_id, source, created_at DESC);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_sections ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies
           WHERE schemaname = 'public'
             AND tablename IN ('user_points', 'point_transactions',
                               'user_unlocked_courses', 'user_unlocked_sections') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY user_points_select ON user_points
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY point_transactions_select ON point_transactions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY unlocked_courses_select ON user_unlocked_courses
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY unlocked_sections_select ON user_unlocked_sections
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- ----------------------------------------------------------------------------
-- 4. Core ledger primitive (never callable by clients)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _coins_apply(
  p_user UUID, p_delta INTEGER, p_source TEXT, p_reason TEXT, p_ref TEXT, p_idem TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  INSERT INTO user_points (user_id, total_points, earned_points, spent_points, purchased_points)
  VALUES (p_user, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Row lock serialises every balance change for this user, which also makes
  -- the idempotency check below race-free.
  SELECT COALESCE(total_points, 0) INTO v_balance
  FROM user_points WHERE user_id = p_user FOR UPDATE;

  IF p_idem IS NOT NULL AND EXISTS (
    SELECT 1 FROM point_transactions WHERE user_id = p_user AND idempotency_key = p_idem
  ) THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true, 'balance', v_balance, 'delta', 0);
  END IF;

  IF p_delta < 0 AND v_balance + p_delta < 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'insufficient',
                              'balance', v_balance, 'needed', -p_delta - v_balance);
  END IF;

  UPDATE user_points SET
    total_points = COALESCE(total_points, 0) + p_delta,
    earned_points = COALESCE(earned_points, 0) + GREATEST(p_delta, 0),
    spent_points = COALESCE(spent_points, 0) + GREATEST(-p_delta, 0),
    updated_at = NOW()
  WHERE user_id = p_user
  RETURNING total_points INTO v_balance;

  INSERT INTO point_transactions (user_id, type, amount, reason, source, ref_id, idempotency_key, balance_after)
  VALUES (p_user, CASE WHEN p_delta >= 0 THEN 'earned' ELSE 'spent' END,
          ABS(p_delta), p_reason, p_source, p_ref, p_idem, v_balance);

  RETURN jsonb_build_object('success', true, 'balance', v_balance, 'delta', p_delta);
END;
$$;
REVOKE ALL ON FUNCTION _coins_apply(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Daily reward ladder (streak rewards)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_daily_rewards (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 0 CHECK (current_day BETWEEN 0 AND 7),
  run_days INTEGER NOT NULL DEFAULT 0,
  best_run INTEGER NOT NULL DEFAULT 0,
  total_claims INTEGER NOT NULL DEFAULT 0,
  last_claim_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_daily_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_rewards_select ON user_daily_rewards;
CREATE POLICY daily_rewards_select ON user_daily_rewards
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- "Activity" = at least one lesson or challenge completed today (local time).
CREATE OR REPLACE FUNCTION _coins_has_activity(p_user UUID, p_day DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_lesson_progress
    WHERE user_id = p_user AND completed = TRUE
      AND (completed_at AT TIME ZONE COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad'))::date = p_day
  );
$$;

CREATE OR REPLACE FUNCTION coins_claim_daily_reward()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('daily_ladder');
  v_today DATE := _coin_today();
  v_row user_daily_rewards%ROWTYPE;
  v_day INTEGER;
  v_run INTEGER;
  v_reward INTEGER;
  v_reset BOOLEAN := FALSE;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  INSERT INTO user_daily_rewards (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_row FROM user_daily_rewards WHERE user_id = v_uid FOR UPDATE;

  IF v_row.last_claim_date = v_today THEN
    RETURN jsonb_build_object('success', false, 'code', 'already_claimed', 'day', v_row.current_day);
  END IF;

  IF COALESCE((v_cfg->>'requires_activity')::boolean, TRUE)
     AND NOT _coins_has_activity(v_uid, v_today) THEN
    RETURN jsonb_build_object('success', false, 'code', 'activity_required');
  END IF;

  IF v_row.last_claim_date = v_today - 1 THEN
    v_day := (v_row.current_day % 7) + 1;
    v_run := v_row.run_days + 1;
  ELSE
    v_reset := v_row.last_claim_date IS NOT NULL;
    v_day := 1;
    v_run := 1;
  END IF;

  v_reward := COALESCE((v_cfg->'rewards'->>(v_day - 1))::INTEGER, 5);
  v_res := _coins_apply(v_uid, v_reward, 'daily_reward', 'مكافأة اليوم ' || v_day,
                        v_today::TEXT, 'daily:' || v_today::TEXT);

  UPDATE user_daily_rewards SET
    current_day = v_day,
    run_days = v_run,
    best_run = GREATEST(best_run, v_run),
    total_claims = total_claims + 1,
    last_claim_date = v_today,
    updated_at = NOW()
  WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'day', v_day, 'reward', v_reward,
                            'run_days', v_run, 'streak_reset', v_reset,
                            'balance', v_res->'balance');
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Rewarded ads — one-time sessions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_reward_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rewarded_at TIMESTAMPTZ,
  reward_amount INTEGER,
  verified_by TEXT CHECK (verified_by IN ('client', 'ssv')),
  ssv_transaction_id TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_ad_sessions_user_date ON ad_reward_sessions (user_id, ad_date);
ALTER TABLE ad_reward_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ad_sessions_select ON ad_reward_sessions;
CREATE POLICY ad_sessions_select ON ad_reward_sessions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE OR REPLACE FUNCTION coins_start_ad_session()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('ads');
  v_today DATE := _coin_today();
  v_limit INTEGER := COALESCE((v_cfg->>'daily_limit')::INTEGER, 4);
  v_gap INTEGER := COALESCE((v_cfg->>'min_seconds_between_ads')::INTEGER, 30);
  v_watched INTEGER;
  v_pending INTEGER;
  v_last TIMESTAMPTZ;
  v_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  -- Serialise per user.
  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;

  UPDATE ad_reward_sessions SET status = 'expired'
  WHERE user_id = v_uid AND status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';

  SELECT COUNT(*) FILTER (WHERE status = 'rewarded'),
         COUNT(*) FILTER (WHERE status = 'pending' AND created_at > NOW() - INTERVAL '10 minutes'),
         MAX(rewarded_at)
    INTO v_watched, v_pending, v_last
  FROM ad_reward_sessions WHERE user_id = v_uid AND ad_date = v_today;

  IF v_watched >= v_limit THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_limit', 'watched', v_watched, 'limit', v_limit);
  END IF;
  IF v_last IS NOT NULL AND v_last > NOW() - make_interval(secs => v_gap) THEN
    RETURN jsonb_build_object('success', false, 'code', 'cooldown',
      'retry_after', CEIL(EXTRACT(EPOCH FROM (v_last + make_interval(secs => v_gap) - NOW()))));
  END IF;
  IF v_pending >= 5 THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_many_attempts');
  END IF;

  INSERT INTO ad_reward_sessions (user_id, ad_date) VALUES (v_uid, v_today) RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'session_id', v_id,
                            'ad_number', v_watched + 1, 'limit', v_limit,
                            'reward', COALESCE((v_cfg->>'reward_per_ad')::INTEGER, 15));
END;
$$;

-- Shared crediting logic for client-claim and SSV paths.
CREATE OR REPLACE FUNCTION _coins_credit_ad_session(p_session UUID, p_via TEXT, p_txn TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg JSONB := _coin_cfg('ads');
  v_s ad_reward_sessions%ROWTYPE;
  v_limit INTEGER := COALESCE((v_cfg->>'daily_limit')::INTEGER, 4);
  v_reward INTEGER := COALESCE((v_cfg->>'reward_per_ad')::INTEGER, 15);
  v_bonus INTEGER := COALESCE((v_cfg->>'daily_bonus')::INTEGER, 0);
  v_watched INTEGER;
  v_res JSONB;
  v_bonus_given INTEGER := 0;
BEGIN
  SELECT * INTO v_s FROM ad_reward_sessions WHERE id = p_session FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  IF v_s.status = 'rewarded' THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true,
      'balance', (SELECT total_points FROM user_points WHERE user_id = v_s.user_id));
  END IF;
  IF v_s.status = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'code', 'expired');
  END IF;

  SELECT COUNT(*) INTO v_watched FROM ad_reward_sessions
  WHERE user_id = v_s.user_id AND ad_date = v_s.ad_date AND status = 'rewarded';
  IF v_watched >= v_limit THEN
    UPDATE ad_reward_sessions SET status = 'expired' WHERE id = p_session;
    RETURN jsonb_build_object('success', false, 'code', 'daily_limit');
  END IF;

  v_res := _coins_apply(v_s.user_id, v_reward, 'rewarded_ad', 'مشاهدة إعلان مكافأة',
                        p_session::TEXT, 'ad:' || p_session::TEXT);

  UPDATE ad_reward_sessions SET status = 'rewarded', rewarded_at = NOW(),
    reward_amount = v_reward, verified_by = p_via, ssv_transaction_id = p_txn
  WHERE id = p_session;

  IF v_watched + 1 = v_limit AND v_bonus > 0 THEN
    v_res := _coins_apply(v_s.user_id, v_bonus, 'rewarded_ad_bonus', 'تحدي الإعلانات اليومي',
                          v_s.ad_date::TEXT, 'ad_bonus:' || v_s.ad_date::TEXT);
    v_bonus_given := v_bonus;
  END IF;

  RETURN jsonb_build_object('success', true, 'reward', v_reward, 'bonus', v_bonus_given,
                            'watched', v_watched + 1, 'limit', v_limit,
                            'balance', v_res->'balance');
END;
$$;
REVOKE ALL ON FUNCTION _coins_credit_ad_session(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Called by the app after the ad SDK reports EARNED_REWARD. Disabled
-- automatically once AdMob server-side verification is switched on
-- (coin_config.ads.client_claim_enabled = false).
CREATE OR REPLACE FUNCTION coins_claim_ad_reward(p_session_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('ads');
  v_s ad_reward_sessions%ROWTYPE;
  v_min INTEGER := COALESCE((v_cfg->>'min_seconds_to_complete')::INTEGER, 5);
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  SELECT * INTO v_s FROM ad_reward_sessions WHERE id = p_session_id AND user_id = v_uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  IF v_s.status = 'rewarded' THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true,
      'balance', (SELECT total_points FROM user_points WHERE user_id = v_uid));
  END IF;
  IF v_s.created_at > NOW() - make_interval(secs => v_min) THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_fast');
  END IF;
  IF v_s.created_at < NOW() - INTERVAL '1 hour' THEN
    UPDATE ad_reward_sessions SET status = 'expired' WHERE id = p_session_id AND status = 'pending';
    RETURN jsonb_build_object('success', false, 'code', 'expired');
  END IF;
  IF NOT COALESCE((v_cfg->>'client_claim_enabled')::boolean, TRUE) THEN
    RETURN jsonb_build_object('success', false, 'code', 'pending_verification');
  END IF;
  RETURN _coins_credit_ad_session(p_session_id, 'client', NULL);
END;
$$;

-- Called only by the `admob-ssv` Edge Function (service role) after it has
-- verified Google's signature.
CREATE OR REPLACE FUNCTION coins_credit_ad_ssv(p_session_id UUID, p_user_id UUID, p_transaction_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner UUID;
BEGIN
  SELECT user_id INTO v_owner FROM ad_reward_sessions WHERE id = p_session_id;
  IF v_owner IS NULL OR v_owner <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  IF EXISTS (SELECT 1 FROM ad_reward_sessions WHERE ssv_transaction_id = p_transaction_id) THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true);
  END IF;
  RETURN _coins_credit_ad_session(p_session_id, 'ssv', p_transaction_id);
END;
$$;
REVOKE ALL ON FUNCTION coins_credit_ad_ssv(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION coins_credit_ad_ssv(UUID, UUID, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 7. Spending: unlock courses / whole field bundle
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coins_unlock_course(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_c course_coin_catalog%ROWTYPE;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  SELECT * INTO v_c FROM course_coin_catalog WHERE course_id = p_course_id AND is_active;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_course');
  END IF;
  IF EXISTS (SELECT 1 FROM user_unlocked_courses WHERE user_id = v_uid AND course_id = p_course_id) THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true);
  END IF;

  IF v_c.unlock_cost > 0 THEN
    v_res := _coins_apply(v_uid, -v_c.unlock_cost, 'unlock_course', 'فتح دورة: ' || v_c.title,
                          p_course_id, 'unlock:' || p_course_id);
    IF NOT (v_res->>'success')::boolean THEN
      RETURN v_res || jsonb_build_object('cost', v_c.unlock_cost);
    END IF;
  END IF;

  INSERT INTO user_unlocked_courses (user_id, course_id) VALUES (v_uid, p_course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'cost', v_c.unlock_cost,
    'balance', (SELECT total_points FROM user_points WHERE user_id = v_uid));
END;
$$;

CREATE OR REPLACE FUNCTION coins_unlock_field(p_field_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ids TEXT[];
  v_sum INTEGER;
  v_cost INTEGER;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  SELECT ARRAY_AGG(c.course_id ORDER BY c.course_id), COALESCE(SUM(c.unlock_cost), 0)
    INTO v_ids, v_sum
  FROM course_coin_catalog c
  WHERE c.field_id = p_field_id AND c.is_active AND c.unlock_cost > 0
    AND NOT EXISTS (SELECT 1 FROM user_unlocked_courses u
                    WHERE u.user_id = v_uid AND u.course_id = c.course_id);

  IF v_ids IS NULL THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true);
  END IF;

  v_cost := ROUND(v_sum * (1 - COALESCE((_coin_cfg('field_bundle')->>'discount')::NUMERIC, 0.15)));
  v_res := _coins_apply(v_uid, -v_cost, 'unlock_field', 'فتح مسار كامل: ' || p_field_id,
                        p_field_id, 'unlock_field:' || p_field_id || ':' || md5(array_to_string(v_ids, ',')));
  IF NOT (v_res->>'success')::boolean THEN
    RETURN v_res || jsonb_build_object('cost', v_cost);
  END IF;

  INSERT INTO user_unlocked_courses (user_id, course_id)
  SELECT v_uid, UNNEST(v_ids)
  ON CONFLICT (user_id, course_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'cost', v_cost, 'courses', to_jsonb(v_ids),
                            'balance', v_res->'balance');
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. Learning rewards (challenges, course completion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coins_reward_challenge(p_challenge_id TEXT, p_difficulty TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('challenge_rewards');
  v_cap INTEGER := COALESCE((v_cfg->>'daily_cap')::INTEGER, 60);
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_earned INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  IF p_difficulty NOT IN ('easy', 'medium', 'hard') OR length(p_challenge_id) > 120 THEN
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

  v_amount := LEAST(COALESCE((v_cfg->>p_difficulty)::INTEGER, 5), v_cap - v_earned);
  IF v_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_cap', 'cap', v_cap);
  END IF;

  RETURN _coins_apply(v_uid, v_amount, 'challenge', 'حل تحدي', p_challenge_id,
                      'challenge:' || p_challenge_id) || jsonb_build_object('reward', v_amount);
END;
$$;

CREATE OR REPLACE FUNCTION coins_reward_course_completion(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_c course_coin_catalog%ROWTYPE;
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
  SELECT COUNT(DISTINCT lesson_id) INTO v_done FROM user_lesson_progress
  WHERE user_id = v_uid AND course_id = p_course_id AND completed = TRUE;
  IF v_done < v_c.total_lessons THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed',
                              'completed', v_done, 'total', v_c.total_lessons);
  END IF;

  v_amount := COALESCE((_coin_cfg('course_completion_rewards')->>v_c.difficulty)::INTEGER, 30);
  RETURN _coins_apply(v_uid, v_amount, 'course_complete', 'إكمال دورة: ' || v_c.title,
                      p_course_id, 'course_complete:' || p_course_id)
         || jsonb_build_object('reward', v_amount);
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. One-call state for the Earn Coins screen
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coins_get_state()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_ads JSONB := _coin_cfg('ads');
  v_ladder JSONB := _coin_cfg('daily_ladder');
  v_ch JSONB := _coin_cfg('challenge_rewards');
  v_balance INTEGER;
  v_earned INTEGER;
  v_d user_daily_rewards%ROWTYPE;
  v_claimed_today BOOLEAN;
  v_continues BOOLEAN;
  v_next_day INTEGER;
  v_watched INTEGER;
  v_last_ad TIMESTAMPTZ;
  v_gap INTEGER := COALESCE((v_ads->>'min_seconds_between_ads')::INTEGER, 30);
  v_ch_today INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;

  SELECT COALESCE(total_points, 0), COALESCE(earned_points, 0)
    INTO v_balance, v_earned FROM user_points WHERE user_id = v_uid;
  SELECT * INTO v_d FROM user_daily_rewards WHERE user_id = v_uid;

  v_claimed_today := v_d.last_claim_date = v_today;
  v_continues := v_d.last_claim_date IN (v_today, v_today - 1);
  v_next_day := CASE
    WHEN v_claimed_today THEN (v_d.current_day % 7) + 1
    WHEN v_continues THEN (v_d.current_day % 7) + 1
    ELSE 1 END;

  SELECT COUNT(*) FILTER (WHERE status = 'rewarded'), MAX(rewarded_at)
    INTO v_watched, v_last_ad
  FROM ad_reward_sessions WHERE user_id = v_uid AND ad_date = v_today;

  SELECT COALESCE(SUM(amount), 0) INTO v_ch_today FROM point_transactions
  WHERE user_id = v_uid AND source = 'challenge' AND (created_at AT TIME ZONE v_tz)::date = v_today;

  RETURN jsonb_build_object(
    'success', true,
    'balance', COALESCE(v_balance, 0),
    'lifetime_earned', COALESCE(v_earned, 0),
    'unlocked_courses', COALESCE((SELECT jsonb_agg(course_id) FROM user_unlocked_courses WHERE user_id = v_uid), '[]'::jsonb),
    'learning_streak', COALESCE((SELECT streak_days FROM profiles WHERE id = v_uid), 0),
    'daily', jsonb_build_object(
      'rewards', v_ladder->'rewards',
      'claimed_today', COALESCE(v_claimed_today, FALSE),
      'current_day', CASE WHEN v_continues THEN COALESCE(v_d.current_day, 0) ELSE 0 END,
      'next_day', v_next_day,
      'run_days', CASE WHEN v_continues THEN COALESCE(v_d.run_days, 0) ELSE 0 END,
      'best_run', COALESCE(v_d.best_run, 0),
      'streak_broken', v_d.last_claim_date IS NOT NULL AND NOT v_continues,
      'requires_activity', COALESCE((v_ladder->>'requires_activity')::boolean, TRUE),
      'has_activity_today', _coins_has_activity(v_uid, v_today)
    ),
    'ads', jsonb_build_object(
      'reward', COALESCE((v_ads->>'reward_per_ad')::INTEGER, 15),
      'limit', COALESCE((v_ads->>'daily_limit')::INTEGER, 4),
      'bonus', COALESCE((v_ads->>'daily_bonus')::INTEGER, 0),
      'watched_today', COALESCE(v_watched, 0),
      'next_available_at', CASE WHEN v_last_ad IS NULL THEN NULL
                                ELSE v_last_ad + make_interval(secs => v_gap) END
    ),
    'challenges', jsonb_build_object(
      'easy', COALESCE((v_ch->>'easy')::INTEGER, 5),
      'medium', COALESCE((v_ch->>'medium')::INTEGER, 10),
      'hard', COALESCE((v_ch->>'hard')::INTEGER, 15),
      'daily_cap', COALESCE((v_ch->>'daily_cap')::INTEGER, 60),
      'earned_today', v_ch_today
    ),
    'course_completion', _coin_cfg('course_completion_rewards'),
    'recent', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.created_at DESC) FROM (
        SELECT type, amount, reason, source, created_at FROM point_transactions
        WHERE user_id = v_uid ORDER BY created_at DESC LIMIT 15
      ) t), '[]'::jsonb)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. AI fair-use quota (consumed by the ai-chat Edge Function)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_daily_usage (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  bucket TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date, bucket)
);
ALTER TABLE ai_daily_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_daily_usage_select ON ai_daily_usage;
CREATE POLICY ai_daily_usage_select ON ai_daily_usage
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE OR REPLACE FUNCTION ai_consume_quota(p_bucket TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today DATE := _coin_today();
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'not_authenticated');
  END IF;
  v_limit := COALESCE((_coin_cfg('ai_quota')->>p_bucket)::INTEGER, 0);
  IF v_limit <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'unknown_bucket');
  END IF;

  INSERT INTO ai_daily_usage (user_id, usage_date, bucket, used)
  VALUES (v_uid, v_today, p_bucket, 0)
  ON CONFLICT DO NOTHING;

  UPDATE ai_daily_usage SET used = used + 1
  WHERE user_id = v_uid AND usage_date = v_today AND bucket = p_bucket AND used < v_limit
  RETURNING used INTO v_used;

  IF v_used IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'quota_exceeded', 'limit', v_limit, 'remaining', 0);
  END IF;
  RETURN jsonb_build_object('allowed', true, 'limit', v_limit, 'remaining', v_limit - v_used);
END;
$$;

CREATE OR REPLACE FUNCTION ai_get_quota()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_object_agg(q.key, jsonb_build_object(
           'limit', q.value::INTEGER,
           'remaining', GREATEST(0, q.value::INTEGER - COALESCE(u.used, 0))))
  FROM jsonb_each_text(_coin_cfg('ai_quota')) q
  LEFT JOIN ai_daily_usage u
    ON u.user_id = auth.uid() AND u.usage_date = _coin_today() AND u.bucket = q.key;
$$;

-- ----------------------------------------------------------------------------
-- 11. Retire the payment / subscription system (data is kept, writes are not)
-- ----------------------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  -- Remove every write policy on payment & subscription tables.
  FOR r IN SELECT tablename, policyname FROM pg_policies
           WHERE schemaname = 'public'
             AND tablename IN ('payment_orders', 'user_subscriptions', 'subscriptions',
                               'subscription_plans', 'subscription_history',
                               'payment_notifications', 'free_feature_limits')
             AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;

  -- Old one-shot RPCs that granted paid points/subscriptions.
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p
           JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public'
             AND p.proname IN ('create_subscription', 'approve_payment_order',
                               'reject_payment_order', 'purchase_points', 'purchase_premium') LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s', r.sig);
  END LOOP;

  -- Payment receipts bucket: no more uploads, no more public reads.
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    UPDATE storage.buckets SET public = FALSE WHERE id = 'payment-receipts';
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view receipts" ON storage.objects;
CREATE POLICY "Admins can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts' AND is_admin());

-- Admin panel still calls these; they now fail clearly instead of crediting.
CREATE OR REPLACE FUNCTION approve_payment_order(
  p_order_id UUID, p_admin_id UUID, p_points_approved INTEGER DEFAULT NULL, p_admin_note TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE sql AS $$
  SELECT jsonb_build_object('success', false, 'error', 'نظام الدفع متوقف. Kodax مجاني بالكامل.');
$$;
CREATE OR REPLACE FUNCTION reject_payment_order(
  p_order_id UUID, p_admin_id UUID, p_admin_note TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE sql AS $$
  SELECT jsonb_build_object('success', false, 'error', 'نظام الدفع متوقف. Kodax مجاني بالكامل.');
$$;

-- ----------------------------------------------------------------------------
-- 12. Grants — client RPCs are for signed-in users only; internals for nobody.
-- ----------------------------------------------------------------------------
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'coins_get_state()', 'coins_claim_daily_reward()', 'coins_start_ad_session()',
    'coins_claim_ad_reward(uuid)', 'coins_unlock_course(text)', 'coins_unlock_field(text)',
    'coins_reward_challenge(text, text)', 'coins_reward_course_completion(text)',
    'ai_consume_quota(text)', 'ai_get_quota()', 'admin_apply_suggested_prices(boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;

  FOREACH f IN ARRAY ARRAY[
    '_coins_apply(uuid, integer, text, text, text, text)',
    '_coins_credit_ad_session(uuid, text, text)',
    '_coins_has_activity(uuid, date)',
    '_coins_restricted(uuid)',
    'coins_credit_ad_ssv(uuid, uuid, text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
  GRANT EXECUTE ON FUNCTION public.coins_credit_ad_ssv(uuid, uuid, text) TO service_role;
END $$;

COMMIT;
