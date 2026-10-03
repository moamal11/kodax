/**
 * 🎓 useCertificate Hook - Kodax
 * Hook لإدارة حالة الشهادات على مستوى المجال (Field-based)
 *
 * ⚡ يحسب الأهلية محلياً من البيانات الموجودة لجميع الكورسات في المجال
 * 🎯 الشهادة تُمنح بعد إكمال جميع دورات المجال (مثل: جميع دورات Python)
 *
 * 🔧 ملاحظة: التحديات تُحفظ في جدول user_lesson_progress
 *    مع course_id = 'challenges'
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { certificateService } from '@/services/certificateService';
import {
  CertificateLevel,
  CertificateSummaryItem,
  EligibilityResult,
  CertificateProgress,
} from '@/types/certificate';
import {
  getChallengesByCourse,
  getCoursesByField,
  getLessonsByCourse,
} from '@/constants/courseData';

// ===== متطلبات كل مستوى =====
const LEVEL_REQUIREMENTS: Record<
  CertificateLevel,
  {
    min_lessons_percent: number;
    min_challenges_percent: number;
    min_exam_score: number;
    max_challenge_errors: number | null;
  }
> = {
  silver: {
    min_lessons_percent: 50,
    min_challenges_percent: 25,
    min_exam_score: 0,
    max_challenge_errors: null,
  },
  gold: {
    min_lessons_percent: 75,
    min_challenges_percent: 60,
    min_exam_score: 0,
    max_challenge_errors: null,
  },
  platinum: {
    min_lessons_percent: 100,
    min_challenges_percent: 100,
    min_exam_score: 0,
    max_challenge_errors: 0,
  },
};

interface UseCertificateOptions {
  fieldId: string; // e.g., 'web-dev', 'python', 'cybersecurity'
  fieldName: string;
  fieldNameAr?: string;
  userId?: string;
  /** هل بيانات التقدم لا تزال تُحمَّل؟ */
  isProgressLoading?: boolean;
}

interface UseCertificateState {
  currentCertificate: CertificateSummaryItem | null;
  silverEligibility: EligibilityResult | null;
  goldEligibility: EligibilityResult | null;
  platinumEligibility: EligibilityResult | null;
  highestEligible: CertificateLevel | null;
  canClaim: boolean;
  claimableLevel: CertificateLevel | null;
  isLoading: boolean;
  isIssuing: boolean;
  error: string | null;
}

