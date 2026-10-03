/**
 * clearUserData.ts
 *
 * مسح جميع بيانات المستخدم المحلية عند تسجيل الخروج أو تغيير الحساب
 * حل جذري لمنع تسرب البيانات بين الحسابات
 */

import AsyncStorage from '@/lib/platformStorage';

/**
 * مسح جميع بيانات Kodax من AsyncStorage
 * يحذف كل المفاتيح التي تبدأ بـ @kodax_
 * هذا يضمن عدم تسرب أي بيانات بين الحسابات
 */
export async function clearAllKodaxData(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const kodaxKeys = allKeys.filter(
      (key: string) => key.startsWith('@kodax_') || key.startsWith('kodax_')
    );

    if (kodaxKeys.length > 0) {
      await AsyncStorage.multiRemove(kodaxKeys);
    }
  } catch (error) {
    // حتى لو فشل getAllKeys، نحذف المفاتيح المعروفة يدوياً
    await clearKnownKeys();
  }
}

/**
 * مسح جميع المفاتيح المعروفة يدوياً (احتياطي)
 */
async function clearKnownKeys(): Promise<void> {
  const knownKeys = [
    // badgeService
    '@kodax_earned_badges',
    '@kodax_challenge_streak',
    '@kodax_no_hint_challenges',
    '@kodax_hard_challenges',
    '@kodax_comeback_detected',
    // notificationService
    '@kodax_notifications',
    // progressService
    '@kodax_user_progress',
    '@kodax_completed_lessons',
    '@kodax_completed_challenges',
    '@kodax_user_xp',
    '@kodax_user_streak',
    // legacy: databaseService (removed)
    '@kodax_user_profile',
    '@kodax_user_points',
    '@kodax_unlocked_courses',
    '@kodax_last_sync',
    '@kodax_sync_queue',
    // supabaseProgressService
    '@kodax_db_completed_lessons',
    '@kodax_pending_sync',
    // legacy: old local points cache (paid points system, removed)
    '@kodax_points_data',
    // hybridSyncService
    '@kodax_user_level',
  ];

  try {
    await AsyncStorage.multiRemove(knownKeys);
  } catch (e) {
    // Failed fallback clear
  }
}
