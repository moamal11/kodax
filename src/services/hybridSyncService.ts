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
import { calculateLevel } from '@/lib/utils';
import AsyncStorage from '@/lib/platformStorage';

// ===== أنواع البيانات =====
export interface ProgressData {
  lessonId: string;
  courseId: string;
  completed: boolean;
  xpEarned: number;
  score?: number;
  completedAt: string;
  /** فهرس الإجابة بالترتيب الأصلي للخيارات (السيرفر يتحقق منها) */
  quizAnswer?: number | null;
}

/** نتيجة إكمال درس من السيرفر (progress_complete_lesson) */
export interface LessonCompleteResult {
  success: boolean;
  error?: string;
  code?: string;
  alreadyCompleted?: boolean;
  xpAwarded?: number;
  queued?: boolean;
  server?: Record<string, any>;
}

/** الإكمال الموثّق فقط يُحتسب (الصفوف القديمة قبل عمود verified تُعامل كموثّقة) */
const isVerified = (row: { verified?: boolean | null }) => row.verified !== false;

const LESSON_ERRORS: Record<string, string> = {
  wrong_answer: 'الإجابة غير صحيحة. راجع الدرس وحاول مرة أخرى — بدون أي خصم.',
  quiz_required: 'أجب عن سؤال الاختبار أولاً.',
  previous_required: 'أكمل الدرس السابق أولاً.',
  course_locked: 'هذه الدورة تُفتح بعد التقدم في الدورة السابقة من نفس المسار.',
  unknown_lesson: 'هذا الدرس غير متاح حالياً.',
  too_fast: 'خذ وقتك في قراءة الدرس، ثم حاول مرة أخرى.',
  not_authenticated: 'سجّل الدخول لحفظ تقدمك.',
};

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
    score?: number,
    quizAnswer?: number | null
  ): Promise<LessonCompleteResult> {
    if (!this.userId) {
      return { success: false, error: 'المستخدم غير مسجل' };
    }
    if (!lessonId || !courseId) {
      return { success: false, error: 'بيانات غير صحيحة' };
    }
    // إكمال التحديات يُسجَّل على السيرفر فقط بعد تشغيل الاختبارات (verify-challenge)
    if (courseId === 'challenges') {
      return { success: false, error: 'challenge completion is recorded by the server' };
    }

    // الإكمال يُوثَّق على السيرفر: وجود الدرس، الوصول، الدرس السابق، إجابة الاختبار، والفاصل الزمني.
    // XP والسلسلة والأهداف ومكافأة الدورة تُمنح هناك فقط (مرة واحدة).
    const call = () =>
      supabase.rpc('progress_complete_lesson', {
        p_lesson_id: lessonId,
        p_quiz_answer: quizAnswer ?? null,
      });
    let { data, error } = await call();
    if (!error && data?.code === 'too_fast' && Number(data.retry_after) <= 20) {
      await new Promise((res) => setTimeout(res, (Number(data.retry_after) + 1) * 1000));
      ({ data, error } = await call());
    }

    if (error) {
      // انقطاع الاتصال: يُحفظ محلياً ويُرسل لاحقاً (بنفس الإجابة)
      console.warn('[HybridSync] complete lesson failed, queued:', error.message);
      await this.queueForSync({
        lessonId,
        courseId,
        completed: true,
        xpEarned,
        score,
        completedAt: new Date().toISOString(),
        quizAnswer: quizAnswer ?? null,
      });
      return { success: false, queued: true, error: 'تعذّر الاتصال. سنحفظ تقدمك تلقائياً عند عودة الإنترنت.' };
    }
    if (!data?.success) {
      const code: string = data?.code ?? 'unknown';
      return { success: false, code, error: LESSON_ERRORS[code] ?? 'تعذّر حفظ التقدم، حاول مرة أخرى.', server: data };
    }
    if (data.already_completed) {
      await this.markCompletedLocally(courseId, lessonId);
      return { success: true, alreadyCompleted: true, xpAwarded: 0, server: data };
    }

    await this.markCompletedLocally(courseId, lessonId);
    return { success: true, xpAwarded: Number(data.xp_awarded) || 0, server: data };
  }

  /** تحديث الكاش المحلي والذاكرة بعد توثيق السيرفر للإكمال */
  private async markCompletedLocally(courseId: string, lessonId: string): Promise<void> {
    await this.updateLocalCache(courseId, lessonId);
    const cached = this.progressCache.get(courseId);
    if (cached && !cached.completedLessons.includes(lessonId)) {
      cached.completedLessons.push(lessonId);
      cached.completedCount = cached.completedLessons.length;
      cached.progressPercent = Math.round((cached.completedCount / Math.max(1, cached.totalLessons)) * 100);
      cached.lastCompletedLessonId = lessonId;
    }
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
        const { data: rows, error } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', this.userId)
          .eq('course_id', courseId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error('Error fetching progress:', error);
          return this.getCachedProgress(courseId, totalLessons);
        }

        // الإكمال الموثّق على السيرفر فقط (ما تكتبه نسخة قديمة من التطبيق بعد التحديث لا يُحتسب)
        const data = (rows ?? []).filter(isVerified);
        const completedLessons = data.map((d) => d.lesson_id);
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
        .select('*')
        .eq('user_id', this.userId)
        .eq('completed', true);

      if (!error && data) {
        return data.filter(isVerified).map((d) => d.lesson_id);
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
        .select('*')
        .eq('user_id', this.userId)
        .eq('completed', true)
        .neq('course_id', 'challenges');

      if (!error && data) {
        return data.filter(isVerified).map((d) => d.lesson_id);
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
      .select('*')
      .eq('user_id', this.userId)
      .eq('lesson_id', lessonId)
      .single();

    return !error && data?.completed === true && isVerified(data);
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
      // الدورة متاحة بالتقدم في المسار أو بالفتح المبكر — السيرفر يحسب ذلك (coins_get_state.unlocked_courses)
      const { data, error } = await supabase.rpc('coins_get_state');
      const isUnlocked =
        !error && Array.isArray(data?.unlocked_courses) && data.unlocked_courses.includes(courseId);

      // تخزين في الكاش
      this.unlockCache.set(courseId, {
        courseId,
        isUnlocked,
        unlockedAt: undefined,
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
   * إبطال كاش الفتح بعد فتح دورة بالكوينات (الفتح نفسه يتم على السيرفر
   * عبر coinService.unlockCourse — هذه الخدمة لا تكتب أي رصيد).
   */
  invalidateUnlock(courseId: string): void {
    this.unlockCache.delete(courseId);
    AsyncStorage.removeItem(`${CACHE_KEYS.UNLOCKED_PREFIX}${courseId}`).catch(
      () => {}
    );
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
  // ==================== إدارة XP ================================
  // ================================================================

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

    // السلسلة الموحّدة على السيرفر: تسوية الأيام الفائتة (تجميد/انقطاع) قبل القراءة — لا تضيف نشاطاً
    await supabase.rpc('update_user_streak', { p_user_id: this.userId }).then(
      () => undefined,
      () => undefined
    );
    const { data, error } = await supabase
      .from('profiles')
      .select('xp, level, streak_days')
      .eq('id', this.userId)
      .single();

    // آخر يوم نشاط موثّق (بتوقيت بغداد) من السلسلة الموحّدة، ثم user_stats القديم احتياطاً
    const { data: streakRow } = await supabase
      .from('user_streaks')
      .select('last_active_day')
      .eq('user_id', this.userId)
      .maybeSingle();
    const { data: statsData } = streakRow
      ? { data: null }
      : await supabase.from('user_stats').select('last_active_date').eq('user_id', this.userId).single();

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
      level: calculateLevel(data.xp || 0),
      streak: data.streak_days || 0,
      completedLessons: lessonCount || 0,
      completedChallenges: challengeCount || 0,
      lastActiveDate: streakRow?.last_active_day || statsData?.last_active_date || null,
    };
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
        .select('*')
        .eq('user_id', this.userId)
        .eq('lesson_id', lessonId)
        .eq('completed', true)
        .limit(1);

      if (error) {
        console.error('Error checking lesson completion:', error);
        return false;
      }

      return !!data && data.filter(isVerified).length > 0;
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
      // عناصر تحديات قديمة في قائمة الانتظار: لم تعد تُكتب من العميل
      if (item.courseId === 'challenges') continue;

      const result = await this.saveLessonComplete(
        item.lessonId,
        item.courseId,
        item.xpEarned,
        item.score,
        item.quizAnswer ?? null
      );
      // يُعاد فقط ما فشل بسبب الاتصال؛ رفض السيرفر (إجابة/ترتيب) لا يُكرَّر بلا نهاية
      if (!result.success && result.queued) {
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
