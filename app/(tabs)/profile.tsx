/**
 * حسابي: الهوية والتقدم، أكوادي (العامة والمسودات)، الشارات، والإعدادات كمجموعات صفوف.
 * تخطيط واحد متجاوب (عمودان على Desktop) بدل ثلاثة تخطيطات منفصلة.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useCoins } from '@/contexts/CoinsContext';
import { useBadges } from '@/contexts/BadgeContext';
import { getProfile, type ProfileData } from '@/services/profileService';
import { getUserSnippets, type FeedSnippet } from '@/services/codeFeedService';
import { coinService, type ProgressState } from '@/services/coinService';
import { hybridSyncService } from '@/services/hybridSyncService';
import { ALL_CHALLENGES, ALL_LESSONS } from '@/constants/courseData';
import ProfileEditModal from '@/components/ui/ProfileEditModal';
import DailyRewardCard from '@/components/coins/DailyRewardCard';
import { Screen, Text, Row, Col, Button, IconButton, ListGroup, ListRow, Stat, ProgressBar, Surface, SectionHeader, Tag, Sheet, useTheme, useBreakpoint } from '@/design';
import { ProfileHeader } from '@/features/community/ProfileHeader';
import { BadgesSummary, BadgesSheet } from '@/features/rewards/Badges';
import { languageLabel } from '@/features/community/SnippetCard';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user, userId, fullName } = useAuth();
  const { profile: appProfile, refreshProfile } = useApp();
  const { balance } = useCoins();
  const { earnedBadgeIds, refreshBadges } = useBadges();
  const { isDesktop } = useBreakpoint();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [solved, setSolved] = useState(0);
  const [mine, setMine] = useState<FeedSnippet[]>([]);
  const [edit, setEdit] = useState(false);
  const [badges, setBadges] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [p, prog, snippets] = await Promise.all([getProfile(userId), coinService.getProgressState(), getUserSnippets(userId)]);
    if (p.data) setProfile(p.data);
    setProgress(prog);
    setMine(snippets.data ?? []);
    await hybridSyncService.setUser(userId);
    const done = await hybridSyncService.fetchAllCompletedLessons();
    setSolved(done.filter((id) => ALL_CHALLENGES.some((c) => c.id === id)).length);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
      refreshBadges();
    }, [load, refreshBadges])
  );
  useEffect(() => {
    if (appProfile && !profile) setProfile(appProfile as ProfileData);
  }, [appProfile]);

  const name = profile?.full_name || profile?.username || fullName || user?.email?.split('@')[0] || 'حسابي';
  const lessonsDone = (progress?.completed_lessons ?? []).filter((id) => ALL_LESSONS.some((l) => l.id === id)).length;
  const streak = progress?.streak;
  const drafts = useMemo(() => mine.filter((s) => !s.is_public).length, [mine]);

  const header = (
    <ProfileHeader
      id={userId ?? ''}
      name={name}
      username={profile?.username}
      avatarUrl={profile?.avatar_url}
      coverUrl={profile?.cover_url} bio={profile?.bio} followersVisible={profile?.followers_visible} followingVisible={profile?.following_visible}
      verified={profile?.is_verified}
      province={profile?.province}
      createdAt={profile?.created_at}
      xp={Number(profile?.xp ?? (appProfile as any)?.xp ?? 0)}
      followers={profile?.followers_count ?? 0}
      following={profile?.following_count ?? 0}
      extraMeta={user?.email ?? undefined}
      identityAction={<IconButton label="تعديل الملف" icon="create-outline" onPress={() => setEdit(true)} />}
    />
  );

  const progressCard = (
    <View>
      <SectionHeader title="تقدّمك" />
      <Surface padding={14}>
        <Col gap={16}>
          <Row gap={16} wrap>
            {[
              [lessonsDone, ALL_LESSONS.length, 'دروس أكملتها'],
              [solved, ALL_CHALLENGES.length, 'تحديات حلّيتها'],
            ].map(([done, total, label]) => (
              <Col key={label} gap={8} style={{ flex: 1, minWidth: 120 }}>
                <Text variant="heading" tabular>
                  {done}{' '}
                  <Text variant="bodySm" tone="secondary">
                    {label}
                  </Text>
                </Text>
                <Text variant="caption" tone="muted">
                  من {total} في Kodax
                </Text>
              </Col>
            ))}
          </Row>
          <Row gap={12} wrap style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: t.colors.border }}>
            <Text variant="bodySm" tone="streak">
              سلسلتك {streak?.current ?? 0} أيام · أفضلها {streak?.best ?? 0}
            </Text>
            <Text variant="bodySm" tone="coin">
              رصيدك {balance ?? 0} كوين
            </Text>
          </Row>
        </Col>
      </Surface>
    </View>
  );

  const myCode = (
    <View>
      <SectionHeader
        title="أكوادي"
        subtitle={mine.length ? `${mine.length - drafts} منشور · ${drafts} مسودة خاصة` : undefined}
        action="اكتب كوداً"
        onAction={() => router.push('/code/add?lang=python' as any)}
      />
      {mine.length === 0 ? (
        <Surface padding={14}>
          <Text variant="bodySm" tone="muted">
            ما كتبت أكواداً بعد. المسودات الخاصة تظهر هنا أيضاً.
          </Text>
        </Surface>
      ) : (
        <ListGroup>
          {mine.slice(0, 6).map((s, i) => (
            <ListRow
              key={s.id}
              icon={s.is_public ? 'code-slash-outline' : 'lock-closed-outline'}
              title={s.title}
              subtitle={`${languageLabel(s.language)}${s.is_public ? '' : ' · مسودة خاصة'}`}
              onPress={() => router.push(`/code/${s.id}` as any)}
              last={i === Math.min(5, mine.length - 1)}
            />
          ))}
        </ListGroup>
      )}
    </View>
  );

  const settings = (
    <Col gap={16}>
      <View>
        <SectionHeader title="التعلّم والمكافآت" />
        <ListGroup>
          <ListRow icon="wallet-outline" title="الكوينات والمكافآت" value={`${balance ?? 0} كوين`} onPress={() => router.push('/rewards')} />
          <ListRow icon="ribbon-outline" title="الشهادات" onPress={() => router.push('/certificate')} />
          <ListRow icon="podium-outline" title="لوحة الصدارة" onPress={() => router.push('/leaderboard' as any)} last />
        </ListGroup>
      </View>
      <ListGroup><ListRow icon="settings-outline" title="الإعدادات" subtitle="الخصوصية والإشعارات والحساب" onPress={() => router.push('/settings' as any)} last /></ListGroup>
    </Col>
  );

  return (
    <Screen
      inTabs
      padded={false}
      contentStyle={{ paddingTop: 0 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await Promise.all([load(), refreshProfile()]);
            setRefreshing(false);
          }}
          tintColor={t.colors.brand}
        />
      }
    >
      {isDesktop ? (
        <Row align="flex-start" gap={24}>
          <Col gap={20} flex={1}>
            {header}
            <Col gap={20} style={{ paddingHorizontal: 24 }}>
            {progressCard}
            <DailyRewardCard />
            <BadgesSummary earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
            {myCode}
            </Col>
          </Col>
          <View style={{ width: 336, paddingTop: 16, paddingLeft: 24 }}>{settings}</View>
        </Row>
      ) : (
        <Col gap={20}>
          {header}
          <Col gap={20} style={{ paddingHorizontal: 16 }}>
          {progressCard}
          <DailyRewardCard />
          <BadgesSummary earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
          {myCode}
          {settings}
          </Col>
        </Col>
      )}

      <ProfileEditModal
        visible={edit}
        profile={profile}
        onClose={() => setEdit(false)}
        onSave={() => {
          setEdit(false);
          load();
          refreshProfile();
        }}
      />
      <BadgesSheet visible={badges} onClose={() => setBadges(false)} earnedIds={earnedBadgeIds} />

    </Screen>
  );
}
