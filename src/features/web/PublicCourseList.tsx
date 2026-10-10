import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ALL_COURSES, getLessonsByCourse, type Course } from '@/constants/courseData';
import { PROGRAMMING_FIELDS } from '@/constants';
import { Button, Col, Row, Text, Surface, Screen, AppBar, useBreakpoint } from '@/design';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export function PublicCourseList({ courses }: { courses: Course[] }) {
  return <Col gap={0}>{courses.map((course, i) => <Row key={course.id} gap={16} align="flex-start" style={{ paddingBottom: 24 }}>
    <JourneyNode state={i === 0 ? 'current' : 'upcoming'} number={course.order} size={40} />
    <Col flex={1} gap={8}><Text variant="heading" accessibilityRole="header">{course.title}</Text><Text variant="bodySm" tone="secondary">{course.description}</Text>
      <Text variant="bodySm" tone="secondary">{getLessonsByCourse(course.id).length} درس</Text>
      <Button label="دروس الدورة" variant="ghost" size="sm" onPress={() => router.push(`/course/${course.id}` as any)} style={{ alignSelf: 'flex-end' }} />
    </Col></Row>)}</Col>;
}
export function PublicHome() {
  const { isDesktop } = useBreakpoint();
  return <Screen inTabs header={<AppBar title="Kodax" actions={<Button label="تسجيل الدخول" variant="ghost" size="sm" onPress={() => router.push('/login')} />} />}>
    <Col gap={24}><Text variant="display" accessibilityRole="header">تعلّم البرمجة بالعربية</Text>
      <Row wrap gap={12} align="flex-start">{PROGRAMMING_FIELDS.map(f => <View key={f.id} style={{ width: isDesktop ? '47%' : '100%' }}><Surface padding={18}><Col gap={10}>
        <Text variant="heading">{f.nameAr}</Text><Text variant="bodySm" tone="secondary">{ALL_COURSES.filter(c => c.fieldId === f.id).length} دورات</Text>
        <Button label="استكشف المسار" variant="secondary" onPress={() => router.push(`/field/${f.id}` as any)} />
      </Col></Surface></View>)}</Row>
      <Button label="التحديات البرمجية" variant="secondary" onPress={() => router.push('/challenges' as any)} />
    </Col></Screen>;
}
