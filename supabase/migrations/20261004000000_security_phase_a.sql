-- ============================================================================
-- Phase A: إكمال تقوية الأمان بعد G-1 (فحص كامل لكل دوال SECURITY DEFINER وسياسات الكتابة)
-- ----------------------------------------------------------------------------
-- 1) search_path ثابت لكل دوال SECURITY DEFINER المتبقية بدونه
-- 2) IDOR: دوال تقبل p_user_id من العميل (حالة الحظر، الرسائل العامة، قراءة الرسالة)
-- 3) دوال قديمة غير مستخدمة كانت مفتوحة لـ anon (تكشف/تعدّل بيانات أي مستخدم) → للسيرفر فقط
-- 4) عدّادات profiles العامة (المتابعون...) لم تكن محمية من تعديل صاحب الحساب
-- 5) عتبات الشهادات على السيرفر = ما يعرضه التطبيق (السيرفر صار لا يقبل عتبات من العميل)
-- لا حذف بيانات. التواقيع كما هي.
-- ============================================================================

-- 1) search_path
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'check_user_ai_limit(uuid, integer)', 'check_user_restrictions(uuid)', 'get_ai_free_uses(uuid)',
    'get_last_completed_lesson(uuid, text)', 'get_unread_broadcast_messages(uuid)',
    'get_user_ai_cost(uuid, timestamp with time zone, timestamp with time zone)',
    'get_user_certificates_summary(uuid)', 'handle_new_user()', 'handle_new_user_profile()',
    'mark_broadcast_message_read(uuid, uuid)', 'sync_payment_notification_to_app()',
    'update_conversation_timestamp()', 'update_follow_counts()', 'use_ai_free_attempt(uuid, text)',
    'verify_certificate(uuid)'
  ] LOOP
    IF to_regprocedure('public.' || f) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public', f);
    END IF;
  END LOOP;
END $$;

-- سياق السيرفر (service_role / postgres) مقابل طلبات العميل
CREATE OR REPLACE FUNCTION public._is_client_request()
RETURNS BOOLEAN LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(auth.role(), '') IN ('anon', 'authenticated')
      OR COALESCE(current_setting('role', true), '') IN ('anon', 'authenticated');
$$;
REVOKE ALL ON FUNCTION public._is_client_request() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public._is_client_request() TO anon, authenticated, service_role;

