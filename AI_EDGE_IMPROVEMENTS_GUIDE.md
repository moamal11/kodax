# تحديثات Edge Function للذكاء الاصطناعي

## 🎯 الهدف

تحسين edge function للذكاء الاصطناعي لتوفير:

1. **استخدام نموذج أقوى** (gpt-4o) للأسئلة المتقدمة والشروحات
2. **زيادة max_tokens** من 220/900 إلى 600/2500/3500 حسب نوع السؤال
3. **دعم challenge-explain mode** بشكل صحيح
4. **كود كامل بدون اختصارات** في الشروحات

## ✅ التعديلات المطبقة

### 1. ملف edge function المحدث

**الملف:** `supabase/functions/ai-chat/index_UPDATED.ts` (ملف جديد نظيف)

**التغييرات:**

- ✨ `classifyQuestion()`: إضافة detection للكود وmode parameter، يدعم 3 أنواع: simple/advanced/explanation
- ✨ `getModelConfig()`:
  - Explanation → `gpt-4o` + 3500 tokens
  - Advanced → `gpt-4o` + 2500 tokens
  - Simple → `gpt-4o-mini` + 600 tokens
- ✨ `getSystemPrompt()`: تعليمات صريحة لكتابة الكود كاملاً بدون اختصارات
- ✨ `callOpenAI()`: يستقبل mode parameter
- ✨ `Handler`: يستخرج mode من request body ويمرره للدالة

### 2. تحديث aiChatService

**الملف:** `src/services/aiChatService.ts` ✅ تم التحديث

**التغيير:** إضافة `mode: mode` في body المرسل لـ edge function

### 3. تحسين AIMessageRenderer

**الملف:** `src/components/ai/AIMessageRenderer.tsx` ✅ تم التحديث

**التحسينات:**

- ✅ Regex محسّن لكشف code blocks بأشكال مختلفة
- ✅ Auto-detection للكود غير المُنسّق (3+ أسطر متتالية من code-like patterns)
- ✅ دعم المزيد من اللغات (jsx, tsx, bash, shell)

## 📋 خطوات التطبيق

### الخطوة 1: استبدل edge function

```bash
# احذف (أو أعد تسمية) الملف القديم
mv supabase/functions/ai-chat/index.ts supabase/functions/ai-chat/index_OLD.ts

# أعد تسمية الملف الجديد
mv supabase/functions/ai-chat/index_UPDATED.ts supabase/functions/ai-chat/index.ts
```

### الخطوة 2: أعد نشر edge function

```bash
# تأكد من تسجيل الدخول
supabase login

# ارفع edge function المحدثة
supabase functions deploy ai-chat
```

### الخطوة 3: تأكد من OPENAI_API_KEY

```bash
# تأكد من أنها مُعرّفة (إن لم تكن موجودة)
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

## 🔍 الاختلافات الرئيسية

### قبل التحديث:

```typescript
// gpt-4.1-mini (خطأ في الاسم!)
// maxTokens: 220 (قليل جداً) / 900 (قد لا يكفي)
// لا detection للكود أو mode parameter
```

### بعد التحديث:

```typescript
// gpt-4o / gpt-4o-mini (أسماء صحيحة)
// maxTokens: 600 / 2500 / 3500 (مناسبة للاستخدام)
// ✅ يكتشف الكود والشروحات تلقائياً
// ✅ يستقبل mode من العميل
```

## 📊 توقع التكلفة

### النموذج القديم

- **gpt-4.1-mini** (خطأ → لا يعمل أصلاً!)
- 1000 رسالة × 500 token = \$0.05 (تقريباً)

### النموذج الجديد

- **Simple (70%)**: gpt-4o-mini (600 tokens) = \$0.04 لكل 1000 رسالة
- **Advanced (20%)**: gpt-4o (2500 tokens) = \$0.75 لكل 1000 رسالة
- **Explanation (10%)**: gpt-4o (3500 tokens) = \$1.05 لكل 1000 رسالة

**التكلفة الإجمالية المتوقعة:**\$0.25 لكل 1000 رسالة (مع جودة أفضل بكثير!)

## ✨ الفوائد

1. **كود كامل**: لن يعود الذكاء يختصر الكود بـ `// ... existing code ...`
2. **شروحات أفضل**: استخدام gpt-4o للتحديات يضمن جودة عالية
3. **اقتصادي للأسئلة البسيطة**: استخدام mini للأسئلة القصيرة يوفر التكلفة
4. **تنسيق أفضل**: الكود سيظهر دائماً بتنسيق صحيح (بفضل AIMessageRenderer المحدّث)

## 🐛 حل المشاكل

### المشكلة: الكود مازال يظهر بدون تنسيق

**الحل:** تأكد من أن AIMessageRenderer.tsx محدّث (يجب أن يحتوي على `processedParts`)

### المشكلة: Edge function يفشل بـ 500

**الحل:**

1. تحقق من logs: `supabase functions logs ai-chat`
2. تأكد من OPENAI_API_KEY صحيحة: `supabase secrets list`

### المشكلة: الردود قصيرة جداً

**الحل:** تأكد من أن الملف الجديد يستخدم maxTokens الجديدة (600/2500/3500)

## 📝 ملاحظات

- ✅ التعديلات على AIMessageRenderer تم تطبيقها مباشرة
- ✅ التعديلات على aiChatService تم تطبيقها مباشرة
- ⚠️ Edge function تحتاج استبدال يدوي + إعادة نشر
- 💡 يمكنك اختبار الملف الجديد محلياً قبل النشر باستخدام `supabase functions serve`
