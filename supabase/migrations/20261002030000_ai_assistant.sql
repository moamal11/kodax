-- ============================================================================
-- مساعد Kodax: حصة Gemini موحّدة + زيادتها بالإعلانات المكافئة + cache للردود العامة
--
-- قبل هذا الملف: خمس حصص منفصلة لكل مستخدم يومياً (chat 30, hint 20, explain 15, fix 10, solve 5)
-- = حتى 80 طلب Gemini لكل مستخدم يومياً، بلا سقف للمشروع كله.
--
-- بعد هذا الملف:
--   * حصة واحدة لكل مستخدم يومياً تُحسب فقط عند الوصول الفعلي إلى Gemini
--     (الردود الذكية المحلية والـcache لا تُحسب). الإعدادات كلها في coin_config.ai_quota:
--       daily_limit             الحد الأساسي لكل مستخدم يومياً
--       ad_bonus                الزيادة عند إكمال ads_per_bonus إعلانات مكافئة
--       ads_per_bonus           عدد الإعلانات المطلوبة لكل زيادة
--       max_ad_bonuses_per_day  أقصى عدد زيادات في اليوم
--       global_daily_limit      سقف طلبات Gemini للمشروع كله يومياً (أقل من حد الخطة المجانية في AI Studio)
--       global_timezone         منطقة يوم السقف العام (Google تعيد العداد منتصف الليل بتوقيت المحيط الهادئ)
--   * إعلانات زيادة الحصة تستخدم نظام الإعلانات الموجود نفسه (ad_reward_sessions + SSV أو تأكيد التطبيق)
--     مع عمود purpose، فلا تُحسب من حد إعلانات الكوينات ولا تمنح كوينات.
--   * ai_response_cache: ردود الأسئلة العامة فقط (يكتبها ويقرأها السيرفر فقط).
--
-- آمن: لا يحذف أي بيانات. قابل للتكرار. يُبقي ai_consume_quota و ai_get_quota بنفس الأسماء
-- حتى تعمل دالة ai-chat الحالية في الإنتاج إلى أن تُنشر النسخة الجديدة.
-- ============================================================================
BEGIN;

-- 1) الإعدادات (مكان واحد) — قيم الإدارة الحالية تُحفظ إن وُجدت
INSERT INTO coin_config (key, value) VALUES
  ('ai_quota', '{
      "daily_limit": 10,
      "ad_bonus": 3,
      "ads_per_bonus": 2,
      "max_ad_bonuses_per_day": 2,
      "global_daily_limit": 200,
      "global_timezone": "America/Los_Angeles"
   }'::jsonb)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value || (coin_config.value - 'chat' - 'hint' - 'explain' - 'fix' - 'solve'),
      updated_at = NOW();

-- 2) عدّاد المشروع اليومي (يكتبه السيرفر فقط)
CREATE TABLE IF NOT EXISTS ai_global_usage (
  usage_date DATE PRIMARY KEY,
  used INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE ai_global_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ai_global_usage FROM anon, authenticated;

-- 3) غرض جلسة الإعلان: كوينات (الافتراضي) أو زيادة حصة الذكاء
ALTER TABLE ad_reward_sessions ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'coins';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_reward_sessions_purpose_check') THEN
    ALTER TABLE ad_reward_sessions ADD CONSTRAINT ad_reward_sessions_purpose_check CHECK (purpose IN ('coins', 'ai_quota'));
  END IF;
END $$;

-- 4) حالة الحصة (داخلية)
CREATE OR REPLACE FUNCTION _ai_cfg_int(p_key TEXT, p_default INTEGER)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((_coin_cfg('ai_quota')->>p_key)::INTEGER, p_default);
$$;

CREATE OR REPLACE FUNCTION _ai_global_today()
RETURNS DATE LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (NOW() AT TIME ZONE COALESCE(_coin_cfg('ai_quota')->>'global_timezone', 'America/Los_Angeles'))::date;
$$;

