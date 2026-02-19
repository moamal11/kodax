/**
 * Points Purchase Badge Component
 * مكون شارة شراء النقاط
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface PointsPurchaseBadgeProps {
  onPurchase?: () => void;
}

export default function PointsPurchaseBadge({
  onPurchase,
}: PointsPurchaseBadgeProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  // Start pulse animation
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.03), withSpring(1)),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    router.push('/payment' as any);
    onPurchase?.();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={['#a78bfa', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name="diamond" size={18} color="#FFF" />
          <Text style={styles.buttonText}>اشتري نقاط</Text>
          <View style={styles.pointsBadge}>
            <Ionicons name="add-circle" size={14} color="#a78bfa" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// مكون صغير للعرض في الهيدر
export function DailyRewardBadge() {
  // لم يعد هناك مكافآت يومية - النظام الجديد يعتمد على الشراء
  return null;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
