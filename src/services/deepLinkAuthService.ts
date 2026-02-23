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

// ===== Deduplication: prevent processing the same URL twice =====
// (can happen when both WebBrowser result AND Linking.addEventListener fire)
let _lastProcessedUrl: string | null = null;
let _lastProcessedAt: number = 0;
const DEDUP_WINDOW_MS = 5000; // 5 ثوانٍ نافذة التكرار

function parseUrlHash(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  try {
    // Extract hash part (#access_token=...)
    const hashMatch = url.match(/#(.+)$/);
    if (hashMatch) {
      const hashString = hashMatch[1];
      const pairs = hashString.split('&');

      for (const pair of pairs) {
        // Use indexOf to find the FIRST '=' only — value may contain '='
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) continue;
        const key = pair.substring(0, eqIndex);
        const rawValue = pair.substring(eqIndex + 1);
        if (key) {
          params[key] = decodeURIComponent(rawValue);
        }
      }
    }

    // Also check query params (?access_token=...)
    const queryMatch = url.match(/\?([^#]+)/);
    if (queryMatch) {
      const queryString = queryMatch[1];
      const pairs = queryString.split('&');

      for (const pair of pairs) {
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) continue;
        const key = pair.substring(0, eqIndex);
        const rawValue = pair.substring(eqIndex + 1);
        if (key) {
          params[key] = decodeURIComponent(rawValue);
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

    // ===== Deduplication: prevent double-processing =====
    const now = Date.now();
    if (_lastProcessedUrl === url && now - _lastProcessedAt < DEDUP_WINDOW_MS) {
      console.log('⏭️ Skipping duplicate deep link (already processed)');
      return { success: true };
    }
    _lastProcessedUrl = url;
    _lastProcessedAt = now;

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

    // ✅ إنشاء ملف المستخدم فوراً قبل أي restart
    // هذا ضروري لأن triggerAppRestart يقتل ensureProfile في AuthContext
    const user = data.user;
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existing) {
          const meta = user.user_metadata || {};
          const name =
            meta.full_name || meta.name || meta.display_name || '';
          const avatarUrl = meta.avatar_url || meta.picture || null;
          const emailBase = (user.email || '')
            .split('@')[0]
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .substring(0, 14);
          const idSuffix = user.id.replace(/-/g, '').substring(0, 6);
          const username = `${emailBase}_${idSuffix}`.toLowerCase();

          await supabase.from('profiles').insert({
            id: user.id,
            username,
            full_name: name || username,
            avatar_url: avatarUrl,
            xp: 0,
            level: 1,
            streak_days: 0,
          });
          console.log('✅ Profile created in processAuthDeepLink');
        } else {
          console.log('✅ Profile already exists');
        }
      } catch (profileError: any) {
        if (
          !profileError?.message?.includes('duplicate') &&
          !profileError?.code?.includes('23505')
        ) {
          console.warn(
            '[DeepLinkAuth] Profile creation warning:',
            profileError?.message
          );
        }
      }
    }

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
