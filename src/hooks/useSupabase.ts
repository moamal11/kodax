/**
 * React Hooks للتعامل مع Supabase - Kodax
 * جلب البيانات من Database مع Real-time Updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  supabaseService,
  Course,
  Lesson,
  Challenge,
  CourseProgress,
  UserProfile,
} from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';

// ===== Hook لجلب الكورسات =====
export function useCourses(fieldId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getCourses(fieldId);
      setCourses(data);
    } catch (err) {
      setError('فشل في جلب الكورسات');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, isLoading, error, refresh: fetchCourses };
}

// ===== Hook لجلب كورس واحد =====
export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const data = await supabaseService.getCourse(courseId);
        setCourse(data);
      } catch (err) {
        setError('فشل في جلب الكورس');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, isLoading, error };
}

// ===== Hook لجلب الدروس =====
export function useLessons(courseId: string | undefined) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getLessons(courseId);
      setLessons(data);
    } catch (err) {
      setError('فشل في جلب الدروس');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, isLoading, error, refresh: fetchLessons };
}

// ===== Hook لجلب درس واحد =====
export function useLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    const fetchLesson = async () => {
      setIsLoading(true);
      try {
        const data = await supabaseService.getLesson(lessonId);
        setLesson(data);
      } catch (err) {
        setError('فشل في جلب الدرس');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, isLoading, error };
}

// ===== Hook لتقدم الكورس مع Real-time =====
export function useCourseProgress(
  courseId: string | undefined,
  userId: string | undefined
) {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      supabaseService.setUser(userId);
      const [progressData, completed] = await Promise.all([
        supabaseService.getCourseProgress(courseId),
        supabaseService.getCompletedLessons(courseId),
      ]);
      setProgress(progressData);
      setCompletedLessons(completed);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // الاشتراك في التحديثات اللحظية
  useEffect(() => {
    if (!courseId || !userId) return;

    // الاشتراك في التحديثات
    supabaseService.subscribeToProgress(courseId, (newProgress) => {
      setProgress(newProgress);
      // تحديث قائمة الدروس المكتملة
      supabaseService.getCompletedLessons(courseId).then(setCompletedLessons);
    });

    // Realtime subscription مباشر
    const channel = supabase
      .channel(`progress:${userId}:${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lesson_progress',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // تحديث عند أي تغيير
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabaseService.unsubscribeFromProgress(courseId);
      supabase.removeChannel(channel);
    };
  }, [courseId, userId, fetchProgress]);

  // دالة التحقق من إكمال درس
  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessons.includes(lessonId),
    [completedLessons]
  );

  // دالة حفظ إكمال درس
  const markLessonComplete = useCallback(
    async (lessonId: string, xpReward: number) => {
      if (!userId || !courseId) return { success: false };

      supabaseService.setUser(userId);
      const result = await supabaseService.saveLessonComplete(
        lessonId,
        courseId,
        xpReward
      );

      if (result.success) {
        // تحديث فوري للـ state
        setCompletedLessons((prev) => [...prev, lessonId]);
        await fetchProgress();
      }

      return result;
    },
    [userId, courseId, fetchProgress]
  );

  return {
    progress,
    completedLessons,
    completedCount: completedLessons.length,
    isLoading,
    isLessonCompleted,
    markLessonComplete,
    refresh: fetchProgress,
  };
}

// ===== Hook للتحديات =====
export function useChallenges(fieldId?: string, type?: string) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, count] = await Promise.all([
        supabaseService.getChallenges(fieldId, type),
        supabaseService.getChallengesCount(),
      ]);
      setChallenges(data);
      setTotalCount(count);
    } catch (err) {
      setError('فشل في جلب التحديات');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId, type]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, totalCount, isLoading, error, refresh: fetchChallenges };
}

// ===== Hook للملف الشخصي =====
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      supabaseService.setUser(userId);
      const data = await supabaseService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('فشل في جلب الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Realtime updates للملف الشخصي
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, isLoading, error, refresh: fetchProfile };
}

// ===== Hook لإحصائيات المستخدم =====
export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    streak: 0,
    completedLessons: 0,
    completedChallenges: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalChallenges: 0,
    progressPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      supabaseService.setUser(userId);
      const data = await supabaseService.getUserStats();
      setStats({
        ...data,
        progressPercent:
          data.totalLessons > 0
            ? Math.round((data.completedLessons / data.totalLessons) * 100)
            : 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refresh: fetchStats };
}

// ===== Hook لمجالات البرمجة =====
export function useProgrammingFields() {
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await supabaseService.getProgrammingFields();
        setFields(data);
      } catch (err) {
        console.error('Error fetching fields:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, []);

  return { fields, isLoading };
}

// ===== Hook للتحقق من فتح الكورس =====
export function useCourseUnlock(
  courseId: string | undefined,
  userId: string | undefined
) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkUnlock = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      supabaseService.setUser(userId);
      const unlocked = await supabaseService.isCourseUnlocked(courseId);
      setIsUnlocked(unlocked);
    } catch (err) {
      console.error('Error checking unlock:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    checkUnlock();
  }, [checkUnlock]);

  const unlock = useCallback(
    async (pointsCost: number) => {
      if (!userId || !courseId) return false;

      supabaseService.setUser(userId);
      const success = await supabaseService.unlockCourse(courseId, pointsCost);
      if (success) {
        setIsUnlocked(true);
      }
      return success;
    },
    [userId, courseId]
  );

  return { isUnlocked, isLoading, checkUnlock, unlock };
}
