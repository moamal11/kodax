import { CourseJourney } from '@/features/learn/CourseJourney';
import { NextBadgeGoal } from '@/features/rewards/NextBadgeGoal';
import { useBadges } from '@/contexts/BadgeContext';
import { hybridSyncService } from '@/services/hybridSyncService';
import { levelForXp } from '@/features/rewards/level';
import { useApp } from '@/contexts/AppContext';
/**
 * تعلّم: الدورات (حسب المسار) والتحديات في مكان واحد.
 * حالة الدورات من السيرفر (progress_get_state): الإكمال، الفتح بالتقدم، والمتطلب السابق.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, RefreshControl, View } from 'react-native';
import { PublicCourseList } from '@/features/web/PublicCourseList';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Row, Col, Segmented, Chip, ChipBar, ListSkeleton, ErrorState, useTheme, useBreakpoint, type IconName } from '@/design';
import { PROGRAMMING_FIELDS } from '@/constants';
import { ALL_COURSES, getCoursesByField, getLessonsByCourse } from '@/constants/courseData';
import { coinService, type ProgressState } from '@/services/coinService';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengesBrowser } from '@/features/learn/ChallengesBrowser';

export default function LearnScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; field?: string }>();
  const { userId } = useAuth();
  const { profile } = useApp();
  const { earnedBadgeIds } = useBadges();
  const [completedChallenges, setCompletedChallenges] = useState<number | null>(null);
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<'courses' | 'challenges'>(params.tab === 'challenges' ? 'challenges' : 'courses');
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [field, setField] = useState<string | null>(params.field ?? null);

  useEffect(() => {
    if (params.tab === 'challenges' || params.tab === 'courses') setTab(params.tab);
  }, [params.tab]);

  const load = useCallback(async () => {
    if (!userId) { setProgress(null); setCompletedChallenges(null); setLoading(false); setError(false); return; }
    try {
      const p = await coinService.getProgressState();
      setProgress(p);
      await hybridSyncService.setUser(userId);
      const ids = await hybridSyncService.fetchCompletedChallengesOnly();
      setCompletedChallenges(ids.length);
      setError(!p);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const completed = useMemo(() => new Set(progress?.completed_lessons ?? []), [progress]);

  // المسار الافتراضي: مسار آخر دورة فيها تقدم
  useEffect(() => {
    if (field || !progress) return;
    let best: { id: string; n: number } | null = null;
    for (const c of ALL_COURSES) {
      const n = getLessonsByCourse(c.id).filter((l) => completed.has(l.id)).length;
      if (n > 0 && (!best || n > best.n)) best = { id: c.fieldId, n };
    }
    setField(best?.id ?? 'python');
  }, [progress, completed, field]);

  const currentField = field ?? 'python';
  const courses = useMemo(() => [...getCoursesByField(currentField)].sort((a, b) => a.order - b.order), [currentField]);
  const fieldStats = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const c of courses) {
      const ls = getLessonsByCourse(c.id);
      total += ls.length;
      done += ls.filter((l) => completed.has(l.id)).length;
    }
    return { total, done };
  }, [courses, completed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const header = (
    <View
      style={{
        width: '100%',
        maxWidth: t.layout.maxContent + 56,
        alignSelf: 'center',
        paddingHorizontal: isDesktop ? 28 : 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 12,
      }}
    >
      <Row gap={8}>
        <Text variant="title" style={{ flex: 1 }} accessibilityRole="header">
          تعلّم
        </Text>
      </Row>
      <Segmented
        value={tab}
        onChange={(v) => {
          setTab(v);
          router.setParams({ tab: v });
        }}
        options={[
          { value: 'courses', label: 'الدورات' },
          { value: 'challenges', label: 'التحديات' },
        ]}
        style={{ maxWidth: 420, width: '100%', alignSelf: 'flex-end' }}
      />
    </View>
  );

  return (
    <Screen inTabs header={header} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.brand} />}>
      {tab === 'challenges' ? (
        <ChallengesBrowser />
      ) : (
        <Col gap={16}>
          <ChipBar>
            {PROGRAMMING_FIELDS.map((f) => (
              <Chip key={f.id} label={f.nameAr} icon={f.icon as IconName} selected={currentField === f.id} onPress={() => setField(f.id)} />
            ))}
          </ChipBar>

          <View style={{ paddingVertical: 8 }}>
            <Row justify="space-between" gap={10}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="heading">{PROGRAMMING_FIELDS.find((f) => f.id === currentField)?.nameAr}</Text>
                <Text variant="bodySm" tone="secondary">
                  {fieldStats.done} من {fieldStats.total} درس · {courses.length} دورات
                </Text>
              </View>
              <Pressable onPress={() => router.push('/certificate')} accessibilityRole="link" accessibilityLabel="شهادات المسار" hitSlop={8}>
                <Row gap={6}>
                  <Ionicons name="ribbon-outline" size={16} color={t.colors.brandText} />
                  <Text variant="label" tone="brand">
                    الشهادات
                  </Text>
                </Row>
              </Pressable>
            </Row>
          </View>

          {Platform.OS === 'web' && !userId ? <PublicCourseList courses={courses} /> : loading && !progress ? (
            <ListSkeleton rows={4} />
          ) : error && !progress ? (
            <ErrorState onRetry={load} />
          ) : (
            progress && (
              <Row align="flex-start" gap={20}>
                <View style={{ flex: 1, maxWidth: 680, minWidth: 0 }}>
                  <CourseJourney courses={courses} progress={progress} />
                </View>
                {isDesktop && (
                  <Col gap={12} style={{ width: 244 }}>
                    <Text variant="label" tone="secondary">
                      المستوى {levelForXp(Number(profile?.xp ?? 0))}
                    </Text>
                    {profile?.xp != null && completedChallenges != null && (
                      <NextBadgeGoal earnedIds={earnedBadgeIds} progress={progress} xp={Number(profile.xp)} completedChallenges={completedChallenges} />
                    )}
                  </Col>
                )}
              </Row>
            )
          )}
        </Col>
      )}
    </Screen>
  );
}
