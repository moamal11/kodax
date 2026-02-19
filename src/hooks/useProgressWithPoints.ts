/**
 * useProgressWithPoints Hook
 * دمج نظام التقدم مع نظام النقاط + فحص الشارات
 */

import { useCallback } from 'react';
import { progressService } from '@/services/progressService';
import { usePoints } from '@/contexts/PointsContext';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';

// import useBadges فقط إذا كان متاحاً (اختياري لتجنب circular dependency)
let checkBadgesFn: ((extra?: any) => Promise<any>) | null = null;

export function setCheckBadgesFn(fn: ((extra?: any) => Promise<any>) | null) {
  checkBadgesFn = fn;
}

export function useProgressWithPoints() {
  const { addPoints, REWARDS } = usePoints();

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
        // منح نقاط إضافية من نظام النقاط
        await addPoints(REWARDS.COMPLETE_LESSON, `إكمال الدرس: ${lessonId}`);

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
    [addPoints, REWARDS]
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
        // منح نقاط حسب صعوبة التحدي
        let pointsReward = REWARDS.COMPLETE_CHALLENGE_EASY;
        if (difficulty === 'medium') {
          pointsReward = REWARDS.COMPLETE_CHALLENGE_MEDIUM;
        } else if (difficulty === 'hard') {
          pointsReward = REWARDS.COMPLETE_CHALLENGE_HARD;
        }

        await addPoints(pointsReward, `إكمال التحدي: ${challengeId}`);

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
    [addPoints, REWARDS]
  );

  /**
   * إكمال دورة كاملة + فحص الشارات
   */
  const completeCourse = useCallback(
    async (courseId: string) => {
      // إضافة للدورات المكتملة
      await addPoints(REWARDS.COMPLETE_COURSE, `إكمال الدورة: ${courseId}`);

      // إشعار
      await notificationService.notifyCourseCompleted(courseId);

      // فحص الشارات
      if (checkBadgesFn) {
        await checkBadgesFn();
      }

      return { success: true };
    },
    [addPoints, REWARDS]
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
