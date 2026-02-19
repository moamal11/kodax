
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants';

// Platform-aware storage
let storage: any = undefined;
if (typeof window !== 'undefined' && window.localStorage) {
  // Wrap window.localStorage to async API expected by supabase-js
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
    async getAllKeys() {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k) keys.push(k);
      }
      return Promise.resolve(keys);
    },
    async multiGet(keys: string[]) {
      return Promise.resolve(keys.map((k) => [k, window.localStorage.getItem(k)]));
    },
    async multiSet(entries: [string, string][]) {
      entries.forEach(([k, v]) => window.localStorage.setItem(k, v));
      return Promise.resolve();
    },
    async multiRemove(keys: string[]) {
      keys.forEach((k) => window.localStorage.removeItem(k));
      return Promise.resolve();
    },
  };
} else {
  // Node / SSR: provide a safe in-memory storage so that auth-js does not
  // attempt to require native AsyncStorage (which references `window`).
  const mem = new Map<string, string>();
  storage = {
    async getItem(key: string) {
      return Promise.resolve(mem.has(key) ? mem.get(key) ?? null : null);
    },
    async setItem(key: string, value: string) {
      mem.set(key, value);
      return Promise.resolve();
    },
    async removeItem(key: string) {
      mem.delete(key);
      return Promise.resolve();
    },
    async getAllKeys() {
      return Promise.resolve(Array.from(mem.keys()));
    },
    async multiGet(keys: string[]) {
      return Promise.resolve(keys.map((k) => [k, mem.get(k) ?? null]));
    },
    async multiSet(entries: [string, string][]) {
      entries.forEach(([k, v]) => mem.set(k, v));
      return Promise.resolve();
    },
    async multiRemove(keys: string[]) {
      keys.forEach((k) => mem.delete(k));
      return Promise.resolve();
    },
  };
}

// Check if Supabase credentials are configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase credentials not configured. Using temporary development mode.'
  );
  console.warn(
    'Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file'
  );
}

// Use dummy values for development if not configured
const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey =
  SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
