/**
 * Skeleton.tsx
 * 
 * Description: Loading skeleton with shimmer animation
 * Features: Shimmer animation, multiple variants, responsive, customizable size
 * Props: {variant} - Skeleton type, {width} - Width, {height} - Height
 * 
 * @example
 * <Skeleton variant="text" width="80%" height={20} />
 * <Skeleton variant="circle" width={50} height={50} />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Types
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

export function Skeleton({
  variant = 'text',
  width = '100%',
  height = 20,
  style,
  shimmer = true,
}: SkeletonProps) {
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    if (shimmer) {
      shimmerTranslate.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      );
    }
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: shimmerTranslate.value * 400,
      },
    ],
  }));

  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return 999;
      case 'rounded':
        return 12;
      case 'text':
        return 6;
      case 'rectangular':
        return 0;
      default:
        return 6;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius: getBorderRadius(),
        },
        style,
      ]}
    >
      {shimmer && (
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.1)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          />
        </Animated.View>
      )}
    </View>
  );
}

// Skeleton Group Component for multiple skeletons
interface SkeletonGroupProps {
  count?: number;
  spacing?: number;
  variant?: SkeletonProps['variant'];
  height?: number;
}

export function SkeletonGroup({
  count = 3,
  spacing = 12,
  variant = 'text',
  height = 20,
}: SkeletonGroupProps) {
  return (
    <View style={[styles.group, { gap: spacing }]}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    width: 200,
    height: '100%',
  },
  group: {
    width: '100%',
  },
});
