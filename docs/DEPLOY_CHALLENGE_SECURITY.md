# نشر إصلاحات أمان التحديات والذكاء الاصطناعي

المشروع المرتبط: `krtulodnhmfuoxjqajwl` (kodax) — نفس المشروع في `.env`.
النسخة الاحتياطية للإنتاج (قبل أي تغيير): `C:\Users\moamal\myProjects\kodax-backups\prod-20261001-004734\`
(`public_schema.sql` + `public_full.dump` بصيغة pg_dump المخصصة، فيها بيانات المستخدمين — لا ترفعها لأي مكان).

## 1) مفتاح الذكاء الاصطناعي (أولاً)

المساعد صار يعمل بـ Google Gemini، والمفتاح يوضع في Supabase Secrets فقط:

```bash
npx supabase secrets set GEMINI_API_KEY=<مفتاح Gemini> --project-ref krtulodnhmfuoxjqajwl
```

مفتاح OpenAI القديم مسرّب، وهو نفس المفتاح الموجود في أول commit على GitHub:
1. من https://platform.openai.com/api-keys ألغِ (Revoke) المفتاح الذي يبدأ بـ `sk-proj-nFhT`.
2. بعد نشر `ai-chat` الجديدة احذفه من Secrets:

```bash
npx supabase secrets unset OPENAI_API_KEY --project-ref krtulodnhmfuoxjqajwl
```

لا تضع أي مفتاح في `.env` أو في كود التطبيق — الطلبات تمر عبر دالة `ai-chat` فقط.

## 2) نشر الدوال

**بعد** تطبيق قاعدة البيانات (القسم 3): `verify-challenge` الجديدة تستدعي `challenge_access_check`، وإن نُشرت قبلها ستفشل كل المحاولات (500).
ونفس الشيء لـ `ai-chat`: تستدعي `ai_quota_reserve` و`ai_cache_get`، فتُنشر بعد تطبيق `20261002030000_ai_assistant.sql`. قبل نشرها شغّل `npm run ai:knowledge:check` للتأكد أن معرفة المساعد محدّثة.

```bash
npx supabase functions deploy verify-challenge --project-ref krtulodnhmfuoxjqajwl --use-api --no-verify-jwt
```

```bash
npx supabase functions deploy ai-chat --project-ref krtulodnhmfuoxjqajwl --use-api --no-verify-jwt
```

(`--no-verify-jwt` مثل الإعداد الحالي في المشروع؛ الدالتان تتحققان من المستخدم داخلياً عبر `auth.getUser`.)

## 3) قاعدة البيانات

الـmigrations الثلاثة الأولى مطبّقة في الإنتاج يدوياً (تحققت من وجود كل جداولها ودوالها وسياساتها: 58/58)،
لكنها غير مسجّلة في سجل الـmigrations. سجّلها كمطبّقة (لا يغيّر أي جدول):

```bash
npx supabase migration repair --status applied 20260930000000 20260930000100 20261001000000 --linked
```

ثم راجع ما سيُطبّق. يجب أن تظهر هذه الخمسة فقط وبهذا الترتيب:
- `20261001010000_server_verified_challenges.sql`
- `20261001020000_curriculum_lesson_catalog.sql`
- `20261002000000_protect_profile_columns.sql`
- `20261002010000_server_side_xp.sql`
- `20261002020000_challenge_access.sql`
- `20261002030000_ai_assistant.sql` (حصة Gemini الموحّدة، إعلانات زيادة الحصة، الـcache)

```bash
npx supabase db push --linked --dry-run
```

ثم طبّق:

```bash
npx supabase db push --linked
```

الاختبار المحلي قبل النشر (مخطط الإنتاج + هذه الـmigrations على PGlite، بلا اتصال بالإنتاج):

```bash
npx tsx scripts/challenge-audit/security-db.test.ts
```

## 4) التحقق بعد النشر

فحص بمفتاح anon العام فقط (قراءة فقط، لا يقرأ محتوى أي صف):

```bash
npx tsx scripts/challenge-audit/prod-smoke.ts
```

فحص بحسابك التجريبي (يسجّل إكمال تحدي py-ch-beg-1 لهذا الحساب ويمنحه كوينات فعلاً):

```bash
KODAX_TEST_EMAIL=you@example.com KODAX_TEST_PASSWORD=... npx tsx scripts/challenge-audit/prod-auth-smoke.ts
```

## 5) إصدار التطبيق

بعد تطبيق الـmigration، **النسخ القديمة من التطبيق لن تستطيع تسجيل إكمال التحديات**
(كانت تكتب الإكمال مباشرة في الجدول، وهذا صار مرفوضاً). إكمال الدروس العادية والكوينات يعملان كالسابق.
انشر نسخة جديدة من التطبيق (Play Store / EAS Update) في نفس الوقت تقريباً.

## XP وقفل التحديات (بعد 20261002010000 و 20261002020000)

- XP الدرس يُمنح على السيرفر عند حفظ الإكمال، بقيمة `lesson_catalog.xp`، ومرة واحدة لكل درس (`xp_awards`).
- `update_user_xp` لم تعد تغيّر XP، لكنها باقية حتى لا تتعطل النسخ القديمة.
- التحدي المقفول: `verify-challenge` ترد 403، و`record_challenge_submission` و`coins_reward_challenge` ترفضانه.
- الوصول يُحسب من `user_unlocked_courses`، أو من سعر الدورة الحالي (0 = مجانية) في `course_coin_catalog`.
- إذا تغيّر ترتيب التحديات أو أسعار الدورات في التطبيق، أعد توليد خريطة القفل في migration جديدة.

## عند تعديل أي تحدٍ لاحقاً

```bash
npx tsx scripts/build-verify-function.ts
```

```bash
npx tsx scripts/challenge-audit/gen-verified-migration.ts
```

```bash
npx tsx scripts/challenge-audit/gen-challenge-access-migration.ts
```

ثم أعد نشر `verify-challenge` (والـmigration إذا تغيّرت نقاط أو صعوبة أو أُضيف تحدٍ جديد — أنشئ ملف migration جديداً بدل تعديل المطبّق).
