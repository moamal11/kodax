/**
 * App Restart Utility
 *
 * يوفر طريقة لإعادة تحميل شجرة React بالكامل (soft restart)
 * بدون الحاجة لأي native modules أو expo-updates.
 *
 * الآلية:
 * - RootLayout يسجل handler يغيّر key على AuthProvider
 * - تغيير الـ key يجبر React على unmount + remount كل شيء
 * - AuthProvider يُقرأ الـ session من AsyncStorage من جديد
 * - كل البيانات تحمّل صح كأن التطبيق بدأ من الصفر
 *
 * الاستخدام:
 *   import { triggerAppRestart } from '@/lib/appRestart';
 *   triggerAppRestart(); // بعد Google OAuth
 */

let _restartHandler: (() => void) | null = null;

/**
 * يسجل الـ handler — يُستدعى مرة واحدة من RootLayout
 */
export function registerAppRestart(handler: () => void) {
  _restartHandler = handler;
}

/**
 * إعادة تشغيل كاملة (remount لشجرة React)
 * - يعمل في dev و production
 * - لا يحتاج expo-updates أو native modules
 */
export function triggerAppRestart() {
  if (_restartHandler) {
    console.log('[AppRestart] ♻️ Triggering full app remount...');
    _restartHandler();
  } else {
    console.warn('[AppRestart] No restart handler registered');
  }
}
