/**
 * مودال شراء الكورس - Course Purchase Modal
 * يعرض خيارات الشراء الكامل أو المجزأ
 * مع أيقونات مختلفة للعملات
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { CURRENCY_ICONS, CURRENCY_COLORS } from '../../services/pointsService';

const { width, height } = Dimensions.get('window');

// ثوابت التسعير
const FULL_PURCHASE_DISCOUNT = 200; // التوفير عند الشراء الكامل

// ملاحظة: ICONS object محذوف - يتم استخدام Ionicons مباشرة

export interface CourseSection {
  id: string;
  name: string;
  lessonsCount: number;
  isUnlocked: boolean;
}

interface CoursePurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  fullPrice: number; // سعر الكورس كاملاً
  sections: CourseSection[];
  currentCredits: number;
  unlockedSections?: string[]; // الأقسام المشتراة سابقاً
  onPurchaseFull: () => Promise<{ success: boolean; error?: string }>;
  onPurchaseSection: (
    sectionId: string,
    cost: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export function CoursePurchaseModal({
  visible,
  onClose,
  courseId,
  courseName,
  fullPrice,
  sections,
  currentCredits,
  unlockedSections = [],
  onPurchaseFull,
  onPurchaseSection,
}: CoursePurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // حساب الأسعار مع خصم الأقسام المشتراة سابقاً
  const pricing = useMemo(() => {
    // حساب الأقسام المفتوحة (من sections + unlockedSections)
    const unlockedCount = sections.filter(
      (s) => s.isUnlocked || unlockedSections.includes(s.id)
    ).length;
    const totalSections = sections.length;

    // سعر القسم الواحد
    const sectionPrice = Math.ceil(
      (fullPrice + FULL_PURCHASE_DISCOUNT) / Math.max(totalSections, 1)
    );

    // حساب ما تم دفعه للأقسام المفتوحة (خصم تلقائي)
    const paidForSections = unlockedCount * sectionPrice;

    // حساب السعر المتبقي للكورس الكامل (بعد خصم المدفوع)
    const remainingFullPrice = Math.max(0, fullPrice - paidForSections);

    // التوفير الحقيقي
    const totalIfBuySeparately = (totalSections - unlockedCount) * sectionPrice;
    const actualSavings = Math.max(
      0,
      totalIfBuySeparately - remainingFullPrice
    );

    return {
      sectionPrice,
      fullPrice: remainingFullPrice,
      totalIfBuySeparately,
      savings: actualSavings,
      unlockedCount,
      totalSections,
    };
  }, [sections, fullPrice]);

  const handlePurchaseFull = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await onPurchaseFull();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
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
  };

  const handlePurchaseSection = async (sectionId: string) => {
    setLoading(true);
    setError(null);
    setSelectedSection(sectionId);

    try {
      const result = await onPurchaseSection(sectionId, pricing.sectionPrice);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedSection(null);
        }, 1500);
      } else {
        setError(result.error || 'حدث خطأ أثناء الشراء');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const canAffordFull = currentCredits >= pricing.fullPrice;
  const canAffordSection = currentCredits >= pricing.sectionPrice;

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
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

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
              <View style={styles.titleRow}>
                <Ionicons
                  name="book"
                  size={20}
                  color="#8b5cf6"
                  style={{ marginEnd: 8 }}
                />
                <Text style={styles.title}>شراء الكورس</Text>
              </View>
              <View style={styles.creditsContainer}>
                <Ionicons name="diamond" size={16} color="#a78bfa" />
                <Text style={styles.creditsText}>
                  {currentCredits.toLocaleString('ar-IQ')}
                </Text>
              </View>
            </View>

            {/* Course Name */}
            <View style={styles.courseNameContainer}>
              <Text style={styles.courseName}>{courseName}</Text>
              <Text style={styles.progressText}>
                {pricing.unlockedCount}/{pricing.totalSections} أقسام مفتوحة
              </Text>
              {pricing.unlockedCount > 0 && (
                <View style={styles.discountNoteContainer}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#3b82f6"
                    style={{ marginEnd: 4 }}
                  />
                  <Text style={styles.discountNote}>
                    تم خصم {pricing.unlockedCount * pricing.sectionPrice} من
                    المبلغ للأقسام المشتراة
                  </Text>
                </View>
              )}
            </View>

            {/* Success/Error Messages */}
            {success && (
              <Animated.View entering={FadeIn} style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.successText}>تم الشراء بنجاح!</Text>
              </Animated.View>
            )}

            {error && (
              <Animated.View entering={FadeIn} style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Full Purchase Option */}
              <Animated.View entering={FadeIn.delay(100)}>
                <TouchableOpacity
                  style={[
                    styles.fullPurchaseCard,
                    !canAffordFull && styles.disabledCard,
                  ]}
                  onPress={handlePurchaseFull}
                  disabled={
                    loading || !canAffordFull || pricing.fullPrice === 0
                  }
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.fullPurchaseGradient}
                  >
                    <View style={styles.fullPurchaseHeader}>
                      <View style={styles.recommendedBadge}>
                        <Ionicons
                          name="star"
                          size={14}
                          color="#fbbf24"
                          style={{ marginEnd: 4 }}
                        />
                        <Text style={styles.recommendedText}>موصى به</Text>
                      </View>
                    </View>

                    <View style={styles.fullPurchaseContent}>
                      <Ionicons name="gift" size={32} color="#fff" />
                      <View style={styles.fullPurchaseInfo}>
                        <Text style={styles.fullPurchaseTitle}>
                          اشتري الكورس كاملاً
                        </Text>
                        <Text style={styles.fullPurchasePrice}>
                          {pricing.fullPrice.toLocaleString('ar-IQ')}{' '}
                        </Text>
                        <Ionicons
                          name="diamond"
                          size={16}
                          color="#fff"
                          style={{ marginStart: 4 }}
                        />
                        {pricing.savings > 0 && (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Text style={styles.savingsText}>
                              ووفر {pricing.savings.toLocaleString('ar-IQ')}
                            </Text>
                            <Ionicons name="diamond" size={14} color="#fff" />
                            <Ionicons name="gift" size={14} color="#fff" />
                          </View>
                        )}
                      </View>
                    </View>

                    {loading && !selectedSection && (
                      <ActivityIndicator color="#fff" style={styles.loader} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>أو اشتري قسم بقسم</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Warning */}
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    flex: 1,
                  }}
                >
                  <Text style={styles.warningText}>
                    الشراء المجزأ يكلف {FULL_PURCHASE_DISCOUNT}
                  </Text>
                  <Ionicons name="diamond" size={14} color="#f59e0b" />
                  <Text style={styles.warningText}> أكثر من الشراء الكامل</Text>
                </View>
              </View>

              {/* Sections List */}
              {sections.map((section, index) => (
                <Animated.View
                  key={section.id}
                  entering={FadeIn.delay(200 + index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.sectionCard,
                      section.isUnlocked && styles.sectionUnlocked,
                      !canAffordSection &&
                        !section.isUnlocked &&
                        styles.disabledCard,
                    ]}
                    onPress={() =>
                      !section.isUnlocked && handlePurchaseSection(section.id)
                    }
                    disabled={
                      loading || section.isUnlocked || !canAffordSection
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.sectionInfo}>
                      <View style={styles.sectionHeader}>
                        {section.isUnlocked ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#10b981"
                          />
                        ) : (
                          <Ionicons
                            name="lock-closed"
                            size={24}
                            color="#6b7280"
                          />
                        )}
                        <Text
                          style={[
                            styles.sectionName,
                            section.isUnlocked && styles.sectionNameUnlocked,
                          ]}
                        >
                          {section.name}
                        </Text>
                      </View>
                      <Text style={styles.lessonsCount}>
                        {section.lessonsCount} دروس
                      </Text>
                    </View>

                    {!section.isUnlocked && (
                      <View style={styles.sectionPrice}>
                        <Text style={styles.sectionPriceText}>
                          {pricing.sectionPrice.toLocaleString('ar-IQ')}
                        </Text>
                        <Text style={{ fontSize: 14 }}>
                          {CURRENCY_ICONS.coins}
                        </Text>
                        {loading && selectedSection === section.id && (
                          <ActivityIndicator size="small" color="#a78bfa" />
                        )}
                      </View>
                    )}

                    {section.isUnlocked && (
                      <View style={styles.unlockedBadge}>
                        <Text style={styles.unlockedText}>مفتوح ✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>

            {/* Not Enough Credits Warning */}
            {!canAffordSection && (
              <View style={styles.notEnoughCredits}>
                <Ionicons name="wallet" size={20} color="#ef4444" />
                <Text style={styles.notEnoughText}>
                  رصيدك غير كافٍ. اشحن رصيدك للمتابعة
                </Text>
              </View>
            )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  creditsText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 14,
  },
  courseNameContainer: {
    marginBottom: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  discountNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  discountNote: {
    fontSize: 12,
    color: '#3b82f6',
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
  scrollContent: {
    maxHeight: height * 0.5,
  },
  fullPurchaseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fullPurchaseGradient: {
    padding: 20,
  },
  fullPurchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullPurchaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fullPurchaseInfo: {
    flex: 1,
  },
  fullPurchaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  fullPurchasePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  savingsText: {
    fontSize: 14,
    color: '#d1fae5',
    marginTop: 4,
  },
  loader: {
    position: 'absolute',
    right: 20,
    top: '50%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 12,
    flex: 1,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 30, 40, 0.8)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionUnlocked: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  disabledCard: {
    opacity: 0.5,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionNameUnlocked: {
    color: '#10b981',
  },
  lessonsCount: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 34,
  },
  sectionPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unlockedText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  notEnoughCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  notEnoughText: {
    color: '#ef4444',
    fontSize: 13,
  },
});

export default CoursePurchaseModal;
