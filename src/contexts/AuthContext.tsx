/**
 * AuthContext — مركز المصادقة الرئيسي
 *
 * المسؤوليات:
 * 1. استعادة الجلسة من التخزين المحلي (AsyncStorage / localStorage)
 * 2. الاستماع لتغييرات المصادقة عبر onAuthStateChange
 * 3. إدارة حالة المصادقة: session, user, isInitializing, isAuthenticated
 * 4. signOut مع مسح البيانات المحلية
 *
 * لا يحتوي على أي منطق تنقل — التنقل يتم في _layout.tsx
 *
 * الاستخدام:
 *   import { useAuth } from '@/contexts/AuthContext';
 *   const { user, session, isInitializing, signOut } = useAuth();
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
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { clearAllKodaxData } from '@/utils/clearUserData';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';
import { progressService } from '@/services/progressService';
import { hybridSyncService } from '@/services/hybridSyncService';
import { clearBroadcastCache } from '@/services/broadcastService';

// ===== Types =====

export interface AuthContextType {
  /** الجلسة الحالية */
  session: Session | null;
  /** المستخدم الحالي */
  user: User | null;
  /** هل التهيئة الأولى مستمرة؟ (true حتى يتم التحقق من الجلسة المخزنة) */
  isInitializing: boolean;
  /** هل المستخدم مسجل دخول؟ */
  isAuthenticated: boolean;
  /** تسجيل الخروج */
  signOut: () => Promise<void>;
  /** اسم المستخدم الكامل (للرسائل العامة) */
  fullName: string;
  /** عدد مرات تسجيل الدخول (يزيد عند كل تسجيل دخول جديد) */
  authVersion: number;
  /** حالة التحميل — للتوافق مع الكود القديم */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
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
  onReady?: () => void;
}

export function AuthProvider({ children, onReady }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fullName, setFullName] = useState('');
  const [authVersion, setAuthVersion] = useState(0);

  const mountedRef = useRef(true);
  const initCompleteRef = useRef(false);
  const lastEventRef = useRef<string | null>(null);

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
    await clearLocalData();
    await supabase.auth.signOut();
    if (mountedRef.current) {
      setSession(null);
      setFullName('');
      lastEventRef.current = null;
    }
  }, [clearLocalData]);

  // ===== Mark initialization complete =====
  const markInitComplete = useCallback(() => {
    if (!mountedRef.current || initCompleteRef.current) return;
    initCompleteRef.current = true;
    setIsInitializing(false);
    onReady?.();
  }, [onReady]);

  // ===== جلب اسم المستخدم =====
  const fetchFullName = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      if (data?.full_name && mountedRef.current) {
        setFullName(data.full_name);
      }
    } catch (_e) {
      // Silent
    }
  }, []);

  // ===== فحص الحظر =====
  const checkBan = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const { data: restrictions } = await supabase.rpc(
          'check_user_restrictions',
          { p_user_id: userId }
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
        // RPC غير موجود — نسمح بالدخول
      }
      return false;
    },
    [signOut]
  );

  // ===== Auth State Listener + Session Restoration =====
  useEffect(() => {
    mountedRef.current = true;

    // Safety timeout: إذا لم تكتمل التهيئة خلال 6 ثوانٍ
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && !initCompleteRef.current) {
        console.warn('[Auth] Safety timeout — forcing init complete');
        markInitComplete();
      }
    }, 6000);

    // 1. الاستماع لتغييرات المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      // تحديث الجلسة دائمًا
      setSession(newSession);

      if (event === 'INITIAL_SESSION') {
        // أول حدث — الجلسة المستعادة من التخزين
        markInitComplete();
        if (newSession?.user?.id) {
          setAuthVersion((v) => v + 1);
          lastEventRef.current = `SIGNED_IN:${newSession.user.id}`;
          checkBan(newSession.user.id);
          fetchFullName(newSession.user.id);
        }
      } else if (event === 'SIGNED_IN' && newSession) {
        markInitComplete();
        // منع التكرار لنفس المستخدم
        if (lastEventRef.current === `SIGNED_IN:${newSession.user.id}`) return;
        lastEventRef.current = `SIGNED_IN:${newSession.user.id}`;
        setAuthVersion((v) => v + 1);
        const isBanned = await checkBan(newSession.user.id);
        if (isBanned) return;
        fetchFullName(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        lastEventRef.current = 'SIGNED_OUT';
        setFullName('');
        markInitComplete();
      } else if (event === 'TOKEN_REFRESHED') {
        markInitComplete();
      }
    });

    // 2. Fallback لضمان عمل INITIAL_SESSION
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (!mountedRef.current) return;
      if (!error && s) {
        setSession(s);
      }
      // Fallback timeout
      setTimeout(() => {
        if (!initCompleteRef.current && mountedRef.current) {
          markInitComplete();
        }
      }, 1000);
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  // ===== Background Sync =====
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      hybridSyncService.clearUser();
      return;
    }

    const initSync = async () => {
      await hybridSyncService.setUser(userId);
      hybridSyncService.backgroundSync();
    };
    initSync();

    let lastSyncTime = 0;
    const SYNC_THROTTLE = Platform.OS === 'web' ? 30000 : 5000;

    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const now = Date.now();
        if (now - lastSyncTime < SYNC_THROTTLE) return;
        lastSyncTime = now;
        hybridSyncService.backgroundSync();
        if (userId) checkBan(userId);
      }
    });

    return () => {
      appStateSub?.remove();
    };
  }, [session?.user?.id, checkBan]);

  // ===== Context Value =====
  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      isInitializing,
      isAuthenticated: !!session?.user,
      signOut,
      fullName,
      authVersion,
      isLoading: isInitializing,
    }),
    [session, isInitializing, signOut, fullName, authVersion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===== Hook =====

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export default AuthContext;
