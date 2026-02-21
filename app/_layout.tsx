import React, { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Platform,
} from 'react-native';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { PointsProvider, usePoints } from '@/contexts/PointsContext';
import { BadgeProvider } from '@/contexts/BadgeContext';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { initializeDeepLinkAuthListener } from '@/services/deepLinkAuthService';
import { showAlert } from '@/utils/crossPlatformAlert';
import { checkForUpdate, AppUpdate } from '@/services/updateService';
import { checkMandatoryData } from '@/services/profileService';
import { ToastContainer } from '@/components/ui/Toast';
import MandatoryDataModal from '@/components/ui/MandatoryDataModal';
import UpdateModal from '@/components/ui/UpdateModal';
import BroadcastManager from '@/components/ui/BroadcastManager';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Re-export useAuth for backward compatibility (pages that import from '../_layout')
export { useAuth } from '@/contexts/AuthContext';

/**
 * مكون وسيط يربط بيانات النقاط الفعلية بمزود الشارات
 */
function BadgeProviderConnected({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const { isPremium, unlockedCourses } = usePoints();
  const hasPurchased = isPremium || (unlockedCourses?.length || 0) > 0;

  return (
    <BadgeProvider
      userId={userId}
      isPremium={isPremium}
      unlockedCoursesCount={unlockedCourses?.length || 0}
      hasPurchased={hasPurchased}
    >
      {children}
    </BadgeProvider>
  );
}

/**
 * NavigationGuard — يدير التنقل بناءً على حالة المصادقة
 *
 * المنطق:
 * - الويب + غير مسجل → صفحة التحميل (download)
 * - الويب + مسجل → التطبيق مباشرة
 * - موبايل + غير مسجل → صفحة تسجيل الدخول
 * - موبايل + مسجل → التطبيق مباشرة
 */
function NavigationGuard() {
  const { session, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // لا تنقل أثناء التهيئة
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDownload = segments[0] === 'download';
    const hasSegments = segments.length > 0;

    // انتظر حتى يكون الراوتر جاهز
    if (!hasSegments) return;

    // على الويب، تجنب إعادة التوجيه المتكررة
    if (Platform.OS === 'web' && hasNavigatedRef.current) return;

    if (isAuthenticated) {
      // مسجل دخول — إذا كان في auth أو download، انقل للتطبيق
      if (inAuthGroup || inDownload) {
        hasNavigatedRef.current = true;
        router.replace('/(tabs)');
      }
    } else {
      // غير مسجل دخول
      if (!inAuthGroup && !inDownload) {
        hasNavigatedRef.current = false;
        if (Platform.OS === 'web') {
          // الويب: صفحة التحميل أولاً
          router.replace('/download');
        } else {
          // موبايل: صفحة تسجيل الدخول
          router.replace('/(auth)/login');
        }
      }
    }
  }, [isAuthenticated, segments, isInitializing]);

  // إعادة تعيين العلم عند تسجيل الخروج
  useEffect(() => {
    if (!isAuthenticated) {
      hasNavigatedRef.current = false;
    }
  }, [isAuthenticated]);

  return null;
}

/**
 * InnerLayout — المحتوى الداخلي الذي يستخدم AuthContext
 */
function InnerLayout() {
  const { session, user, isInitializing, fullName } = useAuth();
  const [showMandatoryData, setShowMandatoryData] = useState(false);
  const [broadcastUserName, setBroadcastUserName] = useState('');

  // حالة التحديث الذكي (موبايل فقط)
  const [showUpdate, setShowUpdate] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<AppUpdate | null>(null);
  const [updateForced, setUpdateForced] = useState(false);
  const [currentAppVersion, setCurrentAppVersion] = useState('1.0.0');

  // إخفاء SplashScreen عند اكتمال التهيئة
  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitializing]);

  // تهيئة Deep Link Listener للموبايل
  useEffect(() => {
    const cleanup = initializeDeepLinkAuthListener(
      () => {
        // onAuthStateChange يدير كل شيء
      },
      (error) => {
        showAlert('خطأ', error);
      }
    );
    return cleanup;
  }, []);

  // التحقق من البيانات الإجبارية + جلب اسم المستخدم
  useEffect(() => {
    if (!session?.user?.id || showMandatoryData) return;

    checkMandatoryData(session.user.id).then(({ isComplete }) => {
      if (!isComplete) {
        setShowMandatoryData(true);
      }
    });

    // تحديث اسم المستخدم من AuthContext
    setBroadcastUserName(fullName);
  }, [session?.user?.id, fullName, showMandatoryData]);

  // تحديث اسم المستخدم عند تغيره
  useEffect(() => {
    if (fullName) {
      setBroadcastUserName(fullName);
    }
  }, [fullName]);

  // فحص التحديثات (موبايل فقط)
  useEffect(() => {
    if (isInitializing) return;
    if (Platform.OS === 'web') return;

    const doCheck = async () => {
      try {
        const result = await checkForUpdate();
        if (result.hasUpdate && result.update) {
          setPendingUpdate(result.update);
          setUpdateForced(result.isForced);
          setCurrentAppVersion(result.currentVersion);
          setShowUpdate(true);
        }
      } catch (_e) {
        // Update check skipped
      }
    };

    const timer = setTimeout(doCheck, 3000);
    return () => clearTimeout(timer);
  }, [isInitializing]);

  // شاشة التحميل: فقط على الويب أثناء التهيئة
  if (isInitializing && Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider userId={user?.id}>
        <PointsProvider userId={user?.id}>
          <SubscriptionProvider userId={user?.id || ''}>
            <BadgeProviderConnected userId={user?.id}>
              <StatusBar style="light" backgroundColor="#0f0f1e" />

              {/* Navigation Guard */}
              <NavigationGuard />

              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0f0f1e' },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="download" />
                <Stack.Screen name="course/[id]" />
                <Stack.Screen name="lesson/[id]" />
                <Stack.Screen name="challenge/[id]" />
                <Stack.Screen name="certificate/index" />
                <Stack.Screen name="certificate/[id]" />
                <Stack.Screen name="certificate/verify" />
                <Stack.Screen name="certificate/download" />
              </Stack>

              <ToastContainer />

              {/* مدير الرسائل العامة */}
              {user?.id && (
                <BroadcastManager
                  userId={user.id}
                  userName={broadcastUserName}
                />
              )}

              {/* مربع حوار البيانات الإجبارية */}
              {user?.id && (
                <MandatoryDataModal
                  visible={showMandatoryData}
                  userId={user.id}
                  onComplete={() => setShowMandatoryData(false)}
                />
              )}

              {/* مربع حوار التحديث الذكي */}
              <UpdateModal
                visible={showUpdate}
                update={pendingUpdate}
                currentVersion={currentAppVersion}
                isForced={updateForced}
                onDismiss={() => setShowUpdate(false)}
              />
            </BadgeProviderConnected>
          </SubscriptionProvider>
        </PointsProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 16,
    fontSize: 16,
  },
});
