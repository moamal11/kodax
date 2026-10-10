import { supabase } from '@/lib/supabase';
export interface FollowInfo { followersCount: number; followingCount: number; isFollowing: boolean }
export interface FollowUser { id: string; username: string; full_name: string; avatar_url: string | null; level: number }
const message = (error: any) => error?.message?.includes('private_list') ? 'هذه القائمة خاصة' : error?.message?.includes('blocked') ? 'لا يمكن متابعة هذا الحساب' : 'تعذّر الاتصال. حاول مرة أخرى.';
async function setFollow(followerId: string, target: string, follow: boolean) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user.id !== followerId) return { success: false, error: 'سجّل الدخول أولًا' };
  const { error } = await supabase.rpc('set_follow', { p_target: target, p_follow: follow });
  return { success: !error, error: error ? message(error) : null };
}
export const followUser = (followerId: string, target: string) => setFollow(followerId, target, true);
export const unfollowUser = (followerId: string, target: string) => setFollow(followerId, target, false);
export async function checkBatchFollowing(followerId: string, userIds: string[]): Promise<Set<string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!userIds.length || session?.user.id !== followerId) return new Set();
  const { data, error } = await supabase.rpc('my_following', { p_targets: userIds });
  if (error) throw new Error(message(error));
  return new Set((data || []).map((r: { following_id: string }) => r.following_id));
}
export async function checkIsFollowing(followerId: string, target: string): Promise<boolean> {
  try { return (await checkBatchFollowing(followerId, [target])).has(target); } catch { return false; }
}
export async function getFollowInfo(userId: string, currentUserId?: string): Promise<FollowInfo> {
  const { data } = await supabase.from('profiles').select('followers_count,following_count').eq('id', userId).single();
  return { followersCount: data?.followers_count || 0, followingCount: data?.following_count || 0,
    isFollowing: currentUserId ? await checkIsFollowing(currentUserId, userId) : false };
}
export async function getFollowList(userId: string, kind: 'followers' | 'following', limit = 50): Promise<FollowUser[]> {
  const { data, error } = await supabase.rpc('profile_follow_list', { p_user: userId, p_kind: kind, p_limit: limit });
  if (error) throw new Error(message(error));
  return data || [];
}
export const getFollowers = (userId: string, limit = 50) => getFollowList(userId, 'followers', limit);
export const getFollowing = (userId: string, limit = 50) => getFollowList(userId, 'following', limit);
export async function toggleFollow(followerId: string, target: string) {
  const previous = await checkIsFollowing(followerId, target);
  const result = await setFollow(followerId, target, !previous);
  return { isFollowing: result.success ? !previous : previous, error: result.error };
}
