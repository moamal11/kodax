import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import PublicLandingPage from '@/features/download/PublicLandingPage';

/**
 * Root route (/) — Navigation hub
 *
 * يعتمد على NavigationGuard في app/_layout.tsx للتوجيه بناءً على حالة المصادقة:
 * - غير مسجل + web → صفحة تعريف المنصة على /
 * - غير مسجل + mobile → /(auth)/login (صفحة تسجيل الدخول)
 * - مسجل dخول → /(tabs) (التطبيق)
 *
 * على الويب تعرض الرئيسية العامة أثناء استعادة الجلسة، ثم تفتح التطبيق للمسجّل.
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
      if (Platform.OS !== 'web') {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Still initializing — just wait (don't render anything)
  }, [isInitializing, isAuthenticated, router]);

  // The build supplies the public landing HTML while the session is restored.
  return Platform.OS === 'web' && !isInitializing && !isAuthenticated ? <PublicLandingPage /> : null;
}
