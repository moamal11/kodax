/**
 * LevelUpModal.tsx
 *
 * Description: Full-screen level up celebration with confetti and particles
 * Features: Confetti animation, particles, badge reveal, XP summary, smooth transitions
 * Props: {level} - New level, {newBadges} - Unlocked badges, {xpGained} - XP earned, {onClose} - Close handler
 *
 * @example
 * <LevelUpModal level={5} newBadges={[badge1, badge2]} xpGained={500} onClose={handleClose} />
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Badge, BadgeComponent } from '../ui/BadgeComponent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
interface LevelUpModalProps {
  visible: boolean;
  level: number;
  newBadges?: Badge[];
  xpGained: number;
  onClose: () => void;
}

// Confetti Particle Component
const ConfettiParticle = ({
  index,
  delay,
}: {
  index: number;
  delay: number;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  const colors = ['#7c3aed', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];
  const color = colors[index % colors.length];

  useEffect(() => {
    const startX = Math.random() * SCREEN_WIDTH;
    const endY = SCREEN_HEIGHT + 100;
    const horizontalDrift = (Math.random() - 0.5) * 200;

    translateX.value = startX;

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 500 }))
      )
    );

    translateX.value = withDelay(
      delay,
      withTiming(startX + horizontalDrift, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(endY, {
        duration: 3000,
        easing: Easing.in(Easing.quad),
      })
    );

    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 720 - 360, {
        duration: 3000,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export function LevelUpModal({
  visible,
  level,
  newBadges = [],
  xpGained,
  onClose,
}: LevelUpModalProps) {
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0);
  const levelScale = useSharedValue(0);
  const badgesOpacity = useSharedValue(0);
  const badgesTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Backdrop
      backdropOpacity.value = withTiming(1, { duration: 300 });

      // Content
      contentScale.value = withDelay(
        200,
        withSpring(1, {
          damping: 15,
          stiffness: 200,
        })
      );

      // Level number
      levelScale.value = withDelay(
        400,
        withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 })
        )
      );

      // Badges
      if (newBadges.length > 0) {
        badgesOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
        badgesTranslateY.value = withDelay(
          800,
          withSpring(0, {
            damping: 20,
            stiffness: 200,
          })
        );
      }
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      contentScale.value = withTiming(0, { duration: 200 });
      levelScale.value = 0;
      badgesOpacity.value = 0;
      badgesTranslateY.value = 50;
    }
  }, [visible, newBadges.length]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const badgesStyle = useAnimatedStyle(() => ({
    opacity: badgesOpacity.value,
    transform: [{ translateY: badgesTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Confetti */}
      {Array.from({ length: 50 }).map((_, index) => (
        <ConfettiParticle key={index} index={index} delay={index * 50} />
      ))}

      {/* Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Glow Effect */}
        <View
          style={[
            styles.glow,
            {
              shadowColor: '#7c3aed',
            },
          ]}
        />

        {/* Main Card */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.2)', 'rgba(59, 130, 246, 0.1)']}
          style={styles.card}
        >
          {/* Star Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="star" size={60} color="#f59e0b" />
          </View>

          {/* Level Up Text */}
          <Text style={styles.title}>مستوى جديد!</Text>

          {/* Level Number */}
          <Animated.View style={[styles.levelContainer, levelStyle]}>
            <LinearGradient
              colors={['#7c3aed', '#3b82f6']}
              style={styles.levelBadge}
            >
              <Text style={styles.levelNumber}>{level}</Text>
            </LinearGradient>
          </Animated.View>

          {/* XP Gained */}
          <View style={styles.xpContainer}>
            <MaterialIcons name="add-circle" size={20} color="#10b981" />
            <Text style={styles.xpText}>+{xpGained} XP</Text>
          </View>

          {/* New Badges */}
          {newBadges.length > 0 && (
            <Animated.View style={[styles.badgesContainer, badgesStyle]}>
              <Text style={styles.badgesTitle}>شارات جديدة!</Text>
              <View style={styles.badgesList}>
                {newBadges.map((badge) => (
                  <BadgeComponent
                    key={badge.id}
                    badge={badge}
                    earned
                    size="medium"
                    animated
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Continue Button */}
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <LinearGradient
              colors={['#7c3aed', '#3b82f6']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>متابعة</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: -50,
  },
  content: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 30,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 24,
  },
  levelContainer: {
    marginBottom: 24,
  },
  levelBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  badgesContainer: {
    width: '100%',
    marginBottom: 24,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgesList: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
