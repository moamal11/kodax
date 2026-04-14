# 🔧 إصلاح سريع - تطبيق Migration

## المشكلة: عداد الاستخدام يظهر 0%

### السبب:

لم يتم تطبيق الـ Database Migration بعد

### الحل:

**1. افتح Supabase Dashboard:**
https://supabase.com/dashboard/project/krtulodnhmfuoxjqajwl/sql/new

**2. انسخ والصق هذا الكود:**

```sql
-- تحقق من وجود الجداول
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_conversations', 'ai_usage_stats');

-- إذا لم تظهر النتيجة، نفذ التالي:
```

**3. إذا لم تكن الجداول موجودة، انسخ محتوى:**

```
supabase/ai_conversations_migration.sql
```

**4. اضغط Run (أو Ctrl+Enter)**

**5. أعد تشغيل التطبيق وأرسل رسالة جديدة**

---

## تحقق من نجاح التطبيق:

```sql
-- تحقق من إحصائياتك
SELECT * FROM ai_usage_stats WHERE user_id = auth.uid();

-- تحقق من المحادثات
SELECT * FROM ai_conversations WHERE user_id = auth.uid();
```

إذا كانت النتائج فارغة، المشكلة في الـ Migration!
