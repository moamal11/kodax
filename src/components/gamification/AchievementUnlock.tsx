/**
 * AchievementUnlock.tsx
 *
 * Description: Badge unlock animation with fly-in effect, glow pulse, and share functionality
 * Features: Badge fly-in, glow pulse, title reveal, share button, celebration particles
 * Props: {badge} - Unlocked badge, {onShare} - Share handler, {onClose} - Close handler
 *
 * @example
 * <AchievementUnlock badge={badge} onShare={handleShare} onClose={handleClose} />
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Badge, BadgeComponent } from '../ui/BadgeComponent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface AchievementUnlockProps {
  visible: boolean;
  badge: Badge;
  onShare?: () => void;
  onClose: () => void;
}

export function AchievementUnlock({
  visible,
  badge,
  onShare,
  onClose,
}: AchievementUnlockProps) {
  const backdropOpacity = useSharedValue(0);
  const badgeTranslateY = useSharedValue(30);
  const badgeScale = useSharedValue(0.6);
  const badgeOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(15);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(15);

  // Debug log
  useEffect(() => {
    console.log('🎨 AchievementUnlock render:', {
      visible,
      badgeName: badge?.name,
    });
  }, [visible, badge]);

  useEffect(() => {
    if (visible) {
      console.log('✨ Starting AchievementUnlock animation for:', badge?.name);
      // Backdrop - smooth fade
      backdropOpacity.value = withTiming(1, { duration: 350 });

      // Badge - subtle scale + fade + slide up
      badgeOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

      badgeTranslateY.value = withDelay(
        200,
        withSpring(0, {
          damping: 18,
          stiffness: 160,
        })
      );

      badgeScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.08, { damping: 12, stiffness: 180 }),
          withSpring(1, { damping: 16 })
        )
      );

      // Title reveal - smooth fade + slide
      titleOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

      titleTranslateY.value = withDelay(
        500,
        withSpring(0, {
          damping: 20,
          stiffness: 180,
        })
      );

      // Buttons - gentle appearance
      buttonsOpacity.value = withDelay(750, withTiming(1, { duration: 350 }));

      buttonsTranslateY.value = withDelay(
        750,
        withSpring(0, {
          damping: 20,
          stiffness: 180,
        })
      );
    } else {
      // Smooth exit
      buttonsOpacity.value = withTiming(0, { duration: 200 });
      titleOpacity.value = withTiming(0, { duration: 200 });
      badgeOpacity.value = withDelay(100, withTiming(0, { duration: 250 }));
      backdropOpacity.value = withDelay(150, withTiming(0, { duration: 250 }));
      badgeTranslateY.value = 30;
      badgeScale.value = 0.6;
      titleTranslateY.value = 15;
      buttonsTranslateY.value = 15;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [
      { translateY: badgeTranslateY.value },
      { scale: badgeScale.value },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Badge */}
        <Animated.View style={[styles.badgeContainer, badgeStyle]}>
          <BadgeComponent badge={badge} earned size="large" animated />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.title}>تم الحصول على الشارة</Text>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.description}>{badge.description}</Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          {onShare && (
            <TouchableOpacity onPress={onShare} style={styles.shareButton}>
              <LinearGradient
                colors={['#7c3aed', '#3b82f6']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="share" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>مشاركة</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={styles.closeButtonContent}>
              <Text style={styles.closeButtonText}>متابعة</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
  content: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 24,
  },
  badgeContainer: {
    marginVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    width: '100%',
  },
  closeButtonContent: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
});
