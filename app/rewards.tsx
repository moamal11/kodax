import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useBadges } from '@/contexts/BadgeContext';
import { ProgressionOverview } from '@/features/rewards/ProgressionOverview';
import { NextBadgeGoal } from '@/features/rewards/NextBadgeGoal';
import { BadgesSummary, BadgesSheet } from '@/features/rewards/Badges';
import { coinService, type ProgressState } from '@/services/coinService';
import { hybridSyncService } from '@/services/hybridSyncService';
/**
 * الكوينات والمكافآت: الرصيد وما ينفع له، الأهداف، المكافأة اليومية، مكافآت التعلم،
 * الإعلانات الاختيارية (اسمها واضح ولا يلتبس بالتحديات البرمجية — F27)، والسجل بأسماء مفهومة (F15).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import LearningGoalsCard from '@/components/coins/LearningGoalsCard';
import DailyRewardCard from '@/components/coins/DailyRewardCard';
import { Screen, AppBar, Text, Row, Col, Surface, Button, ProgressBar, SectionHeader, ErrorState, ListSkeleton, Tag, useTheme, useBreakpoint } from '@/design';
import { transactionLabel } from '@/features/rewards/achievements';

function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());
  const remaining = Math.max(0, Math.ceil(((target ? new Date(target).getTime() : 0) - now) / 1000));
  useEffect(() => {
    if (remaining <= 0) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [remaining > 0]);
  return remaining;
}

export default function RewardsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const { userId } = useAuth();
  const { profile, refreshProfile } = useApp();
  const { earnedBadgeIds, refreshBadges } = useBadges();
  const [badges, setBadges] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<number | null>(null);

  const { state, balance, isLoading, loadError, refresh, watchAd, adsSupported } = useCoins();
  const [refreshing, setRefreshing] = useState(false);
  const [watching, setWatching] = useState(false);
  const [adNotice, setAdNotice] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      refresh();
      refreshProfile();
      refreshBadges();
      coinService
        .getProgressState()
        .then((p) => {
          if (alive) setProgress(p);
        })
        .catch(() => {
          if (alive) setProgress(null);
        });
      if (userId) {
        (async () => {
          await hybridSyncService.setUser(userId);
          return hybridSyncService.fetchCompletedChallengesOnly();
        })()
          .then((ids) => {
            if (alive) setCompletedChallenges(ids.length);
          })
          .catch(() => {
            if (alive) setCompletedChallenges(null);
          });
      }
      return () => {
        alive = false;
      };
    }, [refresh, refreshProfile, refreshBadges, userId])
  );
  const cooldown = useCountdown(state?.ads.nextAvailableAt ?? null);

  const handleWatchAd = async () => {
    setWatching(true);
    setAdNotice(null);
    const res = await watchAd();
    setWatching(false);
    if (res.success) {
      const total = (res.reward ?? 0) + (res.bonus ?? 0);
      showToast.success(res.bonus ? `حصلت على ${total} كوين، وأكملت إعلانات اليوم` : `حصلت على ${total} كوين`);
    } else setAdNotice(res.message ?? coinMessage(res.code));
  };

  if (!state) {
    return (
      <Screen width="reading" header={<AppBar title="المكافآت والمستويات" fallback="/profile" />}>
        {isLoading ? <ListSkeleton rows={3} /> : <ErrorState body={coinMessage(loadError ?? 'network')} onRetry={refresh} />}
      </Screen>
    );
  }

  const ads = state.ads;
  const ch = state.challenges;
  const adsLeft = Math.max(0, ads.limit - ads.watchedToday);
  const adDisabled = watching || adsLeft === 0 || cooldown > 0 || !adsSupported;

  const hero = (
    <Surface padding={18}>
      <Row justify="space-between" align="flex-end">
        <View>
          <Text variant="label" tone="secondary">
            رصيدك
          </Text>
          <Row gap={8} style={{ justifyContent: 'flex-start' }}>
            <Text variant="display" weight="bold" tone="coin" tabular ltr>
              {balance.toLocaleString('en-US')}
            </Text>
            <Text variant="heading" tone="secondary">
              كوين
            </Text>
          </Row>
        </View>
        {state.lifetimeEarned > 0 && (
          <Text variant="caption" tone="muted">
            جمعت {state.lifetimeEarned.toLocaleString('en-US')} منذ بدايتك
          </Text>
        )}
      </Row>
      <Text variant="bodySm" tone="secondary" style={{ marginTop: 10 }}>
        التعلم مجاني بالكامل. الكوينات للاختصارات فقط: فتح مبكر لدورة، تجميد السلسلة، أو طلبات ذكاء إضافية. لا تُشترى بالمال.
      </Text>
    </Surface>
  );

  const learning = (
    <View>
      <SectionHeader title="مكافآت التعلّم" subtitle="مرة واحدة لكل تحدٍّ جديد ولكل دورة تكملها" />
      <Surface padding={14}>
        <Col gap={8}>
          {[
            ['تحدٍّ سهل', ch.easy],
            ['تحدٍّ متوسط', ch.medium],
            ['تحدٍّ صعب', ch.hard],
            ['إكمال دورة مبتدئة', state.courseCompletion.beginner],
            ['إكمال دورة متوسطة', state.courseCompletion.intermediate],
            ['إكمال دورة متقدمة', state.courseCompletion.advanced],
          ].map(([label, v]) => (
            <Row key={String(label)} justify="space-between">
              <Text variant="bodySm">{label}</Text>
              <Text variant="label" tone="coin" tabular>
                {v} كوين
              </Text>
            </Row>
          ))}
        </Col>
        <ProgressBar value={ch.earnedToday / Math.max(1, ch.dailyCap)} tone="warning" style={{ marginTop: 14 }} label="كوينات التحديات اليوم" />
        <Text variant="caption" tone="muted" style={{ marginTop: 6 }}>
          كوينات التحديات اليوم: {ch.earnedToday} من {ch.dailyCap}
          {ch.earnedToday >= ch.dailyCap ? ' — وصلت للحد اليومي' : ''}
        </Text>
        <Button
          label="حلّ تحديًا واجمع كوينات"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/learn?tab=challenges' as any)}
          style={{ alignSelf: 'flex-start', marginTop: 10 }}
        />
      </Surface>
    </View>
  );

  const adsCard = (
    <View>
      <SectionHeader title="مكافأة الإعلانات (اختيارية)" subtitle={`${ads.reward} كوين لكل إعلان مكتمل · حتى ${ads.limit} يومياً`} />
      <Surface padding={14}>
        <Row gap={6}>
          {Array.from({ length: ads.limit }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < ads.watchedToday ? t.colors.coin : t.colors.surfaceSunken }} />
          ))}
        </Row>
        <Text variant="caption" tone="muted" style={{ marginTop: 6 }}>
          شاهدت {ads.watchedToday} من {ads.limit} اليوم{ads.bonus > 0 ? ` · مكافأة إضافية ${ads.bonus} كوين عند إكمالها كلها` : ''}
        </Text>
        <Button
          label={
            !adsSupported
              ? 'متاح في تطبيق Android'
              : adsLeft === 0
                ? 'أكملت إعلانات اليوم'
                : cooldown > 0
                  ? `الإعلان التالي بعد ${cooldown} ث`
                  : `شاهد إعلاناً (+${ads.reward})`
          }
          icon={adsLeft === 0 ? 'checkmark-done' : 'play-circle-outline'}
          variant="secondary"
          onPress={handleWatchAd}
          disabled={adDisabled}
          loading={watching}
          style={{ marginTop: 12 }}
        />
        {!!adNotice && (
          <Text variant="caption" tone="warning" style={{ marginTop: 8 }}>
            {adNotice}
          </Text>
        )}
        <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
          تُمنح المكافأة بعد اكتمال الإعلان فقط، ولا تحتاج للضغط عليه أو تثبيت أي تطبيق.
        </Text>
      </Surface>
    </View>
  );

  const history = state.recent.length > 0 && (
    <View>
      <SectionHeader title="آخر الحركات" />
      <Surface padding={0}>
        {state.recent.map((tr, i) => {
          const plus = tr.type !== 'spent';
          return (
            <Row key={i} gap={10} style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
              <View style={{ flex: 1 }}>
                <Text variant="body" numberOfLines={1}>
                  {transactionLabel(tr)}
                </Text>
                <Text variant="caption" tone="muted">
                  {new Date(tr.created_at).toLocaleDateString('ar-IQ-u-nu-latn', { day: 'numeric', month: 'short', timeZone: 'Asia/Baghdad' })}
                </Text>
              </View>
              <Tag label={`${plus ? '+' : '−'}${tr.amount}`} tone={plus ? 'success' : 'danger'} />
            </Row>
          );
        })}
      </Surface>
    </View>
  );

  return (
    <Screen
      header={<AppBar title="المكافآت والمستويات" fallback="/profile" />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }}
          tintColor={t.colors.brand}
        />
      }
    >
      {isDesktop ? (
        <Row align="flex-start" gap={24}>
          <Col gap={20} flex={1}>
            <BadgesSummary title="معرض الشارات" earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
            {progress && profile?.xp != null && completedChallenges != null && (
              <NextBadgeGoal earnedIds={earnedBadgeIds} progress={progress} xp={Number(profile.xp)} completedChallenges={completedChallenges} />
            )}
            <DailyRewardCard detailed />
            <LearningGoalsCard />
            {history}
          </Col>
          <Col gap={20} style={{ width: 300 }}>
            {profile?.xp != null && <ProgressionOverview xp={Number(profile.xp)} />}
            {hero}
            {learning}
            {adsCard}
          </Col>
        </Row>
      ) : (
        <Col gap={20}>
          <BadgesSummary title="معرض الشارات" earnedIds={earnedBadgeIds} onOpen={() => setBadges(true)} />
          {progress && profile?.xp != null && completedChallenges != null && (
            <NextBadgeGoal earnedIds={earnedBadgeIds} progress={progress} xp={Number(profile.xp)} completedChallenges={completedChallenges} />
          )}
          {profile?.xp != null && <ProgressionOverview xp={Number(profile.xp)} compact />}
          <DailyRewardCard detailed />
          <LearningGoalsCard />
          {hero}
          {learning}
          {adsCard}
          {history}
        </Col>
      )}
      <BadgesSheet visible={badges} onClose={() => setBadges(false)} earnedIds={earnedBadgeIds} />
    </Screen>
  );
}