export function useCertificate({
  fieldId,
  fieldName,
  fieldNameAr,
  userId,
  isProgressLoading = false,
}: UseCertificateOptions) {
  const [state, setState] = useState<UseCertificateState>({
    currentCertificate: null,
    silverEligibility: null,
    goldEligibility: null,
    platinumEligibility: null,
    highestEligible: null,
    canClaim: false,
    claimableLevel: null,
    isLoading: true,
    isIssuing: false,
    error: null,
  });

  // جلب جميع الكورسات في المجال
  const fieldCourses = useMemo(() => getCoursesByField(fieldId), [fieldId]);

  // حساب إجمالي الدروس والتحديات في المجال
  const { totalLessons, totalChallenges, allChallengeIds } = useMemo(() => {
    let lessons = 0;
    let challenges = 0;
    const challengeIds: string[] = [];

    console.log(`[useCertificate] 🔍 Calculating totals for field: ${fieldId}`);
    console.log(
      `[useCertificate] Courses in field (${fieldCourses.length}):`,
      fieldCourses.map((c) => c.id)
    );

    fieldCourses.forEach((course) => {
      // استخدام العدد الفعلي للدروس من مصفوفة الدروس بدل totalLessons الثابت
      const actualLessons = getLessonsByCourse(course.id);
      lessons += actualLessons.length;
      const courseChallenges = getChallengesByCourse(course.id);
      challenges += courseChallenges.length;
      challengeIds.push(...courseChallenges.map((c) => c.id));

      console.log(
        `[useCertificate] 📚 ${course.id}: ${actualLessons.length} lessons, ${courseChallenges.length} challenges`
      );
      if (courseChallenges.length > 0) {
        console.log(
          `  Challenge IDs: ${courseChallenges.map((c) => c.id).join(', ')}`
        );
      }
    });

    console.log(
      `[useCertificate] ✅ Totals: ${lessons} lessons, ${challenges} challenges`
    );

    return {
      totalLessons: lessons,
      totalChallenges: challenges,
      allChallengeIds: challengeIds,
    };
  }, [fieldCourses]);

  // الدروس المكتملة لجميع الكورسات في المجال
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // ===== جلب الدروس المكتملة لجميع الكورسات في المجال =====
  useEffect(() => {
    if (!userId || !fieldId || fieldCourses.length === 0) {
      setLessonsLoading(false);
      return;
    }

    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        const courseIds = fieldCourses.map((c) => c.id);

        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('completed', true)
          .in('course_id', courseIds);

        if (isMountedRef.current) {
          if (!error && data) {
            setCompletedLessons(data.map((d) => d.lesson_id));
          } else {
            setCompletedLessons([]);
          }
          setLessonsLoading(false);
        }
      } catch (err) {
        console.error('[useCertificate] Error fetching lessons:', err);
        if (isMountedRef.current) {
          setCompletedLessons([]);
          setLessonsLoading(false);
        }
      }
    };

    fetchLessons();
  }, [userId, fieldId, fieldCourses]);

  const isMountedRef = useRef(true);
  const lastCheckRef = useRef<string>('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // تهيئة المستخدم في الخدمة
  // التحديات المكتملة لجميع الكورسات في المجال
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>(
    []
  );
  const [challengesLoading, setChallengesLoading] = useState(true);

  // ===== جلب التحديات المكتملة =====
  useEffect(() => {
    if (!userId || !fieldId || allChallengeIds.length === 0) {
      setChallengesLoading(false);
      return;
    }

    const fetchChallenges = async () => {
      setChallengesLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('course_id', 'challenges')
          .eq('completed', true)
          .in('lesson_id', allChallengeIds);

        if (isMountedRef.current) {
          if (!error && data) {
            setCompletedChallengeIds(data.map((d) => d.lesson_id));
            console.log('[useCertificate] Challenges for field loaded:', {
              fieldId,
              totalChallenges: allChallengeIds.length,
              completed: data.length,
            });
          } else {
            setCompletedChallengeIds([]);
          }
          setChallengesLoading(false);
        }
      } catch (err) {
        console.error('[useCertificate] Error fetching challenges:', err);
        if (isMountedRef.current) {
          setCompletedChallengeIds([]);
          setChallengesLoading(false);
        }
      }
    };

    fetchChallenges();
  }, [userId, fieldId, allChallengeIds, allChallengeIds.length]);

  // ===== حساب الأهلية محلياً على مستوى المجال =====
  const calculateLocalEligibility = useCallback(
    (level: CertificateLevel): EligibilityResult => {
      const req = LEVEL_REQUIREMENTS[level];
      const lessonsPercent =
        totalLessons > 0
          ? Math.round((completedLessons.length / totalLessons) * 100)
          : 0;
      const challengesPercent =
        totalChallenges > 0
          ? Math.round((completedChallengeIds.length / totalChallenges) * 100)
          : totalChallenges === 0
            ? 100 // لا توجد تحديات = يُعتبر مكتملاً
            : 0;

      const reasons: string[] = [];
      let eligible = true;

      if (lessonsPercent < req.min_lessons_percent) {
        eligible = false;
        reasons.push(
          `أكمل ${req.min_lessons_percent}% من دروس المجال (حالياً ${lessonsPercent}%)`
        );
      }

      if (
        totalChallenges > 0 &&
        challengesPercent < req.min_challenges_percent
      ) {
        eligible = false;
        reasons.push(
          `أكمل ${req.min_challenges_percent}% من تحديات المجال (حالياً ${challengesPercent}%)`
        );
      }

      const progress: CertificateProgress = {
        lessons_completed: completedLessons.length,
        lessons_total: totalLessons,
        lessons_percent: lessonsPercent,
        challenges_completed: completedChallengeIds.length,
        challenges_total: totalChallenges,
        challenges_percent: challengesPercent,
        exam_score: null,
        exam_passed: false,
        critical_errors: 0,
        completion_days: null,
      };

      // تفصيل الحسابات للتشخيص
      console.log(`[useCertificate] ${level} Eligibility:`, {
        lessonsPercent: `${lessonsPercent}% (${completedLessons.length}/${totalLessons})`,
        challengesPercent: `${challengesPercent}% (${completedChallengeIds.length}/${totalChallenges})`,
        required: req,
        eligible,
        reasons,
      });

      return { eligible, level, reasons, progress };
    },
    [
      completedLessons.length,
      completedChallengeIds.length,
      totalLessons,
      totalChallenges,
    ]
  );

  // ===== فحص الأهلية عند تغير البيانات =====
  const checkEligibility = useCallback(async () => {
    // ⛔ لا نحسب حتى تنتهي تحميل البيانات
    if (!fieldId || !userId || totalLessons === 0) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    if (isProgressLoading || lessonsLoading || challengesLoading) {
      return;
    }

    const checkKey = `${fieldId}-${completedLessons.length}-${completedChallengeIds.length}-${totalLessons}-${totalChallenges}`;
    if (checkKey === lastCheckRef.current) return;
    lastCheckRef.current = checkKey;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. جلب الشهادة الحالية للمجال
      let currentCert: CertificateSummaryItem | null = null;
      try {
        currentCert =
          await certificateService.getFieldHighestCertificate(fieldId);
      } catch {
        // لا توجد شهادات بعد
      }

      // 2. حساب الأهلية محلياً ⚡
      const silverResult = calculateLocalEligibility('silver');
      const goldResult = calculateLocalEligibility('gold');
      const platinumResult = calculateLocalEligibility('platinum');

      console.log('[useCertificate] ✅ Field eligibility calculated:', {
        fieldId,
        completedLessons: completedLessons.length,
        totalLessons,
        completedChallenges: completedChallengeIds.length,
        totalChallenges,
        silver: `L:${silverResult.progress.lessons_percent}% C:${silverResult.progress.challenges_percent}%`,
        gold: `L:${goldResult.progress.lessons_percent}% C:${goldResult.progress.challenges_percent}%`,
      });

      if (!isMountedRef.current) return;

      // 3. تحديد المستوى القابل للطلب - يجب المطالبة بالترتيب
      const levelOrder: CertificateLevel[] = ['silver', 'gold', 'platinum'];
      const results = {
        silver: silverResult,
        gold: goldResult,
        platinum: platinumResult,
      };
      const currentLevelIndex = currentCert
        ? levelOrder.indexOf(currentCert.level)
        : -1;

      let claimableLevel: CertificateLevel | null = null;
      let canClaim = false;
      let highestEligible: CertificateLevel | null = null;

      // أولاً: تحديد أعلى مستوى مؤهل
      for (let i = levelOrder.length - 1; i >= 0; i--) {
        if (results[levelOrder[i]].eligible) {
          highestEligible = levelOrder[i];
          break;
        }
      }

      // ثانياً: المستوى القابل للطلب = المستوى التالي مباشرة بعد الحالي
      // يجب المطالبة بالترتيب: فضية ← ذهبية ← بلاتينيم
      const nextLevelIndex = currentLevelIndex + 1;
      if (nextLevelIndex < levelOrder.length) {
        const nextLevel = levelOrder[nextLevelIndex];
        if (results[nextLevel].eligible) {
          claimableLevel = nextLevel;
          canClaim = true;
        }
      }

      setState({
        currentCertificate: currentCert,
        silverEligibility: silverResult,
        goldEligibility: goldResult,
        platinumEligibility: platinumResult,
        highestEligible,
        canClaim,
        claimableLevel,
        isLoading: false,
        isIssuing: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[useCertificate] Error:', err);
      if (isMountedRef.current) {
        const silverResult = calculateLocalEligibility('silver');
        const goldResult = calculateLocalEligibility('gold');
        const platinumResult = calculateLocalEligibility('platinum');

        setState((prev) => ({
          ...prev,
          silverEligibility: silverResult,
          goldEligibility: goldResult,
          platinumEligibility: platinumResult,
          isLoading: false,
          error: null,
        }));
      }
    }
  }, [
    fieldId,
    userId,
    totalLessons,
    totalChallenges,
    completedLessons.length,
    completedChallengeIds.length,
    isProgressLoading,
    lessonsLoading,
    challengesLoading,
    calculateLocalEligibility,
  ]);

  // تشغيل الفحص تلقائياً عند تغير البيانات
  useEffect(() => {
    if (isProgressLoading || lessonsLoading || challengesLoading) return;

    const timer = setTimeout(() => {
      checkEligibility();
    }, 300);

    return () => clearTimeout(timer);
  }, [checkEligibility, isProgressLoading, lessonsLoading, challengesLoading]);

  // إصدار الشهادة (عبر Edge Function)
  const issueCertificate = useCallback(
    async (level: CertificateLevel) => {
      if (!fieldId || !userId) {
        return { success: false, error: 'بيانات ناقصة' };
      }

      setState((prev) => ({ ...prev, isIssuing: true, error: null }));

      try {
        const result = await certificateService.issueCertificate(
          fieldId,
          level,
          fieldName,
          fieldNameAr
        );

        if (isMountedRef.current) {
          if (result.success) {
            lastCheckRef.current = '';
            await checkEligibility();
          } else {
            setState((prev) => ({
              ...prev,
              isIssuing: false,
              error: result.error || null,
            }));
          }
        }

        return result;
      } catch (err: any) {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isIssuing: false,
            error: err.message,
          }));
        }
        return { success: false, error: err.message };
      }
    },
    [
      fieldId,
      userId,
      fieldName,
      fieldNameAr,
      checkEligibility,
      completedLessons,
      totalLessons,
      completedChallengeIds,
      totalChallenges,
    ]
  );

  // تهيئة المستخدم في الخدمة
  useEffect(() => {
    if (userId) {
      certificateService.setUser(userId);
    }
  }, [userId]);

  return {
    ...state,
    checkEligibility,
    issueCertificate,
    refresh: () => {
      lastCheckRef.current = '';
      checkEligibility();
    },
    // معلومات إضافية عن المجال
    fieldId,
    fieldCourses,
    totalLessons,
    totalChallenges,
    completedLessons: completedLessons.length,
    completedChallenges: completedChallengeIds.length,
  };
}
