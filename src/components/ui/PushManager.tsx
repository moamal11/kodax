/**
 * يربط الإشعارات بالتطبيق: تسجيل الجهاز تلقائياً إن كان الإذن ممنوحاً مسبقاً (بلا طلب مفاجئ)،
 * وفتح المكان المناسب عند الضغط على الإشعار (حتى لو كان التطبيق مغلقاً).
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  configureNotificationHandler,
  isPushSupported,
  notificationUrl,
  registerForPush,
} from '@/services/pushService';

export default function PushManager({ userId }: { userId: string }) {
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPushSupported || !userId) return;
    configureNotificationHandler();
    registerForPush(false);

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
    return () => sub.remove();
  }, [userId, router]);

  return null;
}
