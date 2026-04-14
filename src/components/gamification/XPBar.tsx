import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  calculateLevel,
  levelProgress,
  formatXP,
  xpForNextLevel,
} from '@/lib/utils';

interface XPBarProps {
  xp: number;
  showAnimation?: boolean;
}

export function XPBar({ xp, showAnimation = false }: XPBarProps) {
  const level = calculateLevel(xp);
  const progress = levelProgress(xp);
  const nextLevelXP = xpForNextLevel(level);

  const progressWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (showAnimation) {
      progressWidth.value = withSpring(progress, {
        damping: 15,
        stiffness: 100,
      });

      glowOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 500 })
      );
    } else {
      progressWidth.value = progress;
    }
  }, [xp, showAnimation]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={['#8b5cf6', '#a855f7'] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelBadgeGradient}
          >
            <Text style={styles.levelText}>المستوى {level}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.xpText}>
          {formatXP(xp)} / {formatXP(nextLevelXP)} XP
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]}>
            <LinearGradient
              colors={
                ['#8b5cf6', '#a855f7', '#c471ed'] as [
                  string,
                  string,
                  ...string[],
                ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            >
              <Animated.View style={[styles.glow, animatedGlowStyle]} />
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  levelBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  xpText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressGradient: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
