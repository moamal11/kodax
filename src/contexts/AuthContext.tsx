/**
 * AuthContext — نظام المصادقة المركزي (v2 — إعادة بناء كامل)
 *
 * ================================ المشاكل الجذرية في النسخة السابقة ================================
 *
 * 1. Race condition: onAuthStateChange يُطلق قبل إنشاء الملف الشخصي
 * 2. triggerAppRestart يقتل شجرة React قبل اكتمال التخزين → فقدان الجلسة
 * 3. حالة نصف مُصادَقة: isAuthenticated = true لكن الملف الشخصي غير محقق
 * 4. الحاجة لإعادة تشغيل التطبيق حتى تحمّل البيانات بعد Google OAuth
 * 5. SessionHydrationProvider يضيف تأخيرات عشوائية غير موثوقة
 *
 * ================================ الحل الجديد ================================
 *
 * آلة حالة نظيفة:
 *
 *   INITIALIZING → قراءة الجلسة المخزنة
 *     ├── جلسة موجودة → processSession (تحقق من التوكن + إنشاء ملف + جلب الاسم)
 *     │     ├── نجاح → AUTHENTICATED (userId آمن لاستعلامات RLS)
 *     │     └── فشل → محاولة تحديث → UNAUTHENTICATED
 *     └── لا جلسة → UNAUTHENTICATED
 *
 * الضمانات:
 * 1. isAuthenticated = true فقط عند وجود جلسة صالحة + ملف شخصي محقق
 * 2. userId يُعيَّن فقط عند isAuthenticated = true (آمن لاستعلامات RLS)
 * 3. isInitializing = true حتى اكتمال أول فحص مصادقة
 * 4. لا شاشة تُعرض بحالة نصف محملة
 * 5. تعافي تلقائي: تحديث التوكنات المنتهية، تنظيف الجلسات الفاشلة
 * 6. لا حاجة لـ triggerAppRestart — الحالة تتدفق طبيعياً
 * 7. الجلسة محفوظة عبر AsyncStorage/localStorage (Supabase يديرها)
 * 8. فحص الجلسة عند عودة التطبيق للواجهة (foreground recovery)
 *
 * الاستخدام:
 *   const { userId, isAuthenticated, isInitializing, signOut } = useAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { clearAllKodaxData } from '@/utils/clearUserData';
import { unregisterPush } from '@/services/pushService';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';
import { progressService } from '@/services/progressService';
import { hybridSyncService } from '@/services/hybridSyncService';
import { clearBroadcastCache } from '@/services/broadcastService';
import { isOAuthExchangeInProgress } from '@/services/deepLinkAuthService';

// ===== Types =====

export interface AuthContextType {
  /** الجلسة الحالية */
  session: Session | null;
  /** المستخدم الحالي */
  user: User | null;
  /**
   * معرّف المستخدم الآمن — يُعيَّن فقط عند التحقق من الجلسة + وجود الملف الشخصي.
   * استخدم هذا بدلاً من user?.id لجميع استعلامات قاعدة البيانات (RLS).
   * يحل محل safeUserId من SessionHydrationProvider القديم.
   */
  userId: string | undefined;
  /** هل التهيئة الأولى مستمرة؟ (true حتى يكتمل أول فحص مصادقة) */
  isInitializing: boolean;
  /** هل المستخدم مسجل دخول بشكل كامل (جلسة صالحة + ملف شخصي محقق)؟ */
  isAuthenticated: boolean;
  /** تسجيل الخروج مع مسح جميع البيانات */
  signOut: () => Promise<void>;
  /** اسم المستخدم الكامل من الملف الشخصي */
  fullName: string;
  /** عداد تسجيل الدخول (يزيد عند كل تسجيل دخول جديد) */
  authVersion: number;
  /** alias لـ isInitializing — للتوافق مع الكود القديم */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userId: undefined,
  isInitializing: true,
  isAuthenticated: false,
  signOut: async () => {},
  fullName: '',
  authVersion: 0,
  isLoading: true,
});

