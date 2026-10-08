/**
 * صفحة الدرس: قراءة مريحة، مثال كود، ثم «اختبر فهمك» في نفس الصفحة.
 * الإكمال يوثَّق على السيرفر؛ النتيجة تظهر داخل الصفحة (لا نافذة تحجب المتابعة) وشرارات XP تطير
 * من بطاقة النتيجة إلى عداد XP بقيمة السيرفر (xp_awarded / xp).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { ALL_LESSONS, ALL_COURSES, getLessonsByCourse } from '@/constants/courseData';
import { useCoins } from '@/contexts/CoinsContext';
import { coinService } from '@/services/coinService';
import LockedCourseScreen, { getPreviewLessonId } from '@/components/coins/LockedCourseScreen';
import { useHybridProgress } from '@/hooks/useHybridProgress';
import { ExplainWithAI } from '@/components/ai';
import LessonContent from '@/components/lesson/LessonContent';
import { Screen, AppBar, Text, Row, Col, Surface, Button, Tag, CodeView, EmptyState, useTheme, useBreakpoint, useReducedMotion } from '@/design';
import { XpMeter } from '@/features/rewards/XpMeter';
import { useRewards } from '@/features/rewards/RewardLayer';

/** خلط خيارات الاختبار مرة واحدة لكل درس */
function shuffle<T>(arr: T[]): { shuffled: T[]; indexMap: number[] } {
  const indexMap = arr.map((_, i) => i);
  for (let i = indexMap.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexMap[i], indexMap[j]] = [indexMap[j], indexMap[i]];
  }
  return { shuffled: indexMap.map((i) => arr[i]), indexMap };
}

type Outcome =
  | { kind: 'done'; xp: number; nextLessonId?: string | null }
  | { kind: 'review' }
  | { kind: 'queued' }
  | { kind: 'error'; title: string; message: string; code?: string };

