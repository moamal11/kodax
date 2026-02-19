/**
 * خدمة قاعدة البيانات الشاملة - Kodax
 * ربط جميع البيانات مع Supabase للحفظ الدائم
 */

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== أنواع البيانات =====
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
  completed: boolean;
  score?: number;
  completed_at?: string;
}

export interface ChallengeAttempt {
  user_id: string;
  challenge_id: string;
  code: string;
  passed: boolean;
  tests_passed: number;
  tests_total: number;
  xp_earned: number;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  purchased_points: number;
  earned_points: number;
  spent_points: number;
  premium_expires_at?: string;
  unlocked_courses: string[];
}

// ===== مفاتيح التخزين المحلي =====
const STORAGE_KEYS = {
  USER_PROFILE: '@kodax_user_profile',
  USER_PROGRESS: '@kodax_user_progress',
  USER_POINTS: '@kodax_user_points',
  COMPLETED_LESSONS: '@kodax_completed_lessons',
  COMPLETED_CHALLENGES: '@kodax_completed_challenges',
  UNLOCKED_COURSES: '@kodax_unlocked_courses',
  LAST_SYNC: '@kodax_last_sync',
};

// ===== خدمة قاعدة البيانات =====
class DatabaseService {
  private isOnline: boolean = true;
  private syncQueue: any[] = [];

  // ===== التهيئة =====
  async initialize(): Promise<void> {
    // التحقق من الاتصال
    this.checkConnection();
    // محاولة مزامنة البيانات المحلية
    await this.syncPendingData();
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

  // ===== إدارة الملف الشخصي =====

  // حفظ الملف الشخصي
  async saveProfile(profile: UserProfile): Promise<boolean> {
    // حفظ محلي أولاً
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile)
    );

