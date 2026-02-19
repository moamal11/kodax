# Fix UUID Error - Kodax

## المشكلة

```
{"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type uuid: \"html-1\""}
```

## السبب

- الجدول الأصلي `user_progress` يستخدم `UUID` لـ `lesson_id`
- لكن التطبيق يستخدم معرفات نصية مثل "html-1", "python-1", إلخ.

## الحل

### 1. تشغيل السكريبت المحدث

قم بفتح Supabase SQL Editor وتشغيل الملف:

```
supabase/update_schema.sql
```

هذا السكريبت سينشئ:

- جدول جديد `user_lesson_progress` (يستخدم TEXT بدلاً من UUID)
- جدول `course_progress` لتتبع التقدم في كل كورس
- جدول `user_unlocked_sections` للشراء المجزأ
- دوال ومحفزات تلقائية لحساب التقدم

### 2. التحقق من التشغيل

بعد تشغيل السكريبت، تحقق من نجاح الإنشاء:

```sql
-- التحقق من الجداول
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_lesson_progress', 'course_progress', 'user_unlocked_sections');

-- التحقق من الدوال
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_course_progress', 'get_last_completed_lesson');
```

### 3. إعادة تشغيل التطبيق

بعد تنفيذ السكريبت، يمكنك إعادة تشغيل التطبيق:

```bash
npx expo start
```

## التغييرات في الكود

تم تحديث الملفات التالية تلقائياً:

- ✅ `src/services/supabaseProgressService.ts` - يستخدم الآن `user_lesson_progress`
- ✅ `supabase/update_schema.sql` - جدول جديد بـ TEXT IDs

## الميزات الجديدة

بعد التحديث، ستحصل على:

1. 💾 **حفظ فوري** - يحفظ التقدم في Supabase مباشرة
2. 🔄 **مزامنة تلقائية** - يحدث التقدم تلقائياً عند كل درس
3. 📊 **عدادات حقيقية** - عداد "مكتمل/الإجمالي" دقيق
4. 🎯 **استكمال ذكي** - يبدأ من آخر درس مكتمل
5. 🏪 **شراء مجزأ** - خصم تلقائي للأقسام المفتوحة مسبقاً

## ملاحظات مهمة

⚠️ **الجدول القديم `user_progress` سيبقى كما هو** - لن يتم حذفه لضمان عدم فقدان البيانات القديمة.

إذا كنت تريد نقل البيانات القديمة إلى الجدول الجديد، يمكنك استخدام:

```sql
-- نقل البيانات (فقط إذا كان lesson_id في الجدول القديم نصي)
INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, completed_at, created_at)
SELECT
  user_id,
  lesson_id::TEXT,
  SUBSTRING(lesson_id FROM '^([^-]+-[^-]+)') as course_id,
  completed,
  completed_at,
  created_at
FROM user_progress
ON CONFLICT (user_id, lesson_id) DO NOTHING;
```

---

✅ **جاهز للاستخدام!**
