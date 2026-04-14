# تحديث Edge Function للشهادات - Field-Based

## الملف: `supabase/functions/certificate/index.ts`

⚠️ **Important**: Edge Function الحالي يعمل على مستوى الكورس. يجب تحديثه ليعمل على مستوى المجال.

---

## التغييرات المطلوبة

### 1. تحديث Types

**قبل:**

```typescript
interface CertificateRequest {
  action:
    | 'check_eligibility'
    | 'issue'
    | 'verify'
    | 'revoke'
    | 'get_user_certs';
  course_id?: string;
  certificate_id?: string;
  level?: 'silver' | 'gold' | 'platinum';
  total_lessons?: number; // passed from client
  total_challenges?: number; // passed from client
  course_title?: string;
  course_title_ar?: string;
}
```

**بعد:**

```typescript
interface CertificateRequest {
  action:
    | 'check_eligibility'
    | 'issue'
    | 'verify'
    | 'revoke'
    | 'get_user_certs';
  field_id?: string; // ← Changed
  certificate_id?: string;
  level?: 'silver' | 'gold' | 'platinum';
  field_name?: string; // ← Changed
  field_name_ar?: string; // ← Changed
}
```

---

### 2. `calculateProgress()` - تحويل من course إلى field

يجب تحويل الدالة لحساب التقدم لجميع الكورسات في المجال:

```typescript
async function calculateFieldProgress(
  supabaseAdmin: any,
  userId: string,
  fieldId: string
) {
  // 1. جلب جميع الكورسات في المجال
  const { data: fieldCourses, error: coursesError } = await supabaseAdmin
    .from('courses')
    .select('id, total_lessons')
    .eq('field_id', fieldId);

  if (coursesError || !fieldCourses || fieldCourses.length === 0) {
    throw new Error(`No courses found for field: ${fieldId}`);
  }

  const courseIds = fieldCourses.map((c: any) => c.id);
  const totalFieldLessons = fieldCourses.reduce(
    (sum: number, c: any) => sum + (c.total_lessons || 0),
    0
  );

  console.log('[Field Progress] Courses in field:', {
    fieldId,
    courseIds,
    totalLessons: totalFieldLessons,
  });

  // 2. جلب تقدم الدروس لجميع الكورسات في المجال
  const { data: lessonProgress, error: lpError } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_id, completed, course_id')
    .eq('user_id', userId)
    .in('course_id', courseIds);

  if (lpError) {
    console.error('[Field Progress] ERROR:', lpError);
  }

  const completedLessons = (lessonProgress || []).filter(
    (lp: any) => lp.completed
  );

  console.log('[Field Progress] Lessons:', {
    total: totalFieldLessons,
    completed: completedLessons.length,
    percent:
      totalFieldLessons > 0
        ? Math.round((completedLessons.length / totalFieldLessons) * 100)
        : 0,
  });

  // 3. جلب التحديات المكتملة لجميع الكورسات في المجال
  // التحديات محفوظة في user_lesson_progress مع course_id = 'challenges'
  // نحتاج لمطابقة IDs بناءً על prefixes الكورسات في المجال

  const { data: allChallenges, error: chError } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', 'challenges')
    .eq('completed', true);

  if (chError) {
    console.error('[Field Progress] Challenges ERROR:', chError);
  }

  // Map course IDs to their challenge prefixes
  const challengePrefixMap: { [key: string]: string[] } = {
    'web-html-basics': ['html-ch-'],
    'web-css-styling': ['css-ch-'],
    'web-js-basics': ['js-ch-'],
    'web-react-intro': ['react-ch-'],
    'py-basics': ['py-ch-'],
    'cpp-basics': ['cpp-ch-'],
    'cyber-basics': ['cyber-ch-'],
    // ... add more as needed
  };

  // Collect all prefixes for courses in this field
  let fieldPrefixes: string[] = [];
  courseIds.forEach((cid: string) => {
    if (challengePrefixMap[cid]) {
      fieldPrefixes = [...fieldPrefixes, ...challengePrefixMap[cid]];
    }
  });

  const completedFieldChallenges = (allChallenges || []).filter((ch: any) => {
    const id = ch.lesson_id?.toLowerCase() || '';
    return fieldPrefixes.some((prefix: string) => id.startsWith(prefix));
  });

  console.log('[Field Progress] Challenges:', {
    fieldId,
    fieldPrefixes,
    completed: completedFieldChallenges.length,
  });

  // 4. حساب متوسط الامتحانات لجميع الكورسات
  const { data: exams, error: exError } = await supabaseAdmin
    .from('course_final_exams')
    .select('course_id, score')
    .eq('user_id', userId)
    .in('course_id', courseIds);

  if (exError) {
    console.error('[Field Progress] Exams ERROR:', exError);
  }

  const examScores = (exams || []).map((e: any) => e.score);
  const avgExamScore =
    examScores.length > 0
      ? Math.round(
          examScores.reduce((a: number, b: number) => a + b, 0) /
            examScores.length
        )
      : null;

  // 5. حساب عدد الكورسات المكتملة في المجال
  const completedCourses = courseIds.filter((cid: string) => {
    const courseLessons = (lessonProgress || []).filter(
      (lp: any) => lp.course_id === cid && lp.completed
    );
    const courseTotal =
      fieldCourses.find((c: any) => c.id === cid)?.total_lessons || 0;
    return courseTotal > 0 && courseLessons.length === courseTotal;
  });

  // 6. حساب أيام الإكمال
  const { data: firstProgress } = await supabaseAdmin
    .from('lesson_progress')
    .select('completed_at')
    .eq('user_id', userId)
    .in('course_id', courseIds)
    .eq('completed', true)
    .order('completed_at', { ascending: true })
    .limit(1);

  let completionDays: number | null = null;
  if (firstProgress?.[0]?.completed_at) {
    const startDate = new Date(firstProgress[0].completed_at);
    const now = new Date();
    completionDays = Math.ceil(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    fieldId,
    totalCourses: fieldCourses.length,
    completedCourses: completedCourses.length,
    totalLessons: totalFieldLessons,
    completedLessons: completedLessons.length,
    passedChallenges: completedFieldChallenges.length,
    avgExamScore,
    completionDays,
    criticalErrors: 0, // To be calculated if needed
  };
}
```

