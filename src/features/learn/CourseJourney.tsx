import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ALL_COURSES, getLessonsByCourse, type Course } from '@/constants/courseData';
import type { ProgressState } from '@/services/coinService';
import { Button, Col, Row, Text, useTheme } from '@/design';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export function CourseJourney({ courses, progress }: { courses: Course[]; progress: ProgressState }) {
  const t = useTheme();
  const router = useRouter();
  const completed = new Set(progress.completed_lessons);
  const access = new Map(progress.courses.map((c) => [c.course_id, c]));
  const current = courses.find((c) => access.get(c.id)?.accessible && getLessonsByCourse(c.id).some((l) => !completed.has(l.id)));
  return (
    <Col gap={0}>
      {courses.map((course, index) => {
        const lessons = [...getLessonsByCourse(course.id)].sort((a, b) => a.order - b.order);
        const done = lessons.filter((l) => completed.has(l.id)).length;
        const finished = lessons.length > 0 && done === lessons.length;
        const a = access.get(course.id);
        const locked = !a?.accessible;
        const isCurrent = current?.id === course.id;
        const nextIndex = lessons.findIndex((l) => !completed.has(l.id));
        const next = isCurrent ? lessons[nextIndex] : undefined;
        const req = ALL_COURSES.find((c) => c.id === a?.requires_course_id);
        const requirement =
          req && a?.required_ratio != null ? `أكمل ${Math.round(Number(a.required_ratio) * 100)}% من «${req.title}»` : 'افتح الدورة للاطلاع على شروط الوصول';
        return (
          <Row key={course.id} align="stretch" gap={16}>
            <Col align="center" style={{ width: 48 }}>
              <JourneyNode state={finished ? 'completed' : locked ? 'locked' : isCurrent ? 'current' : 'upcoming'} number={index + 1} size={48} />
              {index < courses.length - 1 && <View style={{ flex: 1, width: 2, minHeight: 12, backgroundColor: t.colors.borderStrong, marginVertical: 6 }} />}
            </Col>
            <Col flex={1} gap={8} style={{ paddingBottom: index < courses.length - 1 ? 16 : 0, minWidth: 0 }}>
              <Row gap={8} wrap style={{ justifyContent: 'flex-start' }}>
                <Text variant="heading" style={{ flexShrink: 1 }}>
                  {course.title}
                </Text>
                <Text variant="bodySm" tone={finished ? 'xp' : isCurrent ? 'brand' : 'secondary'}>
                  {finished ? 'مكتملة' : isCurrent ? 'مرحلتك الحالية' : locked ? 'مقفلة' : 'قادمة'}
                </Text>
              </Row>
              <Text variant="bodySm" tone="secondary" style={t.mode === 'light' ? { fontSize: 15, lineHeight: 24 } : undefined} numberOfLines={locked ? undefined : 2}>
                {locked ? requirement : `${done} من ${lessons.length} درس · ${course.description}`}
              </Text>
              {locked && a?.prereq_progress != null && (
                <Text variant="caption" tone="secondary">
                  تقدمك في المتطلب: {Math.round(Number(a.prereq_progress) * 100)}%
                </Text>
              )}
              {next && (
                <Col gap={8} style={{ marginTop: 2, maxWidth: 470, width: '100%', alignSelf: 'flex-end' }} testID="journey-next-lesson">
                  {nextIndex > 0 && (
                    <Row gap={10}>
                      <JourneyNode state="completed" size={30} />
                      <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                        {lessons[nextIndex - 1].title} · مكتمل
                      </Text>
                    </Row>
                  )}
                  <View style={{ borderWidth: 1, borderColor: t.mode === 'light' ? '#C8B5E8' : t.colors.brand, backgroundColor: t.colors.brandSoft, borderRadius: 12, padding: 14 }}>
                    <Row gap={10} align="flex-start">
                      <JourneyNode state="current" number={nextIndex + 1} size={36} />
                      <Col flex={1} gap={4}>
                        <Text variant="bodySm" tone="brand">
                          خطوتك التالية
                        </Text>
                        <Text variant="heading">{next.title}</Text>
                        <Row gap={10} wrap>
                          {next.estimatedMinutes != null && (
                            <Text variant="caption" tone="secondary">
                              {next.estimatedMinutes} دقائق
                            </Text>
                          )}
                          <Text variant="caption" tone="xp" ltr>
                            +{next.xpReward} XP
                          </Text>
                        </Row>
                        <Button
                          full
                          label={done ? 'كمّل الدرس' : 'ابدأ الدرس'}
                          icon="play-outline"
                          onPress={() => router.push(`/lesson/${next.id}` as any)}
                          style={{ marginTop: 6 }}
                        />
                      </Col>
                    </Row>
                  </View>
                  {lessons[nextIndex + 1] && (
                    <Row gap={10}>
                      <JourneyNode state="upcoming" number={nextIndex + 2} size={30} />
                      <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                        {lessons[nextIndex + 1].title} · بعده
                      </Text>
                    </Row>
                  )}
                </Col>
              )}
              <Button
                label={finished ? 'راجع الدروس' : locked ? 'شروط فتح الدورة' : 'كل دروس الدورة'}
                variant="ghost"
                size="sm"
                onPress={() => router.push(`/course/${course.id}` as any)}
                style={{ alignSelf: 'flex-end' }}
              />
            </Col>
          </Row>
        );
      })}
    </Col>
  );
}
