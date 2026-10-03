/**
 * Code Feed Service - خدمة فيد الأكواد
 * Handles fetching, liking, commenting on public code snippets
 */

import { supabase } from '@/lib/supabase';

// Simple UUID v4 generator (no external dependency needed)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==================== Types ====================

export interface FeedSnippet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_public: boolean;
  is_hidden?: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean;
  } | null;
}

export interface SnippetComment {
  id: string;
  user_id: string;
  snippet_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean;
  } | null;
}

export interface FeedOptions {
  language?: string;
  search?: string;
  sortBy?:
    'recent' | 'popular' | 'most_liked' | 'most_viewed' | 'most_commented';
  page?: number;
  limit?: number;
  userId?: string;
}

// ==================== Feed Operations ====================

/**
 * Fetch public code snippets for the feed
 */
export async function getPublicSnippets(
  options?: FeedOptions
): Promise<{ data: FeedSnippet[]; error: string | null }> {
  try {
    const page = options?.page || 0;
    const limit = options?.limit || 20;
    const offset = page * limit;
    const sortBy = options?.sortBy || 'recent';

    let query = supabase
      .from('code_snippets')
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url, is_verified)
      `
      )
      .eq('is_public', true);

    // إضافة فلتر اللغة (مع دعم web = html/css)
    if (options?.language && options.language !== 'all') {
      if (options.language === 'web') {
        // web يشمل html و css
        query = query.in('language', ['html', 'css', 'web']);
      } else {
        query = query.eq('language', options.language);
      }
    }

    // فلتر البحث
    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }

    // فلتر المستخدم
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    // ترتيب النتائج حسب نوع الفلتر
    switch (sortBy) {
      case 'popular':
        // شعبية = مزيج من الإعجابات والمشاهدات والتعليقات
        query = query.order('likes_count', { ascending: false });
        break;
      case 'most_liked':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'most_viewed':
        query = query.order('views_count', { ascending: false });
        break;
      case 'most_commented':
        query = query.order('comments_count', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // إضافة ترتيب ثانوي بتاريخ الإنشاء
    if (sortBy !== 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    // إخفاء أكواد المستخدمين المحظورين
    const blocked = await getBlockedUserIds();
    if (blocked.length > 0) {
      query = query.not('user_id', 'in', `(${blocked.join(',')})`);
    }

    // تطبيق pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('getPublicSnippets error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'فشل تحميل الأكواد',
    };
  }
}

/**
 * Fetch a single snippet by ID with author info
 */
export async function getSnippetById(
  id: string
): Promise<{ data: FeedSnippet | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('code_snippets')
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url, is_verified)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('getSnippetById error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'فشل تحميل الكود',
    };
  }
}

/**
 * Fetch user's own snippets (drafts + published)
 */
export async function getUserSnippets(
  userId: string
): Promise<{ data: FeedSnippet[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('code_snippets')
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url, is_verified)
      `
      )
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('getUserSnippets error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'فشل تحميل أكوادك',
    };
  }
}

// ==================== Like Operations ====================

/**
 * Get accurate like counts for multiple snippets at once
 * Fetches directly from code_snippets table to ensure we have the latest counts
 * (not relying on potentially stale likes_count from initial fetch)
 */
export async function getSnippetLikeCounts(
  snippetIds: string[]
): Promise<Record<string, number>> {
  try {
    if (!snippetIds.length) return {};

    const { data, error } = await supabase
      .from('code_snippets')
      .select('id, likes_count')
      .in('id', snippetIds);

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((s: any) => {
      counts[s.id] = s.likes_count || 0;
    });
    return counts;
  } catch (error) {
    console.error('getSnippetLikeCounts error:', error);
    return {};
  }
}

/**
 * Get accurate likes, views, and comments counts for multiple snippets
 * Fetches all three in a single query for efficiency
 */
