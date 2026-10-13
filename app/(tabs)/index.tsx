import { leaderboardPreview } from '@/utils/leaderboardPreview';
import { profilePath } from '@/services/profileLinks';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';
import { RecentAchievement } from '@/features/rewards/RecentAchievement';
import { HomeContinuation } from '@/features/learn/HomeContinuation';
/**
 * الرئيسية = «اليوم»: تابع من حيث توقفت، هدف اليوم وأسبوعك، تحدي اليوم، ولمحة من المجتمع والصدارة.
 * كل الأرقام من السيرفر (progress_get_state، user_activity_days، daily_challenge_get).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, View, Pressable, useWindowDimensions } from 'react-native';
import PublicLandingPage from '@/features/download/PublicLandingPage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Text,
  Row,
  Col,
  Button,
  Surface,
  ProgressBar,
  SectionHeader,
  Avatar,
  Tag,
  CodeView,
  Skeleton,
  ErrorState,
  useTheme,
  useBreakpoint,
  makeStyles,
} from '@/design';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useCoins } from '@/contexts/CoinsContext';
import { NotificationButton } from '@/components/editor/NotificationButton';
import { MessagesButton } from '@/components/ui/MessagesButton';
import { XpMeter } from '@/features/rewards/XpMeter';
import { formatXp } from '@/features/rewards/level';
import { useLearningSnapshot, type LearningSnapshot } from '@/features/learn/useLearningSnapshot';
import { SnippetCard, languageLabel } from '@/features/community/SnippetCard';
import { getPublicSnippets, getSnippetCounts, type FeedSnippet } from '@/services/codeFeedService';
import { supabaseService } from '@/services/supabaseService';
import { coinService } from '@/services/coinService';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

const DIFF: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  easy: { label: 'سهل', tone: 'success' },
  medium: { label: 'متوسط', tone: 'warning' },
  hard: { label: 'صعب', tone: 'danger' },
};

export default function HomeScreen() {
  const t = useTheme();
  const { fontScale } = useWindowDimensions();
  const s = useStyles();
  const router = useRouter();
  const { userId, fullName, user } = useAuth();
  const { profile } = useApp();
  const { isDesktop, hasSidebar } = useBreakpoint();
  const { data, loading, error, refresh } = useLearningSnapshot(userId);
  const [refreshing, setRefreshing] = useState(false);
  const [snippets, setSnippets] = useState<FeedSnippet[]>([]);
  const [top, setTop] = useState<any[]>([]);

  useEffect(() => {
    if (userId) coinService.track('app_open');
  }, [userId]);

  const loadSide = useCallback(async () => {
    const [feed, leaders] = await Promise.all([getPublicSnippets({ limit: 2, sortBy: 'recent' }), supabaseService.getLeaderboard(50)]);
    const items = feed.data ?? [];
    const counts = await getSnippetCounts(items.map((s) => s.id));
    setSnippets(
      items.map((s) => ({
        ...s,
        comments_count: counts.commentCounts[s.id] ?? s.comments_count,
        views_count: counts.viewCounts[s.id] ?? s.views_count,
        likes_count: counts.likeCounts[s.id] ?? s.likes_count,
      }))
    );
    setTop(leaders ?? []);
  }, []);
  useEffect(() => {
    loadSide();
  }, [loadSide]);
  // العودة من درس/تحدٍّ: تحديث التقدم
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadSide();
    }, [refresh, loadSide])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadSide()]);
    setRefreshing(false);
  };

  const name = profile?.full_name || fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'حسابي';

  const streakLine = data
    ? data.streak.current > 0
      ? `سلسلتك ${data.streak.current} ${data.streak.current === 1 ? 'يوم' : data.streak.current <= 10 ? 'أيام' : 'يوم'}${data.streak.activeToday ? ' · تعلّمت اليوم' : ' · لم تسجّل درسًا اليوم'}`
      : 'لم تبدأ سلسلة التعلّم بعد'
    : ' ';

  const header = (
    <View style={[s.header, { paddingHorizontal: isDesktop ? 28 : 16 }]}>
      <Row gap={4}>
        <Pressable onPress={() => router.push('/profile')} accessibilityRole="link" accessibilityLabel="ملفي الشخصي" style={{ flex: 1, minWidth: 0 }}>
          <Row gap={10}>
            <Avatar uri={profile?.avatar_url} name={name} size={44} />
            <Row gap={3} style={{ flex: 1, minWidth: 0, justifyContent: 'flex-start' }}>
            <Text variant="label" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {name}
            </Text>
            <VerifiedBadge verified={profile?.is_verified} size={14} />
            </Row>
          </Row>
        </Pressable>
        {userId && <MessagesButton userId={userId} />}
        {userId && <NotificationButton userId={userId} onNotificationPress={(n) => n.metadata?.navigateTo && router.push(n.metadata.navigateTo)} />}
      </Row>
      <Row gap={10} justify="space-between" wrap={fontScale > 1.2}>
        <Row gap={6} style={{ flexShrink: 1 }}>
          <Ionicons name="flame" size={16} color={data?.streak.activeToday ? t.colors.streak : t.colors.textMuted} />
          <Text variant="bodySm" tone="secondary" style={{ flexShrink: 1 }}>
            {streakLine}
          </Text>
        </Row>
        {!hasSidebar && <XpMeter />}
      </Row>
    </View>
  );

  const main = (
    <Col gap={20} flex={isDesktop ? 1 : undefined}>
      {loading && !data ? (
        <Col gap={12}>
          <Skeleton height={180} radius={12} />
          <Skeleton height={120} radius={12} />
        </Col>
      ) : error && !data ? (
        <Surface>
          <ErrorState onRetry={refresh} compact />
        </Surface>
      ) : data ? (
        <>
          <HomeContinuation data={data} />
          <TodayCard data={data} />
          {data.dailyChallenge && <DailyChallengeCard ch={data.dailyChallenge} />}
          <Row gap={10} wrap>
            <Button
              label="جرّب تحديًا"
              icon="code-slash-outline"
              variant="secondary"
              onPress={() => router.push('/learn?tab=challenges' as any)}
              style={{ flex: 1, minWidth: 124 }}
            />
            <Button
              label="افتح المحرر"
              icon="terminal-outline"
              variant="ghost"
              onPress={() => router.push('/code/add?lang=python' as any)}
              style={{ flex: 1, minWidth: 124 }}
            />
          </Row>
        </>
      ) : null}

      {snippets.length > 0 && (
        <View>
          <SectionHeader title="جديد من المجتمع" action="كل الأكواد" onAction={() => router.push('/code')} />
          <View style={{ gap: 12, flexDirection: isDesktop ? 'row-reverse' : 'column' }}>
            {snippets.map((sn) => (
              <View key={sn.id} style={{ flex: isDesktop ? 1 : undefined }}>
                <SnippetCard
                  snippet={sn}
                  previewLines={4}
                  onPress={() => router.push(`/code/${sn.id}` as any)}
                  onAuthorPress={() => router.push(profilePath(sn.user_id,sn.profiles?.username) as any)}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </Col>
  );

  const side = (
    <Col gap={20} style={isDesktop ? { width: 320 } : undefined}>
      <RecentAchievement userId={userId} />
      <LeaderboardMini users={leaderboardPreview(top, userId ? { ...profile, id: userId, full_name: name } : null)} meId={userId} />
      <CoinsRow />
    </Col>
  );

  if (Platform.OS === 'web' && !userId) return <PublicLandingPage />;
  return (
    <Screen inTabs header={header} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.brand} />}>
      {isDesktop ? (
        <Row align="flex-start" gap={24}>
          {main}
          {side}
        </Row>
      ) : (
        <Col gap={20}>
          {main}
          {side}
        </Col>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

function TodayCard({ data }: { data: LearningSnapshot }) {
  const t = useTheme();
  const { fontScale } = useWindowDimensions();
  const g = data.goal;
  const [weekWidth, setWeekWidth] = useState(0);
  const dayColumns = fontScale > 1.2 && weekWidth > 0 && weekWidth < 360 ? Math.min(4, data.week.length) : data.week.length;
  const dayCellWidth = weekWidth && dayColumns ? Math.max(0, Math.floor(((weekWidth - 4 * (dayColumns - 1)) / dayColumns) * 100) / 100) : 32;
  // Explicit equal dimensions avoid Yoga deriving height from an unclamped percentage width on tablets.
  const daySize = Math.min(40, dayCellWidth);
  return (
    <Surface padding={18}>
      <Row justify="space-between" align="flex-start" gap={12}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">هدف اليوم</Text>
          <Text variant="bodySm" tone="secondary">
            {g.done ? 'حققت هدفك اليوم. أي درس إضافي يزيد XP فقط.' : `${g.units} من ${g.target} (دروس أو تحديات)`}
          </Text>
        </View>
        {g.done ? <Tag label="تم" tone="success" icon="checkmark" /> : <Text variant="heading" tone="secondary" tabular ltr>{`${g.units}/${g.target}`}</Text>}
      </Row>
      <Row gap={10} style={{ marginTop: 12 }}>
        <JourneyNode state={g.done ? 'completed' : 'current'} size={32} />
        <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
          {g.done
            ? g.weekDays < g.weekTarget
              ? `باقي ${g.weekTarget - g.weekDays} أيام تعلّم لهدف الأسبوع`
              : 'أكملت هدف اليوم والأسبوع'
            : `باقي ${Math.max(0, g.target - g.units)} درس أو تحدٍّ لهدف اليوم`}
        </Text>
      </Row>
      <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 16 }} />
      <Row wrap gap={8} justify="space-between" style={{ marginBottom: 10 }}>
        <Text variant="label" tone="secondary">
          آخر 7 أيام
        </Text>
        <Text variant="caption" tone="muted">
          هذا الأسبوع {g.weekDays} من {g.weekTarget} أيام
        </Text>
      </Row>
      <Row wrap align="flex-start" justify="flex-start" gap={4} onLayout={(e) => setWeekWidth(e.nativeEvent.layout.width)}>
        {data.week.map((d) => (
          <View
            key={d.date}
            style={{ width: weekWidth ? dayCellWidth : undefined, flex: weekWidth ? undefined : 1, alignItems: 'center', gap: 6 }}
            accessible
            accessibilityLabel={`${d.isToday ? 'اليوم، ' : ''}${d.label}: ${d.active ? 'تعلمت' : d.frozen ? 'مجمّد' : 'بلا نشاط'}`}
          >
            <View
              style={{
                width: daySize,
                height: daySize,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: d.active ? t.colors.successSoft : t.colors.surfaceSunken,
                borderWidth: d.isToday ? 1.5 : 1,
                borderColor: d.isToday ? t.colors.borderStrong : 'transparent',
              }}
            >
              {d.active ? (
                <Ionicons name="checkmark" size={18} color={t.colors.successText} />
              ) : d.frozen ? (
                <Ionicons name="snow-outline" size={16} color={t.colors.infoText} />
              ) : null}
            </View>
            <Text
              variant="caption"
              tone={d.isToday ? 'default' : 'muted'}
              weight={d.isToday ? 'semibold' : 'regular'}
              align="center"
              numberOfLines={1}
              style={{ fontSize: 13 }}
            >
              {d.isToday ? 'اليوم' : d.label}
            </Text>
          </View>
        ))}
      </Row>
    </Surface>
  );
}

function DailyChallengeCard({ ch }: { ch: NonNullable<LearningSnapshot['dailyChallenge']> }) {
  const router = useRouter();
  const d = DIFF[ch.difficulty] ?? DIFF.easy;
  return (
    <Surface onPress={() => router.push(`/challenge/${ch.id}` as any)} accessibilityLabel={`تحدي اليوم: ${ch.title}`} padding={18}>
      <Row gap={14} align="flex-start">
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="label" tone="brand">
            تحدي اليوم
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {ch.title}
          </Text>
          <Text variant="bodySm" tone="secondary" numberOfLines={2}>
            {ch.description}
          </Text>
          <Row gap={6} style={{ marginTop: 4, justifyContent: 'flex-start' }}>
            <Tag label={languageLabel(ch.language) || ch.language} />
            <Tag label={d.label} tone={d.tone} />
            <Tag label={`+${ch.points} XP`} tone="xp" />
          </Row>
        </View>
        <Ionicons name="chevron-back" size={20} color="#8C8CA3" style={{ marginTop: 28 }} />
      </Row>
    </Surface>
  );
}

function LeaderboardMini({ users, meId }: { users: any[]; meId?: string | null }) {
  const t = useTheme();
  const router = useRouter();
  if (!users.length) return null;
  return (
    <View>
      <SectionHeader title="الصدارة" action="الترتيب الكامل" onAction={() => router.push('/leaderboard' as any)} />
      <Surface padding={0}>
        {users.map((u, i) => {
          const me = u.id === meId;
          return (
            <Pressable
              key={u.id}
              onPress={() => router.push(me ? '/profile' : (profilePath(u.id,u.username) as any))}
              accessibilityRole="link"
              accessibilityLabel={`${u.previewRank ? `المركز ${u.previewRank}` : `غير مصنف`}: ${u.full_name || u.username}، ${u.xp} XP`}
            >
              <Row
                gap={10}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderBottomWidth: i === users.length - 1 ? 0 : 1,
                  borderBottomColor: t.colors.border,
                  backgroundColor: me ? t.colors.brandSoft : 'transparent',
                }}
              >
                <Text variant="label" tone={u.previewRank && u.previewRank <= 3 ? 'xp' : 'muted'} weight="bold" tabular style={{ width: u.previewRank ? 24 : 66 }} align="center">
                  {u.previewRank ?? 'غير مصنف'}
                </Text>
                <Avatar uri={u.avatar_url} name={u.full_name || u.username} size={30} />
                <Row gap={2} style={{ flex: 1, justifyContent: 'flex-start' }}>
                  <Text variant="bodySm" weight="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {u.full_name || u.username}
                    {me ? ' (أنت)' : ''}
                  </Text>
                  <VerifiedBadge verified={u.is_verified} size={13} />
                </Row>
                <Text variant="caption" tone="secondary" tabular ltr>
                  {formatXp(u.xp || 0)} XP
                </Text>
              </Row>
            </Pressable>
          );
        })}
      </Surface>
    </View>
  );
}

function CoinsRow() {
  const t = useTheme();
  const router = useRouter();
  const { state } = useCoins() as any;
  return (
    <Surface onPress={() => router.push('/rewards')} accessibilityLabel={`رصيد الكوينات ${state?.balance ?? 0}، المكافآت`} padding={14}>
      <Row gap={12}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="label" weight="bold" tone="coin" align="center">
            K
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label">الكوينات والمكافآت</Text>
          <Text variant="caption" tone="muted">
            رصيدك {state?.balance ?? 0} · مكافأة يومية وأهداف
          </Text>
        </View>
        <Ionicons name="chevron-back" size={18} color={t.colors.textMuted} />
      </Row>
    </Surface>
  );
}

const useStyles = makeStyles((t) => ({
  header: { paddingTop: 8, paddingBottom: 10, gap: 2, width: '100%', maxWidth: t.layout.maxContent + 56, alignSelf: 'center' },
}));
