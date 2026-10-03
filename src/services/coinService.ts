/**
 * خدمة الكوينات والتقدم - Kodax
 *
 * التعلم الأساسي مجاني بالكامل: الدروس والدورات تُفتح بالتقدم (السيرفر يتحقق).
 * الكوينات عملة اختيارية للمزايا والاختصارات (فتح مبكر، تجميد السلسلة، طلبات ذكاء إضافية).
 * تُكتسب من النشاط الموثّق (تحديات، إكمال دورات، أهداف، إنجازات، المكافأة اليومية)
 * ومن الإعلانات الاختيارية. لا يمكن شراؤها بالمال.
 *
 * كل تغيير في الرصيد يتم على السيرفر عبر دوال RPC آمنة
 * (supabase/migrations/20260930000000_free_coins_system.sql).
 * التطبيق لا يرسل أي رصيد أو سعر — السيرفر يحدد كل شيء.
 */

import { normalizeAIQuota } from './aiQuota';
import { supabase } from '@/lib/supabase';

export type CoinErrorCode =
  | 'not_authenticated'
  | 'insufficient'
  | 'already_claimed'
  | 'activity_required'
  | 'daily_limit'
  | 'cooldown'
  | 'too_many_attempts'
  | 'too_fast'
  | 'expired'
  | 'invalid_session'
  | 'pending_verification'
  | 'unknown_course'
  | 'not_completed'
  | 'daily_cap'
  | 'locked'
  | 'ai_ad_limit'
  | 'max_freezes'
  | 'pack_limit'
  | 'try_first'
  | 'ad_required'
  | 'solution_revealed'
  | 'restricted'
  | 'network'
  | 'unavailable'
  | 'unknown';

export interface CoinResult {
  success: boolean;
  code?: CoinErrorCode;
  balance?: number;
  duplicate?: boolean;
  [key: string]: any;
}

export interface CoinTransaction {
  /** 'purchased' = سجلات قديمة من النظام المدفوع الملغى (للعرض فقط) */
  type: 'earned' | 'spent' | 'purchased';
  amount: number;
  reason: string | null;
  source: string | null;
  created_at: string;
}

export interface CoinState {
  balance: number;
  lifetimeEarned: number;
  unlockedCourses: string[];
  learningStreak: number;
  daily: {
    rewards: number[];
    claimedToday: boolean;
    currentDay: number;
    nextDay: number;
    runDays: number;
    bestRun: number;
    streakBroken: boolean;
    requiresActivity: boolean;
    hasActivityToday: boolean;
  };
  ads: {
    reward: number;
    limit: number;
    bonus: number;
    watchedToday: number;
    nextAvailableAt: string | null;
  };
  challenges: {
    easy: number;
    medium: number;
    hard: number;
    dailyCap: number;
    earnedToday: number;
  };
  courseCompletion: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  recent: CoinTransaction[];
}

export interface CourseCatalogEntry {
  course_id: string;
  field_id: string;
  unlock_cost: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  total_lessons: number;
}

/** حصة طلبات Gemini اليومية (موحّدة لكل أنواع المساعدة) — من ai_get_quota */
export interface AIQuota {
  used: number;
  limit: number;
  remaining: number;
  base_limit: number;
  bonus: number;
  ads: {
    watched: number;
    per_bonus: number;
    bonus_amount: number;
    bonuses_earned: number;
    max_bonuses: number;
    /** الإعلانات المكتملة نحو الزيادة التالية */
    progress: number;
    can_watch: boolean;
  };
}

