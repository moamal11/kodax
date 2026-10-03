-- ============================================================================
-- Phases K–L: الإشعارات الفورية (Expo Push → FCM/APNs) + حملات المشرف
-- ----------------------------------------------------------------------------
-- - push_tokens: أجهزة المستخدم (تسجيل/إلغاء عبر RPC فقط)
-- - notification_preferences: أنواع الإشعارات + ساعات الهدوء (بتوقيت بغداد)
-- - notification_outbox: طابور إرسال مع dedup_key فريد، حد معدل، محاولات، حالة تسليم
-- - notification_campaigns: حملات المشرف (مستخدم/عدة مستخدمين/شريحة/الجميع) مع سجل
-- - مصادر الإشعارات من السيرفر فقط (triggers): إعجاب، تعليق، متابعة، رسالة خاصة، رد الدعم،
--   تذكير الهدف اليومي، تحذير السلسلة، حملات المشرف. أحداث العميل لا تُنتج push (لا تكرار).
-- - الإرسال: Edge Function push-send (كل دقيقة عبر pg_cron + pg_net، السر في Vault باسم push_cron_secret)
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_id TEXT,
  app_version TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  disabled_reason TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens (user_id) WHERE enabled;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON push_tokens FROM anon, authenticated;
GRANT SELECT ON push_tokens TO authenticated;
DROP POLICY IF EXISTS push_tokens_own_read ON push_tokens;
CREATE POLICY push_tokens_own_read ON push_tokens FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  daily_goal BOOLEAN NOT NULL DEFAULT TRUE,
  streak BOOLEAN NOT NULL DEFAULT TRUE,
  likes BOOLEAN NOT NULL DEFAULT TRUE,
  comments BOOLEAN NOT NULL DEFAULT TRUE,
  follows BOOLEAN NOT NULL DEFAULT TRUE,
  messages BOOLEAN NOT NULL DEFAULT TRUE,
  system BOOLEAN NOT NULL DEFAULT TRUE,
  admin BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_start SMALLINT NOT NULL DEFAULT 23 CHECK (quiet_start BETWEEN 0 AND 23),
  quiet_end SMALLINT NOT NULL DEFAULT 8 CHECK (quiet_end BETWEEN 0 AND 23),
  reminder_hour SMALLINT NOT NULL DEFAULT 19 CHECK (reminder_hour BETWEEN 0 AND 23),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON notification_preferences FROM anon, authenticated;
GRANT SELECT ON notification_preferences TO authenticated;
DROP POLICY IF EXISTS notification_prefs_own_read ON notification_preferences;
CREATE POLICY notification_prefs_own_read ON notification_preferences FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE TABLE IF NOT EXISTS notification_campaigns (
  id BIGSERIAL PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  image_url TEXT,
  deep_link TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'users', 'segment', 'all')),
  target JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipients INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON notification_campaigns FROM anon, authenticated;
GRANT SELECT ON notification_campaigns TO authenticated;
DROP POLICY IF EXISTS notification_campaigns_admin_read ON notification_campaigns;
CREATE POLICY notification_campaigns_admin_read ON notification_campaigns FOR SELECT TO authenticated USING (is_admin());

