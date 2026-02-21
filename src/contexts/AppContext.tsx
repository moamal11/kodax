/**
 * AppContext - Global Application State
 *
 * مركز البيانات العام: يعتمد على AuthContext ويحدّث جميع البيانات تلقائياً.
 * بعد تسجيل الدخول، يتم إعادة تحميل:
 * - الملف الشخصي (profile)
 * - الإعجابات (likes) — مع Optimistic Updates ومزامنة بين الصفحات
 * - التصنيفات (leaderboard)
 *
 * يوفر:
 * - refreshAll() — تحديث كل شيء
 * - نظام Like مركزي مع:
 *   - Optimistic UI Update
 *   - Rollback عند الفشل
 *   - منع الضغط المتكرر (debounce)
 *   - مزامنة بين جميع الصفحات عبر likedSnippets + snippetLikeCounts
 *   - Toggle Like (إضافة/إزالة)
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { ProfileData, getProfile } from '@/services/profileService';
import {
  checkUserLikes,
  toggleLike as toggleLikeService,
} from '@/services/codeFeedService';
import { supabaseService } from '@/services/supabaseService';

// ===== Types =====

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  province?: string;
  level?: number;
}

interface AppContextType {
  // Profile
  profile: ProfileData | null;
  followersCount: number;
  followingCount: number;

  // Leaderboard
  leaderboard: LeaderboardUser[];
  leaderboardLoading: boolean;

  // ===== نظام اللايكات المركزي =====
  /** مجموعة الأكواد التي أعجب بها المستخدم */
  likedSnippets: Set<string>;
  /** عدد اللايكات لكل كود — يتم تحديثها تلقائياً */
  snippetLikeCounts: Map<string, number>;
  /** Toggle Like مع Optimistic Update + Rollback */
  toggleLike: (snippetId: string) => Promise<void>;
  /** هل عملية اللايك جارية لهذا الكود؟ */
  isLikeInProgress: (snippetId: string) => boolean;
  /** تحميل حالة اللايكات لقائمة أكواد (تُستدعى عند تحميل الأكواد في أي صفحة) */
  syncLikes: (snippetIds: string[]) => Promise<void>;
  /** تحديث عدد اللايكات يدوياً (عند تحميل الأكواد) */
  updateLikeCounts: (counts: Record<string, number>) => void;
  /** الحصول على عدد اللايكات لكود معين */
  getLikeCount: (snippetId: string, fallback?: number) => number;

  // Refresh
  refreshAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;

  // Loading
  isInitialLoad: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ===== Provider =====

interface AppProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AppProvider({ children, userId }: AppProviderProps) {
  const prevUserIdRef = useRef<string | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ===== نظام اللايكات المركزي =====
  const [likedSnippets, setLikedSnippets] = useState<Set<string>>(new Set());
  const [snippetLikeCounts, setSnippetLikeCounts] = useState<
    Map<string, number>
  >(new Map());
  const likesInProgressRef = useRef<Set<string>>(new Set());
  const likeCooldownRef = useRef<Set<string>>(new Set());

