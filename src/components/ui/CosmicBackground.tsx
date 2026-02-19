/**
 * CosmicBackground.tsx
 * 
 * Animated Cosmic Background with Purple & Red Gradients
 */

import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface CosmicBackgroundProps {
  intensity?: number;
}

export function CosmicBackground({ intensity = 1 }: CosmicBackgroundProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Slow rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 60000 * (1 / intensity),
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Gentle pulsing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 8000 }),
        withTiming(1, { duration: 8000 })
      ),
      -1,
      true
    );
  }, [intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <>
      {/* Base Dark Background */}
      <LinearGradient
        colors={[
          '#050510',
          '#0a0a15',
          '#0f0f1a',
        ] as [string, string, ...string[]]}
        style={styles.baseGradient}
      />

      {/* Animated Cosmic Layer */}
      <Animated.View style={[styles.cosmicLayer, animatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(88, 28, 135, 0.15)',    // Darker Purple
            'rgba(147, 51, 234, 0.12)',   // Purple
            'rgba(168, 85, 247, 0.1)',    // Light Purple
            'rgba(236, 72, 153, 0.08)',   // Pink
            'rgba(88, 28, 135, 0.15)',    // Back to start
          ] as [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Glow Overlays */}
      <LinearGradient
        colors={[
          'rgba(88, 28, 135, 0.08)',
          'rgba(0, 0, 0, 0)',
          'rgba(147, 51, 234, 0.08)',
        ] as [string, string, ...string[]]}
        style={styles.glowOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cosmicLayer: {
    ...StyleSheet.absoluteFillObject,
    width: width * 1.5,
    height: height * 1.5,
    left: -width * 0.25,
    top: -height * 0.25,
  },
  gradient: {
    flex: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
});
