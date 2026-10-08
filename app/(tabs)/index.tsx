/**
 * الرئيسية = «اليوم»: تابع من حيث توقفت، هدف اليوم وأسبوعك، تحدي اليوم، ولمحة من المجتمع والصدارة.
 * كل الأرقام من السيرفر (progress_get_state، user_activity_days، daily_challenge_get).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, View, Pressable } from 'react-native';
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
import { getPublicSnippets, type FeedSnippet } from '@/services/codeFeedService';
import { supabaseService } from '@/services/supabaseService';
import { coinService } from '@/services/coinService';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

function greeting(): string {
  const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Baghdad' }));
  if (h >= 5 && h < 12) return 'صباح الخير';
  if (h >= 12 && h < 18) return 'مساء الخير';
  return 'مساء النور';
}

const DIFF: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  easy: { label: 'سهل', tone: 'success' },
  medium: { label: 'متوسط', tone: 'warning' },
  hard: { label: 'صعب', tone: 'danger' },
};

export default function HomeScreen() {
  const t = useTheme();
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
    const [feed, leaders] = await Promise.all([getPublicSnippets({ limit: 2, sortBy: 'recent' }), supabaseService.getLeaderboard(5)]);
    setSnippets(feed.data ?? []);
    setTop(leaders ?? []);
  }, []);
  useEffect(() => {
    loadSide();
  }, [loadSide]);
  // العودة من درس/تحدٍّ: تحديث التقدم
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadSide()]);
    setRefreshing(false);
  };

  const name = (fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '').split(' ')[0];

  const streakLine = data
    ? data.streak.current > 0
      ? `سلسلتك ${data.streak.current} ${data.streak.current === 1 ? 'يوم' : data.streak.current <= 10 ? 'أيام' : 'يوم'}${data.streak.activeToday ? ' · تعلّمت اليوم' : ' · لا تكسرها اليوم'}`
      : 'ابدأ سلسلتك اليوم بدرس واحد'
    : ' ';

  const header = (
    <View style={[s.header, { paddingHorizontal: isDesktop ? 28 : 16 }]}>
      <Row gap={4}>
        <Text variant="title" numberOfLines={1} accessibilityRole="header" style={{ flex: 1 }}>
          {greeting()}{name ? `، ${name}` : ''}
        </Text>
        {userId && <MessagesButton userId={userId} />}
        {userId && <NotificationButton userId={userId} onNotificationPress={(n) => n.metadata?.navigateTo && router.push(n.metadata.navigateTo)} />}
      </Row>
      <Row gap={10} justify="space-between">
        <Row gap={6} style={{ flexShrink: 1 }}>
          <Ionicons name="flame" size={16} color={data?.streak.activeToday ? t.colors.streak : t.colors.textMuted} />
          <Text variant="bodySm" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
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
          <ContinueCard data={data} />
          <TodayCard data={data} />
          {data.dailyChallenge && <DailyChallengeCard ch={data.dailyChallenge} />}
        </>
      ) : null}

      {snippets.length > 0 && (
        <View>
          <SectionHeader title="جديد من المجتمع" action="كل الأكواد" onAction={() => router.push('/code')} />
          <View style={{ gap: 12, flexDirection: isDesktop ? 'row-reverse' : 'column' }}>
            {snippets.map((sn) => (
              <View key={sn.id} style={{ flex: isDesktop ? 1 : undefined }}>
                <SnippetCard snippet={sn} previewLines={4} onPress={() => router.push(`/code/${sn.id}` as any)} onAuthorPress={() => router.push(`/user/${sn.user_id}` as any)} />
              </View>
            ))}
          </View>
        </View>
      )}
    </Col>
  );

  const side = (
    <Col gap={20} style={isDesktop ? { width: 320 } : undefined}>
      <LeaderboardMini users={top} meId={userId} />
      <CoinsRow />
    </Col>
  );

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

function ContinueCard({ data }: { data: LearningSnapshot }) {
  const t = useTheme();
  const router = useRouter();
  const { isPhone } = useBreakpoint();
  const n = data.next;
  if (!n) {
    return (
      <Surface variant="success" padding={20}>
        <Text variant="heading">خلّصت كل دروس هذا المسار 🎉</Text>
        <Text variant="bodySm" tone="secondary" style={{ marginTop: 4 }}>
          اختر مساراً جديداً أو ثبّت ما تعلمته بالتحديات.
        </Text>
        <Row gap={8} style={{ marginTop: 14 }}>
          <Button label="اختر مساراً" onPress={() => router.push('/learn' as any)} />
          <Button label="التحديات" variant="secondary" onPress={() => router.push('/challenges')} />
        </Row>
      </Surface>
    );
  }
  const started = n.done > 0;
  return (
    <Surface padding={0} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 18, gap: 10 }}>
        <Row justify="space-between" gap={8}>
          <Text variant="label" tone="brand">
            {started ? 'تابع من حيث توقفت' : 'ابدأ من هنا'}
          </Text>
          <Text variant="caption" tone="muted" tabular>
            الدرس {n.done + 1} من {n.total}
          </Text>
        </Row>
        <View style={{ gap: 2 }}>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {n.course.title}
          </Text>
          <Text variant="title" numberOfLines={2}>
            {n.lesson.title}
          </Text>
          {!!n.lesson.description && (
            <Text variant="bodySm" tone="secondary" numberOfLines={2}>
              {n.lesson.description}
            </Text>
          )}
        </View>
        <ProgressBar value={n.done / Math.max(1, n.total)} label={`تقدم الدورة ${n.done} من ${n.total}`} />
        {!!n.lesson.codeExample && !isPhone && <CodeView code={n.lesson.codeExample} language={n.lesson.language ?? 'python'} maxLines={4} size="sm" lineNumbers={false} />}
        <Row gap={8} wrap style={{ marginTop: 4 }}>
          {n.locked ? (
            <>
              <Button label="افتح الدورة" icon="lock-closed-outline" onPress={() => router.push(`/course/${n.course.id}` as any)} />
              {n.requiresCourse && (
                <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                  تُفتح بعد التقدم في «{n.requiresCourse.title}»
                </Text>
              )}
            </>
          ) : (
            <Button label={started ? 'كمّل الدرس' : 'ابدأ الدرس'} icon="play" onPress={() => router.push(`/lesson/${n.lesson.id}` as any)} size="lg" />
          )}
          <Button label="الدورة" variant="ghost" onPress={() => router.push(`/course/${n.course.id}` as any)} />
        </Row>
      </View>
    </Surface>
  );
}

function TodayCard({ data }: { data: LearningSnapshot }) {
  const t = useTheme();
  const g = data.goal;
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
      <ProgressBar value={g.units / Math.max(1, g.target)} tone="success" style={{ marginTop: 12 }} label="هدف اليوم" />
      <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 16 }} />
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Text variant="label" tone="secondary">
          آخر 7 أيام
        </Text>
        <Text variant="caption" tone="muted">
          هذا الأسبوع {g.weekDays} من {g.weekTarget} أيام
        </Text>
      </Row>
      <Row justify="space-between" gap={4}>
        {data.week.map((d) => (
          <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`${d.isToday ? 'اليوم، ' : ''}${d.label}: ${d.active ? 'تعلمت' : d.frozen ? 'مجمّد' : 'بلا نشاط'}`}>
            <View
              style={{
                width: '100%',
                maxWidth: 40,
                aspectRatio: 1,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: d.active ? t.colors.successSoft : t.colors.surfaceSunken,
                borderWidth: d.isToday ? 1.5 : 1,
                borderColor: d.isToday ? t.colors.borderStrong : 'transparent',
              }}
            >
              {d.active ? <Ionicons name="checkmark" size={18} color={t.colors.successText} /> : d.frozen ? <Ionicons name="snow-outline" size={16} color={t.colors.infoText} /> : null}
            </View>
            <Text variant="caption" tone={d.isToday ? 'default' : 'muted'} weight={d.isToday ? 'semibold' : 'regular'} align="center" numberOfLines={1} style={{ fontSize: 11 }}>
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
            <Pressable key={u.id} onPress={() => router.push(me ? '/profile' : (`/user/${u.id}` as any))} accessibilityRole="link" accessibilityLabel={`المركز ${i + 1}: ${u.full_name || u.username}، ${u.xp} XP`}>
              <Row gap={10} style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: i === users.length - 1 ? 0 : 1, borderBottomColor: t.colors.border, backgroundColor: me ? t.colors.brandSoft : 'transparent' }}>
                <Text variant="label" tone={i < 3 ? 'xp' : 'muted'} weight="bold" tabular style={{ width: 20 }} align="center">
                  {i + 1}
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
