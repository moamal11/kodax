-- ================================================================
-- HOTFIX: Replace gen_random_uuid() with gen_random_uuid()
-- ================================================================
-- المشكلة: gen_random_uuid() تحتاج امتداد uuid-ossp غير مفعّل
-- الحل:    gen_random_uuid() مدمجة في PostgreSQL 13+ بدون أي امتداد
--
-- 🚨 شغّل هذا الملف في Supabase SQL Editor فوراً
-- ================================================================

-- ================================================================
-- 1. إصلاح الدالة المساعدة التي تنشئ الإشعارات (trigger helper)
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
    gen_random_uuid(),   -- ✅ لا تحتاج امتداد
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
-- 2. إصلاح defaults الجداول الرئيسية
-- ================================================================
ALTER TABLE code_comments  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE code_likes     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE code_snippets  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- باقي الجداول إن احتجت
DO $$
BEGIN
  -- code_views (قد لا يكون موجوداً في كل البيئات)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'code_views') THEN
    ALTER TABLE code_views ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;

-- ================================================================
-- 3. تحقق — يجب أن يُخرج UUID صحيح بدون خطأ
-- ================================================================
DO $$
DECLARE v UUID;
BEGIN
  v := gen_random_uuid();
  RAISE NOTICE '✅ gen_random_uuid() works: %', v;
END $$;

-- ================================================================
-- 4. اختبار نهائي: إنشاء إشعار اختبار لتأكيد الـ trigger يعمل
-- ================================================================
-- اختياري: قم بإلغاء تعليق السطور أدناه للاختبار اليدوي
-- SELECT insert_interaction_notification(
--   auth.uid(),
--   'system',
--   'اختبار الإشعارات',
--   'تم إصلاح نظام الإشعارات بنجاح!',
--   '{}'::jsonb
-- );

