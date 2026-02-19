/**
 * Locked Course Card
 * بطاقة الدورة المقفلة مع خيار الفتح بالنقاط
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePoints } from '@/contexts/PointsContext';
import PointsModal from '@/components/subscription/PointsModal';
import { PointsCost } from '@/components/ui/PointsDisplay';
import type { Course } from '@/constants/courseData';

const { width } = Dimensions.get('window');

interface LockedCourseOverlayProps {
  course: Course;
  onUnlock?: () => void;
}

export default function LockedCourseOverlay({
  course,
  onUnlock,
}: LockedCourseOverlayProps) {
  const { points, isCourseUnlocked } = usePoints();
  const [showModal, setShowModal] = useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // إذا كانت الدورة مفتوحة أو مجانية
  if (
    !course.isLocked ||
    course.pointsCost === 0 ||
    isCourseUnlocked(course.id)
  ) {
    return null;
  }

  const canAfford = points >= course.pointsCost;

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isCourseUnlocked(course.id)) {
      onUnlock?.();
    }
  };

  return (
    <>
      <Animated.View
        entering={FadeIn}
        style={[StyleSheet.absoluteFill, styles.overlay]}
      >
        <BlurView intensity={15} style={StyleSheet.absoluteFill} />

        <View style={styles.content}>
          {/* Lock Icon */}
          <View style={styles.lockContainer}>
            <LinearGradient
              colors={['rgba(139,92,246,0.3)', 'rgba(59,130,246,0.3)']}
              style={styles.lockIcon}
            >
              <Ionicons name="lock-closed" size={32} color="#A78BFA" />
            </LinearGradient>
          </View>

          {/* Course Info */}
          <Text style={styles.lockedText}>دورة مقفلة</Text>
          <Text style={styles.courseName}>{course.title}</Text>

          {/* Cost */}
          <View style={styles.costSection}>
            <Text style={styles.costLabel}>تكلفة الفتح</Text>
            <PointsCost cost={course.pointsCost} />
          </View>

          {/* Unlock Button */}
          <Animated.View style={animatedStyle}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
              <LinearGradient
                colors={
                  canAfford ? ['#8B5CF6', '#3B82F6'] : ['#374151', '#1F2937']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.unlockButton}
              >
                <Ionicons
                  name={canAfford ? 'lock-open' : 'star'}
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.unlockButtonText}>
                  {canAfford
                    ? 'فتح الدورة'
                    : `تحتاج ${course.pointsCost - points} نقطة`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Current Points */}
          <View style={styles.currentPoints}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.currentPointsText}>
              نقاطك: {points.toLocaleString()}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Points Modal */}
      <PointsModal
        visible={showModal}
        onClose={handleModalClose}
        mode="course"
        courseId={course.id}
        courseName={course.title}
        courseCost={course.pointsCost}
      />
    </>
  );
}

// مكون صغير لعرض قفل على بطاقة الدورة في القائمة
export function CourseCardLockBadge({ course }: { course: Course }) {
  const { isCourseUnlocked, points } = usePoints();

  if (
    !course.isLocked ||
    course.pointsCost === 0 ||
    isCourseUnlocked(course.id)
  ) {
    return null;
  }

  const canAfford = points >= course.pointsCost;

  return (
    <View style={styles.cardBadge}>
      <LinearGradient
        colors={
          canAfford
            ? ['rgba(139,92,246,0.9)', 'rgba(59,130,246,0.9)']
            : ['rgba(55,65,81,0.9)', 'rgba(31,41,55,0.9)']
        }
        style={styles.cardBadgeGradient}
      >
        <Ionicons name="lock-closed" size={12} color="#FFF" />
        <Ionicons name="star" size={10} color="#F59E0B" />
        <Text style={styles.cardBadgeText}>{course.pointsCost}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  lockContainer: {
    marginBottom: 16,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  courseName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  costSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  costLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 8,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  currentPointsText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  cardBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
