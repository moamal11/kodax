/**
 * رأس الملف الشخصي (العام والخاص): الهوية + المستوى/XP + المتابعات (قابلة للضغط → قائمة فعلية).
 * الأسماء الطويلة تلتف ولا تُقص الأزرار (F02).
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Row, Col, Avatar, Surface, useTheme, useBreakpoint } from '@/design';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { formatXp, levelProgress } from '@/features/rewards/level';
import { FollowListSheet } from './FollowListSheet';

type P = {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  verified?: boolean | null;
  province?: string | null;
  createdAt?: string | null;
  xp: number;
  followers: number;
  following: number;
  /** صف الإجراءات تحت الهوية */
  actions?: React.ReactNode;
  /** يستبدل الصورة (مثلاً زر تغيير الصورة) */
  avatarSlot?: React.ReactNode;
  extraMeta?: string;
};

export function ProfileHeader({ id, name, username, avatarUrl, verified, province, createdAt, xp, followers, following, actions, avatarSlot, extraMeta }: P) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  const [list, setList] = useState<null | 'followers' | 'following'>(null);
  const p = levelProgress(xp);
  const joined = createdAt ? new Date(createdAt).toLocaleDateString('ar-IQ-u-nu-latn', { month: 'long', year: 'numeric', timeZone: 'Asia/Baghdad' }) : null;
  const meta = [province, joined ? `انضم ${joined}` : null, extraMeta].filter(Boolean).join(' · ');

  const stat = (value: string, label: string, onPress?: () => void) => {
    const body = (
      <Col gap={0} align="center" style={{ minWidth: 64 }}>
        <Text variant="heading" weight="bold" tabular ltr align="center">
          {value}
        </Text>
        <Text variant="caption" tone="muted" align="center">
          {label}
        </Text>
      </Col>
    );
    if (!onPress) return <View style={{ flex: 1 }} accessible accessibilityLabel={`${label}: ${value}`}>{body}</View>;
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} accessibilityHint="يعرض القائمة" style={(s: any) => ({ flex: 1, borderRadius: t.radius.sm, paddingVertical: 4, backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}>
        {body}
      </Pressable>
    );
  };

  return (
    <Surface padding={isPhone ? 16 : 20}>
      <Row gap={14} align="flex-start">
        {avatarSlot ?? <Avatar uri={avatarUrl} name={name} size={isPhone ? 64 : 76} />}
        <View style={{ flex: 1, gap: 2 }}>
          <Row gap={4} align="flex-start" style={{ justifyContent: 'flex-start' }}>
            <Text variant="title" style={{ flexShrink: 1 }} accessibilityRole="header">
              {name}
            </Text>
            <View style={{ marginTop: 8 }}>
              <VerifiedBadge verified={verified} size={18} />
            </View>
          </Row>
          {!!username && (
            <Text variant="bodySm" tone="muted" ltr align="right" numberOfLines={1}>
              @{username}
            </Text>
          )}
          {!!meta && (
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {meta}
            </Text>
          )}
        </View>
      </Row>

      <Row style={{ marginTop: 16, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.colors.border }}>
        {stat(String(p.level), 'المستوى')}
        {stat(formatXp(xp), 'XP')}
        {stat(String(followers), 'متابِعون', () => setList('followers'))}
        {stat(String(following), 'يتابع', () => setList('following'))}
      </Row>
      <Row gap={8} style={{ marginTop: 12 }}>
        <Ionicons name="flash" size={14} color={t.colors.xp} />
        <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: t.colors.surfaceSunken, overflow: 'hidden', flexDirection: 'row-reverse' }}>
          <View style={{ width: `${p.ratio * 100}%`, backgroundColor: t.colors.xp }} />
        </View>
        <Text variant="caption" tone="muted" tabular>
          {formatXp(p.remaining)} للمستوى {p.level + 1}
        </Text>
      </Row>

      {actions && <View style={{ marginTop: 14 }}>{actions}</View>}

      <FollowListSheet userId={id} visible={!!list} initialTab={list ?? 'followers'} onClose={() => setList(null)} counts={{ followers, following }} />
    </Surface>
  );
}
