/**
 * صفحة الدورة: رأس مختصر بالتقدم، زر «تابع»، الدروس كخط زمني مقسّم بالأقسام، وشهادة المسار.
 * التقدم من السيرفر (useHybridProgress)، والقفل بالتسلسل كما هو.
 */
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ALL_COURSES, getLessonsByCourse } from '@/constants/courseData';
import { useAuth } from '@/contexts/AuthContext';
import { useHybridProgress, useCourseUnlock } from '@/hooks/useHybridProgress';
import { useCoins } from '@/contexts/CoinsContext';
import { useCertificate } from '@/hooks/useCertificate';
import { showToast } from '@/components/ui/Toast';
import LockedCourseScreen from '@/components/coins/LockedCourseScreen';
import CertificateProgressCard from '@/components/certificate/CertificateProgressCard';
import { Screen, AppBar, Text, Row, Col, Surface, Button, ProgressBar, Tag, SectionHeader, EmptyState, ListSkeleton, useTheme, useBreakpoint } from '@/design';
import { XpMeter } from '@/features/rewards/XpMeter';

const DIFF = { beginner: { label: 'مبتدئ', tone: 'success' as const }, intermediate: { label: 'متوسط', tone: 'warning' as const }, advanced: { label: 'متقدم', tone: 'danger' as const } };

