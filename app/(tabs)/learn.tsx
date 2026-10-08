/**
 * تعلّم: الدورات (حسب المسار) والتحديات في مكان واحد.
 * حالة الدورات من السيرفر (progress_get_state): الإكمال، الفتح بالتقدم، والمتطلب السابق.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Row, Col, Segmented, Chip, ChipBar, ProgressBar, Tag, Surface, ListSkeleton, ErrorState, useTheme, useBreakpoint, type IconName } from '@/design';
import { PROGRAMMING_FIELDS } from '@/constants';
import { ALL_COURSES, getCoursesByField, getLessonsByCourse, type Course } from '@/constants/courseData';
import { coinService, type ProgressState } from '@/services/coinService';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengesBrowser } from '@/features/learn/ChallengesBrowser';
import { XpMeter } from '@/features/rewards/XpMeter';

const DIFF: Record<Course['difficulty'], { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  beginner: { label: 'مبتدئ', tone: 'success' },
  intermediate: { label: 'متوسط', tone: 'warning' },
  advanced: { label: 'متقدم', tone: 'danger' },
};

export default function LearnScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; field?: string }>();
  const { userId } = useAuth();
  const { hasSidebar, isDesktop } = useBreakpoint();
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
    if (!userId) return;
    try {
      const p = await coinService.getProgressState();
      setProgress(p);
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
  const access = useMemo(() => new Map((progress?.courses ?? []).map((c) => [c.course_id, c])), [progress]);

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
    <View style={{ width: '100%', maxWidth: t.layout.maxContent + 56, alignSelf: 'center', paddingHorizontal: isDesktop ? 28 : 16, paddingTop: 8, paddingBottom: 12, gap: 12 }}>
      <Row gap={8}>
        <Text variant="title" style={{ flex: 1 }} accessibilityRole="header">
          تعلّم
        </Text>
        {!hasSidebar && <XpMeter />}
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
        style={{ maxWidth: 420 }}
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

          <Surface padding={14}>
            <Row justify="space-between" gap={10}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{PROGRAMMING_FIELDS.find((f) => f.id === currentField)?.nameAr}</Text>
                <Text variant="caption" tone="muted">
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
            <ProgressBar value={fieldStats.done / Math.max(1, fieldStats.total)} style={{ marginTop: 10 }} label="تقدم المسار" />
          </Surface>

          {loading && !progress ? (
            <ListSkeleton rows={4} />
          ) : error && !progress ? (
            <ErrorState onRetry={load} />
          ) : (
            <View style={{ gap: 0 }}>
              {courses.map((c, i) => (
                <CourseRow key={c.id} course={c} index={i} last={i === courses.length - 1} completed={completed} access={access.get(c.id)} />
              ))}
            </View>
          )}
        </Col>
      )}
    </Screen>
  );
}

function CourseRow({ course, index, last, completed, access }: { course: Course; index: number; last: boolean; completed: Set<string>; access?: ProgressState['courses'][number] }) {
  const t = useTheme();
  const router = useRouter();
  const lessons = getLessonsByCourse(course.id);
  const done = lessons.filter((l) => completed.has(l.id)).length;
  const total = lessons.length;
  const finished = total > 0 && done >= total;
  const locked = access ? !access.accessible : false;
  const req = access?.requires_course_id ? ALL_COURSES.find((c) => c.id === access.requires_course_id) : undefined;
  const reqPct = access?.required_ratio != null ? Math.round(Number(access.required_ratio) * 100) : 70;
  const prereqPct = access?.prereq_progress != null ? Math.round(Number(access.prereq_progress) * 100) : null;
  const d = DIFF[course.difficulty];
  const state = finished ? 'done' : locked ? 'locked' : done > 0 ? 'current' : 'open';
  const node = { done: t.colors.success, current: t.colors.brand, open: t.colors.borderStrong, locked: t.colors.border }[state];
  return (
    <Row align="stretch" gap={12}>
      {/* خط زمني */}
      <View style={{ width: 28, alignItems: 'center' }}>
        <View style={{ width: 2, height: 18, backgroundColor: index === 0 ? 'transparent' : t.colors.border }} />
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: node, backgroundColor: state === 'done' ? t.colors.successSoft : state === 'current' ? t.colors.brandSoft : t.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
          {state === 'done' ? (
            <Ionicons name="checkmark" size={15} color={t.colors.successText} />
          ) : state === 'locked' ? (
            <Ionicons name="lock-closed" size={12} color={t.colors.textMuted} />
          ) : (
            <Text variant="caption" weight="bold" align="center" ltr style={{ color: state === 'current' ? t.colors.brandText : t.colors.textMuted }}>
              {index + 1}
            </Text>
          )}
        </View>
        <View style={{ width: 2, flex: 1, backgroundColor: last ? 'transparent' : t.colors.border }} />
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : 12, paddingTop: 6 }}>
        <Surface onPress={() => router.push(`/course/${course.id}` as any)} accessibilityLabel={`${course.title}، ${done} من ${total} درس${locked ? '، مقفلة' : ''}`} padding={14}>
          <Row justify="space-between" align="flex-start" gap={10}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading" numberOfLines={2} tone={locked ? 'secondary' : 'default'}>
                {course.title}
              </Text>
              <Text variant="bodySm" tone="muted" numberOfLines={2}>
                {course.description}
              </Text>
            </View>
            <Tag label={d.label} tone={d.tone} />
          </Row>
          {locked ? (
            <Row gap={6} style={{ marginTop: 10, justifyContent: 'flex-start' }}>
              <Ionicons name="lock-closed-outline" size={14} color={t.colors.warningText} />
              <Text variant="caption" tone="warning" style={{ flexShrink: 1 }}>
                {req ? `تُفتح عند إكمال ${reqPct}% من «${req.title}»${prereqPct != null ? ` (أنت عند ${prereqPct}%)` : ''}` : 'مقفلة حالياً'}
              </Text>
            </Row>
          ) : (
            <View style={{ marginTop: 10, gap: 6 }}>
              {done > 0 && <ProgressBar value={done / Math.max(1, total)} tone={finished ? 'success' : 'brand'} height={4} />}
              <Row justify="space-between">
                <Text variant="caption" tone="muted" tabular>
                  {finished ? 'مكتملة' : `${done} من ${total} درس`}
                </Text>
                <Text variant="caption" tone="xp" ltr tabular>
                  {course.totalXP} XP
                </Text>
              </Row>
            </View>
          )}
        </Surface>
      </View>
    </Row>
  );
}
