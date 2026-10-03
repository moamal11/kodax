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
import { CoinsProvider, useCoins } from '@/contexts/CoinsContext';
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
import PushManager from '@/components/ui/PushManager';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Re-export useAuth for backward compatibility (pages that import from '../_layout')
export { useAuth } from '@/contexts/AuthContext';

/**
 * مكون وسيط يربط بيانات الكوينات الفعلية بمزود الشارات
 */
function BadgeProviderConnected({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const { state, unlockedCourses } = useCoins();

  return (
    <BadgeProvider
      userId={userId}
      lifetimeCoins={state?.lifetimeEarned ?? 0}
      unlockedCoursesCount={unlockedCourses.length}
      hasUnlockedWithCoins={unlockedCourses.length > 0}
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
const PUBLIC_ROUTES = new Set(['privacy', 'terms', 'account-deletion']);

function NavigationGuard() {
  const { session, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // لا تنقل أثناء التهيئة
    if (isInitializing) return;

    // إذا كانت الجلسة موجودة لكن التحقق النهائي لم يكتمل بعد، انتظر
    if (session?.user && !isAuthenticated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDownload = segments[0] === 'download';
    // صفحات عامة (سياسة الخصوصية، الشروط، حذف الحساب) تعمل بلا تسجيل دخول
    const inPublic = PUBLIC_ROUTES.has(String(segments[0] ?? ''));
    const hasSegments = segments.length > 0;

    // انتظر حتى يكون الراوتر جاهز
    if (!hasSegments) return;

    // عند الخروج نعيد ضبط العلم هنا (وليس في effect منفصل) لأن ذلك الـeffect
    // كان يعمل بعد هذا الـeffect، فيبقى المستخدم داخل التطبيق على الويب.
    if (!isAuthenticated) hasNavigatedRef.current = false;

    // على الويب، تجنب إعادة التوجيه المتكررة
    if (Platform.OS === 'web' && hasNavigatedRef.current) return;

    if (isAuthenticated) {
      // مسجل دخول — إذا كان في auth أو download، انقل للتطبيق
      if (inAuthGroup || inDownload) {
        hasNavigatedRef.current = true;
        console.log('[AUTH] navigating to app');
        router.replace('/(tabs)');
      }
    } else {
      // غير مسجل دخول
      if (!inAuthGroup && !inDownload && !inPublic) {
        console.log('[AUTH] navigating to login');
        if (Platform.OS === 'web') {
          // الويب: صفحة التحميل أولاً
          router.replace('/download');
        } else {
          // موبايل: صفحة تسجيل الدخول
          router.replace('/(auth)/login');
        }
      }
    }
  }, [isAuthenticated, segments, isInitializing, session?.user]);

  return null;
}

/**
 * HydratedInnerLayout — التخطيط الداخلي
 *
 * يستخدم userId من AuthContext مباشرة.
 * userId يكون undefined حتى يتم التحقق من الجلسة + وجود الملف الشخصي.
 * هذا يضمن أن جميع الاستعلامات تعمل بشكل صحيح (RLS).
 */
function HydratedInnerLayout() {
  const { userId, isInitializing, fullName } = useAuth();
  const [showMandatoryData, setShowMandatoryData] = useState(false);
  const [broadcastUserName, setBroadcastUserName] = useState('');
  const deepLinkListenerInitializedRef = useRef(false);

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
    if (deepLinkListenerInitializedRef.current) return;
    deepLinkListenerInitializedRef.current = true;

    const cleanup = initializeDeepLinkAuthListener(
      () => {
        // onAuthStateChange يدير كل شيء
      },
      (error) => {
        showAlert('خطأ', error);
      }
    );

    return () => {
      deepLinkListenerInitializedRef.current = false;
      cleanup();
    };
  }, []);

  // التحقق من البيانات الإجبارية + جلب اسم المستخدم
  // userId من AuthContext — مضمون أن الجلسة + الملف الشخصي جاهزان
  useEffect(() => {
    if (!userId || showMandatoryData) return;

    checkMandatoryData(userId).then(({ isComplete }) => {
      if (!isComplete) {
        setShowMandatoryData(true);
      }
    });

    // تحديث اسم المستخدم من AuthContext
    setBroadcastUserName(fullName);
  }, [userId, fullName, showMandatoryData]);

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
      {/* userId من AuthContext — آمن لاستعلامات RLS */}
      <AppProvider userId={userId}>
        <CoinsProvider userId={userId}>
          <BadgeProviderConnected userId={userId}>
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
              <Stack.Screen name="rewards" />
              <Stack.Screen name="certificate/index" />
              <Stack.Screen name="certificate/[id]" />
              <Stack.Screen name="certificate/verify" />
              <Stack.Screen name="certificate/download" />
            </Stack>

            <ToastContainer />

            {/* مدير الرسائل العامة */}
            {userId && (
              <BroadcastManager userId={userId} userName={broadcastUserName} />
            )}

            {/* الإشعارات الفورية: تسجيل الجهاز + فتح الإشعار */}
            {userId && (
              <PushManager userId={userId} />
            )}

            {/* مربع حوار البيانات الإجبارية */}
            {userId && (
              <MandatoryDataModal
                visible={showMandatoryData}
                userId={userId}
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
        </CoinsProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <HydratedInnerLayout />
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