  // ===== Detect user change (login/logout/switch) =====
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!userId) {
      // Logged out — clear everything
      setProfile(null);
      setFollowersCount(0);
      setFollowingCount(0);
      setLeaderboard([]);
      setLikedSnippets(new Set());
      setSnippetLikeCounts(new Map());
      setIsInitialLoad(true);
      return;
    }

    if (prevId !== userId) {
      // New user logged in — refresh all
      loadAllData(userId);
    }
  }, [userId]);

  // ===== Data loaders =====

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const { data } = await getProfile(uid);
      if (data) {
        setProfile(data);
        setFollowersCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);
      }
    } catch (_e) {
      // Keep stale data
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const data = await supabaseService.getLeaderboard(50);
      const formatted: LeaderboardUser[] = data.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.username || 'مستخدم',
        avatar: u.avatar_url,
        xp: u.xp || 0,
        province: u.province,
        level: u.level,
      }));
      setLeaderboard(formatted);
    } catch (_e) {
      // Keep stale data
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const loadAllData = useCallback(
    async (uid: string) => {
      setIsInitialLoad(true);
      try {
        await Promise.all([loadProfile(uid), loadLeaderboard()]);
      } finally {
        setIsInitialLoad(false);
      }
    },
    [loadProfile, loadLeaderboard]
  );

  // ===== Public refresh functions =====

  const refreshAll = useCallback(async () => {
    if (!userId) return;
    await loadAllData(userId);
  }, [userId, loadAllData]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    await loadProfile(userId);
  }, [userId, loadProfile]);

  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  // ===== نظام اللايكات المركزي =====

  /**
   * syncLikes — تحميل حالة اللايكات لقائمة أكواد
   * تُستدعى عند تحميل الأكواد في أي صفحة
   */
  const syncLikes = useCallback(
    async (snippetIds: string[]) => {
      if (!userId || snippetIds.length === 0) return;
      try {
        const liked = await checkUserLikes(userId, snippetIds);
        setLikedSnippets((prev) => {
          const next = new Set(prev);
          for (const id of snippetIds) {
            if (liked.has(id)) {
              next.add(id);
            } else {
              next.delete(id);
            }
          }
          return next;
        });
      } catch (_e) {
        // Silent — لا نريد كسر تحميل الأكواد
      }
    },
    [userId]
  );

  /**
   * updateLikeCounts — تحديث عدد اللايكات لأكواد محملة
   * تُستدعى عند تحميل الأكواد مع counts
   */
  const updateLikeCounts = useCallback((counts: Record<string, number>) => {
    setSnippetLikeCounts((prev) => {
      const next = new Map(prev);
      for (const [id, count] of Object.entries(counts)) {
        next.set(id, count);
      }
      return next;
    });
  }, []);

  /**
   * getLikeCount — الحصول على عدد اللايكات مع fallback
   */
  const getLikeCount = useCallback(
    (snippetId: string, fallback = 0): number => {
      return snippetLikeCounts.get(snippetId) ?? fallback;
    },
    [snippetLikeCounts]
  );

  /**
   * isLikeInProgress — هل عملية اللايك جارية؟
   */
  const isLikeInProgress = useCallback((snippetId: string) => {
    return likesInProgressRef.current.has(snippetId);
  }, []);

  /**
   * toggleLike — Toggle Like مع:
   * 1. Optimistic UI Update (فوري)
   * 2. إرسال الطلب إلى Supabase
   * 3. Rollback إذا فشل
   * 4. منع الضغط المتكرر (cooldown 400ms + in-progress lock)
   * 5. تحديث العدد في جميع الصفحات
   */
  const toggleLike = useCallback(
    async (snippetId: string) => {
      if (!userId) return;

      // ===== منع الضغط المتكرر =====
      if (likesInProgressRef.current.has(snippetId)) return;
      if (likeCooldownRef.current.has(snippetId)) return;

      likesInProgressRef.current.add(snippetId);
      likeCooldownRef.current.add(snippetId);
      setTimeout(() => likeCooldownRef.current.delete(snippetId), 400);

      const wasLiked = likedSnippets.has(snippetId);
      const delta = wasLiked ? -1 : 1;

      // ===== Optimistic Update — فوري =====
      setLikedSnippets((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(snippetId) : next.add(snippetId);
        return next;
      });
      setSnippetLikeCounts((prev) => {
        const next = new Map(prev);
        const current = next.get(snippetId) ?? 0;
        next.set(snippetId, Math.max(0, current + delta));
        return next;
      });

      try {
        const result = await toggleLikeService(userId, snippetId);
        if (result.error) {
          // ===== Rollback =====
          setLikedSnippets((prev) => {
            const next = new Set(prev);
            wasLiked ? next.add(snippetId) : next.delete(snippetId);
            return next;
          });
          setSnippetLikeCounts((prev) => {
            const next = new Map(prev);
            const current = next.get(snippetId) ?? 0;
            next.set(snippetId, Math.max(0, current - delta));
            return next;
          });
        } else {
          // تحديث العدد الحقيقي من السيرفر
          setSnippetLikeCounts((prev) => {
            const next = new Map(prev);
            next.set(snippetId, result.newCount);
            return next;
          });
        }
      } catch {
        // ===== Rollback on exception =====
        setLikedSnippets((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(snippetId) : next.delete(snippetId);
          return next;
        });
        setSnippetLikeCounts((prev) => {
          const next = new Map(prev);
          const current = next.get(snippetId) ?? 0;
          next.set(snippetId, Math.max(0, current - delta));
          return next;
        });
      } finally {
        likesInProgressRef.current.delete(snippetId);
      }
    },
    [userId, likedSnippets, snippetLikeCounts]
  );

  // ===== Context value =====
  const value = useMemo<AppContextType>(
    () => ({
      profile,
      followersCount,
      followingCount,
      leaderboard,
      leaderboardLoading,
      likedSnippets,
      snippetLikeCounts,
      toggleLike,
      isLikeInProgress,
      syncLikes,
      updateLikeCounts,
      getLikeCount,
      refreshAll,
      refreshProfile,
      refreshLeaderboard,
      isInitialLoad,
    }),
    [
      profile,
      followersCount,
      followingCount,
      leaderboard,
      leaderboardLoading,
      likedSnippets,
      snippetLikeCounts,
      toggleLike,
      isLikeInProgress,
      syncLikes,
      updateLikeCounts,
      getLikeCount,
      refreshAll,
      refreshProfile,
      refreshLeaderboard,
      isInitialLoad,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ===== Hook =====

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
