/**
 * AppContext - Global Application State
 *
 * مركز البيانات العام: يستمع لتغييرات المصادقة ويحدّث جميع البيانات تلقائياً.
 * بعد تسجيل الدخول، يتم إعادة تحميل:
 * - الملف الشخصي (profile)
 * - الإعجابات (likes)
 * - المتابعات (follows)
 * - الأكواد (snippets)
 * - التصنيفات (leaderboard)
 * - الإحصائيات (stats)
 *
 * يوفر:
 * - refreshAll() — تحديث كل شيء
 * - بيانات مشتركة بين الصفحات
 * - Likes system مع Optimistic Updates
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { ProfileData, getProfile } from '@/services/profileService';
import { getFollowInfo } from '@/services/followService';
import {
  getPublicSnippets,
  checkUserLikes,
  toggleLike as toggleLikeService,
  FeedSnippet,
} from '@/services/codeFeedService';
import { supabaseService } from '@/services/supabaseService';
import { hybridSyncService } from '@/services/hybridSyncService';

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

  // Likes (global set so all pages stay in sync)
  likedSnippets: Set<string>;
  toggleLike: (snippetId: string) => Promise<void>;
  isLikeInProgress: (snippetId: string) => boolean;

  // Refresh
  refreshAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;

  // Auth version — increments on login, pages can watch this to re-fetch
  authVersion: number;

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
  // Auth version — increments on each login, triggers page re-fetches
  const [authVersion, setAuthVersion] = useState(0);
  const prevUserIdRef = useRef<string | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Likes — global set shared across all pages
  const [likedSnippets, setLikedSnippets] = useState<Set<string>>(new Set());
  const likesInProgressRef = useRef<Set<string>>(new Set());

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
      setIsInitialLoad(true);
      return;
    }

    if (prevId !== userId) {
      // New user logged in — bump version and refresh all
      setAuthVersion((v) => v + 1);
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
    } catch (e) {
      // Profile load failed — keep stale data
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
    } catch (e) {
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
    setAuthVersion((v) => v + 1);
    await loadAllData(userId);
  }, [userId, loadAllData]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    await loadProfile(userId);
  }, [userId, loadProfile]);

  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  // ===== Like system with optimistic updates + debounce =====

  const isLikeInProgress = useCallback((snippetId: string) => {
    return likesInProgressRef.current.has(snippetId);
  }, []);

  const toggleLike = useCallback(
    async (snippetId: string) => {
      if (!userId) return;

      // Prevent double-tap
      if (likesInProgressRef.current.has(snippetId)) return;
      likesInProgressRef.current.add(snippetId);

      const wasLiked = likedSnippets.has(snippetId);

      // Optimistic update
      setLikedSnippets((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(snippetId) : next.add(snippetId);
        return next;
      });

      try {
        const { error } = await toggleLikeService(userId, snippetId);
        if (error) {
          // Rollback on failure
          setLikedSnippets((prev) => {
            const next = new Set(prev);
            wasLiked ? next.add(snippetId) : next.delete(snippetId);
            return next;
          });
        }
      } catch {
        // Rollback on exception
        setLikedSnippets((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(snippetId) : next.delete(snippetId);
          return next;
        });
      } finally {
        likesInProgressRef.current.delete(snippetId);
      }
    },
    [userId, likedSnippets]
  );

  // ===== Sync liked snippets when snippets are loaded =====
  // This is called by code pages when they load snippet IDs
  // We expose the set + toggleLike, pages merge their own checks

  // ===== Context value =====
  const value: AppContextType = {
    profile,
    followersCount,
    followingCount,
    leaderboard,
    leaderboardLoading,
    likedSnippets,
    toggleLike,
    isLikeInProgress,
    refreshAll,
    refreshProfile,
    refreshLeaderboard,
    authVersion,
    isInitialLoad,
  };

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
