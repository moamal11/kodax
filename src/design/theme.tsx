/**
 * ThemeProvider + makeStyles.
 *
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.colors.surface } }));
 *   function Comp() { const s = useStyles(); ... }
 *
 * الأنماط تُبنى مرة واحدة لكل theme (cache)، فإضافة مود نهاري لاحقاً = تبديل قيمة الـprovider فقط.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, StyleSheet } from 'react-native';
import { palettes, space, radius, fontFamily, typeScale, motion, layout, type ColorTokens, type ThemeMode } from './tokens';

export type Theme = {
  mode: ThemeMode;
  colors: ColorTokens;
  space: typeof space;
  radius: typeof radius;
  font: typeof fontFamily;
  type: typeof typeScale;
  motion: typeof motion;
  layout: typeof layout;
};

const build = (mode: ThemeMode): Theme => ({ mode, colors: palettes[mode], space, radius, font: fontFamily, type: typeScale, motion, layout });
const THEMES: Record<ThemeMode, Theme> = { dark: build('dark'), light: build('light') };

/** معاينة تطوير اختيارية؛ تفضيل المستخدم المحفوظ له الأولوية، والافتراضي داكن. */
const PREVIEW_ALLOWED = __DEV__ || process.env.EXPO_PUBLIC_THEME_PREVIEW === '1';
function initialMode(): ThemeMode {
  if (PREVIEW_ALLOWED && Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      if (new URLSearchParams(window.location.search).get('theme') === 'light') {
        window.sessionStorage?.setItem('kodax-theme-preview', 'light');
      }
      if (window.sessionStorage?.getItem('kodax-theme-preview') === 'light') return 'light';
    } catch {
      // تجاهل
    }
  }
  return 'dark';
}

const ThemeContext = createContext<Theme>(THEMES.dark);
const THEME_STORAGE_KEY = 'kodax-theme-mode';
const ThemePreferenceContext = createContext({
  ready: false,
  setMode: async (_mode: ThemeMode): Promise<void> => {},
});

export function ThemeProvider({ children, mode }: { children: React.ReactNode; mode?: ThemeMode }) {
  // Keep server and first browser render identical; restore the saved choice after mounting.
  const [preferredMode, setPreferredMode] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (active) setPreferredMode(saved === 'light' || saved === 'dark' ? saved : initialMode());
      })
      .catch(() => { /* Keep the default dark mode when storage is unavailable. */ })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const setMode = useCallback(async (next: ThemeMode) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    setPreferredMode(next);
  }, []);
  const value = THEMES[mode ?? preferredMode];
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.colorScheme = value.mode;
    root.style.backgroundColor = value.colors.bg;
    root.style.setProperty('--kx-scroll-thumb', value.colors.borderStrong);
    root.style.setProperty('--kx-scroll-hover', value.colors.textMuted);
  }, [value]);
  return <ThemePreferenceContext.Provider value={{ ready, setMode }}>
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  </ThemePreferenceContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useThemePreference = () => useContext(ThemePreferenceContext);
export const useColors = () => useContext(ThemeContext).colors;

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (t: Theme) => T) {
  const cache = new Map<ThemeMode, T>();
  return function useStyles(): T {
    const t = useTheme();
    let s = cache.get(t.mode);
    if (!s) {
      s = StyleSheet.create(factory(t)) as T;
      cache.set(t.mode, s);
    }
    return s;
  };
}