export default function CourseDetailScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isDesktop, hasSidebar } = useBreakpoint();
  const course = ALL_COURSES.find((c) => c.id === id);
  const lessons = useMemo(() => (course ? getLessonsByCourse(course.id).sort((a, b) => a.order - b.order) : []), [course?.id]);

  const { completedLessons: completedIds, progressPercent, isLoading: progressLoading, refresh } = useHybridProgress({ courseId: id || '', userId: user?.id });
  const { isUnlocked, isLoading: unlockLoading } = useCourseUnlock(id || '', user?.id, course?.pointsCost || 0);
  const { isCourseUnlocked: alreadyUnlocked, rewardCourseCompletion } = useCoins();
  const certificate = useCertificate({
    fieldId: course?.fieldId || '',
    fieldName: course?.fieldName || course?.fieldId || '',
    fieldNameAr: course?.fieldNameAr || course?.title || '',
    userId: user?.id,
    isProgressLoading: progressLoading,
  });

  const isCourseLocked = !!course && course.pointsCost > 0 && course.isLocked && !isUnlocked && !alreadyUnlocked(course.id);

  // مكافأة إكمال الدورة بالكوينات (السيرفر يتحقق من الإكمال ويمنع التكرار)
  useEffect(() => {
    if (!course || !user?.id || isCourseLocked || progressPercent < 100) return;
    rewardCourseCompletion(course.id).then((res) => {
      if (res.success && !res.duplicate && res.reward) showToast.success(`أكملت الدورة! +${res.reward} كوين`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, user?.id, isCourseLocked, progressPercent]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // قفل بالتسلسل — لا يُقفل درس أكمله المستخدم أو يقع قبل أبعد درس وصل إليه
  const furthest = useMemo(() => lessons.reduce((max, l, i) => (completedIds.includes(l.id) ? i : max), -1), [lessons, completedIds]);
  const isLocked = (i: number) => i > 0 && i > furthest && !completedIds.includes(lessons[i].id) && !completedIds.includes(lessons[i - 1].id);
  const nextIndex = lessons.findIndex((l, i) => !completedIds.includes(l.id) && !isLocked(i));
  const done = lessons.filter((l) => completedIds.includes(l.id)).length;

  if (!course) {
    return (
      <Screen header={<AppBar title="الدورة" fallback={'/learn' as any} />}>
        <EmptyState icon="alert-circle-outline" title="الدورة غير موجودة" body="ممكن الرابط قديم." action="كل الدورات" onAction={() => router.replace('/learn' as any)} />
      </Screen>
    );
  }
  if (isCourseLocked && !unlockLoading) return <LockedCourseScreen course={course} onBack={() => router.back()} />;

  const d = DIFF[course.difficulty];
  const next = nextIndex >= 0 ? lessons[nextIndex] : null;

  const summary = (
    <Surface padding={18}>
      <Row gap={6} style={{ justifyContent: 'flex-start' }} wrap>
        <Tag label={d.label} tone={d.tone} />
        <Tag label={`${lessons.length} درس`} />
        <Tag label={`${course.totalXP} XP`} tone="xp" />
      </Row>
      <Text variant="body" tone="secondary" style={{ marginTop: 10 }}>
        {course.description}
      </Text>
      <View style={{ marginTop: 14, gap: 6 }}>
        <Row justify="space-between">
          <Text variant="label">تقدمك</Text>
          <Text variant="caption" tone="muted" tabular>
            {done} من {lessons.length} درس
          </Text>
        </Row>
        <ProgressBar value={done / Math.max(1, lessons.length)} tone={done === lessons.length ? 'success' : 'brand'} label="تقدم الدورة" />
      </View>
      {next ? (
        <Button label={done > 0 ? `تابع: ${next.title}` : `ابدأ: ${next.title}`} icon="play" size="lg" onPress={() => router.push(`/lesson/${next.id}` as any)} style={{ marginTop: 16 }} full />
      ) : done === lessons.length && lessons.length > 0 ? (
        <Surface variant="success" padding={12} style={{ marginTop: 14 }}>
          <Text variant="label" tone="success">
            أكملت هذه الدورة. راجع أي درس متى ما تحب.
          </Text>
        </Surface>
      ) : null}
    </Surface>
  );

  const list = (
    <View>
      <SectionHeader title="الدروس" />
      {progressLoading && completedIds.length === 0 ? (
        <ListSkeleton rows={4} />
      ) : (
        <View style={{ borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, overflow: 'hidden' }}>
          {lessons.map((l, i) => {
            const completed = completedIds.includes(l.id);
            const locked = isLocked(i);
            const current = i === nextIndex;
            const section = l.section && l.section !== lessons[i - 1]?.section ? l.section : null;
            return (
              <View key={l.id}>
                {section && (
                  <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, backgroundColor: t.colors.surfaceSunken, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
                    <Text variant="caption" weight="semibold" tone="secondary">
                      {section}
                    </Text>
                  </View>
                )}
                <Pressable
                  disabled={locked}
                  onPress={() => router.push(`/lesson/${l.id}` as any)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: locked }}
                  accessibilityLabel={`${i + 1}. ${l.title}${completed ? '، مكتمل' : locked ? '، مقفل حتى تكمل الدرس السابق' : current ? '، الدرس الحالي' : ''}`}
                  style={(s: any) => ({ backgroundColor: current ? t.colors.brandSoft : !locked && (s.hovered || s.pressed) ? t.colors.surfacePressed : 'transparent' })}
                >
                  <Row gap={12} style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: section || i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completed ? t.colors.successSoft : current ? t.colors.brand : t.colors.surfaceSunken,
                      }}
                    >
                      {completed ? (
                        <Ionicons name="checkmark" size={15} color={t.colors.successText} />
                      ) : locked ? (
                        <Ionicons name="lock-closed" size={12} color={t.colors.textMuted} />
                      ) : (
                        <Text variant="caption" weight="bold" align="center" ltr style={{ color: current ? '#fff' : t.colors.textSecondary }}>
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight={current ? 'semibold' : 'regular'} numberOfLines={2} tone={locked ? 'muted' : 'default'}>
                        {l.title}
                      </Text>
                      {current && (
                        <Text variant="caption" tone="brand">
                          {done > 0 ? 'التالي' : 'ابدأ هنا'}
                        </Text>
                      )}
                    </View>
                    <Text variant="caption" tone={completed ? 'muted' : 'xp'} ltr tabular>
                      {l.xpReward} XP
                    </Text>
                  </Row>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const cert = (
    <CertificateProgressCard
      fieldId={course.fieldId}
      fieldName={course.fieldName || course.fieldId}
      fieldNameAr={course.fieldNameAr || course.title}
      currentCertificate={certificate.currentCertificate}
      silverEligibility={certificate.silverEligibility}
      goldEligibility={certificate.goldEligibility}
      platinumEligibility={certificate.platinumEligibility}
      canClaim={certificate.canClaim}
      claimableLevel={certificate.claimableLevel}
      isLoading={certificate.isLoading}
      isIssuing={certificate.isIssuing}
      onIssueCertificate={certificate.issueCertificate}
    />
  );

  return (
    <Screen header={<AppBar title={course.title} subtitle={course.fieldNameAr} fallback={'/learn' as any} actions={!hasSidebar ? <XpMeter /> : undefined} />}>
      {isDesktop ? (
        <Row align="flex-start" gap={24}>
          <Col gap={20} flex={1}>
            {list}
          </Col>
          <Col gap={20} style={{ width: 360 }}>
            {summary}
            {cert}
          </Col>
        </Row>
      ) : (
        <Col gap={20}>
          {summary}
          {list}
          {cert}
        </Col>
      )}
    </Screen>
  );
}
