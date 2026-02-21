/**
 * خدمة المزامنة الهجينة الذكية - Kodax Smart Hybrid Sync
 *
 * المبدأ: البيانات الثابتة (الدروس، العناوين) محلية للسرعة
 *        التقدم (Progress) يُحفظ في Supabase فوراً ويُجلب عند كل فتح
 *
 * هذه الخدمة مسؤولة عن:
 * 1. مزامنة التقدم مع Supabase فورياً
 * 2. جلب التقدم من السحاب عند فتح أي صفحة
 * 3. إدارة حالة القفل/الفتح من قاعدة البيانات
 * 4. تشغيل المزامنة في الخلفية
 */

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@/lib/platformStorage';

// ===== أنواع البيانات =====
export interface ProgressData {
  lessonId: string;
  courseId: string;
  completed: boolean;
  xpEarned: number;
  score?: number;
  completedAt: string;
}

export interface CourseProgressSummary {
  courseId: string;
  completedLessons: string[];
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  lastCompletedLessonId?: string;
  lastCompletedOrder: number;
}

export interface UnlockStatus {
  courseId: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  unlockedSections: string[];
}

// ===== مفاتيح التخزين المؤقت =====
const CACHE_KEYS = {
  PROGRESS_PREFIX: '@kodax_progress_',
  UNLOCKED_PREFIX: '@kodax_unlocked_',
  LAST_SYNC: '@kodax_last_sync',
  USER_XP: '@kodax_user_xp',
  USER_LEVEL: '@kodax_user_level',
  USER_STREAK: '@kodax_user_streak',
};

// ===== خدمة المزامنة الهجينة =====
class HybridSyncService {
  private userId: string | null = null;
  private previousUserId: string | null = null;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private progressCache: Map<string, CourseProgressSummary> = new Map();
  private unlockCache: Map<string, UnlockStatus> = new Map();

  // ===== تهيئة المستخدم =====
  async setUser(userId: string) {
    // إذا تغير المستخدم، مسح الكاش القديم
    if (this.previousUserId && this.previousUserId !== userId) {
      console.log('🔄 User changed, clearing old cache...');
      await this.clearUserCache(this.previousUserId);
    }

    this.previousUserId = this.userId;
    this.userId = userId;
    this.progressCache.clear();
    this.unlockCache.clear();
  }

  async clearUser() {
    this.previousUserId = this.userId;
    this.userId = null;
    this.progressCache.clear();
    this.unlockCache.clear();
  }