/** رسالة واضحة للمستخدم لكل حالة (بدون أخطاء تقنية) */
export function coinMessage(
  code?: string,
  extra?: Record<string, any>
): string {
  switch (code) {
    case 'not_authenticated':
      return 'سجّل الدخول أولاً لجمع الكوينات.';
    case 'insufficient':
      return extra?.needed
        ? `تحتاج ${extra.needed} كوين إضافية.`
        : 'رصيدك من الكوينات غير كافٍ.';
    case 'already_claimed':
      return 'استلمت مكافأة اليوم بالفعل. عُد غداً لمكافأة أكبر!';
    case 'activity_required':
      return 'أكمل درساً أو تحدياً واحداً اليوم لتفتح مكافأة اليوم.';
    case 'daily_limit':
      return 'وصلت للحد اليومي من الإعلانات. عُد غداً!';
    case 'cooldown':
      return extra?.retry_after
        ? `انتظر ${extra.retry_after} ثانية قبل الإعلان التالي.`
        : 'انتظر قليلاً قبل الإعلان التالي.';
    case 'too_many_attempts':
      return 'محاولات كثيرة. حاول مرة أخرى بعد دقائق.';
    case 'too_fast':
    case 'expired':
    case 'invalid_session':
      return 'لم يكتمل الإعلان، لذلك لم تُمنح المكافأة.';
    case 'pending_verification':
      return 'جاري تأكيد مشاهدة الإعلان... سيُضاف رصيدك خلال لحظات.';
    case 'unknown_course':
      return 'هذه الدورة غير متاحة للفتح حالياً.';
    case 'not_completed':
      return 'أكمل المحتوى أولاً للحصول على المكافأة.';
    case 'daily_cap':
      return 'وصلت للحد اليومي من مكافآت التحديات. استمر بالتعلم!';
    case 'locked':
      return 'هذا المحتوى يُفتح بالتقدم في الدورة السابقة.';
    case 'ai_ad_limit':
      return 'استخدمت كل زيادات حصة الذكاء بالإعلانات لليوم. تتجدد غداً.';
    case 'max_freezes':
      return 'لديك الحد الأقصى من تجميد السلسلة.';
    case 'pack_limit':
      return 'اشتريت حزمة اليوم بالفعل. تتجدد غداً.';
    case 'try_first':
      return extra?.state?.attempts_needed
        ? `حاول حل التحدي بنفسك أولاً (${extra.state.attempts_needed} محاولات أخرى، أو انتظر ${extra.state.minutes_left} دقيقة).`
        : 'حاول حل التحدي بنفسك أولاً.';
    case 'ad_required':
      return 'شاهد إعلاناً قصيراً لإظهار الحل.';
    case 'restricted':
      return 'تم تقييد الكوينات على حسابك مؤقتاً. تواصل مع الدعم.';
    case 'network':
      return 'تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.';
    case 'unavailable':
      return 'نظام المكافآت غير متاح حالياً. حاول لاحقاً.';
    default:
      return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  }
}

function isNetworkError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout') ||
    msg.includes('fetch')
  );
}

async function callRpc<T = CoinResult>(
  fn: string,
  args?: Record<string, unknown>
): Promise<T | CoinResult> {
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) {
      // PGRST202 = function not found (migration not applied yet)
      if (error.code === 'PGRST202' || error.code === '42883') {
        console.warn(`[coins] RPC ${fn} is not deployed`);
        return { success: false, code: 'unavailable' };
      }
      console.warn(`[coins] RPC ${fn} failed:`, error.message);
      return {
        success: false,
        code: isNetworkError(error) ? 'network' : 'unknown',
      };
    }
    return (data ?? { success: false, code: 'unknown' }) as T;
  } catch (err) {
    console.warn(`[coins] RPC ${fn} threw:`, err);
    return {
      success: false,
      code: isNetworkError(err) ? 'network' : 'unknown',
    };
  }
}

function mapState(raw: any): CoinState {
  const d = raw?.daily ?? {};
  const a = raw?.ads ?? {};
  const c = raw?.challenges ?? {};
  return {
    balance: raw?.balance ?? 0,
    lifetimeEarned: raw?.lifetime_earned ?? 0,
    unlockedCourses: Array.isArray(raw?.unlocked_courses)
      ? raw.unlocked_courses
      : [],
    learningStreak: raw?.learning_streak ?? 0,
    daily: {
      rewards: Array.isArray(d.rewards)
        ? d.rewards
        : [5, 10, 15, 20, 25, 30, 50],
      claimedToday: !!d.claimed_today,
      currentDay: d.current_day ?? 0,
      nextDay: d.next_day ?? 1,
      runDays: d.run_days ?? 0,
      bestRun: d.best_run ?? 0,
      streakBroken: !!d.streak_broken,
      requiresActivity: d.requires_activity !== false,
      hasActivityToday: !!d.has_activity_today,
    },
    ads: {
      reward: a.reward ?? 15,
      limit: a.limit ?? 4,
      bonus: a.bonus ?? 0,
      watchedToday: a.watched_today ?? 0,
      nextAvailableAt: a.next_available_at ?? null,
    },
    challenges: {
      easy: c.easy ?? 5,
      medium: c.medium ?? 10,
      hard: c.hard ?? 15,
      dailyCap: c.daily_cap ?? 60,
      earnedToday: c.earned_today ?? 0,
    },
    courseCompletion: {
      beginner: raw?.course_completion?.beginner ?? 30,
      intermediate: raw?.course_completion?.intermediate ?? 50,
      advanced: raw?.course_completion?.advanced ?? 75,
    },
    recent: Array.isArray(raw?.recent) ? raw.recent : [],
  };
}

