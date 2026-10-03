/**
 * خدمة التقدم مع Supabase - Kodax
 * حفظ واسترجاع التقدم من قاعدة البيانات
 * مع دعم التخزين المحلي للعمل offline
 */

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@/lib/platformStorage';

// ===== مفاتيح التخزين =====
const STORAGE_KEYS = {
  COMPLETED_LESSONS: '@kodax_db_completed_lessons',
  LAST_LESSON: '@kodax_last_completed_lesson',
  COURSE_PROGRESS: '@kodax_course_progress',
  PENDING_SYNC: '@kodax_pending_sync',
};

// ===== أنواع البيانات =====
export interface LessonProgressRecord {
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  score?: number;
  xp_earned: number;
  completed_at: string;
}

export interface CourseProgressSummary {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  last_completed_lesson_id: string | null;
  last_completed_order: number;
  progress_percent: number;
}

// ===== خدمة التقدم =====
class SupabaseProgressService {
  private isOnline: boolean = true;
  private userId: string | null = null;

  // تعيين المستخدم الحالي
  setUser(userId: string) {
    this.userId = userId;
  }

  // التحقق من الاتصال
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

  // ===== حفظ تقدم الدرس =====
  async saveLessonComplete(
    lessonId: string,
    courseId: string,
    xpEarned: number,
    score?: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      // حفظ محلي فقط إذا لم يكن هناك مستخدم
      await this.saveLocalProgress(lessonId, courseId, xpEarned);
      return { success: true };
    }

    const record: LessonProgressRecord = {
      user_id: this.userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      score,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    };

    // حفظ محلي أولاً (للسرعة)
    await this.saveLocalProgress(lessonId, courseId, xpEarned);

    // محاولة الحفظ في Supabase
    await this.checkConnection();

    if (this.isOnline) {
      try {
        // Upsert في user_lesson_progress (الجدول الجديد)
        const { error } = await supabase.from('user_lesson_progress').upsert(
          {
            user_id: this.userId,
            lesson_id: lessonId,
            course_id: courseId,
            completed: true,
            xp_earned: xpEarned,
            score,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );

        if (error) {
          console.error('Supabase save error:', error);
          await this.queueForSync(record);
          return { success: true }; // نجاح محلي
        }

        // XP يُمنح على السيرفر عند حفظ الإكمال (trg_ulp_award_lesson_xp)

        return { success: true };
      } catch (err) {
        console.error('Database error:', err);
        await this.queueForSync(record);
        return { success: true }; // نجاح محلي
      }
    } else {
      await this.queueForSync(record);
      return { success: true }; // نجاح محلي
    }
  }

  // ===== جلب آخر درس مكتمل للكورس =====
  async getLastCompletedLesson(
    courseId: string
  ): Promise<{ lessonId: string | null; lessonOrder: number }> {
    if (!this.userId) {
      return this.getLocalLastLesson(courseId);
    }

    await this.checkConnection();

    if (this.isOnline) {
      try {
        // جلب من Supabase مع ترتيب حسب وقت الإكمال
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, course_id, completed_at')
          .eq('user_id', this.userId)
          .eq('course_id', courseId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // لا نحتاج للفلترة لأن course_id موجود في الاستعلام
          const courseLessons = data;

          if (courseLessons.length > 0) {
            const lastLessonId = courseLessons[0].lesson_id;
            // استخراج رقم الترتيب من ID الدرس
            const orderMatch = lastLessonId.match(/-(\d+)$/);
            const order = orderMatch ? parseInt(orderMatch[1]) : 1;

            // حفظ محلي للتخزين المؤقت
            await this.saveLocalLastLesson(courseId, lastLessonId, order);

            return { lessonId: lastLessonId, lessonOrder: order };
          }
        }
      } catch (err) {
        console.error('Error fetching last lesson:', err);
      }
    }

    return this.getLocalLastLesson(courseId);
  }

  // ===== جلب تقدم الكورس الكامل =====
  async getCourseProgress(
    courseId: string,
    totalLessons: number
  ): Promise<CourseProgressSummary> {
    if (!this.userId) {
      return this.getLocalCourseProgress(courseId, totalLessons);
    }

    await this.checkConnection();

    if (this.isOnline) {
      try {
        const coursePrefix = courseId.split('-').slice(0, 2).join('-');

        // جلب كل الدروس المكتملة لهذا الكورس
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed_at')
          .eq('user_id', this.userId)
          .eq('course_id', courseId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (!error && data) {
          const completedCount = data.length;
          const lastLesson = data.length > 0 ? data[0] : null;
          const lastOrderMatch = lastLesson?.lesson_id.match(/-(\d+)$/);

          const progress: CourseProgressSummary = {
            course_id: courseId,
            completed_lessons: completedCount,
            total_lessons: totalLessons,
            last_completed_lesson_id: lastLesson?.lesson_id || null,
            last_completed_order: lastOrderMatch
              ? parseInt(lastOrderMatch[1])
              : 0,
            progress_percent:
              totalLessons > 0
                ? Math.round((completedCount / totalLessons) * 100)
                : 0,
          };

          // حفظ محلي
          await this.saveLocalCourseProgress(courseId, progress);

          return progress;
        }
      } catch (err) {
        console.error('Error fetching course progress:', err);
      }
    }

    return this.getLocalCourseProgress(courseId, totalLessons);
  }

  // ===== جلب كل الدروس المكتملة =====
  async getCompletedLessons(): Promise<string[]> {
    if (!this.userId) {
      return this.getLocalCompletedLessons();
    }

    await this.checkConnection();

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', this.userId)
          .eq('completed', true);

        if (!error && data) {
          const lessonIds = data.map((d) => d.lesson_id);
          // حفظ محلي
          await AsyncStorage.setItem(
            STORAGE_KEYS.COMPLETED_LESSONS,
            JSON.stringify(lessonIds)
          );
          return lessonIds;
        }
      } catch (err) {
        console.error('Error fetching completed lessons:', err);
      }
    }

