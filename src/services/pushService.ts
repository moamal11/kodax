/**
 * الإشعارات الفورية (Expo Notifications → FCM/APNs).
 * - تسجيل رمز الجهاز على السيرفر (push_register_token) وإلغاؤه عند الخروج
 * - قنوات Android حسب النوع (رسائل، تفاعلات، تذكيرات، إعلانات)
 * - التفضيلات من السيرفر (notification_prefs_get/set)
 * الإرسال نفسه يتم على السيرفر فقط (push-send)؛ العميل لا يرسل إشعارات.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@/lib/platformStorage';
import { supabase } from '@/lib/supabase';

const TOKEN_KEY = '@kodax_push_token';
/** طُلب إذن النظام على هذا الجهاز (مرة واحدة فقط، مهما كان الجواب) */
const ASKED_KEY = '@kodax_push_asked';
/** المستخدم أوقف الإشعارات على هذا الجهاز من الإعدادات — لا تسجيل تلقائي */
const optOutKey = (userId: string) => `@kodax_push_off:${userId}`;

export interface NotificationPrefs {
  daily_goal: boolean;
  streak: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  system: boolean;
  admin: boolean;
  quiet_start: number;
  quiet_end: number;
  reminder_hour: number;
}

export const isPushSupported = Platform.OS === 'android' || Platform.OS === 'ios';

let handlerSet = false;
/** عرض الإشعار أثناء فتح التطبيق أيضاً */
export function configureNotificationHandler() {
  if (!isPushSupported || handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  const channels: Array<[string, string, Notifications.AndroidImportance]> = [
    ['default', 'عام', Notifications.AndroidImportance.DEFAULT],
    ['messages', 'الرسائل الخاصة', Notifications.AndroidImportance.HIGH],
    ['social', 'الإعجابات والتعليقات والمتابعات', Notifications.AndroidImportance.DEFAULT],
    ['reminders', 'تذكيرات التعلم والسلسلة', Notifications.AndroidImportance.DEFAULT],
    ['announcements', 'رسائل Kodax', Notifications.AndroidImportance.DEFAULT],
  ];
  for (const [id, name, importance] of channels) {
    await Notifications.setNotificationChannelAsync(id, { name, importance, lightColor: '#8b5cf6' });
  }
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined' | 'unsupported'> {
  if (!isPushSupported) return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

/** حالة الإذن + هل يمكن عرض نافذة النظام مجدداً (false = مرفوض نهائياً، الحل من إعدادات الجهاز) */
export async function getPermissionInfo(): Promise<{
  status: 'granted' | 'denied' | 'undetermined' | 'unsupported';
  canAskAgain: boolean;
}> {
  if (!isPushSupported) return { status: 'unsupported', canAskAgain: false };
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { status: status as 'granted' | 'denied' | 'undetermined', canAskAgain };
}

export async function isPushOptedOut(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(optOutKey(userId))) === '1';
}

/** هل هذا الجهاز مسجّل حالياً لاستقبال الإشعارات */
export async function isDeviceRegistered(): Promise<boolean> {
  return !!(await AsyncStorage.getItem(TOKEN_KEY));
}

/**
 * بعد الدخول (أو عند فتح التطبيق بجلسة قائمة):
 * - الإذن ممنوح → تسجيل الجهاز تلقائياً
 * - لم يُسأل من قبل على هذا الجهاز → نافذة إذن النظام مرة واحدة؛ الموافقة تفعّل الإشعارات مباشرة
 * - مرفوض أو سُئل سابقاً أو أوقفها المستخدم من الإعدادات → لا شيء (بلا إزعاج)
 */
export async function initPushForUser(userId: string): Promise<void> {
  if (!isPushSupported || !userId) return;
  try {
    if (await isPushOptedOut(userId)) return;
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      await registerForPush(false);
      return;
    }
    // Android 13+ يُرجع 'denied' قبل أول طلب (areNotificationsEnabled=false) مع canAskAgain=true؛
    // canAskAgain=false = رفض نهائي → لا نافذة. ASKED_KEY يضمن مرة واحدة فقط على الجهاز.
    if (!canAskAgain || (await AsyncStorage.getItem(ASKED_KEY))) return;
    await AsyncStorage.setItem(ASKED_KEY, '1');
    await registerForPush(true);
  } catch (e) {
    console.warn('[push] init failed:', e instanceof Error ? e.message : e);
  }
}

/** تفعيل/إيقاف الإشعارات على هذا الجهاز من شاشة الإعدادات */
export async function setDevicePushEnabled(
  userId: string,
  enabled: boolean
): Promise<{ ok: boolean; reason?: string }> {
  if (!enabled) {
    await AsyncStorage.setItem(optOutKey(userId), '1');
    await unregisterPush();
    return { ok: true };
  }
  await AsyncStorage.removeItem(optOutKey(userId));
  await AsyncStorage.setItem(ASKED_KEY, '1');
  return registerForPush(true);
}

/**
 * تسجيل الجهاز. ask=true يطلب الإذن (من شاشة الإعدادات)؛ ask=false يسجّل فقط إن كان الإذن ممنوحاً.
 */
export async function registerForPush(ask: boolean): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported) return { ok: false, reason: 'unsupported' };
  try {
    await ensureAndroidChannels();
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && ask) {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return { ok: false, reason: 'permission' };
    const projectId =
      (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    const { data, error } = await supabase.rpc('push_register_token', {
      p_token: token,
      p_platform: Platform.OS,
      p_device_id: Constants.sessionId ?? null,
      p_app_version: Constants.expoConfig?.version ?? null,
    });
    if (error || !data?.success) return { ok: false, reason: 'server' };
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return { ok: true };
  } catch (e) {
    // مثلاً: FCM غير مُعدّ بعد (google-services.json) أو لا اتصال
    console.warn('[push] register failed:', e instanceof Error ? e.message : e);
    return { ok: false, reason: 'error' };
  }
}

/** عند تسجيل الخروج: إزالة الجهاز من الحساب حتى لا تصله إشعاراته */
export async function unregisterPush(): Promise<void> {
  if (!isPushSupported) return;
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      await supabase.rpc('push_unregister_token', { p_token: token });
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // الخروج يكتمل حتى لو فشل الاتصال
  }
}

export async function getNotificationPrefs(): Promise<{ prefs: NotificationPrefs | null; devices: number }> {
  const { data, error } = await supabase.rpc('notification_prefs_get');
  if (error || !data?.success) return { prefs: null, devices: 0 };
  return { prefs: data.prefs as NotificationPrefs, devices: Number(data.devices ?? 0) };
}

export async function setNotificationPrefs(patch: Partial<NotificationPrefs>): Promise<NotificationPrefs | null> {
  const { data, error } = await supabase.rpc('notification_prefs_set', { p_prefs: patch });
  if (error || !data?.success) return null;
  return data.prefs as NotificationPrefs;
}

/** مسار التنقل الآمن من بيانات الإشعار (مسارات داخلية فقط) */
export function notificationUrl(data: unknown): string | null {
  const url = (data as any)?.url;
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return null;
  return url;
}
