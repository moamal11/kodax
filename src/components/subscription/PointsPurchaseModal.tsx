/**
 * مودال شراء النقاط - Kodax Points Purchase Modal
 * يعرض باقات شراء النقاط بالدينار العراقي
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  POINTS_PACKAGES,
  PREMIUM_SUBSCRIPTION_COST,
  CURRENCY_ICONS,
  CURRENCY_COLORS,
  type PointsPackage,
} from '../../services/pointsService';

const { width, height } = Dimensions.get('window');

interface PointsPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (
    packageId: string
  ) => Promise<{ success: boolean; error?: string }>;
  currentPoints: number;
  currentXP?: number; // نقاط الخبرة
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PointsPurchaseModal({
  visible,
  onClose,
  onPurchase,
  currentPoints,
  currentXP = 0,
}: PointsPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onPurchase(selectedPackage);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedPackage(null);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'حدث خطأ أثناء الشراء');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [selectedPackage, onPurchase, onClose]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-IQ') + ' د.ع';
  };

  const renderPackageCard = (pkg: PointsPackage, index: number) => {
    const isSelected = selectedPackage === pkg.id;

    return (
      <AnimatedTouchable
        key={pkg.id}
        entering={FadeIn.delay(index * 100)}
        style={[
          styles.packageCard,
          isSelected && styles.packageCardSelected,
          pkg.popular && styles.packageCardPopular,
        ]}
        onPress={() => setSelectedPackage(pkg.id)}
        activeOpacity={0.8}
      >
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Ionicons
              name="star"
              size={14}
              color="#fbbf24"
              style={{ marginEnd: 4 }}
            />
            <Text style={styles.popularText}>الأفضل قيمة</Text>
          </View>
        )}

        <LinearGradient
          colors={
            isSelected
              ? ['#6366f1', '#8b5cf6']
              : pkg.popular
                ? ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']
                : ['rgba(30, 30, 40, 0.8)', 'rgba(40, 40, 55, 0.8)']
          }
          style={[
            styles.packageGradient,
            {
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        >
          <View style={styles.packageHeader}>
            <View style={styles.pointsContainer}>
              <Ionicons
                name="diamond"
                size={24}
                color={isSelected ? '#fff' : '#a78bfa'}
              />
              <Text
                style={[
                  styles.pointsText,
                  isSelected && styles.pointsTextSelected,
                ]}
              >
                {pkg.points.toLocaleString('ar-IQ')}
              </Text>
            </View>
            {pkg.bonus > 0 && (
              <View style={styles.bonusBadge}>
                <Ionicons
                  name="gift"
                  size={14}
                  color="#10b981"
                  style={{ marginEnd: 4 }}
                />
                <Text style={styles.bonusText}>+{pkg.bonus} مكافأة</Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.priceText, isSelected && styles.priceTextSelected]}
          >
            {formatPrice(pkg.price)}
          </Text>

          <View style={styles.valueContainer}>
            <Text
              style={[styles.valueText, isSelected && styles.valueTextSelected]}
            >
              {Math.round(pkg.price / pkg.points)} د.ع/نقطة
              {pkg.savings && ` • وفر ${pkg.savings}`}
            </Text>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        {Platform.OS !== 'android' && (
          <BlurView
            intensity={30}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        <Animated.View
          entering={SlideInDown.springify().duration(400)}
          exiting={SlideOutDown.duration(300)}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f0f1a']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#a0a0a0" />
              </TouchableOpacity>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Ionicons name="diamond" size={24} color="#a78bfa" />
                <Text style={styles.title}>متجر النقاط</Text>
              </View>
              <View style={styles.currentPointsContainer}>
                <Ionicons name="diamond" size={16} color="#a78bfa" />
                <Text style={styles.currentPointsText}>
                  {currentPoints.toLocaleString('ar-IQ')}
                </Text>
              </View>
            </View>

            {/* Dual Currency Display */}
            <View style={styles.dualCurrencyContainer}>
              <View
                style={[
                  styles.currencyBox,
                  {
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderColor: '#fbbf24',
                  },
                ]}
              >
                <Ionicons name="flash" size={20} color="#fbbf24" />
                <View>
                  <Text style={[styles.currencyLabel, { color: '#fbbf24' }]}>
                    نقاط الخبرة
                  </Text>
                  <Text style={[styles.currencyValue, { color: '#fbbf24' }]}>
                    {currentXP.toLocaleString('ar-IQ')}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.currencyBox,
                  {
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    borderColor: '#a78bfa',
                  },
                ]}
              >
                <Ionicons name="diamond" size={20} color="#a78bfa" />
                <View>
                  <Text style={[styles.currencyLabel, { color: '#a78bfa' }]}>
                    رصيد المتجر
                  </Text>
                  <Text style={[styles.currencyValue, { color: '#a78bfa' }]}>
                    {currentPoints.toLocaleString('ar-IQ')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={styles.infoText}>
                الاشتراك المميز يكلف{' '}
                {PREMIUM_SUBSCRIPTION_COST.toLocaleString('ar-IQ')} نقطة شهرياً
              </Text>
            </View>

            {/* Success Message */}
            {success && (
              <Animated.View entering={FadeIn} style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.successText}>تم الشراء بنجاح!</Text>
              </Animated.View>
            )}

            {/* Error Message */}
            {error && (
              <Animated.View entering={FadeIn} style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Packages List */}
            <ScrollView
              style={styles.packagesContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.packagesGrid}>
                {POINTS_PACKAGES.map((pkg, index) =>
                  renderPackageCard(pkg, index)
                )}
              </View>

              {/* Payment Info */}
              <View style={styles.paymentInfo}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                <Text style={styles.paymentInfoText}>
                  دفع آمن • سيتم خصم المبلغ من حسابك
                </Text>
              </View>

              {/* Smart Payment Button */}
              <TouchableOpacity
                style={styles.smartPaymentButton}
                onPress={() => {
                  onClose();
                  router.push('/payment' as any);
                }}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.smartPaymentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="wallet" size={20} color="#fff" />
                  <Text style={styles.smartPaymentText}>الدفع عبر التحويل</Text>
                  <Text style={styles.smartPaymentHint}>
                    آسياسيل • زين • ماستركارد • زين كاش
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>

            {/* Purchase Button */}
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!selectedPackage || loading) && styles.purchaseButtonDisabled,
              ]}
              onPress={handlePurchase}
              disabled={!selectedPackage || loading}
            >
              <LinearGradient
                colors={
                  selectedPackage && !loading
                    ? ['#6366f1', '#8b5cf6']
                    : ['#3f3f46', '#27272a']
                }
                style={styles.purchaseButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#fff" />
                    <Text style={styles.purchaseButtonText}>
                      {selectedPackage
                        ? `شراء ${
                            POINTS_PACKAGES.find(
                              (p) => p.id === selectedPackage
                            )?.label
                          }`
                        : 'اختر باقة'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  currentPointsText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 14,
  },
  dualCurrencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  currencyBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  currencyLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  currencyValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    color: '#60a5fa',
    fontSize: 13,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  packagesContainer: {
    maxHeight: height * 0.45,
  },
  packagesGrid: {
    gap: 12,
  },
  packageCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: '#8b5cf6',
  },
  packageCardPopular: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  packageGradient: {
    padding: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsTextSelected: {
    color: '#fff',
  },
  bonusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bonusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  priceTextSelected: {
    color: '#fff',
  },
  valueContainer: {
    marginTop: 4,
  },
  valueText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  valueTextSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
    gap: 8,
  },
  paymentInfoText: {
    color: '#6b7280',
    fontSize: 13,
  },
  purchaseButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smartPaymentButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  smartPaymentGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 4,
  },
  smartPaymentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smartPaymentHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});

export default PointsPurchaseModal;
