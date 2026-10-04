-- ============================================================================
-- الإشعارات: ساعات الهدوء لا تؤخّر الإشعارات المباشرة
-- ----------------------------------------------------------------------------
-- ساعات الهدوء مفعّلة افتراضياً (23:00–08:00 بتوقيت بغداد)، وكانت تؤجّل كل الأنواع للصباح —
-- فرسالة خاصة أو رد دعم بعد 11 مساءً لا يصل قبل 8 صباحاً (وبدا للمستخدم أن الإشعارات لا تعمل).
-- الآن: الرسائل الخاصة وردود الدعم وتنبيهات النظام تُرسل فوراً؛ وتبقى ساعات الهدوء لحملات Kodax
-- والتذكيرات والإعجابات/التعليقات/المتابعات. بقية منطق _push_enqueue كما هو.
-- ============================================================================

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

  -- ساعات الهدوء: تؤجَّل الأنواع غير العاجلة لنهايتها؛ الرسائل الخاصة والدعم والنظام فورية
  IF p_kind NOT IN ('message', 'support', 'system') THEN
    v_local := v_when AT TIME ZONE v_tz;
    v_hour := EXTRACT(HOUR FROM v_local);
    IF (p.quiet_start > p.quiet_end AND (v_hour >= p.quiet_start OR v_hour < p.quiet_end))
       OR (p.quiet_start < p.quiet_end AND v_hour >= p.quiet_start AND v_hour < p.quiet_end) THEN
      v_local := date_trunc('day', v_local) + make_interval(hours => p.quiet_end)
                 + CASE WHEN v_hour >= p.quiet_end AND p.quiet_start > p.quiet_end THEN INTERVAL '1 day' ELSE INTERVAL '0' END;
      v_when := v_local AT TIME ZONE v_tz;
    END IF;
  END IF;

  INSERT INTO notification_outbox (user_id, kind, title, body, data, dedup_key, campaign_id, scheduled_at, expires_at)
  VALUES (p_user, p_kind, LEFT(p_title, 120), LEFT(p_body, 500), COALESCE(p_data, '{}'::jsonb), p_dedup, p_campaign, v_when, p_expires)
  ON CONFLICT (dedup_key) DO NOTHING;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public._push_enqueue(uuid, text, text, text, jsonb, text, bigint, timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