    return this.getLocalCompletedLessons();
  }

  // ===== مزامنة البيانات المعلقة =====
  async syncPendingData(): Promise<void> {
    if (!this.userId) return;

    await this.checkConnection();
    if (!this.isOnline) return;

    try {
      const pending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      if (!pending) return;

      const records: LessonProgressRecord[] = JSON.parse(pending);

      for (const record of records) {
        try {
          await supabase.from('user_lesson_progress').upsert(
            {
              user_id: record.user_id,
              lesson_id: record.lesson_id,
              course_id: record.course_id,
              completed: true,
              xp_earned: record.xp_earned,
              score: record.score,
              completed_at: record.completed_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,lesson_id' }
          );
        } catch (err) {
          console.error('Sync error for lesson:', record.lesson_id);
        }
      }

      // مسح قائمة الانتظار بعد المزامنة
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (err) {
      console.error('Error syncing pending data:', err);
    }
  }

  // ===== دوال التخزين المحلي =====

  private async saveLocalProgress(
    lessonId: string,
    courseId: string,
    xpEarned: number
  ): Promise<void> {
    // حفظ في قائمة الدروس المكتملة
    const completed = await this.getLocalCompletedLessons();
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.COMPLETED_LESSONS,
        JSON.stringify(completed)
      );
    }

    // حفظ آخر درس للكورس
    const orderMatch = lessonId.match(/-(\d+)$/);
    const order = orderMatch ? parseInt(orderMatch[1]) : 1;
    await this.saveLocalLastLesson(courseId, lessonId, order);
  }

  private async getLocalCompletedLessons(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
    return data ? JSON.parse(data) : [];
  }

  private async saveLocalLastLesson(
    courseId: string,
    lessonId: string,
    order: number
  ): Promise<void> {
    const key = `${STORAGE_KEYS.LAST_LESSON}_${courseId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ lessonId, order }));
  }

  private async getLocalLastLesson(
    courseId: string
  ): Promise<{ lessonId: string | null; lessonOrder: number }> {
    const key = `${STORAGE_KEYS.LAST_LESSON}_${courseId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return { lessonId: parsed.lessonId, lessonOrder: parsed.order };
    }
    return { lessonId: null, lessonOrder: 0 };
  }

  private async saveLocalCourseProgress(
    courseId: string,
    progress: CourseProgressSummary
  ): Promise<void> {
    const key = `${STORAGE_KEYS.COURSE_PROGRESS}_${courseId}`;
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  }

  private async getLocalCourseProgress(
    courseId: string,
    totalLessons: number
  ): Promise<CourseProgressSummary> {
    const key = `${STORAGE_KEYS.COURSE_PROGRESS}_${courseId}`;
    const data = await AsyncStorage.getItem(key);

    if (data) {
      return JSON.parse(data);
    }

    // بناء من الدروس المكتملة المحلية
    const completed = await this.getLocalCompletedLessons();
    const coursePrefix = courseId.split('-').slice(0, 2).join('-');
    const courseLessons = completed.filter((id) => id.startsWith(coursePrefix));

    return {
      course_id: courseId,
      completed_lessons: courseLessons.length,
      total_lessons: totalLessons,
      last_completed_lesson_id: courseLessons[courseLessons.length - 1] || null,
      last_completed_order: courseLessons.length,
      progress_percent:
        totalLessons > 0
          ? Math.round((courseLessons.length / totalLessons) * 100)
          : 0,
    };
  }

  private async queueForSync(record: LessonProgressRecord): Promise<void> {
    const pending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    const records: LessonProgressRecord[] = pending ? JSON.parse(pending) : [];

    // تجنب التكرار
    if (!records.find((r) => r.lesson_id === record.lesson_id)) {
      records.push(record);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_SYNC,
        JSON.stringify(records)
      );
    }
  }
}

// تصدير instance واحد
export const supabaseProgressService = new SupabaseProgressService();
export default supabaseProgressService;