export default function LessonScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { refreshProfile } = useApp();
  const { celebrate } = useRewards();
  const reduced = useReducedMotion();
  const { isDesktop } = useBreakpoint();
  const { isCourseUnlocked } = useCoins();
  const scrollRef = useRef<ScrollView>(null);
  const resultRef = useRef<View>(null);

  const lesson = ALL_LESSONS.find((l) => l.id === id) || null;
  const course = lesson ? ALL_COURSES.find((c) => c.id === lesson.courseId) : undefined;
  const courseLessons = useMemo(() => (lesson ? getLessonsByCourse(lesson.courseId).sort((a, b) => a.order - b.order) : []), [lesson?.courseId]);
  const index = courseLessons.findIndex((l) => l.id === lesson?.id);
  const nextLesson = index >= 0 ? courseLessons[index + 1] : undefined;
  const nextCourse = useMemo(() => {
    if (!course || nextLesson) return undefined;
    const field = ALL_COURSES.filter((c) => c.fieldId === course.fieldId).sort((a, b) => a.order - b.order);
    return field[field.findIndex((c) => c.id === course.id) + 1];
  }, [course?.id, nextLesson?.id]);

  const { isLessonCompleted, markLessonComplete } = useHybridProgress({ courseId: lesson?.courseId || '', userId: user?.id });
  const wasCompleted = lesson ? isLessonCompleted(lesson.id) : false;

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (user?.id && id) coinService.track('lesson_opened', { lesson_id: String(id) });
    setSelected(null);
    setChecked(false);
    setOutcome(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [user?.id, id]);

  const quiz = useMemo(() => {
    if (!lesson?.quiz) return null;
    const { shuffled, indexMap } = shuffle(lesson.quiz.options);
    return { question: lesson.quiz.question, options: shuffled, correct: indexMap.indexOf(lesson.quiz.correctAnswer), indexMap, explanation: lesson.quiz.explanation };
  }, [lesson?.id]);

  const correct = quiz ? checked && selected === quiz.correct : true;

  const complete = useCallback(async () => {
    if (!lesson || busy) return;
    setBusy(true);
    const original = quiz && selected !== null ? quiz.indexMap[selected] : null;
    const res = await markLessonComplete(lesson.id, lesson.xpReward, undefined, original);
    setBusy(false);
    if (res.success && res.alreadyCompleted) {
      setOutcome({ kind: 'review' });
    } else if (res.success) {
      const awarded = Number(res.server?.xp_awarded ?? res.xpAwarded ?? 0);
      const after = Number(res.server?.xp);
      setOutcome({ kind: 'done', xp: awarded, nextLessonId: res.server?.next_lesson_id });
      // الشرارات تنطلق بعد ظهور بطاقة النتيجة
      setTimeout(() => {
        if (awarded > 0 && Number.isFinite(after)) celebrate({ key: `lesson:${lesson.id}`, xpBefore: after - awarded, xpAfter: after, sourceRef: resultRef });
        setTimeout(() => refreshProfile(), 1800);
      }, reduced ? 0 : 280);
    } else if (res.queued) {
      setOutcome({ kind: 'queued' });
    } else {
      if (res.code === 'wrong_answer') {
        setChecked(false);
        setSelected(null);
      }
      setOutcome({ kind: 'error', title: res.code === 'previous_required' ? 'خطوة واحدة قبلها' : 'لم يُحفظ التقدم', message: res.error || 'حاول مرة أخرى.', code: res.code });
    }
  }, [lesson, busy, quiz, selected, markLessonComplete, celebrate, refreshProfile, reduced]);

  if (!lesson) {
    return (
      <Screen header={<AppBar title="الدرس" fallback={'/learn' as any} />}>
        <EmptyState icon="alert-circle-outline" title="الدرس غير موجود" body="ممكن الرابط قديم." action="الدورات" onAction={() => router.replace('/learn' as any)} />
      </Screen>
    );
  }

  // الدورات المتقدمة تُفتح بالتقدم؛ الدرس الأول معاينة مجانية
  const isPreview = course ? getPreviewLessonId(course.id) === lesson.id : false;
  if (course && course.pointsCost > 0 && course.isLocked && !isCourseUnlocked(course.id) && !isPreview) {
    return <LockedCourseScreen course={course} onBack={() => router.back()} lockedLessonTitle={lesson.title} />;
  }

  const goNext = () => {
    const nid = (outcome?.kind === 'done' && outcome.nextLessonId) || nextLesson?.id;
    if (nid) router.replace(`/lesson/${nid}` as any);
    else if (nextCourse) router.replace(`/course/${nextCourse.id}` as any);
    else router.replace(`/course/${lesson.courseId}` as any);
  };
  const nextLabel = nextLesson ? 'الدرس التالي' : nextCourse ? `الدورة التالية: ${nextCourse.title}` : 'العودة للدورة';

  const finished = outcome?.kind === 'done' || outcome?.kind === 'review';

  return (
    <Screen
      width="reading"
      scrollRef={scrollRef}
      header={
        <AppBar
          title={course?.title ?? 'الدرس'}
          subtitle={index >= 0 ? `الدرس ${index + 1} من ${courseLessons.length}` : undefined}
          fallback={`/course/${lesson.courseId}` as any}
          actions={<XpMeter />}
          border
        />
      }
    >
      <Col gap={18} style={{ paddingTop: 8 }}>
        <View style={{ gap: 8 }}>
          <Text variant="display" accessibilityRole="header">
            {lesson.title}
          </Text>
          <Row gap={6} style={{ justifyContent: 'flex-start' }} wrap>
            {!!lesson.estimatedMinutes && <Tag label={`${lesson.estimatedMinutes} دقائق`} icon="time-outline" />}
            <Tag label={`+${lesson.xpReward} XP`} tone="xp" />
            {wasCompleted && <Tag label="مكتمل" tone="success" icon="checkmark" />}
            {isPreview && course?.pointsCost ? <Tag label="معاينة مجانية" tone="brand" /> : null}
          </Row>
        </View>

        <LessonContent content={lesson.content} defaultLanguage={lesson.language} title={lesson.title} />

        {!!lesson.codeExample && <CodeView code={lesson.codeExample} language={lesson.language || 'javascript'} title={`مثال · ${lesson.language ?? ''}`} />}

        <ExplainWithAI challengeId={lesson.id} challengeTitle={lesson.title} challengeDescription={lesson.content} starterCode={lesson.codeExample} language={lesson.language || 'javascript'} contentType="lesson" />

        {/* ===== اختبر فهمك / الإكمال ===== */}
        {!finished && (
          <Surface padding={18}>
            {quiz ? (
              <Col gap={12}>
                <Text variant="label" tone="brand">
                  اختبر فهمك
                </Text>
                <Text variant="heading">{quiz.question}</Text>
                <Col gap={8} accessibilityRole="radiogroup">
                  {quiz.options.map((o, i) => {
                    const on = selected === i;
                    const showRight = checked && i === quiz.correct && on;
                    const showWrong = checked && on && i !== quiz.correct;
                    return (
                      <Pressable
                        key={i}
                        disabled={checked && correct}
                        onPress={() => {
                          setSelected(i);
                          setChecked(false);
                          if (outcome?.kind === 'error') setOutcome(null);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={o}
                        style={(s: any) => ({
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                          gap: 12,
                          minHeight: 52,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: t.radius.md,
                          borderWidth: 1.5,
                          borderColor: showRight ? t.colors.success : showWrong ? t.colors.danger : on ? t.colors.brand : t.colors.border,
                          backgroundColor: showRight ? t.colors.successSoft : showWrong ? t.colors.dangerSoft : on ? t.colors.brandSoft : s.hovered ? t.colors.surfacePressed : t.colors.surfaceSunken,
                        })}
                      >
                        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? t.colors.brand : t.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
                          {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: showWrong ? t.colors.danger : showRight ? t.colors.success : t.colors.brand }} />}
                        </View>
                        <Text variant="body" style={{ flex: 1 }}>
                          {o}
                        </Text>
                        {showRight && <Ionicons name="checkmark-circle" size={20} color={t.colors.successText} />}
                        {showWrong && <Ionicons name="close-circle" size={20} color={t.colors.dangerText} />}
                      </Pressable>
                    );
                  })}
                </Col>
                {checked && (
                  <Animated.View entering={reduced ? undefined : FadeIn.duration(180)} accessibilityLiveRegion="polite">
                    {correct ? (
                      <Surface variant="success" padding={12}>
                        <Text variant="label" tone="success">
                          صحيح!
                        </Text>
                        {!!quiz.explanation && (
                          <Text variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
                            {quiz.explanation}
                          </Text>
                        )}
                      </Surface>
                    ) : (
                      <Surface variant="danger" padding={12}>
                        <Text variant="label" tone="danger">
                          مو هذا الجواب
                        </Text>
                        <Text variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
                          راجع الفقرة المتعلقة بالسؤال وجرّب خياراً ثانياً — بدون أي خصم.
                        </Text>
                      </Surface>
                    )}
                  </Animated.View>
                )}
                {/* الإجراء يتغير حسب الحالة: تحقق ← حاول مرة أخرى ← أكمل الدرس (F17) */}
                {!checked ? (
                  <Button label="تحقق من الإجابة" onPress={() => setChecked(true)} disabled={selected === null} size="lg" full />
                ) : correct ? (
                  <Button label="أكمل الدرس" icon="checkmark" variant="success" onPress={complete} loading={busy} size="lg" full />
                ) : (
                  <Button
                    label="حاول مرة أخرى"
                    icon="refresh"
                    variant="secondary"
                    onPress={() => {
                      setSelected(null);
                      setChecked(false);
                    }}
                    size="lg"
                    full
                  />
                )}
              </Col>
            ) : (
              <Col gap={10}>
                <Text variant="heading">خلّصت القراءة؟</Text>
                <Text variant="bodySm" tone="secondary">
                  أكمل الدرس لتحفظ تقدمك وتكسب {lesson.xpReward} XP.
                </Text>
                <Button label="أكمل الدرس" icon="checkmark" variant="success" onPress={complete} loading={busy} size="lg" full />
              </Col>
            )}
            {outcome?.kind === 'error' && (
              <Surface variant="warning" padding={12} style={{ marginTop: 12 }}>
                <Text variant="label" tone="warning">
                  {outcome.title}
                </Text>
                <Text variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
                  {outcome.message}
                </Text>
              </Surface>
            )}
          </Surface>
        )}

        {outcome?.kind === 'queued' && (
          <Surface variant="warning" padding={14}>
            <Text variant="label" tone="warning">
              سنحفظ تقدمك لاحقاً
            </Text>
            <Text variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
              لا يوجد اتصال الآن. سيُرسل إكمال الدرس تلقائياً عند عودة الإنترنت.
            </Text>
            <Button label={nextLabel} onPress={goNext} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
          </Surface>
        )}

        {finished && (
          <Animated.View entering={reduced ? undefined : FadeInDown.duration(260)}>
            <Surface variant={outcome?.kind === 'done' ? 'success' : 'surface'} padding={18} accessibilityLiveRegion="polite">
              <Row gap={14} align="center">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="heading">{outcome?.kind === 'done' ? 'أحسنت! أكملت الدرس' : 'راجعت هذا الدرس'}</Text>
                  <Text variant="bodySm" tone="secondary">
                    {outcome?.kind === 'done'
                      ? nextLesson
                        ? `التالي: ${nextLesson.title}`
                        : 'هذا آخر درس في الدورة.'
                      : 'الدرس مكتمل من قبل، فلا XP إضافية.'}
                  </Text>
                </View>
                {outcome?.kind === 'done' && outcome.xp > 0 && (
                  <View ref={resultRef} collapsable={false} style={{ paddingHorizontal: 12, height: 40, borderRadius: 12, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text variant="heading" weight="bold" tone="xp" ltr>
                      +{outcome.xp} XP
                    </Text>
                  </View>
                )}
              </Row>
              <Row gap={8} style={{ marginTop: 14 }} wrap>
                <Button label={nextLabel} icon="arrow-back" iconPosition="end" onPress={goNext} size="lg" />
                <Button label="الدورة" variant="ghost" onPress={() => router.replace(`/course/${lesson.courseId}` as any)} />
              </Row>
            </Surface>
          </Animated.View>
        )}
        {isDesktop && <View style={{ height: 24 }} />}
      </Col>
    </Screen>
  );
}
