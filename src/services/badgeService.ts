/**
 * badgeService.ts
 *
 * خدمة الشارات - فحص الشروط ومنح الشارات وحفظها
 * تعمل محلياً عبر AsyncStorage مع مزامنة Supabase للمشاركة بين الأجهزة
 */

import AsyncStorage from '@/lib/platformStorage';
import { supabase } from '@/lib/supabase';
import {
  ALL_BADGES,
  BadgeDefinition,
  BadgeConditionType,
} from '@/constants/badgeDefinitions';

const EARNED_BADGES_KEY = '@kodax_earned_badges';
const CHALLENGE_STREAK_KEY = '@kodax_challenge_streak';
const NO_HINT_COUNT_KEY = '@kodax_no_hint_challenges';
const HARD_CHALLENGE_COUNT_KEY = '@kodax_hard_challenges';
const COMEBACK_KEY = '@kodax_comeback_detected';

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface BadgeCheckContext {
  completedChallenges: number;
  completedLessons: number;
  completedCourses: number;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  hardChallengesCompleted: number;
  challengesWithoutHints: number;
  challengeStreak: number;
  lifetimeCoins: number;
  unlockedCourses: number;
  hasUnlockedWithCoins: boolean;
  isComeback: boolean;
  hasCourse100Percent: boolean;
}

type BadgeEventCallback = (badge: BadgeDefinition) => void;

class BadgeService {
  private earnedBadgeIds: Set<string> = new Set();
  private earnedBadgesMap: Map<string, string> = new Map(); // badgeId -> earnedAt
  private initialized = false;
  private onBadgeEarned: BadgeEventCallback | null = null;
  private userId: string | null = null;

  // ===== تعيين معرف المستخدم =====
  async setUserId(userId: string | null): Promise<void> {
    if (this.userId !== userId) {
      // مسح بيانات المستخدم القديم من AsyncStorage — دائماً عند تغيير المستخدم
      try {
        await AsyncStorage.multiRemove([
          EARNED_BADGES_KEY,
          CHALLENGE_STREAK_KEY,
          NO_HINT_COUNT_KEY,
          HARD_CHALLENGE_COUNT_KEY,
          COMEBACK_KEY,
        ]);
        console.log('✅ Cleared badge data from AsyncStorage (user changed)');
      } catch (e) {
        console.error('⚠️ Failed to clear badge data:', e);
      }

      this.userId = userId;
      this.initialized = false; // إعادة التهيئة عند تغيير المستخدم
      this.earnedBadgeIds.clear();
      this.earnedBadgesMap.clear();
    }
  }

  // ===== تهيئة =====
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. محاولة جلب من Supabase أولاً (للمزامنة بين الأجهزة)
      if (this.userId) {
        try {
          const { data, error } = await supabase
            .from('user_badges')
            .select('badge_id, earned_at')
            .eq('user_id', this.userId);

          // ✅ قبول أي نتيجة من Supabase (حتى لو فارغة)
          if (!error && data) {
            // استخدام بيانات Supabase
            this.earnedBadgeIds = new Set(data.map((b) => b.badge_id));
            this.earnedBadgesMap = new Map(
              data.map((b) => [b.badge_id, b.earned_at])
            );

            // حفظ في AsyncStorage للاستخدام دون اتصال
            const badges: EarnedBadge[] = data.map((b) => ({
              badgeId: b.badge_id,
              earnedAt: b.earned_at,
            }));
            await AsyncStorage.setItem(
              EARNED_BADGES_KEY,
              JSON.stringify(badges)
            );

            console.log(
              `✅ Loaded ${data.length} badges from Supabase for user ${this.userId}`
            );
            this.initialized = true;
            return;
          }
        } catch (supabaseError) {
          console.warn(
            '⚠️ Supabase badges fetch failed, using local:',
            supabaseError
          );
        }
      }

      // 2. إذا فشل Supabase أو لا يوجد مستخدم، استخدام AsyncStorage
      const stored = await AsyncStorage.getItem(EARNED_BADGES_KEY);
      if (stored) {
        const badges: EarnedBadge[] = JSON.parse(stored);
        this.earnedBadgeIds = new Set(badges.map((b) => b.badgeId));
        this.earnedBadgesMap = new Map(
          badges.map((b) => [b.badgeId, b.earnedAt])
        );

        // مزامنة مع Supabase إذا كان المستخدم متاحاً
        if (this.userId && badges.length > 0) {
          this.syncBadgesToSupabase(badges).catch((err) =>
            console.warn('⚠️ Background badge sync failed:', err)
          );
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Badge service init error:', error);
      this.initialized = true;
    }
  }

