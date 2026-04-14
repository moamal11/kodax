/**
 * CosmicCard.tsx
 *
 * Description: Enhanced glass card with cosmic effects, gradient border, and glow on hover
 * Features: Gradient border, glow on press, smooth transitions, inner shadow, customizable colors
 * Props: {glowColor} - Glow color, {animated} - Enable animations, {children} - Card content
 *
 * @example
 * <CosmicCard glowColor="#7c3aed" animated onPress={handlePress}>
 *   <Text>Content</Text>
 * </CosmicCard>
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// Types
interface CosmicCardProps {
  children: React.ReactNode;
  glowColor?: string;
  animated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: number;
  gradientColors?: string[];
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function CosmicCard({
  children,
  glowColor = '#7c3aed',
  animated = true,
  onPress,
  style,
  intensity = 80,
  gradientColors = ['rgba(124, 58, 237, 0.3)', 'rgba(236, 72, 153, 0.2)'],
  disabled = false,
}: CosmicCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    if (!animated || !onPress) return;

    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });

    pressed.value = withTiming(1, { duration: 150 });

    glowOpacity.value = withTiming(0.9, { duration: 200 });
  }, [animated, onPress]);

  const handlePressOut = useCallback(() => {
    if (!animated || !onPress) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });

    pressed.value = withTiming(0, { duration: 300 });

    glowOpacity.value = withTiming(0, { duration: 400 });
  }, [animated, onPress]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 1.05]) }],
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [0.6, 1]),
  }));

  const CardWrapper = onPress ? AnimatedTouchable : Animated.View;
  const wrapperProps = onPress
    ? {
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        onPress,
        activeOpacity: 1,
        disabled,
      }
    : {};

  return (
    <CardWrapper
      style={[styles.container, animatedContainerStyle, style]}
      {...wrapperProps}
    >
      {/* Glow Effect */}
      {animated && onPress && (
        <Animated.View
          style={[
            styles.glow,
            {
              shadowColor: glowColor,
            },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Gradient Border */}
      <Animated.View style={[styles.borderContainer, animatedBorderStyle]}>
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        />
      </Animated.View>

      {/* Glass Card */}
      {Platform.OS === 'android' ? (
        <View
          style={[
            styles.blurContainer,
            { backgroundColor: 'rgba(15, 15, 30, 0.92)' },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.05)',
              'rgba(255, 255, 255, 0.02)',
              'rgba(0, 0, 0, 0.05)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.innerShadow}
          />
          <Animated.View style={styles.content}>{children}</Animated.View>
        </View>
      ) : (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.05)',
              'rgba(255, 255, 255, 0.02)',
              'rgba(0, 0, 0, 0.05)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.innerShadow}
          />
          <Animated.View style={styles.content}>{children}</Animated.View>
        </BlurView>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  borderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 1,
    borderRadius: 20,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: 1,
  },
  innerShadow: {
    position: 'absolute',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: 50,
    flexDirection: 'column',
  },
});
