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
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coinService, coinMessage, type ProgressState } from '@/services/coinService';
import { useCoins } from '@/contexts/CoinsContext';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon } from './CoinIcon';

export default function LearningGoalsCard() {
  const { refresh: refreshCoins } = useCoins();
  const [state, setState] = useState<ProgressState | null>(null);
  const [aiPack, setAiPack] = useState<{ price: number; amount: number; can_buy: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, q] = await Promise.all([coinService.getProgressState(), coinService.getAIQuota()]);
    setState(s);
    const packs = (q as any)?.packs;
    setAiPack(packs ? { price: packs.price, amount: packs.amount, can_buy: !!packs.can_buy } : null);
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

  if (!state) return null;
  const { streak, goals } = state;
  const dailyPct = Math.min(100, Math.round((goals.today_units / Math.max(1, goals.daily_target)) * 100));
  const weekPct = Math.min(100, Math.round((goals.week_active_days / Math.max(1, goals.weekly_target_days)) * 100));

  return (
    <View style={styles.card}>
      {/* السلسلة */}
      <View style={styles.row}>
        <Ionicons name="flame" size={22} color="#F97316" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            سلسلة التعلم: {streak.current} {streak.current === 1 ? 'يوم' : 'أيام'}
          </Text>
          <Text style={styles.sub}>
            {streak.active_today
              ? 'تعلّمت اليوم — أحسنت!'
              : 'درس واحد أو تحدٍ واحد اليوم يكفي للحفاظ عليها.'}{' '}
            أفضل سلسلة: {streak.best}
          </Text>
        </View>
      </View>
      <View style={styles.freezeRow}>
        <Ionicons name="snow" size={16} color="#93C5FD" />
        <Text style={styles.freezeText}>
          تجميد السلسلة: {streak.freezes}/{streak.max_freezes} — يحمي سلسلتك إذا فاتك يوم
          (تحصل على {streak.free_freezes_per_week} مجاناً كل أسبوع).
        </Text>
      </View>
      {streak.freezes < streak.max_freezes && (
        <TouchableOpacity
          style={styles.smallBtn}
          disabled={busy !== null}
          onPress={() => run('freeze', () => coinService.buyStreakFreeze(), () => 'تمت إضافة تجميد للسلسلة ❄️')}
        >
          {busy === 'freeze' ? (
            <ActivityIndicator color="#C4B5FD" />
          ) : (
            <>
              <Text style={styles.smallBtnText}>تجميد إضافي (اختياري)</Text>
              <CoinIcon size={14} />
              <Text style={styles.smallBtnText}>{streak.freeze_price}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* هدف اليوم */}
      <Text style={styles.title}>هدف اليوم</Text>
      <Text style={styles.sub}>
        اختر هدفاً يناسبك (دروس أو تحديات): {goals.today_units}/{goals.daily_target}
        {goals.daily_rewarded ? ' — تحقق ✓' : goals.daily_reward > 0 ? ` — مكافأة ${goals.daily_reward} كوين` : ''}
      </Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${dailyPct}%` }]} />
      </View>
      <View style={styles.options}>
        {goals.daily_options.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.option, goals.daily_target === n && styles.optionActive]}
            disabled={busy !== null || goals.daily_target === n}
            onPress={() => run('goal' + n, () => coinService.setDailyGoal(n), () => `هدفك اليومي: ${n}`)}
          >
            <Text style={[styles.optionText, goals.daily_target === n && styles.optionTextActive]}>
              {n === 1 ? 'خفيف (1)' : n === 2 ? 'عادي (2)' : 'جاد (3)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* هدف الأسبوع */}
      <Text style={[styles.title, { marginTop: 12 }]}>هدف الأسبوع</Text>
      <Text style={styles.sub}>
        تعلّم {goals.weekly_target_days} أيام من 7 (أيام الراحة مسموحة): {goals.week_active_days}/
        {goals.weekly_target_days}
        {goals.weekly_rewarded ? ' — تحقق ✓' : goals.weekly_reward > 0 ? ` — مكافأة ${goals.weekly_reward} كوين` : ''}
      </Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${weekPct}%`, backgroundColor: '#8B5CF6' }]} />
      </View>

      {aiPack && aiPack.price > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.title}>طلبات ذكاء إضافية</Text>
          <Text style={styles.sub}>
            10 طلبات يومياً مجاناً. إذا احتجت أكثر: شاهد إعلانين (+3) من صفحة المساعد، أو استخدم
            الكوينات (+{aiPack.amount}).
          </Text>
          <TouchableOpacity
            style={[styles.smallBtn, !aiPack.can_buy && { opacity: 0.5 }]}
            disabled={busy !== null || !aiPack.can_buy}
            onPress={() => run('ai', () => coinService.buyAiPack(), () => `+${aiPack.amount} طلبات ذكاء لليوم`)}
          >
            {busy === 'ai' ? (
              <ActivityIndicator color="#C4B5FD" />
            ) : (
              <>
                <Text style={styles.smallBtnText}>
                  {aiPack.can_buy ? `+${aiPack.amount} طلبات اليوم` : 'اشتريت حزمة اليوم'}
                </Text>
                {aiPack.can_buy && (
                  <>
                    <CoinIcon size={14} />
                    <Text style={styles.smallBtnText}>{aiPack.price}</Text>
                  </>
                )}
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  title: { color: '#F3F4F6', fontSize: 15, fontWeight: '700', textAlign: 'right' },
  sub: { color: '#9CA3AF', fontSize: 13, lineHeight: 20, textAlign: 'right' },
  freezeRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  freezeText: { color: '#BFDBFE', fontSize: 12, lineHeight: 19, textAlign: 'right', flex: 1 },
  smallBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.4)',
    marginTop: 6,
  },
  smallBtnText: { color: '#C4B5FD', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 4 },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  options: { flexDirection: 'row-reverse', gap: 8, marginTop: 8 },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  optionActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10B981' },
  optionText: { color: '#D1D5DB', fontSize: 12 },
  optionTextActive: { color: '#6EE7B7', fontWeight: '700' },
});
