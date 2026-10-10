import { JourneyNode } from '@/features/rewards/JourneyVisuals';
/**
 * الدورة التي لم تُفتح بعد — تُستخدم في صفحة الدورة وصفحة الدرس.
 *
 * التعلم مجاني: الدورة تُفتح تلقائياً عند التقدم في الدورة السابقة من نفس المسار
 * (السيرفر يحسب ذلك). الدرس الأول متاح كمعاينة. الكوينات = فتح مبكر اختياري فقط.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ALL_COURSES, Course, FULL_FIELD_DISCOUNT, getFieldRemainingPrice, getLessonsByCourse, getLockedPaidCourses } from '@/constants/courseData';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage, coinService, type CourseAccess } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Surface, Button, ProgressBar, Tag, SectionHeader, useTheme } from '@/design';
import UnlockWithCoinsModal from './UnlockWithCoinsModal';

const DIFFICULTY_LABEL: Record<Course['difficulty'], string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

interface LockedCourseScreenProps {
  course: Course;
  onBack: () => void;
  /** يظهر عندما يحاول المستخدم فتح درس مقفل مباشرة */
  lockedLessonTitle?: string;
}

/** معرّف درس المعاينة المجانية (أول درس في الدورة) */
export function getPreviewLessonId(courseId: string): string | undefined {
  const lessons = getLessonsByCourse(courseId);
  if (lessons.length === 0) return undefined;
  return [...lessons].sort((a, b) => a.order - b.order)[0].id;
}