CREATE OR REPLACE FUNCTION _ai_quota_state(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_base INTEGER := _ai_cfg_int('daily_limit', 10);
  v_bonus_each INTEGER := _ai_cfg_int('ad_bonus', 3);
  v_per INTEGER := GREATEST(1, _ai_cfg_int('ads_per_bonus', 2));
  v_max_bonuses INTEGER := _ai_cfg_int('max_ad_bonuses_per_day', 2);
  v_used INTEGER;
  v_ads INTEGER;
  v_bonuses INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT COALESCE(used, 0) INTO v_used FROM ai_daily_usage
  WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini';
  v_used := COALESCE(v_used, 0);

  SELECT COUNT(*) INTO v_ads FROM ad_reward_sessions
  WHERE user_id = p_user AND ad_date = v_today AND purpose = 'ai_quota' AND status = 'rewarded';

  -- الزيادة مشتقة من الإعلانات المعتمدة فعلاً (لا عدّاد منفصل يمكن التلاعب به)
  v_bonuses := LEAST(v_max_bonuses, v_ads / v_per);
  v_limit := v_base + v_bonuses * v_bonus_each;

  RETURN jsonb_build_object(
    'used', v_used,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_used),
    'base_limit', v_base,
    'bonus', v_bonuses * v_bonus_each,
    'ads', jsonb_build_object(
      'watched', v_ads,
      'per_bonus', v_per,
      'bonus_amount', v_bonus_each,
      'bonuses_earned', v_bonuses,
      'max_bonuses', v_max_bonuses,
      'progress', CASE WHEN v_bonuses >= v_max_bonuses THEN 0 ELSE v_ads - v_bonuses * v_per END,
      'can_watch', v_bonuses < v_max_bonuses
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION _ai_cfg_int(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _ai_global_today() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _ai_quota_state(UUID) FROM PUBLIC, anon, authenticated;

-- 5) للتطبيق: عرض "استخدمت X / Y"
CREATE OR REPLACE FUNCTION ai_get_quota()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  RETURN _ai_quota_state(auth.uid()) || jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION ai_get_quota() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ai_get_quota() TO authenticated;

-- 6) حجز طلب Gemini قبل الإرسال (service_role فقط — تستدعيها دالة ai-chat)
CREATE OR REPLACE FUNCTION ai_quota_reserve(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_gday DATE := _ai_global_today();
  v_glimit INTEGER := _ai_cfg_int('global_daily_limit', 200);
  v_state JSONB;
  v_gused INTEGER;
BEGIN
  IF p_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'not_authenticated');
  END IF;

  INSERT INTO ai_daily_usage (user_id, usage_date, bucket, used) VALUES (p_user, v_today, 'gemini', 0)
  ON CONFLICT DO NOTHING;
  INSERT INTO ai_global_usage (usage_date, used) VALUES (v_gday, 0) ON CONFLICT DO NOTHING;

  -- قفل الصفين: الطلبات المتزامنة لنفس المستخدم لا تتجاوز الحد
  PERFORM 1 FROM ai_daily_usage WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini' FOR UPDATE;
  SELECT used INTO v_gused FROM ai_global_usage WHERE usage_date = v_gday FOR UPDATE;

  v_state := _ai_quota_state(p_user);
  IF (v_state->>'remaining')::INTEGER <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'quota_exceeded', 'quota', v_state);
  END IF;
  IF v_gused >= v_glimit THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'global_limit', 'quota', v_state);
  END IF;

  UPDATE ai_daily_usage SET used = used + 1 WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini';
  UPDATE ai_global_usage SET used = used + 1 WHERE usage_date = v_gday;
  RETURN jsonb_build_object('allowed', true, 'quota', _ai_quota_state(p_user));
