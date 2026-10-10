import React, { useState } from 'react';
import { View } from 'react-native';
import { ALL_BADGES, type BadgeConditionType } from '@/constants/badgeDefinitions';
import { ALL_LESSONS } from '@/constants/courseData';
import type { ProgressState } from '@/services/coinService';
import { Row, Col, Text, ProgressBar, Button, useTheme } from '@/design';
import { useRouter } from 'expo-router';
import { levelForXp } from './level';
import { AchievementSeal, JourneyNode } from './JourneyVisuals';

export function NextBadgeGoal({
  earnedIds,
  progress,
  xp,
  completedChallenges,
}: {
  earnedIds: string[];
  progress: ProgressState;
  xp: number;
  completedChallenges: number;
}) {
  const t = useTheme();
  const router = useRouter();
  const [width, setWidth] = useState(0);
  // Adapt to this card's width, including its narrow placement beside learning.
  const wide = width >= 560;
  const lessons = progress.completed_lessons.filter((id) => ALL_LESSONS.some((l) => l.id === id)).length;
  // Only suggest criteria whose complete, current count is available here.
  // A met criterion is not presented as a new award: BadgeContext grants badges.
  const counts: Partial<Record<BadgeConditionType, number>> = {
    first_lesson: lessons,
    lessons_completed: lessons,
    first_challenge: completedChallenges,
    challenges_completed: completedChallenges,
    first_xp: xp,
    xp_earned: xp,
    level_reached: levelForXp(xp),
    streak_days: progress.streak.current,
  };
  const next = ALL_BADGES.filter(
    (b) => !earnedIds.includes(b.id) && counts[b.conditionType] !== undefined && (counts[b.conditionType] ?? 0) < b.conditionValue
  ).sort(
    (a, b) =>
      (counts[b.conditionType] ?? 0) / b.conditionValue - (counts[a.conditionType] ?? 0) / a.conditionValue ||
      Number(b.conditionType === 'first_lesson') - Number(a.conditionType === 'first_lesson')
  )[0];
  if (!next) return null;
  const count = counts[next.conditionType] ?? 0;
  const challenge = next.conditionType === 'first_challenge' || next.conditionType === 'challenges_completed';
  const path = next.conditionValue <= 7 ? (
    <Row gap={8} wrap accessibilityLabel={`${count} من ${next.conditionValue}`}>
      {Array.from({ length: next.conditionValue }, (_, i) => (
        <JourneyNode key={i} number={i + 1} state={i < count ? 'completed' : i === count ? 'current' : 'upcoming'} size={36} />
      ))}
    </Row>
  ) : (
    <ProgressBar value={count / next.conditionValue} tone="xp" label={`التقدم لشارة ${next.nameAr}`} />
  );
  const countLabel = (
      <Text variant="label" tabular>
        {count} من {next.conditionValue} · باقي {next.conditionValue - count}
      </Text>
  );
  const actionButton = <Button full={wide} label={challenge ? 'التحديات' : 'تعلّم'} size="sm" variant="secondary" onPress={() => router.push(challenge ? '/learn?tab=challenges' : '/learn')} />;
  const description = (
    <Col flex={1} gap={2}>
      <Text variant="caption" tone="secondary">إنجازك القادم</Text>
      <Text variant="heading">{next.nameAr}</Text>
      <Text variant="bodySm" tone="secondary">{next.descriptionAr}</Text>
    </Col>
  );
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ padding: 20, borderWidth: 1, borderColor: t.colors.borderStrong, backgroundColor: t.colors.surface, borderRadius: 16 }}>
      {wide ? (
        <Row gap={24}>
          <Row flex={1} gap={16}>
            <AchievementSeal icon={next.icon} earned={false} size={104} />
            {description}
          </Row>
          <Col gap={8} style={{ width: width >= 720 ? 300 : 220 }}>
            {path}
            {countLabel}
            {actionButton}
          </Col>
        </Row>
      ) : (
      <Col gap={14}>
        <Row gap={16} align="flex-start">
          <AchievementSeal icon={next.icon} earned={false} size={88} />
          {description}
        </Row>
        {path}
        <Row gap={14} wrap>{countLabel}{actionButton}</Row>
      </Col>
      )}
    </View>
  );
}
