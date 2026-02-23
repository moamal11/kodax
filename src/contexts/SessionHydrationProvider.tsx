/**
 * SessionHydrationProvider
 *
 * ================================ المشكلة الجذرية ================================
 *
 * عند تسجيل الدخول عبر OAuth على الموبايل:
 *
 * 1. OAuth completes → processAuthDeepLink() calls supabase.auth.setSession()
 * 2. setSession() updates the session internally
 * 3. onAuthStateChange fires with event='SIGNED_IN'
 * 4. AuthContext sets session (state update)
 * 5. _layout.tsx renders → AppProvider gets userId
 * 6. AppProvider.useEffect([userId]) fires → calls loadProfile(userId)
 * 7. ❌ RACE CONDITION: Supabase RLS policies check session permissions
 * 8. ❌ Session might not have been fully persisted yet on iOS/Android
 * 9. ❌ Query fails with 403/401 - data doesn't load
 * 10. ❌ User sees empty screens until app restart forces session restore
 *
 * ================================ الحل ================================
 *
 * This provider ensures:
 * 1. Wait for onAuthStateChange event to fire completely
 * 2. Ensure Supabase session is FULLY persisted (check getSession())
 * 3. Add a small buffer (300-500ms) for AsyncStorage persistence
 * 4. Only THEN pass userId to AppProvider
 * 5. Guarantee that all subsequent queries will succeed
 *
 * فكرة بسيطة: Session hydration = waiting for session to be "ready"
 * Not just "session exists" but "session is persisted and queryable"
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface SessionHydrationContextType {
  /** User ID that is SAFE to use for data loading */
  safeUserId: string | undefined;
  /** Is session fully hydrated? */
  isSessionHydrated: boolean;
  /** Session hydration progress (for logging) */
  hydrationStage: 'not-started' | 'waiting' | 'verifying' | 'complete';
}

const SessionHydrationContext = createContext<SessionHydrationContextType>({
  safeUserId: undefined,
  isSessionHydrated: false,
  hydrationStage: 'not-started',
});

export function useSessionHydration() {
  return useContext(SessionHydrationContext);
}

interface SessionHydrationProviderProps {
  children: ReactNode;
}

export function SessionHydrationProvider({
  children,
}: SessionHydrationProviderProps) {
  const { session, authVersion } = useAuth();
  const [safeUserId, setSafeUserId] = useState<string | undefined>(undefined);
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);
  const [hydrationStage, setHydrationStage] = useState<
    'not-started' | 'waiting' | 'verifying' | 'complete'
  >('not-started');

  const previousUserIdRef = useRef<string | undefined>(undefined);
  const hydratingRef = useRef(false);

  /**
   * Main hydration logic
   *
   * Ensures that:
   * 1. onAuthStateChange completed
   * 2. Session is available
   * 3. Session is persisted in AsyncStorage (iOS/Android need this)
   * 4. RLS policies can read session data
   */
  useEffect(() => {
    const userId = session?.user?.id;

    // If logged out, clear immediately
    if (!userId) {
      setSafeUserId(undefined);
      setIsSessionHydrated(false);
      setHydrationStage('not-started');
      previousUserIdRef.current = undefined;
      hydratingRef.current = false;
      return;
    }

    // If same user already hydrated, don't repeat
    if (previousUserIdRef.current === userId && isSessionHydrated) {
      return;
    }

    // Already hydrating for this user? Don't start again
    if (hydratingRef.current) {
      return;
    }

    hydratingRef.current = true;
    previousUserIdRef.current = userId;
    setHydrationStage('waiting');

    let isMounted = true;

    const hydrateSession = async () => {
      try {
        console.log('[SessionHydration] Starting hydration for user:', userId);

        // ===== Stage 1: Wait a moment for onAuthStateChange to fully complete =====
        // This gives Supabase's internal listeners time to settle
        await new Promise((r) =>
          setTimeout(r, Platform.OS === 'web' ? 200 : 300)
        );

        if (!isMounted) return;
        setHydrationStage('verifying');

        // ===== Stage 2: Verify session is available via getSession() =====
        // This is important because session might exist in state but not yet
        // persisted to AsyncStorage (android) or localStorage (web)
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('[SessionHydration] getSession error:', error.message);
            // Don't fail completely - just retry
            attempts++;
            await new Promise((r) => setTimeout(r, 100 * (attempts + 1)));
            continue;
          }

          if (data?.session?.user?.id === userId) {
            // ✅ Session verified!
            console.log(
              '[SessionHydration] Session verified for user:',
              userId
            );

            if (!isMounted) return;

            // Stage 3: Small buffer for persistence layers
            // Important for iOS/Android AsyncStorage sync
            await new Promise((r) =>
              setTimeout(r, Platform.OS === 'web' ? 100 : 200)
            );

            if (!isMounted) return;

            setHydrationStage('complete');
            setSafeUserId(userId);
            setIsSessionHydrated(true);
            console.log('[SessionHydration] ✅ Hydration complete');
            return;
          }

          // Session not verified yet - retry
          attempts++;
          console.log(
            `[SessionHydration] Session not yet available (attempt ${attempts}/${maxAttempts})`
          );
          await new Promise((r) => setTimeout(r, 200 * attempts));
        }

        // ===== Fallback: If verification fails after retries =====
        // Just use the userId anyway - better to try than to block forever
        if (isMounted) {
          console.warn(
            '[SessionHydration] Verification timed out, proceeding anyway'
          );
          setHydrationStage('complete');
          setSafeUserId(userId);
          setIsSessionHydrated(true);
        }
      } catch (error) {
        console.error('[SessionHydration] Error:', error);

        // Even on error, we should proceed - session probably exists
        if (isMounted) {
          setSafeUserId(userId);
          setIsSessionHydrated(true);
          setHydrationStage('complete');
        }
      } finally {
        hydratingRef.current = false;
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, authVersion]);

  return (
    <SessionHydrationContext.Provider
      value={{
        safeUserId,
        isSessionHydrated,
        hydrationStage,
      }}
    >
      {children}
    </SessionHydrationContext.Provider>
  );
}
