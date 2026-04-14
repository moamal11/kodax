# تحديث نظام الشهادات - من الدورة إلى المسار

## 📌 المشكلة الحالية

**الوضع الحالي:**

- كل دورة (Course) تمنح شهادة منفصلة
- مثال: `css-styling`، `css-advanced`، `ethical-hacking` كل واحدة لها شهادة

**المشكلة:**

- المستخدم يحصل على شهادات كثيرة جداً لنفس المجال
- شهادة "CSS Basics" + شهادة "CSS Advanced" = غير منطقي
- يجب أن تكون شهادة واحدة لكل مسار (Field)

---

## **التصميم المطلوب:**

### المسارات (Fields) وشهاداتها:

| المسار (Field ID) | اسم الشهادة         | الدورات المطلوبة                                                     |
| ----------------- | ------------------- | -------------------------------------------------------------------- |
| **web-dev**       | مطور ويب            | HTML Basics, CSS Styling, CSS Advanced, JS Basics, React, Deployment |
| **mobile-dev**    | مطور تطبيقات        | React Native Basics + Advanced OR Flutter Basics + Advanced          |
| **python**        | Python              | Python Basics, Data Structures, OOP, Advanced                        |
| **cpp**           | C++                 | C++ Basics, Pointers, OOP, Advanced                                  |
| **cybersecurity** | أمن سيبراني         | Cyber Basics, Network Security, Advanced Security, Ethical Hacking   |
| **databases**     | SQL وقواعد البيانات | SQL, Supabase, Firebase, MongoDB                                     |
| **ai-ml**         | ذكاء اصطناعي        | AI Basics, ML Basics, Deep Learning                                  |
| **backend**       | Backend Development | Node.js, REST API, Authentication                                    |

### المتطلبات حسب المستوى:

#### 🥈 Silver (الفضية):

- إكمال **60%** من دروس المسار
- إكمال **50%** من تحديات المسار
- الحصول على **60%** في الامتحان النهائي

#### 🥇 Gold (الذهبية):

- إكمال **100%** من دروس المسار
- إكمال **80%** من تحديات المسار
- الحصول على **80%** في الامتحان النهائي

#### 💎 Platinum (البلاتينية):

- إكمال **100%** من دروس المسار
- إكمال **100%** من تحديات المسار
- الحصول على **95%** في الامتحان النهائي
- **بدون أي أخطاء** في التحديات

---

## 🔧 التغييرات المطلوبة

### 1. **تحديث قاعدة البيانات**

بدلاً من تغيير schema، سنستخدم نهج **Virtual Field Certificates**:

```sql
-- إضافة حقل field_id إلى جدول certificates
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS field_id TEXT REFERENCES programming_fields(id);

-- تحديث الشهادات الموجودة لتحمل field_id
UPDATE certificates c
SET field_id = (
  SELECT field_id
  FROM courses
  WHERE courses.id = c.course_id
  LIMIT 1
);

-- إنشاء view للشهادات حسب المسار
CREATE OR REPLACE VIEW field_certificates AS
SELECT
  c.id,
  c.user_id,
  c.field_id,
  c.level,
  c.status,
  c.security_hash,
  c.issued_at,
  f.name AS field_name,
  f.name_ar AS field_name_ar,
  c.achievement_snapshot
FROM certificates c
LEFT JOIN programming_fields f ON c.field_id = f.id
WHERE c.field_id IS NOT NULL;
```

### 2. **تحديث Certificate Service**

إضافة دوال جديدة للمسارات:

