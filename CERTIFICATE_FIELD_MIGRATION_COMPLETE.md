# ✅ تم: تحويل نظام الشهادات من Course-Based إلى Field-Based

## 🎯 ما تم إنجازه

تم تحويل نظام الشهادات بالكامل ليصدر شهادة واحدة لكل **مجال** بدلاً من شهادة لكل كورس منفرد.

### مثال:

**قبل:**

- شهادة "أساسيات HTML" ❌
- شهادة "تصميم CSS" ❌
- شهادة "JavaScript" ❌

**بعد:**

- **شهادة تطوير الويب** 🎓 (بعد إتمام HTML + CSS + JS + React)
- **شهادة Python** 🎓 (بعد إتمام جميع دورات Python)
- **شهادة Cyber Security** 🎓 (بعد إتمام جميع دورات الأمن السيبراني)

---

## ✅ الملفات المحدثة:

### 1. Database Migration ✅

**📄 ملف:** `supabase/certificates_field_migration.sql`

- تحويل جدول certificates من course_id إلى field_id
- إضافة field_name و field_name_ar
- تحديث certificate_requirements للعمل على مستوى المجال
- إنشاء متطلبات افتراضية لـ 7 مجالات:
  - `web-dev` - تطوير الويب
  - `python` - بايثون
  - `cpp` - سي++
  - `cybersecurity` - الأمن السيبراني
  - `ai-ml` - الذكاء الاصطناعي
  - `mobile-dev` - تطوير التطبيقات
  - `backend` - تطوير الخوادم
- إنشاء View `user_field_progress` لتتبع التقدم

### 2. TypeScript Types ✅

**📄 ملف:** `src/types/certificate.ts`

- تحديث `Certificate` interface (إضافة field_id, field_name, field_name_ar)
- إنشاء `FieldAchievementSnapshot` لحفظ إحصائيات المجال مع تفاصيل جميع الدورات
- تحديث `CertificateRequirements` و `CertificateSummaryItem`

### 3. Certificate Service ✅

**📄 ملف:** `src/services/certificateService.ts`

- `checkEligibility(fieldId, level)` - فحص الأهلية للمجال
- `issueCertificate(fieldId, level, fieldName, fieldNameAr)` - إصدار شهادة
- `getFieldHighestCertificate(fieldId)` - جلب أعلى شهادة للمجال

### 4. useCertificate Hook ✅

**📄 ملف:** `src/hooks/useCertificate.ts`
**إعادة كتابة كاملة** للعمل على مستوى المجال:

```typescript
useCertificate({
  fieldId: 'web-dev',
  fieldName: 'Web Development',
  fieldNameAr: 'تطوير الويب',
  userId: user?.id,
  isProgressLoading: false,
});
```

- جلب جميع الكورسات في المجال تلقائياً
- حساب إجمالي الدروس والتحديات
- حساب الأهلية بناءً على التقدم الإجمالي

### 5. UI Components ✅

**📄 ملف:** `src/components/certificate/CertificateProgressCard.tsx`

- تحديث Props لتستقبل `fieldId`, `fieldName`, `fieldNameAr`
- تحديث `onIssueCertificate` ليأخذ `level` فقط

**📄 ملف:** `app/course/[id].tsx`

- تحديث استدعاء useCertificate
- تحديث استدعاءات CertificateProgressCard

---

## ⚠️ ما يجب إكماله:

### 1. تطبيق Database Migration ⚠️

```bash
# خيار 1: عبر Supabase Dashboard
# افتح: Supabase Dashboard > SQL Editor
# الصق محتوى: supabase/certificates_field_migration.sql
# اضغط: Run

# خيار 2: عبر CLI
npx supabase db push
```

**⚠️ ملاحظة مهمة:**

- الـ migration يحتفظ بنسخة احتياطية في `certificates_backup_course_based`
- يملأ `field_id` تلقائياً من جدول courses
- لا يحذف أي بيانات موجودة

### 2. تحديث Edge Function ⚠️

**📄 ملف:** `supabase/functions/certificate/index.ts`

**انظر الدليل الشامل:** `EDGE_FUNCTION_FIELD_UPDATE.md`

التغييرات الرئيسية المطلوبة:

