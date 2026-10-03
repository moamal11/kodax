/**
 * اجمع الكوينات — مركز المكافآت في Kodax
 *
 * كل الكوينات مجانية وتُكتسب من النشاط فقط:
 *  - مكافأة يومية متصاعدة (7 أيام) عند التعلم يومياً
 *  - إعلانات Rewarded اختيارية (تُمنح المكافأة بعد اكتمال الإعلان فقط)
 *  - حل التحديات وإكمال الدورات
 * لا يوجد أي شراء أو اشتراك أو دفع.
 */


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon, COIN_COLORS } from '@/components/coins/CoinIcon';
import LearningGoalsCard from '@/components/coins/LearningGoalsCard';

const MAX_WIDTH = 720;

function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());
  const targetMs = target ? new Date(target).getTime() : 0;
  const remaining = Math.max(0, Math.ceil((targetMs - now) / 1000));
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [remaining > 0]);
  return remaining;
}

function SectionTitle({
  icon,
  title,
  color,
}: {
  icon: any;
  title: string;
  color: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={[styles.sectionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function RewardsScreen() {
  const router = useRouter();
  const {
    state,
    balance,
    isLoading,
    loadError,
    refresh,
    claimDailyReward,
    watchAd,
    adsSupported,
  } = useCoins();

  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [watching, setWatching] = useState(false);
  const [adNotice, setAdNotice] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const cooldown = useCountdown(state?.ads.nextAvailableAt ?? null);

  const handleClaim = async () => {
    setClaiming(true);
    const res = await claimDailyReward();
    setClaiming(false);
    if (res.success) {
      showToast.success(
        res.streak_reset
          ? `+${res.reward} كوين — بدأت سلسلة جديدة، استمر!`
          : `+${res.reward} كوين — مكافأة اليوم ${res.day}`
      );
    } else {
      showToast.info(coinMessage(res.code, res));
    }
  };

  const handleWatchAd = async () => {
    setWatching(true);
    setAdNotice(null);
    const res = await watchAd();
    setWatching(false);
    if (res.success) {
      const total = (res.reward ?? 0) + (res.bonus ?? 0);
      showToast.success(
        res.bonus
          ? `+${total} كوين! أكملت تحدي الإعلانات اليومي 🎉`
          : `+${total} كوين`
      );
    } else {
      setAdNotice(res.message ?? coinMessage(res.code));
    }
  };

  const daily = state?.daily;
  const ads = state?.ads;
  const ch = state?.challenges;

  // اليوم الذي تمثله مكافأة اليوم (أو الغد إذا استُلمت)
  const ladderDays = useMemo(() => {
    if (!daily) return [];
    return daily.rewards.map((reward, i) => {
      const day = i + 1;
      let status: 'done' | 'today' | 'future' = 'future';
      if (daily.claimedToday) {
        status = day <= daily.currentDay ? 'done' : 'future';
      } else {
        if (day < daily.nextDay) status = 'done';
        else if (day === daily.nextDay) status = 'today';
      }
      return { day, reward, status };
    });
  }, [daily]);

  const todayReward = daily ? (daily.rewards[daily.nextDay - 1] ?? 0) : 0;
  const weeklyTotal = daily ? daily.rewards.reduce((a, b) => a + b, 0) : 0;
  const adsLeft = ads ? Math.max(0, ads.limit - ads.watchedToday) : 0;

  // ===== Render helpers =====

  const renderHero = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient
        colors={['#2a1f4e', '#1a1a3e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <Text style={styles.heroLabel}>رصيدك</Text>
        <View style={styles.heroRow}>
          <CoinIcon size={40} />
          <Text style={styles.heroValue}>{balance.toLocaleString()}</Text>
        </View>
        <Text style={styles.heroSub}>كوين</Text>
        {state && state.lifetimeEarned > 0 && (
          <Text style={styles.heroMeta}>
            جمعت {state.lifetimeEarned.toLocaleString()} كوين منذ بدايتك
          </Text>
        )}
        <TouchableOpacity
          style={styles.heroCta}
          onPress={() => router.push('/learn' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-open" size={16} color="#C4B5FD" />
          <Text style={styles.heroCtaText}>للمزايا الاختيارية: فتح مبكر، تجميد السلسلة، طلبات ذكاء</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderHowItWorks = () => (
    <Animated.View
      entering={FadeInDown.delay(60).duration(400)}
      style={styles.howGrid}
    >
      {[
        {
          icon: 'calendar',
          color: '#10B981',
          title: 'مكافأة يومية',
          text: 'تعلّم كل يوم',
        },
        {
          icon: 'play-circle',
          color: COIN_COLORS.gold,
          title: 'إعلان اختياري',
          text: `+${ads?.reward ?? 15} لكل إعلان`,
        },
        {
          icon: 'code-slash',
          color: '#3B82F6',
          title: 'التحديات',
          text: 'حل تحدياً جديداً',
        },
        {
          icon: 'school',
          color: '#A78BFA',
          title: 'إكمال دورة',
          text: 'مكافأة عند الإنهاء',
        },
        {
          icon: 'trophy',
          color: '#F59E0B',
          title: 'أهداف وإنجازات',
          text: 'هدف اليوم والأسبوع',
        },
      ].map((it) => (
        <View key={it.title} style={styles.howItem}>
          <Ionicons name={it.icon as any} size={20} color={it.color} />
          <Text style={styles.howTitle}>{it.title}</Text>
          <Text style={styles.howText}>{it.text}</Text>
        </View>
      ))}
    </Animated.View>
  );

  const renderAds = () => {
    if (!ads) return null;
    const limitReached = adsLeft === 0;
    const disabled = watching || limitReached || cooldown > 0 || !adsSupported;
    return (
      <Animated.View
        entering={FadeInDown.delay(120).duration(400)}
        style={styles.card}
      >
        <SectionTitle
          icon="play-circle"
          title="شاهد إعلاناً"
          color={COIN_COLORS.gold}
        />
        <Text style={styles.cardText}>
          شاهد إعلاناً اختيارياً حتى النهاية واحصل على
          <Text style={styles.goldText}> +{ads.reward} كوين</Text>.
        </Text>

        {/* تحدي الإعلانات اليومي */}
        <View style={styles.adProgressBox}>
          <View style={styles.adProgressHeader}>
            <Text style={styles.adProgressTitle}>تحدي اليوم</Text>
            <Text style={styles.adProgressCount}>
              {ads.watchedToday} / {ads.limit}
            </Text>
          </View>
          <View style={styles.adSteps}>
            {Array.from({ length: ads.limit }).map((_, i) => {
              const done = i < ads.watchedToday;
              const isLast = i === ads.limit - 1;
              return (
                <View key={i} style={styles.adStep}>
                  <View
                    style={[
                      styles.adDot,
                      done && styles.adDotDone,
                      isLast && !done && styles.adDotBonus,
                    ]}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={14} color="#0f0f1e" />
                    ) : isLast && ads.bonus > 0 ? (
                      <Ionicons
                        name="gift"
                        size={13}
                        color={COIN_COLORS.gold}
                      />
                    ) : (
                      <Text style={styles.adDotText}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={styles.adStepReward}>
                    +{ads.reward + (isLast ? ads.bonus : 0)}
                  </Text>
                </View>
              );
            })}
          </View>
          {ads.bonus > 0 && (
            <Text style={styles.adRule}>
              أكمل {ads.limit} إعلانات اليوم لتحصل على
              <Text style={styles.goldText}>
                {' '}
                +{ads.bonus} إضافية
              </Text> (المجموع {ads.reward * ads.limit + ads.bonus} كوين).
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleWatchAd}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              disabled
                ? ['#374151', '#1F2937']
                : [COIN_COLORS.gold, COIN_COLORS.goldDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            {watching ? (
              <ActivityIndicator color="#1F2937" />
            ) : (
              <>
                <Ionicons
                  name={
                    limitReached
                      ? 'checkmark-done'
                      : cooldown > 0
                        ? 'time'
                        : 'play'
                  }
                  size={20}
                  color={disabled ? '#9CA3AF' : '#1F2937'}
                />
                <Text
                  style={[
                    styles.primaryText,
                    { color: disabled ? '#9CA3AF' : '#1F2937' },
                  ]}
                >
                  {!adsSupported
                    ? 'متاح في تطبيق الهاتف'
                    : limitReached
                      ? 'أكملت إعلانات اليوم — عُد غداً'
                      : cooldown > 0
                        ? `الإعلان التالي بعد ${cooldown} ث`
                        : `شاهد الإعلان +${ads.reward}`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {adNotice && (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={16} color="#FCD34D" />
            <Text style={styles.noticeText}>{adNotice}</Text>
          </View>
        )}

        <Text style={styles.finePrint}>
          الإعلانات اختيارية تماماً. تُمنح المكافأة فقط بعد اكتمال الإعلان، ولا
          تحتاج للضغط على الإعلان أو تثبيت أي تطبيق. الحد {ads.limit} إعلانات
          يومياً.
        </Text>
      </Animated.View>
    );
  };

  const renderDaily = () => {
    if (!daily) return null;
    const needsActivity =
      !daily.claimedToday && daily.requiresActivity && !daily.hasActivityToday;
    return (
      <Animated.View
        entering={FadeInDown.delay(180).duration(400)}
        style={styles.card}
      >
        <SectionTitle icon="calendar" title="مكافآت اليوم" color="#10B981" />
        <Text style={styles.cardText}>
          {daily.claimedToday
            ? `اليوم ${daily.currentDay} من 7 — استلمت مكافأتك. مكافأة الغد: +${daily.rewards[daily.currentDay % 7]} كوين`
            : `اليوم ${daily.nextDay} من 7 — مكافأتك اليوم +${todayReward} كوين`}
        </Text>

        {daily.streakBroken && !daily.claimedToday && (
          <View style={styles.noticeBox}>
            <Ionicons name="refresh" size={16} color="#FCD34D" />
            <Text style={styles.noticeText}>
              انقطعت سلسلة المكافآت، فبدأت من اليوم 1. تعلّم يومياً لتصل لمكافأة
              اليوم السابع!
            </Text>
          </View>
        )}

        <View style={styles.ladder}>
          {ladderDays.map(({ day, reward, status }) => (
            <View
              key={day}
              style={[
                styles.ladderRow,
                status === 'today' && styles.ladderRowToday,
                status === 'done' && styles.ladderRowDone,
              ]}
            >
              <View
                style={[
                  styles.ladderMark,
                  status === 'done' && styles.ladderMarkDone,
                  status === 'today' && styles.ladderMarkToday,
                ]}
              >
                {status === 'done' ? (
                  <Ionicons name="checkmark" size={14} color="#0f0f1e" />
                ) : status === 'today' ? (
                  <Ionicons name="arrow-back" size={14} color="#fff" />
                ) : (
                  <View style={styles.ladderEmpty} />
                )}
              </View>
              <Text
                style={[
                  styles.ladderDay,
                  status === 'future' && styles.ladderMuted,
                ]}
              >
                اليوم {day}
              </Text>
              <View style={styles.ladderRewardWrap}>
                {day === 7 && (
                  <Ionicons name="gift" size={16} color={COIN_COLORS.gold} />
                )}
                <Text
                  style={[
                    styles.ladderReward,
                    status === 'future' && styles.ladderMuted,
                  ]}
                >
                  +{reward}
                </Text>
                <CoinIcon size={14} />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.weekly}>
          🎁 أكمل الـ7 أيام متتالية: مجموع {weeklyTotal} كوين، ومكافأة اليوم
          السابع +{daily.rewards[6]}
        </Text>

        {daily.claimedToday ? (
          <View style={[styles.primaryBtn, styles.claimedBtn]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.primaryText, { color: '#10B981' }]}>
              تم الاستلام — عُد غداً
            </Text>
          </View>
        ) : needsActivity ? (
          <TouchableOpacity
            onPress={() => router.push('/learn' as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.primaryBtn, styles.outlineBtn]}>
              <Ionicons name="book" size={20} color="#A78BFA" />
              <Text style={[styles.primaryText, { color: '#C4B5FD' }]}>
                أكمل درساً أو تحدياً لفتح مكافأة اليوم
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleClaim}
            disabled={claiming}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {claiming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="gift" size={20} color="#fff" />
                  <Text style={styles.primaryText}>
                    استلم +{todayReward} كوين
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderStreak = () => {
    if (!state) return null;
    return (
      <Animated.View
        entering={FadeInDown.delay(240).duration(400)}
        style={styles.statsRow}
      >
        <View style={styles.statCard}>
          <Ionicons name="flame" size={22} color="#F97316" />
          <Text style={styles.statValue}>{state.learningStreak}</Text>
          <Text style={styles.statLabel}>يوم تعلّم متتالي</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={22} color={COIN_COLORS.gold} />
          <Text style={styles.statValue}>{state.daily.bestRun}</Text>
          <Text style={styles.statLabel}>أطول سلسلة مكافآت</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-number" size={22} color="#10B981" />
          <Text style={styles.statValue}>{state.daily.runDays}</Text>
          <Text style={styles.statLabel}>السلسلة الحالية</Text>
        </View>
      </Animated.View>
    );
  };

  const renderLearningRewards = () => {
    if (!ch || !state) return null;
    const capLeft = Math.max(0, ch.dailyCap - ch.earnedToday);
    return (
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.card}
      >
        <SectionTitle
          icon="code-slash"
          title="مكافآت التعلّم"
          color="#3B82F6"
        />
        <Text style={styles.cardText}>
          تُمنح مرة واحدة لكل تحدي جديد تحلّه ولكل دورة تكملها.
        </Text>
        <View style={styles.rewardTable}>
          {[
            { label: 'تحدي سهل', value: ch.easy, color: '#10B981' },
            { label: 'تحدي متوسط', value: ch.medium, color: '#F59E0B' },
            { label: 'تحدي صعب', value: ch.hard, color: '#EF4444' },
            {
              label: 'إكمال دورة مبتدئة',
              value: state.courseCompletion.beginner,
              color: '#A78BFA',
            },
            {
              label: 'إكمال دورة متوسطة',
              value: state.courseCompletion.intermediate,
              color: '#A78BFA',
            },
            {
              label: 'إكمال دورة متقدمة',
              value: state.courseCompletion.advanced,
              color: '#A78BFA',
            },
          ].map((r) => (
            <View key={r.label} style={styles.rewardRow}>
              <View style={[styles.rewardDot, { backgroundColor: r.color }]} />
              <Text style={styles.rewardLabel}>{r.label}</Text>
              <Text style={styles.rewardValue}>+{r.value}</Text>
              <CoinIcon size={14} />
            </View>
          ))}
        </View>
        <View style={styles.capBar}>
          <View
            style={[
              styles.capFill,
              {
                width: `${Math.min(100, (ch.earnedToday / Math.max(1, ch.dailyCap)) * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.finePrint}>
          كوينات التحديات اليوم: {ch.earnedToday} من {ch.dailyCap}
          {capLeft === 0 ? ' — وصلت للحد اليومي' : ''}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/challenges' as any)}
          style={[styles.primaryBtn, styles.outlineBtn, { marginTop: 12 }]}
          activeOpacity={0.85}
        >
          <Ionicons name="code-slash" size={18} color="#93C5FD" />
          <Text style={[styles.primaryText, { color: '#93C5FD' }]}>
            اذهب للتحديات
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHistory = () => {
    if (!state || state.recent.length === 0) return null;
    return (
      <Animated.View
        entering={FadeInDown.delay(360).duration(400)}
        style={styles.card}
      >
        <SectionTitle icon="time" title="آخر النشاطات" color="#9CA3AF" />
        {state.recent.map((t, i) => {
          const positive = t.type !== 'spent';
          return (
            <View key={`${t.created_at}-${i}`} style={styles.historyRow}>
              <Text
                style={[
                  styles.historyAmount,
                  { color: positive ? '#10B981' : '#F87171' },
                ]}
              >
                {positive ? '+' : '−'}
                {t.amount}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyReason} numberOfLines={1}>
                  {t.type === 'purchased'
                    ? 'رصيد سابق'
                    : t.reason || (positive ? 'مكافأة' : 'فتح محتوى')}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(t.created_at).toLocaleDateString('ar-IQ', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </Animated.View>
    );
  };

  const renderBody = () => {
    if (isLoading && !state) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COIN_COLORS.gold} />
          <Text style={styles.centerText}>جاري تحميل مكافآتك...</Text>
        </View>
      );
    }
    if (!state) {
      return (
        <View style={styles.center}>
          <Ionicons name="cloud-offline" size={48} color="#6B7280" />
          <Text style={styles.centerTitle}>تعذّر تحميل المكافآت</Text>
          <Text style={styles.centerText}>
            {coinMessage(loadError ?? 'network')}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={[
              styles.primaryBtn,
              styles.outlineBtn,
              { marginTop: 16, paddingHorizontal: 24 },
            ]}
          >
            <Ionicons name="refresh" size={18} color="#C4B5FD" />
            <Text style={[styles.primaryText, { color: '#C4B5FD' }]}>
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        {renderHero()}
        <LearningGoalsCard />
        {renderHowItWorks()}
        {renderDaily()}
        {renderAds()}
        {renderLearningRewards()}
        {renderHistory()}
        <Animated.View entering={ZoomIn.delay(400)} style={styles.footer}>
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          <Text style={styles.footerText}>
            التعلم في Kodax مجاني بالكامل. الكوينات اختيارية للمزايا والاختصارات، ولا يمكن شراؤها بالمال.
          </Text>
        </Animated.View>
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/(tabs)' as any)
            }
            accessibilityLabel="رجوع"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <CoinIcon size={24} />
            <Text style={styles.title}>اجمع الكوينات</Text>
          </View>
          {Platform.OS === 'web' ? (
            <TouchableOpacity style={styles.backButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COIN_COLORS.gold}
            />
          }
        >
          <View style={styles.inner}>{renderBody()}</View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 16 },

  hero: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  heroLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroValue: { color: '#FFF', fontSize: 48, fontWeight: '900' },
  heroSub: {
    color: COIN_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  heroMeta: { color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  heroCtaText: { color: '#C4B5FD', fontSize: 13, fontWeight: '600' },

  howGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  howItem: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  howTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginTop: 4 },
  howText: { color: '#9CA3AF', fontSize: 12 },

  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  cardText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 14,
  },
  goldText: { color: COIN_COLORS.text, fontWeight: '800' },

  adProgressBox: {
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
  },
  adProgressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  adProgressTitle: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  adProgressCount: { color: COIN_COLORS.text, fontWeight: '800', fontSize: 14 },
  adSteps: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  adStep: { alignItems: 'center', gap: 6, flex: 1 },
  adDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adDotDone: {
    backgroundColor: COIN_COLORS.gold,
    borderColor: COIN_COLORS.gold,
  },
  adDotBonus: { borderColor: COIN_COLORS.gold, borderStyle: 'dashed' },
  adDotText: { color: '#9CA3AF', fontWeight: '700', fontSize: 13 },
  adStepReward: { color: '#D1D5DB', fontSize: 12, fontWeight: '700' },
  adRule: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'right',
    lineHeight: 18,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    minHeight: 52,
  },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  outlineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    backgroundColor: 'rgba(139,92,246,0.08)',
  },
  claimedBtn: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  noticeBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  noticeText: {
    color: '#FDE68A',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
    lineHeight: 19,
  },
  finePrint: {
    color: '#6B7280',
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'right',
    marginTop: 10,
  },

  ladder: { gap: 6, marginBottom: 12 },
  ladderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: 10,
  },
  ladderRowToday: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  ladderRowDone: { backgroundColor: 'rgba(16,185,129,0.05)' },
  ladderMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ladderMarkDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  ladderMarkToday: { backgroundColor: '#10B981', borderColor: '#34D399' },
  ladderEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ladderDay: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  ladderMuted: { color: '#6B7280' },
  ladderRewardWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ladderReward: { color: COIN_COLORS.text, fontSize: 14, fontWeight: '800' },
  weekly: {
    color: '#9CA3AF',
    fontSize: 12.5,
    textAlign: 'right',
    marginBottom: 14,
    lineHeight: 19,
  },

  statsRow: { flexDirection: 'row-reverse', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#9CA3AF', fontSize: 11.5, textAlign: 'center' },

  rewardTable: { gap: 8 },
  rewardRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  rewardDot: { width: 8, height: 8, borderRadius: 4 },
  rewardLabel: { color: '#D1D5DB', fontSize: 14, flex: 1, textAlign: 'right' },
  rewardValue: { color: COIN_COLORS.text, fontWeight: '800', fontSize: 14 },
  capBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 14,
    overflow: 'hidden',
    transform: [{ scaleX: -1 }],
  },
  capFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },

  historyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'left',
  },
  historyReason: { color: '#E5E7EB', fontSize: 14, textAlign: 'right' },
  historyDate: {
    color: '#6B7280',
    fontSize: 11.5,
    textAlign: 'right',
    marginTop: 2,
  },

  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    flexShrink: 1,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  centerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 8 },
  centerText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center' },
});
