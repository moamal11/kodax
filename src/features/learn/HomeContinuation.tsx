import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { getLessonsByCourse } from '@/constants/courseData';
import type { LearningSnapshot } from './useLearningSnapshot';
import { Button, CodeView, Col, Row, Surface, Text, useBreakpoint, useTheme } from '@/design';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export function HomeContinuation({ data }: { data: LearningSnapshot }) {
  const t = useTheme();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const n = data.next;
  if (!n)
    return (
      <Surface padding={20}>
        <Row gap={14}>
          <JourneyNode state="completed" size={48} />
          <Col flex={1} gap={10}>
            <Text variant="heading">أكملت دروس هذا المسار</Text>
            <Button label="اختر مساراً" onPress={() => router.push('/learn')} />
          </Col>
        </Row>
      </Surface>
    );
  const lessons = [...getLessonsByCourse(n.course.id)].sort((a, b) => a.order - b.order);
  const index = lessons.findIndex((l) => l.id === n.lesson.id);
  const neighbours = [lessons[index - 1], lessons[index + 1]].filter(Boolean);
  return (
    <Surface padding={20}>
      <Row gap={20} align="flex-start">
        <Col flex={1} gap={16} style={{ minWidth: 0 }}>
          <Row gap={12} align="flex-start">
            <JourneyNode state={n.locked ? 'locked' : 'current'} number={index + 1} size={48} />
            <Col flex={1} gap={4}>
              <Text variant="caption" tone="brand">
                {n.done ? 'تابع من حيث توقفت' : 'ابدأ من هنا'} · {n.course.title}
              </Text>
              <Text variant="title">{n.lesson.title}</Text>
            </Col>
          </Row>
          <Text variant="bodySm" tone="secondary">
            {n.lesson.description}
          </Text>
          <Col gap={8}>
            {neighbours.map((l) => (
              <Row key={l.id} gap={8}>
                <JourneyNode state={data.completed.has(l.id) ? 'completed' : 'upcoming'} number={lessons.indexOf(l) + 1} size={28} />
                <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                  {l.title} · {data.completed.has(l.id) ? 'مكتمل' : 'بعده'}
                </Text>
              </Row>
            ))}
          </Col>
          <Row gap={8} wrap>
            <Button
              label={n.locked ? 'افتح الدورة' : n.done ? 'كمّل الدرس' : 'ابدأ الدرس'}
              icon={n.locked ? 'lock-closed-outline' : 'play'}
              onPress={() => router.push((n.locked ? `/course/${n.course.id}` : `/lesson/${n.lesson.id}`) as any)}
              style={{ minWidth: 160, flexGrow: isDesktop ? 0 : 1, maxWidth: isDesktop ? 220 : undefined }}
            />
            <Button label="الدورة" variant="ghost" style={{ minWidth: 100 }} onPress={() => router.push(`/course/${n.course.id}` as any)} />
          </Row>
        </Col>
        {isDesktop && n.lesson.codeExample && (
          <Col gap={8} style={{ width: 210, paddingTop: 4 }}>
            <Text variant="caption" tone="secondary">
              من كود الدرس
            </Text>
            <CodeView code={n.lesson.codeExample} language={n.lesson.language ?? 'python'} maxLines={7} size="sm" lineNumbers={false} />
            <Text variant="caption" tone="secondary">
              الدرس {index + 1} من {n.total}
            </Text>
          </Col>
        )}
      </Row>
    </Surface>
  );
}
