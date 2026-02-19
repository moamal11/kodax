/**
 * 🎓 Certificate Award Modal - Kodax
 * مودال احترافي يظهر عند استحقاق شهادة
 * تأثيرات سلسة + رسائل تشجيعية بالعربية
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInUp,
  withSpring,
  withSequence,
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS } from '@/styles/theme';
import {
  CertificateLevel,
  CERTIFICATE_LEVEL_CONFIG,
  getNextLevel,
} from '@/types/certificate';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CertificateAwardModalProps {
  visible: boolean;
  level: CertificateLevel;
  courseTitle: string;
  courseTitleAr?: string;
  onClose: () => void;
  onViewCertificate?: () => void;
  nextLevel?: {
    level: CertificateLevel;
    requirements: string[];
  } | null;
}

export default function CertificateAwardModal({
  visible,
  level,
  courseTitle,
  courseTitleAr,
  onClose,
  onViewCertificate,
  nextLevel,
}: CertificateAwardModalProps) {
  const config = CERTIFICATE_LEVEL_CONFIG[level];
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 18, stiffness: 120 });
    } else {
      scale.value = 0;
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Messages based on level
  const getMessages = () => {
    switch (level) {
      case 'silver':
        return {
          title: 'تهانينا!',
          subtitle: `حصلت على شهادة ${config.labelAr}`,
          course: courseTitleAr || courseTitle,
          encouragement: nextLevel
            ? `أكمل باقي التحديات وارفع درجتك للحصول على ${
                CERTIFICATE_LEVEL_CONFIG[nextLevel.level as CertificateLevel]
                  ?.emoji || ''
              } ${CERTIFICATE_LEVEL_CONFIG[nextLevel.level as CertificateLevel]?.labelAr || ''}`
            : 'أحسنت! واصل التعلم',
        };
      case 'gold':
        return {
          title: 'ممتاز!',
          subtitle: `حصلت على شهادة ${config.labelAr}`,
          course: courseTitleAr || courseTitle,
          encouragement: nextLevel
            ? `أنت الآن مؤهل للوصول إلى ${config.emoji} ${
                CERTIFICATE_LEVEL_CONFIG[nextLevel.level as CertificateLevel]
                  ?.labelAr || ''
              }\nتبقى لك درجة 95% في الاختبار النهائي`
            : 'إنجاز رائع! أنت متميز',
        };
      case 'platinum':
        return {
          title: 'إنجاز استثنائي!',
          subtitle: `حصلت على شهادة ${config.labelAr}`,
          course: courseTitleAr || courseTitle,
          encouragement: 'أنت من النخبة! أعلى مستوى في هذا الكورس.',
        };
    }
  };

  const messages = getMessages();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(250)} style={styles.overlay}>
        {/* Card */}
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <LinearGradient
            colors={['#1a1a3e', '#252550', '#1a1a3e']}
            style={styles.card}
          >
            {/* Top accent */}
            <LinearGradient
              colors={config.gradientColors}
              style={styles.topAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={THEME_COLORS.textMuted} />
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.content}>
              {/* Level badge */}
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={config.gradientColors}
                  style={styles.badge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={config.iconName as any}
                    size={36}
                    color="#1a1a2e"
                  />
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={styles.title}>{messages.title}</Text>
              <Text style={styles.subtitle}>{messages.subtitle}</Text>

              {/* Course name */}
              <View style={styles.courseContainer}>
                <Text style={styles.courseLabel}>في كورس</Text>
                <Text style={styles.courseName}>{messages.course}</Text>
              </View>

              {/* Encouragement */}
              <View style={styles.encouragementContainer}>
                <Text style={styles.encouragement}>
                  {messages.encouragement}
                </Text>
              </View>

              {/* Next level requirements */}
              {nextLevel && nextLevel.requirements?.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>
                    متطلبات المستوى التالي:
                  </Text>
                  {nextLevel.requirements.map((req, idx) => (
                    <View key={idx} style={styles.requirementRow}>
                      <Ionicons
                        name="chevron-forward-circle-outline"
                        size={14}
                        color={THEME_COLORS.textMuted}
                      />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                {onViewCertificate && (
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => {
                      onClose();
                      setTimeout(onViewCertificate, 300);
                    }}
                  >
                    <LinearGradient
                      colors={config.gradientColors}
                      style={styles.primaryActionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="ribbon" size={18} color="#1a1a2e" />
                      <Text style={styles.primaryActionText}>عرض الشهادة</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={onClose}
                >
                  <Text style={styles.secondaryActionText}>متابعة التعلم</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom accent */}
            <LinearGradient
              colors={config.gradientColors}
              style={styles.bottomAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ===== Floating Particle =====
function FloatingParticle({ index, color }: { index: number; color: string }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const angle = (index / 12) * Math.PI * 2;
    const radius = 100 + Math.random() * 60;

    translateY.value = withDelay(
      index * 80,
      withSpring(Math.sin(angle) * radius, {
        damping: 4,
        stiffness: 30,
        mass: 1,
      })
    );
    translateX.value = withDelay(
      index * 80,
      withSpring(Math.cos(angle) * radius, {
        damping: 4,
        stiffness: 30,
        mass: 1,
      })
    );
    opacity.value = withDelay(
      index * 80,
      withSequence(
        withSpring(1, { damping: 10 }),
        withDelay(2000, withSpring(0, { damping: 10 }))
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const particleIcons: Array<{ name: string; color: string }> = [
    { name: 'star', color: '#FFD700' },
    { name: 'sparkles', color: '#E5E4E2' },
    { name: 'ribbon', color },
    { name: 'trophy', color: '#FFD700' },
    { name: 'medal', color: '#C0C0C0' },
    { name: 'diamond', color: '#E5E4E2' },
    { name: 'star', color },
    { name: 'sparkles', color: '#FFD700' },
    { name: 'ribbon', color: '#C0C0C0' },
    { name: 'trophy', color },
    { name: 'medal', color: '#FFD700' },
    { name: 'diamond', color },
  ];

  return (
    <Animated.View style={[styles.particle, style]}>
      <Ionicons
        name={particleIcons[index % particleIcons.length].name as any}
        size={20}
        color={particleIcons[index % particleIcons.length].color}
      />
    </Animated.View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  particleText: {
    fontSize: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 20,
        }
      : {}),
  },
  card: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
  },
  topAccent: {
    height: 3,
  },
  bottomAccent: {
    height: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 28,
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: 16,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  courseContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.lg,
  },
  courseLabel: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  encouragementContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  encouragement: {
    fontSize: 13,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  requirementsContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME_COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  requirementText: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryAction: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  secondaryAction: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    color: THEME_COLORS.textMuted,
    fontWeight: '600',
  },
});
