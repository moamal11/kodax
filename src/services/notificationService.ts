/**
 * notificationService.ts
 *
 * خدمة الإشعارات - إنشاء وتخزين وإدارة الإشعارات داخل التطبيق
 * تعمل محلياً عبر AsyncStorage مع مزامنة Supabase للمشاركة بين الأجهزة
 */

import AsyncStorage from '@/lib/platformStorage';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

const NOTIFICATIONS_KEY = '@kodax_notifications';
const MAX_NOTIFICATIONS = 100;

// عداد تسلسلي لضمان فرادة المعرفات
let notificationCounter = 0;

// Helper function to generate UUID with fallback for React Native
function generateUUID(): string {
  // Try to use crypto.randomUUID if available (web/Node.js)
  if (
    Platform.OS === 'web' &&
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if crypto fails
    }
  }

  // Fallback: generate UUID v4 compatible string
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${notificationCounter}-${random1}-${random2}`;
}

export type NotificationType =
  | 'badge'
  | 'level_up'
  | 'challenge'
  | 'lesson'
  | 'course'
  | 'streak'
  | 'xp'
  // أنواع قديمة (نظام الدفع أُلغي) — تبقى فقط لعرض الإشعارات القديمة في السجل
  | 'purchase'
  | 'payment_approved'
  | 'payment_rejected'
  | 'system'
  | 'follow'
  | 'profile_update'
  | 'like'
  | 'comment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  metadata?: {
    badgeId?: string;
    badgeRarity?: string;
    level?: number;
    xpAmount?: number;
    challengeId?: string;
    lessonId?: string;
    courseId?: string;
    streakDays?: number;
    [key: string]: any;
  };
}

type NotificationEventCallback = (notification: AppNotification) => void;

class NotificationService {
  private notifications: AppNotification[] = [];
  private initialized = false;
  private onNewNotification: NotificationEventCallback | null = null;
  private userId: string | null = null;
  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

  // ===== تعيين معرف المستخدم =====
  async setUserId(userId: string | null): Promise<void> {
    if (this.userId !== userId) {
      // إلغاء الاشتراك Realtime عند تغيير المستخدم
      this.unsubscribeFromRealtime();

      // مسح بيانات المستخدم القديم من AsyncStorage — دائماً عند تغيير المستخدم
      try {
        await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
        console.log(
          '✅ Cleared notification data from AsyncStorage (user changed)'
        );
      } catch (e) {
        console.error('⚠️ Failed to clear notification data:', e);
      }

      this.userId = userId;
      this.initialized = false; // إعادة التهيئة عند تغيير المستخدم
      this.notifications = [];
    }
  }

  // ===== تهيئة =====
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. محاولة جلب من Supabase أولاً (للمزامنة بين الأجهزة)
      if (this.userId) {
        try {
          const { data, error } = await supabase
            .from('app_notifications')
            .select('*')
            .eq('user_id', this.userId)
            .order('created_at', { ascending: false })
            .limit(MAX_NOTIFICATIONS);

          // ✅ قبول أي نتيجة من Supabase (حتى لو فارغة)
          if (!error && data) {
            // تحويل بيانات Supabase إلى تنسيق AppNotification
            this.notifications = data.map((n) => ({
              id: n.id,
              type: n.type as NotificationType,
              title: n.title,
              message: n.message,
              read: n.read,
              timestamp: n.created_at,
              metadata: n.metadata,
            }));

            // حفظ في AsyncStorage للاستخدام دون اتصال
            await AsyncStorage.setItem(
              NOTIFICATIONS_KEY,
              JSON.stringify(this.notifications)
            );

            console.log(
              `✅ Loaded ${data.length} notifications from Supabase for user ${this.userId}`
            );
            this.initialized = true;
            return;
          }
        } catch (supabaseError) {
          console.warn(
            '⚠️ Supabase notifications fetch failed, using local:',
            supabaseError
          );
        }
      }

      // 2. إذا فشل Supabase أو لا يوجد مستخدم، استخدام AsyncStorage
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);

        // مزامنة مع Supabase إذا كان المستخدم متاحاً
        if (this.userId && this.notifications.length > 0) {
          this.syncNotificationsToSupabase().catch((err) =>
            console.warn('⚠️ Background notification sync failed:', err)
          );
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Notification service init error:', error);
      this.initialized = true;
    }
  }

  // ===== مزامنة الإشعارات إلى Supabase (في الخلفية) =====
  private async syncNotificationsToSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      // إدراج الإشعارات التي لم تُرسل إلى Supabase بعد
      const rows = this.notifications
        .filter((n) => !n.id.startsWith('notif_')) // تخطي الإشعارات المحلية القديمة التي لها معرفات مؤقتة
        .map((n) => ({
          id: n.id,
          user_id: this.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          metadata: n.metadata,
          created_at: n.timestamp,
        }));

      if (rows.length > 0) {
        await supabase.from('app_notifications').upsert(rows, {
          onConflict: 'id',
          ignoreDuplicates: true,
        });
      }
    } catch (error) {
      console.error('❌ Error syncing notifications to Supabase:', error);
    }
  }

  // ===== تسجيل callback للإشعارات الجديدة =====
  setOnNewNotification(callback: NotificationEventCallback | null): void {
    this.onNewNotification = callback;
  }

  // ===== إنشاء إشعار جديد =====
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: AppNotification['metadata']
  ): Promise<AppNotification> {
    await this.initialize();

    // إنشاء معرف فريد مع عداد تسلسلي
    notificationCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);

    const notificationId = this.userId
      ? generateUUID()
      : `notif_${timestamp}_${notificationCounter}_${random}`;

    const notification: AppNotification = {
      id: notificationId,
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // إذا كان المستخدم متصلاً، حفظ في Supabase أولاً
    if (this.userId) {
      try {
        const { error } = await supabase.from('app_notifications').insert({
          id: notification.id,
          user_id: this.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          metadata: notification.metadata,
          created_at: notification.timestamp,
        });

        if (error) {
          console.warn('⚠️ Failed to create notification in Supabase:', error);
        }
      } catch (error) {
        console.warn('⚠️ Supabase notification creation error:', error);
      }
    }

    // إضافة في البداية (الأحدث أولاً)
    this.notifications.unshift(notification);

    // الحفاظ على الحد الأقصى
    if (this.notifications.length > MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
    }

    await this.save();

    // إطلاق callback
    this.onNewNotification?.(notification);

    return notification;
  }

  // ===== إشعارات محددة مسبقاً =====

  /** إشعار شارة جديدة */
  async notifyBadgeEarned(
    badgeName: string,
    badgeNameAr: string,
    badgeId: string,
    badgeRarity: string,
    xpReward: number
  ): Promise<AppNotification> {
    return this.createNotification(
      'badge',
      `${badgeNameAr}`,
      `حصلت على شارة "${badgeName}" (+${xpReward} XP)`,
      { badgeId, badgeRarity, xpAmount: xpReward }
    );
  }

  /** إشعار ارتقاء مستوى */
  async notifyLevelUp(newLevel: number): Promise<AppNotification> {
    return this.createNotification(
      'level_up',
      `مستوى جديد!`,
      `ترقيت إلى المستوى ${newLevel}! استمر في التقدم`,
      { level: newLevel }
    );
  }

  /** إشعار إكمال تحدي */
  async notifyChallengeCompleted(
    challengeId: string,
    xpEarned: number
  ): Promise<AppNotification> {
    return this.createNotification(
      'challenge',
      `تحدي مكتمل!`,
      `أحسنت! كسبت ${xpEarned} نقطة خبرة`,
      { challengeId, xpAmount: xpEarned }
    );
  }

  /** إشعار إكمال درس */
  async notifyLessonCompleted(
    lessonId: string,
    xpEarned: number
  ): Promise<AppNotification> {
    return this.createNotification(
      'lesson',
      `درس مكتمل!`,
      `أكملت الدرس بنجاح! (+${xpEarned} XP)`,
      { lessonId, xpAmount: xpEarned }
    );
  }

  /** إشعار إكمال دورة */
  async notifyCourseCompleted(courseId: string): Promise<AppNotification> {
    return this.createNotification(
      'course',
      `دورة مكتملة!`,
      `مبروك! أكملت الدورة بنجاح`,
      { courseId }
    );
  }

  /** إشعار سلسلة */
  async notifyStreakMilestone(days: number): Promise<AppNotification> {
    return this.createNotification(
      'streak',
      `سلسلة ${days} يوم!`,
      `حافظت على سلسلة ${days} أيام متتالية!`,
      { streakDays: days }
    );
  }

  /** إشعار XP */
  async notifyXPMilestone(xp: number): Promise<AppNotification> {
    return this.createNotification(
      'xp',
      `إنجاز XP!`,
      `وصلت إلى ${xp.toLocaleString()} نقطة خبرة!`,
      { xpAmount: xp }
    );
  }

  /** إشعار متابعة جديدة */
  async notifyNewFollower(
    followerName: string,
    followerId: string
  ): Promise<AppNotification> {
    return this.createNotification(
      'follow',
      `متابع جديد`,
      `${followerName} بدأ بمتابعتك`,
      { followerId, followerName }
    );
  }

  /** إشعار تحديث الملف الشخصي */
  async notifyProfileUpdate(changeType: string): Promise<AppNotification> {
    return this.createNotification(
      'profile_update',
      `تحديث الملف الشخصي`,
      `تم تحديث ${changeType} بنجاح`,
      { changeType }
    );
  }

  // ===== الحصول على الإشعارات =====
  async getNotifications(): Promise<AppNotification[]> {
    await this.initialize();
    return [...this.notifications];
  }

  // ===== الحصول على الإشعارات غير المقروءة =====
  async getUnreadCount(): Promise<number> {
    await this.initialize();
    return this.notifications.filter((n) => !n.read).length;
  }

  // ===== تحديد كمقروء =====
  async markAsRead(notificationId: string): Promise<void> {
    await this.initialize();
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      // ✅ حذف إشعارات الشارات فوراً بعد القراءة
      if (notification.type === 'badge') {
        // حذف من المصفوفة المحلية
        this.notifications = this.notifications.filter(
          (n) => n.id !== notificationId
        );
        await this.save();

        // حذف من Supabase
        if (this.userId) {
          try {
            await supabase
              .from('app_notifications')
              .delete()
              .eq('id', notificationId)
              .eq('user_id', this.userId);
          } catch (error) {
            console.warn(
              '⚠️ Failed to delete badge notification from Supabase:',
              error
            );
          }
        }
      } else {
        // الإشعارات الأخرى: تحديد كمقروء فقط
        notification.read = true;
        await this.save();

        // تحديث في Supabase
        if (this.userId) {
          try {
            await supabase
              .from('app_notifications')
              .update({ read: true })
              .eq('id', notificationId)
              .eq('user_id', this.userId);
          } catch (error) {
            console.warn(
              '⚠️ Failed to mark notification as read in Supabase:',
              error
            );
          }
        }
      }
    }
  }

  // ===== تحديد الكل كمقروء =====
  async markAllAsRead(): Promise<void> {
    await this.initialize();
    this.notifications.forEach((n) => (n.read = true));
    await this.save();

    // تحديث في Supabase
    if (this.userId) {
      try {
        await supabase
          .from('app_notifications')
          .update({ read: true })
          .eq('user_id', this.userId)
          .eq('read', false);
      } catch (error) {
        console.warn(
          '⚠️ Failed to mark all notifications as read in Supabase:',
          error
        );
      }
    }
  }

  // ===== حذف إشعار =====
  async deleteNotification(notificationId: string): Promise<void> {
    await this.initialize();
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
    await this.save();

    // حذف من Supabase أيضاً
    if (this.userId) {
      try {
        await supabase
          .from('app_notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', this.userId);
      } catch (error) {
        console.warn('⚠️ Failed to delete notification from Supabase:', error);
      }
    }
  }

  // ===== مسح كل الإشعارات =====
  async clearAll(): Promise<void> {
    this.notifications = [];
    await this.save();
  }

  // ===== حفظ =====
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(this.notifications)
      );

      // مزامنة مع Supabase
      if (this.userId) {
        await this.syncNotificationsToSupabase();
      }
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  }

  // ===== إعادة تعيين =====
  async reset(): Promise<void> {
    this.notifications = [];
    this.initialized = false;
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch {}
  }

  // ===== اشتراك Realtime لاستقبال الإشعارات الجديدة فورياً =====
  subscribeToRealtime(userId: string): void {
    // إلغاء أي اشتراك سابق أولاً
    this.unsubscribeFromRealtime();

    this.realtimeChannel = supabase
      .channel(`app_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as Record<string, any>;
          const notification: AppNotification = {
            id: n.id,
            type: n.type as NotificationType,
            title: n.title,
            message: n.message,
            read: n.read ?? false,
            timestamp: n.created_at,
            metadata: n.metadata,
          };

          // تجنب التكرار إذا كانت موجودة مسبقاً
          if (this.notifications.some((x) => x.id === notification.id)) return;

          // إضافة في البداية (الأحدث أولاً)
          this.notifications.unshift(notification);
          if (this.notifications.length > MAX_NOTIFICATIONS) {
            this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
          }

          // حفظ محلي
          AsyncStorage.setItem(
            NOTIFICATIONS_KEY,
            JSON.stringify(this.notifications)
          ).catch(() => {});

          // إطلاق callback لتحديث الـ UI
          this.onNewNotification?.(notification);

          console.log(
            '🔔 Realtime notification received:',
            notification.type,
            notification.title
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Realtime notification channel error');
        }
      });
  }

  unsubscribeFromRealtime(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
      
    }
  }

  /**
   * إعادة تعيين الحالة في الذاكرة فقط (بدون AsyncStorage)
   * يُستخدم بعد clearAllKodaxData() لتنظيف الذاكرة
   */
  resetState(): void {
    this.unsubscribeFromRealtime();
    this.notifications = [];
    this.initialized = false;
    this.userId = null;
   
  }
}

export const notificationService = new NotificationService();
export default notificationService;