  // ===== مسح كاش مستخدم معين =====
  private async clearUserCache(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(
        (k: string) => k.includes(`_${userId}_`) || k.endsWith(`_${userId}`)
      );
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log(
          `🗑️ Cleared ${userKeys.length} cache keys for user ${userId}`
        );
      }
    } catch (error) {
      console.error('Error clearing user cache:', error);
    }
  }

  // ===== التحقق من الاتصال =====
  private async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      this.isOnline = !error;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  // ================================================================
  // ==================== إدارة التقدم ============================
  // ================================================================

  /**
   * حفظ إكمال درس - يُرسل إلى Supabase فوراً
   * لا يُحدث الواجهة إلا بعد نجاح الحفظ في السحاب
   */
  async saveLessonComplete(
    lessonId: string,
    courseId: string,
    xpEarned: number,
    score?: number
  ): Promise<{ success: boolean; error?: string; alreadyCompleted?: boolean }> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }

    // التحقق من صحة البيانات
    if (!lessonId || !courseId) {
      console.error('Invalid data: missing lessonId or courseId', {
        lessonId,
        courseId,
      });
      return { success: false, error: 'بيانات غير صحيحة' };
    }

    // التحقق من إكمال الدرس من قبل
    const existingProgress = await this.checkLessonCompleted(lessonId);
    if (existingProgress) {
      return { success: true, alreadyCompleted: true };
    }

    const completedAt = new Date().toISOString();

    const payload = {
      user_id: this.userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      xp_earned: xpEarned,
      score,
      completed_at: completedAt,
      updated_at: completedAt,
    };

    console.log('[HybridSync] Saving lesson progress:', payload);

    // 1. إرسال إلى Supabase أولاً
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' });

    if (error) {
      console.error('[HybridSync] Supabase save error:', error);
      // حفظ محلي للمحاولة لاحقاً
      await this.queueForSync({
        lessonId,
        courseId,
        completed: true,
        xpEarned,
        score,
        completedAt,
      });
      return { success: false, error: error.message };
    }

    console.log('[HybridSync] Lesson saved successfully');

    // 2. تحديث XP المستخدم
    await this.updateUserXP(xpEarned);

    // 3. تحديث الكاش المحلي بعد نجاح الحفظ
    await this.updateLocalCache(courseId, lessonId);

    // 4. تحديث الكاش في الذاكرة
    const cached = this.progressCache.get(courseId);
    if (cached && !cached.completedLessons.includes(lessonId)) {
      cached.completedLessons.push(lessonId);
      cached.completedCount = cached.completedLessons.length;
      cached.progressPercent = Math.round(
        (cached.completedCount / cached.totalLessons) * 100
      );
      cached.lastCompletedLessonId = lessonId;
    }

    return { success: true };
  }

  /**
   * جلب تقدم كورس معين من Supabase
   * يُستدعى عند فتح صفحة الكورس
   */
  async fetchCourseProgress(
    courseId: string,
    totalLessons: number
  ): Promise<CourseProgressSummary> {
    if (!this.userId) {
      return this.getEmptyProgress(courseId, totalLessons);
    }

    await this.checkConnection();

    if (this.isOnline) {
      try {
        // جلب الدروس المكتملة لهذا الكورس
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed_at')
          .eq('user_id', this.userId)
          .eq('course_id', courseId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error('Error fetching progress:', error);
          return this.getCachedProgress(courseId, totalLessons);
        }

        const completedLessons = data?.map((d) => d.lesson_id) || [];
        const completedCount = completedLessons.length;
        const lastLesson = data?.[0];

        // استخراج رقم الترتيب من آخر درس
        let lastOrder = 0;
        if (lastLesson?.lesson_id) {
          const match = lastLesson.lesson_id.match(/-(\d+)$/);
          lastOrder = match ? parseInt(match[1]) : 0;
        }

        const progress: CourseProgressSummary = {
          courseId,
          completedLessons,
          completedCount,
          totalLessons,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0,
          lastCompletedLessonId: lastLesson?.lesson_id,
          lastCompletedOrder: lastOrder,
        };

        // تخزين في الكاش
        this.progressCache.set(courseId, progress);
        await this.saveProgressToCache(courseId, progress);

        return progress;
      } catch (err) {
        console.error('Fetch error:', err);
        return this.getCachedProgress(courseId, totalLessons);
      }
    }

    return this.getCachedProgress(courseId, totalLessons);
  }

  /**
   * جلب كل الدروس المكتملة للمستخدم
   */
  async fetchAllCompletedLessons(): Promise<string[]> {
    if (!this.userId) return [];

    await this.checkConnection();

    if (this.isOnline) {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', this.userId)
        .eq('completed', true);

      if (!error && data) {
        return data.map((d) => d.lesson_id);
      }
    }

    // جلب من الكاش المحلي - مع userId في المفتاح
    const cacheKey = `${CACHE_KEYS.PROGRESS_PREFIX}${this.userId}_all_lessons`;
    const cached = await AsyncStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  }

  /**
   * جلب الدروس المكتملة فقط (بدون التحديات)
   */
  async fetchCompletedLessonsOnly(): Promise<string[]> {
    if (!this.userId) return [];

    await this.checkConnection();

    if (this.isOnline) {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', this.userId)
        .eq('completed', true)
        .neq('course_id', 'challenges');

      if (!error && data) {
        return data.map((d) => d.lesson_id);
      }
    }

    // fallback: فلتر محلي
    const all = await this.fetchAllCompletedLessons();
    return all.filter((id) => !id.startsWith('challenge'));
  }

  /**
   * جلب التحديات المكتملة فقط
   */
  async fetchCompletedChallengesOnly(): Promise<string[]> {
    if (!this.userId) return [];

    await this.checkConnection();

    if (this.isOnline) {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', this.userId)
        .eq('completed', true)
        .eq('course_id', 'challenges');

      if (!error && data) {
        return data.map((d) => d.lesson_id);
      }
    }

    // fallback: فلتر محلي
    const all = await this.fetchAllCompletedLessons();
    return all.filter((id) => id.startsWith('challenge'));
  }

  /**
   * التحقق من إكمال درس معين
   */
  async isLessonCompleted(lessonId: string): Promise<boolean> {
    if (!this.userId) return false;

    // التحقق من الكاش أولاً
    for (const progress of this.progressCache.values()) {
      if (progress.completedLessons.includes(lessonId)) {
        return true;
      }
    }

    // جلب من Supabase
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('completed')
      .eq('user_id', this.userId)
      .eq('lesson_id', lessonId)
      .single();

    return !error && data?.completed === true;
  }

  // ================================================================
  // ==================== إدارة القفل/الفتح ========================
  // ================================================================

  /**
   * التحقق من فتح كورس - يجلب من Supabase
   */
  async isCourseUnlocked(
    courseId: string,
    pointsCost: number
  ): Promise<boolean> {
    // الكورسات المجانية مفتوحة دائماً
    if (pointsCost === 0) return true;

    if (!this.userId) return false;

    // التحقق من الكاش
    const cached = this.unlockCache.get(courseId);
    if (cached !== undefined) {
      return cached.isUnlocked;
    }

    await this.checkConnection();

    if (this.isOnline) {
      const { data, error } = await supabase
        .from('user_unlocked_courses')
        .select('id, unlocked_at')
        .eq('user_id', this.userId)
        .eq('course_id', courseId)
        .single();

      const isUnlocked = !error && !!data;

      // تخزين في الكاش
      this.unlockCache.set(courseId, {
        courseId,
        isUnlocked,
        unlockedAt: data?.unlocked_at,
        unlockedSections: [],
      });

      return isUnlocked;
    }

    // جلب من الكاش المحلي
    const localCache = await AsyncStorage.getItem(
      `${CACHE_KEYS.UNLOCKED_PREFIX}${courseId}`
    );
    return localCache ? JSON.parse(localCache).isUnlocked : false;
  }

  /**
   * فتح كورس - يُرسل إلى Supabase فوراً
   */
  async unlockCourse(
    courseId: string,
    pointsCost: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }

    // التحقق من النقاط
    const hasPoints = await this.hasEnoughPoints(pointsCost);
    if (!hasPoints) {
      return { success: false, error: 'نقاط غير كافية' };
    }

    // خصم النقاط
    const deducted = await this.deductPoints(
      pointsCost,
      `فتح كورس: ${courseId}`
    );
    if (!deducted.success) {
      return { success: false, error: 'فشل في خصم النقاط' };
    }

    // إضافة إلى الكورسات المفتوحة
    const { error } = await supabase.from('user_unlocked_courses').insert({
      user_id: this.userId,
      course_id: courseId,
      unlocked_at: new Date().toISOString(),
    });

    if (error) {
      // إرجاع النقاط
      await this.addPoints(pointsCost, 'إرجاع - فشل فتح الكورس');
      return { success: false, error: error.message };
    }

    // تحديث الكاش
    this.unlockCache.set(courseId, {
      courseId,
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
      unlockedSections: [],
    });

    return { success: true };
  }

  /**
   * التحقق من فتح قسم معين
   */
  async isSectionUnlocked(
    courseId: string,
    sectionId: string
  ): Promise<boolean> {
    if (!this.userId) return false;

    const { data, error } = await supabase
      .from('user_unlocked_sections')
      .select('id')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .eq('section_id', sectionId)
      .single();

    return !error && !!data;
  }

  /**
   * جلب كل الأقسام المفتوحة لكورس
   */
  async getUnlockedSections(courseId: string): Promise<string[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('user_unlocked_sections')
      .select('section_id')
      .eq('user_id', this.userId)
      .eq('course_id', courseId);

    return !error && data ? data.map((d) => d.section_id) : [];
  }

  // ================================================================
  // ==================== إدارة XP والنقاط ========================
  // ================================================================

  /**
   * تحديث XP المستخدم
   */
  private async updateUserXP(xpAmount: number): Promise<void> {
    if (!this.userId) return;

    const { error } = await supabase.rpc('update_user_xp', {
      user_id: this.userId,
      xp_amount: xpAmount,
    });

    if (error) {
      console.error('Error updating XP:', error);
    }
  }

  /**
   * جلب XP الحالي للمستخدم
   */
  async getUserXP(): Promise<{
    xp: number;
    level: number;
    streak: number;
    completedLessons: number;
    completedChallenges: number;
    lastActiveDate: string | null;
  }> {
    if (!this.userId) {
      return {
        xp: 0,
        level: 1,
        streak: 0,
        completedLessons: 0,
        completedChallenges: 0,
        lastActiveDate: null,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('xp, level, streak_days')
      .eq('id', this.userId)
      .single();

    // جلب last_active_date من user_stats
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('last_active_date')
      .eq('user_id', this.userId)
      .single();

    // جلب عدد الدروس المكتملة
    const { count: lessonCount } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('completed', true);

    // جلب عدد التحديات المكتملة
    const { count: challengeCount } = await supabase
      .from('challenge_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('passed', true);

    if (error || !data) {
      return {
        xp: 0,
        level: 1,
        streak: 0,
        completedLessons: 0,
        completedChallenges: 0,
        lastActiveDate: null,
      };
    }

    return {
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak_days || 0,
      completedLessons: lessonCount || 0,
      completedChallenges: challengeCount || 0,
      lastActiveDate: statsData?.last_active_date || null,
    };
  }

  /**
   * التحقق من النقاط الكافية
   */
  private async hasEnoughPoints(amount: number): Promise<boolean> {
    if (!this.userId) return false;

    const { data, error } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', this.userId)
      .single();

    return !error && data && data.total_points >= amount;
  }

  /**
   * خصم نقاط
   */
  async deductPoints(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }

    // جلب النقاط الحالية
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('total_points, spent_points')
      .eq('user_id', this.userId)
      .single();

    if (fetchError || !currentPoints) {
      return { success: false, error: 'فشل في جلب النقاط' };
    }

    if (currentPoints.total_points < amount) {
      return { success: false, error: 'نقاط غير كافية' };
    }

    // تحديث النقاط
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: currentPoints.total_points - amount,
        spent_points: (currentPoints.spent_points || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // تسجيل المعاملة
    await supabase.from('point_transactions').insert({
      user_id: this.userId,
      type: 'spent',
      amount,
      reason,
    });

    return { success: true };
  }

  /**
   * إضافة نقاط
   */
  async addPoints(amount: number, reason: string): Promise<boolean> {
    if (!this.userId) return false;

    // جلب النقاط الحالية
    const { data: currentPoints } = await supabase
      .from('user_points')
      .select('total_points, earned_points')
      .eq('user_id', this.userId)
      .single();

    if (!currentPoints) {
      // إنشاء سجل جديد
      await supabase.from('user_points').insert({
        user_id: this.userId,
        total_points: amount,
        earned_points: amount,
        spent_points: 0,
        purchased_points: 0,
      });
    } else {
      // تحديث السجل الموجود
      await supabase
        .from('user_points')
        .update({
          total_points: currentPoints.total_points + amount,
          earned_points: (currentPoints.earned_points || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId);
    }

    // تسجيل المعاملة
    await supabase.from('point_transactions').insert({
      user_id: this.userId,
      type: 'earned',
      amount,
      reason,
    });

    return true;
  }

  // ================================================================
  // ==================== إدارة النقاط الكاملة =====================
  // ================================================================

  /**
   * جلب بيانات النقاط الكاملة من Supabase
   */
  async getFullPointsData(): Promise<{
    totalPoints: number;
    earnedPoints: number;
    purchasedPoints: number;
    spentPoints: number;
    storeCredits: number;
  }> {
    if (!this.userId) {
      return {
        totalPoints: 0,
        earnedPoints: 0,
        purchasedPoints: 0,
        spentPoints: 0,
        storeCredits: 0,
      };
    }

    const { data, error } = await supabase
      .from('user_points')
      .select('total_points, earned_points, purchased_points, spent_points')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      // إنشاء سجل جديد إذا لم يكن موجوداً
      if (error?.code === 'PGRST116') {
        await supabase.from('user_points').insert({
          user_id: this.userId,
          total_points: 0,
          earned_points: 0,
          purchased_points: 0,
          spent_points: 0,
        });
      }
      return {
        totalPoints: 0,
        earnedPoints: 0,
        purchasedPoints: 0,
        spentPoints: 0,
        storeCredits: 0,
      };
    }

    return {
      totalPoints: data.total_points || 0,
      earnedPoints: data.earned_points || 0,
      purchasedPoints: data.purchased_points || 0,
      spentPoints: data.spent_points || 0,
      storeCredits: data.total_points || 0, // Store credits = total available points
    };
  }

  /**
   * جلب جميع الكورسات المفتوحة من Supabase
   */
  async getAllUnlockedCourses(): Promise<string[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('user_unlocked_courses')
      .select('course_id')
      .eq('user_id', this.userId);

    if (error || !data) return [];
    return data.map((d) => d.course_id);
  }

  /**
   * جلب جميع الأقسام المفتوحة من Supabase
   */
  async getAllUnlockedSections(): Promise<string[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('user_unlocked_sections')
      .select('section_id')
      .eq('user_id', this.userId);

    if (error || !data) return [];
    return data.map((d) => d.section_id);
  }

  // ================================================================
  // ==================== إدارة الاشتراك المميز ====================
  // ================================================================

  /**
   * جلب حالة الاشتراك المميز من Supabase
   */
  async getPremiumStatus(): Promise<{
    isPremium: boolean;
    expiresAt: string | null;
    daysRemaining: number;
  }> {
    if (!this.userId) {
      return { isPremium: false, expiresAt: null, daysRemaining: 0 };
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('expires_at, is_active')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { isPremium: false, expiresAt: null, daysRemaining: 0 };
    }

    const expiresAt = data.expires_at;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const isPremium = expiry > now;
    const daysRemaining = isPremium
      ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      isPremium,
      expiresAt: isPremium ? expiresAt : null,
      daysRemaining,
    };
  }

  /**
   * شراء اشتراك مميز بالنقاط
   */
  async purchasePremium(
    cost: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }

    // خصم النقاط
    const deducted = await this.deductPoints(cost, 'شراء اشتراك مميز');
    if (!deducted.success) {
      return { success: false, error: deducted.error };
    }

    // إضافة الاشتراك
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 يوم

    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: this.userId,
      type: 'premium',
      is_active: true,
      plan_id: 'ab51ad31-2d54-4b55-a975-483ccc31913f2', // معرف الخطة المميزة
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      // إرجاع النقاط
      await this.addPoints(cost, 'إرجاع - فشل شراء الاشتراك');
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * شراء نقاط (تحديث الرصيد بعد الدفع)
   */
  async purchasePoints(
    amount: number,
    packageId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }

    // جلب النقاط الحالية
    const { data: currentPoints } = await supabase
      .from('user_points')
      .select('total_points, purchased_points')
      .eq('user_id', this.userId)
      .single();

    if (!currentPoints) {
      // إنشاء سجل جديد
      const { error } = await supabase.from('user_points').insert({
        user_id: this.userId,
        total_points: amount,
        earned_points: 0,
        purchased_points: amount,
        spent_points: 0,
      });
      if (error) return { success: false, error: error.message };
    } else {
      // تحديث السجل الموجود
      const { error } = await supabase
        .from('user_points')
        .update({
          total_points: currentPoints.total_points + amount,
          purchased_points: (currentPoints.purchased_points || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId);
      if (error) return { success: false, error: error.message };
    }

    // تسجيل عملية الشراء
    await supabase.from('point_transactions').insert({
      user_id: this.userId,
      type: 'purchased',
      amount,
      reason: `شراء باقة: ${packageId}`,
    });

    return { success: true };
  }

  // ================================================================
  // ==================== المزامنة في الخلفية ======================
  // ================================================================

  /**
   * مزامنة كاملة في الخلفية
   * تُستدعى عند التنقل بين الصفحات
   */
  async backgroundSync(): Promise<void> {
    if (this.syncInProgress || !this.userId) return;

    this.syncInProgress = true;

    try {
      // 1. مزامنة البيانات المعلقة
      await this.syncPendingData();

      // 2. تحديث streak على السيرفر
      await this.syncStreak();

      // 3. تحديث معلومات المستخدم
      const userInfo = await this.getUserXP();
      await AsyncStorage.setItem(CACHE_KEYS.USER_XP, userInfo.xp.toString());
      await AsyncStorage.setItem(
        CACHE_KEYS.USER_LEVEL,
        userInfo.level.toString()
      );
      await AsyncStorage.setItem(
        CACHE_KEYS.USER_STREAK,
        userInfo.streak.toString()
      );

      // 4. تحديث وقت آخر مزامنة
      await AsyncStorage.setItem(
        CACHE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Background sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * مزامنة الـ streak مع السيرفر
   */
  private async syncStreak(): Promise<void> {
    if (!this.userId) return;

    try {
      // استدعاء دالة update_user_streak على السيرفر
      await supabase.rpc('update_user_streak', { p_user_id: this.userId });
    } catch (error) {
      // لا نوقف المزامنة إذا فشل تحديث الـ streak
      console.warn('Streak sync failed:', error);
    }
  }

  /**
   * التحقق من إكمال الدرس من قبل
   */
  async checkLessonCompleted(lessonId: string): Promise<boolean> {
    if (!this.userId || !lessonId) return false;

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', this.userId)
        .eq('lesson_id', lessonId)
        .eq('completed', true)
        .limit(1);

      if (error) {
        console.error('Error checking lesson completion:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Exception checking lesson completion:', error);
      return false;
    }
  }

  /**
   * مزامنة البيانات المعلقة (للعمل offline)
   */
  private async syncPendingData(): Promise<void> {
    const pending = await AsyncStorage.getItem('@kodax_pending_sync');
    if (!pending) return;

    const items: ProgressData[] = JSON.parse(pending);
    const failed: ProgressData[] = [];

    for (const item of items) {
      // التحقق من صحة البيانات قبل المزامنة
      if (!item.lessonId || !item.courseId) {
        console.warn('Skipping invalid pending item:', item);
        continue;
      }

      const result = await this.saveLessonComplete(
        item.lessonId,
        item.courseId,
        item.xpEarned,
        item.score
      );
      if (!result.success && !result.alreadyCompleted) {
        failed.push(item);
      }
    }

    // حفظ العناصر التي فشلت
    if (failed.length > 0) {
      await AsyncStorage.setItem('@kodax_pending_sync', JSON.stringify(failed));
    } else {
      await AsyncStorage.removeItem('@kodax_pending_sync');
    }
  }

  /**
   * إضافة إلى قائمة المزامنة المعلقة
   */
  private async queueForSync(data: ProgressData): Promise<void> {
    const pending = await AsyncStorage.getItem('@kodax_pending_sync');
    const items: any[] = pending ? JSON.parse(pending) : [];
    items.push(data);
    await AsyncStorage.setItem('@kodax_pending_sync', JSON.stringify(items));
  }

  // ================================================================
  // ==================== الكاش المحلي =============================
  // ================================================================

  private getEmptyProgress(
    courseId: string,
    totalLessons: number
  ): CourseProgressSummary {
    return {
      courseId,
      completedLessons: [],
      completedCount: 0,
      totalLessons,
      progressPercent: 0,
      lastCompletedOrder: 0,
    };
  }

  private async getCachedProgress(
    courseId: string,
    totalLessons: number
  ): Promise<CourseProgressSummary> {
    if (!this.userId) return this.getEmptyProgress(courseId, totalLessons);

    // مفتاح الكاش يتضمن userId لفصل البيانات بين المستخدمين
    const cacheKey = `${CACHE_KEYS.PROGRESS_PREFIX}${this.userId}_${courseId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return this.getEmptyProgress(courseId, totalLessons);
  }

  private async saveProgressToCache(
    courseId: string,
    progress: CourseProgressSummary
  ): Promise<void> {
    if (!this.userId) return;

    const cacheKey = `${CACHE_KEYS.PROGRESS_PREFIX}${this.userId}_${courseId}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(progress));
  }

  private async updateLocalCache(
    courseId: string,
    lessonId: string
  ): Promise<void> {
    if (!this.userId) return;

    const cached = await this.getCachedProgress(courseId, 0);
    if (!cached.completedLessons.includes(lessonId)) {
      cached.completedLessons.push(lessonId);
      cached.completedCount = cached.completedLessons.length;
      await this.saveProgressToCache(courseId, cached);
    }
  }

  /**
   * مسح الكاش (للتنقية)
   */
  async clearCache(): Promise<void> {
    this.progressCache.clear();
    this.unlockCache.clear();

    // مسح كاش المستخدم الحالي فقط
    if (this.userId) {
      await this.clearUserCache(this.userId);
    }
  }

  /**
   * مسح كل الكاش (للتنقية الكاملة)
   */
  async clearAllCache(): Promise<void> {
    this.progressCache.clear();
    this.unlockCache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const kodaxKeys = keys.filter((k: string) => k.startsWith('@kodax_'));
    await AsyncStorage.multiRemove(kodaxKeys);
  }
}

// تصدير instance واحد
export const hybridSyncService = new HybridSyncService();
export default hybridSyncService;
