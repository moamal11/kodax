/**
 * لقطة التعلّم للرئيسية: الدرس التالي الفعلي، هدف اليوم، أيام الأسبوع النشطة، وتحدي اليوم.
 * المصدر: دوال السيرفر (progress_get_state، daily_challenge_get) وجدول user_activity_days.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { coinService, type ProgressState } from '@/services/coinService';
import { ALL_COURSES, ALL_CHALLENGES, getLessonsByCourse, type Course, type Lesson, type Challenge } from '@/constants/courseData';

export type WeekDay = { date: string; label: string; active: boolean; frozen: boolean; isToday: boolean };

export type LearningSnapshot = {
  next: { course: Course; lesson: Lesson; done: number; total: number; locked: boolean; requiresCourse?: Course } | null;
  /** أكمل كل دروس المسار الحالي */
  allDone: boolean;
  streak: { current: number; best: number; activeToday: boolean };
  goal: { target: number; units: number; done: boolean; weekDays: number; weekTarget: number };
  week: WeekDay[];
  dailyChallenge: Challenge | null;
  completed: Set<string>;
  progress: ProgressState | null;
};

const DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

/** تاريخ اليوم بتوقيت بغداد (نفس تقويم السيرفر) */
export function baghdadDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
}

function buildWeek(rows: { day: string; frozen: boolean; active: boolean }[]): WeekDay[] {
  const map = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = baghdadDate(i - 6);
    const dow = new Date(date + 'T12:00:00Z').getUTCDay();
    const r = map.get(date);
    return { date, label: DAY_NAMES[dow], active: !!r?.active, frozen: !!r?.frozen && !r?.active, isToday: i === 6 };
  });
}

function pickNext(progress: ProgressState | null, completed: Set<string>, lastCourseId: string | null): LearningSnapshot['next'] {
  const access = new Map((progress?.courses ?? []).map((c) => [c.course_id, c]));
  const ordered = [...ALL_COURSES].sort((a, b) => a.order - b.order);
  const startCourse = (lastCourseId && ALL_COURSES.find((c) => c.id === lastCourseId)) || ALL_COURSES.find((c) => c.id === 'py-basics') || ordered[0];
  if (!startCourse) return null;
  // نفس الدورة ثم بقية دورات نفس المجال بالترتيب
  const sameField = ordered.filter((c) => c.fieldId === startCourse.fieldId);
  const chain = [startCourse, ...sameField.filter((c) => c.id !== startCourse.id && c.order > startCourse.order)];
  for (const course of chain) {
    const lessons = getLessonsByCourse(course.id).sort((a, b) => a.order - b.order);
    if (!lessons.length) continue;
    const done = lessons.filter((l) => completed.has(l.id)).length;
    const lesson = lessons.find((l) => !completed.has(l.id));
    if (!lesson) continue;
    const a = access.get(course.id);
    const locked = !a?.accessible;
    const requiresCourse = a?.requires_course_id ? ALL_COURSES.find((c) => c.id === a.requires_course_id) : undefined;
    return { course, lesson, done, total: lessons.length, locked, requiresCourse };
  }
  return null;
}

export function useLearningSnapshot(userId?: string | null) {
  const [data, setData] = useState<LearningSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setError(false);
    try {
      const [progress, last, days, daily] = await Promise.all([
        coinService.getProgressState(),
        supabase
          .from('user_lesson_progress')
          .select('course_id, completed_at')
          .eq('user_id', userId)
          .eq('completed', true)
          .neq('course_id', 'challenges')
          .order('completed_at', { ascending: false })
          .limit(1),
        supabase
          .from('user_activity_days')
          .select('day, lessons, challenges_solved, challenge_attempts, frozen')
          .eq('user_id', userId)
          .gte('day', baghdadDate(-6)),
        coinService.dailyChallenge().catch(() => null),
      ]);
      const completed = new Set<string>(progress?.completed_lessons ?? []);
      const lastCourseId = (last.data?.[0] as any)?.course_id ?? null;
      const next = pickNext(progress, completed, lastCourseId);
      const week = buildWeek(
        ((days.data ?? []) as any[]).map((r) => ({
          day: String(r.day).slice(0, 10),
          frozen: !!r.frozen,
          active: (r.lessons ?? 0) + (r.challenges_solved ?? 0) + (r.challenge_attempts ?? 0) > 0,
        }))
      );
      const g = progress?.goals as any;
      const dailyId = (daily as any)?.challenge_id as string | undefined;
      setData({
        next,
        allDone: !next,
        streak: { current: progress?.streak?.current ?? 0, best: progress?.streak?.best ?? 0, activeToday: !!progress?.streak?.active_today },
        goal: {
          target: g?.daily_target ?? 2,
          units: g?.today_units ?? 0,
          done: !!g?.daily_done,
          weekDays: g?.week_active_days ?? 0,
          weekTarget: g?.weekly_target_days ?? 5,
        },
        week,
        dailyChallenge: dailyId ? (ALL_CHALLENGES.find((c) => c.id === dailyId) ?? null) : null,
        completed,
        progress,
      });
      if (!progress) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
