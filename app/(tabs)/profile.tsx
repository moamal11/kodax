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
import { Screen, Text, Row, Col, Button, ListGroup, ListRow, Stat, Surface, SectionHeader, Tag, Sheet, useTheme, useBreakpoint } from '@/design';
import { ProfileHeader } from '@/features/community/ProfileHeader';
import { BadgesSummary, BadgesSheet } from '@/features/rewards/Badges';
import { languageLabel } from '@/features/community/SnippetCard';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user, userId, fullName, signOut } = useAuth();
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
  const [confirmOut, setConfirmOut] = useState(false);
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
  const lessonsDone = progress?.completed_lessons?.length ?? 0;
  const streak = progress?.streak;
  const drafts = useMemo(() => mine.filter((s) => !s.is_public).length, [mine]);

  const header = (
    <ProfileHeader
      id={userId ?? ''}
      name={name}
      username={profile?.username}
      avatarUrl={profile?.avatar_url}
      verified={profile?.is_verified}
      province={profile?.province}
      createdAt={profile?.created_at}
      xp={Number(profile?.xp ?? (appProfile as any)?.xp ?? 0)}
      followers={profile?.followers_count ?? 0}
      following={profile?.following_count ?? 0}
      extraMeta={user?.email ?? undefined}
      actions={<Button label="تعديل الملف" icon="create-outline" variant="secondary" onPress={() => setEdit(true)} full />}
    />
  );

  const progressCard = (
    <View>
      <SectionHeader title="تقدّمك" />
      <Surface padding={14}>
        <Row gap={8} wrap>
          <Stat value={`${lessonsDone}`} label={`درس من ${ALL_LESSONS.length}`} icon="book-outline" />
          <Stat value={`${solved}`} label={`تحدٍّ من ${ALL_CHALLENGES.length}`} icon="code-slash-outline" />
          <Stat value={`${streak?.current ?? 0}`} label={`سلسلة · الأفضل ${streak?.best ?? 0}`} icon="flame-outline" tone="streak" />
          <Stat value={`${balance ?? 0}`} label="كوين" icon="wallet-outline" tone="coin" />
        </Row>
      </Surface>
    </View>
  );

  const myCode = (
    <View>
      <SectionHeader title="أكوادي" subtitle={mine.length ? `${mine.length - drafts} منشور · ${drafts} مسودة خاصة` : undefined} action="اكتب كوداً" onAction={() => router.push('/code/add?lang=python' as any)} />
      {mine.length === 0 ? (
        <Surface padding={14}>
          <Text variant="bodySm" tone="muted">
            ما كتبت أكواداً بعد. المسودات الخاصة تظهر هنا أيضاً.
          </Text>
        </Surface>
      ) : (
        <ListGroup>
          {mine.slice(0, 6).map((s, i) => (
            <ListRow key={s.id} icon={s.is_public ? 'code-slash-outline' : 'lock-closed-outline'} title={s.title} subtitle={`${languageLabel(s.language)}${s.is_public ? '' : ' · مسودة خاصة'}`} onPress={() => router.push(`/code/${s.id}` as any)} last={i === Math.min(5, mine.length - 1)} />
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
      <View>
        <SectionHeader title="الحساب" />
        <ListGroup>
          <ListRow icon="notifications-outline" title="الإشعارات" onPress={() => router.push('/notification-settings' as any)} />
          <ListRow icon="ban-outline" title="المستخدمون المحظورون" onPress={() => router.push('/blocked-users' as any)} />
          <ListRow icon="help-buoy-outline" title="الدعم الفني" onPress={() => router.push('/support' as any)} last />
        </ListGroup>
      </View>
      <View>
        <SectionHeader title="عن Kodax" />
        <ListGroup>
          <ListRow icon="information-circle-outline" title="حول التطبيق" onPress={() => router.push('/about' as any)} />
          <ListRow icon="shield-checkmark-outline" title="سياسة الخصوصية" onPress={() => router.push('/privacy' as any)} />
          <ListRow icon="document-text-outline" title="شروط الاستخدام" onPress={() => router.push('/terms' as any)} last />
        </ListGroup>
      </View>
      <ListGroup>
        <ListRow icon="log-out-outline" title="تسجيل الخروج" onPress={() => setConfirmOut(true)} chevron={false} />
        <ListRow icon="trash-outline" title="حذف الحساب" danger onPress={() => router.push('/delete-account' as any)} last />
      </ListGroup>
    </Col>
  );

  return (
    <Screen
      inTabs
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
      <Text variant="title" accessibilityRole="header" style={{ paddingTop: 8, paddingBottom: 12 }}>
        حسابي
      </Text>
      {isDesktop ? (
        <Row align="flex-start" gap={24}>
          <Col gap={20} flex={1}>
            {header}
            {progressCard}
            <DailyRewardCard />
            <BadgesSummary earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
            {myCode}
          </Col>
          <View style={{ width: 360 }}>{settings}</View>
        </Row>
      ) : (
        <Col gap={20}>
          {header}
          {progressCard}
          <DailyRewardCard />
          <BadgesSummary earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
          {myCode}
          {settings}
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
      <Sheet visible={confirmOut} onClose={() => setConfirmOut(false)} title="تسجيل الخروج؟" maxWidth={400}>
        <Col gap={14}>
          <Text variant="body" tone="secondary">
            تقدمك محفوظ على حسابك. تقدر ترجع بأي وقت.
          </Text>
          <Row gap={8}>
            <Button
              label="خروج"
              variant="danger"
              onPress={() => {
                setConfirmOut(false);
                signOut();
              }}
              style={{ flex: 1 }}
            />
            <Button label="إلغاء" variant="secondary" onPress={() => setConfirmOut(false)} style={{ flex: 1 }} />
          </Row>
        </Col>
      </Sheet>
    </Screen>
  );
}