END;
$$;
REVOKE ALL ON FUNCTION ai_quota_reserve(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_quota_reserve(UUID) TO service_role;

-- إرجاع الحجز إذا فشل Gemini (خطأ المزود لا يُحسب على المستخدم) — service_role فقط
CREATE OR REPLACE FUNCTION ai_quota_release(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE ai_daily_usage SET used = used - 1
  WHERE user_id = p_user AND usage_date = _coin_today() AND bucket = 'gemini' AND used > 0;
  -- العدّاد العام يُرجع فقط إذا كان هناك حجز فعلي للمستخدم
  IF FOUND THEN
    UPDATE ai_global_usage SET used = used - 1 WHERE usage_date = _ai_global_today() AND used > 0;
  END IF;
  RETURN _ai_quota_state(p_user);
END;
$$;
REVOKE ALL ON FUNCTION ai_quota_release(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_quota_release(UUID) TO service_role;

-- توافق: دالة ai-chat المنشورة حالياً تستدعي ai_consume_quota(bucket) باسم المستخدم.
-- كل الأنواع صارت تستهلك الحصة الموحّدة نفسها (المستخدم يستهلك حصته هو فقط).
CREATE OR REPLACE FUNCTION ai_consume_quota(p_bucket TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_res JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'not_authenticated');
  END IF;
  v_res := ai_quota_reserve(auth.uid());
  RETURN jsonb_build_object(
    'allowed', (v_res->>'allowed')::boolean,
    'code', v_res->>'code',
    'limit', (v_res->'quota'->>'limit')::INTEGER,
    'remaining', (v_res->'quota'->>'remaining')::INTEGER
  );
END;
$$;
REVOKE ALL ON FUNCTION ai_consume_quota(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ai_consume_quota(TEXT) TO authenticated;

-- 7) جلسة إعلان لزيادة حصة الذكاء (نفس قيود نظام الإعلانات: فاصل زمني، جلسات معلّقة، حد يومي)
CREATE OR REPLACE FUNCTION ai_start_ad_session()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ads JSONB := _coin_cfg('ads');
  v_today DATE := _coin_today();
  v_gap INTEGER := COALESCE((v_ads->>'min_seconds_between_ads')::INTEGER, 30);
  v_state JSONB;
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

  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;

  UPDATE ad_reward_sessions SET status = 'expired'
  WHERE user_id = v_uid AND status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';

  v_state := _ai_quota_state(v_uid);
  IF NOT (v_state->'ads'->>'can_watch')::boolean THEN
    RETURN jsonb_build_object('success', false, 'code', 'ai_ad_limit', 'quota', v_state);
  END IF;

  -- فاصل زمني مشترك مع إعلانات الكوينات
  SELECT COUNT(*) FILTER (WHERE status = 'pending' AND created_at > NOW() - INTERVAL '10 minutes'),
         MAX(rewarded_at)
    INTO v_pending, v_last
  FROM ad_reward_sessions WHERE user_id = v_uid AND ad_date = v_today;

  IF v_last IS NOT NULL AND v_last > NOW() - make_interval(secs => v_gap) THEN
    RETURN jsonb_build_object('success', false, 'code', 'cooldown',
      'retry_after', CEIL(EXTRACT(EPOCH FROM (v_last + make_interval(secs => v_gap) - NOW()))));
  END IF;
  IF v_pending >= 5 THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_many_attempts');
  END IF;

  INSERT INTO ad_reward_sessions (user_id, ad_date, purpose) VALUES (v_uid, v_today, 'ai_quota') RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'session_id', v_id, 'purpose', 'ai_quota', 'quota', v_state);
END;
$$;
REVOKE ALL ON FUNCTION ai_start_ad_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ai_start_ad_session() TO authenticated;

-- 8) إعلانات الكوينات: لا تحسب إعلانات الذكاء ضمن حدها اليومي (نفس الدالة السابقة + purpose)
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

  SELECT COUNT(*) FILTER (WHERE status = 'rewarded' AND purpose = 'coins'),
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

  INSERT INTO ad_reward_sessions (user_id, ad_date, purpose) VALUES (v_uid, v_today, 'coins') RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'session_id', v_id,
                            'ad_number', v_watched + 1, 'limit', v_limit,
                            'reward', COALESCE((v_cfg->>'reward_per_ad')::INTEGER, 15));
END;
$$;

-- 9) اعتماد الإعلان (SSV أو تأكيد التطبيق) — نفس الدالة السابقة + فرع زيادة حصة الذكاء
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
  v_state JSONB;
