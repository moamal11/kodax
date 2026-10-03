/**
 * Hook للمزامنة الهجينة الذكية - Kodax
 *
 * يجمع بين:
 * - البيانات المحلية الثابتة للمحتوى (السرعة)
 * - Supabase للتقدم والحالة (المزامنة)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  hybridSyncService,
  CourseProgressSummary,
} from '@/services/hybridSyncService';
import { getLessonsByCourse } from '@/constants/courseData';
import { progressService } from '@/services/progressService';
import { coinService } from '@/services/coinService';

// مرجع لدالة فحص الشارات (يُعيّن من BadgeContext)
let _checkBadgesRef: (() => Promise<any>) | null = null;
export function setHybridCheckBadgesRef(fn: (() => Promise<any>) | null) {
  _checkBadgesRef = fn;
}

interface UseHybridProgressOptions {
  courseId: string;
  userId?: string;
}

interface HybridProgressState {
  completedLessons: string[];
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  lastCompletedLessonId?: string;
  lastCompletedOrder: number;
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: Date | null;
}

/**
 * Hook لإدارة تقدم الكورس بنظام Hybrid
 */
export function useHybridProgress({
  courseId,
  userId,
}: UseHybridProgressOptions) {
  const [state, setState] = useState<HybridProgressState>({
    completedLessons: [],
    completedCount: 0,
    totalLessons: 0,
    progressPercent: 0,
    lastCompletedOrder: 0,
    isLoading: true,
    isSaving: false,
    lastSyncedAt: null,
  });

  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);

  // تعيين المستخدم
  useEffect(() => {
    if (userId) {
      hybridSyncService.setUser(userId);
    }
  }, [userId]);

  // جلب التقدم من Supabase
  const fetchProgress = useCallback(async () => {
    if (!courseId || !userId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // جلب الدروس من البيانات المحلية للحصول على العدد الإجمالي
      const localLessons = getLessonsByCourse(courseId);
      const totalLessons = localLessons.length;

      // جلب التقدم من Supabase
      const progress = await hybridSyncService.fetchCourseProgress(
        courseId,
        totalLessons
      );

      if (!isMountedRef.current) return;

      setState({
        completedLessons: progress.completedLessons,
        completedCount: progress.completedCount,
        totalLessons,
        progressPercent: progress.progressPercent,
        lastCompletedLessonId: progress.lastCompletedLessonId,
        lastCompletedOrder: progress.lastCompletedOrder,
        isLoading: false,
        isSaving: false,
        lastSyncedAt: new Date(),
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [courseId, userId]);

  /**
   * حفظ إكمال درس - يُرسل إلى Supabase أولاً
   * لا يُحدث الواجهة إلا بعد نجاح الحفظ
   */
  const markLessonComplete = useCallback(
    async (
      lessonId: string,
      xpReward: number,
      quizScore?: number,
      quizAnswer?: number | null
    ): Promise<{
      success: boolean;
      error?: string;
      code?: string;
      queued?: boolean;
      xpAwarded?: number;
      alreadyCompleted?: boolean;
      levelUp?: boolean;
    }> => {
      if (!userId || !courseId) {
        return { success: false, error: 'بيانات ناقصة' };
      }

      // منع الإكمال المزدوج محلياً
      if (state.completedLessons.includes(lessonId)) {
        return { success: true, alreadyCompleted: true };
      }

      setState((prev) => ({ ...prev, isSaving: true }));

      // إرسال إلى Supabase أولاً
      const result = await hybridSyncService.saveLessonComplete(
        lessonId,
        courseId,
        xpReward,
        quizScore ? Math.round(quizScore * 100) : undefined,
        quizAnswer
      );

      if (!result.success) {
        setState((prev) => ({ ...prev, isSaving: false }));
        return result;
      }

      // إذا كان الدرس مكتملاً من قبل، لا نحدث الواجهة
      if (result.alreadyCompleted) {
        setState((prev) => ({ ...prev, isSaving: false }));
        return { success: true, alreadyCompleted: true };
      }

      // تحديث الواجهة بعد نجاح الحفظ في Supabase
      const orderMatch = lessonId.match(/-(\d+)$/);
      const lessonOrder = orderMatch ? parseInt(orderMatch[1]) : 1;

      setState((prev) => {
        const newCompletedLessons = [...prev.completedLessons, lessonId];
        const newCount = newCompletedLessons.length;
        return {
          ...prev,
          completedLessons: newCompletedLessons,
          completedCount: newCount,
          progressPercent:
            prev.totalLessons > 0
              ? Math.round((newCount / prev.totalLessons) * 100)
              : 0,
          lastCompletedLessonId: lessonId,
          lastCompletedOrder: lessonOrder,
          isSaving: false,
          lastSyncedAt: new Date(),
        };
      });

      // تحديث التقدم المحلي + فحص الشارات
      try {
        await progressService.completeLesson(lessonId, xpReward, quizScore);
        if (_checkBadgesRef) {
          await _checkBadgesRef();
        }
      } catch (e) {
        console.error('Error in post-lesson progress/badge update:', e);
      }

      return { success: true, levelUp: false, xpAwarded: result.xpAwarded };
    },
    [courseId, userId, state.completedLessons]
  );

  /**
   * التحقق من إكمال درس
   */
  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      return state.completedLessons.includes(lessonId);
    },
    [state.completedLessons]
  );

  /**
   * تحديث يدوي
   */
  const refresh = useCallback(async () => {
    await fetchProgress();
  }, [fetchProgress]);

  // تحميل أولي
  useEffect(() => {
    isMountedRef.current = true;
    fetchProgress();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProgress]);

  // مزامنة في الخلفية عند العودة للتطبيق
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // عاد للتطبيق - مزامنة
        fetchProgress();
        hybridSyncService.backgroundSync();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [fetchProgress]);

  return {
    // البيانات
    completedLessons: state.completedLessons,
    completedCount: state.completedCount,
    totalLessons: state.totalLessons,
    progressPercent: state.progressPercent,
    lastCompletedLessonId: state.lastCompletedLessonId,
    lastCompletedOrder: state.lastCompletedOrder,

    // حالة التحميل
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    lastSyncedAt: state.lastSyncedAt,

    // الدوال
    markLessonComplete,
    isLessonCompleted,
    refresh,
  };
}

