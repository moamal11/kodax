import React from 'react';
import { View } from 'react-native';
import { Row, Col, Text, ProgressBar, Surface, useTheme } from '@/design';
import { formatXp, levelProgress } from './level';
import { JourneyNode } from './JourneyVisuals';

/** Read-only presentation of the existing server XP and level thresholds. */
export function ProgressionOverview({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const t = useTheme();
  const p = levelProgress(xp);
  return (
    <Surface padding={compact ? 14 : 18} accessibilityLabel={`المستوى ${p.level}، ${formatXp(xp)} XP، باقي ${formatXp(p.remaining)} للمستوى ${p.level + 1}`}>
      <Col gap={12}>
        <Row gap={14}>
          <JourneyNode state="current" number={p.level} size={compact ? 44 : 62} />
          <Col flex={1} gap={3}>
            <Text variant="caption" tone="secondary">
              مستواك في Kodax
            </Text>
            <Text variant="heading">المستوى {p.level}</Text>
            <Text variant="bodySm" tone="secondary">
              باقي {formatXp(p.remaining)} XP للمستوى {p.level + 1}
            </Text>
          </Col>
        </Row>
        <ProgressBar value={p.ratio} tone="xp" height={8} label={`التقدم إلى المستوى ${p.level + 1}`} />
        <Row justify="space-between">
          <Text variant="caption" tone="secondary" ltr tabular>
            {formatXp(xp)} XP
          </Text>
          <Text variant="caption" tone="muted" ltr tabular>
            {formatXp(p.next)} XP
          </Text>
        </Row>
      </Col>
    </Surface>
  );
}