CREATE TABLE IF NOT EXISTS notification_outbox (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('like', 'comment', 'follow', 'message', 'support', 'daily_goal', 'streak', 'system', 'admin')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedup_key TEXT NOT NULL UNIQUE,
  campaign_id BIGINT REFERENCES notification_campaigns(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'skipped', 'cancelled')),
  attempts SMALLINT NOT NULL DEFAULT 0,
  last_error TEXT,
  tickets JSONB,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  receipt_checked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_outbox_due ON notification_outbox (scheduled_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_outbox_user_recent ON notification_outbox (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbox_campaign ON notification_outbox (campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outbox_receipts ON notification_outbox (sent_at) WHERE status = 'sent';
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON notification_outbox FROM anon, authenticated;
GRANT SELECT ON notification_outbox TO authenticated;
DROP POLICY IF EXISTS notification_outbox_read ON notification_outbox;
CREATE POLICY notification_outbox_read ON notification_outbox FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

INSERT INTO coin_config (key, value) VALUES
  ('push', '{"social_per_hour": 10, "max_attempts": 3, "streak_warning_hour": 21}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- العميل: تسجيل الجهاز والتفضيلات
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.push_register_token(p_token TEXT, p_platform TEXT, p_device_id TEXT DEFAULT NULL, p_app_version TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  IF p_token IS NULL OR p_token !~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$' THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_token');
  END IF;
  IF p_platform NOT IN ('android', 'ios', 'web') THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_platform'); END IF;
  -- الرمز ينتقل لصاحب الجلسة الحالي (جهاز واحد = حساب واحد في وقت واحد)
  INSERT INTO push_tokens (user_id, token, platform, device_id, app_version, enabled, disabled_reason, last_seen)
  VALUES (v_uid, p_token, p_platform, LEFT(p_device_id, 120), LEFT(p_app_version, 40), TRUE, NULL, NOW())
  ON CONFLICT (token) DO UPDATE SET user_id = v_uid, platform = EXCLUDED.platform, device_id = EXCLUDED.device_id,
    app_version = EXCLUDED.app_version, enabled = TRUE, disabled_reason = NULL, last_seen = NOW();
  INSERT INTO notification_preferences (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.push_unregister_token(p_token TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  DELETE FROM push_tokens WHERE token = p_token AND user_id = auth.uid();
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.notification_prefs_get()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid(); v JSONB;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  INSERT INTO notification_preferences (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT to_jsonb(p) - 'user_id' INTO v FROM notification_preferences p WHERE user_id = v_uid;
  RETURN jsonb_build_object('success', true, 'prefs', v,
    'devices', (SELECT COUNT(*) FROM push_tokens WHERE user_id = v_uid AND enabled));
END;
$$;

CREATE OR REPLACE FUNCTION public.notification_prefs_set(p_prefs JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  INSERT INTO notification_preferences (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  UPDATE notification_preferences SET
    daily_goal = COALESCE((p_prefs->>'daily_goal')::boolean, daily_goal),
    streak = COALESCE((p_prefs->>'streak')::boolean, streak),
    likes = COALESCE((p_prefs->>'likes')::boolean, likes),
    comments = COALESCE((p_prefs->>'comments')::boolean, comments),
    follows = COALESCE((p_prefs->>'follows')::boolean, follows),
    messages = COALESCE((p_prefs->>'messages')::boolean, messages),
    system = COALESCE((p_prefs->>'system')::boolean, system),
    admin = COALESCE((p_prefs->>'admin')::boolean, admin),
    quiet_start = COALESCE(LEAST(GREATEST((p_prefs->>'quiet_start')::int, 0), 23)::smallint, quiet_start),
    quiet_end = COALESCE(LEAST(GREATEST((p_prefs->>'quiet_end')::int, 0), 23)::smallint, quiet_end),
    reminder_hour = COALESCE(LEAST(GREATEST((p_prefs->>'reminder_hour')::int, 0), 23)::smallint, reminder_hour),
    updated_at = NOW()
  WHERE user_id = v_uid;
  RETURN notification_prefs_get();
END;
$$;

-- ----------------------------------------------------------------------------
-- الإدراج في الطابور (داخلي): تفضيلات، dedup، حد معدل، ساعات الهدوء
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._push_enqueue(
  p_user UUID, p_kind TEXT, p_title TEXT, p_body TEXT, p_data JSONB, p_dedup TEXT,
  p_campaign BIGINT DEFAULT NULL, p_scheduled TIMESTAMPTZ DEFAULT NULL, p_expires TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p notification_preferences%ROWTYPE;
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_when TIMESTAMPTZ := COALESCE(p_scheduled, NOW());
  v_local TIMESTAMP;
  v_hour INTEGER;
  v_allowed BOOLEAN;
BEGIN
  IF p_user IS NULL THEN RETURN FALSE; END IF;
  IF NOT EXISTS (SELECT 1 FROM push_tokens WHERE user_id = p_user AND enabled) THEN RETURN FALSE; END IF;
  SELECT * INTO p FROM notification_preferences WHERE user_id = p_user;
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id) VALUES (p_user) ON CONFLICT DO NOTHING;
    SELECT * INTO p FROM notification_preferences WHERE user_id = p_user;
  END IF;
  v_allowed := CASE p_kind
    WHEN 'like' THEN p.likes WHEN 'comment' THEN p.comments WHEN 'follow' THEN p.follows
    WHEN 'message' THEN p.messages WHEN 'daily_goal' THEN p.daily_goal WHEN 'streak' THEN p.streak
    WHEN 'admin' THEN p.admin WHEN 'support' THEN p.system WHEN 'system' THEN p.system ELSE FALSE END;
  IF NOT v_allowed THEN RETURN FALSE; END IF;

  -- حد معدل لإشعارات التفاعل الاجتماعي
  IF p_kind IN ('like', 'comment', 'follow') AND (
    SELECT COUNT(*) FROM notification_outbox
    WHERE user_id = p_user AND kind IN ('like', 'comment', 'follow') AND created_at > NOW() - INTERVAL '1 hour'
  ) >= COALESCE((_coin_cfg('push')->>'social_per_hour')::int, 10) THEN
    RETURN FALSE;
  END IF;

  -- ساعات الهدوء: يؤجَّل للنهاية (الرسائل الخاصة والدعم أيضاً، لكن الحملات تحترمها كذلك)
  v_local := v_when AT TIME ZONE v_tz;
  v_hour := EXTRACT(HOUR FROM v_local);
  IF (p.quiet_start > p.quiet_end AND (v_hour >= p.quiet_start OR v_hour < p.quiet_end))
     OR (p.quiet_start < p.quiet_end AND v_hour >= p.quiet_start AND v_hour < p.quiet_end) THEN
    v_local := date_trunc('day', v_local) + make_interval(hours => p.quiet_end)
               + CASE WHEN v_hour >= p.quiet_end AND p.quiet_start > p.quiet_end THEN INTERVAL '1 day' ELSE INTERVAL '0' END;
    v_when := v_local AT TIME ZONE v_tz;
  END IF;

  INSERT INTO notification_outbox (user_id, kind, title, body, data, dedup_key, campaign_id, scheduled_at, expires_at)
  VALUES (p_user, p_kind, LEFT(p_title, 120), LEFT(p_body, 500), COALESCE(p_data, '{}'::jsonb), p_dedup, p_campaign, v_when, p_expires)
  ON CONFLICT (dedup_key) DO NOTHING;
  RETURN FOUND;
END;
$$;

-- إشعارات التفاعل التي يكتبها السيرفر (إعجاب/تعليق/متابعة) → push (لا يُنتج push لما يكتبه العميل لنفسه)
-- ليست SECURITY DEFINER عمداً: current_user هنا = من نفّذ الإدراج فعلاً (postgres داخل triggers السيرفر،
-- authenticated عند إدراج العميل لإشعاره الخاص) — فلا يُنتج العميل push
CREATE OR REPLACE FUNCTION public._push_from_app_notification()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_url TEXT := NEW.metadata->>'navigateTo';
BEGIN
  IF NEW.type IN ('like', 'comment', 'follow') AND current_user NOT IN ('anon', 'authenticated') THEN
    PERFORM _push_enqueue(NEW.user_id, NEW.type, NEW.title, NEW.message,
      jsonb_build_object('url', COALESCE(v_url, '/'), 'notification_id', NEW.id), 'appn:' || NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_push_app_notification ON app_notifications;
CREATE TRIGGER trg_push_app_notification AFTER INSERT ON app_notifications
  FOR EACH ROW EXECUTE FUNCTION public._push_from_app_notification();

-- رسالة خاصة → push للطرف الآخر (يُدمج عدة رسائل في دقيقتين بإشعار واحد، ويحترم الحظر)
CREATE OR REPLACE FUNCTION public._push_from_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_name TEXT;
BEGIN
  SELECT COALESCE(full_name, username, 'رسالة جديدة') INTO v_name FROM profiles WHERE id = NEW.sender_id;
  FOR r IN SELECT cp.user_id FROM conversation_participants cp
           WHERE cp.conversation_id = NEW.conversation_id AND cp.user_id <> NEW.sender_id LOOP
    IF NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = r.user_id AND b.blocked_id = NEW.sender_id)
                                                OR (b.blocker_id = NEW.sender_id AND b.blocked_id = r.user_id)) THEN
      PERFORM _push_enqueue(r.user_id, 'message', v_name, LEFT(NEW.content, 140),
        jsonb_build_object('url', '/message/' || NEW.conversation_id::text, 'conversation_id', NEW.conversation_id),
        'dm:' || NEW.conversation_id::text || ':' || r.user_id::text || ':' || floor(extract(epoch FROM NEW.created_at) / 120)::bigint::text);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_push_message ON messages;
CREATE TRIGGER trg_push_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public._push_from_message();

-- رد الدعم → push
CREATE OR REPLACE FUNCTION public._push_from_support_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _push_enqueue(NEW.user_id, 'support', NEW.title, NEW.message,
    jsonb_build_object('url', '/support', 'ticket_id', NEW.ticket_id), 'support:' || NEW.id::text);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_push_support ON support_notifications;
CREATE TRIGGER trg_push_support AFTER INSERT ON support_notifications
  FOR EACH ROW EXECUTE FUNCTION public._push_from_support_notification();

-- التذكيرات المجدولة (كل 15 دقيقة): هدف اليوم في ساعة المستخدم، وتحذير السلسلة مساءً
CREATE OR REPLACE FUNCTION public.push_schedule_reminders()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_today DATE := _coin_today();
  v_hour INTEGER := EXTRACT(HOUR FROM NOW() AT TIME ZONE v_tz);
  v_warn_hour INTEGER := COALESCE((_coin_cfg('push')->>'streak_warning_hour')::int, 21);
  v_goal INTEGER := 0; v_streak INTEGER := 0;
  r RECORD;
BEGIN
  -- هدف اليوم لم يكتمل، والمستخدم نشط خلال آخر 7 أيام
  FOR r IN
    SELECT np.user_id, COALESCE(g.daily_target, 2) AS target,
           COALESCE((SELECT lessons FROM user_activity_days a WHERE a.user_id = np.user_id AND a.day = v_today), 0) AS done
    FROM notification_preferences np
    LEFT JOIN user_goals g ON g.user_id = np.user_id
    WHERE np.daily_goal AND np.reminder_hour = v_hour
      AND EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = np.user_id AND t.enabled)
      AND EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = np.user_id AND a.day > v_today - 7 AND NOT a.frozen)
  LOOP
    IF r.done < r.target THEN
      IF _push_enqueue(r.user_id, 'daily_goal', 'هدفك اليومي بانتظارك 🎯',
           CASE WHEN r.done = 0 THEN 'درس واحد قصير يكفي لتبدأ يومك في Kodax.'
                ELSE 'باقي ' || (r.target - r.done) || ' من هدف اليوم. أكملها الآن!' END,
           jsonb_build_object('url', '/learn'), 'goal:' || r.user_id::text || ':' || v_today::text) THEN
        v_goal := v_goal + 1;
      END IF;
    END IF;
  END LOOP;

  -- السلسلة مهددة: سلسلة قائمة ولا نشاط اليوم
  IF v_hour = v_warn_hour THEN
    FOR r IN
      SELECT s.user_id, s.current_streak, s.freezes FROM user_streaks s
      JOIN notification_preferences np ON np.user_id = s.user_id AND np.streak
      WHERE s.current_streak >= 2
        AND s.last_active_day = v_today - 1
        AND EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = s.user_id AND t.enabled)
    LOOP
      IF _push_enqueue(r.user_id, 'streak', 'سلسلتك (' || r.current_streak || ' يوم) في خطر 🔥',
           CASE WHEN r.freezes > 0 THEN 'لديك تجميد متاح، لكن درساً واحداً اليوم يحافظ عليها دون استخدامه.'
                ELSE 'أكمل درساً واحداً قبل منتصف الليل حتى لا تفقدها.' END,
           jsonb_build_object('url', '/learn'), 'streak:' || r.user_id::text || ':' || v_today::text) THEN
        v_streak := v_streak + 1;
      END IF;
    END LOOP;
  END IF;
  RETURN jsonb_build_object('daily_goal', v_goal, 'streak', v_streak, 'hour', v_hour);
END;
$$;

-- ----------------------------------------------------------------------------
-- الإرسال (يستدعيها push-send بصلاحية service_role فقط)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.push_claim_batch(p_limit INTEGER DEFAULT 200)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_rows JSONB;
BEGIN
  -- منتهية الصلاحية أو حملات ملغاة
  UPDATE notification_outbox SET status = 'cancelled', last_error = 'expired'
  WHERE status = 'queued' AND expires_at IS NOT NULL AND expires_at < NOW();
  -- عالقة في sending (انقطاع سابق) تعود للطابور
  UPDATE notification_outbox SET status = 'queued'
  WHERE status = 'sending' AND sent_at IS NULL AND created_at < NOW() - INTERVAL '10 minutes'
    AND attempts < COALESCE((_coin_cfg('push')->>'max_attempts')::int, 3);

  WITH picked AS (
    SELECT id FROM notification_outbox
    WHERE status = 'queued' AND scheduled_at <= NOW()
    ORDER BY scheduled_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500)
    FOR UPDATE SKIP LOCKED
  ), upd AS (
    UPDATE notification_outbox o SET status = 'sending', attempts = attempts + 1
    FROM picked WHERE o.id = picked.id
    RETURNING o.id, o.user_id, o.kind, o.title, o.body, o.data, o.campaign_id
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'id', u.id, 'kind', u.kind, 'title', u.title, 'body', u.body, 'data', u.data,
           'image', (SELECT c.image_url FROM notification_campaigns c WHERE c.id = u.campaign_id),
           'tokens', COALESCE((SELECT jsonb_agg(t.token) FROM push_tokens t WHERE t.user_id = u.user_id AND t.enabled), '[]'::jsonb))), '[]'::jsonb)
  INTO v_rows FROM upd u;
  RETURN v_rows;
END;
$$;

-- نتيجة الإرسال: p_results = [{id, ok, tickets, error, invalid_tokens: []}]
CREATE OR REPLACE FUNCTION public.push_record_results(p_results JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSONB; v_max INTEGER := COALESCE((_coin_cfg('push')->>'max_attempts')::int, 3); v_sent INTEGER := 0; v_failed INTEGER := 0;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(COALESCE(p_results, '[]'::jsonb)) LOOP
    UPDATE push_tokens SET enabled = FALSE, disabled_reason = 'DeviceNotRegistered'
    WHERE token IN (SELECT jsonb_array_elements_text(COALESCE(r->'invalid_tokens', '[]'::jsonb)));
    IF COALESCE((r->>'skipped')::boolean, false) THEN
      UPDATE notification_outbox SET status = 'skipped', last_error = r->>'error' WHERE id = (r->>'id')::bigint;
    ELSIF COALESCE((r->>'ok')::boolean, false) THEN
      UPDATE notification_outbox SET status = 'sent', sent_at = NOW(), tickets = r->'tickets', last_error = NULL WHERE id = (r->>'id')::bigint;
      v_sent := v_sent + 1;
    ELSE
      UPDATE notification_outbox
      SET status = CASE WHEN attempts >= v_max THEN 'failed' ELSE 'queued' END,
          scheduled_at = NOW() + make_interval(mins => attempts * 2),
          last_error = LEFT(r->>'error', 300)
      WHERE id = (r->>'id')::bigint;
      v_failed := v_failed + 1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('sent', v_sent, 'failed', v_failed);
END;
$$;

-- إيصالات التسليم من Expo (بعد 15 دقيقة من الإرسال)
CREATE OR REPLACE FUNCTION public.push_receipts_due(p_limit INTEGER DEFAULT 300)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'tickets', tickets)), '[]'::jsonb) FROM (
    SELECT id, tickets FROM notification_outbox
    WHERE status = 'sent' AND tickets IS NOT NULL AND sent_at < NOW() - INTERVAL '15 minutes'
      AND (receipt_checked_at IS NULL) AND sent_at > NOW() - INTERVAL '1 day'
    ORDER BY sent_at LIMIT LEAST(GREATEST(COALESCE(p_limit, 300), 1), 1000)) x;
