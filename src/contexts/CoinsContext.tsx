/**
 * Coins Context — نظام الكوينات المجاني
 *
 * الكوينات تُكتسب فقط (مكافآت يومية، تحديات، إكمال دورات، إعلانات اختيارية)
 * وتُستخدم لفتح الدورات المتقدمة. لا يوجد أي شراء بالمال.
 * كل العمليات تتم على السيرفر عبر coinService.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {
  coinService,
  CoinResult,
  CoinState,
  CourseCatalogEntry,
} from '@/services/coinService';
import {
  isRewardedAdsSupported,
  watchRewardedAd,
  RewardedAdResult,
} from '@/services/rewardedAds';
import { hybridSyncService } from '@/services/hybridSyncService';

interface CoinsContextType {
  balance: number;
  state: CoinState | null;
  isLoading: boolean;
  /** فشل آخر تحميل (بدون إنترنت مثلاً) */
  loadError: string | null;
  unlockedCourses: string[];
  isCourseUnlocked: (courseId: string) => boolean;
  /** سعر فتح الدورة من السيرفر (أو السعر المحلي كاحتياط) */
  getCourseCost: (courseId: string, fallback: number) => number;
  refresh: () => Promise<void>;
  unlockCourse: (courseId: string) => Promise<CoinResult>;
  unlockField: (fieldId: string) => Promise<CoinResult>;
  claimDailyReward: () => Promise<CoinResult>;
  watchAd: () => Promise<RewardedAdResult>;
  rewardChallenge: (
    challengeId: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => Promise<CoinResult>;
  rewardCourseCompletion: (courseId: string) => Promise<CoinResult>;
  adsSupported: boolean;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

export function CoinsProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const [state, setState] = useState<CoinState | null>(null);
  const [catalog, setCatalog] = useState<Record<string, CourseCatalogEntry>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const userRef = useRef(userId);
  userRef.current = userId;

  const refresh = useCallback(async () => {
    if (!userId) {
      setState(null);
      setIsLoading(false);
      return;
    }
    const { state: next, code } = await coinService.getState();
    if (userRef.current !== userId) return; // تغيّر المستخدم أثناء التحميل
    if (next) {
      setState(next);
      setLoadError(null);
    } else {
      setLoadError(code || 'unknown');
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    setState(null);
    refresh();
  }, [refresh]);

  // الأسعار من السيرفر (ثابتة، يغيّرها المسؤول فقط)
  useEffect(() => {
    let alive = true;
    coinService.getCatalog().then((rows) => {
      if (!alive || rows.length === 0) return;
      const map: Record<string, CourseCatalogEntry> = {};
      rows.forEach((r) => (map[r.course_id] = r));
      setCatalog(map);
    });
    return () => {
      alive = false;
    };
  }, []);

  const unlockedCourses = state?.unlockedCourses ?? [];

  const isCourseUnlocked = useCallback(
    (courseId: string) => unlockedCourses.includes(courseId),
    [unlockedCourses]
  );

  const getCourseCost = useCallback(
    (courseId: string, fallback: number) =>
      catalog[courseId]?.unlock_cost ?? fallback,
    [catalog]
  );

  const afterMutation = useCallback(
    async (res: CoinResult) => {
      if (res.success || res.balance !== undefined) {
        // تحديث متفائل للرصيد ثم مزامنة كاملة
        if (typeof res.balance === 'number') {
          setState((s) => (s ? { ...s, balance: res.balance as number } : s));
        }
        await refresh();
      }
      return res;
    },
    [refresh]
  );

  const unlockCourse = useCallback(
    async (courseId: string) => {
      const res = await coinService.unlockCourse(courseId);
      if (res.success) hybridSyncService.invalidateUnlock(courseId);
      return afterMutation(res);
    },
    [afterMutation]
  );

  const unlockField = useCallback(
    async (fieldId: string) => {
      const res = await coinService.unlockField(fieldId);
      if (res.success && Array.isArray(res.courses)) {
        res.courses.forEach((c: string) =>
          hybridSyncService.invalidateUnlock(c)
        );
      }
      return afterMutation(res);
    },
    [afterMutation]
  );

  const claimDailyReward = useCallback(
    async () => afterMutation(await coinService.claimDailyReward()),
    [afterMutation]
  );

  const watchAd = useCallback(async () => {
    const res = await watchRewardedAd();
    await refresh();
    return res;
  }, [refresh]);

  const rewardChallenge = useCallback(
    async (challengeId: string, difficulty: 'easy' | 'medium' | 'hard') =>
      afterMutation(await coinService.rewardChallenge(challengeId, difficulty)),
    [afterMutation]
  );

  const rewardCourseCompletion = useCallback(
    async (courseId: string) =>
      afterMutation(await coinService.rewardCourseCompletion(courseId)),
    [afterMutation]
  );

  const value = useMemo<CoinsContextType>(
    () => ({
      balance: state?.balance ?? 0,
      state,
      isLoading,
      loadError,
      unlockedCourses,
      isCourseUnlocked,
      getCourseCost,
      refresh,
      unlockCourse,
      unlockField,
      claimDailyReward,
      watchAd,
      rewardChallenge,
      rewardCourseCompletion,
      adsSupported: isRewardedAdsSupported(),
    }),
    [
      state,
      isLoading,
      loadError,
      unlockedCourses,
      isCourseUnlocked,
      getCourseCost,
      refresh,
      unlockCourse,
      unlockField,
      claimDailyReward,
      watchAd,
      rewardChallenge,
      rewardCourseCompletion,
    ]
  );

  return (
    <CoinsContext.Provider value={value}>{children}</CoinsContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinsContext);
  if (context === undefined) {
    throw new Error('useCoins must be used within a CoinsProvider');
  }
  return context;
}
