/**
 * followService.ts
 * خدمة نظام المتابعة - Follow/Unfollow System
 */

import { supabase } from '@/lib/supabase';
import { notificationService } from './notificationService';

// ===== أنواع البيانات =====
export interface FollowInfo {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
}

// ===== خدمة المتابعة =====

/**
 * متابعة مستخدم
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (followerId === followingId) {
      return { success: false, error: 'لا يمكنك متابعة نفسك' };
    }

    const { error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      if (error.code === '23505') {
        // unique violation - already following
        return { success: false, error: 'أنت تتابع هذا المستخدم بالفعل' };
      }
      throw error;
    }

    // إشعار المتابعة (داخل التطبيق + push) يُنشئه السيرفر تلقائياً عبر trigger على follows

    return { success: true, error: null };
  } catch (error) {
    console.error('followUser error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في المتابعة',
    };
  }
}

/**
 * إلغاء متابعة مستخدم
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('unfollowUser error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إلغاء المتابعة',
    };
  }
}

/**
 * التحقق إذا كان المستخدم يتابع شخصاً معيناً
 */
export async function checkIsFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch {
    return false;
  }
}

/**
 * جلب معلومات المتابعة لمستخدم معين
 */
export async function getFollowInfo(
  userId: string,
  currentUserId?: string
): Promise<FollowInfo> {
  try {
    // جلب العدادات من جدول profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('followers_count, following_count')
      .eq('id', userId)
      .single();

    if (error) throw error;

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      isFollowing = await checkIsFollowing(currentUserId, userId);
    }

    return {
      followersCount: profile?.followers_count || 0,
      followingCount: profile?.following_count || 0,
      isFollowing,
    };
  } catch {
    return { followersCount: 0, followingCount: 0, isFollowing: false };
  }
}

/**
 * جلب قائمة المتابعين
 */
export async function getFollowers(
  userId: string,
  limit = 50
): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        follower_id,
        profiles:follower_id (id, username, full_name, avatar_url, level, is_verified)
      `
      )
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((d: any) => ({
      id: d.profiles.id,
      username: d.profiles.username,
      full_name: d.profiles.full_name,
      avatar_url: d.profiles.avatar_url,
      level: d.profiles.level,
    }));
  } catch {
    return [];
  }
}

/**
 * جلب قائمة المتابَعين
 */
export async function getFollowing(
  userId: string,
  limit = 50
): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        following_id,
        profiles:following_id (id, username, full_name, avatar_url, level, is_verified)
      `
      )
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((d: any) => ({
      id: d.profiles.id,
      username: d.profiles.username,
      full_name: d.profiles.full_name,
      avatar_url: d.profiles.avatar_url,
      level: d.profiles.level,
    }));
  } catch {
    return [];
  }
}

/**
 * التحقق من متابعة عدة مستخدمين دفعة واحدة
 */
export async function checkBatchFollowing(
  followerId: string,
  userIds: string[]
): Promise<Set<string>> {
  try {
    if (!userIds.length) return new Set();

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerId)
      .in('following_id', userIds);

    if (error) throw error;

    return new Set((data || []).map((d: any) => d.following_id));
  } catch {
    return new Set();
  }
}

/**
 * Toggle follow/unfollow
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean; error: string | null }> {
  const isCurrentlyFollowing = await checkIsFollowing(followerId, followingId);

  if (isCurrentlyFollowing) {
    const result = await unfollowUser(followerId, followingId);
    return { isFollowing: false, error: result.error };
  } else {
    const result = await followUser(followerId, followingId);
    return { isFollowing: result.success, error: result.error };
  }
}
