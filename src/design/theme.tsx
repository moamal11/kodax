/**
 * ThemeProvider + makeStyles.
 *
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.colors.surface } }));
 *   function Comp() { const s = useStyles(); ... }
 *
 * الأنماط تُبنى مرة واحدة لكل theme (cache)، فإضافة مود نهاري لاحقاً = تبديل قيمة الـprovider فقط.
 */
import React, { createContext, useContext, useMemo } from 'react';
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

/** المود النهاري غير معروض للمستخدم: يُفحص فقط في التطوير (أو بناء فحص محلي EXPO_PUBLIC_THEME_PREVIEW=1) على الويب عبر ?theme=light */
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

export function ThemeProvider({ children, mode }: { children: React.ReactNode; mode?: ThemeMode }) {
  const value = useMemo(() => THEMES[mode ?? initialMode()], [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
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

