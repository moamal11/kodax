/**
 * AnimatedButton.tsx
 * 
 * Description: Button with particle burst on press, ripple effect, and scale animation
 * Features: Ripple effect, particle explosion, haptic feedback, scale animation, multiple variants
 * Props: {variant} - Button style, {onPress} - Press handler, {particles} - Enable particles
 * 
 * @example
 * <AnimatedButton variant="primary" onPress={handlePress} particles>
 *   Press Me
 * </AnimatedButton>
 */

import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Types
interface AnimatedButtonProps {
  children: string | React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  particles?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

interface ParticleProps {
  index: number;
  centerX: number;
  centerY: number;
  color: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Particle Component
const Particle = React.memo(({ index, centerX, centerY, color }: ParticleProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    const angle = (index * 360) / 8;
    const distance = 60;
    const radian = (angle * Math.PI) / 180;

    scale.value = withTiming(1, { duration: 100 });
    
    translateX.value = withSequence(
      withTiming(Math.cos(radian) * distance, { duration: 500 }),
      withTiming(Math.cos(radian) * distance * 1.2, { duration: 200 })
    );
    
    translateY.value = withSequence(
      withTiming(Math.sin(radian) * distance, { duration: 500 }),
      withTiming(Math.sin(radian) * distance * 1.2, { duration: 200 })
    );
    
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 400 })
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
          left: centerX,
          top: centerY,
          backgroundColor: color,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});

Particle.displayName = 'Particle';

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'medium',
  onPress,
  particles = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  haptic = true,
}: AnimatedButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const variantStyles = {
    primary: {
      colors: ['#7c3aed', '#3b82f6'],
      textColor: '#ffffff',
      particleColor: '#7c3aed',
    },
    secondary: {
      colors: ['#ec4899', '#f59e0b'],
      textColor: '#ffffff',
      particleColor: '#ec4899',
    },
    ghost: {
      colors: ['transparent', 'transparent'],
      textColor: '#7c3aed',
      particleColor: '#7c3aed',
    },
    success: {
      colors: ['#10b981', '#059669'],
      textColor: '#ffffff',
      particleColor: '#10b981',
    },
    danger: {
      colors: ['#ef4444', '#dc2626'],
      textColor: '#ffffff',
      particleColor: '#ef4444',
    },
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const handlePressIn = useCallback((event: any) => {
    if (disabled || loading) return;

    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.5;
    rippleScale.value = withTiming(1, { duration: 600 });
    rippleOpacity.value = withTiming(0, { duration: 600 });

    // Haptic feedback
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [disabled, loading, haptic]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  }, [disabled, loading]);

  const handlePress = useCallback((event: any) => {
    if (disabled || loading || !onPress) return;

    if (particles) {
      const { locationX, locationY } = event.nativeEvent;
      setParticlePosition({ x: locationX || 0, y: locationY || 0 });
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 700);
    }

    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  }, [disabled, loading, onPress, particles, haptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const isGhost = variant === 'ghost';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Ripple Effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: currentVariant.particleColor,
          },
          rippleStyle,
        ]}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={currentVariant.colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          isGhost && styles.ghostBorder,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: currentVariant.textColor,
              fontSize: currentSize.fontSize,
            },
            loading && styles.loadingText,
            textStyle,
          ]}
        >
          {loading ? 'Loading...' : children}
        </Text>
      </LinearGradient>

      {/* Particles */}
      {showParticles && particles && (
        <Animated.View style={styles.particlesContainer} pointerEvents="none">
          {Array.from({ length: 8 }).map((_, index) => (
            <Particle
              key={index}
              index={index}
              centerX={particlePosition.x}
              centerY={particlePosition.y}
              color={currentVariant.particleColor}
            />
          ))}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  ghostBorder: {
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  text: {
    fontWeight: '600',
  },
  loadingText: {
    opacity: 0.7,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
