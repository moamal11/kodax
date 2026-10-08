/**
 * hooks التخطيط والحركة المشتركة.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, useWindowDimensions } from 'react-native';
import { breakpoints, layout } from './tokens';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/** يتبع عرض النافذة الحالي (يتحدث مع تغيير الحجم بلا إعادة تحميل) */
export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const bp: Breakpoint = width >= breakpoints.desktop ? 'desktop' : width >= breakpoints.tablet ? 'tablet' : 'phone';
  return {
    width,
    height,
    bp,
    isPhone: bp === 'phone',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    /** شريط جانبي دائم (Desktop ويب فقط) */
    hasSidebar: Platform.OS === 'web' && width >= breakpoints.desktop,
    gutter: width >= breakpoints.tablet ? layout.gutterDesktop : layout.gutterPhone,
  };
}

/** تقليل الحركة: إعداد النظام (Android/iOS) أو prefers-reduced-motion على الويب */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const on = () => setReduced(mq.matches);
      mq.addEventListener?.('change', on);
      return () => mq.removeEventListener?.('change', on);
    }
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v)).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(v));
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