-- 2) حالة الحظر: المستخدم يرى حالته فقط (كانت تكشف سبب حظر أي مستخدم)
CREATE OR REPLACE FUNCTION public.check_user_restrictions(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() AND _is_client_request() AND NOT is_admin() THEN
    RETURN json_build_object('is_banned', false, 'is_purchase_blocked', false, 'ban_reason', null);
  END IF;
  SELECT json_build_object(
    'is_banned', COALESCE(p.is_banned, false),
    'is_purchase_blocked', COALESCE(p.is_purchase_blocked, false),
    'ban_reason', p.ban_reason
  ) INTO result
  FROM profiles p
  WHERE p.id = p_user_id;
  IF result IS NULL THEN
    RETURN json_build_object('is_banned', false, 'is_purchase_blocked', false, 'ban_reason', null);
  END IF;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.check_user_restrictions(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_user_restrictions(UUID) TO authenticated, service_role;

-- الرسائل العامة: لا قراءة/تعليم نيابة عن مستخدم آخر
CREATE OR REPLACE FUNCTION public.get_unread_broadcast_messages(p_user_id UUID)
RETURNS TABLE(id UUID, type TEXT, title TEXT, body TEXT, image_url TEXT, display_mode TEXT,
              scheduled_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_created_at TIMESTAMPTZ;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() AND _is_client_request() THEN
    RETURN;
  END IF;
  SELECT au.created_at INTO v_user_created_at FROM auth.users au WHERE au.id = p_user_id;
  RETURN QUERY
  SELECT bm.id, bm.type, bm.title, bm.body, bm.image_url, bm.display_mode, bm.scheduled_at, bm.created_at
  FROM broadcast_messages bm
  WHERE bm.is_active = true
    AND bm.scheduled_at <= NOW()
    AND (bm.expires_at IS NULL OR bm.expires_at > NOW())
    AND (bm.only_existing_users = false OR v_user_created_at <= bm.scheduled_at)
    AND NOT EXISTS (
      SELECT 1 FROM broadcast_message_reads bmr WHERE bmr.message_id = bm.id AND bmr.user_id = p_user_id
    )
  ORDER BY bm.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.get_unread_broadcast_messages(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_unread_broadcast_messages(UUID) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mark_broadcast_message_read(p_message_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() AND _is_client_request() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  INSERT INTO broadcast_message_reads (message_id, user_id)
  VALUES (p_message_id, p_user_id)
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.mark_broadcast_message_read(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_broadcast_message_read(UUID, UUID) TO authenticated, service_role;

-- 3) دوال قديمة غير مستخدمة من التطبيق: للسيرفر فقط
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'use_ai_free_attempt(uuid, text)', 'check_user_ai_limit(uuid, integer)', 'get_ai_free_uses(uuid)',
    'get_user_ai_cost(uuid, timestamp with time zone, timestamp with time zone)',
    'get_last_completed_lesson(uuid, text)', 'get_user_certificates_summary(uuid)'
  ] LOOP
    IF to_regprocedure('public.' || f) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
    END IF;
  END LOOP;
END $$;

-- 4) حماية أعمدة profiles (تكملة G-1): العدّادات والأرصدة القديمة يكتبها السيرفر/الـtriggers فقط
CREATE OR REPLACE FUNCTION public._protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.xp := 0;
      NEW.level := 1;
      NEW.is_purchase_blocked := FALSE;
      NEW.streak_days := 0;
      NEW.is_banned := FALSE;
      NEW.ban_reason := NULL;
      NEW.banned_at := NULL;
      NEW.banned_by := NULL;
      NEW.followers_count := 0;
      NEW.following_count := 0;
      NEW.store_credits := 0;
      NEW.xp_points := 0;
      NEW.ai_solve_uses_remaining := 3;
      NEW.ai_explain_uses_remaining := 3;
    ELSE
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.is_purchase_blocked := OLD.is_purchase_blocked;
      NEW.streak_days := OLD.streak_days;
      NEW.is_banned := OLD.is_banned;
      NEW.ban_reason := OLD.ban_reason;
      NEW.banned_at := OLD.banned_at;
      NEW.banned_by := OLD.banned_by;
      NEW.followers_count := OLD.followers_count;
      NEW.following_count := OLD.following_count;
      NEW.store_credits := OLD.store_credits;
      NEW.xp_points := OLD.xp_points;
      NEW.ai_solve_uses_remaining := OLD.ai_solve_uses_remaining;
      NEW.ai_explain_uses_remaining := OLD.ai_explain_uses_remaining;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5) عتبات الشهادات الافتراضية = LEVEL_REQUIREMENTS في التطبيق (الاختبار النهائي غير مفعّل)
UPDATE certificate_requirements SET min_lessons_percent = 50, min_challenges_percent = 25, min_exam_score = 0, updated_at = NOW()
WHERE course_id = '__default__' AND level = 'silver';
UPDATE certificate_requirements SET min_lessons_percent = 75, min_challenges_percent = 60, min_exam_score = 0, updated_at = NOW()
WHERE course_id = '__default__' AND level = 'gold';
UPDATE certificate_requirements SET min_lessons_percent = 100, min_challenges_percent = 100, min_exam_score = 0, max_challenge_errors = 0, updated_at = NOW()
WHERE course_id = '__default__' AND level = 'platinum';

-- 6) الحظر يمنع إشعارات التفاعل والمتابعة (كان المحظور يستطيع المتابعة/الإعجاب/التعليق فيصل إشعار لمن حظره)
CREATE OR REPLACE FUNCTION public.insert_interaction_notification(
  p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT, p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor UUID;
BEGIN
  BEGIN
    v_actor := NULLIF(p_metadata->>'actorId', '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_actor := NULL;
  END;
  IF v_actor IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = p_user_id AND blocked_id = v_actor)
       OR (blocker_id = v_actor AND blocked_id = p_user_id)
  ) THEN
    RETURN;
  END IF;

  -- تجنب التكرار: لا تُرسل إشعارين لنفس التفاعل خلال 5 دقائق
  IF EXISTS (
    SELECT 1 FROM app_notifications
    WHERE user_id = p_user_id
      AND type = p_type
      AND metadata @> p_metadata
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO app_notifications (id, user_id, type, title, message, read, metadata, created_at)
  VALUES (gen_random_uuid(), p_user_id, p_type, p_title, p_message, FALSE, p_metadata, NOW());
END;
$$;
REVOKE ALL ON FUNCTION public.insert_interaction_notification(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_interaction_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- هل بين المستخدم الحالي وهذا المستخدم حظر (بأي اتجاه)؟ لا تجيب إلا عن علاقة يكون المستدعي طرفاً فيها.
-- (سياسات RLS على user_blocks تخفي حظر الطرف الآخر عن المحظور، لذلك تحتاج السياسات هذه الدالة)
CREATE OR REPLACE FUNCTION public.is_blocked_with(p_other UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = auth.uid() AND blocked_id = p_other)
       OR (blocker_id = p_other AND blocked_id = auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.is_blocked_with(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked_with(UUID) TO authenticated, service_role;

-- لا يمكن متابعة من حظرك أو من حظرته، ولا متابعة النفس
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id <> following_id
    AND NOT is_blocked_with(following_id)
  );

-- 7) التخزين العام: صور فقط وبحجم معقول (كان أي نوع وأي حجم — ملفات APK/HTML تُخدم من نطاق المشروع)
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    UPDATE storage.buckets SET file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    WHERE id IN ('avatars', 'broadcast-images');
  END IF;
END $$;
