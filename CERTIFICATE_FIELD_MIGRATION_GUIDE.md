# 🎓 Certificate System Migration - Field-Based Certificates

## نظرة عامة

تم إعادة تصميم نظام الشهادات ليعمل على مستوى **المجال** (Field) بدلاً من الكورس الفردي.

### قبل التحديث ❌

- شهادة لكل كورس منفرد
- مثال: شهادة "أساسيات HTML" + شهادة "تصميم CSS" + شهادة "JavaScript"

### بعد التحديث ✅

- شهادة واحدة لكل مجال بعد إتمام جميع دوراته
- مثال: **شهادة تطوير الويب** (بعد إتمام HTML + CSS + JS + React)
- **شهادة Python** (بعد إتمال جميع دورات Python)
- **شهادة Cyber Security** (بعد إتمام جميع دورات الأمن السيبراني)

---

## التغييرات المطبقة ✅

### 1. Database Migration (`certificates_field_migration.sql`)

- ✅ تحويل جدول `certificates` من `course_id` إلى `field_id`
- ✅ إضافة `field_name` و `field_name_ar`
- ✅ تحديث `certificate_requirements` لتعمل على مستوى المجال
- ✅ إنشاء متطلبات افتراضية لجميع المجالات (7 مجالات)
- ✅ إنشاء View للحصول على تقدم المستخدم في كل مجال

### 2. TypeScript Types (`src/types/certificate.ts`)

- ✅ تحديث `Certificate` interface لإضافة `field_id`
- ✅ إنشاء `FieldAchievementSnapshot` (إحصائيات على مستوى المجال)
- ✅ تحديث `CertificateRequirements` لاستخدام `field_id`
- ✅ تحديث `CertificateSummaryItem`

### 3. Certificate Service (`src/services/certificateService.ts`)

- ✅ تحديث `checkEligibility()` لتقبل `fieldId`
- ✅ تحديث `issueCertificate()` لإصدار شهادة للمجال
- ✅ تحديث `getFieldHighestCertificate()` (كان `getCourseHighestCertificate`)
- ✅ تحديث `persistCertificateLocally()` لحفظ بيانات المجال

### 4. useCertificate Hook (`src/hooks/useCertificate.ts`)

- ✅ **إعادة كتابة كاملة** للعمل على مستوى المجال
- ✅ جلب جميع الكورسات في المجال باستخدام `getCoursesByField()`
- ✅ حساب إجمالي الدروس والتحديات لجميع الكورسات
- ✅ حساب الأهلية بناءً على التقدم الإجمالي في المجال
- ✅ تحديث `issueCertificate()` ليأخذ `fieldId`, `fieldName`, `fieldNameAr` فقط

### 5. UI Components

**`src/components/certificate/CertificateProgressCard.tsx`**

- ✅ تحديث Props من `courseId` + `courseTitle` إلى `fieldId` + `fieldName` + `fieldNameAr`
- ✅ تحديث `onIssueCertificate` ليأخذ `level` فقط (بدون course info)

**`app/course/[id].tsx`**

- ✅ تحديث استدعاء `useCertificate()` لتمرير:
  ```tsx
  useCertificate({
    fieldId: course?.fieldId || '',
    fieldName: course?.fieldName || '',
    fieldNameAr: course?.fieldNameAr || '',
    userId: user?.id,
    isProgressLoading: progressLoading,
  });
  ```
- ✅ تحديث استدعاءات `<CertificateProgressCard>` لاستخدام field props

---

## ما يجب إكماله ⚠️

### 1. Edge Function (`supabase/functions/certificate/index.ts`)

**يجب تحديث Edge Function لتدعم:**

#### Actions المطلوبة:

