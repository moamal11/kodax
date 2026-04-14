import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Root route (/) — Navigation hub
 *
 * يعتمد على NavigationGuard في app/_layout.tsx للتوجيه بناءً على حالة المصادقة:
 * - غير مسجل + web → /download (صفحة التحميل)
 * - غير مسجل + mobile → /(auth)/login (صفحة تسجيل الدخول)
 * - مسجل dخول → /(tabs) (التطبيق)
 *
 * النافذة index.tsx نفسها لا تفعل شيئاً — فقط تنتظر التوجيه التلقائي.
 */
export default function Index() {
  const { isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is ready and user is authenticated, go to app
    if (!isInitializing && isAuthenticated) {
      router.replace('/(tabs)');
      return;
    }

    // If auth is ready and user is NOT authenticated...
    if (!isInitializing && !isAuthenticated) {
      // On web: go to download page (landing page with login button)
      // On mobile: go to login page
      if (Platform.OS === 'web') {
        router.replace('/download');
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Still initializing — just wait (don't render anything)
  }, [isInitializing, isAuthenticated, router]);

  // Return null while routing is in progress
  return null;
}
