/**
 * 🎓 My Certificates Screen - Kodax
 * صفحة الشهادات في البروفايل
 * عرض جميع الشهادات مع تصنيف وفلترة
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS, SHADOWS } from '@/styles/theme';
import { certificateService } from '@/services/certificateService';
import {
  CertificateLevel,
  CertificateSummaryItem,
  UserCertificatesSummary,
  CERTIFICATE_LEVEL_CONFIG,
} from '@/types/certificate';
import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

type FilterType = 'all' | CertificateLevel;

export default function MyCertificatesScreen() {
  const { user } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();

  const [summary, setSummary] = useState<UserCertificatesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(
    async (showRefresh = false) => {
      if (!user?.id) return;

      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        certificateService.setUser(user.id);
        const data = await certificateService.getUserCertificates();
        setSummary(data);
        setError(null);
      } catch (err: any) {
        // Try offline cache
        const offline = await certificateService.getCertificatesOffline();
        if (offline) {
          setSummary(offline);
        } else {
          setError('فشل في تحميل الشهادات');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchCertificates();
    }, [fetchCertificates])
  );

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    if (!summary?.certificates) return [];
    if (filter === 'all') return summary.certificates;
    return summary.certificates.filter((c) => c.level === filter);
  }, [summary?.certificates, filter]);

  // Group by course
  const groupedByCourse = useMemo(() => {
    const grouped: Record<
      string,
      {
        courseTitle: string;
        courseTitleAr?: string;
        certs: CertificateSummaryItem[];
      }
    > = {};

    for (const cert of filteredCertificates) {
      if (!cert.course_id) continue;
      if (!grouped[cert.course_id]) {
        grouped[cert.course_id] = {
          courseTitle: cert.course_title || 'Unknown Course',
          courseTitleAr: cert.course_title_ar,
          certs: [],
        };
      }
      grouped[cert.course_id].certs.push(cert);
    }

    return Object.entries(grouped);
  }, [filteredCertificates]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: summary?.total || 0 },
    { key: 'platinum', label: 'Platinum', count: summary?.platinum || 0 },
    { key: 'gold', label: 'Gold', count: summary?.gold || 0 },
    { key: 'silver', label: 'Silver', count: summary?.silver || 0 },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={THEME_COLORS.accent} />
        <Text style={styles.loadingText}>جاري تحميل الشهادات...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>شهاداتي</Text>
        <TouchableOpacity
          onPress={() => router.push('/certificate/verify')}
          style={styles.verifyButton}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={THEME_COLORS.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchCertificates(true)}
            tintColor={THEME_COLORS.accent}
          />
        }
      >
        {/* Stats Cards */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.statsRow}
        >
          <StatCard
            iconName="medal"
            label="Silver"
            count={summary?.silver || 0}
            color="#C0C0C0"
          />
          <StatCard
            iconName="trophy"
            label="Gold"
            count={summary?.gold || 0}
            color="#FFD700"
          />
          <StatCard
            iconName="diamond"
            label="Platinum"
            count={summary?.platinum || 0}
            color="#E5E4E2"
          />
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterTab,
                  filter === f.key && styles.filterTabActive,
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f.key && styles.filterTextActive,
                  ]}
                >
                  {f.label} ({f.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Certificates List */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color={THEME_COLORS.warning} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {filteredCertificates.length === 0 ? (
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.emptyState}
          >
            <Ionicons
              name="ribbon-outline"
              size={64}
              color={THEME_COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {filter === 'all'
                ? 'لا توجد شهادات بعد'
                : `لا توجد شهادات ${
                    CERTIFICATE_LEVEL_CONFIG[filter as CertificateLevel]
                      ?.labelAr || ''
                  }`}
            </Text>
            <Text style={styles.emptySubtitle}>
              أكمل الكورسات واجتز الاختبارات النهائية للحصول على الشهادات
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.startButtonText}>ابدأ التعلم الآن</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.certificatesList}>
            {groupedByCourse.map(([courseId, group], groupIndex) => (
              <Animated.View
                key={courseId}
                entering={FadeInUp.delay(300 + groupIndex * 100).duration(500)}
              >
                {/* Course Header */}
                <Text style={styles.courseGroupTitle}>
                  {group.courseTitleAr || group.courseTitle}
                </Text>

                {group.certs.map((cert, certIndex) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    index={certIndex}
                  />
                ))}
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ===== Sub-components =====

function StatCard({
  iconName,
  label,
  count,
  color,
}: {
  iconName: string;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <Ionicons name={iconName as any} size={22} color={color} />
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CertificateCard({
  certificate,
  index,
}: {
  certificate: CertificateSummaryItem;
  index: number;
}) {
  const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
  const isArchived = certificate.status === 'archived';

  return (
    <TouchableOpacity
      style={[
        styles.certCard,
        {
          borderColor: isArchived
            ? THEME_COLORS.borderDark
            : config.borderColor,
        },
        isArchived && styles.certCardArchived,
      ]}
      onPress={() =>
        router.push({
          pathname: '/certificate/[id]',
          params: { id: certificate.id },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.certCardHeader}>
        {/* Level Badge */}
        <LinearGradient
          colors={config.gradientColors}
          style={styles.certLevelBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.certLevelEmoji}>
            <Ionicons name={config.iconName as any} size={14} color="#1a1a2e" />
          </Text>
          <Text style={styles.certLevelText}>{config.label}</Text>
        </LinearGradient>

        {/* Status */}
        <View style={styles.certStatusContainer}>
          {isArchived ? (
            <View style={styles.archivedBadge}>
              <Ionicons
                name="archive"
                size={14}
                color={THEME_COLORS.textMuted}
              />
              <Text style={styles.archivedText}>مؤرشفة</Text>
            </View>
          ) : (
            <View style={styles.validBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={THEME_COLORS.success}
              />
              <Text style={styles.validText}>صالحة</Text>
            </View>
          )}
        </View>
      </View>

      <Text
        style={[
          styles.certCourseTitle,
          isArchived && styles.certCourseTitleArchived,
        ]}
        numberOfLines={1}
      >
        {certificate.course_title_ar || certificate.course_title}
      </Text>

      <View style={styles.certFooter}>
        <Text style={styles.certDate}>
          {new Date(certificate.issued_at).toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Ionicons
          name="chevron-back"
          size={18}
          color={THEME_COLORS.textMuted}
        />
      </View>

      {/* Achievement mini stats */}
      {certificate.achievement_snapshot && (
        <View style={styles.miniStats}>
          <MiniStat
            label="دروس"
            value={`${certificate.achievement_snapshot.lessons_percent}%`}
          />
          <MiniStat
            label="تحديات"
            value={`${certificate.achievement_snapshot.challenges_percent}%`}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStatItem}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
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
  },
  loadingText: {
    color: THEME_COLORS.textMuted,
    marginTop: 12,
    fontSize: 14,
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
  verifyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentLarge: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
  },
  statCount: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    fontWeight: '600',
  },
  filterContainer: {
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: THEME_COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
  },
  filterTabActive: {
    backgroundColor: THEME_COLORS.accent,
    borderColor: THEME_COLORS.accent,
  },
  filterText: {
    fontSize: 13,
    color: THEME_COLORS.textMuted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 16,
  },
  errorText: {
    color: THEME_COLORS.warning,
    fontSize: 14,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  startButton: {
    marginTop: 12,
    backgroundColor: THEME_COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  certificatesList: {
    gap: 16,
  },
  courseGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 4,
  },
  certCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    ...SHADOWS.default,
  },
  certCardArchived: {
    opacity: 0.6,
  },
  certCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  certLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  certLevelEmoji: {
    fontSize: 14,
  },
  certLevelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  certStatusContainer: {},
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  archivedText: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validText: {
    fontSize: 11,
    color: THEME_COLORS.success,
  },
  certCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  certCourseTitleArchived: {
    color: THEME_COLORS.textMuted,
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certDate: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
  },
  miniStats: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    marginTop: 4,
  },
  miniStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME_COLORS.textSecondary,
  },
  miniStatLabel: {
    fontSize: 10,
    color: THEME_COLORS.textMuted,
  },
});