  // ===== إدراج شارة واحدة جديدة في Supabase =====
  private async insertBadgeToSupabase(
    badgeId: string,
    earnedAt: string
  ): Promise<boolean> {
    if (!this.userId) {
      console.warn('⚠️ Cannot save badge: No userId');
      return false;
    }

    try {
      console.log(
        `📤 Inserting badge "${badgeId}" to Supabase for user ${this.userId}...`
      );

      const { error } = await supabase.from('user_badges').insert({
        user_id: this.userId,
        badge_id: badgeId,
        earned_at: earnedAt,
      });

      if (error) {
        // تجاهل خطأ التكرار (الشارة موجودة مسبقاً)
        if (error.code === '23505') {
          console.log(`ℹ️ Badge "${badgeId}" already exists in Supabase`);
          return true;
        }

        console.error(`❌ Failed to insert badge "${badgeId}":`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        // إذا كان الجدول غير موجود
        if (
          error.code === '42P01' ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist')
        ) {
          console.error('\n⚠️⚠️ جدول user_badges غير موجود في Supabase!');
          console.error('📝 شغّل الأمر التالي في Supabase SQL Editor:');
          console.error('   انسخ محتوى ملف APPLY_THIS_SQL.sql وشغّله');
        }

        // إذا كان نوع البيانات خاطئ (UUID vs TEXT)
        if (
          error.message?.includes('uuid') ||
          error.message?.includes('invalid input syntax')
        ) {
          console.error('\n⚠️⚠️ نوع عمود badge_id خاطئ (UUID بدلاً من TEXT)!');
          console.error(
            '📝 يجب حذف الجدول وإعادة إنشائه. شغّل APPLY_THIS_SQL.sql'
          );
        }

        return false;
      }

      console.log(`✅ Badge "${badgeId}" saved to Supabase successfully!`);
      return true;
    } catch (error: any) {
      console.error(`❌ Exception inserting badge "${badgeId}":`, error);
      return false;
    }
  }

  // ===== مزامنة جميع الشارات إلى Supabase (في الخلفية) =====
  private async syncBadgesToSupabase(badges: EarnedBadge[]): Promise<void> {
    if (!this.userId || badges.length === 0) return;

    console.log(`🔄 Background sync: ${badges.length} badges to Supabase...`);

    let successCount = 0;
    let failCount = 0;

    for (const badge of badges) {
      const success = await this.insertBadgeToSupabase(
        badge.badgeId,
        badge.earnedAt
      );
      if (success) {
        successCount++;
      } else {
        failCount++;
        // إذا فشل أول إدراج، توقف (الجدول غير موجود أو مشكلة RLS)
        if (failCount === 1 && successCount === 0) {
          console.error(
            '❌ First badge insert failed - stopping sync (table might not exist)'
          );
          break;
        }
      }
    }

    console.log(
      `📊 Sync complete: ${successCount} succeeded, ${failCount} failed`
    );
  }

  // ===== تسجيل callback عند كسب شارة =====
  setOnBadgeEarned(callback: BadgeEventCallback | null): void {
    this.onBadgeEarned = callback;
  }

  // ===== فحص ومنح الشارات =====
  async checkAndAwardBadges(
    context: BadgeCheckContext
  ): Promise<BadgeDefinition[]> {
    await this.initialize();

    const newlyEarned: BadgeDefinition[] = [];

    console.log('🔍 Checking badges for context:', {
      completedChallenges: context.completedChallenges,
      completedLessons: context.completedLessons,
      totalXP: context.totalXP,
      level: context.currentLevel,
    });

    for (const badge of ALL_BADGES) {
      // تخطي الشارات المكتسبة سابقاً
      if (this.earnedBadgeIds.has(badge.id)) continue;

      // فحص الشرط
      if (this.checkCondition(badge, context)) {
        console.log(`🏆 New badge earned: ${badge.id} (${badge.nameAr})`);
        newlyEarned.push(badge);
        this.earnedBadgeIds.add(badge.id);
        // حفظ تاريخ الحصول على الشارة
        const earnedAt = new Date().toISOString();
        this.earnedBadgesMap.set(badge.id, earnedAt);
        console.log(`✅ Badge ${badge.id} added to map with date: ${earnedAt}`);
      }
    }

    // حفظ إذا تم كسب شارات جديدة
    if (newlyEarned.length > 0) {
      console.log(`💾 Saving ${newlyEarned.length} new badges...`);

      // 1. حفظ محلي
      await this.saveEarnedBadgesLocally();

      // 2. حفظ في Supabase - كل شارة جديدة على حدة
      for (const badge of newlyEarned) {
        const earnedAt =
          this.earnedBadgesMap.get(badge.id) || new Date().toISOString();
        await this.insertBadgeToSupabase(badge.id, earnedAt);
      }

      // 3. إطلاق callback لكل شارة جديدة
      for (const badge of newlyEarned) {
        this.onBadgeEarned?.(badge);
      }
    } else {
      console.log('ℹ️ No new badges earned');
    }

    return newlyEarned;
  }

  // ===== فحص شرط شارة واحدة =====
  private checkCondition(
    badge: BadgeDefinition,
    context: BadgeCheckContext
  ): boolean {
    switch (badge.conditionType) {
      case 'first_challenge':
        return context.completedChallenges >= 1;

      case 'challenges_completed':
        return context.completedChallenges >= badge.conditionValue;

      case 'hard_challenges_completed':
        return context.hardChallengesCompleted >= badge.conditionValue;

      case 'challenges_no_hints':
        return context.challengesWithoutHints >= badge.conditionValue;

      case 'challenge_streak':
        return context.challengeStreak >= badge.conditionValue;

      case 'first_lesson':
        return context.completedLessons >= 1;

      case 'lessons_completed':
        return context.completedLessons >= badge.conditionValue;

      case 'courses_completed':
        return context.completedCourses >= badge.conditionValue;

      case 'course_100_percent':
        return context.hasCourse100Percent;

      case 'level_reached':
        return context.currentLevel >= badge.conditionValue;

      case 'rapid_level':
        return false; // يتطلب تتبع زمني إضافي

      case 'xp_earned':
        return context.totalXP >= badge.conditionValue;

      case 'first_xp':
        return context.totalXP >= 1;

      case 'streak_days':
        return context.currentStreak >= badge.conditionValue;

      case 'comeback_streak':
        return context.isComeback;

      case 'first_coin_unlock':
        return context.hasUnlockedWithCoins;

      case 'coins_earned':
        return context.lifetimeCoins >= badge.conditionValue;

      case 'courses_unlocked':
        return context.unlockedCourses >= badge.conditionValue;

      default:
        return false;
    }
  }

  // ===== حفظ الشارات محلياً في AsyncStorage =====
  private async saveEarnedBadgesLocally(): Promise<void> {
    try {
      const badges: EarnedBadge[] = Array.from(this.earnedBadgeIds).map(
        (badgeId) => ({
          badgeId,
          earnedAt:
            this.earnedBadgesMap.get(badgeId) || new Date().toISOString(),
        })
      );

      await AsyncStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(badges));
      console.log(`✅ Saved ${badges.length} badges to AsyncStorage`);
    } catch (error) {
      console.error('❌ Error saving badges to AsyncStorage:', error);
    }
  }

