/**
 * إرسال حل التحدي للتحقق على السيرفر (دالة verify-challenge).
 *
 * السيرفر يشغّل الكود على كل اختبارات التحدي (المخفية أيضاً)، وهو وحده من
 * يسجّل الإكمال ويمنح XP والكوينات. العميل لا يستطيع كتابة إكمال التحديات مباشرة.
 */
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ValidationResult } from './challengeValidator';

export interface VerifiedSubmission {
  ok: true;
  verified: boolean;
  passedTests: number;
  totalTests: number;
  mode?: 'execution' | 'structural';
  results: ValidationResult[];
  completion: { recorded: boolean; firstTime: boolean; xpAwarded: number; solutionRevealed?: boolean };
  /** حالة المحاولات على السيرفر (مستوى التلميح، أهلية إظهار الحل) */
  attempts?: import('@/components/challenge/SolutionReveal').ChallengeAttemptState | null;
  coins: { success: boolean; reward?: number; duplicate?: boolean; code?: string } | null;
}

export type SubmissionFailureReason =
  | 'not_authenticated'
  | 'rate_limited'
  | 'locked'
  | 'execution_unavailable'
  | 'network'
  | 'server_error';

export interface FailedSubmission {
  ok: false;
  reason: SubmissionFailureReason;
  message: string;
}

const MESSAGES: Record<SubmissionFailureReason, string> = {
  not_authenticated: 'انتهت جلستك — سجّل الدخول مرة أخرى لحفظ الإكمال.',
  locked: 'هذا التحدي يُفتح بالتقدم في دورته — تابع الدروس ثم أعد الإرسال.',
  rate_limited: 'محاولات كثيرة خلال وقت قصير — انتظر بضع دقائق ثم أعد الإرسال.',
  execution_unavailable: 'خادم تشغيل الأكواد غير متاح الآن — كودك محفوظ، أعد المحاولة بعد قليل.',
  network: 'تعذّر الاتصال بالسيرفر — تحقق من الإنترنت ثم أعد الإرسال. كودك محفوظ.',
  server_error: 'حدث خطأ في السيرفر أثناء حفظ الإكمال — كودك محفوظ، أعد المحاولة.',
};

function failure(reason: SubmissionFailureReason): FailedSubmission {
  return { ok: false, reason, message: MESSAGES[reason] };
}

export async function submitChallengeSolution(
  challengeId: string,
  code: string
): Promise<VerifiedSubmission | FailedSubmission> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-challenge', {
      body: { challengeId, code },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        const status = error.context?.status as number | undefined;
        if (status === 401) return failure('not_authenticated');
        if (status === 403) return failure('locked');
        if (status === 429) return failure('rate_limited');
        if (status === 503) return failure('execution_unavailable');
        return failure('server_error');
      }
      return failure('network');
    }

    if (!data || typeof data.verified !== 'boolean') return failure('server_error');
    return { ok: true, ...data } as VerifiedSubmission;
  } catch {
    return failure('network');
  }
}
