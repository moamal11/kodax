/**
 * useResponsiveLayout.ts
 *
 * Hook for responsive layout adjustments
 */

import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOBILE_BREAKPOINT = 768;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width >= MOBILE_BREAKPOINT;
  const isWeb = Platform.OS === 'web';
  const isMobile = !isWeb || width < MOBILE_BREAKPOINT;

  // Top bar height on large screens
  const topBarHeight = isLargeScreen && isWeb ? 60 + (insets.top || 0) : 0;

  // Bottom bar height - adjusted for web to prevent content overlap
  const bottomBarHeight = isWeb
    ? isMobile
      ? 80
      : 0 // في الويب الموبايل: 80px
    : isMobile
      ? 100 + Math.max(insets.bottom, 10)
      : 0; // في التطبيق الأصلي

  return {
    isLargeScreen,
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