export const coinService = {
  async getState(): Promise<{ state: CoinState | null; code?: CoinErrorCode }> {
    const res: any = await callRpc('coins_get_state');
    if (!res?.success) return { state: null, code: res?.code };
    return { state: mapState(res) };
  },

  claimDailyReward(): Promise<CoinResult> {
    return callRpc('coins_claim_daily_reward');
  },

  startAdSession(): Promise<CoinResult> {
    return callRpc('coins_start_ad_session');
  },

  /** جلسة إعلان لزيادة حصة الذكاء (نفس نظام الإعلانات، بدون كوينات) */
  startAiAdSession(): Promise<CoinResult> {
    return callRpc('ai_start_ad_session');
  },

  claimAdReward(sessionId: string): Promise<CoinResult> {
    return callRpc('coins_claim_ad_reward', { p_session_id: sessionId });
  },

  unlockCourse(courseId: string): Promise<CoinResult> {
    return callRpc('coins_unlock_course', { p_course_id: courseId });
  },

  unlockField(fieldId: string): Promise<CoinResult> {
    return callRpc('coins_unlock_field', { p_field_id: fieldId });
  },

  rewardChallenge(
    challengeId: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<CoinResult> {
    return callRpc('coins_reward_challenge', {
      p_challenge_id: challengeId,
      p_difficulty: difficulty,
    });
  },

  rewardCourseCompletion(courseId: string): Promise<CoinResult> {
    return callRpc('coins_reward_course_completion', { p_course_id: courseId });
  },

  async getCatalog(): Promise<CourseCatalogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('course_coin_catalog')
        .select('course_id, field_id, unlock_cost, difficulty, total_lessons')
        .eq('is_active', true);
      if (error || !data) return [];
      return data as CourseCatalogEntry[];
    } catch {
      return [];
    }
  },

  async getAIQuota(): Promise<AIQuota | null> {
    return normalizeAIQuota(await callRpc('ai_get_quota'));
  },

  // ===== التقدم (الدورات تُفتح بالتعلم) =====
  async getProgressState(): Promise<ProgressState | null> {
    const res: any = await callRpc('progress_get_state');
    return res?.success ? (res as ProgressState) : null;
  },

  // ===== الأهداف والسلسلة =====
  setDailyGoal(target: number): Promise<CoinResult> {
    return callRpc('goals_set', { p_daily_target: target });
  },

  buyStreakFreeze(): Promise<CoinResult> {
    return callRpc('streak_freeze_buy');
  },

  /** طلبات ذكاء إضافية بالكوينات (اختيارية، بديل للإعلانات) */
  buyAiPack(): Promise<CoinResult> {
    return callRpc('ai_buy_pack');
  },

  // ===== الحل الجاهز للتحدي (إعلان Rewarded) =====
  challengeAttemptState(challengeId: string): Promise<CoinResult> {
    return callRpc('challenge_attempt_state', { p_challenge_id: challengeId });
  },

  /** محاولة محلية فاشلة (قبل الإرسال للتحقق) — تُستخدم لأهلية التلميحات وإظهار الحل فقط */
  recordChallengeAttempt(challengeId: string, passed: number, total: number): Promise<CoinResult> {
    return callRpc('challenge_record_attempt', { p_challenge_id: challengeId, p_passed: passed, p_total: total });
  },

  startSolutionAdSession(challengeId: string): Promise<CoinResult> {
    return callRpc('challenge_solution_start', { p_challenge_id: challengeId });
  },

  revealSolution(challengeId: string): Promise<CoinResult> {
    return callRpc('challenge_reveal_solution', { p_challenge_id: challengeId });
  },

  adSessionStatus(sessionId: string): Promise<CoinResult> {
    return callRpc('ad_session_status', { p_session_id: sessionId });
  },

  dailyChallenge(): Promise<CoinResult> {
    return callRpc('daily_challenge_get');
  },

  /** أحداث الواجهة فقط (ما لا يراه السيرفر) — لا تؤثر على أي مكافأة */
  track(event: string, props: Record<string, unknown> = {}): void {
    callRpc('track_event', { p_event: event, p_props: props }).catch(() => undefined);
  },
};

export interface CourseAccess {
  course_id: string;
  accessible: boolean;
  purchased: boolean;
  requires_course_id: string | null;
  required_ratio: number | null;
  prereq_progress: number | null;
  progress: number;
  shortcut_cost: number;
}

export interface GoalsState {
  daily_target: number;
  daily_options: number[];
  today_units: number;
  daily_done: boolean;
  daily_reward: number;
  daily_rewarded: boolean;
  weekly_target_days: number;
  week_active_days: number;
  weekly_done: boolean;
  weekly_reward: number;
  weekly_rewarded: boolean;
}

export interface ProgressState {
  success: true;
  courses: CourseAccess[];
  completed_lessons: string[];
  unverified_lessons: string[];
  streak: {
    current: number;
    best: number;
    freezes: number;
    max_freezes: number;
    freeze_price: number;
    free_freezes_per_week: number;
    active_today: boolean;
  };
  goals: GoalsState;
  achievements: Array<{ id: string; coins: number; awarded_at: string }>;
  level: number;
}

export default coinService;