export async function getSnippetCounts(snippetIds: string[]): Promise<{
  likeCounts: Record<string, number>;
  viewCounts: Record<string, number>;
  commentCounts: Record<string, number>;
}> {
  try {
    if (!snippetIds.length) {
      return {
        likeCounts: {},
        viewCounts: {},
        commentCounts: {},
      };
    }

    const { data, error } = await supabase
      .from('code_snippets')
      .select('id, likes_count, views_count, comments_count')
      .in('id', snippetIds);

    if (error) throw error;

    const likeCounts: Record<string, number> = {};
    const viewCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};

    // Base fallback from code_snippets (fast + safe)
    (data || []).forEach((s: any) => {
      likeCounts[s.id] = s.likes_count || 0;
      viewCounts[s.id] = s.views_count || 0;
      commentCounts[s.id] = s.comments_count || 0;
    });

    // For views/comments we prefer source-of-truth tables because
    // denormalized fields can be stale in some flows.
    try {
      const { data: viewsData, error: viewsError } = await supabase
        .from('code_views')
        .select('snippet_id')
        .in('snippet_id', snippetIds);

      if (!viewsError) {
        for (const id of snippetIds) {
          viewCounts[id] = 0;
        }

        (viewsData || []).forEach((row: any) => {
          const snippetId = row.snippet_id as string;
          viewCounts[snippetId] = (viewCounts[snippetId] || 0) + 1;
        });
      }
    } catch (_e) {
      // Keep fallback from code_snippets
    }

    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('code_comments')
        .select('snippet_id')
        .in('snippet_id', snippetIds);

      if (!commentsError) {
        for (const id of snippetIds) {
          commentCounts[id] = 0;
        }

        (commentsData || []).forEach((row: any) => {
          const snippetId = row.snippet_id as string;
          commentCounts[snippetId] = (commentCounts[snippetId] || 0) + 1;
        });
      }
    } catch (_e) {
      // Keep fallback from code_snippets
    }

    return { likeCounts, viewCounts, commentCounts };
  } catch (error) {
    console.error('getSnippetCounts error:', error);
    return {
      likeCounts: {},
      viewCounts: {},
      commentCounts: {},
    };
  }
}

/**
 * Check which snippets the user has liked (batch)
 */
export async function checkUserLikes(
  userId: string,
  snippetIds: string[]
): Promise<Set<string>> {
  try {
    if (!snippetIds.length) return new Set();

    const { data, error } = await supabase
      .from('code_likes')
      .select('snippet_id')
      .eq('user_id', userId)
      .in('snippet_id', snippetIds);

    if (error) throw error;

    return new Set((data || []).map((d: any) => d.snippet_id));
  } catch {
    return new Set();
  }
}

/**
 * Toggle like on a snippet
 */
export async function toggleLike(
  userId: string,
  snippetId: string
): Promise<{ liked: boolean; newCount: number; error: string | null }> {
  try {
    const { data: existing } = await supabase
      .from('code_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('snippet_id', snippetId)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from('code_likes').delete().eq('id', existing.id);
    } else {
      // Like - generate UUID client-side to avoid server-side uuid_generate_v4() error
      const likeId = generateUUID();
      await supabase
        .from('code_likes')
        .insert({ id: likeId, user_id: userId, snippet_id: snippetId });
    }

    // Get accurate count
    const { count } = await supabase
      .from('code_likes')
      .select('*', { count: 'exact', head: true })
      .eq('snippet_id', snippetId);

    const newCount = count || 0;

    // Update snippet's likes_count
    await supabase
      .from('code_snippets')
      .update({ likes_count: newCount })
      .eq('id', snippetId);

    return { liked: !existing, newCount, error: null };
  } catch (error) {
    console.error('toggleLike error:', error);
    return {
      liked: false,
      newCount: 0,
      error: error instanceof Error ? error.message : 'فشل تحديث الإعجاب',
    };
  }
}

// ==================== Comment Operations ====================

/**
 * Fetch comments for a snippet
 */
