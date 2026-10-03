-- ============================================================================
-- Phase N: الـviews كانت تعمل بصلاحيات المالك (security_invoker=false) فتتجاوز RLS،
-- ومقروءة لـ anon. أخطرها ai_conversations_with_preview: عناوين وآخر رسالة من محادثات
-- المساعد لكل المستخدمين (36 محادثة مكشوفة بالمفتاح العام عند الفحص).
-- الإصلاح: كل view تعمل بصلاحيات المستدعي (RLS الجداول الأصلية يطبَّق) + سحب anon من الحساسة.
-- التطبيق يقرأ ai_conversations_with_preview لمحادثات المستخدم نفسه فقط — يستمر بالعمل.
-- ============================================================================
DO $$
DECLARE v TEXT;
BEGIN
  -- leaderboard: materialized view (لقطة لبيانات الملف العامة، غير مستخدمة في التطبيق) — لا ينطبق عليها الخيار
  FOREACH v IN ARRAY ARRAY['ai_conversations_with_preview', 'admin_users', 'user_monthly_ai_usage', 'daily_ai_stats'] LOOP
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = v AND c.relkind = 'v') THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v);
    END IF;
  END LOOP;
  FOREACH v IN ARRAY ARRAY['ai_conversations_with_preview', 'admin_users', 'user_monthly_ai_usage', 'daily_ai_stats'] LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', v);
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', v);
    END IF;
  END LOOP;
END $$;
