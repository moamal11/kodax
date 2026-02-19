/**
 * Points Modal
 * نافذة شراء الاشتراك المميز وعرض النقاط
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePoints } from '@/contexts/PointsContext';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PointsModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'subscription' | 'course';
  courseId?: string;
  courseName?: string;
  courseCost?: number;
}

export default function PointsModal({
  visible,
  onClose,
  mode = 'subscription',
  courseId,
  courseName,
  courseCost,
}: PointsModalProps) {
  const {
    points,
    isPremium,
    premiumDaysRemaining,
    purchasePremium,
    unlockCourse,
    PREMIUM_COST,
    REWARDS,
  } = usePoints();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePurchase = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'subscription') {
        const result = await purchasePremium();
        if (result.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 2000);
        } else {
          setError(result.error || 'فشل في الشراء');
        }
      } else if (mode === 'course' && courseId && courseCost && courseName) {
        const result = await unlockCourse(courseId, courseCost, courseName);
        if (result.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 2000);
        } else {
          setError(result.error || 'فشل في فتح الدورة');
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const cost = mode === 'subscription' ? PREMIUM_COST : courseCost || 0;
  const canAfford = points >= cost;
  const title =
    mode === 'subscription' ? 'الاشتراك المميز' : `فتح ${courseName}`;

  const renderPremiumBenefits = () => (
    <View style={styles.benefitsContainer}>
      <Text style={styles.benefitsTitle}>مميزات الاشتراك</Text>

      {[
        { icon: 'sparkles', text: 'الوصول لمساعد الذكاء الاصطناعي' },
        { icon: 'code-slash', text: 'مراجعة الكود المتقدمة' },
        { icon: 'trophy', text: 'التحديات الحصرية' },
        { icon: 'ribbon', text: 'شارات مميزة' },
        { icon: 'infinite', text: '30 يوم كامل' },
      ].map((benefit, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * 100)}
          style={styles.benefitItem}
        >
          <LinearGradient
            colors={['rgba(139,92,246,0.3)', 'rgba(59,130,246,0.3)']}
            style={styles.benefitIcon}
          >
            <Ionicons name={benefit.icon as any} size={20} color="#8B5CF6" />
          </LinearGradient>
          <Text style={styles.benefitText}>{benefit.text}</Text>
        </Animated.View>
      ))}
    </View>
  );

  const renderCourseBenefits = () => (
    <View style={styles.benefitsContainer}>
      <Text style={styles.benefitsTitle}>بفتح هذه الدورة ستحصل على</Text>

      {[
        { icon: 'play-circle', text: 'جميع دروس الدورة' },
        { icon: 'checkmark-circle', text: 'التمارين والتحديات' },
        { icon: 'star', text: 'نقاط XP إضافية' },
        { icon: 'medal', text: 'شهادة إتمام' },
      ].map((benefit, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * 100)}
          style={styles.benefitItem}
        >
          <LinearGradient
            colors={['rgba(16,185,129,0.3)', 'rgba(59,130,246,0.3)']}
            style={styles.benefitIcon}
          >
            <Ionicons name={benefit.icon as any} size={20} color="#10B981" />
          </LinearGradient>
          <Text style={styles.benefitText}>{benefit.text}</Text>
        </Animated.View>
      ))}
    </View>
  );

  const renderRewardsInfo = () => (
    <View style={styles.rewardsContainer}>
      <Text style={styles.rewardsTitle}>كيف تكسب النقاط؟</Text>

      <View style={styles.rewardsGrid}>
        {[
          { label: 'إكمال درس', points: REWARDS.COMPLETE_LESSON },
          { label: 'تحدي سهل', points: REWARDS.COMPLETE_CHALLENGE_EASY },
          { label: 'تحدي متوسط', points: REWARDS.COMPLETE_CHALLENGE_MEDIUM },
          { label: 'تحدي صعب', points: REWARDS.COMPLETE_CHALLENGE_HARD },
          { label: 'دخول يومي', points: REWARDS.DAILY_LOGIN },
          { label: 'سلسلة 7 أيام', points: REWARDS.STREAK_BONUS_7 },
        ].map((reward, index) => (
          <View key={index} style={styles.rewardItem}>
            <Text style={styles.rewardPoints}>+{reward.points}</Text>
            <Text style={styles.rewardLabel}>{reward.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (showSuccess) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Animated.View entering={FadeInUp.springify()}>
              <LinearGradient
                colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.1)']}
                style={styles.successIcon}
              >
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </LinearGradient>
              <Text style={styles.successTitle}>تم بنجاح!</Text>
              <Text style={styles.successText}>
                {mode === 'subscription'
                  ? 'تم تفعيل الاشتراك المميز'
                  : `تم فتح ${courseName}`}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={FadeInUp.springify()}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>

              <LinearGradient
                colors={
                  mode === 'subscription'
                    ? ['#8B5CF6', '#3B82F6']
                    : ['#10B981', '#3B82F6']
                }
                style={styles.iconContainer}
              >
                <Ionicons
                  name={mode === 'subscription' ? 'diamond' : 'book'}
                  size={32}
                  color="#FFF"
                />
              </LinearGradient>

              <Text style={styles.title}>{title}</Text>

              {isPremium && mode === 'subscription' && (
                <View style={styles.activeTag}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.activeTagText}>
                    مفعّل - {premiumDaysRemaining} يوم متبقي
                  </Text>
                </View>
              )}
            </View>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Current Points */}
              <View style={styles.pointsDisplay}>
                <Text style={styles.pointsLabel}>نقاطك الحالية</Text>
                <View style={styles.pointsRow}>
                  <Ionicons name="diamond" size={24} color="#F59E0B" />
                  <Text style={styles.pointsValue}>
                    {points.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Cost */}
              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>التكلفة</Text>
                <View
                  style={[
                    styles.costBadge,
                    !canAfford && styles.costBadgeError,
                  ]}
                >
                  <Ionicons
                    name="diamond"
                    size={20}
                    color={canAfford ? '#F59E0B' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.costValue,
                      !canAfford && styles.costValueError,
                    ]}
                  >
                    {cost.toLocaleString()}
                  </Text>
                </View>

                {!canAfford && (
                  <Text style={styles.insufficientText}>
                    تحتاج {(cost - points).toLocaleString()} نقطة إضافية
                  </Text>
                )}
              </View>

              {/* Benefits */}
              {mode === 'subscription'
                ? renderPremiumBenefits()
                : renderCourseBenefits()}

              {/* How to earn */}
              {!canAfford && renderRewardsInfo()}

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            {/* Purchase Button */}
            <Animated.View style={animatedStyle}>
              <TouchableOpacity
                onPress={handlePurchase}
                disabled={
                  !canAfford ||
                  isLoading ||
                  (isPremium && mode === 'subscription')
                }
                activeOpacity={0.8}
                onPressIn={() => {
                  scale.value = withSpring(0.95);
                }}
                onPressOut={() => {
                  scale.value = withSpring(1);
                }}
              >
                <LinearGradient
                  colors={
                    !canAfford || (isPremium && mode === 'subscription')
                      ? ['#374151', '#1F2937']
                      : mode === 'subscription'
                        ? ['#8B5CF6', '#3B82F6']
                        : ['#10B981', '#3B82F6']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.purchaseButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          isPremium && mode === 'subscription'
                            ? 'checkmark-circle'
                            : canAfford
                              ? 'cart'
                              : 'lock-closed'
                        }
                        size={24}
                        color="#FFF"
                      />
                      <Text style={styles.purchaseButtonText}>
                        {isPremium && mode === 'subscription'
                          ? 'الاشتراك مفعّل'
                          : canAfford
                            ? mode === 'subscription'
                              ? 'شراء الاشتراك'
                              : 'فتح الدورة'
                            : 'نقاط غير كافية'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  activeTagText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    maxHeight: height * 0.5,
  },
  pointsDisplay: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  pointsLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsValue: {
    color: '#F59E0B',
    fontSize: 32,
    fontWeight: 'bold',
  },
  costContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  costLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
  },
  costBadgeError: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  costValue: {
    color: '#F59E0B',
    fontSize: 24,
    fontWeight: 'bold',
  },
  costValueError: {
    color: '#EF4444',
  },
  insufficientText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    color: '#E5E7EB',
    fontSize: 16,
    flex: 1,
  },
  rewardsContainer: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  rewardsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  rewardItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rewardPoints: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  successTitle: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
});
