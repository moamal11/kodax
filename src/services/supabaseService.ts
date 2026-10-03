/**
 * خدمة Supabase الشاملة - Kodax
 * المصدر الوحيد للبيانات - بدون بيانات محلية
 * Real-time Sync بين جميع الأجهزة
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ===== أنواع البيانات =====
export interface Course {
  id: string;
  field_id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  color: string;
  total_lessons: number;
  total_xp: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order_index: number;
  is_locked: boolean;
  required_course_id?: string;
  points_cost: number;
  created_at?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  field_id: string;
  title: string;
  title_ar: string;
  description: string;
  content: string;
  code_example?: string;
  language?: string;
  xp_reward: number;
  order_index: number;
  type: 'theory' | 'practice' | 'quiz';
  estimated_minutes: number;
  quiz?: Quiz;
  created_at?: string;
}

export interface Quiz {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  field_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  type: 'daily' | 'weekly' | 'special';
  test_cases: TestCase[];
  starter_code?: string;
  solution_code?: string;
  hints?: string[];
  language: string;
  time_limit?: number;
  active: boolean;
  category?: string;
  created_at?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  description: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  province?: string;
  xp: number;
  level: number;
  streak_days: number;
  last_login?: string;
  created_at?: string;
}

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  xp_earned: number;
  completed_at?: string;
}

export interface CourseProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percent: number;
  last_completed_lesson_id?: string;
}

// ===== خدمة Supabase الرئيسية =====
class SupabaseService {
  private realtimeChannel: RealtimeChannel | null = null;
  private progressListeners: Map<string, (progress: CourseProgress) => void> =
    new Map();
  private userId: string | null = null;

  // ===== تهيئة المستخدم =====
  setUser(userId: string) {
    this.userId = userId;
    this.setupRealtimeSubscription();
  }

  clearUser() {
    this.userId = null;
    this.unsubscribeRealtime();
  }

  // ===== الاشتراك في التحديثات اللحظية =====
  private setupRealtimeSubscription() {
    if (!this.userId) return;

    // إلغاء الاشتراك السابق
    this.unsubscribeRealtime();

    // إنشاء قناة جديدة للتقدم
    this.realtimeChannel = supabase
      .channel(`progress:${this.userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lesson_progress',
          filter: `user_id=eq.${this.userId}`,
        },
        async (payload) => {
          // إعادة حساب التقدم لكل الكورسات المشتركة
          if (
            payload.new &&
            typeof payload.new === 'object' &&
            'course_id' in payload.new
          ) {
            const courseId = (payload.new as any).course_id;
            const progress = await this.getCourseProgress(courseId);
            const listener = this.progressListeners.get(courseId);
            if (listener && progress) {
              listener(progress);
            }
          }
        }
      )
      .subscribe();
  }

  private unsubscribeRealtime() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  // الاشتراك في تحديثات كورس معين
  subscribeToProgress(
    courseId: string,
    callback: (progress: CourseProgress) => void
  ) {
    this.progressListeners.set(courseId, callback);
  }

  unsubscribeFromProgress(courseId: string) {
    this.progressListeners.delete(courseId);
  }

  // ===== جلب الكورسات =====
  async getCourses(fieldId?: string): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true });

    if (fieldId) {
      query = query.eq('field_id', fieldId);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data || [];
  }

  // جلب كورس واحد
  async getCourse(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  // ===== جلب الدروس =====
  async getLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons_v2')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  }

  // جلب درس واحد
  async getLesson(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from('lessons_v2')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  // جلب كل الدروس لمجال معين
  async getLessonsByField(fieldId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons_v2')
      .select('*')
      .eq('field_id', fieldId)
      .order('order_index', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  }

  // ===== جلب التحديات =====
  async getChallenges(fieldId?: string, type?: string): Promise<Challenge[]> {
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (fieldId) {
      query = query.eq('field_id', fieldId);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data || [];
  }

  // إجمالي عدد التحديات
  async getChallengesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  // ===== إدارة التقدم =====

  // حفظ إكمال درس
  async saveLessonComplete(
    lessonId: string,
    courseId: string,
    xpEarned: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase.from('user_lesson_progress').upsert(
      {
        user_id: this.userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    // XP يُمنح على السيرفر عند حفظ الإكمال (trg_ulp_award_lesson_xp)

    return { success: true };
  }

  // جلب تقدم الكورس
  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    if (!this.userId) return null;

    // جلب عدد الدروس المكتملة
    const { data: progressData, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .eq('completed', true)
      .order('completed_at', { ascending: false });

    if (progressError) {
      return null;
    }

    // جلب إجمالي الدروس
    const { count: totalLessons, error: countError } = await supabase
      .from('lessons_v2')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (countError) {
      return null;
    }

    const completedCount = progressData?.length || 0;
    const total = totalLessons || 0;

    return {
      course_id: courseId,
      completed_lessons: completedCount,
      total_lessons: total,
      progress_percent:
        total > 0 ? Math.round((completedCount / total) * 100) : 0,
      last_completed_lesson_id: progressData?.[0]?.lesson_id || undefined,
    };
  }

  // جلب كل الدروس المكتملة للمستخدم
  async getCompletedLessons(courseId?: string): Promise<string[]> {
    if (!this.userId) return [];

    let query = supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', this.userId)
      .eq('completed', true);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data?.map((d) => d.lesson_id) || [];
  }

  // التحقق من إكمال درس
  async isLessonCompleted(lessonId: string): Promise<boolean> {
    if (!this.userId) return false;

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('completed')
      .eq('user_id', this.userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error || !data) return false;
    return data.completed;
  }

  // ===== إدارة الملف الشخصي =====

  // جلب الملف الشخصي
  async getProfile(): Promise<UserProfile | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  // ===== إحصائيات المستخدم =====
  async getUserStats(): Promise<{
    totalXP: number;
    level: number;
    streak: number;
    completedLessons: number;
    completedChallenges: number;
    totalCourses: number;
    totalLessons: number;
    totalChallenges: number;
  }> {
    const profile = await this.getProfile();
    const completedLessons = await this.getCompletedLessons();
    const completedChallenges = await this.getCompletedChallengesCount();

    // إحصائيات عامة
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    const { count: totalLessons } = await supabase
      .from('lessons_v2')
      .select('*', { count: 'exact', head: true });

    const totalChallenges = await this.getChallengesCount();

    return {
      totalXP: profile?.xp || 0,
      level: profile?.level || 1,
      streak: profile?.streak_days || 0,
      completedLessons: completedLessons.length,
      completedChallenges,
      totalCourses: totalCourses || 0,
      totalLessons: totalLessons || 0,
      totalChallenges,
    };
  }

  // عدد التحديات المكتملة
  async getCompletedChallengesCount(): Promise<number> {
    if (!this.userId) return 0;

    const { count, error } = await supabase
      .from('challenge_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('passed', true);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  // ===== الكورسات المفتوحة =====

  // التحقق من فتح الكورس
  async isCourseUnlocked(courseId: string): Promise<boolean> {
    if (!this.userId) return false;

    // جلب بيانات الكورس
    const course = await this.getCourse(courseId);
    if (!course) return false;

    // الكورسات المجانية مفتوحة دائماً
    if (course.points_cost === 0) return true;

    // التحقق من جدول الكورسات المفتوحة
    const { data, error } = await supabase
      .from('user_unlocked_courses')
      .select('id')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .single();

    if (error || !data) return false;
    return true;
  }

  // ملاحظة: فتح الدورات وكل عمليات الكوينات تتم عبر coinService (RPC على السيرفر).

  // ===== Leaderboard =====
  async getLeaderboard(limit: number = 10): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, province, xp, level, streak_days, is_verified'
      )
      .order('xp', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return (data || []) as UserProfile[];
  }

  // ===== مجالات البرمجة =====
  async getProgrammingFields(): Promise<any[]> {
    const { data, error } = await supabase
      .from('programming_fields')
      .select('*');

    if (error) {
      return [];
    }

    return data || [];
  }
}

// تصدير instance واحد
export const supabaseService = new SupabaseService();
export default supabaseService;
