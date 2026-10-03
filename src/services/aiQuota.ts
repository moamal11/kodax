/**
 * تحويل رد ai_get_quota إلى شكل واحد للواجهة.
 * - السيرفر الجديد (migration 20261002030000): { used, limit, remaining, ads, ... }
 * - السيرفر قبلها: حصص منفصلة { chat: {limit, remaining}, hint: ..., ... }
 *   نعرض حصة المحادثة (التي تستهلكها صفحة المساعد) حتى تُطبَّق الـmigration.
 */
import type { AIQuota } from './coinService';

export function normalizeAIQuota(res: any): AIQuota | null {
  if (!res || res.success === false) return null;
  if (typeof res.limit === 'number') return res as AIQuota;
  const chat = res.chat;
  if (chat && typeof chat.limit === 'number' && typeof chat.remaining === 'number') {
    return {
      used: Math.max(0, chat.limit - chat.remaining),
      limit: chat.limit,
      remaining: chat.remaining,
      base_limit: chat.limit,
      bonus: 0,
      // إعلانات زيادة الحصة تحتاج الـmigration الجديدة
      ads: { watched: 0, per_bonus: 2, bonus_amount: 0, bonuses_earned: 0, max_bonuses: 0, progress: 0, can_watch: false },
    };
  }
  return null;
}
