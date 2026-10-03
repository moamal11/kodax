/**
 * useProgressWithPoints Hook
 * دمج نظام التقدم مع مكافآت الكوينات (من السيرفر) + فحص الشارات
 */

import { useCallback } from 'react';
import { progressService } from '@/services/progressService';
import { coinService } from '@/services/coinService';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';

// import useBadges فقط إذا كان متاحاً (اختياري لتجنب circular dependency)
let checkBadgesFn: ((extra?: any) => Promise<any>) | null = null;

export function setCheckBadgesFn(fn: ((extra?: any) => Promise<any>) | null) {
  checkBadgesFn = fn;
}

export function useProgressWithPoints() {

  /**
   * إكمال درس مع منح النقاط + فحص الشارات
   */
  const completeLesson = useCallback(
    async (lessonId: string, lessonXP: number, quizScore?: number) => {
      const result = await progressService.completeLesson(
        lessonId,
        lessonXP,
        quizScore
      );

      if (result.success) {
        // إشعار إكمال الدرس
        await notificationService.notifyLessonCompleted(lessonId, lessonXP);

        // إشعار ارتقاء مستوى
        if (result.levelUp) {
          const newLevel = progressService.calculateLevel(result.newXP);
          await notificationService.notifyLevelUp(newLevel);
        }

        // فحص الشارات
        if (checkBadgesFn) {
          await checkBadgesFn();
        }
      }

      return result;
    },
    []
  );

  /**
   * إكمال تحدي مع منح النقاط + فحص الشارات
   */
  const completeChallenge = useCallback(
    async (
      challengeId: string,
      challengePoints: number,
      code: string,
      difficulty: 'easy' | 'medium' | 'hard',
      hintsUsed: number = 0
    ) => {
      const result = await progressService.completeChallenge(
        challengeId,
        challengePoints,
        code,
        hintsUsed
      );

      if (result.success) {
        // مكافأة كوينات (السيرفر يتحقق من الإكمال ويمنع التكرار)
        await coinService.rewardChallenge(challengeId, difficulty);

        // تحديث عدادات الشارات
        // سلسلة التحديات
        await badgeService.incrementChallengeStreak();

        // تحديات بدون تلميحات
        if (hintsUsed === 0) {
          await badgeService.incrementNoHintCount();
        }

        // تحديات صعبة
        if (difficulty === 'hard') {
          await badgeService.incrementHardChallengeCount();
        }

        // إشعار إكمال التحدي
        await notificationService.notifyChallengeCompleted(
          challengeId,
          challengePoints
        );

        // إشعار ارتقاء مستوى
        if (result.levelUp) {
          const newLevel = progressService.calculateLevel(result.newXP);
          await notificationService.notifyLevelUp(newLevel);
        }

        // فحص الشارات
        if (checkBadgesFn) {
          await checkBadgesFn();
        }
      }

      return result;
    },
    []
  );

  /**
   * إكمال دورة كاملة + فحص الشارات
   */
  const completeCourse = useCallback(
    async (courseId: string) => {
      // مكافأة إكمال الدورة (السيرفر يتحقق من إكمال كل الدروس)
      await coinService.rewardCourseCompletion(courseId);

      // إشعار
      await notificationService.notifyCourseCompleted(courseId);

      // فحص الشارات
      if (checkBadgesFn) {
        await checkBadgesFn();
      }

      return { success: true };
    },
    []
  );

  /**
   * فشل تحدي — إعادة تعيين سلسلة التحديات
   */
  const failChallenge = useCallback(async () => {
    await badgeService.resetChallengeStreak();
  }, []);

  return {
    completeLesson,
    completeChallenge,
    completeCourse,
    failChallenge,
    // باقي الدوال من progressService
    isLessonCompleted: progressService.isLessonCompleted.bind(progressService),
    isChallengeCompleted:
      progressService.isChallengeCompleted.bind(progressService),
    getProgress: progressService.getProgress.bind(progressService),
    getLessonProgress: progressService.getLessonProgress.bind(progressService),
    getChallengeProgress:
      progressService.getChallengeProgress.bind(progressService),
    calculateLevel: progressService.calculateLevel.bind(progressService),
  };
}

export default useProgressWithPoints;
