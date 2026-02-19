# 🚀 جرب الآن - دليل سريع

## ✅ تم التحديث بنجاح!

### ما تم إصلاحه:

1. ✅ **تتبع التوكنات يعمل 100%** - عداد الاستخدام سيزيد بعد كل رسالة
2. ✅ **AI يعرف التطبيق** - يجيب عن أسئلة الدورات والدروس والتحديات
3. ✅ **حذف الكود المكرر** - Edge Function محسّن

---

## ⚡ ابدأ الاختبار (3 خطوات)

### 1️⃣ أعد تشغيل الـ Dev Server:

```bash
# أوقف السيرفر الحالي (Ctrl+C)
# ثم شغل من جديد:
npm start
```

### 2️⃣ افتح AI Chat في التطبيق

### 3️⃣ جرب هذه الأسئلة:

**اختبار معرفة التطبيق:**

```
"كم دورة في التطبيق؟"
"شنو الدورات اللي تعلم Flutter؟"
"كيف احصل على نقاط؟"
"وين أتعلم الأمن السيبراني؟"
"شنو الفرق بين React Native و Flutter؟"
```

**اختبار تتبع التوكنات:**

```
1. افتح Console في المتصفح (F12)
2. أرسل أي رسالة للـ AI
3. راقب الـ Console - يجب أن ترى:
   🤖 AI Response received (X tokens)
   📊 Tracked X tokens for user
4. اضغط زر الإحصائيات 📊
5. يجب أن ترى النسبة المئوية!
```

---

## 🔍 الـ Console يجب أن يعرض:

```
🚀 Sending message to AI Edge Function...
✅ Received response from Edge Function
📊 Response length: 125
🤖 AI Response received (152 tokens)
📊 Tracked 152 tokens for user
```

---

## 🎯 النتيجة المتوقعة:

### عند سؤال "كم دورة في التطبيق؟":

```
AI: " في تطبيق Kodax يوجد 32 دورة تعليمية موزعة على 8 مجالات برمجية:

1. تطوير الويب - 6 دورات
2. Python - 4 دورات
3. C++ - 4 دورات
4. الأمن السيبراني - 4 دورات
5. الذكاء الاصطناعي - 3 دورات
6. تطوير التطبيقات - 4 دورات
7. Backend Development - 3 دورات
8. قواعد البيانات - 4 دورات

الدورات الأولى في كل مجال مجانية، والدورات المتقدمة تحتاج نقاط (300-1000 نقطة حسب المستوى)."
```

### عند فتح زر الإحصائيات:

- ✅ يعرض النسبة المئوية (مثلاً 2.5%)
- ✅ عدد التوكنات المستخدمة اليوم
- ✅ إجمالي الرسائل
- ✅ عدد المحادثات

---

## ⚠️ إذا لم يعمل:

### الإحصائيات ما زالت 0٪:

```bash
# 1. تأكد أن Edge Function deployed:
npx supabase functions deploy ai-chat

# 2. تحقق من Logs:
# افتح: https://supabase.com/dashboard/project/krtulodnhmfuoxjqajwl/functions/ai-chat/logs
# يجب أن ترى: [AI] complexity=simple, model=gpt-4.1-mini, tokens=X

# 3. تحقق من البيانات:
# افتح SQL Editor وشغل:
SELECT role, content, tokens_used, created_at
FROM ai_chat_history
WHERE role = 'assistant'
ORDER BY created_at DESC
LIMIT 5;

# يجب أن ترى tokens_used > 0
```

### AI لا يعرف معلومات التطبيق:

```bash
# تأكد أن Edge Function deployed بنجاح:
# 1. راجع الـ logs في Supabase Dashboard
# 2. يجب أن ترى: appKnowledge=true عند السؤال عن التطبيق
```

---

## 📊 التحقق من البيانات مباشرة

### افتح Supabase SQL Editor:

https://supabase.com/dashboard/project/krtulodnhmfuoxjqajwl/sql/new

### شغل هذا الاستعلام:

```sql
-- تحقق من تتبع التوكنات
SELECT
  role,
  LEFT(content, 50) as preview,
  tokens_used,
  created_at
FROM ai_chat_history
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- تحقق من الإحصائيات
SELECT * FROM ai_usage_stats WHERE user_id = auth.uid();

-- إذا كانت NULL، شغل:
INSERT INTO ai_usage_stats (user_id, daily_limit, tokens_used_today)
VALUES (auth.uid(), 10000, 0);
```

---

## 🎉 كل شيء جاهز!

**الخطوات التالية:**

1. أعد تشغيل `npm start`
2. جرب AI Chat
3. اسأل أسئلة عن التطبيق
4. افتح زر الإحصائيات

**التوثيق الكامل:**

- اقرأ [AI_FIXES_COMPLETE.md](AI_FIXES_COMPLETE.md) للتفاصيل الكاملة

---

💬 **أي مشكلة؟ شيك الـ Console وشارك الـ Logs!**
