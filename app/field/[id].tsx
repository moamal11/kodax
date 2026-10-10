import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';
import { PROGRAMMING_FIELDS } from '@/constants';
import { getCoursesByField } from '@/constants/courseData';
import { Screen, AppBar, Text, Col, EmptyState } from '@/design';
import { PublicCourseList } from '@/features/web/PublicCourseList';
export default function FieldPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const field = PROGRAMMING_FIELDS.find(f => f.id === id);
  if (Platform.OS !== 'web') return <Redirect href={{ pathname: '/learn', params: { field: id } }} />;
  return <Screen width="reading" header={<AppBar title={field?.nameAr || 'المسار'} fallback="/learn" />}>
    {field ? <Col gap={24}><Text variant="display" accessibilityRole="header">{field.nameAr}</Text><PublicCourseList courses={getCoursesByField(id).sort((a,b) => a.order-b.order)} /></Col> : <EmptyState title="المسار غير موجود" icon="alert-circle-outline" />}
  </Screen>;
}
