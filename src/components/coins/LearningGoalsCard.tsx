import { Col, Row, Text, Surface, Button, ProgressBar, Tag, ErrorState, ListSkeleton, useTheme } from '@/design';
/**
 * أهداف التعلم والسلسلة — من السيرفر فقط (progress_get_state).
 *
 * - السلسلة: نشاط موثّق (درس أو تحدٍ) بتوقيت بغداد. تفويت يوم لا يضيّع كل شيء:
 *   تجميد مجاني أسبوعياً + تجميد اختياري بالكوينات.
 * - هدف اليوم يختاره المستخدم (1/2/3 دروس أو تحديات)، وهدف الأسبوع 5 أيام من 7.
 * - المكافآت تُمنح على السيرفر تلقائياً عند تحقق الهدف (مرة واحدة).
 * - استخدامات اختيارية للكوينات: تجميد السلسلة، طلبات ذكاء إضافية.
 */
import React, { useCallback, useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { coinService, coinMessage, type ProgressState } from '@/services/coinService';
import { useCoins } from '@/contexts/CoinsContext';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon } from './CoinIcon';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export default function LearningGoalsCard() {
  const { refresh: refreshCoins } = useCoins();
  const [state, setState] = useState<ProgressState | null>(null);
  const [aiPack, setAiPack] = useState<{ price: number; amount: number; can_buy: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([coinService.getProgressState(), coinService.getAIQuota()]);
      setState(s);
      const packs = (q as any)?.packs;
      setAiPack(packs ? { price: packs.price, amount: packs.amount, can_buy: !!packs.can_buy } : null);
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    coinService.track('goal_screen_opened');
  }, [load]);

  const run = async (key: string, fn: () => Promise<any>, ok: (r: any) => string) => {
    setBusy(key);
    const r = await fn();
    setBusy(null);
    if (r.success) {
      showToast.success(ok(r));
      refreshCoins().catch(() => {});
      load();
    } else {
      showToast.error(coinMessage(r.code, r));
    }
  };

  const t = useTheme();
  if (loading && !state) return <ListSkeleton rows={2} />;
  if (!state)
    return (
      <Surface padding={16}>
        <ErrorState compact title="أهداف التعلّم" body="لم تُحمّل الأهداف بعد." onRetry={load} />
      </Surface>
    );
  const { streak, goals } = state;
  return (
    <Surface padding={18}>
      <Col gap={18}>
        <Row gap={12}>
          <Ionicons name="flame" size={28} color={t.colors.streak} />
          <Col flex={1} gap={2}>
            <Text variant="heading">
              سلسلة التعلم: {streak.current} {streak.current === 1 ? 'يوم' : 'أيام'}
            </Text>
            <Text variant="bodySm" tone="secondary">
              {streak.active_today ? 'تعلّمت اليوم — أحسنت!' : 'درس أو تحدٍّ اليوم يحافظ عليها.'} أفضل سلسلة: {streak.best}
            </Text>
          </Col>
        </Row>
        <Col gap={10} style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 16 }}>
          <Row justify="space-between" gap={8} wrap>
            <Text variant="heading">هدف اليوم</Text>
            <Tag label={goals.daily_rewarded ? 'استلمت المكافأة' : `${goals.daily_reward} كوين عند الإنجاز`} tone={goals.daily_rewarded ? 'success' : 'coin'} />
          </Row>
          <Text variant="bodySm" tone="secondary">
            أنجزت {goals.today_units} {goals.today_units === 1 ? 'درسًا أو تحديًا' : 'دروس أو تحديات'} · هدفك {goals.daily_target} باليوم
          </Text>
          <Row gap={10} accessibilityLabel={`هدف اليوم، ${goals.today_units} من ${goals.daily_target}`}>
            {Array.from({ length: goals.daily_target }, (_, i) => (
              <JourneyNode key={i} number={i + 1} state={i < goals.today_units ? 'completed' : i === goals.today_units ? 'current' : 'upcoming'} size={36} />
            ))}
          </Row>
          <Row gap={8} wrap>
            {goals.daily_options.map((n) => (
              <Button
                key={n}
                label={n === 1 ? 'خفيف · 1' : n === 2 ? 'عادي · 2' : 'جاد · 3'}
                variant={goals.daily_target === n ? 'primary' : 'secondary'}
                size="sm"
                disabled={busy !== null || goals.daily_target === n}
                loading={busy === 'goal' + n}
                onPress={() =>
                  run(
                    'goal' + n,
                    () => coinService.setDailyGoal(n),
                    () => `هدفك اليومي: ${n}`
                  )
                }
                style={{ flex: 1, minWidth: 70 }}
              />
            ))}
          </Row>
          <Row justify="space-between" gap={8} wrap style={{ marginTop: 8 }}>
            <Text variant="heading">هدف الأسبوع</Text>
            <Tag label={goals.weekly_rewarded ? 'مكتمل' : `${goals.weekly_reward} كوين عند الإنجاز`} tone={goals.weekly_rewarded ? 'success' : 'coin'} />
          </Row>
          <Text variant="bodySm" tone="secondary">
            تعلّمت {goals.week_active_days} أيام · المطلوب {goals.weekly_target_days} من أيام الأسبوع السبعة
          </Text>
          <Row gap={8} wrap accessibilityLabel={`هدف الأسبوع، ${goals.week_active_days} من ${goals.weekly_target_days} أيام`}>
            {Array.from({ length: goals.weekly_target_days }, (_, i) => (
              <JourneyNode key={i} number={i + 1} state={i < goals.week_active_days ? 'completed' : 'upcoming'} size={32} />
            ))}
          </Row>
          <Text variant="caption" tone="muted">
            أيام الراحة مسموحة. مكافأة الهدف تُضاف تلقائيًا مرة واحدة.
          </Text>
        </Col>
        <Col gap={8} style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 16 }}>
          <Text variant="bodySm" tone="info">
            تجميد السلسلة: عندك {streak.freezes} · الحد {streak.max_freezes}. يحميها إذا فاتك يوم، وتحصل على {streak.free_freezes_per_week} مجانًا كل أسبوع.
          </Text>
          {streak.freezes < streak.max_freezes && (
            <Button
              label={`تجميد إضافي · ${streak.freeze_price} كوين`}
              icon="snow-outline"
              variant="secondary"
              disabled={busy !== null}
              loading={busy === 'freeze'}
              onPress={() =>
                run(
                  'freeze',
                  () => coinService.buyStreakFreeze(),
                  () => 'تمت إضافة تجميد للسلسلة'
                )
              }
            />
          )}
        </Col>
        {aiPack && aiPack.price > 0 && (
          <Col gap={8} style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 16 }}>
            <Text variant="label" weight="semibold">
              طلبات إضافية للمساعد
            </Text>
            <Text variant="bodySm" tone="secondary">
              بعد حصتك المجانية، تقدر تستخدم الكوينات لحزمة {aiPack.amount} طلبات لليوم.
            </Text>
            <Button
              label={aiPack.can_buy ? `${aiPack.amount} طلبات · ${aiPack.price} كوين` : 'اشتريت حزمة اليوم'}
              variant="secondary"
              disabled={busy !== null || !aiPack.can_buy}
              loading={busy === 'ai'}
              onPress={() =>
                run(
                  'ai',
                  () => coinService.buyAiPack(),
                  () => `${aiPack.amount} طلبات إضافية لليوم`
                )
              }
            />
          </Col>
        )}
      </Col>
    </Surface>
  );
}
