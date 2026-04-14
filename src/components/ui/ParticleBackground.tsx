/**
 * ParticleBackground.tsx
 *
 * Description: Animated particle background with floating particles and glow effects
 * Features: Configurable density, random movement, opacity fade, glow effect, performance optimized
 * Props: {density} - Number of particles (default: 50), {color} - Particle color, {speed} - Animation speed
 *
 * @example
 * <ParticleBackground density={60} color="#7c3aed" speed={1.5} />
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
interface ParticleBackgroundProps {
  density?: number;
  color?: string;
  speed?: number;
  maxSize?: number;
  minSize?: number;
}

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  offsetX: number;
  offsetY: number;
}

// Single Particle Component
const Particle = React.memo(
  ({ config, color }: { config: ParticleConfig; color: string }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    useEffect(() => {
      // Fade in
      opacity.value = withDelay(
        config.delay,
        withTiming(Math.random() * 0.4 + 0.3, {
          duration: 1000,
          easing: Easing.out(Easing.ease),
        })
      );

      // Scale animation
      scale.value = withDelay(
        config.delay,
        withRepeat(
          withTiming(1 + Math.random() * 0.3, {
            duration: config.duration * 0.7,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        )
      );

      // Horizontal movement
      translateX.value = withDelay(
        config.delay,
        withRepeat(
          withTiming(config.offsetX, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        )
      );

      // Vertical movement
      translateY.value = withDelay(
        config.delay,
        withRepeat(
          withTiming(config.offsetY, {
            duration: config.duration * 1.2,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        )
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            left: config.x,
            top: config.y,
            width: config.size,
            height: config.size,
            backgroundColor: color,
            shadowColor: color,
          },
          animatedStyle,
        ]}
      />
    );
  }
);

Particle.displayName = 'Particle';

// Main Component
export function ParticleBackground({
  density = 50,
  color = '#8b5cf6',
  speed = 1,
  maxSize = 6,
  minSize = 2,
}: ParticleBackgroundProps) {
  // Generate particle configurations
  const particles = useMemo(() => {
    const configs: ParticleConfig[] = [];

    for (let i = 0; i < density; i++) {
      configs.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * (maxSize - minSize) + minSize,
        duration: (Math.random() * 10000 + 8000) / speed,
        delay: Math.random() * 2000,
        offsetX: (Math.random() - 0.5) * 100,
        offsetY: (Math.random() - 0.5) * 100,
      });
    }

    return configs;
  }, [density, speed, maxSize, minSize]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((config) => (
        <Particle key={config.id} config={config} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
});
