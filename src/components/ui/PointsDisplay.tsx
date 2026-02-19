/**
 * Points Display Component
 * مكون عرض النقاط في الهيدر
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { usePoints } from '@/contexts/PointsContext';

interface PointsDisplayProps {
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showPremiumBadge?: boolean;
}

export default function PointsDisplay({
  onPress,
  size = 'medium',
  showPremiumBadge = true,
}: PointsDisplayProps) {
  const { points, isPremium, premiumDaysRemaining } = usePoints();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.9), withSpring(1.1), withSpring(1));
    onPress?.();
  };

  const sizes = {
    small: { container: 28, icon: 14, text: 12, padding: 6 },
    medium: { container: 36, icon: 18, text: 14, padding: 10 },
    large: { container: 44, icon: 22, text: 18, padding: 14 },
  };

  const currentSize = sizes[size];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.wrapper}
      >
        <LinearGradient
          colors={['rgba(245,158,11,0.2)', 'rgba(217,119,6,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            {
              paddingHorizontal: currentSize.padding,
              paddingVertical: currentSize.padding / 2,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                width: currentSize.container,
                height: currentSize.container,
              },
            ]}
          >
            <Ionicons name="diamond" size={currentSize.icon} color="#F59E0B" />
          </View>

          <Text style={[styles.pointsText, { fontSize: currentSize.text }]}>
            {points.toLocaleString()}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={currentSize.icon - 2}
            color="#9CA3AF"
          />
        </LinearGradient>

        {/* Premium Badge */}
        {showPremiumBadge && isPremium && (
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <Ionicons name="diamond" size={10} color="#FFF" />
              <Text style={styles.premiumText}>{premiumDaysRemaining}d</Text>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// مكون مصغر لعرض النقاط فقط
export function PointsBadge({ points }: { points: number }) {
  return (
    <View style={styles.badgeContainer}>
      <Ionicons name="star" size={14} color="#F59E0B" />
      <Text style={styles.badgeText}>{points.toLocaleString()}</Text>
    </View>
  );
}

// مكون لعرض تكلفة النقاط
export function PointsCost({
  cost,
  compact = false,
}: {
  cost: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <View style={styles.costCompact}>
        <Ionicons name="star" size={12} color="#F59E0B" />
        <Text style={styles.costCompactText}>{cost}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(245,158,11,0.2)', 'rgba(217,119,6,0.2)']}
      style={styles.costContainer}
    >
      <Ionicons name="star" size={16} color="#F59E0B" />
      <Text style={styles.costText}>{cost.toLocaleString()} نقطة</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    gap: 6,
  },
  iconContainer: {
    borderRadius: 50,
    backgroundColor: 'rgba(245,158,11,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  premiumBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  premiumText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  costCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  costCompactText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  costText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
});