1. **`check_eligibility`**
   - قبول `field_id` بدلاً من `course_id`
   - جلب جميع الكورسات في المجال من `courses` table
   - حساب التقدم الإجمالي:

     ```typescript
     // جلب جميع دورات المجال
     const { data: fieldCourses } = await supabase
       .from('courses')
       .select('id, total_lessons')
       .eq('field_id', field_id);

     // حساب الدروس المكتملة لجميع الدورات
     const { data: lessonsProgress } = await supabase
       .from('lesson_progress')
       .select('lesson_id')
       .eq('user_id', userId)
       .eq('completed', true)
       .in(
         'course_id',
         fieldCourses.map((c) => c.id)
       );
     ```

2. **`issue`**
   - قبول `field_id`, `field_name`, `field_name_ar`
   - إنشاء `FieldAchievementSnapshot` مع تفاصيل جميع الكورسات:
     ```typescript
     achievement_snapshot: {
       field_id: "web-dev",
       total_courses: 4,
       completed_courses: 4,
       total_lessons: 60,
       completed_lessons: 60,
       lessons_percent: 100,
       total_challenges: 20,
       completed_challenges: 18,
       challenges_percent: 90,
       courses: [
         { id: "web-html-basics", completed: true, score: 90 },
         { id: "web-css-styling", completed: true, score: 85 },
         // ...
       ]
     }
     ```

3. **`get_user_certs`**
   - تحديث لإرجاع بيانات `field_id` و `field_name`

---

## خطوات التطبيق

### Step 1: تطبيق Database Migration

```bash
# في Supabase Dashboard > SQL Editor
# أو عبر CLI:
npx supabase db push
```

تشغيل ملف: `supabase/certificates_field_migration.sql`

### Step 2: تحديث Edge Function

يجب إعادة كتابة `supabase/functions/certificate/index.ts` لدعم field-based logic.

### Step 3: Deploy Edge Function

```bash
npx supabase functions deploy certificate
```

### Step 4: اختبار النظام

1. افتح أي كورس في المجال
2. تحقق من ظهور تقدم الشهادة الصحيح (يجب أن يحسب جميع دورات المجال)
3. أكمل جميع دورات مجال معين
4. حاول الحصول على الشهادة

---

## Migration Path للبيانات الموجودة

إذا كان لديك شهادات صادرة مسبقاً (course-based):

### التعامل مع الشهادات القديمة:

1. **Backup Table**: تم إنشاء `certificates_backup_course_based`
2. **Field Assignment**: الـ migration يملأ `field_id` تلقائياً من `courses.field_id`
3. **الشهادات القديمة**: تبقى في النظام لكن مع `field_id` مملوء

### سيناريو المستخدم:

- إذا حصل مستخدم على شهادة "أساسيات HTML" سابقاً
- النظام يحولها إلى شهادة "تطوير الويب" (web-dev)
- لكن يجب أن يكمل باقي الدورات للحصول على Gold/Platinum

---

## الفوائد ✨

1. **أفضل تنظيماً**: شهادة واحدة لكل مجال بدلاً من عشرات الشهادات
2. **أكثر احترافية**: "شهادة Python" أفضل من "شهادة المتغيرات في Python"
3. **تحفيز أكبر**: المستخدم يعرف أنه يحصل على شهادة قيمة بعد إكمال جميع الدورات
4. **سهولة الإدارة**: متطلبات واضحة على مستوى المجال

---

## الملفات المحدثة

### ✅ تم التحديث:

- `supabase/certificates_field_migration.sql` ✅ (جديد)
- `src/types/certificate.ts` ✅
- `src/services/certificateService.ts` ✅
- `src/hooks/useCertificate.ts` ✅
- `src/components/certificate/CertificateProgressCard.tsx` ✅
- `app/course/[id].tsx` ✅

### ⚠️ يحتاج تحديث:

- `supabase/functions/certificate/index.ts` ⚠️ (مهم جداً!)

---

## الخطوة التالية

**إنشاء/تحديث Edge Function للشهادات لدعم field-based logic.**

سأقوم الآن بقراءة Edge Function الحالي وتحديثه...