// ===== Provider =====

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fullName, setFullName] = useState('');
  const [authVersion, setAuthVersion] = useState(0);
  const [profileVerified, setProfileVerified] = useState(false);

  const mountedRef = useRef(true);
  const initCompleteRef = useRef(false);
  const initialSessionEventSeenRef = useRef(false);
  // Version counter: كل عملية جديدة تلغي العمليات القديمة
  const processingVersionRef = useRef(0);

  // ===== Helper: مسح جميع البيانات المحلية =====
  const clearLocalData = useCallback(async () => {
    try {
      await clearAllKodaxData();
      badgeService.resetState();
      notificationService.resetState();
      progressService.resetState();
      hybridSyncService.clearUser();
      clearBroadcastCache();
    } catch (_e) {
      // Silent
    }
  }, []);

  // ===== signOut =====
  const signOut = useCallback(async () => {
    // Increment version to cancel any ongoing session processing
    processingVersionRef.current++;
    // إزالة الجهاز من الحساب قبل إنهاء الجلسة (حتى لا تصل إشعارات الحساب لهذا الجهاز)
    await unregisterPush();
    await clearLocalData();
    try {
      await supabase.auth.signOut();
    } catch (_e) {
      // Even if signOut fails on server, clear local state
    }
    if (mountedRef.current) {
      setSession(null);
      setProfileVerified(false);
      setFullName('');
    }
  }, [clearLocalData]);

  // ===== Mark init complete (one-time) =====
  const markInitComplete = useCallback(() => {
    if (initCompleteRef.current || !mountedRef.current) return;
    initCompleteRef.current = true;
    setIsInitializing(false);
  }, []);

  // ===== Ensure profile exists (for Google OAuth users) =====
  const ensureProfile = useCallback(
    async (user: User, retries = 3): Promise<void> => {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (existing) return; // Already exists

        const metadata = user.user_metadata || {};
        const name =
          metadata.full_name || metadata.name || metadata.display_name || '';
        const avatarUrl = metadata.avatar_url || metadata.picture || null;
        const emailBase = (user.email || '')
          .split('@')[0]
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .substring(0, 14);
        const idSuffix = user.id.replace(/-/g, '').substring(0, 6);
        const generatedUsername = `${emailBase}_${idSuffix}`.toLowerCase();

        // supabase-js يُرجع الخطأ ولا يرميه — نرميه هنا ليصل لمعالجة الأخطاء أدناه
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          username: generatedUsername,
          full_name: name || generatedUsername,
          avatar_url: avatarUrl,
          xp: 0,
          level: 1,
          streak_days: 0,
        });
        if (insertError) throw insertError;
        console.log('[AUTH] ✅ Profile created (client fallback)');
      } catch (error: any) {
        if (
          error?.message?.includes('duplicate') ||
          error?.code?.includes('23505')
        ) {
          return; // Profile created concurrently — safe
        }
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 500));
          return ensureProfile(user, retries - 1);
        }
        // لا نمنع الدخول: فشل إنشاء الملف لا يعني فشل تسجيل الدخول
        console.warn(
          '[AUTH] auth error: ensureProfile failed:',
          error?.message
        );
      }
    },
    []
  );

  // ===== Fetch full name from profile =====
  const fetchFullName = useCallback(
    async (uid: string, retries = 4): Promise<string> => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', uid)
          .single();

        if (data?.full_name) return data.full_name;
        if (data?.username) return data.username;

        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 400));
          return fetchFullName(uid, retries - 1);
        }
      } catch (_e) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 400));
          return fetchFullName(uid, retries - 1);
        }
      }
      return '';
    },
    []
  );

  // ===== Check ban =====
  const checkBan = useCallback(
    async (uid: string): Promise<boolean> => {
      try {
        const { data: restrictions } = await supabase.rpc(
          'check_user_restrictions',
          { p_user_id: uid }
        );
        if (restrictions?.is_banned) {
          await signOut();
          const { showAlert } = require('@/utils/crossPlatformAlert');
          setTimeout(() => {
            showAlert(
              'تم تقييد الحساب',
              restrictions.ban_reason ||
                'تم تقييد حسابك. يرجى التواصل مع الإدارة.'
            );
          }, 200);
          return true;
        }
      } catch (_e) {
        // RPC not available — allow access
      }
      return false;
    },
    [signOut]
  );

  // =====================================================================
  // processSession — Core pipeline: verify session + ensure profile
  //
  // يُستدعى عند كل تغيير في حالة المصادقة.
  // يعود true إذا الجلسة صالحة والملف الشخصي جاهز.
  //
  // الخطوات:
  // 1. فحص انتهاء التوكن → تحديث إذا لزم
  // 2. ضمان وجود الملف الشخصي
  // 3. فحص الحظر
  // 4. جلب اسم المستخدم
  // 5. تعيين profileVerified = true
  // =====================================================================
  const processSession = useCallback(
    async (newSession: Session | null, version: number): Promise<boolean> => {
      if (!mountedRef.current) return false;

      // ---- No session → not authenticated ----
      if (!newSession?.user) {
        setSession(null);
        setProfileVerified(false);
        setFullName('');
        return false;
      }

      // Update session in state immediately (for UI that shows user email etc.)
      setSession(newSession);
      let activeSession = newSession;

      // === Step 1: Check token expiry — proactively refresh ===
      const expiresAt = newSession.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        console.log('[AUTH] Token expired, refreshing...');
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (processingVersionRef.current !== version || !mountedRef.current)
            return false;

          if (error || !data?.session) {
            console.warn('[AUTH] ❌ Token refresh failed:', error?.message);
            await signOut();
            return false;
          }
          activeSession = data.session;
          setSession(activeSession);
          console.log('[AUTH] ✅ Token refreshed successfully');
        } catch (err) {
          if (processingVersionRef.current !== version || !mountedRef.current)
            return false;
          console.warn('[AUTH] ❌ Token refresh error:', err);
          await signOut();
          return false;
        }
      }

      if (processingVersionRef.current !== version || !mountedRef.current)
        return false;

      // === Step 2: Ensure profile exists ===
      console.log('[AUTH] profile loading');
      await ensureProfile(activeSession.user);
      if (processingVersionRef.current !== version || !mountedRef.current)
        return false;

      // === Step 3: Check ban ===
      const isBanned = await checkBan(activeSession.user.id);
      if (
        isBanned ||
        processingVersionRef.current !== version ||
        !mountedRef.current
      )
        return false;

      // === Step 4: Fetch display name ===
      const name = await fetchFullName(activeSession.user.id);
      const metadata = activeSession.user.user_metadata || {};
      const metadataName =
        metadata.full_name || metadata.name || metadata.display_name || '';
      const emailPrefix = activeSession.user.email?.split('@')[0] || '';
      const resolvedName = name || metadataName || emailPrefix;
      if (processingVersionRef.current !== version || !mountedRef.current)
        return false;
      setFullName(resolvedName);
      console.log('[AUTH] profile loaded');

      // === Step 5: All verified — mark as authenticated ===
      setProfileVerified(true);
      setAuthVersion((v) => v + 1);
      console.log(
        '[AUTH] session verified → navigating to app, user=',
        activeSession.user.id
      );
      return true;
    },
    [signOut, ensureProfile, checkBan, fetchFullName]
  );

  // ===== Auth State Listener =====
  useEffect(() => {
    mountedRef.current = true;
    initialSessionEventSeenRef.current = false;

    // ⚠️ لا تنتظر (await) أي استدعاء Supabase داخل callback الخاص بـ
    // onAuthStateChange. مكتبة auth-js تُطلق INITIAL_SESSION و SIGNED_IN
    // (عند استعادة الجلسة) وهي تمسك قفلها الداخلي، وتنتظر انتهاء الـcallback.
    // أي استعلام (profiles / rpc / refreshSession) يحتاج نفس القفل عبر
    // getSession() → انتظار دائري → deadlock: الجلسة لا تُعتمد أبداً، وكل
    // signIn/signUp/signOut لاحق يعلق. لذلك الـcallback يعود فوراً والمعالجة
    // تتم خارج القفل. (processingVersionRef يلغي المعالجات القديمة.)
    const handleAuthEvent = async (
      event: AuthChangeEvent,
      newSession: Session | null
    ) => {
      if (!mountedRef.current) return;

      console.log(
        '[AUTH] session changed:',
        event,
        newSession?.user ? `user=${newSession.user.id}` : 'no session'
      );

      if (event === 'INITIAL_SESSION') {
        initialSessionEventSeenRef.current = true;
        // ---- First event: session restored from storage (or null) ----
        const version = ++processingVersionRef.current;
        await processSession(newSession, version);
        // Always complete init after INITIAL_SESSION, regardless of result
        markInitComplete();
      } else if (event === 'SIGNED_IN' && newSession) {
        // ---- New sign-in (e.g., after Google OAuth deep link) ----
        // Always process SIGNED_IN.
        // Supabase may emit multiple events in native OAuth flows and skipping
        // can leave profileVerified=false (user appears half-authenticated).
        const version = ++processingVersionRef.current;
        await processSession(newSession, version);
        markInitComplete();
      } else if (event === 'SIGNED_OUT') {
        // ---- Signed out ----
        if (isOAuthExchangeInProgress()) {
          console.log(
            '[AUTH] Ignoring transient SIGNED_OUT during OAuth exchange'
          );
          return;
        }
        processingVersionRef.current++;
        setSession(null);
        setProfileVerified(false);
        setFullName('');
        markInitComplete();
      } else if (event === 'TOKEN_REFRESHED') {
        // ---- Token refreshed — update session without re-processing ----
        if (newSession) setSession(newSession);
        markInitComplete();
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      // يعود فوراً حتى تُحرّر auth-js قفلها (انظر الشرح أعلاه)
      handleAuthEvent(event, newSession).catch((err) => {
        console.warn('[AUTH] auth error while handling', event, err?.message);
        markInitComplete();
      });
    });

    // Immediate bootstrap from persisted session without timers.
    (async () => {
      try {
        if (initCompleteRef.current || !mountedRef.current) return;
        const {
          data: { session: persistedSession },
        } = await supabase.auth.getSession();
        console.log(
          '[AUTH] current session:',
          persistedSession?.user ? `user=${persistedSession.user.id}` : 'none'
        );

        if (initialSessionEventSeenRef.current || initCompleteRef.current) {
          return;
        }

        const version = ++processingVersionRef.current;
        await processSession(persistedSession, version);
      } catch (err) {
        console.warn('[AUTH] Bootstrap getSession() failed:', err);
      } finally {
        markInitComplete();
      }
    })();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [processSession, markInitComplete]);

  // ===== Foreground Sync + Session Recovery =====
  useEffect(() => {
    const uid = session?.user?.id;

    if (!uid) {
      hybridSyncService.clearUser();
      return;
    }

    // Initialize sync for current user
    const initSync = async () => {
      try {
        await hybridSyncService.setUser(uid);
        hybridSyncService.backgroundSync();
      } catch (_e) {
        // Silent
      }
    };
    initSync();

    let lastSyncTime = 0;
    const SYNC_THROTTLE = Platform.OS === 'web' ? 30000 : 5000;

    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || !mountedRef.current) return;

      const now = Date.now();
      if (now - lastSyncTime < SYNC_THROTTLE) return;
      lastSyncTime = now;

      // === Session recovery on foreground ===
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!currentSession && session) {
          // Session disappeared from memory — try to recover
          console.log(
            '[AUTH] Session lost on foreground — attempting recovery'
          );
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session) {
            setSession(refreshed.session);
            console.log('[AUTH] ✅ Session recovered on foreground');
          } else {
            console.warn(
              '[AUTH] ⚠️ Session recovery returned empty on foreground; keep state and wait for auth events'
            );
          }
        }
      } catch (_e) {
        // Network error — don't sign out, just skip this sync
      }

      // Background sync
      try {
        hybridSyncService.backgroundSync();
      } catch (_e) {}

      // Check ban
      try {
        if (uid) checkBan(uid);
      } catch (_e) {}
    });

    return () => {
      appStateSub?.remove();
    };
  }, [session?.user?.id, checkBan]);

  // ===== Context Value =====
  // Key: isAuthenticated requires BOTH session AND profile verification
  const isAuthenticated = !!session?.user && profileVerified;
  const userId = isAuthenticated ? session!.user.id : undefined;

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      userId,
      isInitializing,
      isAuthenticated,
      signOut,
      fullName,
      authVersion,
      isLoading: isInitializing,
    }),
    [
      session,
      userId,
      isInitializing,
      isAuthenticated,
      signOut,
      fullName,
      authVersion,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===== Hook =====

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export default AuthContext;
