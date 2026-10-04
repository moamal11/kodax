# قائمة الإطلاق على Google Play — Kodax 1.2.0

## ما تم على الخادم (مطبّق على الإنتاج)
| Migration | المحتوى |
|---|---|
| 20261003040000_security_hardening | صلاحيات المشرف من auth.uid، إغلاق ثغرات الإشعارات/المحادثات/التقدم |
| 20261003050000_user_blocks_messaging | الحظر يمنع الرسائل، قراءة المشرف |
| 20261004000000_security_phase_a | search_path، IDOR، دوال قديمة، عدّادات الملف، متابعة/إشعارات مع الحظر، صور فقط في التخزين |
| 20261004010000_account_deletion (+ fk_fix) | حذف الحساب النهائي |
| 20261004030000_admin_backend | سجل الإدارة، التوثيق، الكوينات، الإشراف، الإحصاءات |
| 20261004040000_push_notifications | الإشعارات الفورية + الحملات + pg_cron |
| 20261004050000_secure_views | الـviews لا تتجاوز RLS |
| 20261004060000_push_quiet_hours_scope | ساعات الهدوء لا تؤخّر الرسائل الخاصة والدعم والنظام |
| 20261004070000_push_quiet_hours_fixes | الموعد الصريح للحملة يُحترم، ولا تأجيل بعد انتهاء الصلاحية |
| 20261004080000_quiet_hours_off_by_default | ساعات الهدوء مطفأة افتراضياً |

Edge Functions: `certificate` (تحقق حقيقي من JWT + حساب على السيرفر)، `delete-account`، `push-send`.

## إجراءات مطلوبة منك (لا يمكن تنفيذها من الكود)
1. **إلغاء مفتاح OpenAI القديم** (كان في تاريخ Git) من لوحة OpenAI.
2. **Firebase / FCM للإشعارات على Android:**
   - ✅ `google-services.json` (مشروع Firebase `kodaxapp`، الحزمة `com.kodax.app`) مرفوع في EAS كمتغير ملف `GOOGLE_SERVICES_JSON` (production/preview/development) ومحلياً في الجذر (مستثنى من Git).
   - ⬜ أنشئ مفتاح Service Account من Firebase Console → Project settings → Service accounts → Generate new private key، ثم ارفعه: `eas credentials -p android` → production → Google Service Account → Push Notifications (FCM V1). لا تضفه لـ Git.
   - مفتاح FCM V1 يُستخدم على خوادم Expo فقط، لا يدخل في التطبيق: رفعه لا يتطلب بناءً جديداً. البناء الجديد مطلوب فقط لأن `google-services.json` أُضيف (البناء 21 لا يحتويه).
3. **بريد التواصل العام** في `src/constants/legal.ts` (`LEGAL_CONTACT_EMAIL`) وفي Play Console، و**تأكيد الحد الأدنى للعمر** (`LEGAL_MIN_AGE`، حالياً 13) بما يطابق "الجمهور المستهدف".
4. **نشر الموقع** (`kodax.app`) بعد الدفع للمستودع حتى تعمل `/privacy` و`/terms` و`/account-deletion` (Vercel يبني من هذا المستودع).
5. **AdMob:** بعد قبول التطبيق وظهور `verified_by = 'ssv'` في `ad_reward_sessions` طبّق `supabase/manual/ads_require_ssv.sql` (يوقف اعتماد مكافآت الإعلانات من العميل).
6. **ملف APK غريب** في الـbucket العام `avatars` (`APKPure_…apk`, 25MB, 2026-02-17): يُنصح بحذفه من لوحة Supabase Storage.
7. **Play Console:**
   - Privacy policy URL: `https://kodax.app/privacy`
   - Delete account URL: `https://kodax.app/account-deletion`
   - Data safety: الحساب (بريد، اسم)، معلومات الملف، المحتوى (أكواد، رسائل خاصة، محادثات المساعد)، النشاط داخل التطبيق، معرّف الجهاز/الإعلانات (AdMob)، رمز الإشعارات؛ مشاركة مع Google (AdMob, Gemini)، Wandbox، JetBrains؛ التشفير أثناء النقل: نعم؛ طلب الحذف: نعم.
   - Ads: نعم (Rewarded فقط). Target audience حسب `LEGAL_MIN_AGE`.

## فحص AAB الإنتاجي (Build 11fa44bd، commit d62f9b2)
- الحزمة `com.kodax.app`، versionCode 21، versionName 1.2.0، targetSdk 36، موقّع (META-INF RSA)، Hermes.
- `allowBackup=false`، `usesCleartextTraffic=false`، غير debuggable.
- الصلاحيات: INTERNET, NETWORK_STATE, VIBRATE, WAKE_LOCK, RECEIVE_BOOT_COMPLETED, POST_NOTIFICATIONS, FCM RECEIVE, AD_ID + AdServices, FOREGROUND_SERVICE (من المكتبات، بلا نوع خدمة)، صلاحيات شارات المشغّلات. **لا** كاميرا/تخزين/وسائط/ميكروفون/تثبيت حزم/نافذة عائمة.
- Supabase: `krtulodnhmfuoxjqajwl` بمفتاح anon فقط؛ لا service_role ولا مفاتيح OpenAI/Gemini/Google API ولا مفاتيح خاصة.
- AdMob: App ID الحقيقي في الـManifest، الوحدة المكافأة الحقيقية في الحزمة؛ `EXPO_PUBLIC_ADMOB_USE_TEST_ADS=false` في ملف production (ملفات `.env` المحلية مستثناة من الرفع). معرّفات الاختبار الموجودة هي جدول `TestIds` داخل المكتبة فقط.
- `localhost:8081/9999` نصوص افتراضية داخل مكتبات Expo/RN (أدوات التطوير)، غير مستخدمة في الإصدار.

## التحقق اليدوي على جهاز حقيقي (بعد تثبيت AAB/الاختبار الداخلي)
- [ ] تثبيت نظيف، تسجيل جديد بالبريد، دخول، دخول Google
- [ ] الملف الشخصي (تعديل، صورة من منتقي الصور بدون طلب صلاحية تخزين)
- [ ] الدورات والدروس (إكمال درس واختبار، XP، السلسلة)
- [ ] التحديات (حل، XP/كوينات، كشف الحل بعد المحاولات)
- [ ] المساعد الذكي (الحصة اليومية)
- [ ] الإعلانات المكافأة (قد تعطي No Fill حتى قبول AdMob — ليس خطأ كود)
- [ ] الأكواد/التعليقات/الإعجابات/المتابعة، الرسائل الخاصة
- [ ] الحظر وإلغاؤه + منع الرسائل، الإبلاغ عن كود/مستخدم/رسالة
- [ ] الدعم الفني (تذكرة + رد من لوحة الإدارة + إشعار)
- [ ] الإشعارات: تفعيل من الإعدادات، إعجاب/رسالة من حساب آخر، الضغط يفتح المكان الصحيح (يتطلب الخطوة 2)
- [ ] حذف الحساب من الإعدادات (حساب تجريبي) والتأكد من الخروج وعدم إمكانية الدخول
- [ ] سياسة الخصوصية والشروط من صفحة الدخول والإعدادات
- [ ] تنبيه التحديث (انشر إعداداً من لوحة الإدارة بإصدار أحدث)
- [ ] تسجيل الخروج ثم إعادة التثبيت