1. تغيير Parameters من `course_id` إلى `field_id`
2. **إعادة كتابة** `calculateProgress()` لتصبح `calculateFieldProgress()`
   - جلب جميع الكورسات في المجال
   - حساب التقدم الإجمالي لجميع الدروس والتحديات
3. تحديث `getRequirements()` لاستخدام field_id
4. تحديث `checkEligibility()` للعمل مع المجال
5. تحديث `issueCertificate()` لإنشاء `FieldAchievementSnapshot`
6. تحديث Main Handler routing

**خيارات:**

- **الخيار 1:** تطبيق التغييرات يدوياً حسب الدليل
- **الخيار 2:** طلب إعادة كتابة كاملة للـ Edge Function

### 3. Deploy Edge Function بعد التحديث ⚠️

```bash
npx supabase functions deploy certificate
```

---

## 📋 خطوات التطبيق النهائية

### الخطوة 1: تطبيق Migration

```bash
# افتح Supabase Dashboard > SQL Editor
# شغّل: supabase/certificates_field_migration.sql
```

### الخطوة 2: تحديث Edge Function

```bash
# حدّث: supabase/functions/certificate/index.ts
# راجع: EDGE_FUNCTION_FIELD_UPDATE.md
```

### الخطوة 3: Deploy

```bash
npx supabase functions deploy certificate
```

### الخطوة 4: اختبار

1. افتح أي دورة في التطبيق
2. تحقق من ظهور progress للشهادة بناءً على جميع دورات المجال
3. أكمل جميع دورات مجال معين (مثلاً: HTML + CSS)
4. حاول الحصول على الشهادة

---

## 🎯 النتيجة المتوقعة

بعد التطبيق الكامل:

1. **في صفحة الكورس:**
   - يظهر تقدم الشهادة للمجال بأكمله (مثلاً: "تطوير الويب")
   - النسبة المئوية تحسب من جميع الدورات في المجال
   - مثال: "أكملت 60% من دورات تطوير الويب"

2. **عند الحصول على الشهادة:**
   - يحصل المستخدم على شهادة واحدة للمجال
   - الشهادة تحتوي على تفاصيل جميع الدورات المكتملة
   - مثال: "شهادة تطوير الويب - الفضية" (بعد إكمال 60% من الدورات)

3. **في profile:**
   - يظهر عدد الشهادات حسب المجالات (مثلاً: 1 شهادة Python، 1 شهادة Web Dev)
   - بدلاً من عشرات الشهادات للكورسات الفردية

---

## 📚 ملفات التوثيق

1. **CERTIFICATE_FIELD_MIGRATION_GUIDE.md** - دليل شامل للتحويل
2. **EDGE_FUNCTION_FIELD_UPDATE.md** - دليل تفصيلي لتحديث Edge Function
3. **هذا الملف** - ملخص سريع وخطوات التطبيق

---

## ❓ أسئلة شائعة

### س: ماذا يحدث للشهادات القديمة؟

**ج:** الـ migration يحدث field_id تلقائياً بناءً على course_id. الشهادات القديمة تبقى صالحة.

### س: هل يمكن الرجوع للنظام القديم؟

**ج:** نعم، النسخة الاحتياطية محفوظة في `certificates_backup_course_based`

### س: كم شهادة يحصل المستخدم لكل مجال؟

**ج:** 3 مستويات: Silver (60% إكمال) → Gold (100% + 80% تحديات) → Platinum (100% كل شيء)

### س: هل يجب إكمال الدورات بترتيب معين؟

**ج:** لا، المستخدم يمكنه إكمال الدورات بأي ترتيب. الشهادة تُصدر بعد تحقيق النسبة المطلوبة.

---

## 💡 نصائح

1. **اختبر Migration أولاً في بيئة Development قبل Production**
2. **احتفظ بنسخة احتياطية من قاعدة البيانات**
3. **راجع Edge Function logs بعد Deploy للتأكد من عدم وجود أخطاء**
4. **أخبر المستخدمين بالتحديث (الشهادات الجديدة أفضل!)**

---

**✅ التحديثات الأساسية مكتملة. تحتاج فقط لتطبيق Migration وتحديث Edge Function.**

**هل تريد مني إعادة كتابة Edge Function بالكامل الآن؟**