---

### 3. `getRequirements()` - تحديث لاستخدام field_id

```typescript
async function getRequirements(
  supabaseAdmin: any,
  fieldId: string, // ← Changed from courseId
  level: string
) {
  const { data, error } = await supabaseAdmin
    .from('certificate_requirements')
    .select('*')
    .eq('field_id', fieldId) // ← Changed
    .eq('level', level)
    .single();

  if (!data || error) {
    throw new Error(
      `No requirements found for field: ${fieldId}, level: ${level}`
    );
  }

  return data;
}
```

---

### 4. `checkEligibility()` - main handler for eligibility checks

```typescript
async function checkEligibility(
  supabaseAdmin: any,
  userId: string,
  fieldId: string, // ← Changed
  level: string
): Promise<EligibilityResult> {
  // Get requirements
  const reqs = await getRequirements(supabaseAdmin, fieldId, level);

  // Calculate progress
  const progress = await calculateFieldProgress(supabaseAdmin, userId, fieldId);

  const lessonsPercent =
    progress.totalLessons > 0
      ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
      : 0;

  const challengesPercent =
    progress.totalChallenges > 0
      ? Math.round((progress.passedChallenges / progress.totalChallenges) * 100)
      : 100; // No challenges = 100%

  const reasons: string[] = [];
  let eligible = true;

  // Check lessons
  if (lessonsPercent < reqs.min_lessons_percent) {
    eligible = false;
    reasons.push(
      `Complete ${reqs.min_lessons_percent}% of field lessons (currently ${lessonsPercent}%)`
    );
  }

  // Check challenges
  if (challengesPercent < reqs.min_challenges_percent) {
    eligible = false;
    reasons.push(
      `Complete ${reqs.min_challenges_percent}% of field challenges (currently ${challengesPercent}%)`
    );
  }

  // Check exam score
  if (
    reqs.min_exam_score > 0 &&
    (!progress.avgExamScore || progress.avgExamScore < reqs.min_exam_score)
  ) {
    eligible = false;
    reasons.push(
      `Achieve average exam score of ${reqs.min_exam_score}% (currently ${progress.avgExamScore || 0}%)`
    );
  }

  // ... rest of checks

  return {
    eligible,
    level,
    reasons,
    progress: {
      lessons_completed: progress.completedLessons,
      lessons_total: progress.totalLessons,
      lessons_percent: lessonsPercent,
      challenges_completed: progress.passedChallenges,
      challenges_total: progress.totalChallenges || 0,
      challenges_percent: challengesPercent,
      exam_score: progress.avgExamScore,
      exam_passed: progress.avgExamScore >= reqs.min_exam_score,
      critical_errors: progress.criticalErrors,
      completion_days: progress.completionDays,
    },
  };
}
```

---

### 5. `issueCertificate()` - إصدار الشهادة للمجال

