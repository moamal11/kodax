/**
 * useResponsiveLayout.ts
 *
 * Hook for responsive layout adjustments
 * Breakpoints:
 *   - Mobile: < 768px
 *   - Tablet: 768px - 1000px
 *   - Desktop: > 1000px
 */

import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1000;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width >= MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const isDesktop = width >= TABLET_BREAKPOINT;
  const isWeb = Platform.OS === 'web';
  const isMobile = !isWeb || width < MOBILE_BREAKPOINT;

  // Top bar height on large screens
  const topBarHeight = isLargeScreen && isWeb ? 60 + (insets.top || 0) : 0;

  // Bottom bar height - adjusted for web to prevent content overlap
  // On native Android, the system navigation bar (gesture/buttons) can clip
  // the bottom of pages. We add extra padding to ensure nothing is hidden.
  const bottomBarHeight = isWeb
    ? isMobile
      ? 80
      : 0 // Web mobile: 80px
    : isMobile
      ? 110 + Math.max(insets.bottom, 20)
      : 0; // Native: increased to prevent Android nav bar overlap

  return {
    isLargeScreen,
    isTablet,
    isDesktop,
    isWeb,
    isMobile,
    width,
    height,
    topBarHeight,
    bottomBarHeight,
    insets,
    // Content padding to avoid overlapping with bars
    contentPaddingTop: topBarHeight,
    contentPaddingBottom: bottomBarHeight,
  };
}
