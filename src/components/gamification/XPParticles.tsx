/**
 * XPParticles.tsx
 * 
 * Description: Particle system for XP gain with physics simulation
 * Features: Configurable particles, physics simulation, color trails, burst animation
 * Props: {amount} - XP amount, {color} - Particle color, {onComplete} - Animation complete callback
 * 
 * @example
 * <XPParticles amount={100} color="#f59e0b" onComplete={handleComplete} />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// Types
interface XPParticlesProps {
  amount: number;
  color?: string;
  onComplete?: () => void;
  particleCount?: number;
  size?: number;
}

interface ParticleProps {
  index: number;
  color: string;
  size: number;
  onComplete?: () => void;
}

// Single Particle
const Particle = ({ index, color, size, onComplete }: ParticleProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const angle = (index * 360) / 12;
    const distance = 80 + Math.random() * 40;
    const radian = (angle * Math.PI) / 180;
    const delay = index * 50;

    // Initial burst
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, {
          damping: 10,
          stiffness: 300,
        }),
        withDelay(300, withTiming(0, { duration: 300 }))
      )
    );

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      )
    );

    // Move outward
    translateX.value = withDelay(
      delay,
      withSequence(
        withSpring(Math.cos(radian) * distance, {
          damping: 15,
          stiffness: 200,
        }),
        withTiming(Math.cos(radian) * distance * 1.3, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        })
      )
    );

    translateY.value = withDelay(
      delay,
      withSequence(
        withSpring(Math.sin(radian) * distance, {
          damping: 15,
          stiffness: 200,
        }),
        withSequence(
          withTiming(Math.sin(radian) * distance * 0.8, {
            duration: 150,
            easing: Easing.out(Easing.ease),
          }),
          withTiming(Math.sin(radian) * distance * 1.5, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          })
        )
      )
    );

    // Rotation
    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 720 - 360, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );

    // Callback when last particle completes
    if (index === 11 && onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, delay + 800);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

// Main Component
export function XPParticles({
  amount,
  color = '#f59e0b',
  onComplete,
  particleCount = 12,
  size = 10,
}: XPParticlesProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: particleCount }).map((_, index) => (
        <Particle
          key={index}
          index={index}
          color={color}
          size={size}
          onComplete={index === particleCount - 1 ? onComplete : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
});
