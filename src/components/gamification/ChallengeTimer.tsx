/**
 * ChallengeTimer.tsx
 *
 * Description: Countdown timer for timed challenges with circular progress
 * Features: Circular progress, time remaining, urgent animation, complete celebration
 * Props: {duration} - Timer duration in seconds, {onComplete} - Completion handler, {urgent} - Urgent threshold
 *
 * @example
 * <ChallengeTimer duration={300} onComplete={handleComplete} urgent={60} />
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

// Types
interface ChallengeTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  urgent?: number; // urgent threshold in seconds
  paused?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

export function ChallengeTimer({
  duration,
  onComplete,
  urgent = 60,
  paused = false,
}: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = useSharedValue(1);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Timer logic
  useEffect(() => {
    if (paused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, paused, onComplete]);

  // Update progress
  useEffect(() => {
    progress.value = withTiming(timeLeft / duration, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [timeLeft, duration]);

  // Urgent animation
  useEffect(() => {
    if (timeLeft <= urgent && timeLeft > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 250 }),
          withTiming(1, { duration: 250 })
        ),
        -1,
        false
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 500 }),
          withTiming(0.4, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      glowOpacity.value = withTiming(0);
    }
  }, [timeLeft, urgent]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return { strokeDashoffset };
  });

  const scaleStyle = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
  }));

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on time left
  const getColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return '#10b981'; // Green
    if (percentage > 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const isUrgent = timeLeft <= urgent && timeLeft > 0;
  const isCompleted = timeLeft === 0;

  return (
    <Animated.View style={[styles.container, scaleStyle]}>
      {/* Glow Effect (urgent) */}
      {isUrgent && (
        <Animated.View
          style={[
            styles.glow,
            {
              shadowColor: '#ef4444',
            },
            glowStyle,
          ]}
        />
      )}

      {/* Timer SVG */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedCircleProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        {isCompleted ? (
          <>
            <MaterialIcons name="check-circle" size={40} color="#10b981" />
            <Text style={styles.completedText}>مكتمل!</Text>
          </>
        ) : (
          <>
            <MaterialIcons
              name={isUrgent ? 'timer' : 'schedule'}
              size={32}
              color={getColor()}
            />
            <Text style={[styles.timeText, { color: getColor() }]}>
              {formatTime(timeLeft)}
            </Text>
            {isUrgent && <Text style={styles.urgentLabel}>أسرع!</Text>}
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  svg: {
    transform: [{ rotate: '180deg' }],
  },
  timeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  urgentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
  },
  completedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
});
