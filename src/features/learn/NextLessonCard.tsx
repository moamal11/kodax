import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLessonsByCourse, type Course } from '@/constants/courseData';
import type { ProgressState } from '@/services/coinService';
import { Surface, Col, Row, Text, Tag, Button, useTheme } from '@/design';

export function NextLessonCard({ courses, progress }: { courses: Course[]; progress: ProgressState }) {
  const t = useTheme();
  const router = useRouter();
  const complete = new Set(progress.completed_lessons);
  const access = new Map(progress.courses.map((c) => [c.course_id, c.accessible]));
  if (!courses.length) return null;
  const unfinished = courses.filter((c) => getLessonsByCourse(c.id).some((l) => !complete.has(l.id)));
  const course = unfinished.find((c) => access.get(c.id) === true) ?? unfinished[0];
  if (!course)
    return (
      <Surface variant="success" padding={18}>
        <Col gap={10}>
          <Text variant="heading">أكملت دروس هذا المسار</Text>
          <Button label="التحديات" variant="secondary" onPress={() => router.push('/learn?tab=challenges')} />
        </Col>
      </Surface>
    );
  const lessons = [...getLessonsByCourse(course.id)].sort((a, b) => a.order - b.order);
  const index = lessons.findIndex((l) => !complete.has(l.id));
  const next = lessons[index];
  const locked = access.get(course.id) !== true;
  return (
    <Surface variant={locked ? 'surface' : 'brand'} padding={18}>
      <Col gap={12}>
        <Row justify="space-between" gap={8} wrap>
          <Text variant="label" tone="secondary">
            {locked ? 'الدورة القادمة' : 'الدرس التالي'} · {course.title}
          </Text>
          {!locked && <Tag label={`+${next.xpReward} XP`} tone="xp" />}
        </Row>
        <Text variant="title">{next.title}</Text>
        <Text variant="bodySm" tone="secondary">
          {locked ? 'افتح الدورة لمعرفة متطلب التقدم.' : next.description}
        </Text>
        {!locked && (
          <Col gap={6}>
            {lessons.slice(Math.max(0, index - 1), index + 2).map((l) => (
              <Row key={l.id} gap={8}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: complete.has(l.id) ? t.colors.successSoft : l.id === next.id ? t.colors.brandStrong : t.colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {complete.has(l.id) ? (
                    <Ionicons name="checkmark" size={15} color={t.colors.successText} />
                  ) : (
                    <Text variant="caption" ltr align="center" style={{ color: l.id === next.id ? t.colors.textOnAccent : t.colors.textMuted }}>
                      {lessons.indexOf(l) + 1}
                    </Text>
                  )}
                </View>
                <Text variant="bodySm" tone={l.id === next.id ? 'default' : 'secondary'} style={{ flex: 1 }}>
                  {l.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {complete.has(l.id) ? 'مكتمل' : l.id === next.id ? 'التالي' : 'بعده'}
                </Text>
              </Row>
            ))}
          </Col>
        )}
        <Button
          label={locked ? 'متطلبات الدورة' : progress.completed_lessons.length ? 'كمّل الدرس' : 'ابدأ الدرس'}
          icon={locked ? 'lock-closed-outline' : 'play'}
          full
          variant={locked ? 'secondary' : 'primary'}
          onPress={() => router.push((locked ? `/course/${course.id}` : `/lesson/${next.id}`) as any)}
        />
      </Col>
    </Surface>
  );
}
