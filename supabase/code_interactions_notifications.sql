-- ================================================================
-- Migration: إشعارات تفاعل الأكواد (لايك + تعليق + متابعة)
-- ================================================================
-- يُنشئ تلقائياً إشعارات داخل التطبيق عند:
-- - إعجاب شخص بكود نشرته
-- - تعليق شخص على كود نشرته
-- - متابعة شخص لك
--
-- الطريقة: Database Triggers + SECURITY DEFINER
-- (لتجاوز RLS عند الإدراج في app_notifications لمستخدم آخر)
--
-- ⚠️ تستخدم gen_random_uuid() وليس gen_random_uuid()
--    لأن gen_random_uuid() مدمج في PostgreSQL 13+ بدون أي امتداد
-- ================================================================

-- ================================================================
-- 1. إضافة أنواع 'like' | 'comment' | 'follow' إذا لم تكن موجودة
-- ================================================================
DO $$
BEGIN
  -- إزالة القيد القديم وإعادة إنشائه مع الأنواع الجديدة
  ALTER TABLE app_notifications
    DROP CONSTRAINT IF EXISTS app_notifications_type_check;

  ALTER TABLE app_notifications
    ADD CONSTRAINT app_notifications_type_check
    CHECK (type IN (
      'badge',
      'level_up',
      'challenge',
      'lesson',
      'course',
      'streak',
      'xp',
      'purchase',
      'system',
      'payment_approved',
      'payment_rejected',
      'follow',
      'profile_update',
      'like',
      'comment'
    ));
END $$;

-- ================================================================
-- 2. تفعيل Realtime على app_notifications
--    (ضروري لاستقبال الإشعارات فورياً في التطبيق)
-- ================================================================
ALTER TABLE app_notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- إضافة جدول app_notifications إلى publication الخاص بـ Realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'app_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_notifications;
  END IF;
END $$;

