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
 * - Mobile (fromApp=1): Redirects to kodax://auth/success deep link with tokens
 * - Web: Supabase's `detectSessionInUrl: true` handles token parsing automatically.
 *   We only call setSession() as a safety fallback if detectSessionInUrl didn't fire.
 *   The _layout.tsx onAuthStateChange listener handles navigation to /(tabs).
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

        const url = new URL(window.location.href);
        fromApp = url.searchParams.get('fromApp');
      }

      // ===== MOBILE FLOW: redirect to deep link =====
      if (fromApp === '1' && access_token && refresh_token) {
        console.log('📱 Mobile flow — redirecting to deep link');
        const deepLinkUrl = `kodax://auth/success${window.location.hash}`;
        window.location.href = deepLinkUrl;
        return;
      }

      // ===== WEB FLOW =====
      // detectSessionInUrl may have already parsed the tokens and fired
      // SIGNED_IN via onAuthStateChange. Check if session already exists:
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        // Session already set by detectSessionInUrl — just clean URL and go
        console.log('🌐 Session already set by detectSessionInUrl');
        window.history.replaceState({}, document.title, '/');
        // Navigation will be handled by _layout.tsx onAuthStateChange
        // But as safety, redirect after a short delay
        setTimeout(() => router.replace('/(tabs)'), 300);
        return;
      }

      // Fallback: manually set session if detectSessionInUrl didn't handle it
      if (!access_token || !refresh_token) {
        // No tokens at all — wait briefly for detectSessionInUrl
        await new Promise((r) => setTimeout(r, 1500));
        const {
          data: { session: delayedSession },
        } = await supabase.auth.getSession();
        if (delayedSession) {
          window.history.replaceState({}, document.title, '/');
          router.replace('/(tabs)');
          return;
        }
        throw new Error('لم يتم استلام معلومات التحقق');
      }

      console.log('🌐 Setting session manually (fallback)');
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

      // Clean URL for security
      window.history.replaceState({}, document.title, '/');

      // onAuthStateChange in _layout.tsx will handle navigation
      // Safety fallback redirect
      setTimeout(() => router.replace('/(tabs)'), 300);
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
