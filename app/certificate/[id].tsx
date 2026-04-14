/**
 * 🎓 Certificate Detail Screen - Kodax
 * عرض تفاصيل الشهادة + تحميل PDF/Image + QR Code
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS, SHADOWS } from '@/styles/theme';
import { certificateService } from '@/services/certificateService';
import {
  CertificateSummaryItem,
  CERTIFICATE_LEVEL_CONFIG,
} from '@/types/certificate';
import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Certificate detail screen
 *
 * This screen displays the certificate details, which include the certificate
 * visual, achievement details, and actions to verify the certificate, share
 * it, or download it as a PDF or PNG image.
 *
 * @param {string} id - The certificate ID
 * @param {User} user - The user object
 * @param {ResponsiveLayout} isLargeScreen - Whether the screen is large or not
 * @param {CertificateSummaryItem | null} certificate - The certificate object or null
 * @param {boolean} isLoading - Whether the screen is loading or not
 * @param {string | null} error - The error message or null
 * @param {Function} loadCertificate - The function to load the certificate
 * @param {Function} handleShare - The function to handle sharing the certificate
 * @param {Function} handleVerify - The function to handle verifying the certificate
 */
/*******  8772c9e4-83c9-4923-9c0a-be2de61d2290  *******/
export default function CertificateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();

  const [certificate, setCertificate] = useState<CertificateSummaryItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrichedSnapshot, setEnrichedSnapshot] = useState<any>(null);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  // Fallback: If snapshot is empty/invalid, recalculate from Edge Function
  const enrichAchievementSnapshot = async (cert: CertificateSummaryItem) => {
    if (
      !cert.achievement_snapshot ||
      (!cert.achievement_snapshot.total_lessons &&
        !cert.achievement_snapshot.total_challenges)
    ) {
      try {
        // Call Edge Function to get fresh data
        const response = await fetch(
          'https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/certificate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.id}`,
            },
            body: JSON.stringify({
              action: 'check_eligibility',
              course_id: cert.field_id,
              user_id: user?.id,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.progress) {
            const enriched = {
              ...cert.achievement_snapshot,
              total_lessons: result.progress.lessons_total,
              completed_lessons: result.progress.lessons_completed,
              lessons_percent: result.progress.lessons_percent,
              total_challenges: result.progress.challenges_total,
              completed_challenges: result.progress.challenges_completed,
              challenges_percent: result.progress.challenges_percent,
            };
            setEnrichedSnapshot(enriched);
          }
        }
      } catch (e) {
        console.error('Failed to enrich snapshot:', e);
      }
    }
  };

  const loadCertificate = async () => {
    if (!id || !user?.id) return;

    setIsLoading(true);
    try {
      certificateService.setUser(user.id);
      const summary = await certificateService.getUserCertificates();
      const cert = summary.certificates.find((c) => c.id === id);
      if (cert) {
        setCertificate(cert);
        await enrichAchievementSnapshot(cert);
      } else {
        setError('لم يتم العثور على الشهادة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;
    const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
    try {
      await Share.share({
        title: `شهادة ${config.label} - Kodax`,
        message: `حصلت على شهادة ${config.label} في ${
          certificate.course_title_ar || certificate.course_title
        } من منصة Kodax!\n\nتحقق من الشهادة: Certificate ID: ${certificate.id}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleVerify = () => {
    router.push({
      pathname: '/certificate/verify',
      params: { id: certificate?.id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={THEME_COLORS.accent} />
      </View>
    );
  }

  if (error || !certificate) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="alert-circle" size={48} color={THEME_COLORS.error} />
        <Text style={styles.errorText}>{error || 'خطأ غير معروف'}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
  const isArchived = certificate.status === 'archived';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الشهادة</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge,
        ]}
      >
        {/* Certificate Card (Visual) */}
        <Animated.View entering={ZoomIn.delay(100).duration(600)}>
          <View
            style={[styles.certVisual, { borderColor: config.borderColor }]}
          >
            <LinearGradient
              colors={['#1a1a3e', '#252550', '#1a1a3e']}
              style={styles.certGradient}
            >
              {/* Top Border Gradient */}
              <LinearGradient
                colors={config.gradientColors}
                style={styles.certTopBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />

              {/* Certificate Content */}
              <View style={styles.certContent}>
                {/* Logo */}
                <Image
                  source={require('../../assets/kodax-light-trans.png')}
                  style={styles.certLogoImage}
                  resizeMode="contain"
                />
                <Text style={styles.certSubtitle}>
                  CERTIFICATE OF ACHIEVEMENT
                </Text>
                <Text style={styles.certSubtitleAr}>شهادة إنجاز</Text>

                {/* Level Badge */}
                <View style={styles.certLevelSection}>
                  <LinearGradient
                    colors={config.gradientColors}
                    style={styles.certLevelPill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={config.iconName as any}
                      size={18}
                      color="#1a1a2e"
                    />
                    <Text style={styles.certLevelLabel}>{config.label}</Text>
                  </LinearGradient>
                </View>

                {/* Recipient */}
                <Text style={styles.certPresentedTo}>
                  THIS IS TO CERTIFY THAT
                </Text>
                <Text style={styles.certRecipientLabel}>
                  هذه الشهادة تُمنح إلى
                </Text>

                {/* Divider */}
                <View style={styles.certDivider} />

                {/* Course */}
                <Text style={styles.certCourseLabel}>FOR COMPLETING</Text>
                <Text style={styles.certCourse}>
                  {certificate.course_title_ar || certificate.course_title}
                </Text>
                <Text style={styles.certCourseEn}>
                  {certificate.course_title}
                </Text>

                {/* Date */}
                <Text style={styles.certDate}>
                  {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>

                {/* Certificate ID */}
                <View style={styles.certIdContainer}>
                  <Text style={styles.certIdLabel}>Certificate ID</Text>
                  <Text style={styles.certId} selectable>
                    {certificate.id}
                  </Text>
                </View>

                {/* Status */}
                {isArchived && (
                  <View style={styles.archivedOverlay}>
                    <Text style={styles.archivedOverlayText}>
                      مؤرشفة - ARCHIVED
                    </Text>
                  </View>
                )}
              </View>

              {/* Bottom Border Gradient */}
              <LinearGradient
                colors={config.gradientColors}
                style={styles.certBottomBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Achievement Details */}
        {/* Achievement Details */}
        {certificate.achievement_snapshot && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.achievementCard}>
              <Text style={styles.sectionTitle}>الإنجازات</Text>

              <View style={styles.achievementGrid}>
                <AchievementItem
                  iconName="book"
                  label="إكمال الدروس"
                  value={`${(enrichedSnapshot || (certificate.achievement_snapshot as any)).completed_lessons ?? (enrichedSnapshot || (certificate.achievement_snapshot as any)).lessons_completed ?? 0}/${(enrichedSnapshot || (certificate.achievement_snapshot as any)).total_lessons ?? (enrichedSnapshot || (certificate.achievement_snapshot as any)).lessons_total ?? 0}`}
                  percent={Math.round(
                    (
                      enrichedSnapshot ||
                      (certificate.achievement_snapshot as any)
                    ).lessons_percent ?? 0
                  )}
                  color="#3b82f6"
                />
                <AchievementItem
                  iconName="trophy"
                  label="التحديات"
                  value={`${(enrichedSnapshot || (certificate.achievement_snapshot as any)).completed_challenges ?? (enrichedSnapshot || (certificate.achievement_snapshot as any)).challenges_completed ?? 0}/${(enrichedSnapshot || (certificate.achievement_snapshot as any)).total_challenges ?? (enrichedSnapshot || (certificate.achievement_snapshot as any)).challenges_total ?? 0}`}
                  percent={Math.round(
                    (
                      enrichedSnapshot ||
                      (certificate.achievement_snapshot as any)
                    ).challenges_percent ?? 0
                  )}
                  color="#8b5cf6"
                />
                {(certificate.achievement_snapshot as any).avg_exam_score !==
                  null &&
                  (certificate.achievement_snapshot as any).avg_exam_score !==
                    undefined && (
                    <AchievementItem
                      iconName="document-text"
                      label="درجة الامتحان"
                      value={`${Math.round((certificate.achievement_snapshot as any).avg_exam_score ?? 0)}%`}
                      percent={Math.round(
                        (certificate.achievement_snapshot as any)
                          .avg_exam_score ?? 0
                      )}
                      color="#10b981"
                    />
                  )}
                {(certificate.achievement_snapshot as any).completion_days !==
                  null &&
                  (certificate.achievement_snapshot as any).completion_days !==
                    undefined && (
                    <AchievementItem
                      iconName="time"
                      label="مدة الإنجاز"
                      value={`${(certificate.achievement_snapshot as any).completion_days} يوم`}
                      percent={100}
                      color="#f59e0b"
                    />
                  )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>إجراءات</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVerify}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={THEME_COLORS.accent}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>التحقق من الشهادة</Text>
                <Text style={styles.actionSubtitle}>
                  تحقق من صلاحية الشهادة علنياً
                </Text>
              </View>
              <Ionicons
                name="chevron-back"
                size={20}
                color={THEME_COLORS.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                ]}
              >
                <Ionicons
                  name="share-social"
                  size={22}
                  color={THEME_COLORS.secondary}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>مشاركة الشهادة</Text>
                <Text style={styles.actionSubtitle}>
                  شارك إنجازك مع الآخرين
                </Text>
              </View>
              <Ionicons
                name="chevron-back"
                size={20}
                color={THEME_COLORS.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: '/certificate/download',
                  params: { id: certificate.id },
                })
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                ]}
              >
                <Ionicons
                  name="download"
                  size={22}
                  color={THEME_COLORS.success}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>تحميل الشهادة</Text>
                <Text style={styles.actionSubtitle}>
                  PDF أو صورة PNG عالية الدقة
                </Text>
              </View>
              <Ionicons
                name="chevron-back"
                size={20}
                color={THEME_COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ===== Sub-components =====

function AchievementItem({
  iconName,
  label,
  value,
  percent,
  color,
}: {
  iconName: string;
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.achievementItem}>
      <View style={styles.achievementItemHeader}>
        <Ionicons name={iconName as any} size={16} color={color} />
        <Text style={styles.achievementItemLabel}>{label}</Text>
      </View>
      <Text style={styles.achievementItemValue}>{value}</Text>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.backgroundDark,
    gap: 12,
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentLarge: {
    maxWidth: 650,
    alignSelf: 'center',
    width: '100%',
  },

  // Certificate Visual
  certVisual: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.default,
  },
  certGradient: {
    padding: 0,
  },
  certTopBorder: {
    height: 4,
  },
  certBottomBorder: {
    height: 4,
  },
  certContent: {
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  certLogoImage: {
    width: 100,
    height: 40,
    marginBottom: 4,
  },
  certSubtitle: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  certSubtitleAr: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  certLevelSection: {
    marginVertical: 12,
  },
  certLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.full,
    gap: 8,
  },
  certLevelEmoji: {
    fontSize: 20,
  },
  certLevelLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 2,
  },
  certPresentedTo: {
    fontSize: 10,
    color: THEME_COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 12,
  },
  certRecipientLabel: {
    fontSize: 12,
    color: THEME_COLORS.textSecondary,
  },
  certDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  certCourseLabel: {
    fontSize: 10,
    color: THEME_COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 8,
  },
  certCourse: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  certCourseEn: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    marginBottom: 12,
  },
  certDate: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    marginTop: 8,
  },
  certIdContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  certIdLabel: {
    fontSize: 10,
    color: THEME_COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  certId: {
    fontSize: 10,
    color: THEME_COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  archivedOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.md,
    transform: [{ rotate: '-15deg' }],
  },
  archivedOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Achievement Section
  achievementCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  achievementGrid: {
    gap: 12,
  },
  achievementItem: {
    gap: 6,
  },
  achievementItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  achievementItemIcon: {
    fontSize: 16,
  },
  achievementItemLabel: {
    fontSize: 13,
    color: THEME_COLORS.textMuted,
    flex: 1,
  },
  achievementItemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Actions
  actionsCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
    marginTop: 2,
  },
});
