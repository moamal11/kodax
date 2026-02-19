/**
 * Deep Link Authentication Service
 *
 * Handles OAuth tokens received via deep linking on mobile devices
 * Processes kodax://auth/success URLs and extracts authentication tokens
 */

import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

export interface DeepLinkAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Parse URL hash to extract OAuth tokens
 * Supports both # and ? query formats
 */
function parseUrlHash(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  try {
    // Extract hash part (#access_token=...)
    const hashMatch = url.match(/#(.+)$/);
    if (hashMatch) {
      const hashString = hashMatch[1];
      const pairs = hashString.split('&');

      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      }
    }

    // Also check query params (?access_token=...)
    const queryMatch = url.match(/\?([^#]+)/);
    if (queryMatch) {
      const queryString = queryMatch[1];
      const pairs = queryString.split('&');

      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error parsing URL hash:', error);
  }

  return params;
}

/**
 * Process OAuth deep link and authenticate user
 * Called when kodax://auth/success URL is received
 */
export async function processAuthDeepLink(
  url: string
): Promise<DeepLinkAuthResult> {
  try {
    console.log('🔗 Processing auth deep link:', url);

    // Parse URL to extract tokens
    const params = parseUrlHash(url);

    const { access_token, refresh_token, error, error_description } = params;

    // Handle OAuth errors
    if (error) {
      console.error('❌ OAuth error from deep link:', error, error_description);
      return {
        success: false,
        error: error_description || error,
      };
    }

    // Validate tokens
    if (!access_token || !refresh_token) {
      console.error('❌ Missing tokens in deep link');
      return {
        success: false,
        error: 'لم يتم استلام معلومات التحقق',
      };
    }

    console.log('🔐 Setting session with tokens from deep link...');

    // Set session with extracted tokens
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      throw sessionError;
    }

    console.log('✅ Session established from deep link:', data.user?.email);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error processing auth deep link:', error);
    return {
      success: false,
      error: error.message || 'فشل تسجيل الدخول',
    };
  }
}

/**
 * Initialize deep link listener for OAuth callbacks
 * Should be called once when app starts (in root layout)
 */
export function initializeDeepLinkAuthListener(
  onSuccess: () => void,
  onError: (error: string) => void
): () => void {
  // Only set up listener on mobile
  if (Platform.OS === 'web') {
    console.log('⏭️ Skipping deep link listener on web');
    return () => {};
  }

  console.log('📡 Initializing deep link auth listener...');

  // Handle initial URL (app opened via deep link)
  Linking.getInitialURL().then((url) => {
    if (url && url.includes('kodax://auth/success')) {
      console.log('🔗 Initial URL contains auth deep link:', url);
      handleAuthUrl(url);
    }
  });

  // Handle incoming deep links (app already open)
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url.includes('kodax://auth/success')) {
      console.log('🔗 Received auth deep link:', url);
      handleAuthUrl(url);
    }
  });

  async function handleAuthUrl(url: string) {
    const result = await processAuthDeepLink(url);

    if (result.success) {
      onSuccess();
    } else {
      onError(result.error || 'فشل تسجيل الدخول');
    }
  }

  // Return cleanup function
  return () => {
    subscription.remove();
  };
}

export default {
  processAuthDeepLink,
  initializeDeepLinkAuthListener,
};
