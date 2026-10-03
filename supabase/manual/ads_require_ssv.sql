-- ============================================================================
-- إيقاف اعتماد الإعلانات من التطبيق: المكافأة (كوينات / حصة ذكاء / إظهار الحل) تُمنح فقط بعد
-- تحقق AdMob من جهة الخادم (admob-ssv). بدون هذا يستطيع أي عميل: start → انتظار 5 ثوانٍ → claim.
--
-- ⚠️ ترتيب النشر: طبّق هذا الملف فقط بعد:
--   1. supabase functions deploy admob-ssv --no-verify-jwt
--   2. ضبط رابط SSV في AdMob لوحدة Rewarded: https://<project-ref>.supabase.co/functions/v1/admob-ssv
--   3. التأكد أن إعلاناً حقيقياً واحداً على الأقل اعتُمد عبر SSV (ad_reward_sessions.verified_by = 'ssv').
-- قبل ذلك ستتوقف كل المكافآت الإعلانية (المستخدم يشاهد الإعلان ولا يحصل على شيء).
-- التراجع: نفس الأمر بقيمة true.
-- ============================================================================
UPDATE coin_config
SET value = jsonb_set(value, '{client_claim_enabled}', 'false'::jsonb), updated_at = NOW()
WHERE key = 'ads';
