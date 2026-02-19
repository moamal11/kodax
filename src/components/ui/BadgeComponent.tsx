/**
 * BadgeComponent.tsx
 *
 * Description: Achievement badge component with unlock animation and glow effect
 * Features: Unlock animation, glow effect, tooltip, rarity colors, progress indicator
 * Props: {badge} - Badge data, {earned} - Earned status, {size} - Badge size, {animated} - Enable animations
 *
 * @example
 * <BadgeComponent badge={badgeData} earned={true} size="large" animated />
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

// Types
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  rarity: BadgeRarity;
  progress?: number; // 0-100 for locked badges
}

interface BadgeComponentProps {
  badge: Badge;
  earned?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  onPress?: () => void;
  showTooltip?: boolean;
}

const rarityConfigs = {
  common: {
    colors: ['#6b7280', '#9ca3af'],
    glowColor: '#6b7280',
    label: 'عادية',
  },
  rare: {
    colors: ['#3b82f6', '#60a5fa'],
    glowColor: '#3b82f6',
    label: 'نادرة',
  },
  epic: {
    colors: ['#7c3aed', '#a78bfa'],
    glowColor: '#7c3aed',
    label: 'ملحمية',
  },
  legendary: {
    colors: ['#f59e0b', '#fbbf24'],
    glowColor: '#f59e0b',
    label: 'أسطورية',
  },
};

const sizeConfigs = {
  small: { size: 60, iconSize: 24, fontSize: 10 },
  medium: { size: 80, iconSize: 32, fontSize: 12 },
  large: { size: 100, iconSize: 40, fontSize: 14 },
};

export function BadgeComponent({
  badge,
  earned = false,
  size = 'medium',
  animated = true,
  onPress,
  showTooltip = false,
}: BadgeComponentProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(earned ? 0.6 : 0);
  const rotation = useSharedValue(0);

  const rarityConfig = rarityConfigs[badge.rarity];
  const sizeConfig = sizeConfigs[size];

  useEffect(() => {
    if (earned && animated) {
      // Unlock animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      rotation.value = withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      // Pulsing glow
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [earned, animated]);

  const handlePressIn = () => {
    if (earned) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    if (earned) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (showTooltip) {
      setTooltipVisible(!tooltipVisible);
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={!earned && !onPress}
      >
        <Animated.View style={animatedStyle}>
          {/* Glow Effect */}
          {earned && (
            <Animated.View
              style={[
                styles.glow,
                {
                  width: sizeConfig.size + 20,
                  height: sizeConfig.size + 20,
                  borderRadius: (sizeConfig.size + 20) / 2,
                  shadowColor: rarityConfig.glowColor,
                },
                glowStyle,
              ]}
            />
          )}

          {/* Badge Container */}
          <View
            style={[
              styles.badgeContainer,
              {
                width: sizeConfig.size,
                height: sizeConfig.size,
                borderRadius: sizeConfig.size / 2,
              },
            ]}
          >
            <LinearGradient
              colors={
                (earned ? rarityConfig.colors : ['#2d3748', '#1a202c']) as [
                  string,
                  string,
                  ...string[],
                ]
              }
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Icon */}
              <MaterialIcons
                name={badge.icon}
                size={sizeConfig.iconSize}
                color={earned ? '#ffffff' : '#4a5568'}
              />

              {/* Lock Icon for Locked Badges */}
              {!earned && (
                <View style={styles.lockContainer}>
                  <MaterialIcons
                    name="lock"
                    size={sizeConfig.iconSize * 0.4}
                    color="#6b7280"
                  />
                </View>
              )}
            </LinearGradient>

            {/* Border */}
            <View
              style={[
                styles.border,
                {
                  borderColor: earned ? rarityConfig.glowColor : '#4a5568',
                },
              ]}
            />
          </View>

          {/* Progress Bar for Locked Badges */}
          {!earned && badge.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${badge.progress}%`,
                      backgroundColor: rarityConfig.colors[0],
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{badge.progress}%</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Tooltip */}
      {tooltipVisible && showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{badge.name}</Text>
          <Text
            style={[styles.tooltipRarity, { color: rarityConfig.glowColor }]}
          >
            {rarityConfig.label}
          </Text>
          <Text style={styles.tooltipDescription}>{badge.description}</Text>
        </View>
      )}

      {/* Badge Name */}
      {size !== 'small' && (
        <Text
          style={[
            styles.badgeName,
            {
              fontSize: sizeConfig.fontSize,
              color: earned ? '#ffffff' : '#6b7280',
            },
          ]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  badgeContainer: {
    overflow: 'hidden',
    elevation: 5,
  },
  glow: {
    position: 'absolute',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    top: -10,
    left: -10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 999,
  },
  lockContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  progressContainer: {
    marginTop: 8,
    width: 80,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  badgeName: {
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 100,
  },
  tooltip: {
    position: 'absolute',
    top: -100,
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
    zIndex: 1000,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  tooltipRarity: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
});