/**
 * Hook للتحقق من فتح الكورس
 */
export function useCourseUnlock(
  courseId: string,
  userId?: string,
  pointsCost: number = 0
) {
  const [isUnlocked, setIsUnlocked] = useState(pointsCost === 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (userId) {
      hybridSyncService.setUser(userId);
    }
  }, [userId]);

  const checkUnlock = useCallback(async () => {
    if (pointsCost === 0) {
      setIsUnlocked(true);
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unlocked = await hybridSyncService.isCourseUnlocked(
      courseId,
      pointsCost
    );
    setIsUnlocked(unlocked);
    setIsLoading(false);
  }, [courseId, userId, pointsCost]);

  useEffect(() => {
    checkUnlock();
  }, [checkUnlock]);

  const unlock = useCallback(async () => {
    if (!userId) return { success: false, error: 'غير مسجل' };

    setIsUnlocking(true);
    const result = await coinService.unlockCourse(courseId);

    if (result.success) {
      hybridSyncService.invalidateUnlock(courseId);
      setIsUnlocked(true);
    }

    setIsUnlocking(false);
    return result;
  }, [courseId, userId]);

  return {
    isUnlocked,
    isLoading,
    isUnlocking,
    checkUnlock,
    unlock,
  };
}

/**
 * Hook لمزامنة الخلفية
 * يُستخدم في _layout.tsx للمزامنة عند التنقل
 */
export function useBackgroundSync(userId?: string) {
  useEffect(() => {
    if (userId) {
      hybridSyncService.setUser(userId);
      // مزامنة أولية
      hybridSyncService.backgroundSync();
    }
  }, [userId]);

  const sync = useCallback(async () => {
    await hybridSyncService.backgroundSync();
  }, []);

  return { sync };
}

/**
 * Hook لإحصائيات المستخدم من Supabase
 */
export function useUserStats(userId?: string) {
  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    completedLessons: 0,
    completedChallenges: 0,
    lastActiveDate: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // MUST await setUser before calling getUserXP — otherwise internal
      // userId may not be set yet and we get empty/default data.
      await hybridSyncService.setUser(userId);
      const data = await hybridSyncService.getUserXP();
      setStats(data);
    } catch (err) {
      console.warn('[useUserStats] Error fetching stats:', err);
      // Keep previous stats — don't reset to defaults
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refresh: fetchStats };
}

export default useHybridProgress;