$$;

-- p_results = [{id, delivered: bool, error, invalid_tokens: []}]
CREATE OR REPLACE FUNCTION public.push_record_receipts(p_results JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSONB; n INTEGER := 0;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(COALESCE(p_results, '[]'::jsonb)) LOOP
    UPDATE push_tokens SET enabled = FALSE, disabled_reason = 'DeviceNotRegistered'
    WHERE token IN (SELECT jsonb_array_elements_text(COALESCE(r->'invalid_tokens', '[]'::jsonb)));
    UPDATE notification_outbox
    SET status = CASE WHEN COALESCE((r->>'delivered')::boolean, false) THEN 'delivered' ELSE 'failed' END,
        last_error = CASE WHEN COALESCE((r->>'delivered')::boolean, false) THEN NULL ELSE LEFT(r->>'error', 300) END,
        receipt_checked_at = NOW()
    WHERE id = (r->>'id')::bigint;
    n := n + 1;
  END LOOP;
  RETURN jsonb_build_object('updated', n);
END;
$$;

-- ----------------------------------------------------------------------------
-- حملات المشرف (Phase L)
-- ----------------------------------------------------------------------------
-- المستلمون: من لديهم جهاز مفعّل ولم يُطفئوا رسائل الإدارة
CREATE OR REPLACE FUNCTION public._campaign_recipients(p_target_type TEXT, p_target JSONB)
RETURNS TABLE(user_id UUID) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_today DATE := _coin_today();
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.id FROM profiles p
  WHERE EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = p.id AND t.enabled)
    AND NOT EXISTS (SELECT 1 FROM notification_preferences np WHERE np.user_id = p.id AND NOT np.admin)
    AND NOT COALESCE(p.is_banned, false)
    AND CASE p_target_type
      WHEN 'user' THEN p.id = NULLIF(p_target->>'user_id', '')::uuid
      WHEN 'users' THEN p.id IN (SELECT jsonb_array_elements_text(COALESCE(p_target->'user_ids', '[]'::jsonb))::uuid)
      WHEN 'all' THEN TRUE
      WHEN 'segment' THEN (
        CASE COALESCE(p_target->>'segment', '')
          WHEN 'inactive_7d' THEN NOT EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = p.id AND a.day > v_today - 7 AND NOT a.frozen)
          WHEN 'active_7d' THEN EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = p.id AND a.day > v_today - 7 AND NOT a.frozen)
          WHEN 'new_7d' THEN p.created_at > NOW() - INTERVAL '7 days'
          WHEN 'streak_active' THEN EXISTS (SELECT 1 FROM user_streaks s WHERE s.user_id = p.id AND s.current_streak > 0)
          WHEN 'level_min' THEN kodax_level(COALESCE(p.xp, 0)) >= COALESCE((p_target->>'value')::int, 1)
          WHEN 'course' THEN EXISTS (SELECT 1 FROM user_lesson_progress u WHERE u.user_id = p.id AND u.course_id = p_target->>'value' AND u.verified AND u.completed)
          WHEN 'province' THEN p.province = p_target->>'value'
          ELSE FALSE END)
      ELSE FALSE END;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_campaign_preview(p_target_type TEXT, p_target JSONB)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN jsonb_build_object('success', true,
    'recipients', (SELECT COUNT(*) FROM _campaign_recipients(p_target_type, p_target)),
    'users_without_device', CASE WHEN p_target_type IN ('user', 'users') THEN
      (SELECT COUNT(*) FROM profiles p WHERE (p_target_type = 'user' AND p.id = NULLIF(p_target->>'user_id', '')::uuid)
                                           OR (p_target_type = 'users' AND p.id IN (SELECT jsonb_array_elements_text(COALESCE(p_target->'user_ids', '[]'::jsonb))::uuid)))
      - (SELECT COUNT(*) FROM _campaign_recipients(p_target_type, p_target)) END);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_campaign(
  p_title TEXT, p_body TEXT, p_target_type TEXT, p_target JSONB,
  p_deep_link TEXT DEFAULT NULL, p_image_url TEXT DEFAULT NULL,
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL, p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_confirm_recipients INTEGER DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin UUID := _require_admin();
  v_id BIGINT;
  v_count INTEGER;
  v_queued INTEGER := 0;
  r RECORD;
BEGIN
  IF p_title IS NULL OR length(trim(p_title)) = 0 OR length(p_title) > 120 THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_title'); END IF;
  IF p_body IS NULL OR length(trim(p_body)) = 0 OR length(p_body) > 500 THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_body'); END IF;
  IF p_target_type NOT IN ('user', 'users', 'segment', 'all') THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_target'); END IF;
  IF p_deep_link IS NOT NULL AND p_deep_link !~ '^/[A-Za-z0-9/_\-\[\]?=&.]*$' THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_deep_link'); END IF;
  IF p_image_url IS NOT NULL AND p_image_url !~ '^https://' THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_image'); END IF;
  IF p_expires_at IS NOT NULL AND p_expires_at <= COALESCE(p_scheduled_at, NOW()) THEN RETURN jsonb_build_object('success', false, 'code', 'invalid_expiry'); END IF;

  SELECT COUNT(*) INTO v_count FROM _campaign_recipients(p_target_type, p_target);
  IF v_count = 0 THEN RETURN jsonb_build_object('success', false, 'code', 'no_recipients'); END IF;
  -- الإرسال للجميع/لشريحة يتطلب تأكيد العدد الذي رآه المشرف في المعاينة
  IF p_target_type IN ('all', 'segment') AND (p_confirm_recipients IS NULL OR p_confirm_recipients <> v_count) THEN
    RETURN jsonb_build_object('success', false, 'code', 'confirmation_required', 'recipients', v_count);
  END IF;

  INSERT INTO notification_campaigns (created_by, title, body, image_url, deep_link, target_type, target, recipients, scheduled_at, expires_at)
  VALUES (v_admin, trim(p_title), trim(p_body), p_image_url, p_deep_link, p_target_type, COALESCE(p_target, '{}'::jsonb), v_count,
          COALESCE(p_scheduled_at, NOW()), p_expires_at)
  RETURNING id INTO v_id;

  FOR r IN SELECT user_id FROM _campaign_recipients(p_target_type, p_target) LOOP
    IF _push_enqueue(r.user_id, 'admin', trim(p_title), trim(p_body),
         jsonb_build_object('url', COALESCE(p_deep_link, '/'), 'campaign_id', v_id),
         'campaign:' || v_id::text || ':' || r.user_id::text, v_id, COALESCE(p_scheduled_at, NOW()), p_expires_at) THEN
      v_queued := v_queued + 1;
    END IF;
  END LOOP;

  PERFORM _admin_audit('create_campaign', 'campaign', v_id::text, NULL,
    jsonb_build_object('target_type', p_target_type, 'target', p_target, 'recipients', v_count, 'queued', v_queued));
  RETURN jsonb_build_object('success', true, 'campaign_id', v_id, 'recipients', v_count, 'queued', v_queued);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_cancel_campaign(p_campaign BIGINT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); n INTEGER;
BEGIN
  UPDATE notification_campaigns SET status = 'cancelled' WHERE id = p_campaign AND status = 'queued';
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'not_found'); END IF;
  UPDATE notification_outbox SET status = 'cancelled', last_error = 'campaign cancelled'
  WHERE campaign_id = p_campaign AND status = 'queued';
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM _admin_audit('cancel_campaign', 'campaign', p_campaign::text, NULL, jsonb_build_object('cancelled', n));
  RETURN jsonb_build_object('success', true, 'cancelled', n);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_campaigns(p_limit INTEGER DEFAULT 50)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN jsonb_build_object(
    'campaigns', COALESCE((SELECT jsonb_agg(c ORDER BY c.created_at DESC) FROM (
      SELECT nc.id, nc.title, nc.body, nc.image_url, nc.deep_link, nc.target_type, nc.target, nc.recipients,
             nc.scheduled_at, nc.expires_at, nc.status, nc.created_at, ap.username AS creator,
             COUNT(o.*) FILTER (WHERE o.status IN ('sent', 'delivered')) AS sent,
             COUNT(o.*) FILTER (WHERE o.status = 'delivered') AS delivered,
             COUNT(o.*) FILTER (WHERE o.status = 'failed') AS failed,
             COUNT(o.*) FILTER (WHERE o.status IN ('queued', 'sending')) AS pending,
             COUNT(o.*) FILTER (WHERE o.status IN ('cancelled', 'skipped')) AS cancelled
      FROM notification_campaigns nc
      LEFT JOIN profiles ap ON ap.id = nc.created_by
      LEFT JOIN notification_outbox o ON o.campaign_id = nc.id
      GROUP BY nc.id, ap.username
      ORDER BY nc.created_at DESC LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200)) c), '[]'::jsonb),
    'system', jsonb_build_object(
      'devices', (SELECT COUNT(*) FROM push_tokens WHERE enabled),
      'users_with_device', (SELECT COUNT(DISTINCT user_id) FROM push_tokens WHERE enabled),
      'disabled_tokens', (SELECT COUNT(*) FROM push_tokens WHERE NOT enabled),
      'outbox_24h', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
          SELECT status, COUNT(*) n FROM notification_outbox WHERE created_at > NOW() - INTERVAL '1 day' GROUP BY status) x), '{}'::jsonb),
      'by_kind_7d', COALESCE((SELECT jsonb_object_agg(kind, n) FROM (
          SELECT kind, COUNT(*) n FROM notification_outbox WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY kind) x), '{}'::jsonb),
      'recent_errors', COALESCE((SELECT jsonb_agg(e) FROM (
          SELECT kind, last_error, created_at FROM notification_outbox WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10) e), '[]'::jsonb))
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- الصلاحيات
-- ----------------------------------------------------------------------------
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'push_register_token(text, text, text, text)', 'push_unregister_token(text)',
    'notification_prefs_get()', 'notification_prefs_set(jsonb)',
    'admin_campaign_preview(text, jsonb)', 'admin_create_campaign(text, text, text, jsonb, text, text, timestamptz, timestamptz, integer)',
    'admin_cancel_campaign(bigint)', 'admin_campaigns(integer)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'push_claim_batch(integer)', 'push_record_results(jsonb)', 'push_receipts_due(integer)', 'push_record_receipts(jsonb)',
    'push_schedule_reminders()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    '_push_enqueue(uuid, text, text, text, jsonb, text, bigint, timestamptz, timestamptz)', '_campaign_recipients(text, jsonb)',
    '_push_from_app_notification()', '_push_from_message()', '_push_from_support_notification()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- الجدولة (الإنتاج فقط؛ تُتجاوز إن لم تتوفر pg_cron/pg_net/vault كما في الاختبار المحلي)
-- السر يُنشأ خارج Git في Vault باسم push_cron_secret، ونفس القيمة في secrets الدالة PUSH_CRON_SECRET.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_net')
     AND to_regnamespace('vault') IS NOT NULL THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('kodax-push-send', 'kodax-push-reminders');
    PERFORM cron.schedule('kodax-push-reminders', '*/15 * * * *', 'SELECT public.push_schedule_reminders();');
    PERFORM cron.schedule('kodax-push-send', '* * * * *', $job$
      SELECT net.http_post(
        url := 'https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/push-send',
        headers := jsonb_build_object('Content-Type', 'application/json',
          'x-cron-secret', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret' LIMIT 1), '')),
        body := '{}'::jsonb,
        timeout_milliseconds := 25000)
      WHERE EXISTS (SELECT 1 FROM public.notification_outbox
                    WHERE (status = 'queued' AND scheduled_at <= NOW())
                       OR (status = 'sent' AND receipt_checked_at IS NULL AND sent_at < NOW() - INTERVAL '15 minutes' AND sent_at > NOW() - INTERVAL '1 day'));
    $job$);
  END IF;
END $$;
