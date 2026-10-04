import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants';

/**
 * Platform-aware storage for Supabase auth persistence:
 * - Web → window.localStorage (wrapped in async API)
 * - Native (Android/iOS) → @react-native-async-storage/async-storage
 * - SSR/Node → in-memory Map (fallback)
 *
 * CRITICAL: On React Native, `window` exists but `window.localStorage` does NOT.
 * Previously the code fell through to the in-memory Map on native, causing
 * sessions to be lost on app restart. Now we explicitly check Platform.OS.
 */
let storage: any = undefined;

if (Platform.OS === 'web') {
  // Web: use localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    storage = {
      async getItem(key: string) {
        return Promise.resolve(window.localStorage.getItem(key));
      },
      async setItem(key: string, value: string) {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      async removeItem(key: string) {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
} else {
  // Native (Android / iOS): use AsyncStorage for persistent sessions
  try {
    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;
    storage = {
      async getItem(key: string) {
        return AsyncStorage.getItem(key);
      },
      async setItem(key: string, value: string) {
        return AsyncStorage.setItem(key, value);
      },
      async removeItem(key: string) {
        return AsyncStorage.removeItem(key);
      },
    };
  } catch (_e) {
    // Fallback: in-memory (SSR / build environment)
    const mem = new Map<string, string>();
    storage = {
      async getItem(key: string) {
        return Promise.resolve(mem.get(key) ?? null);
      },
      async setItem(key: string, value: string) {
        mem.set(key, value);
        return Promise.resolve();
      },
      async removeItem(key: string) {
        mem.delete(key);
        return Promise.resolve();
      },
    };
  }
}

const DEFAULT_SUPABASE_URL = 'https://krtulodnhmfuoxjqajwl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydHVsb2RuaG1mdW94anFhandsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzQ5NDAsImV4cCI6MjA4NTQ1MDk0MH0.sHwD5__uCn0_wRNR3635eOU3PZ1Int51EE8k7WTbHks';

const supabaseUrl = SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Web: auto-parse OAuth tokens from URL hash
    // Native: disabled — deep link handler calls setSession() manually
    detectSessionInUrl: isWeb,
    // Bypass Navigator LockManager on web to prevent stuck-loading after OAuth
    ...(isWeb && {
      lock: async (
        _name: string,
        _acquireTimeout: number,
        fn: () => Promise<any>
      ) => {
        return fn();
      },
    }),
  },
});
