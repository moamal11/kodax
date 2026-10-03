/**
 * Rewarded Ads فقط (لا Banner ولا Interstitial ولا App Open)، وكلها بطلب المستخدم:
 *  coins: كوينات (اختصار اختياري) — ai_quota: طلبات ذكاء إضافية — solution: إظهار حل التحدي
 */
export type RewardedAdPurpose = 'coins' | 'ai_quota' | 'solution';

export interface RewardedAdOptions {
  /** لإعلان إظهار الحل: معرّف التحدي (يُحفظ في الجلسة على السيرفر) */
  challengeId?: string;
}

export interface RewardedAdResult {
  success: boolean;
  /** الكوينات المضافة من الإعلان */
  reward?: number;
  /** مكافأة إكمال تحدي الإعلانات اليومي (إن وُجدت) */
  bonus?: number;
  balance?: number;
  watched?: number;
  code?: string;
  message?: string;
  retryAfter?: number;
  /** لإعلانات حصة الذكاء: الحصة بعد اعتماد الإعلان */
  aiQuota?: import('./coinService').AIQuota;
  /** اكتملت زيادة جديدة لحصة الذكاء مع هذا الإعلان */
  bonusUnlocked?: boolean;
  /** إعلان الحل: الحل صار متاحاً (challenge_reveal_solution) — أو كان متاحاً بلا إعلان */
  solutionUnlocked?: boolean;
}
