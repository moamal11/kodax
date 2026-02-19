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

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

      // تنظيف الرابط من التوكن (مهم أمنيًا)
      window.history.replaceState({}, document.title, '/');

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