-- ================================================================
-- 3. دالة SECURITY DEFINER لإدراج الإشعارات
--    تعمل بصلاحيات postgres لتجاوز RLS عند الإدراج لمستخدم آخر
-- ================================================================
CREATE OR REPLACE FUNCTION insert_interaction_notification(
  p_user_id     UUID,
  p_type        TEXT,
  p_title       TEXT,
  p_message     TEXT,
  p_metadata    JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تجنب التكرار: لا تُرسل إشعارين لنفس التفاعل خلال 5 دقائق
  IF EXISTS (
    SELECT 1 FROM app_notifications
    WHERE user_id   = p_user_id
      AND type      = p_type
      AND metadata  @> p_metadata
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO app_notifications (
    id,
    user_id,
    type,
    title,
    message,
    read,
    metadata,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    p_type,
    p_title,
    p_message,
    FALSE,
    p_metadata,
    NOW()
  );
END;
$$;

-- ================================================================
-- 4. Trigger Function: إشعار عند الإعجاب بكود
-- ================================================================
CREATE OR REPLACE FUNCTION notify_on_code_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id     UUID;
  v_snippet_title TEXT;
  v_liker_name   TEXT;
  v_snippet_id   TEXT;
BEGIN
  -- الحصول على مالك الكود + عنوانه
  SELECT
    cs.user_id,
    cs.title
  INTO v_owner_id, v_snippet_title
  FROM code_snippets cs
  WHERE cs.id = NEW.snippet_id;

  -- لا تُرسل إشعاراً لنفسك
  IF v_owner_id IS NULL OR v_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- الحصول على اسم الشخص الذي أعجب
  SELECT COALESCE(full_name, username, 'شخص ما')
  INTO v_liker_name
  FROM profiles
  WHERE id = NEW.user_id;

  v_snippet_id := NEW.snippet_id::TEXT;

  -- إنشاء الإشعار
  PERFORM insert_interaction_notification(
    v_owner_id,
    'like',
    'إعجاب جديد بكودك! ❤️',
    v_liker_name || ' أعجب بكودك "' || COALESCE(v_snippet_title, 'الكود') || '"',
    jsonb_build_object(
      'snippetId',  v_snippet_id,
      'actorId',    NEW.user_id::TEXT,
      'actorName',  v_liker_name,
      'navigateTo', '/code/' || v_snippet_id
    )
  );

  RETURN NEW;
END;
$$;

-- ================================================================
-- 5. Trigger Function: إشعار عند التعليق على كود
-- ================================================================
CREATE OR REPLACE FUNCTION notify_on_code_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id      UUID;
  v_snippet_title TEXT;
  v_commenter_name TEXT;
  v_snippet_id    TEXT;
  v_preview       TEXT;
BEGIN
  -- الحصول على مالك الكود + عنوانه
  SELECT
    cs.user_id,
    cs.title
  INTO v_owner_id, v_snippet_title
  FROM code_snippets cs
  WHERE cs.id = NEW.snippet_id;

  -- لا تُرسل إشعاراً لنفسك
  IF v_owner_id IS NULL OR v_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- الحصول على اسم المعلق
  SELECT COALESCE(full_name, username, 'شخص ما')
  INTO v_commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  v_snippet_id := NEW.snippet_id::TEXT;
  -- اقتطاع التعليق لـ 60 حرف
  v_preview := LEFT(NEW.content, 60);
  IF LENGTH(NEW.content) > 60 THEN
    v_preview := v_preview || '...';
  END IF;

  -- إنشاء الإشعار
  PERFORM insert_interaction_notification(
    v_owner_id,
    'comment',
    'تعليق جديد على كودك! 💬',
    v_commenter_name || ' علّق على كودك "' || COALESCE(v_snippet_title, 'الكود') || '": ' || v_preview,
    jsonb_build_object(
      'snippetId',   v_snippet_id,
      'commentId',   NEW.id::TEXT,
      'actorId',     NEW.user_id::TEXT,
      'actorName',   v_commenter_name,
      'navigateTo',  '/code/' || v_snippet_id
    )
  );

  RETURN NEW;
END;
$$;

-- ================================================================
-- 6. Trigger Function: إشعار عند المتابعة
-- ================================================================
CREATE OR REPLACE FUNCTION notify_on_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- الحصول على اسم المتابع
  SELECT COALESCE(full_name, username, 'شخص ما')
  INTO v_follower_name
  FROM profiles
  WHERE id = NEW.follower_id;

  -- إنشاء الإشعار لصاحب الحساب المتابَع
  PERFORM insert_interaction_notification(
    NEW.following_id,
    'follow',
    'متابع جديد! 👤',
    v_follower_name || ' بدأ بمتابعتك',
    jsonb_build_object(
      'actorId',    NEW.follower_id::TEXT,
      'actorName',  v_follower_name,
      'navigateTo', '/user/' || NEW.follower_id::TEXT
    )
  );

  RETURN NEW;
END;
$$;

-- ================================================================
-- 7. ربط الـ Triggers بالجداول
-- ================================================================

-- إشعار الإعجاب
DROP TRIGGER IF EXISTS trg_notify_code_like ON code_likes;
CREATE TRIGGER trg_notify_code_like
  AFTER INSERT ON code_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_code_like();

-- إشعار التعليق
DROP TRIGGER IF EXISTS trg_notify_code_comment ON code_comments;
CREATE TRIGGER trg_notify_code_comment
  AFTER INSERT ON code_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_code_comment();

-- إشعار المتابعة
DROP TRIGGER IF EXISTS trg_notify_new_follow ON follows;
CREATE TRIGGER trg_notify_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_follow();

-- ================================================================
-- 8. سياسة RLS إضافية: السماح للـ triggers بالإدراج
--    (الدوال SECURITY DEFINER تتجاوز RLS، لكن نضيف للوضوح)
-- ================================================================

-- السماح لأي مستخدم مصادق عليه بقراءة إشعاراته فقط (موجودة مسبقاً)
-- السماح بالإدراج من الدوال (SECURITY DEFINER تتجاوز بالفعل)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'app_notifications'
      AND policyname = 'System can insert notifications for any user'
  ) THEN
    CREATE POLICY "System can insert notifications for any user"
      ON app_notifications
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ================================================================
-- 9. تحقق - اختبار الـ triggers
-- ================================================================
-- للتحقق يدوياً بعد التطبيق:
--
-- SELECT tgname, tgrelid::regclass AS table_name
-- FROM pg_trigger
-- WHERE tgname IN (
--   'trg_notify_code_like',
--   'trg_notify_code_comment',
--   'trg_notify_new_follow'
-- );
