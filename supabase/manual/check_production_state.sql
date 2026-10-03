-- ============================================================================
-- فحص حالة الإنتاج — قراءة فقط (لا يغيّر أي شيء). شغّله في Supabase SQL Editor قبل النشر.
-- ============================================================================

-- 1) هل trigger منح XP للدروس موجود، وهل lesson_catalog.xp موجود؟
--    إذا كان has_xp_trigger = true و has_xp_column = false فإن حفظ إكمال أي درس يفشل الآن
--    (column "xp" does not exist). الإصلاح: migration 20261003000000_progression_catalog.
SELECT
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ulp_award_lesson_xp') AS has_xp_trigger,
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'lesson_catalog' AND column_name = 'xp') AS has_xp_column,
  (SELECT COUNT(*) FROM lesson_catalog) AS lesson_catalog_rows;

-- 2) آخر إكمال درس محفوظ (إذا توقف بعد تاريخ معيّن فالمشكلة أعلاه مؤكدة)
SELECT MAX(completed_at) AS last_lesson_completion
FROM user_lesson_progress WHERE course_id <> 'challenges' AND completed;

-- 3) الـmigrations المسجلة (إن طُبقت عبر supabase db push)
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 15;

-- 4) إعدادات الإعلانات: client_claim_enabled يجب أن يصبح false بعد تفعيل SSV
SELECT value FROM coin_config WHERE key = 'ads';

-- 5) هل اعتُمد أي إعلان عبر SSV فعلاً؟ (شرط قبل تطبيق manual/ads_require_ssv.sql)
SELECT verified_by, COUNT(*) FROM ad_reward_sessions WHERE status = 'rewarded' GROUP BY verified_by;