export default function LockedCourseScreen({ course, lockedLessonTitle }: LockedCourseScreenProps) {
  const t = useTheme();
  const router = useRouter();
  const { balance, unlockedCourses, getCourseCost, unlockField } = useCoins();
  const [showUnlock, setShowUnlock] = useState(false);
  const [bundleBusy, setBundleBusy] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [access, setAccess] = useState<CourseAccess | null>(null);

  useEffect(() => {
    let alive = true;
    coinService.getProgressState().then((s) => {
      if (alive) setAccess(s?.courses.find((c) => c.course_id === course.id) ?? null);
    });
    return () => {
      alive = false;
    };
  }, [course.id]);

  const prereq = useMemo(() => ALL_COURSES.find((c) => c.id === access?.requires_course_id) ?? null, [access?.requires_course_id]);
  const requiredPct = access?.required_ratio != null ? Math.round(access.required_ratio * 100) : null;
  const prereqPct = Math.min(100, Math.round((access?.prereq_progress ?? 0) * 100));
  const lessons = useMemo(() => [...getLessonsByCourse(course.id)].sort((a, b) => a.order - b.order), [course.id]);
  const previewId = lessons[0]?.id;
  const cost = getCourseCost(course.id, course.pointsCost);
  const lockedInField = useMemo(() => getLockedPaidCourses(course.fieldId, unlockedCourses), [course.fieldId, unlockedCourses]);
  const fieldPricing = useMemo(() => getFieldRemainingPrice(course.fieldId, unlockedCourses), [course.fieldId, unlockedCourses]);
  const showBundle = lockedInField.length > 1 && fieldPricing.remaining > cost;
  const bundleNeeded = Math.max(0, fieldPricing.discountedRemaining - balance);

  const handleBundle = async () => {
    setBundleBusy(true);
    setBundleError(null);
    const res = await unlockField(course.fieldId);
    setBundleBusy(false);
    if (res.success) showToast.success('تم فتح كل دورات المسار');
    else setBundleError(coinMessage(res.code, res));
  };

  return (
    <Screen width="reading" header={<AppBar title={course.title} subtitle="الخطوة التالية في المسار" fallback={'/learn' as any} />}>
      <Col gap={16}>
        <View style={{ gap: 6 }}>
          <Row gap={6} style={{ justifyContent: 'flex-start' }} wrap>
            <Tag label={DIFFICULTY_LABEL[course.difficulty]} />
            <Tag label={`${lessons.length} درس`} />
            <Tag label={`${course.totalXP} XP`} tone="xp" />
          </Row>
          <Text variant="body" tone="secondary">
            {course.description}
          </Text>
        </View>

        {lockedLessonTitle && (
          <Surface variant="warning" padding={14}>
            <Text variant="bodySm">«{lockedLessonTitle}» جزء من هذه الدورة، وتُفتح عند وصولك لها في المسار.</Text>
          </Surface>
        )}

        {/* الطريق المجاني: التقدم في الدورة السابقة */}
        {prereq && requiredPct != null && (
          <Surface padding={16}>
            <Row gap={10} align="flex-start">
              <JourneyNode state="locked" size={44} />
              <View style={{ flex: 1, gap: 8 }}>
                <Text variant="heading">تُفتح مجاناً بالتعلم</Text>
                <Text variant="bodySm" tone="secondary">
                  أكمل {requiredPct}% من «{prereq.title}» وتُفتح هذه الدورة تلقائياً.
                </Text>
                <ProgressBar value={prereqPct / 100} tone="success" label={`تقدمك في ${prereq.title}`} />
                <Text variant="caption" tone="muted">
                  أنت عند {prereqPct}% من {requiredPct}%
                </Text>
                <Button
                  label={`تابع «${prereq.title}»`}
                  variant="success"
                  icon="play"
                  onPress={() => router.push(`/course/${prereq.id}` as any)}
                  style={{ alignSelf: 'flex-start' }}
                />
              </View>
            </Row>
          </Surface>
        )}

        {/* اختصار اختياري بالكوينات */}
        <Surface padding={16}>
          <Row gap={10} align="flex-start">
            <Ionicons name="flash-outline" size={20} color={t.colors.coin} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="heading">فتح مبكر بالكوينات (اختياري)</Text>
              <Text variant="bodySm" tone="secondary">
                {cost.toLocaleString('en-US')} كوين · رصيدك {balance.toLocaleString('en-US')}
                {balance < cost ? ` · ينقصك ${(cost - balance).toLocaleString('en-US')}` : ''}
              </Text>
              <Button label="افتح الآن" variant="secondary" onPress={() => setShowUnlock(true)} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            </View>
          </Row>
        </Surface>

        {showBundle && (
          <Surface padding={16}>
            <Text variant="heading">
              كل دورات المسار ({lockedInField.length}) — وفّر {Math.round(FULL_FIELD_DISCOUNT * 100)}%
            </Text>
            <Text variant="bodySm" tone="secondary" style={{ marginTop: 4 }}>
              {fieldPricing.discountedRemaining.toLocaleString('en-US')} كوين بدل {fieldPricing.remaining.toLocaleString('en-US')}
            </Text>
            {!!bundleError && (
              <Text variant="caption" tone="danger" style={{ marginTop: 6 }}>
                {bundleError}
              </Text>
            )}
            {bundleNeeded > 0 ? (
              <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
                رصيدك لا يكفي للفتح المبكر — التعلم يفتح الدورات مجاناً.
              </Text>
            ) : (
              <Button label="افتح المسار كاملاً" onPress={handleBundle} loading={bundleBusy} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
            )}
          </Surface>
        )}

        <View>
          <SectionHeader title="محتوى الدورة" subtitle="الدرس الأول متاح كمعاينة مجانية" />
          <View style={{ borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden', backgroundColor: t.colors.surface }}>
            {lessons.map((l, i) => {
              const preview = l.id === previewId;
              return (
                <Pressable
                  key={l.id}
                  disabled={!preview}
                  onPress={() => router.push(`/lesson/${l.id}` as any)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !preview }}
                  accessibilityLabel={`${i + 1}. ${l.title}${preview ? '، معاينة مجانية' : '، مقفل'}`}
                  style={(s: any) => ({ backgroundColor: preview && (s.hovered || s.pressed) ? t.colors.surfacePressed : 'transparent' })}
                >
                  <Row
                    gap={12}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: i === lessons.length - 1 ? 0 : 1,
                      borderBottomColor: t.colors.border,
                    }}
                  >
                    <Text variant="caption" tone="muted" tabular style={{ width: 22 }} align="center">
                      {i + 1}
                    </Text>
                    <Text variant="body" numberOfLines={1} style={{ flex: 1 }} tone={preview ? 'default' : 'muted'}>
                      {l.title}
                    </Text>
                    {preview ? <Tag label="معاينة مجانية" tone="success" /> : <Ionicons name="lock-closed-outline" size={15} color={t.colors.textMuted} />}
                  </Row>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Text variant="caption" tone="muted" align="center">
          التعلم في Kodax مجاني بالكامل. الكوينات اختصار اختياري فقط.
        </Text>
      </Col>
      <UnlockWithCoinsModal visible={showUnlock} onClose={() => setShowUnlock(false)} courseId={course.id} courseName={course.title} cost={course.pointsCost} />
    </Screen>
  );
}
