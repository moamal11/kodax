# 🎓 إصلاح نظام الشهادات - Certificate System Fix

## المشكلة التي تم اكتشافها

كان نظام الشهادات يعرض **0% تقدم في الدروس** بسبب طريقة خاطئة في جلب البيانات من قاعدة البيانات.

## السبب الجذري

### 1. مشكلة في مطابقة التحديات (Challenges)

- **التطبيق** يستخدم منطق معقد لربط التحديات بالكورسات:
  - `html-ch-1` → `web-html-basics`
  - `py-ch-1` → `py-basics`
  - `css-ch-1` → `web-css-styling`

- **Edge Function** كان يبحث بطريقة خاطئة:
  ```typescript
  // ❌ الطريقة الخاطئة
  challenge_id.startsWith('web-html-basics'); // لن يجد 'html-ch-1'!
  ```

### 2. البيانات المحفوظة صحيحة

- جدول `user_lesson_progress` يحفظ:
  - `lesson_id`: "html-1", "html-2", إلخ (✅ صحيح)
  - `course_id`: "web-html-basics" (✅ صحيح)

- جدول `challenge_attempts` يحفظ:
  - `challenge_id`: "html-ch-1", "py-ch-1" (✅ صحيح)

## ✅ الإصلاحات المطبقة

### 1. تحديث منطق مطابقة التحديات في Edge Function

تم إضافة mapping صحيح لربط courseId بـ challenge prefixes:

```typescript
const challengePrefixMap = {
  'web-html-basics': ['html-'],
  'web-css-styling': ['css-'],
  'web-js-basics': ['js-', 'json-'],
  'py-basics': ['py-'],
  'cpp-basics': ['cpp-'],
  'cyber-basics': ['cyber-'],
  'ai-basics': ['ai-'],
  'rn-basics': ['rn-'],
  'flutter-basics': ['flutter-'],
  'backend-nodejs': ['backend-'],
  // ... المزيد
};
```

### 2. إضافة Logging مفصّل للتتبع

تم إضافة console.log في:

- ✅ Edge Function (`certificate/index.ts`)
- ✅ CertificateService (`certificateService.ts`)
- ✅ HybridSyncService (`hybridSyncService.ts`)
- ✅ useCertificate Hook
- ✅ صفحة الكورس

### 3. تعطيل الـ Cache مؤقتاً

لضمان جلب بيانات جديدة دائماً أثناء الاختبار.

## 📋 خطوات التحقق

### 1. التحقق من Schema (اختياري)

شغّل الملف: `supabase/VERIFY_SCHEMA.sql` في Supabase SQL Editor

### 2. اختبار النظام

1. **افتح المتصفح** (Chrome/Edge) واذهب للتطبيق
2. **افتح Console** (اضغط F12 → Console tab)
3. **انتقل لصفحة أي كورس** أكملت فيه دروس
4. **راقب Logs في Console:**

   ```
   [Course Page] Certificate data: { courseId, totalLessons, ... }
   [useCertificate] Checking eligibility: { ... }
   [CertificateService] Calling Edge Function with: { ... }
   ```

5. **تحقق من Supabase Dashboard Logs:**
   - اذهب إلى: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
   - اختر **certificate** function
   - اضغط **Logs** tab
   - يجب أن ترى:
     ```
     [Progress Check] Fetching progress for: { userId, courseId }
     [Progress Check] Lesson progress data: { count: X, data: [...] }
     [Progress Check] Completed lessons: X
     [Eligibility Check] Calculated percentages: { lessonsPercent: X%, ... }
     ```

### 3. النتيجة المتوقعة

- ✅ يجب أن تظهر نسبة التقدم الصحيحة (مثل 30%, 50%, 100%)
- ✅ يجب أن تظهر بطاقة الشهادة مع مؤشرات التقدم
- ✅ إذا كنت مؤهلاً، سيظهر زر "الحصول على شهادة"

## 🐛 إذا استمرت المشكلة

### احتمال 1: Schema غير محدّث

شغّل في Supabase SQL Editor:

```sql
-- تحديث challenge_attempts.challenge_id إلى TEXT
ALTER TABLE challenge_attempts
  ALTER COLUMN challenge_id TYPE TEXT USING challenge_id::text;
```

### احتمال 2: مشكلة RLS (Row Level Security)

تحقق من أن RLS Policies تسمح للمستخدم بقراءة بياناته:

```sql
-- في Supabase Dashboard → Authentication → Policies
-- يجب أن يكون هناك policy على user_lesson_progress:
-- "Users can view their own lesson progress"
```

### احتمال 3: البيانات محفوظة بـ user_id خاطئ

تحقق من user_id:

```sql
SELECT auth.uid(); -- يعطيك user_id الحالي

-- ثم بحث عن بياناتك:
SELECT * FROM user_lesson_progress
WHERE user_id = 'YOUR_USER_ID_HERE'
LIMIT 5;
```

## 📊 التعديلات على الملفات

### Supabase Functions

- ✅ `supabase/functions/certificate/index.ts` - منطق جلب البيانات

### Services

- ✅ `src/services/certificateService.ts` - تعطيل cache مؤقتاً
- ✅ `src/services/hybridSyncService.ts` - إضافة logs

### Hooks & Components

- ✅ `src/hooks/useCertificate.ts` - إضافة logs
- ✅ `app/course/[id].tsx` - إضافة logs
- ✅ `src/components/certificate/CertificateProgressCard.tsx` - إضافة logs

### Database

- ✅ `supabase/VERIFY_SCHEMA.sql` - ملف جديد للتحقق

## 🚀 الخطوات التالية

1. **اختبر النظام** باتباع خطوات التحقق أعلاه
2. **أرسل لي screenshots** من:
   - Browser Console logs
   - Supabase Function logs
3. إذا كان كل شيء يعمل، سأعيد تفعيل الـ cache للأداء الأفضل

---

تم التحديث: {{ now }}
