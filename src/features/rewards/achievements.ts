/**
 * أسماء الإنجازات للعرض (المعرّفات من coin_config.achievements على السيرفر) — F15:
 * السجل كان يعرض «first_challenge» بدل اسم مفهوم.
 */
import type { CoinTransaction } from '@/services/coinService';

export const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_lesson: 'أول درس',
  lessons_10: '10 دروس',
  lessons_50: '50 درساً',
  lessons_100: '100 درس',
  first_challenge: 'أول تحدٍّ',
  challenges_10: '10 تحديات',
  challenges_50: '50 تحدياً',
  first_course: 'أول دورة مكتملة',
  courses_5: '5 دورات مكتملة',
  streak_7: 'سلسلة 7 أيام',
  streak_30: 'سلسلة 30 يوماً',
};

const SOURCE_LABEL: Record<string, string> = {
  daily_reward: 'مكافأة يومية',
  challenge: 'حل تحدٍّ',
  course_complete: 'إكمال دورة',
  goal_daily: 'هدف اليوم',
  goal_weekly: 'هدف الأسبوع',
  ad_reward: 'إعلان اختياري',
  ad: 'إعلان اختياري',
  streak_freeze: 'تجميد السلسلة',
  unlock_course: 'فتح مبكر لدورة',
  unlock_field: 'فتح مبكر لمسار',
  ai_pack: 'طلبات ذكاء إضافية',
  admin_adjust: 'تعديل من الإدارة',
};

/** وصف بشري لحركة كوينات */
export function transactionLabel(t: CoinTransaction): string {
  if (t.type === 'purchased') return 'رصيد سابق';
  const r = t.reason ?? '';
  const m = r.match(/^إنجاز:\s*([a-z0-9_]+)$/);
  if (m) return `إنجاز: ${ACHIEVEMENT_NAMES[m[1]] ?? 'إنجاز جديد'}`;
  if (/^[a-z0-9_]+$/.test(r)) return ACHIEVEMENT_NAMES[r] ? `إنجاز: ${ACHIEVEMENT_NAMES[r]}` : SOURCE_LABEL[r] ?? 'مكافأة';
  if (r) return r;
  return (t.source && SOURCE_LABEL[t.source]) || (t.type === 'spent' ? 'فتح محتوى' : 'مكافأة');
}