export async function getComments(
  snippetId: string
): Promise<{ data: SnippetComment[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('code_comments')
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url, is_verified)
      `
      )
      .eq('snippet_id', snippetId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('getComments error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'فشل تحميل التعليقات',
    };
  }
}

/**
 * Add a comment to a snippet
 */
export async function addComment(
  userId: string,
  snippetId: string,
  content: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Generate UUID client-side to avoid server-side uuid_generate_v4() error
    const commentId = generateUUID();
    const { error } = await supabase.from('code_comments').insert({
      id: commentId,
      user_id: userId,
      snippet_id: snippetId,
      content,
    });

    if (error) throw error;

    // Update comment count
    const { count } = await supabase
      .from('code_comments')
      .select('*', { count: 'exact', head: true })
      .eq('snippet_id', snippetId);

    await supabase
      .from('code_snippets')
      .update({ comments_count: count || 0 })
      .eq('id', snippetId);

    return { success: true, error: null };
  } catch (error) {
    console.error('addComment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل إضافة التعليق',
    };
  }
}

// ==================== Snippet CRUD ====================

/**
 * Save a new code snippet
 */
export async function createSnippet(snippet: {
  userId: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  isPublic: boolean;
}): Promise<{ id: string | null; error: string | null }> {
  try {
    // Generate UUID client-side
    const snippetId = generateUUID();
    const { data, error } = await supabase
      .from('code_snippets')
      .insert({
        id: snippetId,
        user_id: snippet.userId,
        title: snippet.title,
        description: snippet.description || null,
        code: snippet.code,
        language: snippet.language,
        is_public: snippet.isPublic,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { id: data.id, error: null };
  } catch (error) {
    console.error('createSnippet error:', error);
    return {
      id: null,
      error: error instanceof Error ? error.message : 'فشل حفظ الكود',
    };
  }
}

/**
 * Increment views for a snippet (once per user)
 * If userId is provided, only counts view once per user.
 * Falls back to always-increment if no userId (anonymous).
 */
export async function incrementViews(
  snippetId: string,
  userId?: string
): Promise<void> {
  try {
    if (userId) {
      // Check if user already viewed this snippet
      const { data: existingView } = await supabase
        .from('code_views')
        .select('id')
        .eq('user_id', userId)
        .eq('snippet_id', snippetId)
        .maybeSingle();

      if (existingView) {
        // User already viewed - don't increment
        return;
      }

      // Record the view - generate UUID client-side
      const viewId = generateUUID();
      await supabase
        .from('code_views')
        .insert({ id: viewId, user_id: userId, snippet_id: snippetId });

      // Increment the views_count
      const { data } = await supabase
        .from('code_snippets')
        .select('views_count')
        .eq('id', snippetId)
        .single();

      if (data) {
        await supabase
          .from('code_snippets')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', snippetId);
      }
    } else {
      // No user - increment anyway (fallback)
      const { data } = await supabase
        .from('code_snippets')
        .select('views_count')
        .eq('id', snippetId)
        .single();

      if (data) {
        await supabase
          .from('code_snippets')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', snippetId);
      }
    }
  } catch (error) {
    console.error('incrementViews error:', error);
  }
}

/**
 * Update an existing snippet (only owner can update)
 */
export async function updateSnippet(
  snippetId: string,
  updates: {
    title?: string;
    description?: string;
    code?: string;
    language?: string;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('code_snippets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', snippetId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('updateSnippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل تحديث الكود',
    };
  }
}

/**
 * Delete a snippet (only owner can delete)
 */
export async function deleteSnippet(
  snippetId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('code_snippets')
      .delete()
      .eq('id', snippetId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('deleteSnippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل حذف الكود',
    };
  }
}

// ==================== Moderation (UGC) ====================

export type ReportReason =
  'spam' | 'phishing' | 'malicious' | 'offensive' | 'copyright' | 'other';

export const REPORT_REASONS: Array<{ id: ReportReason; label: string }> = [
  { id: 'phishing', label: 'صفحة احتيال / سرقة بيانات' },
  { id: 'malicious', label: 'كود ضار' },
  { id: 'offensive', label: 'محتوى مسيء أو غير لائق' },
  { id: 'spam', label: 'سبام أو إعلانات' },
  { id: 'copyright', label: 'انتهاك حقوق' },
  { id: 'other', label: 'سبب آخر' },
];

/**
 * الإبلاغ عن كود/مشروع منشور. بلاغ واحد لا يخفي المحتوى؛ بلاغات من عدة حسابات مؤهلة
 * تخفيه مؤقتاً لحين مراجعة المشرف (على السيرفر).
 */
export type UserReportReason = 'spam' | 'harassment' | 'offensive' | 'phishing' | 'impersonation' | 'other';

export const USER_REPORT_REASONS: Array<{ id: UserReportReason; label: string }> = [
  { id: 'harassment', label: 'تحرش أو تهديد' },
  { id: 'offensive', label: 'محتوى مسيء أو غير لائق' },
  { id: 'spam', label: 'رسائل مزعجة أو إعلانات' },
  { id: 'phishing', label: 'احتيال أو محاولة سرقة بيانات' },
  { id: 'impersonation', label: 'انتحال شخصية' },
  { id: 'other', label: 'سبب آخر' },
];

/** الإبلاغ عن مستخدم أو عن رسالة خاصة منه (للمراجعة اليدوية من المشرف) */
export async function reportUser(
  userId: string,
  reason: UserReportReason,
  details?: string,
  messageId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('report_user', {
      p_user: userId,
      p_reason: reason,
      p_details: details ?? null,
      p_message_id: messageId ?? null,
    });
    if (error) throw error;
    if (data?.success) {
      return {
        success: true,
        message: data.duplicate ? 'أبلغت عن هذا مسبقاً. شكراً لك.' : 'تم استلام البلاغ وسيراجعه فريق الإشراف.',
      };
    }
    return { success: false, message: 'تعذّر إرسال البلاغ. حاول لاحقاً.' };
  } catch (error) {
    console.error('reportUser error:', error);
    return { success: false, message: 'تعذّر إرسال البلاغ. تحقق من الاتصال.' };
  }
}

export async function reportSnippet(
  snippetId: string,
  reason: ReportReason,
  details?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('report_snippet', {
      p_snippet_id: snippetId,
      p_reason: reason,
      p_details: details ?? null,
    });
    if (error) throw error;
    if (data?.success) {
      return {
        success: true,
        message: data.duplicate
          ? 'أبلغت عن هذا المحتوى مسبقاً. شكراً لك.'
          : 'تم استلام البلاغ. شكراً لمساعدتك في حماية المجتمع.',
      };
    }
    return {
      success: false,
      message:
        data?.code === 'own_content'
          ? 'لا يمكنك الإبلاغ عن محتواك.'
          : 'تعذّر إرسال البلاغ. حاول لاحقاً.',
    };
  } catch (error) {
    console.error('reportSnippet error:', error);
    return { success: false, message: 'تعذّر إرسال البلاغ. تحقق من الاتصال.' };
  }
}

let blockedCache: { userId: string; ids: string[]; at: number } | null = null;

/** معرفات المستخدمين الذين حظرهم المستخدم الحالي */
export async function getBlockedUserIds(force = false): Promise<string[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return [];
    if (
      !force &&
      blockedCache &&
      blockedCache.userId === uid &&
      Date.now() - blockedCache.at < 60_000
    ) {
      return blockedCache.ids;
    }
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', uid);
    if (error) return blockedCache?.ids ?? [];
    const ids = (data || []).map((r: any) => r.blocked_id as string);
    blockedCache = { userId: uid, ids, at: Date.now() };
    return ids;
  } catch {
    return [];
  }
}

export async function blockUser(
  blockedId: string
): Promise<{ success: boolean }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid || uid === blockedId) return { success: false };
    const { error } = await supabase
      .from('user_blocks')
      .upsert({ blocker_id: uid, blocked_id: blockedId });
    if (error) throw error;
    blockedCache = null;
    return { success: true };
  } catch (error) {
    console.error('blockUser error:', error);
    return { success: false };
  }
}

export interface BlockedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  blocked_at: string;
}

/** المستخدمون الذين حظرهم المستخدم الحالي (من user_blocks؛ RLS يقصرها على حظره هو) */
export async function getBlockedUsers(): Promise<{
  data: BlockedUser[];
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return { data: [], error: 'not_authenticated' };
    const { data, error } = await supabase
      .from('user_blocks')
      .select(
        'blocked_id, created_at, profile:profiles!user_blocks_blocked_id_fkey (id, username, full_name, avatar_url)'
      )
      .eq('blocker_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const users = (data || []).map((r: any) => ({
      id: r.blocked_id as string,
      username: r.profile?.username ?? null,
      full_name: r.profile?.full_name ?? null,
      avatar_url: r.profile?.avatar_url ?? null,
      blocked_at: r.created_at as string,
    }));
    blockedCache = { userId: uid, ids: users.map((u) => u.id), at: Date.now() };
    return { data: users, error: null };
  } catch (error) {
    console.error('getBlockedUsers error:', error);
    return { data: [], error: 'load_failed' };
  }
}

/** هل حظر المستخدم الحالي هذا المستخدم؟ (حظر الطرف الآخر لك لا يُكشف) */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const ids = await getBlockedUserIds(true);
  return ids.includes(userId);
}

export async function unblockUser(
  blockedId: string
): Promise<{ success: boolean }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return { success: false };
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', uid)
      .eq('blocked_id', blockedId);
    if (error) throw error;
    blockedCache = null;
    return { success: true };
  } catch (error) {
    console.error('unblockUser error:', error);
    return { success: false };
  }
}

/** نشر / إلغاء نشر كود يملكه المستخدم */
export async function setSnippetPublic(
  snippetId: string,
  isPublic: boolean
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('code_snippets')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', snippetId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('setSnippetPublic error:', error);
    return { success: false };
  }
}
