# Supabase Edge Function: AI Chat (Google Gemini)

مساعد الذكاء الاصطناعي في Kodax. التطبيق يستدعي هذه الدالة فقط، والدالة تستدعي Gemini على السيرفر.

## البنية

```
supabase/functions/ai-chat/
  index.ts                 Deno.serve + Supabase (JWT، الحصة، الـcache، الإعدادات الحية)
  core.ts                  المسار: Smart Response ← Cache ← الحصة ← Retrieval ← Gemini
  smart.ts                 الردود الفورية المحلية (بدون Gemini ولا حصة) — القرار والثقة
  understand.ts            فهم السؤال محلياً: تحويله إلى إطار معنى (مفاهيم/أفعال/نوع سؤال)
  lexicon.ts               قاموس المعاني: عراقي/فصحى/إنجليزي → معنى واحد (بيانات فقط)
  knowledge.ts             بحث BM25 في معرفة Kodax وبناء السياق المرتبط بالسؤال فقط
  knowledge.generated.ts   مولَّد من المنهج (لا يُعدَّل يدوياً)
  kodax-facts.ts           معلومات التطبيق الثابتة + الأسئلة الشائعة (أرقامها من coin_config)
  smart-glossary.ts        قاموس مفاهيم البرمجة
  text.ts                  تطبيع العربية والتقطيع
```

### مسار كل رسالة
1. **Smart Response:** رد محلي فوري للأسئلة الشائعة، التحيات، تعريف المفاهيم، وأسئلة الدورات والدروس والتحديات بالاسم. لا يستدعي Gemini ولا يُحسب من الحصة. يشمل بيانات المستخدم الحية (XP، الرصيد، الحصة) بصلاحياته هو، وهذه لا تُخزَّن أبداً.
2. **Cache:** الأسئلة العامة فقط (أول رسالة، وضع عام، بلا كود، بلا بيانات شخصية، بلا أسعار أو إعدادات متغيرة). لا يُحسب من الحصة. المفتاح يتضمن إصدار المعرفة، فإضافة درس تُلغي الإجابات القديمة.
3. **الحصة:** `ai_quota_reserve` قبل Gemini، و`ai_quota_release` إذا فشل Gemini.
4. **Retrieval:** أقرب مقتطفات من الدروس وأمثلتها والتحديات والدورات وحقائق التطبيق (حتى 6000 حرف)، وليس كل المحتوى.
5. **Gemini:** آخر 10 رسائل من المحادثة، حتى لا يرحّب ويعيد المقدمات في كل رسالة.
6. **تنظيف الرد:** حذف المقدمات الفارغة والترحيب المتكرر، وحجب أي رد يكشف التعليمات الداخلية.

### بعد إضافة أو تعديل درس أو دورة أو تحدٍ

```bash
npm run ai:knowledge
```

ثم انشر الدالة. اختبار `smart-response.test.ts` يفشل إذا كانت المعرفة قديمة.
أسماء الدورات والدروس والتحديات الجديدة تُفهم تلقائياً من المنهج (بدون إضافة مرادفات يدوياً).

### فهم السؤال (Smart Response)
1. `understand.ts` يحوّل السؤال إلى إطار: "شلون اجمع كوينز؟" و"how can i get coins" و"منين احصل عملات" ← `a:how c:coins v:earn`.
   يعالج: حروف اللهجة (گ چ)، الإطالة (هلووو)، البادئات واللواحق (والكوينز، كويناتي)، الأخطاء الإملائية القريبة، وكتابة أسماء التقنيات بالعربي (بايثون ↔ python).
2. `smart.ts` يقارن الإطار بأنماط كل سؤال شائع (F-score موزون بندرة الكلمة) مع شروط صارمة: نفس المفاهيم، لا أفعال متعارضة، وفارق واضح عن ثاني أقرب رد.
3. الثقة ≥ 0.78 ← رد فوري. أقل من ذلك أو طلب شرح/مثال/كود/مقارنة/رأي/حساب، أو متابعة لمحادثة ← Gemini (لا تخمين).
4. لإضافة صياغة جديدة: أضف الكلمة إلى `lexicon.ts` (إن كانت معنى جديداً) أو نمطاً إلى `kodax-facts.ts`، ثم:

```bash
npx tsx scripts/challenge-audit/smart-eval.ts
npx tsx scripts/challenge-audit/smart-understanding.test.ts
```

لا تخفّض العتبة: `smart-eval.ts` يطبع منحنى العتبة (عند 0.70 وأقل تبدأ أسئلة الشرح بالتسرب إلى الرد المحلي).

### الإعدادات (بدون نشر كود)
صف `ai_quota` في `coin_config`:
- `daily_limit`: الحد الأساسي لكل مستخدم يومياً.
- `ad_bonus`: الزيادة لكل مجموعة إعلانات.
- `ads_per_bonus`: عدد الإعلانات في المجموعة.
- `max_ad_bonuses_per_day`: أقصى عدد زيادات يومياً.
- `global_daily_limit`: سقف المشروع كله يومياً.
- `global_timezone`: منطقة يوم السقف العام.

## الأمان
- المفتاح في Supabase Secrets فقط (`GEMINI_API_KEY`). لا يوضع في التطبيق ولا في `.env` ولا في Git.
- المفتاح يُرسل لـ Google في ترويسة `x-goog-api-key` فقط، وليس في الرابط.
- المستخدم يُعرف من JWT فقط، وحصة Gemini اليومية تُفرض على السيرفر (`ai_quota_reserve`، للـ service_role فقط).
- أخطاء Gemini تُعاد بحالة غير 200، فلا يعرضها التطبيق كإجابة.

## النماذج
| نوع السؤال | النموذج الافتراضي | التفكير |
|---|---|---|
| بسيط، تلميح | `gemini-3.5-flash-lite` | minimal |
| متقدم، شرح، إصلاح، حل | `gemini-3.8-flash` | low |

يمكن تغييرها بدون تعديل الكود: `GEMINI_MODEL` و `GEMINI_MODEL_LITE` في Secrets.

## الإعداد والنشر

```bash
npx supabase secrets set GEMINI_API_KEY=<المفتاح> --project-ref krtulodnhmfuoxjqajwl
```

```bash
npx supabase functions deploy ai-chat --project-ref krtulodnhmfuoxjqajwl --use-api --no-verify-jwt
```

بعد التأكد أن الدالة تعمل، احذف المفتاح القديم:

```bash
npx supabase secrets unset OPENAI_API_KEY --project-ref krtulodnhmfuoxjqajwl
```

## الطلب والرد

```
POST /functions/v1/ai-chat
Authorization: Bearer <access token>
{ "message": "...", "context": "...", "mode": "challenge-hint" }
```

- النجاح (200): `{ "reply": "...", "source": "smart|cache|gemini", "quota": { "used": 3, "limit": 10, ... } }`
- الطلب: `{ "message": "...", "mode": "general", "history": [{ "role": "user|assistant", "content": "..." }] }`
- السقف العام (503): `{ "error": "ai_busy", "message": "..." }`
- الحد اليومي (429): `{ "error": "quota_exceeded", "message": "..." }`
- تعطل المزود (502 أو 503): `{ "error": "ai_unavailable", "reason": "...", "message": "..." }`

## الاختبار المحلي (بدون مفتاح، Gemini وهمي)

```bash
npx tsx scripts/challenge-audit/ai-chat-core.test.ts
```