    // محاولة الحفظ في Supabase
    if (this.isOnline) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          province: profile.province,
          xp: profile.xp,
          level: profile.level,
          streak_days: profile.streak_days,
          last_login: new Date().toISOString(),
        });

        if (error) {
          console.error('Error saving profile to Supabase:', error);
          this.queueSync('profile', profile);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Database error:', err);
        this.queueSync('profile', profile);
        return false;
      }
    } else {
      this.queueSync('profile', profile);
      return false;
    }
  }

  // جلب الملف الشخصي
  async getProfile(userId: string): Promise<UserProfile | null> {
    // محاولة جلب من Supabase أولاً
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          // تحديث النسخة المحلية
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_PROFILE,
            JSON.stringify(data)
          );
          return data;
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }

    // الرجوع للنسخة المحلية
    const local = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return local ? JSON.parse(local) : null;
  }

  // ===== إدارة التقدم =====

  // حفظ تقدم الدرس
  async saveLessonProgress(
    userId: string,
    lessonId: string,
    score?: number
  ): Promise<boolean> {
    const progress: UserProgress = {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      score,
      completed_at: new Date().toISOString(),
    };

    // حفظ محلي
    const completedLessons = await this.getCompletedLessons(userId);
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.COMPLETED_LESSONS,
        JSON.stringify(completedLessons)
      );
    }

    // حفظ في Supabase
    if (this.isOnline) {
      try {
        const { error } = await supabase.from('user_progress').upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          score,
          completed_at: new Date().toISOString(),
        });

        if (error) {
          this.queueSync('lesson_progress', progress);
          return false;
        }
        return true;
      } catch (err) {
        this.queueSync('lesson_progress', progress);
        return false;
      }
    } else {
      this.queueSync('lesson_progress', progress);
      return false;
    }
  }

  // جلب الدروس المكتملة
  async getCompletedLessons(userId: string): Promise<string[]> {
    // محاولة جلب من Supabase
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('completed', true);

        if (!error && data) {
          const lessonIds = data.map((d) => d.lesson_id);
          await AsyncStorage.setItem(
            STORAGE_KEYS.COMPLETED_LESSONS,
            JSON.stringify(lessonIds)
          );
          return lessonIds;
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    }

    // الرجوع للنسخة المحلية
    const local = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
    return local ? JSON.parse(local) : [];
  }

  // ===== إدارة التحديات =====

  // حفظ محاولة تحدي
  async saveChallengeAttempt(attempt: ChallengeAttempt): Promise<boolean> {
    // حفظ محلي إذا نجح
    if (attempt.passed) {
      const completedChallenges = await this.getCompletedChallenges(
        attempt.user_id
      );
      if (!completedChallenges.includes(attempt.challenge_id)) {
        completedChallenges.push(attempt.challenge_id);
        await AsyncStorage.setItem(
          STORAGE_KEYS.COMPLETED_CHALLENGES,
          JSON.stringify(completedChallenges)
        );
      }
    }

    // حفظ في Supabase
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('challenge_attempts')
          .insert(attempt);

        if (error) {
          this.queueSync('challenge_attempt', attempt);
          return false;
        }
        return true;
      } catch (err) {
        this.queueSync('challenge_attempt', attempt);
        return false;
      }
    } else {
      this.queueSync('challenge_attempt', attempt);
      return false;
    }
  }

  // جلب التحديات المكتملة
  async getCompletedChallenges(userId: string): Promise<string[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('challenge_attempts')
          .select('challenge_id')
          .eq('user_id', userId)
          .eq('passed', true);

        if (!error && data) {
          const challengeIds = data.map((d) => d.challenge_id);
          await AsyncStorage.setItem(
            STORAGE_KEYS.COMPLETED_CHALLENGES,
            JSON.stringify(challengeIds)
          );
          return challengeIds;
        }
      } catch (err) {
        console.error('Error fetching challenges:', err);
      }
    }

    const local = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_CHALLENGES);
    return local ? JSON.parse(local) : [];
  }

  // ===== إدارة النقاط =====

  // حفظ النقاط
  async savePoints(userId: string, points: UserPoints): Promise<boolean> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_POINTS,
      JSON.stringify(points)
    );

    if (this.isOnline) {
      try {
        // تحديث XP في profiles
        const { error } = await supabase
          .from('profiles')
          .update({ xp: points.total_points })
          .eq('id', userId);

        if (error) {
          this.queueSync('points', points);
          return false;
        }
        return true;
      } catch (err) {
        this.queueSync('points', points);
        return false;
      }
    } else {
      this.queueSync('points', points);
      return false;
    }
  }

  // جلب النقاط
  async getPoints(userId: string): Promise<UserPoints | null> {
    const local = await AsyncStorage.getItem(STORAGE_KEYS.USER_POINTS);
    return local ? JSON.parse(local) : null;
  }

  // ===== إدارة الدورات المفتوحة =====

  // فتح دورة
  async unlockCourse(userId: string, courseId: string): Promise<boolean> {
    const unlocked = await this.getUnlockedCourses(userId);
    if (!unlocked.includes(courseId)) {
      unlocked.push(courseId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.UNLOCKED_COURSES,
        JSON.stringify(unlocked)
      );
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('user_unlocked_courses')
          .insert({ user_id: userId, course_id: courseId });

        if (error && !error.message.includes('duplicate')) {
          this.queueSync('unlock_course', { userId, courseId });
          return false;
        }
        return true;
      } catch (err) {
        this.queueSync('unlock_course', { userId, courseId });
        return false;
      }
    } else {
      this.queueSync('unlock_course', { userId, courseId });
      return false;
    }
  }

  // جلب الدورات المفتوحة
  async getUnlockedCourses(userId: string): Promise<string[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_unlocked_courses')
          .select('course_id')
          .eq('user_id', userId);

        if (!error && data) {
          const courseIds = data.map((d) => d.course_id);
          await AsyncStorage.setItem(
            STORAGE_KEYS.UNLOCKED_COURSES,
            JSON.stringify(courseIds)
          );
          return courseIds;
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }

    const local = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_COURSES);
    return local ? JSON.parse(local) : [];
  }

  // ===== تحديث XP =====
  async updateXP(userId: string, xpToAdd: number): Promise<number> {
    // جلب XP الحالي
    const profile = await this.getProfile(userId);
    const currentXP = profile?.xp || 0;
    const newXP = currentXP + xpToAdd;

    // تحديث محلي
    if (profile) {
      profile.xp = newXP;
      profile.level = this.calculateLevel(newXP);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    }

    // تحديث في Supabase
    if (this.isOnline) {
      try {
        await supabase
          .from('profiles')
          .update({
            xp: newXP,
            level: this.calculateLevel(newXP),
          })
          .eq('id', userId);
      } catch (err) {
        console.error('Error updating XP:', err);
      }
    }

    return newXP;
  }

  // حساب المستوى من XP
  private calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }

  // ===== إدارة قائمة الانتظار =====

  private queueSync(type: string, data: any): void {
    this.syncQueue.push({ type, data, timestamp: Date.now() });
    AsyncStorage.setItem('@kodax_sync_queue', JSON.stringify(this.syncQueue));
  }

  // مزامنة البيانات المعلقة
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) return;

    const queueData = await AsyncStorage.getItem('@kodax_sync_queue');
    if (!queueData) return;

    const queue = JSON.parse(queueData);
    const failedItems: any[] = [];

    for (const item of queue) {
      try {
        let success = false;

        switch (item.type) {
          case 'profile':
            success = await this.saveProfile(item.data);
            break;
          case 'lesson_progress':
            success = await this.saveLessonProgress(
              item.data.user_id,
              item.data.lesson_id,
              item.data.score
            );
            break;
          case 'challenge_attempt':
            success = await this.saveChallengeAttempt(item.data);
            break;
          case 'points':
            success = await this.savePoints(item.data.user_id, item.data);
            break;
          case 'unlock_course':
            success = await this.unlockCourse(
              item.data.userId,
              item.data.courseId
            );
            break;
        }

        if (!success) {
          failedItems.push(item);
        }
      } catch (err) {
        failedItems.push(item);
      }
    }

    this.syncQueue = failedItems;
    await AsyncStorage.setItem(
      '@kodax_sync_queue',
      JSON.stringify(failedItems)
    );
  }

  // ===== لوحة المتصدرين =====
  async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, username, full_name, avatar_url, province, xp, level, streak_days'
          )
          .order('xp', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data as UserProfile[];
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    }
    return [];
  }

  // ===== إحصائيات المستخدم =====
  async getUserStats(userId: string): Promise<{
    completedLessons: number;
    completedChallenges: number;
    totalXP: number;
    level: number;
    streak: number;
  }> {
    const profile = await this.getProfile(userId);
    const lessons = await this.getCompletedLessons(userId);
    const challenges = await this.getCompletedChallenges(userId);

    return {
      completedLessons: lessons.length,
      completedChallenges: challenges.length,
      totalXP: profile?.xp || 0,
      level: profile?.level || 1,
      streak: profile?.streak_days || 0,
    };
  }

  // ===== تنظيف البيانات =====
  async clearLocalData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.USER_PROGRESS,
      STORAGE_KEYS.USER_POINTS,
      STORAGE_KEYS.COMPLETED_LESSONS,
      STORAGE_KEYS.COMPLETED_CHALLENGES,
      STORAGE_KEYS.UNLOCKED_COURSES,
      STORAGE_KEYS.LAST_SYNC,
      '@kodax_sync_queue',
    ]);
  }
}

// تصدير نسخة واحدة من الخدمة
export const databaseService = new DatabaseService();
export default databaseService;
