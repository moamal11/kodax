import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Unified OAuth Callback Handler
 *
 * Handles OAuth redirects for both web and mobile:
 * - If fromApp=1: Redirects to kodax://auth/success with tokens (for mobile)
 * - Otherwise: Sets session and redirects to dashboard (for web)
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [statusMessage, setStatusMessage] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log('🔄 Processing unified OAuth callback...');

      let access_token: string | null = null;
      let refresh_token: string | null = null;
      let fromApp: string | null = null;

      // ===== WEB: Read from URL hash =====
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;

        if (hash) {
          const hashParams = new URLSearchParams(hash.replace('#', ''));

          access_token = hashParams.get('access_token');
          refresh_token = hashParams.get('refresh_token');
        }

        // read query params normally
        const url = new URL(window.location.href);
        fromApp = url.searchParams.get('fromApp');
      }

      // ===== Safety check =====
      if (!access_token || !refresh_token) {
        throw new Error('لم يتم استلام معلومات التحقق');
      }

      // ===== MOBILE FLOW =====
      if (fromApp === '1') {
        console.log('📱 Mobile flow detected');

        const deepLinkUrl = `kodax://auth/success${window.location.hash}`;

        window.location.href = deepLinkUrl;
        return;
      }

      // ===== WEB FLOW =====
      console.log('🌐 Web flow detected');

      // Try to set session with retries — some browsers may time out acquiring
      // the Navigator LockManager lock. Retry a few times with backoff.
      const setSessionWithRetries = async () => {
        const maxAttempts = 4;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;
            return;
          } catch (err: any) {
            const msg = err?.message || '';
            const isLockError =
              msg.includes('Lock') ||
              msg.includes('lock:') ||
              msg.includes('timed out') ||
              msg.includes('Navigator LockManager');

            if (attempt === maxAttempts || !isLockError) {
              throw err;
            }

            console.warn(
              `supabase setSession attempt ${attempt} failed, retrying...`,
              msg
            );
            // exponential-ish backoff
            await new Promise((res) => setTimeout(res, 300 * attempt));
          }
        }
      };

      await setSessionWithRetries();

      // تنظيف الرابط من التوكن (مهم أمنيًا)
      window.history.replaceState({}, document.title, '/');

      // On web there are cases where the auth state change listener may not
      // be delivered immediately (Navigator Lock contention). To ensure the
      // root layout picks up the new session we write a short-lived flag to
      // localStorage and then navigate to `/` (the layout will listen for
      // the flag and re-fetch the session). This helps both single-tab and
      // multi-tab flows.
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          try {
            window.localStorage.setItem(
              'kodax_auth_update',
              Date.now().toString()
            );
          } catch (e) {
            // ignore localStorage errors
          }

          window.location.replace('/');
          return;
        } catch (e) {
          // ignore and fall through to router navigation
        }
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('❌ Callback error:', error);

      router.replace({
        pathname: '/(auth)/login',
        params: { error: error.message },
      });
    }
  };

  return (
    <LinearGradient
      colors={['#0a0a1a', '#0f0f2e', '#0a0a1a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#818cf8" />
        <Text style={styles.text}>{statusMessage}</Text>
        <Text style={styles.subtext}>الرجاء الانتظار</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 16,
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});
