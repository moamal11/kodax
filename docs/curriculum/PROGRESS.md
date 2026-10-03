# سجل تقدم مراجعة المناهج (للاستئناف)

آخر تحديث: 2026-10-01

## البنية
- المحتوى الأصلي في `src/constants/*Content.ts` لا يُعدَّل (عدا إعادة تسمية المعرّف المكرر cpp-adv-4 الثاني ← `cpp-advanced-stl-containers`).
- كل التعديلات عبر خطط في `src/constants/curriculum/<track>/<course>.ts` مسجلة في `curriculum/plans.ts`.
- أدوات الخطة: `patches`، `codeFixes`، `contentFixes`، `fenceLangs`، `newLessons`، `adopt`، `sections`.
- التحقق: `npx tsx scripts/curriculum/validate.ts` و `npx tsx scripts/curriculum/run-examples.ts <courseId...>`.
- أدوات الفحص الخارجية (خارج المشروع): `%TEMP%/kxtools` — `npm i html-validate@9 css-tree@3 esbuild@0.24`.

## الحالة
| الدورة | الحالة |
|---|---|
| py-basics, py-data-structures, py-oop, py-advanced | ✅ |
| cpp-basics, cpp-pointers, cpp-oop, cpp-advanced | ✅ |
| web-html-basics, web-css-styling, web-css-advanced, web-js-basics, web-react-intro, web-deployment | ✅ |
| ai-basics, ai-ml-basics, ai-deep-learning | ✅ (Keras: فحص صياغة فقط — TensorFlow غير متاح) |
| rn-basics, rn-advanced, flutter-basics, flutter-advanced | ✅ (Dart غير متاح للفحص) |
| backend-* (7) | ✅ موسّعة (+17 درساً: مشاريع، PostgreSQL، ترحيلات، اختبارات، OpenAPI، MFA) — (SQL يُشغَّل على SQLite؛ Express/Mongoose/Supabase/Firebase: فحص صياغة) |
| cyber-* (4) | ✅ إصلاحات بنيوية فقط (cyber/structural.ts) — لا إعادة كتابة شروح |
| Migration (كتالوج العملات + نقل تقدم cpp-adv-4) | ✅ كُتبت واختُبرت على PGlite — لم تُنشر |
| tsc / expo export / فحص بصري / التقرير النهائي | ✅ docs/curriculum/FINAL_REPORT.md |

## ملاحظات
- tsc: كود التطبيق 0 أخطاء؛ يتبقى 40 في kodax-admin (اعتماديات Next غير مثبتة) ودوال Deno — بيئات منفصلة.
- expo export web و android: نجحا.
- الفحص البصري: تم على localhost مع Supabase وهمي.
- الجولة الثانية مكتملة: 344 درساً، 1595 مثالاً بلا فشل. التفاصيل في ملحق FINAL_REPORT.md.
- 2026-10-02: إغلاق المهام المتبقية:
  - إصلاح migration الكتالوج (cpp-adv-4).
  - إصلاح ربط تحديات Flutter.
  - migration حماية أعمدة profiles.
  - فحص مفتاح OpenAI.
  - الاختبارات النهائية.
  - التفاصيل في ملحق FINAL_REPORT.md.
