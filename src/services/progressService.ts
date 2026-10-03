/**
 * خدمة تتبع التقدم - Kodax Progress Tracking Service
 * إدارة حالة إكمال الدروس والتحديات والتقدم العام
 * مع مزامنة التقدم اليومي إلى Supabase
 */

import { calculateLevel as calculateLevelShared } from '@/lib/utils';
import AsyncStorage from '@/lib/platformStorage';
import { badgeService } from '@/services/badgeService';
import { supabase } from '@/lib/supabase';

// ===== أنواع البيانات =====
export interface UserProgress {
  completedLessons: string[];
  completedChallenges: string[];
  completedCourses: string[];
  totalXP: number;
  currentStreak: number;
  lastActiveDate: string;
  dailyProgress: DailyProgressData;
  lessonsProgress: { [lessonId: string]: LessonProgress };
  challengesProgress: { [challengeId: string]: ChallengeProgress };
}

export interface DailyProgressData {
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  challengesCompleted: number;
  xpEarned: number;
  goalLessons: number;
  goalChallenges: number;
  goalXP: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  quizScore?: number;
  xpEarned: number;
  timeSpent: number; // بالثواني
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  completedAt?: string;
  attempts: number;
  bestScore: number;
  hintsUsed: number;
  code: string;
}

// ===== مفاتيح التخزين =====
const STORAGE_KEYS = {
  USER_PROGRESS: '@kodax_user_progress',
  COMPLETED_LESSONS: '@kodax_completed_lessons',
  COMPLETED_CHALLENGES: '@kodax_completed_challenges',
  USER_XP: '@kodax_user_xp',
  USER_STREAK: '@kodax_user_streak',
};

const DEFAULT_DAILY_PROGRESS: DailyProgressData = {
  date: '',
  lessonsCompleted: 0,
  challengesCompleted: 0,
  xpEarned: 0,
  goalLessons: 2,
  goalChallenges: 1,
  goalXP: 200,
};

/**
 * حساب الأهداف اليومية التدريجية بناءً على مستوى المستخدم
 * كلما ارتفع المستوى، تزداد الأهداف تدريجياً
 */
function getGoalsForLevel(level: number): {
  goalLessons: number;
  goalChallenges: number;
  goalXP: number;
} {
  if (level <= 3) {
    return { goalLessons: 2, goalChallenges: 1, goalXP: 200 };
  } else if (level <= 6) {
    return { goalLessons: 3, goalChallenges: 1, goalXP: 300 };
  } else if (level <= 10) {
    return { goalLessons: 4, goalChallenges: 2, goalXP: 400 };
  } else if (level <= 15) {
    return { goalLessons: 5, goalChallenges: 2, goalXP: 500 };
  } else {
    return { goalLessons: 6, goalChallenges: 3, goalXP: 600 };
  }
}

// ===== الحالة الافتراضية =====
const DEFAULT_PROGRESS: UserProgress = {
  completedLessons: [],
  completedChallenges: [],
  completedCourses: [],
  totalXP: 0,
  currentStreak: 0,
  lastActiveDate: '', // فارغ = حساب جديد (لا يعتبر انقطاع)
  dailyProgress: { ...DEFAULT_DAILY_PROGRESS },
  lessonsProgress: {},
  challengesProgress: {},
};

// ===== خدمة التقدم =====
class ProgressService {
  private progress: UserProgress = DEFAULT_PROGRESS;
  private initialized: boolean = false;
  private currentUserId: string | null = null;

