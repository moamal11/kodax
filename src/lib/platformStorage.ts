/**
 * Platform-safe storage wrapper used by Supabase and services.
 * On web it uses window.localStorage (async API shim).
 * On native it requires @react-native-async-storage/async-storage.
 */
let storage: any = null;

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
    async clear() {
      window.localStorage.clear();
      return Promise.resolve();
    },
    async getAllKeys() {
      try {
        const keys: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k) keys.push(k);
        }
        return Promise.resolve(keys);
      } catch (e) {
        return Promise.resolve([]);
      }
    },
    async multiGet(keys: string[]) {
      return Promise.resolve(
        keys.map((k) => [k, window.localStorage.getItem(k)])
      );
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
  try {
    // Native path
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    storage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    // Fallback stub to avoid runtime errors during builds
    storage = {
      async getItem() {
        return null;
      },
      async setItem() {
        return;
      },
      async removeItem() {
        return;
      },
      async clear() {
        return;
      },
      async getAllKeys() {
        return [];
      },
      async multiGet() {
        return [];
      },
      async multiSet() {
        return;
      },
      async multiRemove() {
        return;
      },
    };
  }
}

export default storage;
