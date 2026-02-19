/**
 * 🔍 Certificate Verification Screen - Kodax
 * Public certificate verification page
 * يمكن لأي شخص التحقق من صحة الشهادة عبر Certificate ID
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS, SHADOWS } from '@/styles/theme';
import { certificateService } from '@/services/certificateService';
import {
  VerificationResult,
  CERTIFICATE_LEVEL_CONFIG,
} from '@/types/certificate';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function CertificateVerifyScreen() {
  const { id: paramId } = useLocalSearchParams<{ id?: string }>();
  const { isLargeScreen } = useResponsiveLayout();

  const [certificateId, setCertificateId] = useState(paramId || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-verify if ID is passed via params
  React.useEffect(() => {
    if (paramId) {
      handleVerify();
    }
  }, [paramId]);

  const handleVerify = useCallback(async () => {
    const idToVerify = certificateId.trim();
    if (!idToVerify) {
      setError('الرجاء إدخال رقم الشهادة');
      return;
    }

    // Basic UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idToVerify)) {
      setError('رقم الشهادة غير صالح');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const verificationResult =
        await certificateService.verifyCertificate(idToVerify);
      setResult(verificationResult);
    } catch (err: any) {
      setError(err.message || 'فشل في التحقق من الشهادة');
    } finally {
      setIsLoading(false);
    }
  }, [certificateId]);

  const levelConfig = result?.level
    ? CERTIFICATE_LEVEL_CONFIG[result.level]
    : null;

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
        <Text style={styles.headerTitle}>التحقق من الشهادة</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isLargeScreen && styles.scrollContentLarge,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={styles.searchCard}>
              <View style={styles.searchIconContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={48}
                  color={THEME_COLORS.accent}
                />
              </View>
              <Text style={styles.searchTitle}>تحقق من صحة الشهادة</Text>
              <Text style={styles.searchSubtitle}>
                أدخل رقم الشهادة (Certificate ID) للتحقق من صحتها
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === 'web' && ({ outline: 'none' } as any),
                  ]}
                  value={certificateId}
                  onChangeText={(text) => {
                    setCertificateId(text);
                    setError(null);
                  }}
                  placeholder="أدخل Certificate ID"
                  placeholderTextColor={THEME_COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleVerify}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="search" size={22} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
            </View>
          </Animated.View>

          {/* Result Section */}
          {result && (
            <Animated.View entering={FadeInUp.delay(200).duration(500)}>
              {result.found ? (
                <View
                  style={[
                    styles.resultCard,
                    {
                      borderColor:
                        result.status === 'valid'
                          ? levelConfig?.borderColor || THEME_COLORS.success
                          : THEME_COLORS.error,
                    },
                  ]}
                >
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          result.status === 'valid'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        result.status === 'valid'
                          ? 'checkmark-circle'
                          : 'close-circle'
                      }
                      size={24}
                      color={
                        result.status === 'valid'
                          ? THEME_COLORS.success
                          : THEME_COLORS.error
                      }
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            result.status === 'valid'
                              ? THEME_COLORS.success
                              : THEME_COLORS.error,
                        },
                      ]}
                    >
                      {result.status === 'valid'
                        ? '✅ شهادة صالحة'
                        : '❌ شهادة ملغاة'}
                    </Text>
                  </View>

                  {/* Certificate Level */}
                  {levelConfig && (
                    <View style={styles.levelContainer}>
                      <LinearGradient
                        colors={levelConfig.gradientColors}
                        style={styles.levelBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons
                          name={levelConfig.iconName as any}
                          size={18}
                          color="#1a1a2e"
                        />
                        <Text style={styles.levelText}>
                          {levelConfig.label}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}

                  {/* Certificate Details */}
                  <View style={styles.detailsContainer}>
                    <DetailRow
                      icon="person"
                      label="صاحب الشهادة"
                      value={result.holder_name || ''}
                    />
                    <DetailRow
                      icon="book"
                      label="الكورس"
                      value={
                        result.course_title_ar || result.course_title || ''
                      }
                    />
                    <DetailRow
                      icon="calendar"
                      label="تاريخ الإصدار"
                      value={
                        result.issued_at
                          ? new Date(result.issued_at).toLocaleDateString(
                              'ar-IQ',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : ''
                      }
                    />
                    <DetailRow
                      icon="finger-print"
                      label="رقم الشهادة"
                      value={result.certificate_id || ''}
                      small
                    />
                  </View>

                  {/* Achievement Summary */}
                  {result.achievement_snapshot && (
                    <View style={styles.achievementSection}>
                      <Text style={styles.achievementTitle}>
                        ملخص الإنجازات
                      </Text>
                      <View style={styles.achievementGrid}>
                        <AchievementCard
                          iconName="book"
                          label="الدروس"
                          value={`${result.achievement_snapshot.lessons_percent}%`}
                        />
                        <AchievementCard
                          iconName="trophy"
                          label="التحيات"
                          value={`${result.achievement_snapshot.challenges_percent}%`}
                        />
                        <AchievementCard
                          iconName="document-text"
                          label="الاختبار"
                          value={
                            (result.achievement_snapshot as any).exam_score !==
                            null
                              ? `${(result.achievement_snapshot as any).exam_score}%`
                              : '-'
                          }
                        />
                      </View>
                    </View>
                  )}

                  {/* Revocation Info */}
                  {result.status === 'revoked' && result.revoked_at && (
                    <View style={styles.revokedInfo}>
                      <Text style={styles.revokedText}>
                        تم إلغاء هذه الشهادة بتاريخ{' '}
                        {new Date(result.revoked_at).toLocaleDateString(
                          'ar-IQ'
                        )}
                      </Text>
                      {result.revocation_reason && (
                        <Text style={styles.revokedReason}>
                          السبب: {result.revocation_reason}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.notFoundCard}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={THEME_COLORS.warning}
                  />
                  <Text style={styles.notFoundTitle}>
                    لم يتم العثور على الشهادة
                  </Text>
                  <Text style={styles.notFoundSubtitle}>
                    تأكد من إدخال رقم الشهادة بشكل صحيح
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Empty state */}
          {!result && !isLoading && !hasSearched && (
            <Animated.View
              entering={FadeIn.delay(300).duration(500)}
              style={styles.emptyState}
            >
              <Ionicons
                name="document-text-outline"
                size={64}
                color={THEME_COLORS.textMuted}
              />
              <Text style={styles.emptyText}>
                أدخل رقم الشهادة أعلاه للتحقق من صحتها
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ===== Sub-components =====
function DetailRow({
  icon,
  label,
  value,
  small,
}: {
  icon: string;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        <Ionicons name={icon as any} size={18} color={THEME_COLORS.textMuted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text
        style={[styles.detailValue, small && styles.detailValueSmall]}
        numberOfLines={2}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

function AchievementCard({
  iconName,
  label,
  value,
}: {
  iconName: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.achievementCard}>
      <Ionicons name={iconName as any} size={20} color={THEME_COLORS.accent} />
      <Text style={styles.achievementValue}>{value}</Text>
      <Text style={styles.achievementLabel}>{label}</Text>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundDark,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentLarge: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  searchCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    alignItems: 'center',
    ...SHADOWS.default,
  },
  searchIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: THEME_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.blueGlow,
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    ...SHADOWS.default,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.full,
    gap: 8,
  },
  levelEmoji: {
    fontSize: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: THEME_COLORS.textSecondary,
  },
  achievementSection: {
    marginTop: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  achievementCard: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  achievementLabel: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
  },
  revokedInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  revokedText: {
    color: THEME_COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },
  revokedReason: {
    color: THEME_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  notFoundCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 32,
    marginTop: 20,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    alignItems: 'center',
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.warning,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
  },
});
