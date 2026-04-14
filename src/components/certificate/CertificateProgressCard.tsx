/**
 * 🎓 Certificate Progress Card - Kodax
 * يُعرض في صفحة الكورس لعرض حالة الشهادات والتقدم نحوها
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS, SHADOWS } from '@/styles/theme';
import {
  CertificateLevel,
  CERTIFICATE_LEVEL_CONFIG,
  EligibilityResult,
  CertificateSummaryItem,
} from '@/types/certificate';
import CertificateAwardModal from './CertificateAwardModal';
import { getChallengesByCourse, ALL_COURSES } from '@/constants/courseData';

interface CertificateProgressCardProps {
  fieldId: string;
  fieldName: string;
  fieldNameAr?: string;
  currentCertificate: CertificateSummaryItem | null;
  silverEligibility: EligibilityResult | null;
  goldEligibility: EligibilityResult | null;
  platinumEligibility: EligibilityResult | null;
  canClaim: boolean;
  claimableLevel: CertificateLevel | null;
  isLoading: boolean;
  isIssuing: boolean;
  onIssueCertificate: (level: CertificateLevel) => Promise<any>;
}

export default function CertificateProgressCard({
  fieldId,
  fieldName,
  fieldNameAr,
  currentCertificate,
  silverEligibility,
  goldEligibility,
  platinumEligibility,
  canClaim,
  claimableLevel,
  isLoading,
  isIssuing,
  onIssueCertificate,
}: CertificateProgressCardProps) {
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardedLevel, setAwardedLevel] = useState<CertificateLevel>('silver');
  const [awardedCertId, setAwardedCertId] = useState<string | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<any>(null);

  const handleClaim = useCallback(async () => {
    if (!claimableLevel) return;

    try {
      const result = await onIssueCertificate(claimableLevel);

      console.log(
        '[CertificateProgressCard] Issue result:',
        JSON.stringify(result)
      );

      if (result?.success && result?.certificate) {
        setAwardedLevel(claimableLevel);
        setAwardedCertId(result.certificate.id);
        setNextLevelInfo(result.next_level);
        setShowAwardModal(true);
      } else if (result?.error) {
        Alert.alert('لم يتم إصدار الشهادة', result.error, [
          { text: 'حسناً', style: 'default' },
        ]);
      }
    } catch (err: any) {
      console.error('[CertificateProgressCard] Claim error:', err);
      Alert.alert('خطأ', err?.message || 'حدث خطأ أثناء إصدار الشهادة', [
        { text: 'حسناً', style: 'default' },
      ]);
    }
  }, [claimableLevel, onIssueCertificate]);

  // Show detailed breakdown of challenges per course
  const showChallengeDetails = useCallback(() => {
    const fieldCourses = ALL_COURSES.filter((c) => c.fieldId === fieldId);

    let details = `تفاصيل التحديات في ${fieldNameAr || fieldName}:\n\n`;
    let totalChallenges = 0;

    fieldCourses.forEach((course) => {
      const challenges = getChallengesByCourse(course.id);
      totalChallenges += challenges.length;
      details += `▪️ ${course.title}: ${challenges.length} تحدي\n`;
    });

    details += `\n📊 المجموع: ${totalChallenges} تحدي`;

    Alert.alert('📈 التحديات حسب الدورة', details, [
      { text: 'حسناً', style: 'default' },
    ]);
  }, [fieldId, fieldName, fieldNameAr]);

  const levels: CertificateLevel[] = ['silver', 'gold', 'platinum'];
  const eligibilities: Record<string, EligibilityResult | null> = {
    silver: silverEligibility,
    gold: goldEligibility,
    platinum: platinumEligibility,
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={THEME_COLORS.accent} />
          <Text style={styles.loadingText}>فحص أهلية الشهادة...</Text>
        </View>
      </View>
    );
  }

  // Don't show if no eligibility data
  if (!silverEligibility && !goldEligibility && !platinumEligibility) {
    return null;
  }

  return (
    <>
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="ribbon" size={18} color={THEME_COLORS.accent} />
              <Text style={styles.headerTitle}>الشهادات</Text>
            </View>
            {currentCertificate && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname: '/certificate/[id]',
                    params: { id: currentCertificate.id },
                  })
                }
              >
                <Text style={styles.viewButtonText}>عرض شهادتي</Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={THEME_COLORS.accent}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Current Certificate */}
          {currentCertificate && (
            <View style={styles.currentCert}>
              <LinearGradient
                colors={
                  CERTIFICATE_LEVEL_CONFIG[currentCertificate.level]
                    .gradientColors
                }
                style={styles.currentCertBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={
                    CERTIFICATE_LEVEL_CONFIG[currentCertificate.level]
                      .iconName as any
                  }
                  size={14}
                  color="#1a1a2e"
                />
                <Text style={styles.currentCertLevel}>
                  {CERTIFICATE_LEVEL_CONFIG[currentCertificate.level].label}
                </Text>
              </LinearGradient>
              <Text style={styles.currentCertText}>شهادتك الحالية</Text>
            </View>
          )}

          {/* Level Progress Indicators */}
          <View style={styles.levelsRow}>
            {levels.map((level, index) => {
              const config = CERTIFICATE_LEVEL_CONFIG[level];
              const eligibility = eligibilities[level];
              const isEarned =
                currentCertificate &&
                levels.indexOf(currentCertificate.level) >= index;
              const isEligible = eligibility?.eligible || false;
              const isNext = level === claimableLevel;

              return (
                <View key={level} style={styles.levelItem}>
                  {/* Connector line */}
                  {index > 0 && (
                    <View
                      style={[
                        styles.connector,
                        isEarned && { backgroundColor: config.color },
                      ]}
                    />
                  )}

                  {/* Level circle */}
                  <View
                    style={[
                      styles.levelCircle,
                      isEarned && {
                        borderColor: config.color,
                        backgroundColor: `${config.color}20`,
                      },
                      isEligible &&
                        !isEarned && {
                          borderColor: config.color,
                          borderStyle: 'dashed' as any,
                        },
                    ]}
                  >
                    {isEarned ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={config.color}
                      />
                    ) : (
                      <Ionicons
                        name={config.iconName as any}
                        size={16}
                        color={
                          isEligible ? config.color : THEME_COLORS.textMuted
                        }
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.levelName,
                      isEarned && { color: config.color },
                    ]}
                  >
                    {config.label}
                  </Text>

                  {/* Progress percentage */}
                  {eligibility && !isEarned && (
                    <Text style={styles.levelProgress}>
                      {getProgressText(eligibility)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Progress Details */}
          {silverEligibility && (
            <View style={styles.progressDetails}>
              <View style={styles.progressDetailRow}>
                <Ionicons name="book" size={14} color="#60A5FA" />
                <Text style={styles.progressDetailLabel}>الدروس:</Text>
                <Text style={styles.progressDetailValue}>
                  {silverEligibility.progress.lessons_percent}%
                </Text>
              </View>
              <View style={styles.progressDetailRow}>
                <Ionicons name="trophy" size={14} color="#F59E0B" />
                <Text style={styles.progressDetailLabel}>التحديات:</Text>
                <Text style={styles.progressDetailValue}>
                  {silverEligibility.progress.challenges_percent}%
                </Text>
                <TouchableOpacity
                  onPress={showChallengeDetails}
                  style={styles.detailsButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={THEME_COLORS.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Claim Button */}
          {canClaim && claimableLevel && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaim}
              disabled={isIssuing}
            >
              <LinearGradient
                colors={CERTIFICATE_LEVEL_CONFIG[claimableLevel].gradientColors}
                style={styles.claimGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isIssuing ? (
                  <ActivityIndicator color="#1a1a2e" size="small" />
                ) : (
                  <>
                    <Ionicons name="ribbon" size={18} color="#1a1a2e" />
                    <Text style={styles.claimText}>
                      {currentCertificate
                        ? `ترقية إلى ${
                            CERTIFICATE_LEVEL_CONFIG[claimableLevel].labelAr
                          }`
                        : `الحصول على شهادة ${
                            CERTIFICATE_LEVEL_CONFIG[claimableLevel].labelAr
                          }`}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Next requirements hint */}
          {!canClaim &&
            getNextRequirements(eligibilities, currentCertificate) && (
              <View style={styles.nextHint}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={THEME_COLORS.textMuted}
                />
                <Text style={styles.nextHintText}>
                  {getNextRequirements(eligibilities, currentCertificate)}
                </Text>
              </View>
            )}
        </View>
      </Animated.View>

      {/* Award Modal */}
      <CertificateAwardModal
        visible={showAwardModal}
        level={awardedLevel}
        courseTitle={fieldName}
        courseTitleAr={fieldNameAr || ''}
        onClose={() => setShowAwardModal(false)}
        onViewCertificate={
          awardedCertId
            ? () =>
                router.push({
                  pathname: '/certificate/[id]',
                  params: { id: awardedCertId },
                })
            : undefined
        }
        nextLevel={nextLevelInfo}
      />
    </>
  );
}

// ===== Helpers =====

function getProgressText(eligibility: EligibilityResult): string {
  const { progress } = eligibility;
  // حساب متوسط التقدم من الدروس والتحديات فقط (بدون الاختبار)
  const metrics = [progress.lessons_percent, progress.challenges_percent];
  const avg = Math.round(metrics.reduce((a, b) => a + b, 0) / metrics.length);
  return `${avg}%`;
}

function getNextRequirements(
  eligibilities: Record<string, EligibilityResult | null>,
  currentCert: CertificateSummaryItem | null
): string | null {
  const levels: CertificateLevel[] = ['silver', 'gold', 'platinum'];
  const currentIndex = currentCert ? levels.indexOf(currentCert.level) : -1;

  // Find next level that user is NOT eligible for
  for (let i = currentIndex + 1; i < levels.length; i++) {
    const level = levels[i];
    const elig = eligibilities[level];
    if (elig && !elig.eligible && elig.reasons.length > 0) {
      // عرض جميع المتطلبات غير المستوفاة
      const allReasons = elig.reasons.join(' • ');
      return allReasons;
    }
  }

  return null;
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 16,
    ...SHADOWS.default,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    color: THEME_COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: THEME_COLORS.accent,
    fontWeight: '600',
  },
  currentCert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
  },
  currentCertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  currentCertEmoji: {
    fontSize: 14,
  },
  currentCertLevel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  currentCertText: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '600',
  },
  levelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  levelItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  connector: {
    position: 'absolute',
    top: 16,
    left: '-43%',
    right: '56.5%',
    height: 2,
    backgroundColor: THEME_COLORS.borderDark,
    zIndex: -2,
  },
  levelCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: THEME_COLORS.borderDark,
    backgroundColor: THEME_COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircleEmoji: {
    fontSize: 14,
  },
  levelName: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME_COLORS.textMuted,
  },
  levelProgress: {
    fontSize: 10,
    color: THEME_COLORS.textMuted,
    fontWeight: '600',
  },
  progressDetails: {
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  progressDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDetailLabel: {
    fontSize: 12,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
  },
  progressDetailValue: {
    fontSize: 12,
    color: THEME_COLORS.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
  },
  detailsButton: {
    padding: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: THEME_COLORS.backgroundLight,
  },
  claimButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: 2,
  },
  claimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  claimText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  nextHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    marginTop: 2,
  },
  nextHintText: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});