```typescript
async function issueCertificate(
  supabaseAdmin: any,
  userId: string,
  fieldId: string, // ← Changed
  level: string,
  fieldName: string, // ← Changed
  fieldNameAr?: string, // ← Changed
  userName?: string,
  userUsername?: string
): Promise<any> {
  // 1. Check eligibility
  const eligibility = await checkEligibility(
    supabaseAdmin,
    userId,
    fieldId,
    level
  );

  if (!eligibility.eligible) {
    return {
      success: false,
      error: 'لا تستوفي المتطلبات',
      reasons: eligibility.reasons,
    };
  }

  // 2. Calculate field progress with course breakdown
  const fieldProgress = await calculateFieldProgress(
    supabaseAdmin,
    userId,
    fieldId
  );

  // 3. Get all field courses for snapshot
  const { data: fieldCourses } = await supabaseAdmin
    .from('courses')
    .select('id, title, title_ar, total_lessons')
    .eq('field_id', fieldId);

  const coursesSnapshot = (fieldCourses || []).map((course: any) => {
    // Calculate completion for each course
    // ... (logic to check if course is completed)
    return {
      id: course.id,
      title: course.title,
      title_ar: course.title_ar,
      completed: true, // Calculate based on progress
      score: 85, // Calculate from exams
    };
  });

  // 4. Create achievement snapshot
  const achievementSnapshot = {
    field_id: fieldId,
    total_courses: fieldProgress.totalCourses,
    completed_courses: fieldProgress.completedCourses,
    total_lessons: fieldProgress.totalLessons,
    completed_lessons: fieldProgress.completedLessons,
    lessons_percent: Math.round(
      (fieldProgress.completedLessons / fieldProgress.totalLessons) * 100
    ),
    total_challenges: fieldProgress.passedChallenges, // You may need actual total
    completed_challenges: fieldProgress.passedChallenges,
    challenges_percent: 100, // Calculate properly
    avg_exam_score: fieldProgress.avgExamScore,
    critical_errors: fieldProgress.criticalErrors,
    completion_days: fieldProgress.completionDays,
    courses: coursesSnapshot,
  };

  // 5. Generate certificate ID
  const certId = crypto.randomUUID();
  const issuedAt = new Date().toISOString();

  // 6. Generate security hash
  const secret =
    Deno.env.get('CERTIFICATE_SECRET') || 'default-secret-change-me';
  const securityHash = await generateSecurityHash(
    certId,
    userId,
    fieldId, // ← Changed
    level,
    issuedAt,
    secret
  );

  // 7. Insert certificate
  const { data: cert, error: insertError } = await supabaseAdmin
    .from('certificates')
    .insert({
      id: certId,
      user_id: userId,
      field_id: fieldId, // ← Changed
      field_name: fieldName, // ← Added
      field_name_ar: fieldNameAr, // ← Added
      level,
      status: 'valid',
      security_hash: securityHash,
      achievement_snapshot: achievementSnapshot,
      user_full_name: userName || 'مستخدم',
      user_username: userUsername,
      issued_at: issuedAt,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Issue Certificate] Error:', insertError);
    return {
      success: false,
      error: 'فشل في إصدار الشهادة',
    };
  }

  return {
    success: true,
    certificate: cert,
    certificate_id: certId,
  };
}
```

---

### 6. Main Handler - تحديث routing

```typescript
Deno.serve(async (req) => {
  // ... CORS handling

  const { action, field_id, level, field_name, field_name_ar, certificate_id } =
    await req.json();

  try {
    // ... auth

    switch (action) {
      case 'check_eligibility': {
        if (!field_id || !level) {
          // ← Changed
          return new Response(
            JSON.stringify({ error: 'field_id and level required' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await checkEligibility(
          supabaseAdmin,
          userId,
          field_id, // ← Changed
          level
        );

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: corsHeaders,
        });
      }

      case 'issue': {
        if (!field_id || !level || !field_name) {
          // ← Changed
          return new Response(
            JSON.stringify({
              error: 'field_id, level, and field_name required',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get user info
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name, username')
          .eq('id', userId)
          .single();

        const result = await issueCertificate(
          supabaseAdmin,
          userId,
          field_id, // ← Changed
          level,
          field_name, // ← Changed
          field_name_ar, // ← Changed
          profile?.full_name,
          profile?.username
        );

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: corsHeaders,
        });
      }

      case 'get_user_certs': {
        const { data: certs, error } = await supabaseAdmin
          .from('certificates')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'valid')
          .order('issued_at', { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders,
          });
        }

        return new Response(
          JSON.stringify({
            certificates: certs,
            total: certs.length,
            silver: certs.filter((c: any) => c.level === 'silver').length,
            gold: certs.filter((c: any) => c.level === 'gold').length,
            platinum: certs.filter((c: any) => c.level === 'platinum').length,
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // ... other cases (verify, revoke)
    }
  } catch (error) {
    console.error('[Edge Function] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

---

## ملخص التغييرات

| المكون                   | قبل                         | بعد                                       |
| ------------------------ | --------------------------- | ----------------------------------------- |
| **Parameters**           | `course_id`, `course_title` | `field_id`, `field_name`, `field_name_ar` |
| **Progress Calculation** | Single course               | All courses in field                      |
| **Requirements**         | Per course                  | Per field                                 |
| **Achievement Snapshot** | Course data                 | Field + all courses breakdown             |
| **Database Insert**      | `course_id`                 | `field_id`, `field_name`, `field_name_ar` |

---

## الخطوات التالية

1. ✅ عمل backup للـ Edge Function الحالي
2. ⚠️ تطبيق التغييرات المذكورة أعلاه
3. ⚠️ اختبار محلياً باستخدام `supabase functions serve`
4. ⚠️ Deploy: `npx supabase functions deploy certificate`
5. ⚠️ اختبار في الإنتاج

---

هل تريد أن أقوم بإعادة كتابة Edge Function بالكامل الآن؟
