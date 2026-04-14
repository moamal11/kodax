/**
 * Hook لتحديث التقدم في الوقت الفعلي
 * يوفر تحديثاً فورياً لشريط التقدم عند إكمال الدروس
 * مع دعم Supabase للحفظ الدائم
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { progressService, UserProgress } from '@/services/progressService';
import { supabaseProgressService } from '@/services/supabaseProgressService';

interface UseRealtimeProgressOptions {
  courseId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  userId?: string; // يُمرر من الخارج
}

interface RealtimeProgressState {
  completedLessons: string[];
  completedChallenges: string[];
  totalXP: number;
  isLoading: boolean;
  lastUpdated: Date | null;
  lastCompletedLessonId: string | null;
  lastCompletedOrder: number;
}

export function useRealtimeProgress(options: UseRealtimeProgressOptions = {}) {
  const {
    courseId,
    autoRefresh = false,
    refreshInterval = 5000,
    userId,
  } = options;

  const [state, setState] = useState<RealtimeProgressState>({
    completedLessons: [],
    completedChallenges: [],
    totalXP: 0,
    isLoading: true,
    lastUpdated: null,
    lastCompletedLessonId: null,
    lastCompletedOrder: 0,
  });

  const isMountedRef = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | any>(null);

  // تعيين المستخدم في خدمة Supabase
  useEffect(() => {
    if (userId) {
      supabaseProgressService.setUser(userId);
    }
  }, [userId]);

  // تحميل التقدم من Supabase أولاً، ثم المحلي
  const loadProgress = useCallback(async () => {
    try {
      // تهيئة الخدمة المحلية
      await progressService.initialize();

      // محاولة جلب من Supabase إذا كان هناك مستخدم
      let completedLessons: string[] = [];
      let lastCompletedLessonId: string | null = null;
      let lastCompletedOrder = 0;

      if (userId) {
        // جلب من Supabase
        completedLessons = await supabaseProgressService.getCompletedLessons();

        // جلب آخر درس مكتمل للكورس
        if (courseId) {
          const lastLesson =
            await supabaseProgressService.getLastCompletedLesson(courseId);
          lastCompletedLessonId = lastLesson.lessonId;
          lastCompletedOrder = lastLesson.lessonOrder;
        }
      } else {
        // جلب من المخزن المحلي
        const progress = await progressService.getProgress();
        completedLessons = progress.completedLessons;
      }

      if (!isMountedRef.current) return;

      // فلترة حسب الكورس إذا تم تحديده
      if (courseId) {
        const coursePrefix = courseId.split('-').slice(0, 2).join('-');
        completedLessons = completedLessons.filter((id) =>
          id.startsWith(coursePrefix)
        );
      }

      const localProgress = await progressService.getProgress();

      setState({
        completedLessons,
        completedChallenges: localProgress.completedChallenges,
        totalXP: localProgress.totalXP,
        isLoading: false,
        lastUpdated: new Date(),
        lastCompletedLessonId,
        lastCompletedOrder,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [courseId, userId]);

  // تحديث فوري بعد إكمال درس مع حفظ في Supabase
  const markLessonComplete = useCallback(
    async (lessonId: string, xpReward: number, quizScore?: number) => {
      // استخراج رقم الترتيب من ID الدرس
      const orderMatch = lessonId.match(/-(\d+)$/);
      const lessonOrder = orderMatch ? parseInt(orderMatch[1]) : 1;

      // تحديث الحالة المحلية فوراً (Optimistic Update)
      setState((prev) => ({
        ...prev,
        completedLessons: prev.completedLessons.includes(lessonId)
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
        totalXP: prev.totalXP + xpReward,
        lastUpdated: new Date(),
      }));

      // حفظ في الخدمة المحلية
      const result = await progressService.completeLesson(
        lessonId,
        xpReward,
        quizScore
      );

      // حفظ في Supabase أيضاً (الحفظ الدائم)
      if (courseId) {
        await supabaseProgressService.saveLessonComplete(
          lessonId,
          courseId,
          xpReward,
          quizScore ? Math.round(quizScore * 100) : undefined
        );
      }

      // تحديث الحالة مع آخر درس مكتمل
      setState((prev) => ({
        ...prev,
        lastCompletedLessonId: lessonId,
        lastCompletedOrder: lessonOrder,
      }));

      // إعادة تحميل للتأكد من التزامن
      await loadProgress();

      return result;
    },
    [loadProgress, courseId]
  );

  // تحديث فوري بعد إكمال تحدي
  const markChallengeComplete = useCallback(
    async (
      challengeId: string,
      points: number,
      code: string,
      hintsUsed?: number
    ) => {
      // تحديث الحالة المحلية فوراً (Optimistic Update)
      setState((prev) => ({
        ...prev,
        completedChallenges: prev.completedChallenges.includes(challengeId)
          ? prev.completedChallenges
          : [...prev.completedChallenges, challengeId],
        totalXP: prev.totalXP + points,
        lastUpdated: new Date(),
      }));

      // حفظ في الخدمة
      const result = await progressService.completeChallenge(
        challengeId,
        points,
        code,
        hintsUsed
      );

      // إعادة تحميل للتأكد من التزامن
      await loadProgress();

      return result;
    },
    [loadProgress]
  );

  // حساب نسبة التقدم
  const calculateProgress = useCallback(
    (totalLessons: number): number => {
      if (totalLessons === 0) return 0;
      return Math.round((state.completedLessons.length / totalLessons) * 100);
    },
    [state.completedLessons.length]
  );

  // التحقق من إكمال درس
  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      return state.completedLessons.includes(lessonId);
    },
    [state.completedLessons]
  );

  // التحقق من إكمال تحدي
  const isChallengeCompleted = useCallback(
    (challengeId: string): boolean => {
      return state.completedChallenges.includes(challengeId);
    },
    [state.completedChallenges]
  );

  // تحديث يدوي
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await loadProgress();
  }, [loadProgress]);

  // تحميل أولي
  useEffect(() => {
    isMountedRef.current = true;
    loadProgress();

    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loadProgress]);

  // تحديث تلقائي (اختياري)
  useEffect(() => {
    if (!autoRefresh) return;

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          loadProgress();
          scheduleRefresh();
        }
      }, refreshInterval);
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadProgress]);

  return {
    // البيانات
    completedLessons: state.completedLessons,
    completedChallenges: state.completedChallenges,
    totalXP: state.totalXP,
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,

    // بيانات آخر درس مكتمل (للاستمرارية)
    lastCompletedLessonId: state.lastCompletedLessonId,
    lastCompletedOrder: state.lastCompletedOrder,

    // الدوال
    markLessonComplete,
    markChallengeComplete,
    calculateProgress,
    isLessonCompleted,
    isChallengeCompleted,
    refresh,

    // للراحة
    completedLessonsCount: state.completedLessons.length,
    completedChallengesCount: state.completedChallenges.length,
  };
}

export default useRealtimeProgress;
