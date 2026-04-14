/**
 * broadcastService.ts
 *
 * خدمة الرسائل العامة - Kodax
 * تجلب الرسائل غير المقروءة من الأدمن وتديرها
 * تعمل بكفاءة عالية مع التخزين المؤقت لمنع الاستعلامات المكررة
 */

import { supabase } from '@/lib/supabase';

// ===== أنواع البيانات =====
export interface BroadcastMessage {
  id: string;
  type: 'toast' | 'modal';
  title: string;
  body: string | null;
  image_url: string | null;
  display_mode: 'once' | 'until_dismissed';
  scheduled_at: string;
  created_at: string;
}

// ===== حالة الخدمة =====
let _cachedMessages: BroadcastMessage[] | null = null;
let _lastFetchTime = 0;
let _isFetching = false;
const CACHE_TTL = 60_000; // دقيقة واحدة

/**
 * جلب الرسائل غير المقروءة للمستخدم
 * تستخدم cache قصير المدة لمنع الاستعلامات المتكررة
 */
export async function getUnreadMessages(
  userId: string
): Promise<BroadcastMessage[]> {
  if (!userId) return [];

  // إذا الكاش لا يزال صالحاً
  const now = Date.now();
  if (_cachedMessages && now - _lastFetchTime < CACHE_TTL) {
    return _cachedMessages;
  }

  // منع الاستعلام المتوازي
  if (_isFetching) return _cachedMessages || [];

  _isFetching = true;

  try {
    const { data, error } = await supabase.rpc(
      'get_unread_broadcast_messages',
      {
        p_user_id: userId,
      }
    );

    if (error) {
      return _cachedMessages || [];
    }

    _cachedMessages = (data as BroadcastMessage[]) || [];
    _lastFetchTime = Date.now();
    return _cachedMessages;
  } catch (err) {
    return _cachedMessages || [];
  } finally {
    _isFetching = false;
  }
}

/**
 * تسجيل أن المستخدم قرأ/شاهد رسالة معينة
 */
export async function markMessageRead(
  messageId: string,
  userId: string
): Promise<void> {
  if (!messageId || !userId) return;

  try {
    await supabase.rpc('mark_broadcast_message_read', {
      p_message_id: messageId,
      p_user_id: userId,
    });

    // إزالة الرسالة من الكاش فوراً
    if (_cachedMessages) {
      _cachedMessages = _cachedMessages.filter((m) => m.id !== messageId);
    }
  } catch (err) {
    // Error marking message read
  }
}

/**
 * مسح الكاش (عند تسجيل الخروج مثلاً)
 */
export function clearBroadcastCache(): void {
  _cachedMessages = null;
  _lastFetchTime = 0;
}
