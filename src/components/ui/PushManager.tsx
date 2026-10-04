/**
 * يربط الإشعارات بالتطبيق:
 * - بعد الدخول/إنشاء الحساب: يطلب إذن النظام مرة واحدة على الجهاز، والموافقة تفعّل الإشعارات تلقائياً
 *   (وإن كان الإذن ممنوحاً مسبقاً يسجّل الجهاز مباشرة) — انظر initPushForUser
 * - عند العودة للتطبيق بعد تفعيل الإذن من إعدادات الجهاز: يسجّل الجهاز
 * - فتح المكان المناسب عند الضغط على الإشعار (حتى لو كان التطبيق مغلقاً)
 */
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  configureNotificationHandler,
  getPermissionInfo,
  initPushForUser,
  isDeviceRegistered,
  isPushOptedOut,
  isPushSupported,
  notificationUrl,
  registerForPush,
} from '@/services/pushService';

/** مهلة قصيرة بعد الدخول حتى تظهر الشاشة الرئيسية قبل نافذة الإذن */
const PROMPT_DELAY_MS = 1200;

export default function PushManager({ userId }: { userId: string }) {
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPushSupported || !userId) return;
    configureNotificationHandler();
    const timer = setTimeout(() => initPushForUser(userId), PROMPT_DELAY_MS);

    // سمح بالإشعارات من إعدادات الجهاز ثم عاد للتطبيق
    const appState = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      if ((await getPermissionInfo()).status !== 'granted') return;
      if ((await isDeviceRegistered()) || (await isPushOptedOut(userId))) return;
      registerForPush(false);
    });

    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledRef.current === id) return; // نفس الإشعار لا يُفتح مرتين
      handledRef.current = id;
      const url = notificationUrl(response.notification.request.content.data);
      if (url) router.push(url as any);
    };

    // فتح التطبيق من إشعار وهو مغلق
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => {
      clearTimeout(timer);
      appState.remove();
      sub.remove();
    };
  }, [userId, router]);

  return null;
}