  // ===== تعيين معرف المستخدم =====
  async setUserId(userId: string | null): Promise<void> {
    if (this.currentUserId !== userId) {
      // مسح بيانات المستخدم القديم من AsyncStorage — دائماً عند تغيير المستخدم
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.USER_PROGRESS,
          STORAGE_KEYS.COMPLETED_LESSONS,
          STORAGE_KEYS.COMPLETED_CHALLENGES,
          STORAGE_KEYS.USER_XP,
          STORAGE_KEYS.USER_STREAK,
        ]);
      } catch (e) {}

      this.currentUserId = userId;
      this.initialized = false;
      this.progress = { ...DEFAULT_PROGRESS };
    }
  }

  // تهيئة الخدمة وتحميل البيانات
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (stored) {
        this.progress = { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
        // Ensure dailyProgress exists for old data
        if (!this.progress.dailyProgress) {
          this.progress.dailyProgress = { ...DEFAULT_DAILY_PROGRESS };
        }
      }
      this.initialized = true;

      // تحديث السلسلة اليومية
      await this.updateStreak();
      // التحقق من إعادة تعيين التقدم اليومي
      await this.checkDailyReset();
    } catch (error) {
      this.progress = DEFAULT_PROGRESS;
    }
  }

  // حفظ البيانات
  private async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(this.progress)
      );
    } catch (error) {
      // Error saving progress
    }
  }

  // ===== دروس =====

  // التحقق من إكمال درس
  isLessonCompleted(lessonId: string): boolean {
    return this.progress.completedLessons.includes(lessonId);
  }

  // إكمال درس
  async completeLesson(
    lessonId: string,
    xpEarned: number,
    quizScore?: number
  ): Promise<{ success: boolean; newXP: number; levelUp?: boolean }> {
    await this.initialize();

    // تجنب الإكمال المزدوج
    if (this.isLessonCompleted(lessonId)) {
      return { success: false, newXP: this.progress.totalXP };
    }

    // تسجيل الإكمال
    this.progress.completedLessons.push(lessonId);
    this.progress.lessonsProgress[lessonId] = {
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
      quizScore,
      xpEarned,
      timeSpent: 0,
    };

    // إضافة XP
    const oldLevel = this.calculateLevel(this.progress.totalXP);
    this.progress.totalXP += xpEarned;
    const newLevel = this.calculateLevel(this.progress.totalXP);

    await this.saveProgress();

    // تسجيل التقدم اليومي
    await this.recordDailyLesson(xpEarned);

    return {
      success: true,
      newXP: this.progress.totalXP,
      levelUp: newLevel > oldLevel,
    };
  }

  // الحصول على تقدم الدرس
  getLessonProgress(lessonId: string): LessonProgress | null {
    return this.progress.lessonsProgress[lessonId] || null;
  }

  // ===== تحديات =====

  // التحقق من إكمال تحدي
  isChallengeCompleted(challengeId: string): boolean {
    return this.progress.completedChallenges.includes(challengeId);
  }

  // إكمال تحدي
  async completeChallenge(
    challengeId: string,
    points: number,
    code: string,
    hintsUsed: number = 0
  ): Promise<{ success: boolean; newXP: number; levelUp?: boolean }> {
    await this.initialize();

    const wasCompleted = this.isChallengeCompleted(challengeId);
    const existing = this.progress.challengesProgress[challengeId];

    // حساب النقاط (خصم 10% لكل تلميح مستخدم)
    const hintPenalty = Math.min(hintsUsed * 0.1, 0.5);
    const actualPoints = Math.floor(points * (1 - hintPenalty));

    // تحديث التقدم
    this.progress.challengesProgress[challengeId] = {
      challengeId,
      completed: true,
      completedAt: new Date().toISOString(),
      attempts: (existing?.attempts || 0) + 1,
      bestScore: Math.max(existing?.bestScore || 0, actualPoints),
      hintsUsed,
      code,
    };

    // إضافة للقائمة إذا لم يكمل سابقاً
    if (!wasCompleted) {
      this.progress.completedChallenges.push(challengeId);

      const oldLevel = this.calculateLevel(this.progress.totalXP);
      this.progress.totalXP += actualPoints;
      const newLevel = this.calculateLevel(this.progress.totalXP);

      await this.saveProgress();

      // تسجيل التقدم اليومي
      await this.recordDailyChallenge(actualPoints);

      return {
        success: true,
        newXP: this.progress.totalXP,
        levelUp: newLevel > oldLevel,
      };
    }

    await this.saveProgress();
    return { success: true, newXP: this.progress.totalXP };
  }

  // تحديث محاولة تحدي (بدون إكمال)
  async updateChallengeAttempt(
    challengeId: string,
    code: string
  ): Promise<void> {
    await this.initialize();

    const existing = this.progress.challengesProgress[challengeId];
    this.progress.challengesProgress[challengeId] = {
      ...existing,
      challengeId,
      completed: existing?.completed || false,
      attempts: (existing?.attempts || 0) + 1,
      bestScore: existing?.bestScore || 0,
      hintsUsed: existing?.hintsUsed || 0,
      code,
    };

    await this.saveProgress();
  }

  // الحصول على تقدم التحدي
  getChallengeProgress(challengeId: string): ChallengeProgress | null {
    return this.progress.challengesProgress[challengeId] || null;
  }

  // ===== دورات =====

  // التحقق من إكمال دورة
  isCourseCompleted(courseId: string): boolean {
    return this.progress.completedCourses.includes(courseId);
  }

  // حساب تقدم الدورة
  getCourseProgress(courseId: string, totalLessons: number): number {
    const completed = this.progress.completedLessons.filter((id) =>
      id.startsWith(courseId.replace(/[^a-z-]/g, ''))
    ).length;
    return Math.round((completed / totalLessons) * 100);
  }

  // إكمال دورة
  async completeCourse(courseId: string): Promise<void> {
    await this.initialize();

    if (!this.progress.completedCourses.includes(courseId)) {
      this.progress.completedCourses.push(courseId);
      await this.saveProgress();
    }
  }

  // ===== قفل/فتح =====

  // التحقق من فتح الدرس
  isLessonUnlocked(
    lessonId: string,
    lessonOrder: number,
    courseId: string
  ): boolean {
    if (lessonOrder === 1) return true; // الدرس الأول دائماً مفتوح

    // البحث عن الدرس السابق
    const previousLessonNum = lessonOrder - 1;
    const previousLessonId = `${courseId.split('-').slice(0, 2).join('-')}-${previousLessonNum}`;

    return this.isLessonCompleted(previousLessonId);
  }

  // التحقق من فتح الدورة
  isCourseUnlocked(courseId: string, requiredCourseId?: string): boolean {
    if (!requiredCourseId) return true;
    return this.isCourseCompleted(requiredCourseId);
  }

  // التحقق من فتح التحدي
  isChallengeUnlocked(challengeIndex: number): boolean {
    // التحديات الثلاثة الأولى مفتوحة، الباقي يتطلب إكمال السابق
    if (challengeIndex < 3) return true;

    const completedCount = this.progress.completedChallenges.length;
    return completedCount >= challengeIndex;
  }

  // ===== إحصائيات =====

  // الحصول على كل التقدم
  async getProgress(): Promise<UserProgress> {
    await this.initialize();
    return { ...this.progress };
  }

  // الحصول على XP
  getTotalXP(): number {
    return this.progress.totalXP;
  }

  // حساب المستوى
  calculateLevel(xp: number): number {
    // معادلة واحدة في كل Kodax (السيرفر kodax_level، التطبيق، والمساعد): max(1, floor(sqrt(xp/100)))
    return calculateLevelShared(xp);
  }

  // الحصول على السلسلة
  getStreak(): number {
    return this.progress.currentStreak;
  }

  // تحديث السلسلة اليومية
  // ✅ إعادة التعيين إلى 1 عند الغياب أكثر من يوم واحد
  private async updateStreak(): Promise<void> {
    // استخدام التاريخ المحلي بدلاً من UTC لتجنب مشاكل المنطقة الزمنية
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastActive = this.progress.lastActiveDate;

    if (lastActive === today) {
      return; // نفس اليوم — لا يزيد
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    if (lastActive === yesterdayStr) {
      // يوم واحد فقط — زيادة السلسلة
      this.progress.currentStreak += 1;
    } else if (!lastActive || lastActive === '') {
      // حساب جديد أو أول استخدام — بداية السلسلة
      this.progress.currentStreak = 1;
    } else {
      // ✅ غياب أكثر من يوم — إعادة التعيين إلى 1
      const hadRealActivity =
        this.progress.completedLessons.length > 0 ||
        this.progress.completedChallenges.length > 0 ||
        this.progress.totalXP > 0;

      if (hadRealActivity && this.progress.currentStreak > 0) {
        // عاد بعد انقطاع — تعيين comeback
        badgeService.setComeback(true).catch(() => {});
      }

      this.progress.currentStreak = 1;
    }

    this.progress.lastActiveDate = today;
    await this.saveProgress();
  }

  // الحصول على عدد الدروس المكتملة
  getCompletedLessonsCount(): number {
    return this.progress.completedLessons.length;
  }

  // الحصول على عدد التحديات المكتملة
  getCompletedChallengesCount(): number {
    return this.progress.completedChallenges.length;
  }

  // ===== التقدم اليومي =====

  // التحقق من إعادة تعيين التقدم اليومي (كل 24 ساعة / يوم جديد)
  private async checkDailyReset(): Promise<void> {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (this.progress.dailyProgress.date !== today) {
      // Daily progress reset - new day detected

      // حساب الأهداف التدريجية بناءً على المستوى الحالي
      const currentLevel = this.calculateLevel(this.progress.totalXP);
      const goals = getGoalsForLevel(currentLevel);

      this.progress.dailyProgress = {
        ...DEFAULT_DAILY_PROGRESS,
        date: today,
        ...goals,
      };
      await this.saveProgress();
    }
  }

  // تسجيل تقدم يومي عند إكمال درس (مع مزامنة Supabase)
  async recordDailyLesson(xpEarned: number): Promise<void> {
    await this.checkDailyReset();
    this.progress.dailyProgress.lessonsCompleted += 1;
    this.progress.dailyProgress.xpEarned += xpEarned;
    await this.saveProgress();

    // مزامنة مع Supabase (server-side validation)
    await this.syncDailyProgressToServer(1, 0, xpEarned);
  }

  // تسجيل تقدم يومي عند إكمال تحدي (مع مزامنة Supabase)
  async recordDailyChallenge(xpEarned: number): Promise<void> {
    await this.checkDailyReset();
    this.progress.dailyProgress.challengesCompleted += 1;
    this.progress.dailyProgress.xpEarned += xpEarned;
    await this.saveProgress();

    // مزامنة مع Supabase (server-side validation)
    await this.syncDailyProgressToServer(0, 1, xpEarned);
  }

  /**
   * مزامنة التقدم اليومي مع السيرفر عبر RPC
   * البيانات تُسجل server-side لمنع التلاعب
   */
  private async syncDailyProgressToServer(
    lessons: number,
    challenges: number,
    xp: number
  ): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const { data, error } = await supabase.rpc('record_daily_progress', {
        p_user_id: this.currentUserId,
        p_lessons: lessons,
        p_challenges: challenges,
        p_xp: xp,
      });

      if (error) {
        // Daily progress sync failed
      } else if (data) {
        // تحديث الأهداف المحلية من السيرفر (في حال تغير المستوى)
        const serverGoals = data as any;
        if (serverGoals.goal_lessons) {
          this.progress.dailyProgress.goalLessons = serverGoals.goal_lessons;
          this.progress.dailyProgress.goalChallenges =
            serverGoals.goal_challenges;
          this.progress.dailyProgress.goalXP = serverGoals.goal_xp;
          await this.saveProgress();
        }
      }
    } catch (e) {
      // لا نوقف التطبيق إذا فشلت المزامنة
    }
  }

  // الحصول على التقدم اليومي (محلي + سيرفر fallback)
  async getDailyProgress(): Promise<DailyProgressData> {
    await this.initialize();
    await this.checkDailyReset();

    // محاولة جلب الأهداف المحدثة من السيرفر
    if (this.currentUserId) {
      try {
        const { data, error } = await supabase.rpc('get_daily_progress', {
          p_user_id: this.currentUserId,
        });

        if (!error && data) {
          const serverData = data as any;
          // تحديث الأهداف التدريجية من السيرفر
          if (serverData.goal_lessons) {
            this.progress.dailyProgress.goalLessons = serverData.goal_lessons;
            this.progress.dailyProgress.goalChallenges =
              serverData.goal_challenges;
            this.progress.dailyProgress.goalXP = serverData.goal_xp;
          }
          // استخدام بيانات السيرفر كمصدر حقيقة إذا كانت أكبر (حماية من التلاعب)
          if (
            serverData.lessons_completed >
            this.progress.dailyProgress.lessonsCompleted
          ) {
            this.progress.dailyProgress.lessonsCompleted =
              serverData.lessons_completed;
          }
          if (
            serverData.challenges_completed >
            this.progress.dailyProgress.challengesCompleted
          ) {
            this.progress.dailyProgress.challengesCompleted =
              serverData.challenges_completed;
          }
          if (serverData.xp_earned > this.progress.dailyProgress.xpEarned) {
            this.progress.dailyProgress.xpEarned = serverData.xp_earned;
          }
          await this.saveProgress();
        }
      } catch (e) {
        // fallback إلى البيانات المحلية
      }
    }

    return { ...this.progress.dailyProgress };
  }

  // نسبة التقدم اليومي (0-100)
  getDailyProgressPercentage(): number {
    const dp = this.progress.dailyProgress;
    const lessonProgress = Math.min(dp.lessonsCompleted / dp.goalLessons, 1);
    const challengeProgress = Math.min(
      dp.challengesCompleted / dp.goalChallenges,
      1
    );
    const xpProgress = Math.min(dp.xpEarned / dp.goalXP, 1);
    // وزن متساوي للثلاثة
    return Math.round(
      ((lessonProgress + challengeProgress + xpProgress) / 3) * 100
    );
  }

  // ===== إعادة تعيين =====

  // إعادة تعيين كل التقدم
  async resetAllProgress(): Promise<void> {
    this.progress = { ...DEFAULT_PROGRESS };
    await this.saveProgress();
  }

  /**
   * إعادة تعيين الحالة في الذاكرة فقط (بدون AsyncStorage)
   * يُستخدم بعد clearAllKodaxData() لتنظيف الذاكرة
   */
  resetState(): void {
    this.progress = { ...DEFAULT_PROGRESS };
    this.initialized = false;
    this.currentUserId = null;
  }

  // إعادة تعيين تقدم دورة معينة
  async resetCourseProgress(courseId: string): Promise<void> {
    await this.initialize();

    // إزالة الدروس المكتملة لهذه الدورة
    this.progress.completedLessons = this.progress.completedLessons.filter(
      (id) => !id.includes(courseId)
    );

    // إزالة تفاصيل تقدم الدروس
    Object.keys(this.progress.lessonsProgress).forEach((key) => {
      if (key.includes(courseId)) {
        delete this.progress.lessonsProgress[key];
      }
    });

    // إزالة الدورة من المكتملة
    this.progress.completedCourses = this.progress.completedCourses.filter(
      (id) => id !== courseId
    );

    await this.saveProgress();
  }
}

// تصدير instance واحد
export const progressService = new ProgressService();

// تصدير الأنواع والدوال المساعدة
export default progressService;
