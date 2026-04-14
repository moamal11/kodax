# 🚀 دليل اختبار سريع - نظام حد الاستخدام

## ⚡ الخطوات السريعة (5 دقائق)

### 1️⃣ تحديث قاعدة البيانات (مرة واحدة فقط):

افتح Supabase SQL Editor:
👉 https://supabase.com/dashboard/project/krtulodnhmfuoxjqajwl/sql/new

انسخ والصق من الملف:

```
supabase/update_usage_limits.sql
```

اضغط **Run** (Ctrl+Enter)

**المتوقع:**

```
✅ تم التحديث بنجاح!
total_users: X
avg_daily_limit: 300000
avg_conversations: X
avg_usage_percent: X%
```

---

### 2️⃣ أعد تشغيل التطبيق:

```bash
npm start
```

---

### 3️⃣ اختبر النظام:

#### أ) تحقق من الإحصائيات:

1. افتح AI Chat
2. اضغط زر الإحصائيات 📊

**المتوقع:**

- ✅ عداد المحادثات: (ليس 0)
- ✅ الحد اليومي: 300,000
- ✅ النسبة المئوية: أقل من 10% (ليس 100%)
- ✅ التوكنات المتبقية: قريب من 300,000

#### ب) اختبر التحذيرات (محاكاة):

**لاختبار تحذير 90%:**

```sql
-- في SQL Editor، شغل:
UPDATE ai_usage_stats
SET tokens_used_today = 270000  -- 90%
WHERE user_id = (SELECT auth.uid());
```

ثم أرسل رسالة → يجب أن يظهر:

```
⚠️ اقتربت من الحد
استخدمت 90% من حد الاستخدام اليومي.
متبقي: 30,000 توكن

[إلغاء] [متابعة]
```

**لاختبار منع 100%:**

```sql
UPDATE ai_usage_stats
SET tokens_used_today = 300000  -- 100%
WHERE user_id = (SELECT auth.uid());
```

ثم حاول إرسال رسالة → يجب أن يظهر:

```
⚠️ تجاوزت الحد اليومي
لقد استخدمت 100% من حد الاستخدام اليومي.
متبقي: 0 توكن من 300,000
سيتم إعادة تعيين الحد غداً.

[حسناً]
```

**لإعادة تعيين:**

```sql
UPDATE ai_usage_stats
SET tokens_used_today = 0
WHERE user_id = (SELECT auth.uid());
```

---

## 🔍 التحقق من البيانات

### الاستعلام الشامل:

```sql
SELECT
  conversations_count,
  daily_limit,
  tokens_used_today,
  ROUND((tokens_used_today::FLOAT / daily_limit * 100), 2) as usage_percent,
  total_messages,
  total_tokens_used,
  last_reset_date
FROM ai_usage_stats
WHERE user_id = (SELECT auth.uid());
```

**المتوقع:**

- conversations_count: > 0 ✅
- daily_limit: 300000 ✅
- usage_percent: أقل من 10% ✅
- last_reset_date: اليوم ✅

---

## ✅ قائمة التحقق

- [ ] SQL script تم تشغيله بنجاح
- [ ] التطبيق تم إعادة تشغيله
- [ ] عداد المحادثات يعرض رقم > 0
- [ ] الحد اليومي = 300,000
- [ ] النسبة المئوية منطقية (< 10% للاستخدام العادي)
- [ ] تحذير 90% يعمل
- [ ] منع 100% يعمل
- [ ] Console لا يعرض أخطاء

---

## 🐛 Troubleshooting

### عداد المحادثات ما زال 0:

```sql
-- تحقق يدوياً:
SELECT COUNT(*) FROM ai_conversations WHERE user_id = (SELECT auth.uid());

-- إذا العدد > 0، شغل:
UPDATE ai_usage_stats
SET conversations_count = (
  SELECT COUNT(*) FROM ai_conversations WHERE user_id = (SELECT auth.uid())
)
WHERE user_id = (SELECT auth.uid());
```

### النسبة المئوية ما زالت 100%:

```sql
-- أعد تعيين:
UPDATE ai_usage_stats
SET
  tokens_used_today = 0,
  daily_limit = 300000,
  last_reset_date = CURRENT_DATE
WHERE user_id = (SELECT auth.uid());
```

### التوكنات لا تزيد:

1. افتح Console (F12)
2. أرسل رسالة
3. ابحث عن:
   - `🤖 AI Response received (X tokens)`
   - `📊 Tracked X tokens for user`
4. إذا لم تظهر → تأكد أن Edge Function deployed:
   ```bash
   npx supabase functions deploy ai-chat
   ```

---

## 📊 النتيجة المتوقعة

### قبل التحديث:

- ❌ عداد المحادثات: 0
- ❌ الحد اليومي: 10,000
- ❌ وصلت 100% بعد 4 رسائل
- ❌ لم يُمنع الإرسال

### بعد التحديث:

- ✅ عداد المحادثات: العدد الصحيح
- ✅ الحد اليومي: 300,000
- ✅ تحتاج ~90 رسالة للوصول إلى 90%
- ✅ يُمنع الإرسال عند 100%
- ✅ تحذير واضح عند 90%

---

🎉 **الآن النظام يعمل بشكل مثالي!**

**دورة الحياة:**

1. استخدام عادي (0-89%): لا تحذيرات
2. استخدام مكثف (90-99%): تحذير مع كل رسالة
3. تجاوز الحد (100%): منع كامل حتى إعادة التعيين

**إعادة التعيين:** تلقائياً في منتصف الليل (00:00)
