// ========================================
// Supabase Edge Function: Certificate Issuance
// 🎓 Server-side certificate generation with security validation
// Runtime: Deno
// ========================================

// @ts-ignore: Deno runtime
import { corsHeaders } from '../_shared/cors.ts';
// @ts-ignore: Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { CERTIFICATE_FIELDS } from './fields.generated.ts';

// ========================================
// Types
// ========================================
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
  language?: 'ar' | 'en';
}

interface EligibilityResult {
  eligible: boolean;
  level: string;
  reasons: string[];
  progress: {
    lessons_completed: number;
    lessons_total: number;
    lessons_percent: number;
    challenges_completed: number;
    challenges_total: number;
    challenges_percent: number;
    exam_score: number | null;
    exam_passed: boolean;
    critical_errors: number;
    completion_days: number | null;
  };
  next_level?: {
    level: string;
    requirements: string[];
  };
}

// ========================================
// Security: Generate HMAC-SHA256 hash
// ========================================
async function generateSecurityHash(
  certId: string,
  userId: string,
  courseId: string,
  level: string,
  issuedAt: string,
  secret: string
): Promise<string> {
  const payload = `${certId}:${userId}:${courseId}:${level}:${issuedAt}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payload);

  // @ts-ignore: Deno crypto API
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  // @ts-ignore: Deno crypto API
  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ========================================
// Get requirements for a course level
// ========================================
async function getRequirements(
  supabaseAdmin: any,
  courseId: string,
  level: string
) {
  // Try course-specific first
  let { data, error } = await supabaseAdmin
    .from('certificate_requirements')
    .select('*')
    .eq('course_id', courseId)
    .eq('level', level)
    .single();

  if (!data || error) {
    // Fall back to defaults
    const result = await supabaseAdmin
      .from('certificate_requirements')
      .select('*')
      .eq('course_id', '__default__')
      .eq('level', level)
      .single();
    data = result.data;
    error = result.error;
  }

  if (!data || error) {
    throw new Error(`No requirements found for level: ${level}`);
  }

  return data;
}

// ========================================
// Calculate user progress for a course
// ========================================
// Calculate progress (server-side, verified data only)
// ========================================
// المجال وحدوده من fields.generated.ts (نفس منهج التطبيق). لا يُقبل أي رقم من العميل:
//  - الدروس: user_lesson_progress الموثّقة (verified) في دورات المجال
//  - التحديات: صفوف course_id='challenges' (يكتبها السيرفر فقط) + challenge_submissions الناجحة
async function calculateProgress(
  supabaseAdmin: any,
  userId: string,
  fieldId: string
) {
  const field = CERTIFICATE_FIELDS[fieldId];
  if (!field) {
    return {
      known: false,
      totalLessons: 0,
      totalChallenges: 0,
      completedLessons: 0,
      passedChallenges: 0,
      criticalErrors: 0,
      examScore: null,
      examPassed: false,
      completionDays: null as number | null,
    };
  }
  const lessonSet = new Set(field.lessons);
  const challengeSet = new Set(field.challenges);

  const { data: lessonRows, error: lpError } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', userId)
    .eq('completed', true)
    .eq('verified', true)
    .in('course_id', field.courses);
  if (lpError) console.error('[Progress] lessons error:', lpError.message);
  const doneLessons = new Set(
    (lessonRows || []).map((r: any) => r.lesson_id).filter((id: string) => lessonSet.has(id))
  );

  const passed = new Set<string>();
  if (field.challenges.length > 0) {
    const { data: chRows, error: chError } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', 'challenges')
      .eq('completed', true)
      .in('lesson_id', field.challenges);
    if (chError) console.error('[Progress] challenges error:', chError.message);
    (chRows || []).forEach((r: any) => passed.add(r.lesson_id));

    const { data: subRows, error: subError } = await supabaseAdmin
      .from('challenge_submissions')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('all_passed', true)
      .in('challenge_id', field.challenges);
    if (subError) console.error('[Progress] submissions error:', subError.message);
    (subRows || []).forEach((r: any) => passed.add(r.challenge_id));
  }
  for (const id of [...passed]) if (!challengeSet.has(id)) passed.delete(id);

  let completionDays: number | null = null;
  const firstAt = (lessonRows || [])
    .map((r: any) => r.completed_at)
    .filter(Boolean)
    .sort()[0];
  if (firstAt) {
    completionDays = Math.ceil((Date.now() - new Date(firstAt).getTime()) / 86400000);
  }

  return {
    known: true,
    totalLessons: field.lessons.length,
    totalChallenges: field.challenges.length,
    completedLessons: doneLessons.size,
    passedChallenges: passed.size,
    criticalErrors: 0,
    examScore: null,
    examPassed: false,
    completionDays,
  };
}

// ========================================
// Check eligibility for a specific level
// ========================================
async function checkEligibility(
  supabaseAdmin: any,
  userId: string,
  courseId: string,
  level: string
): Promise<EligibilityResult> {
  // العتبات من certificate_requirements والتقدم والمجموع من السيرفر فقط
  const requirements = await getRequirements(supabaseAdmin, courseId, level);
  const progress = await calculateProgress(supabaseAdmin, userId, courseId);
  const totalLessons = progress.totalLessons;
  const totalChallenges = progress.totalChallenges;

  console.log('[Eligibility Check]', {
    courseId,
    level,
    totalLessons,
    totalChallenges,
    progress,
  });

  const lessonsPercent =
    totalLessons > 0
      ? Math.round((progress.completedLessons / totalLessons) * 100)
      : 0;
  const challengesPercent =
    totalChallenges > 0
      ? Math.round((progress.passedChallenges / totalChallenges) * 100)
      : 100; // If no challenges exist for this course, consider it 100% complete

  console.log('[Eligibility Check] Calculated percentages:', {
    lessonsPercent,
    challengesPercent,
    requirements: {
      min_lessons: requirements.min_lessons_percent,
      min_challenges: requirements.min_challenges_percent,
    },
  });

  const reasons: string[] = [];
  let eligible = true;
  if (!progress.known) {
    eligible = false;
    reasons.push('مجال غير معروف');
  }

  // Check lessons
  if (lessonsPercent < requirements.min_lessons_percent) {
    eligible = false;
    reasons.push(
      `أكمل ${requirements.min_lessons_percent}% من الدروس (حالياً ${lessonsPercent}%)`
    );
  }

  // Check challenges (skip if course has no challenges)
  if (
    totalChallenges > 0 &&
    challengesPercent < requirements.min_challenges_percent
  ) {
    eligible = false;
    reasons.push(
      `أكمل ${requirements.min_challenges_percent}% من التحديات (حالياً ${challengesPercent}%)`
    );
  }

  // Check exam (TEMPORARILY DISABLED - exam system not yet implemented)
  // When final exams are added, uncomment this block
  /*
  if (
    progress.examScore === null ||
    progress.examScore < requirements.min_exam_score
  ) {
    eligible = false;
    reasons.push(
      `اجتز الاختبار النهائي بدرجة ${requirements.min_exam_score}%+ (حالياً ${progress.examScore ?? 'لم يُجتاز'})`
    );
  }
  */

  // Check critical errors (Platinum)
  if (
    requirements.max_challenge_errors !== null &&
    progress.criticalErrors > requirements.max_challenge_errors
  ) {
    eligible = false;
    reasons.push(
      `الحد الأقصى للأخطاء الحرجة: ${requirements.max_challenge_errors} (حالياً ${progress.criticalErrors})`
    );
  }

  // Check project if required
  if (requirements.requires_project) {
    // For now, project completion is included in lesson completion
    // Future: separate project tracking
  }

  // Check time limit (Platinum)
  if (
    requirements.max_completion_days !== null &&
    progress.completionDays !== null &&
    progress.completionDays > requirements.max_completion_days
  ) {
    eligible = false;
    reasons.push(
      `إنجاز ضمن ${requirements.max_completion_days} يوم (استغرقت ${progress.completionDays} يوم)`
    );
  }

  // Determine next level advice
  const levels = ['silver', 'gold', 'platinum'];
  const currentIndex = levels.indexOf(level);
  let nextLevel = undefined;

  if (eligible && currentIndex < levels.length - 1) {
    const next = levels[currentIndex + 1];
    const nextReqs = await getRequirements(supabaseAdmin, courseId, next);
    nextLevel = {
      level: next,
      requirements: [
        `أكمل ${nextReqs.min_lessons_percent}% من الدروس`,
        `أكمل ${nextReqs.min_challenges_percent}% من التحديات`,
        `اجتز الاختبار بدرجة ${nextReqs.min_exam_score}%+`,
      ],
    };
  }

  return {
    eligible,
    level,
    reasons,
    progress: {
      lessons_completed: progress.completedLessons,
      lessons_total: totalLessons,
      lessons_percent: lessonsPercent,
      challenges_completed: progress.passedChallenges,
      challenges_total: totalChallenges,
      challenges_percent: challengesPercent,
      exam_score: progress.examScore,
      exam_passed: progress.examPassed,
      critical_errors: progress.criticalErrors,
      completion_days: progress.completionDays,
    },
    next_level: nextLevel,
  };
}

// ========================================
// Issue a certificate
// ========================================
async function issueCertificate(
  supabaseAdmin: any,
  userId: string,
  courseId: string,
  level: string
) {
  // اسم المجال من المنهج نفسه (لا يُكتب على الشهادة نص يرسله العميل)
  const field = CERTIFICATE_FIELDS[courseId];
  const courseTitle = field?.name || courseId;
  const courseTitleAr = field?.nameAr || courseTitle;

  // 1. Check eligibility first (server-side validation)
  const eligibility = await checkEligibility(supabaseAdmin, userId, courseId, level);

  if (!eligibility.eligible) {
    return {
      success: false,
      error: 'لم تستوفِ متطلبات الشهادة بعد',
      reasons: eligibility.reasons,
      progress: eligibility.progress,
    };
  }

  // 2. Check if certificate already exists for this level
  const { data: existing } = await supabaseAdmin
    .from('certificates')
    .select('id, level, status')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('level', level)
    .single();

  if (existing && existing.status === 'valid') {
    return {
      success: false,
      error: 'لديك شهادة بهذا المستوى بالفعل',
      certificate_id: existing.id,
    };
  }

  // 3. Archive lower-level certificates
  const levels = ['silver', 'gold', 'platinum'];
  const currentIndex = levels.indexOf(level);
  if (currentIndex > 0) {
    for (let i = 0; i < currentIndex; i++) {
      await supabaseAdmin
        .from('certificates')
        .update({ status: 'archived' })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('level', levels[i])
        .eq('status', 'valid');
    }
  }

  // 4. Get user info
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, username')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'User profile not found' };
  }

  // 5. Generate certificate
  const certId = crypto.randomUUID();
  const issuedAt = new Date().toISOString();

  // @ts-ignore: Deno env
  const secret =
    Deno.env.get('CERTIFICATE_SECRET') ||
    'kodax-cert-secret-key-change-in-production';

  const securityHash = await generateSecurityHash(
    certId,
    userId,
    courseId,
    level,
    issuedAt,
    secret
  );

  const achievementSnapshot = {
    field_id: courseId,
    total_courses: 1, // Single course
    completed_courses: 1, // Completed
    total_lessons: eligibility.progress.lessons_total,
    completed_lessons: eligibility.progress.lessons_completed,
    lessons_percent: eligibility.progress.lessons_percent,
    total_challenges: eligibility.progress.challenges_total,
    completed_challenges: eligibility.progress.challenges_completed,
    challenges_percent: eligibility.progress.challenges_percent,
    avg_exam_score: eligibility.progress.exam_score,
    critical_errors: eligibility.progress.critical_errors,
    completion_days: eligibility.progress.completion_days,
    courses: [
      {
        id: courseId,
        title: courseTitle,
        title_ar: courseTitleAr,
        completed: true,
        score: eligibility.progress.exam_score || undefined,
      },
    ],
  };

  // 6. Find upgraded_from reference
  let upgradedFrom = null;
  if (currentIndex > 0) {
    const { data: prevCert } = await supabaseAdmin
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('level', levels[currentIndex - 1])
      .order('issued_at', { ascending: false })
      .limit(1)
      .single();

    if (prevCert) {
      upgradedFrom = prevCert.id;
    }
  }

  // 7. Insert certificate
  const { data: cert, error: insertError } = await supabaseAdmin
    .from('certificates')
    .insert({
      id: certId,
      user_id: userId,
      course_id: courseId,
      level,
      status: 'valid',
      security_hash: securityHash,
      achievement_snapshot: achievementSnapshot,
      user_full_name: profile.full_name || profile.username || 'Unknown',
      user_username: profile.username,
      course_title: courseTitle,
      course_title_ar: courseTitleAr || courseTitle,
      issued_at: issuedAt,
      upgraded_from: upgradedFrom,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting certificate:', insertError);
    // Handle unique constraint violation (duplicate)
    if (insertError.code === '23505') {
      return {
        success: false,
        error: 'لديك شهادة بهذا المستوى بالفعل',
      };
    }
    return { success: false, error: 'فشل في إصدار الشهادة' };
  }

  // 8. Log the issuance
  await supabaseAdmin.from('certificate_audit_log').insert({
    certificate_id: certId,
    action: 'issued',
    actor_id: userId,
    metadata: {
      level,
      course_id: courseId,
      achievement_snapshot: achievementSnapshot,
    },
  });

  // 9. If upgraded, log that too
  if (upgradedFrom) {
    await supabaseAdmin.from('certificate_audit_log').insert({
      certificate_id: upgradedFrom,
      action: 'archived',
      actor_id: userId,
      metadata: { upgraded_to: certId, new_level: level },
    });
  }

  return {
    success: true,
    certificate: {
      id: cert.id,
      level: cert.level,
      status: cert.status,
      issued_at: cert.issued_at,
      user_full_name: cert.user_full_name,
      course_title: cert.course_title,
      course_title_ar: cert.course_title_ar,
      achievement_snapshot: cert.achievement_snapshot,
      security_hash: cert.security_hash,
    },
    next_level: eligibility.next_level,
  };
}

// ========================================
// Main Handler
// ========================================
// @ts-ignore: Deno serve
Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Auth] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // @ts-ignore: Deno env
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore: Deno env
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Config] Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Admin client for server-side operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // التحقق من التوقيع عبر Supabase Auth (الدالة منشورة بدون verify_jwt؛ فك الترميز وحده لا يكفي)
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    const userId = authData.user.id;

    // Verify user exists in profiles
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('[User] Profile check failed:', {
        error: profileError?.message,
        code: profileError?.code,
        userId,
      });
      return new Response(
        JSON.stringify({
          error: 'User not found or profile error',
          details: profileError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Auth] User verified successfully');

    // Now userId is verified and we can proceed

    // Parse request
    const body: CertificateRequest = await req.json();
    const { action } = body;

    let result: any;

    switch (action) {
      case 'check_eligibility': {
        if (!body.course_id || !body.level) {
          return new Response(
            JSON.stringify({ error: 'course_id and level are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // كل الأرقام تُحسب على السيرفر؛ أي حقول إضافية من العميل تُتجاهل
        result = await checkEligibility(supabaseAdmin, userId, body.course_id, body.level);
        break;
      }

      case 'issue': {
        if (!body.course_id || !body.level) {
          return new Response(
            JSON.stringify({ error: 'course_id and level are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        result = await issueCertificate(supabaseAdmin, userId, body.course_id, body.level);
        break;
      }

      case 'verify': {
        if (!body.certificate_id) {
          return new Response(
            JSON.stringify({ error: 'certificate_id is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data, error } = await supabaseAdmin.rpc('verify_certificate', {
          cert_id: body.certificate_id,
        });

        if (error) {
          result = { found: false, error: error.message };
        } else {
          result = data;
        }
        break;
      }

      case 'revoke': {
        if (!body.certificate_id) {
          return new Response(
            JSON.stringify({ error: 'certificate_id is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Only allow revoking own certificates
        const { data: cert } = await supabaseAdmin
          .from('certificates')
          .select('user_id')
          .eq('id', body.certificate_id)
          .single();

        if (!cert || cert.user_id !== userId) {
          return new Response(
            JSON.stringify({ error: 'Certificate not found or not yours' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error: revokeError } = await supabaseAdmin
          .from('certificates')
          .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            revocation_reason: (body as any).reason || 'User requested',
          })
          .eq('id', body.certificate_id);

        if (revokeError) {
          result = { success: false, error: revokeError.message };
        } else {
          // Log revocation
          await supabaseAdmin.from('certificate_audit_log').insert({
            certificate_id: body.certificate_id,
            action: 'revoked',
            actor_id: userId,
            metadata: { reason: (body as any).reason || 'User requested' },
          });
          result = { success: true };
        }
        break;
      }

      case 'get_user_certs': {
        const { data, error } = await supabaseAdmin.rpc(
          'get_user_certificates_summary',
          { p_user_id: userId }
        );

        if (error) {
          result = { error: error.message };
        } else {
          result = data;
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Certificate function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