```typescript
// src/services/certificateService.ts

/**
 * حساب التقدم الكلي في مسار معين
 */
async calculateFieldProgress(
  fieldId: string,
  userId: string
): Promise<{
  lessons_completed: number;
  lessons_total: number;
  lessons_percent: number;
  challenges_completed: number;
  challenges_total: number;
  challenges_percent: number;
}> {
  // جلب جميع دورات المسار
  const fieldCourses = getCoursesByField(fieldId);

  let totalLessonsCompleted = 0;
  let totalLessons = 0;
  let totalChallengesCompleted = 0;
  let totalChallenges = 0;

  for (const course of fieldCourses) {
    // حساب دروس كل دورة
    const lessons = getLessonsByCourse(course.id);
    totalLessons += lessons.length;

    const { data: completedLessons } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', lessons.map(l => l.id));

    totalLessonsCompleted += completedLessons?.length || 0;

    // حساب تحديات كل دورة
    const challenges = getChallengesByCourse(course.id);
    totalChallenges += challenges.length;

    const { data: passedChallenges } = await supabase
      .from('challenge_attempts')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('passed', true)
      .in('challenge_id', challenges.map(c => c.id));

    totalChallengesCompleted += passedChallenges?.length || 0;
  }

  return {
    lessons_completed: totalLessonsCompleted,
    lessons_total: totalLessons,
    lessons_percent: totalLessons > 0
      ? Math.round((totalLessonsCompleted / totalLessons) * 100)
      : 0,
    challenges_completed: totalChallengesCompleted,
    challenges_total: totalChallenges,
    challenges_percent: totalChallenges > 0
      ? Math.round((totalChallengesCompleted / totalChallenges) * 100)
      : 0,
  };
}

/**
 * فحص الأهلية للحصول على شهادة المسار
 */
async checkFieldEligibility(
  fieldId: string,
  level: CertificateLevel
): Promise<EligibilityResult> {
  const progress = await this.calculateFieldProgress(fieldId, this.userId!);

  const payload = {
    action: 'check_field_eligibility',
    field_id: fieldId,
    level,
    progress,
  };

  return this.callEdgeFunction(payload);
}

/**
 * إصدار شهادة للمسار
 */
async issueFieldCertificate(
  fieldId: string,
  level: CertificateLevel,
  fieldName: string,
  fieldNameAr: string
): Promise<IssueCertificateResult> {
  const progress = await this.calculateFieldProgress(fieldId, this.userId!);

  const payload = {
    action: 'issue_field',
    field_id: fieldId,
    level,
    field_name: fieldName,
    field_name_ar: fieldNameAr,
    progress,
  };

  return this.callEdgeFunction(payload);
}
```

### 3. **تحديث Edge Function**

```typescript
// supabase/functions/certificate/index.ts

// إضافة handler جديد للمسارات
if (body.action === 'check_field_eligibility') {
  const { field_id, level, progress } = body;

  // جلب متطلبات المسار
  const { data: requirements } = await supabase
    .from('certificate_requirements')
    .select('*')
    .eq('field_id', field_id)
    .eq('level', level)
    .single();

  // استخدام المتطلبات الافتراضية إذا لم توجد
  const reqs = requirements || DEFAULT_REQUIREMENTS[level];

  // فحص الأهلية
  const eligible =
    progress.lessons_percent >= reqs.min_lessons_percent &&
    progress.challenges_percent >= reqs.min_challenges_percent;

  return {
    eligible,
    level,
    reasons: eligible
      ? []
      : [
          progress.lessons_percent < reqs.min_lessons_percent
            ? `يجب إكمال ${reqs.min_lessons_percent}% من الدروس`
            : null,
          progress.challenges_percent < reqs.min_challenges_percent
            ? `يجب إكمال ${reqs.min_challenges_percent}% من التحديات`
            : null,
        ].filter(Boolean),
    progress,
  };
}

if (body.action === 'issue_field') {
  const { field_id, level, field_name, field_name_ar, progress } = body;

  // التحقق من الأهلية أولاً
  const eligibility = await checkFieldEligibility(
    user.id,
    field_id,
    level,
    progress
  );

  if (!eligibility.eligible) {
    return {
      success: false,
      reasons: eligibility.reasons,
    };
  }

  // إصدار الشهادة
  const { data: certificate } = await supabase
    .from('certificates')
    .insert({
      user_id: user.id,
      field_id,
      level,
      status: 'valid',
      security_hash: generateSecurityHash(user.id, field_id, level),
      achievement_snapshot: {
        lessons_completed: progress.lessons_completed,
        lessons_total: progress.lessons_total,
        lessons_percent: progress.lessons_percent,
        challenges_completed: progress.challenges_completed,
        challenges_total: progress.challenges_total,
        challenges_percent: progress.challenges_percent,
        exam_score: null,
        critical_errors: 0,
        completion_days: null,
      },
      user_full_name: user.user_metadata.full_name,
      field_title: field_name,
      field_title_ar: field_name_ar,
    })
    .select()
    .single();

  return {
    success: true,
    certificate,
  };
}
```

### 4. **تحديث الواجهة**

إضافة صفحة جديدة لشهادات المسارات:

```tsx
// app/certificate/field/[id].tsx

export default function FieldCertificateScreen() {
  const { id: fieldId } = useLocalSearchParams();
  const { user } = useAuth();
  const [field, setField] = useState<ProgrammingField | null>(null);
  const [progress, setProgress] = useState<FieldProgress | null>(null);
  const [eligibility, setEligibility] = useState<FieldEligibilityResult | null>(
    null
  );

  useEffect(() => {
    loadFieldData();
  }, [fieldId]);

  const loadFieldData = async () => {
    // جلب بيانات المسار
    const fieldData = PROGRAMMING_FIELDS.find((f) => f.id === fieldId);
    setField(fieldData);

    // حساب التقدم
    const fieldProgress = await certificateService.calculateFieldProgress(
      fieldId as string,
      user!.id
    );
    setProgress(fieldProgress);

    // فحص الأهلية لكل مستوى
    const silver = await certificateService.checkFieldEligibility(
      fieldId as string,
      'silver'
    );
    const gold = await certificateService.checkFieldEligibility(
      fieldId as string,
      'gold'
    );
    const platinum = await certificateService.checkFieldEligibility(
      fieldId as string,
      'platinum'
    );

    setEligibility({ silver, gold, platinum });
  };

  const handleIssueCertificate = async (level: CertificateLevel) => {
    const result = await certificateService.issueFieldCertificate(
      fieldId as string,
      level,
      field!.name,
      field!.nameAr
    );

    if (result.success) {
      Alert.alert('🎉', 'تم إصدار الشهادة بنجاح!');
      router.push(`/certificate/${result.certificate_id}`);
    }
  };

  return (
    <ScrollView>
      <LinearGradient colors={THEME_COLORS.purpleGradient}>
        <Text style={styles.title}>{field?.nameAr}</Text>
        <Text style={styles.subtitle}>{field?.name}</Text>
      </LinearGradient>

      {/* عرض التقدم */}
      <View style={styles.progressCard}>
        <Text>
          الدروس المكتملة: {progress?.lessons_completed} /{' '}
          {progress?.lessons_total}
        </Text>
        <ProgressBar value={progress?.lessons_percent || 0} />

        <Text>
          التحديات المكتملة: {progress?.challenges_completed} /{' '}
          {progress?.challenges_total}
        </Text>
        <ProgressBar value={progress?.challenges_percent || 0} />
      </View>

      {/* عرض الشهادات المتاحة */}
      {['silver', 'gold', 'platinum'].map((level) => (
        <CertificateLevelCard
          key={level}
          level={level as CertificateLevel}
          eligible={eligibility?.[level]?.eligible}
          requirements={eligibility?.[level]?.requirements}
          onIssue={() => handleIssueCertificate(level as CertificateLevel)}
        />
      ))}
    </ScrollView>
  );
}
```

---

## 📊 مقارنة النظامين

| الميزة           | النظام القديم                        | النظام الجديد                |
| ---------------- | ------------------------------------ | ---------------------------- |
| **عدد الشهادات** | 30+ شهادة                            | 8 شهادات (8 مسارات)          |
| **منطقية**       | CSS Basics + CSS Advanced = 2 شهادات | مطور ويب = 1 شهادة           |
| **التقدم**       | لكل دورة على حدة                     | إجمالي المسار                |
| **المرونة**      | محدودة                               | عالية (يمكن تخصيص المتطلبات) |
| **احترافية**     | منخفضة                               | عالية جداً                   |

---

## 🚀 خطة التنفيذ

### المرحلة 1: قاعدة البيانات (15 دقيقة)

1. تطبيق SQL Migration لإضافة `field_id`
2. تحديث الشهادات الموجودة
3. إنشاء View للشهادات الحقلية

### المرحلة 2: Backend (30 دقيقة)

1. تحديث Certificate Service
2. إضافة `calculateFieldProgress()`
3. إضافة `checkFieldEligibility()`
4. إضافة `issueFieldCertificate()`

### المرحلة 3: Edge Function (20 دقيقة)

1. إضافة handler لـ `check_field_eligibility`
2. إضافة handler لـ `issue_field`
3. تحديث منطق الأهلية

### المرحلة 4: UI (40 دقيقة)

1. إنشاء صفحة `/certificate/field/[id]`
2. تحديث `/certificate/index` لعرض شهادات المسارات
3. إضافة navigation من صفحات الدورات إلى شهادة المسار

---

## ✅ الفوائد

1. **منطقية أكثر**: شهادة واحدة لكل تخصص
2. **احترافية**: يشبه الشهادات الحقيقية (مطور ويب، مهندس أمن سيبراني)
3. **تحفيز أكبر**: المستخدم يرى تقدمه الحقيقي في المسار
4. **سهولة العرض**: 8 شهادات بدلاً من 30+
5. **قابلية التوسع**: سهل إضافة مسارات جديدة

---

## 📝 ملاحظات مهمة

1. **Backward Compatibility**: الشهادات القديمة ستبقى موجودة، لكن الجديدة ستكون على مستوى المسار
2. **Migration Tool**: يمكن إنشاء أداة لترحيل الشهادات القديمة (دمجها في شهادة واحدة للمسار)
3. **Testing**: يجب اختبار التقدم عبر دورات متعددة
4. **Performance**: حساب التقدم قد يكون بطيئاً - يجب التخزين المؤقت

---

✅ **هذا التصميم أفضل بكثير ويعكس الواقع المهني للشهادات الأكاديمية!**
