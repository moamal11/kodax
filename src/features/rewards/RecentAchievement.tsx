import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ALL_BADGES, type BadgeDefinition } from '@/constants/badgeDefinitions';
import { supabase } from '@/lib/supabase';
import { Surface, Col, Row, Text } from '@/design';
import { AchievementSeal } from './JourneyVisuals';

/** Latest stored award, ordered by its actual earning date. */
export function RecentAchievement({ userId }: { userId?: string | null }) {
  const [badge, setBadge] = useState<BadgeDefinition | null>(null);
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setBadge(null);
      if (userId)
        supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
          .limit(1)
          .then(({ data, error }) => {
            if (alive && !error) setBadge(ALL_BADGES.find((b) => b.id === data?.[0]?.badge_id) ?? null);
          });
      return () => {
        alive = false;
      };
    }, [userId])
  );
  if (!badge) return null;
  return (
    <Surface padding={16} onPress={() => router.push('/rewards')} accessibilityLabel={`آخر شارة مكتسبة: ${badge.nameAr}. المكافآت`}>
      <Row gap={14}>
        <AchievementSeal icon={badge.icon} earned size={60} />
        <Col flex={1} gap={3}>
          <Text variant="caption" tone="secondary">
            آخر إنجاز
          </Text>
          <Text variant="heading">{badge.nameAr}</Text>
          <Text variant="bodySm" tone="secondary">
            {badge.descriptionAr}
          </Text>
        </Col>
      </Row>
    </Surface>
  );
}
