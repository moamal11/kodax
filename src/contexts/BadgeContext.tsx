/**
 * BadgeContext.tsx
 *
 * سياق الشارات والإشعارات
 * يدمج badgeService + notificationService + Toast + AchievementUnlock
 * يُفحص تلقائياً عند كل تغيير في التقدم
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { badgeService, BadgeCheckContext } from '@/services/badgeService';
import {
  notificationService,
  AppNotification,
} from '@/services/notificationService';
import { BadgeDefinition } from '@/constants/badgeDefinitions';
import { progressService } from '@/services/progressService';
import { hybridSyncService } from '@/services/hybridSyncService';
import { BadgeBanner } from '@/features/rewards/BadgeBanner';
import { msUntilRewardsQuiet } from '@/features/rewards/RewardLayer';
import { setCheckBadgesFn } from '@/hooks/useProgressWithPoints';
import { setHybridCheckBadgesRef } from '@/hooks/useHybridProgress';

// ===== واجهة السياق =====
interface BadgeContextType {
  // الشارات
  earnedBadgeIds: string[];
  earnedCount: number;
  totalCount: number;

  // الإشعارات
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // فحص يدوي
  checkBadges: (
    extraContext?: Partial<BadgeCheckContext>
  ) => Promise<BadgeDefinition[]>;

  // إعادة تحميل
  refreshNotifications: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

// ===== BadgeProvider =====
interface BadgeProviderProps {
  children: ReactNode;
  lifetimeCoins?: number;
  unlockedCoursesCount?: number;
  hasUnlockedWithCoins?: boolean;
  userId?: string; // إضافة معرف المستخدم
}

export function BadgeProvider({
  children,
  lifetimeCoins = 0,
  unlockedCoursesCount = 0,
  hasUnlockedWithCoins = false,
  userId,
}: BadgeProviderProps) {
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // الشارات الجديدة المعلنة دفعة واحدة (BadgeBanner)
  const [bannerBadges, setBannerBadges] = useState<BadgeDefinition[]>([]);
  const pendingRef = useRef<BadgeDefinition[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // refs لمنع التكرار
  const initRef = useRef(false);
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // ===== تهيئة =====
  useEffect(() => {
    // إعادة التهيئة إذا تغير userId
    if (prevUserIdRef.current !== userId) {
      initRef.current = false;
      prevUserIdRef.current = userId;
    }

    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      // تعيين معرف المستخدم دائماً قبل التهيئة
      // هذا يضمن إعادة تعيين الحالة عند تغيير المستخدم
      await badgeService.setUserId(userId || null);
      await notificationService.setUserId(userId || null);
      await progressService.setUserId(userId || null);

      await badgeService.initialize();
      await notificationService.initialize();

      // الاشتراك في Realtime لاستقبال الإشعارات الجديدة فورياً
      // (مثل: إعجاب شخص بكودك، أو تعليق على كود نشرته)
      if (userId) {
        notificationService.subscribeToRealtime(userId);
      }

      const ids = await badgeService.getEarnedBadgeIds();
      setEarnedBadgeIds(ids);

      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    };

    // تسجيل callbacks: الشارات تُجمع دفعة واحدة وتُعلن ببطاقة واحدة غير حاجبة
    // (الشارات لا تمنح XP على السيرفر، فلا نذكر XP في الإعلان)
    badgeService.setOnBadgeEarned(async (badge) => {
      pendingRef.current.push(badge);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      // تأخير يسمح بانتهاء حركة XP واحتفال المستوى قبل الإعلان
      const flush = () => {
        const wait = msUntilRewardsQuiet();
        if (wait > 0) {
          flushTimerRef.current = setTimeout(flush, wait + 200);
          return;
        }
        const batch = pendingRef.current;
        pendingRef.current = [];
        setBannerBadges((prev) => [...prev, ...batch]);
      };
      flushTimerRef.current = setTimeout(flush, 1200);
    });

    notificationService.setOnNewNotification((_notification) => {
      // تحديث الإشعارات
      notificationService.getNotifications().then(setNotifications);
      notificationService.getUnreadCount().then(setUnreadCount);
    });

    init();

    return () => {
      badgeService.setOnBadgeEarned(null);
      notificationService.setOnNewNotification(null);
      notificationService.unsubscribeFromRealtime();
    };
  }, [userId]); // إعادة التهيئة عند تغيير userId

  // ===== بناء السياق الكامل للفحص =====
  const buildContext = useCallback(
    async (extra?: Partial<BadgeCheckContext>): Promise<BadgeCheckContext> => {
      const progress = await progressService.getProgress();
      const challengeStreak = await badgeService.getChallengeStreak();
      const noHintCount = await badgeService.getNoHintCount();
      const hardCount = await badgeService.getHardChallengeCount();
      const isComeback = await badgeService.getComeback();

      // ===== جلب الأعداد الحقيقية =====
      // الأولوية: Supabase (دقيق ومربوط بالمستخدم)
      // المحلي: يُستخدم فقط كاحتياطي إذا فشل Supabase
      let realCompletedLessons = 0;
      let realCompletedChallenges = 0;
      let realTotalXP = 0;
      let usedSupabase = false;

      if (userId) {
        try {
          await hybridSyncService.setUser(userId);

          // جلب الدروس الحقيقية (بدون التحديات)
          const lessonsOnly =
            await hybridSyncService.fetchCompletedLessonsOnly();
          // جلب التحديات فقط
          const challengesOnly =
            await hybridSyncService.fetchCompletedChallengesOnly();

          realCompletedLessons = lessonsOnly.length;
          realCompletedChallenges = challengesOnly.length;
          usedSupabase = true;

          // جلب XP الحقيقي
          const userStats = await hybridSyncService.getUserXP();
          if (userStats && userStats.xp > 0) {
            realTotalXP = userStats.xp;
          }
        } catch (e) {
          console.warn('⚠️ Failed to fetch real counts from Supabase:', e);
        }
      }

      if (!usedSupabase) {
        // احتياطي: استخدام progressService المحلي فقط إذا فشل Supabase
        realCompletedLessons = progress.completedLessons.length;
        realCompletedChallenges = progress.completedChallenges.length;
        realTotalXP = progress.totalXP;
      } else {
        // عند نجاح Supabase: نأخذ الأكبر فقط عندما يكون الفرق 1
        // (يعني الدرس/التحدي الذي أُكمل للتو ولم يصل لـ Supabase بعد)
        const localLessons = progress.completedLessons.length;
        const localChallenges = progress.completedChallenges.length;

        if (
          localLessons > realCompletedLessons &&
          localLessons <= realCompletedLessons + 1
        ) {
          realCompletedLessons = localLessons;
        }
        if (
          localChallenges > realCompletedChallenges &&
          localChallenges <= realCompletedChallenges + 1
        ) {
          realCompletedChallenges = localChallenges;
        }
        realTotalXP = Math.max(realTotalXP, progress.totalXP);
      }

      const context: BadgeCheckContext = {
        completedChallenges: realCompletedChallenges,
        completedLessons: realCompletedLessons,
        completedCourses: progress.completedCourses.length,
        totalXP: realTotalXP,
        currentLevel: progressService.calculateLevel(realTotalXP),
        currentStreak: progress.currentStreak,
        hardChallengesCompleted: hardCount,
        challengesWithoutHints: noHintCount,
        challengeStreak,
        lifetimeCoins,
        unlockedCourses: unlockedCoursesCount,
        hasUnlockedWithCoins,
        isComeback,
        hasCourse100Percent: false,
        ...extra,
      };

      console.log('🔍 Badge context built:', context);

      return context;
    },
    [lifetimeCoins, unlockedCoursesCount, hasUnlockedWithCoins, userId]
  );

  // ===== فحص الشارات =====
  const checkBadges = useCallback(
    async (
      extraContext?: Partial<BadgeCheckContext>
    ): Promise<BadgeDefinition[]> => {
      const context = await buildContext(extraContext);
      const newBadges = await badgeService.checkAndAwardBadges(context);

      if (newBadges.length > 0) {
        const ids = await badgeService.getEarnedBadgeIds();
        setEarnedBadgeIds(ids);
      }

      return newBadges;
    },
    [buildContext]
  );

  // ===== ربط checkBadges مع useProgressWithPoints =====
  useEffect(() => {
    setCheckBadgesFn(checkBadges);
    setHybridCheckBadgesRef(checkBadges);
    return () => {
      setCheckBadgesFn(null);
      setHybridCheckBadgesRef(null);
    };
  }, [checkBadges]);

  // ===== إدارة الإشعارات =====
  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    const notifs = await notificationService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    const notifs = await notificationService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const notifs = await notificationService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  }, []);

  const refreshBadges = useCallback(async () => {
    const ids = await badgeService.getEarnedBadgeIds();
    setEarnedBadgeIds(ids);
  }, []);

  const value: BadgeContextType = {
    earnedBadgeIds,
    earnedCount: earnedBadgeIds.length,
    totalCount: badgeService.getTotalCount(),
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    checkBadges,
    refreshNotifications,
    refreshBadges,
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
      {bannerBadges.length > 0 && <BadgeBanner badges={bannerBadges} onClose={() => setBannerBadges([])} />}
    </BadgeContext.Provider>
  );
}

// ===== Hook =====
export function useBadges() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
}