  // ===== الحصول على الشارات المكتسبة =====
  async getEarnedBadges(): Promise<BadgeDefinition[]> {
    await this.initialize();
    return ALL_BADGES.filter((b) => this.earnedBadgeIds.has(b.id));
  }

  // ===== الحصول على IDs الشارات المكتسبة =====
  async getEarnedBadgeIds(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.earnedBadgeIds);
  }

  // ===== التحقق من كسب شارة معينة =====
  isBadgeEarned(badgeId: string): boolean {
    return this.earnedBadgeIds.has(badgeId);
  }

  // ===== الحصول على كل الشارات مع حالة الكسب =====
  async getAllBadgesWithStatus(): Promise<
    (BadgeDefinition & { earned: boolean; earnedAt?: string })[]
  > {
    await this.initialize();

    const storedRaw = await AsyncStorage.getItem(EARNED_BADGES_KEY);
    const stored: EarnedBadge[] = storedRaw ? JSON.parse(storedRaw) : [];
    const earnedMap = new Map(stored.map((b) => [b.badgeId, b.earnedAt]));

    return ALL_BADGES.map((badge) => ({
      ...badge,
      earned: this.earnedBadgeIds.has(badge.id),
      earnedAt: earnedMap.get(badge.id),
    }));
  }

  // ===== حساب نسبة التقدم لشارة معينة =====
  getBadgeProgress(badge: BadgeDefinition, context: BadgeCheckContext): number {
    if (this.earnedBadgeIds.has(badge.id)) return 100;

    let current = 0;
    let target = badge.conditionValue;

    switch (badge.conditionType) {
      case 'first_challenge':
      case 'challenges_completed':
        current = context.completedChallenges;
        break;
      case 'hard_challenges_completed':
        current = context.hardChallengesCompleted;
        break;
      case 'challenges_no_hints':
        current = context.challengesWithoutHints;
        break;
      case 'challenge_streak':
        current = context.challengeStreak;
        break;
      case 'first_lesson':
      case 'lessons_completed':
        current = context.completedLessons;
        break;
      case 'courses_completed':
        current = context.completedCourses;
        break;
      case 'level_reached':
        current = context.currentLevel;
        break;
      case 'xp_earned':
      case 'first_xp':
        current = context.totalXP;
        target = badge.conditionType === 'first_xp' ? 1 : badge.conditionValue;
        break;
      case 'streak_days':
        current = context.currentStreak;
        break;
      case 'courses_unlocked':
        current = context.unlockedCourses;
        break;
      case 'course_100_percent':
        current = context.hasCourse100Percent ? 1 : 0;
        target = 1;
        break;
      case 'comeback_streak':
        current = context.isComeback ? 1 : 0;
        target = 1;
        break;
      case 'first_coin_unlock':
        current = context.hasUnlockedWithCoins ? 1 : 0;
        target = 1;
        break;
      case 'coins_earned':
        current = context.lifetimeCoins;
        break;
      default:
        return 0;
    }

    return Math.min(100, Math.round((current / target) * 100));
  }

  // ===== تتبع سلسلة التحديات (بدون فشل) =====
  async incrementChallengeStreak(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGE_STREAK_KEY);
      const streak = (stored ? parseInt(stored) : 0) + 1;
      await AsyncStorage.setItem(CHALLENGE_STREAK_KEY, streak.toString());
      return streak;
    } catch {
      return 0;
    }
  }

  async resetChallengeStreak(): Promise<void> {
    try {
      await AsyncStorage.setItem(CHALLENGE_STREAK_KEY, '0');
    } catch {}
  }

  async getChallengeStreak(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGE_STREAK_KEY);
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  }

  // ===== تتبع التحديات بدون تلميحات =====
  async incrementNoHintCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(NO_HINT_COUNT_KEY);
      const count = (stored ? parseInt(stored) : 0) + 1;
      await AsyncStorage.setItem(NO_HINT_COUNT_KEY, count.toString());
      return count;
    } catch {
      return 0;
    }
  }

  async getNoHintCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(NO_HINT_COUNT_KEY);
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  }

  // ===== تتبع التحديات الصعبة =====
  async incrementHardChallengeCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(HARD_CHALLENGE_COUNT_KEY);
      const count = (stored ? parseInt(stored) : 0) + 1;
      await AsyncStorage.setItem(HARD_CHALLENGE_COUNT_KEY, count.toString());
      return count;
    } catch {
      return 0;
    }
  }

  async getHardChallengeCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(HARD_CHALLENGE_COUNT_KEY);
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  }

  // ===== تتبع العودة بعد الانقطاع =====
  async setComeback(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(COMEBACK_KEY, value ? '1' : '0');
    } catch {}
  }

  async getComeback(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(COMEBACK_KEY);
      return stored === '1';
    } catch {
      return false;
    }
  }

  // ===== إعادة تعيين =====
  async reset(): Promise<void> {
    this.earnedBadgeIds.clear();
    this.initialized = false;
    try {
      await AsyncStorage.multiRemove([
        EARNED_BADGES_KEY,
        CHALLENGE_STREAK_KEY,
        NO_HINT_COUNT_KEY,
        HARD_CHALLENGE_COUNT_KEY,
        COMEBACK_KEY,
      ]);
    } catch {}
  }

  /**
   * إعادة تعيين الحالة في الذاكرة فقط (بدون AsyncStorage)
   * يُستخدم بعد clearAllKodaxData() لتنظيف الذاكرة
   */
  resetState(): void {
    this.earnedBadgeIds.clear();
    this.earnedBadgesMap.clear();
    this.initialized = false;
    this.userId = null;
    console.log('🧹 BadgeService: State reset');
  }

  // ===== إحصائيات =====
  getEarnedCount(): number {
    return this.earnedBadgeIds.size;
  }

  getTotalCount(): number {
    return ALL_BADGES.length;
  }
}

export const badgeService = new BadgeService();
export default badgeService;
