/**
 * SubscriptionModal.tsx
 *
 * Beautiful subscription modal with pricing plans and unlock animations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  SubscriptionPlan,
  createSubscription,
} from '@/services/subscriptionService';
import { showToast } from '../ui/Toast';

const { width } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  userId: string;
  onSubscribed?: () => void;
  lockedFeature?: string;
}

export function SubscriptionModal({
  visible,
  onClose,
  plans,
  userId,
  onSubscribed,
  lockedFeature,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      showToast.error('الرجاء اختيار خطة');
      return;
    }

    setIsProcessing(true);

    try {
      // In production, integrate with payment gateway
      // For now, simulate payment
      const result = await createSubscription(
        userId,
        selectedPlan,
        'demo_payment',
        `REF_${Date.now()}`
      );

      if (result.success) {
        setShowSuccess(true);
        showToast.success('تم الاشتراك بنجاح!');

        setTimeout(() => {
          onSubscribed?.();
          onClose();
          setShowSuccess(false);
        }, 2000);
      } else {
        showToast.error('فشل الاشتراك. حاول مرة أخرى');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showToast.error('حدث خطأ أثناء الاشتراك');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {showSuccess ? (
          <Animated.View
            entering={ZoomIn.duration(500).springify()}
            style={styles.successContainer}
          >
            <View style={styles.successBlur}>
              <LinearGradient
                colors={
                  ['rgba(139, 92, 246, 0.2)', 'rgba(168, 85, 247, 0.1)'] as [
                    string,
                    string,
                    ...string[],
                  ]
                }
                style={styles.successGradient}
              >
                <View style={styles.successIcon}>
                  <MaterialIcons
                    name="check-circle"
                    size={80}
                    color="#10b981"
                  />
                </View>
                <Text style={styles.successTitle}>تم الاشتراك!</Text>
                <Text style={styles.successMessage}>
                  الآن يمكنك الوصول لجميع المميزات المدفوعة
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={styles.modalContainer}
          >
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <MaterialIcons
                    name="workspace-premium"
                    size={32}
                    color="#8b5cf6"
                  />
                  <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Kodax Premium</Text>
                    <Text style={styles.headerSubtitle}>
                      {lockedFeature
                        ? `افتح ${lockedFeature} والمزيد`
                        : 'افتح جميع المميزات'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Features List */}
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>المميزات المتاحة:</Text>
                  {[
                    {
                      icon: 'smart-toy',
                      text: 'محادثة AI غير محدودة',
                      ar: true,
                    },
                    {
                      icon: 'code',
                      text: 'مراجعة الكود بالذكاء الاصطناعي',
                      ar: true,
                    },
                    {
                      icon: 'emoji-events',
                      text: 'تحديات وتمارين غير محدودة',
                      ar: true,
                    },
                    { icon: 'analytics', text: 'تحليلات متقدمة', ar: true },
                    { icon: 'stars', text: 'شارات حصرية', ar: true },
                    { icon: 'leaderboard', text: 'ترتيب متقدم', ar: true },
                  ].map((feature, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeInDown.delay(index * 50).duration(300)}
                      style={styles.featureItem}
                    >
                      <View style={styles.featureIcon}>
                        <MaterialIcons
                          name={feature.icon as any}
                          size={20}
                          color="#a855f7"
                        />
                      </View>
                      <Text style={styles.featureText}>{feature.text}</Text>
                      <MaterialIcons name="check" size={20} color="#10b981" />
                    </Animated.View>
                  ))}
                </View>

                {/* Pricing Plans */}
                <View style={styles.plansContainer}>
                  {plans.map((plan, index) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlan === plan.id}
                      onSelect={() => setSelectedPlan(plan.id)}
                      index={index}
                      isPopular={plan.duration_months === 3}
                    />
                  ))}
                </View>

                {/* Payment Note */}
                <View style={styles.noteContainer}>
                  <MaterialIcons name="info" size={16} color="#9ca3af" />
                  <Text style={styles.noteText}>
                    دفع آمن ومشفر • إلغاء في أي وقت
                  </Text>
                </View>
              </ScrollView>

              {/* Subscribe Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    !selectedPlan && styles.subscribeButtonDisabled,
                  ]}
                  onPress={handleSubscribe}
                  disabled={!selectedPlan || isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      selectedPlan
                        ? ['#8b5cf6', '#a855f7']
                        : ['#4b5563', '#6b7280']
                    }
                    style={styles.subscribeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <MaterialIcons
                          name="lock-open"
                          size={24}
                          color="#ffffff"
                        />
                        <Text style={styles.subscribeButtonText}>
                          اشترك الآن
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
  index,
  isPopular,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
  index: number;
  isPopular?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(400)}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.planCard,
            selected && styles.planCardSelected,
            isPopular && styles.planCardPopular,
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>الأكثر شعبية</Text>
            </View>
          )}

          <LinearGradient
            colors={
              selected
                ? ['rgba(139, 92, 246, 0.15)', 'rgba(168, 85, 247, 0.08)']
                : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
            }
            style={styles.planGradient}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name_ar}</Text>
              <Text style={styles.planDuration}>{plan.name}</Text>
            </View>

            <View style={styles.planPricing}>
              <Text style={styles.planPrice}>
                {plan.price_iqd.toLocaleString()}
              </Text>
              <Text style={styles.planCurrency}>د.ع</Text>
            </View>

            <View style={styles.planFooter}>
              <View
                style={[styles.planRadio, selected && styles.planRadioSelected]}
              >
                {selected && (
                  <Animated.View
                    entering={ZoomIn.duration(200)}
                    style={styles.planRadioDot}
                  />
                )}
              </View>
              <Text style={styles.planSelect}>
                {selected ? 'محدد' : 'اختر هذه الخطة'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: Math.min(width * 0.95, 500),
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 30, 0.98)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  featuresContainer: {
    padding: 20,
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  plansContainer: {
    padding: 20,
    gap: 12,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#8b5cf6',
  },
  planCardPopular: {
    borderColor: '#a855f7',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: '#a855f7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  planDuration: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#a855f7',
  },
  planCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioSelected: {
    borderColor: '#8b5cf6',
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
  planSelect: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeButtonDisabled: {
    opacity: 0.5,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  successContainer: {
    width: Math.min(width * 0.9, 400),
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successBlur: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 30, 0.98)',
  },
  successGradient: {
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
