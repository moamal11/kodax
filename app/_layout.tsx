import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useRef,
} from 'react';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  AppState,
  Platform,
} from 'react-native';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { PointsProvider, usePoints } from '@/contexts/PointsContext';
import { BadgeProvider } from '@/contexts/BadgeContext';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { hybridSyncService } from '@/services/hybridSyncService';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';
import { progressService } from '@/services/progressService';
import { clearAllKodaxData } from '@/utils/clearUserData';
import { ToastContainer } from '@/components/ui/Toast';
import MandatoryDataModal from '@/components/ui/MandatoryDataModal';
import UpdateModal from '@/components/ui/UpdateModal';
import BroadcastManager from '@/components/ui/BroadcastManager';
import { checkMandatoryData } from '@/services/profileService';
import { initializeDeepLinkAuthListener } from '@/services/deepLinkAuthService';
import { showAlert } from '@/utils/crossPlatformAlert';
import { checkForUpdate, AppUpdate } from '@/services/updateService';
import { clearBroadcastCache } from '@/services/broadcastService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Auth Context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  fullName: string;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  fullName: '',
});

export const useAuth = () => useContext(AuthContext);

/**
 * مكون وسيط يربط بيانات النقاط الفعلية بمزود الشارات
 * لحل مشكلة الشارات الاقتصادية التي كانت hardcoded
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

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const previousUserIdRef = useRef<string | null>(null);
  const [showMandatoryData, setShowMandatoryData] = useState(false);
  const hasNavigatedRef = useRef(false);
  const lastAuthEventRef = useRef<string | null>(null);

  // حالة التحديث الذكي (موبايل فقط)
  const [showUpdate, setShowUpdate] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<AppUpdate | null>(null);
  const [updateForced, setUpdateForced] = useState(false);
  const [currentAppVersion, setCurrentAppVersion] = useState('1.0.0');

  // Sign out function
  const signOut = useCallback(async () => {
    // مسح جميع البيانات المحلية — حل جذري لمنع تسرب البيانات
    try {
      // 1. مسح جميع مفاتيح AsyncStorage التي تبدأ بـ @kodax_
      await clearAllKodaxData();

      // 2. إعادة تعيين حالة جميع الخدمات في الذاكرة
      badgeService.resetState();
      notificationService.resetState();
      progressService.resetState();
      hybridSyncService.clearUser();
      clearBroadcastCache();
    } catch (e) {}

    await supabase.auth.signOut();
    setSession(null);
  }, []);

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // Error getting session
        } else {
          if (mounted) {
            setSession(initialSession);
          }
        }
      } catch (error) {
        // Auth init error
      } finally {
        if (mounted) {
          setIsReady(true);
          setIsLoading(false);
          SplashScreen.hideAsync();
        }
      }
    };

    initAuth();

    // Initialize deep link listener for mobile OAuth flow
    const cleanupDeepLink = initializeDeepLinkAuthListener(
      () => {
        // Success callback - user authenticated via deep link
        // The auth state listener will handle navigation
      },
      (error) => {
        // Error callback
        showAlert('خطأ', error);
      }
    );

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setIsLoading(false);

        // Only navigate on explicit sign-in/sign-out events
        // Skip TOKEN_REFRESHED and INITIAL_SESSION to prevent reload loops on web
        if (event === 'SIGNED_IN' && newSession && !hasNavigatedRef.current) {
          // Prevent duplicate navigation
          if (lastAuthEventRef.current === 'SIGNED_IN') return;
          lastAuthEventRef.current = 'SIGNED_IN';

          // ===== التحقق من حظر المستخدم قبل السماح بالدخول =====
          try {
            const { data: restrictions } = await supabase.rpc(
              'check_user_restrictions',
              { p_user_id: newSession.user.id }
            );
            if (restrictions?.is_banned) {
              // المستخدم محظور → تسجيل خروج فوري
              await supabase.auth.signOut();
              setSession(null);
              lastAuthEventRef.current = null;
              setTimeout(() => {
                showAlert(
                  'تم تقييد الحساب',
                  restrictions.ban_reason ||
                    'تم تقييد حسابك. يرجى التواصل مع الإدارة.'
                );
                router.replace('/(auth)/login');
              }, 200);
              return;
            }
          } catch (e) {
            // إذا فشل التحقق (RPC غير موجود بعد)، نسمح بالدخول
          }

          hasNavigatedRef.current = true;
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          lastAuthEventRef.current = 'SIGNED_OUT';
          hasNavigatedRef.current = false;
          // مسح جذري عند أي حدث خروج (حتى لو لم يمر بـ signOut)
          clearAllKodaxData().then(() => {
            badgeService.resetState();
            notificationService.resetState();
            progressService.resetState();
            hybridSyncService.clearUser();
            clearBroadcastCache();
          });
          setTimeout(() => router.replace('/(auth)/login'), 100);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      cleanupDeepLink();
    };
  }, []);

  // Listen for cross-window/session signals from the OAuth callback on web.
  // The callback writes `kodax_auth_update` to localStorage; when we see it
  // we re-fetch the session so the app won't remain stuck on the loading UI.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleStorage = async (e: StorageEvent) => {
      try {
        if (e.key === 'kodax_auth_update') {
          const {
            data: { session: newSession },
          } = await supabase.auth.getSession();
          setSession(newSession);
          setIsLoading(false);
          try {
            window.localStorage.removeItem('kodax_auth_update');
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Failed to sync session from storage event', err);
      }
    };

    window.addEventListener('storage', handleStorage);

    // If the callback wrote the flag before this listener was attached,
    // read and process it immediately.
    try {
      const flag = window.localStorage.getItem('kodax_auth_update');
      if (flag) {
        (async () => {
          try {
            const {
              data: { session: newSession },
            } = await supabase.auth.getSession();
            setSession(newSession);
            setIsLoading(false);
            window.localStorage.removeItem('kodax_auth_update');
          } catch (e) {
            /* ignore */
          }
        })();
      }
    } catch (e) {}

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ===== Background Sync - مزامنة التقدم في الخلفية =====
  useEffect(() => {
    const currentUserId = session?.user?.id || null;
    const previousUserId = previousUserIdRef.current;

    if (!currentUserId) {
      // عند تسجيل الخروج، مسح الكاش
      hybridSyncService.clearUser();
      previousUserIdRef.current = null;
      return;
    }

    // إذا تغير المستخدم (حساب جديد بدون المرور بـ signOut)
    if (previousUserId && previousUserId !== currentUserId) {
      // مسح جذري لجميع البيانات المحلية
      clearAllKodaxData().then(() => {
        badgeService.resetState();
        notificationService.resetState();
        progressService.resetState();
        hybridSyncService.clearUser();
      });
    }

    previousUserIdRef.current = currentUserId;

    // تعيين المستخدم في خدمة المزامنة (سيمسح كاش المستخدم السابق تلقائياً)
    hybridSyncService.setUser(currentUserId);

    // مزامنة عند فتح التطبيق
    hybridSyncService.backgroundSync();

    // مزامنة عند العودة للتطبيق من الخلفية
    // On web: throttle to prevent cascade re-renders on tab switch
    let lastSyncTime = 0;
    const SYNC_THROTTLE_MS = Platform.OS === 'web' ? 30000 : 5000; // 30s on web, 5s on mobile

    const appStateSubscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (nextAppState === 'active') {
          const now = Date.now();
          if (now - lastSyncTime < SYNC_THROTTLE_MS) {
            return; // Skip if synced recently
          }
          lastSyncTime = now;
          hybridSyncService.backgroundSync();

          // ===== فحص حالة الحظر عند العودة للتطبيق =====
          try {
            const { data: restrictions } = await supabase.rpc(
              'check_user_restrictions',
              { p_user_id: currentUserId }
            );
            if (restrictions?.is_banned) {
              await supabase.auth.signOut();
              showAlert(
                'تم تقييد الحساب',
                restrictions.ban_reason ||
                  'تم تقييد حسابك. يرجى التواصل مع الإدارة.'
              );
            }
          } catch (e) {
            // silent — RPC قد لا يكون موجوداً بعد
          }
        }
      }
    );

    return () => {
      appStateSubscription?.remove();
    };
  }, [session?.user?.id]);

  // Handle initial navigation based on auth state
  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDownload = segments[0] === 'download';
    const hasSegments = segments.length > 0;

    // Only redirect if we have segments (router is ready)
    if (!hasSegments) {
      // On web, after an OAuth callback we may land on `/` before the
      // router has populated `segments`. If we already have a session,
      // proactively navigate to the tabs route to avoid a stuck loading UI.
      if (Platform.OS === 'web' && session) {
        setTimeout(() => {
          try {
            router.replace('/(tabs)');
          } catch (e) {}
        }, 100);
      }
      return;
    }

    // On web, skip redundant redirects - the auth state change handler takes care of it
    if (Platform.OS === 'web' && hasNavigatedRef.current) return;

    if (session && (inAuthGroup || inDownload)) {
      hasNavigatedRef.current = true;
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup && !inDownload) {
      // على الويب: وجّه المستخدم لصفحة التحميل أولاً
      if (Platform.OS === 'web') {
        hasNavigatedRef.current = false;
        router.replace('/download');
      } else {
        hasNavigatedRef.current = false;
        router.replace('/(auth)/login');
      }
    }
  }, [session, segments, isReady, isLoading]);

  // التحقق من البيانات الإجبارية مرة واحدة فقط عند تغير المستخدم
  // + جلب اسم المستخدم للمتغيرات الديناميكية في الرسائل
  const [broadcastUserName, setBroadcastUserName] = useState('');

  useEffect(() => {
    if (!session?.user?.id || showMandatoryData) return;
    checkMandatoryData(session.user.id).then(({ isComplete }) => {
      if (!isComplete) {
        setShowMandatoryData(true);
      }
    });
    // جلب اسم المستخدم للرسائل
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setBroadcastUserName(data.full_name);
      });
  }, [session?.user?.id]);

  // ===== فحص التحديثات الذكي (موبايل فقط - Android/iOS) =====
  useEffect(() => {
    if (!isReady) return;
    // التحديثات تعمل فقط على الأجهزة المحمولة
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
      } catch (e) {
        // Update check skipped
      }
    };

    // فحص عند بدء التطبيق فقط (تأخير قصير لعدم تعطيل التحميل)
    const timer = setTimeout(doCheck, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [isReady]);

  const authContextValue = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isLoading,
      signOut,
      fullName: broadcastUserName,
    }),
    [session, isLoading, signOut, broadcastUserName]
  );

  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <GestureHandlerRootView style={styles.container}>
        <PointsProvider userId={session?.user?.id}>
          <SubscriptionProvider userId={session?.user?.id || ''}>
            <BadgeProviderConnected userId={session?.user?.id}>
              <StatusBar style="light" backgroundColor="#0f0f1e" />
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
              {/* مدير الرسائل العامة من لوحة التحكم */}
              {session?.user?.id && (
                <BroadcastManager
                  userId={session.user.id}
                  userName={broadcastUserName}
                />
              )}
              {/* مربع حوار البيانات الإجبارية */}
              {session?.user?.id && (
                <MandatoryDataModal
                  visible={showMandatoryData}
                  userId={session.user.id}
                  onComplete={() => setShowMandatoryData(false)}
                />
              )}
              {/* مربع حوار التحديث الذكي (موبايل فقط) */}
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
      </GestureHandlerRootView>
    </AuthContext.Provider>
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