BEGIN
  SELECT * INTO v_s FROM ad_reward_sessions WHERE id = p_session FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  IF v_s.status = 'rewarded' THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true, 'purpose', v_s.purpose,
      'balance', (SELECT total_points FROM user_points WHERE user_id = v_s.user_id));
  END IF;
  IF v_s.status = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'code', 'expired');
  END IF;

  -- إعلان زيادة حصة الذكاء: لا كوينات؛ الزيادة تُشتق من عدد الإعلانات المعتمدة
  IF v_s.purpose = 'ai_quota' THEN
    v_state := _ai_quota_state(v_s.user_id);
    IF NOT (v_state->'ads'->>'can_watch')::boolean THEN
      UPDATE ad_reward_sessions SET status = 'expired' WHERE id = p_session;
      RETURN jsonb_build_object('success', false, 'code', 'ai_ad_limit', 'purpose', 'ai_quota', 'quota', v_state);
    END IF;
    UPDATE ad_reward_sessions SET status = 'rewarded', rewarded_at = NOW(),
      reward_amount = 0, verified_by = p_via, ssv_transaction_id = p_txn
    WHERE id = p_session;
    v_state := _ai_quota_state(v_s.user_id);
    RETURN jsonb_build_object('success', true, 'purpose', 'ai_quota', 'reward', 0, 'quota', v_state,
      'bonus_unlocked', (v_state->'ads'->>'progress')::INTEGER = 0
                        AND (v_state->'ads'->>'bonuses_earned')::INTEGER > 0);
  END IF;

  SELECT COUNT(*) INTO v_watched FROM ad_reward_sessions
  WHERE user_id = v_s.user_id AND ad_date = v_s.ad_date AND status = 'rewarded' AND purpose = 'coins';
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

  RETURN jsonb_build_object('success', true, 'purpose', 'coins', 'reward', v_reward, 'bonus', v_bonus_given,
                            'watched', v_watched + 1, 'limit', v_limit,
                            'balance', v_res->'balance');
END;
$$;
REVOKE ALL ON FUNCTION _coins_credit_ad_session(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- 10) حالة الكوينات: عدد إعلانات الكوينات فقط (نفس الدالة السابقة + purpose)
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

  -- MAX(rewarded_at) يشمل إعلانات الذكاء: الفاصل الزمني بين الإعلانات مشترك
  SELECT COUNT(*) FILTER (WHERE status = 'rewarded' AND purpose = 'coins'), MAX(rewarded_at)
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

-- 11) cache ردود الأسئلة العامة (لا بيانات شخصية) — السيرفر فقط
CREATE TABLE IF NOT EXISTS ai_response_cache (
  cache_key TEXT PRIMARY KEY,
  reply TEXT NOT NULL,
  model TEXT,
  knowledge_version TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_expires ON ai_response_cache (expires_at);
ALTER TABLE ai_response_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ai_response_cache FROM anon, authenticated;

CREATE OR REPLACE FUNCTION ai_cache_get(p_key TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_reply TEXT;
BEGIN
  UPDATE ai_response_cache SET hits = hits + 1
  WHERE cache_key = p_key AND expires_at > NOW()
  RETURNING reply INTO v_reply;
  RETURN v_reply;
END;
$$;
REVOKE ALL ON FUNCTION ai_cache_get(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_cache_get(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION ai_cache_put(p_key TEXT, p_reply TEXT, p_model TEXT, p_version TEXT, p_ttl_hours INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO ai_response_cache (cache_key, reply, model, knowledge_version, expires_at)
  VALUES (p_key, p_reply, p_model, p_version, NOW() + make_interval(hours => GREATEST(1, p_ttl_hours)))
  ON CONFLICT (cache_key) DO UPDATE
    SET reply = EXCLUDED.reply, model = EXCLUDED.model, knowledge_version = EXCLUDED.knowledge_version,
        created_at = NOW(), expires_at = EXCLUDED.expires_at;
  -- تنظيف خفيف للمنتهي
  DELETE FROM ai_response_cache WHERE cache_key IN (
    SELECT cache_key FROM ai_response_cache WHERE expires_at < NOW() LIMIT 50
  );
END;
$$;
REVOKE ALL ON FUNCTION ai_cache_put(TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_cache_put(TEXT, TEXT, TEXT, TEXT, INTEGER) TO service_role;

COMMIT;
