/**
 * منطق التحقق من حل التحدي على السيرفر (بدون أي اعتماد على Deno أو Supabase
 * مباشرة — كل الاعتمادات تُمرَّر، حتى يمكن اختباره محلياً).
 *
 * التحدي لا يُسجَّل مكتملاً إلا إذا شغّل السيرفر كود المستخدم على كل اختبارات
 * التحدي (بما فيها المخفية) واجتازها. نتيجة العميل لا تُقبل أبداً.
 */
import {
  validateChallenge,
  type ChallengeCheck,
  type ChallengeValidationResult,
  type TestCase,
} from '../_shared/challengeValidator.ts';

export interface ChallengeSpec {
  id: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  starterCode: string;
  testCases: TestCase[];
  checks?: ChallengeCheck[];
  entryFunction?: string;
  validation?: 'execution' | 'structural';
  prelude?: string;
}

export interface RecordResult {
  recorded: boolean;
  first_time: boolean;
  xp_awarded: number;
  /** السيرفر رفض التسجيل لأن التحدي مقفول على هذا المستخدم */
  locked?: boolean;
  /** كشف المستخدم الحل بإعلان قبل حله: XP مخفّض ولا كوينات */
  solution_revealed?: boolean;
  /** حالة المحاولات على السيرفر (مستوى التلميح، هل يمكن إظهار الحل) */
  attempts?: AttemptState;
}

export interface AttemptState {
  attempts: number;
  failed_attempts: number;
  solved: boolean;
  revealed: boolean;
  hint_level: number;
  can_reveal: boolean;
  reveal_needs_ad: boolean;
  attempts_needed: number;
  minutes_left: number;
}

export interface AccessResult {
  allowed: boolean;
  required_course_id: string | null;
}

export interface CoinResult {
  success: boolean;
  reward?: number;
  duplicate?: boolean;
  code?: string;
}

export interface VerifyDeps {
  specs: Record<string, ChallengeSpec>;
  getUserId: (token: string) => Promise<string | null>;
  /** الوصول من بيانات السيرفر فقط (challenge_access_check) — لا شيء يرسله العميل */
  checkAccess: (userId: string, challengeId: string) => Promise<AccessResult>;
  countRecentSubmissions: (userId: string, sinceIso: string) => Promise<number>;
  recordSubmission: (args: {
    userId: string;
    challengeId: string;
    passedTests: number;
    totalTests: number;
    allPassed: boolean;
    codeSha256: string;
  }) => Promise<RecordResult>;
  rewardCoins: (token: string, challengeId: string, difficulty: string) => Promise<CoinResult>;
  /** قابل للاستبدال في الاختبارات */
  validate?: typeof validateChallenge;
  now?: () => Date;
}

export const MAX_CODE_CHARS = 20000;
export const RATE_LIMIT = { max: 30, windowMinutes: 10 };

type Reply = { status: number; body: Record<string, unknown> };

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** نتائج آمنة للإرسال: الاختبارات المخفية بلا مدخلات أو نتائج أو نص خطأ */
function publicResults(r: ChallengeValidationResult) {
  return r.results.map((x) =>
    x.hidden
      ? { passed: x.passed, kind: x.kind, hidden: true, description: x.description, message: x.message }
      : {
          passed: x.passed,
          kind: x.kind,
          description: x.description,
          message: x.message,
          input: x.input,
          expectedOutput: x.expectedOutput,
          actualOutput: x.actualOutput,
          error: x.error,
        }
  );
}

export async function handleVerify(deps: VerifyDeps, token: string, body: unknown): Promise<Reply> {
  if (!token) return { status: 401, body: { error: 'not_authenticated' } };
  const userId = await deps.getUserId(token);
  if (!userId) return { status: 401, body: { error: 'not_authenticated' } };

  const { challengeId, code } = (body ?? {}) as { challengeId?: unknown; code?: unknown };
  if (typeof challengeId !== 'string' || typeof code !== 'string') {
    return { status: 400, body: { error: 'invalid_request' } };
  }
  const spec = deps.specs[challengeId];
  if (!spec) return { status: 404, body: { error: 'unknown_challenge' } };
  if (code.length > MAX_CODE_CHARS) return { status: 413, body: { error: 'code_too_long', max: MAX_CODE_CHARS } };

  // التحدي المقفول: لا تشغيل ولا تسجيل ولا XP ولا كوينات
  const access = await deps.checkAccess(userId, challengeId);
  if (!access.allowed) {
    return { status: 403, body: { error: 'challenge_locked', requiredCourseId: access.required_course_id } };
  }

  const now = deps.now?.() ?? new Date();
  const since = new Date(now.getTime() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  if ((await deps.countRecentSubmissions(userId, since)) >= RATE_LIMIT.max) {
    return { status: 429, body: { error: 'rate_limited', retryAfterMinutes: RATE_LIMIT.windowMinutes } };
  }

  const validate = deps.validate ?? validateChallenge;
  const result = await validate(code, spec.starterCode, spec.language, spec.testCases, {
    checks: spec.checks,
    entryFunction: spec.entryFunction,
    validation: spec.validation,
    prelude: spec.prelude,
  });

  const allPassed = result.allPassed && !result.serviceError;
  const record = await deps.recordSubmission({
    userId,
    challengeId,
    passedTests: result.passedTests,
    totalTests: result.totalTests,
    allPassed,
    codeSha256: await sha256(code),
  });

  // record_challenge_submission تفرض القفل أيضاً (تغيّر الوصول بين الفحص والتسجيل)
  if (record.locked) {
    return { status: 403, body: { error: 'challenge_locked', requiredCourseId: access.required_course_id } };
  }

  if (result.serviceError) {
    return {
      status: 503,
      body: { error: 'execution_unavailable', verified: false, results: publicResults(result) },
    };
  }

  let coins: CoinResult | null = null;
  if (allPassed && record.first_time) {
    try {
      coins = await deps.rewardCoins(token, challengeId, spec.difficulty);
    } catch {
      coins = { success: false, code: 'reward_failed' };
    }
  }

  return {
    status: 200,
    body: {
      verified: allPassed,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      mode: result.mode,
      results: publicResults(result),
      completion: {
        recorded: record.recorded,
        firstTime: record.first_time,
        xpAwarded: record.xp_awarded,
        solutionRevealed: record.solution_revealed === true,
      },
      // المحاولة الأولى: ملاحظات؛ الثانية: تلميح؛ الثالثة: تلميح أقوى؛ بعدها يمكن طلب الحل (إعلان)
      attempts: record.attempts ?? null,
      coins,
    },
  };
}
