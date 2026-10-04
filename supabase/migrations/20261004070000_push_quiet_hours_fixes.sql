-- ============================================================================
-- الإشعارات: إصلاحان في تأجيل ساعات الهدوء
-- ----------------------------------------------------------------------------
-- 1) موعد حدّده المشرف صريحاً (p_scheduled_at) كانت ساعات الهدوء تنقله بصمت إلى نهايتها،
--    فحملة مجدولة الساعة 2 ليلاً تُرسَل 8 صباحاً بلا أي إشارة للمشرف. الآن الموعد الصريح يُحترم.
-- 2) التأجيل كان قد يتجاوز expires_at، فيُلغى الإشعار بصمت ('expired') ولا يصل أبداً:
--    حملة تُرسَل 11 مساءً وتنتهي بعد ساعتين كانت تُؤجَّل لـ8 صباحاً ثم تُلغى. الآن لا نؤجّل
--    إلى ما بعد انتهاء الصلاحية — يُرسَل في موعده الأصلي بدل أن يضيع.
--
-- بقية المنطق كما هو: الرسائل الخاصة والدعم والنظام فورية، والتفاعل الاجتماعي والحملات
-- والتذكيرات تحترم ساعات الهدوء.
-- ============================================================================

DROP FUNCTION IF EXISTS public._push_enqueue(uuid, text, text, text, jsonb, text, bigint, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public._push_enqueue(
  p_user UUID, p_kind TEXT, p_title TEXT, p_body TEXT, p_data JSONB, p_dedup TEXT,
  p_campaign BIGINT DEFAULT NULL, p_scheduled TIMESTAMPTZ DEFAULT NULL, p_expires TIMESTAMPTZ DEFAULT NULL,
  p_respect_quiet BOOLEAN DEFAULT TRUE
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p notification_preferences%ROWTYPE;
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_when TIMESTAMPTZ := COALESCE(p_scheduled, NOW());
  v_local TIMESTAMP;
  v_hour INTEGER;
  v_deferred TIMESTAMPTZ;
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

  -- ساعات الهدوء: تؤجَّل الأنواع غير العاجلة لنهايتها؛ الرسائل الخاصة والدعم والنظام فورية،
  -- والموعد الذي حدّده المشرف صريحاً (p_respect_quiet = FALSE) يُحترم كما هو
  IF p_respect_quiet AND p_kind NOT IN ('message', 'support', 'system') THEN
    v_local := v_when AT TIME ZONE v_tz;
    v_hour := EXTRACT(HOUR FROM v_local);
    IF (p.quiet_start > p.quiet_end AND (v_hour >= p.quiet_start OR v_hour < p.quiet_end))
       OR (p.quiet_start < p.quiet_end AND v_hour >= p.quiet_start AND v_hour < p.quiet_end) THEN
      v_local := date_trunc('day', v_local) + make_interval(hours => p.quiet_end)
                 + CASE WHEN v_hour >= p.quiet_end AND p.quiet_start > p.quiet_end THEN INTERVAL '1 day' ELSE INTERVAL '0' END;
      v_deferred := v_local AT TIME ZONE v_tz;
      -- لا نؤجّل إلى ما بعد انتهاء الصلاحية، وإلا أُلغي بصمت ولم يصل أبداً
      IF p_expires IS NULL OR v_deferred < p_expires THEN
        v_when := v_deferred;
      END IF;
    END IF;
  END IF;

  INSERT INTO notification_outbox (user_id, kind, title, body, data, dedup_key, campaign_id, scheduled_at, expires_at)
  VALUES (p_user, p_kind, LEFT(p_title, 120), LEFT(p_body, 500), COALESCE(p_data, '{}'::jsonb), p_dedup, p_campaign, v_when, p_expires)
  ON CONFLICT (dedup_key) DO NOTHING;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public._push_enqueue(uuid, text, text, text, jsonb, text, bigint, timestamptz, timestamptz, boolean) FROM PUBLIC, anon, authenticated;

-- الحملات: الموعد الصريح يُحترم، و"أرسل الآن" يحترم ساعات الهدوء كما كان
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
         'campaign:' || v_id::text || ':' || r.user_id::text, v_id, COALESCE(p_scheduled_at, NOW()), p_expires_at,
         p_scheduled_at IS NULL) THEN
      v_queued := v_queued + 1;
    END IF;
  END LOOP;

  PERFORM _admin_audit('create_campaign', 'campaign', v_id::text, NULL,
    jsonb_build_object('target_type', p_target_type, 'target', p_target, 'recipients', v_count, 'queued', v_queued));
  RETURN jsonb_build_object('success', true, 'campaign_id', v_id, 'recipients', v_count, 'queued', v_queued);
END;
$$;

DO $$
BEGIN
  EXECUTE 'REVOKE ALL ON FUNCTION public.admin_create_campaign(text, text, text, jsonb, text, text, timestamptz, timestamptz, integer) FROM PUBLIC, anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.admin_create_campaign(text, text, text, jsonb, text, text, timestamptz, timestamptz, integer) TO authenticated';
END $$;
