import { JourneyNode } from '@/features/rewards/JourneyVisuals';
/**
 * رأس الملف الشخصي (العام والخاص): الهوية + المستوى/XP + المتابعات (قابلة للضغط → قائمة فعلية).
 * الأسماء الطويلة تلتف ولا تُقص الأزرار (F02).
 */
import React, { useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Row, Col, Avatar, useTheme, useBreakpoint, ltrIsolate } from '@/design';
import { useAuth } from '@/contexts/AuthContext';
import { requestSignIn } from '@/services/webAccess';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { formatXp, levelProgress } from '@/features/rewards/level';
import { FollowListSheet } from './FollowListSheet';

type P = {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  followersVisible?: boolean;
  followingVisible?: boolean;
  verified?: boolean | null;
  province?: string | null;
  createdAt?: string | null;
  xp: number;
  followers: number;
  following: number;
  /** صف الإجراءات تحت الهوية */
  actions?: React.ReactNode;
  /** Compact owner action beside follow counts. */
  identityAction?: React.ReactNode;
  /** يستبدل الصورة (مثلاً زر تغيير الصورة) */
  avatarSlot?: React.ReactNode;
  extraMeta?: string;
};

/** The cover ends in the page surface; identity remains in normal flow at its edge. */
export function ProfileIdentityHero({ coverUrl, name, children, compact = false }: {
  coverUrl?: string | null; name: string; children: React.ReactNode; compact?: boolean;
}) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  return <View>
    {!!coverUrl && <View style={{ height: compact ? 176 : isPhone ? 216 : 252, borderTopLeftRadius: compact ? t.radius.lg : 0, borderTopRightRadius: compact ? t.radius.lg : 0, overflow: 'hidden', backgroundColor: t.colors.surface }}>
      <Image source={{ uri: coverUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel={`غلاف ${name}`} />
      <LinearGradient pointerEvents="none" colors={[`${t.colors.bg}00`, `${t.colors.bg}D9`, t.colors.bg]} locations={[0, 0.55, 1]} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: compact ? 128 : 144 }} />
    </View>}
    <View style={{ marginTop: coverUrl ? -88 : 0, paddingHorizontal: compact ? 8 : 16, paddingTop: coverUrl ? 0 : 8 }}>
      {children}
    </View>
  </View>;
}

export function ProfileIdentityName({ name, username, avatarUrl, avatarSlot, verified, compact = false, children }: {
  name: string; username?: string | null; avatarUrl?: string | null; avatarSlot?: React.ReactNode; verified?: boolean | null; compact?: boolean; children?: React.ReactNode;
}) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  return <Row gap={isPhone ? 12 : 18} align="flex-start">
    <View style={{ marginTop: 4, borderWidth: 4, borderColor: t.colors.bg, borderRadius: 64, backgroundColor: t.colors.bg }}>
      {avatarSlot ?? <Avatar uri={avatarUrl} name={name} size={compact ? 64 : isPhone ? 80 : 96} />}
    </View>
    <Col flex={1} gap={2} style={{ minWidth: 0, paddingTop: 8 }}>
      <Row gap={4} align="flex-start">
        <Text variant={compact ? 'heading' : 'title'} style={{ flexShrink: 1 }} accessibilityRole="header">{name}</Text>
        {!!verified && <View style={{ marginTop: 7 }}><VerifiedBadge verified={verified} size={18} /></View>}
      </Row>
      {!!username && <Text variant="bodySm" tone="secondary" ltr align="right">@{username}</Text>}
      {children}
    </Col>
  </Row>;
}

export function ProfileHeader({ id, name, username, avatarUrl, coverUrl, bio, followersVisible = true, followingVisible = true, verified, province, createdAt, xp, followers, following, actions, identityAction, avatarSlot, extraMeta }: P) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  const { userId } = useAuth();
  const owner = userId === id;
  const [list, setList] = useState<null | 'followers' | 'following'>(null);
  const p = levelProgress(xp);
  const joined = createdAt ? new Date(createdAt).toLocaleDateString('ar-IQ-u-nu-latn', { month: 'long', year: 'numeric', timeZone: 'Asia/Baghdad' }) : null;
  const meta = [province, joined ? `انضم ${joined}` : null].filter(Boolean).join(' · ');

  const stat = (value: string, label: string, allowed: boolean, onPress?: () => void) => {
    const body = (
      <Row gap={5} wrap>
        <Text variant="body" weight="bold" tabular ltr>
          {value}
        </Text>
        <Text variant="bodySm" tone="secondary">
          {label}{!allowed ? ' · خاصة' : ''}
        </Text>
      </Row>
    );
    if (!onPress || !allowed)
      return (
        <View style={{ minHeight: 44, justifyContent: 'center' }} accessible accessibilityLabel={`${label}: ${value}`}>
          {body}
        </View>
      );
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint="يعرض القائمة"
        style={(s: any) => ({
          borderRadius: t.radius.sm,
          minHeight: 44,
          justifyContent: 'center',
          backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent',
        })}
      >
        {body}
      </Pressable>
    );
  };

  return (
    <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
      <ProfileIdentityHero coverUrl={coverUrl} name={name}>
      <View style={{ flexDirection: isPhone ? 'column' : 'row-reverse', gap: isPhone ? 12 : 28, alignItems: 'stretch' }}>
      <Col gap={8} style={{ flex: isPhone ? undefined : 1, minWidth: 0 }}>
      <ProfileIdentityName name={name} username={username} avatarUrl={avatarUrl} avatarSlot={avatarSlot} verified={verified}>
      <Row gap={8} wrap style={{ marginTop: 2 }}>
        {stat(String(followers), 'متابِعون', owner || followersVisible, () => Platform.OS === 'web' && !userId ? requestSignIn() : setList('followers'))}
        {stat(String(following), 'يتابع', owner || followingVisible, () => Platform.OS === 'web' && !userId ? requestSignIn() : setList('following'))}
        {identityAction}
      </Row>
      </ProfileIdentityName>
      {!!bio?.trim() && <Text variant="body" selectable>{bio}</Text>}
      {!!meta && <Text variant="bodySm" tone="secondary">{meta}</Text>}
      {!!extraMeta && <Text variant="caption" tone="secondary" ltr align="right">{ltrIsolate(extraMeta)}</Text>}
      </Col>
      <Col gap={12} style={{ width: isPhone ? '100%' : 232, paddingTop: isPhone ? 0 : coverUrl ? 88 : 8 }}>
      <Row gap={12} style={{ paddingVertical: 4 }}>
        <JourneyNode state="current" number={p.level} size={48} />
        <Col flex={1} gap={2}>
          <Text variant="heading">المستوى {p.level}</Text>
          <Text variant="bodySm" tone="secondary">
            {formatXp(p.remaining)} XP للمستوى {p.level + 1}
          </Text>
          <Text variant="caption" tone="xp" ltr align="right">{formatXp(xp)} XP</Text>
        </Col>
      </Row>
      {!!actions && <View style={{ alignSelf: 'stretch' }}>{actions}</View>}
      </Col>
      </View>
      </ProfileIdentityHero>

      {!!list && <FollowListSheet userId={id} visible initialTab={list} onClose={() => setList(null)} counts={{ followers, following }} />}
    </View>
  );
}
