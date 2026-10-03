/**
 * بطاقة مختصرة للمكافأة اليومية + رابط صفحة "اجمع الكوينات"
 * تُستخدم في الملف الشخصي والصفحة الرئيسية.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon, COIN_COLORS } from './CoinIcon';

export default function DailyRewardCard() {
  const router = useRouter();
  const { state, claimDailyReward } = useCoins();
  const [claiming, setClaiming] = useState(false);

  if (!state) return null;
  const d = state.daily;
  const canClaim =
    !d.claimedToday && (!d.requiresActivity || d.hasActivityToday);
  const reward = d.claimedToday
    ? d.rewards[d.currentDay % 7]
    : d.rewards[d.nextDay - 1];
  const dayNumber = d.claimedToday ? d.currentDay : d.nextDay;

  const handlePress = async () => {
    if (!canClaim) {
      router.push('/rewards' as any);
      return;
    }
    setClaiming(true);
    const res = await claimDailyReward();
    setClaiming(false);
    if (res.success)
      showToast.success(`+${res.reward} كوين — مكافأة اليوم ${res.day}`);
    else showToast.info(coinMessage(res.code, res));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/rewards' as any)}
    >
      <LinearGradient
        colors={['rgba(16,185,129,0.14)', 'rgba(245,158,11,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="gift" size={22} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {d.claimedToday ? 'استلمت مكافأة اليوم' : 'مكافأة اليوم'}
            </Text>
            <Text style={styles.subtitle}>
              {d.claimedToday
                ? `غداً: +${reward} كوين`
                : `اليوم ${dayNumber} من 7 — +${reward} كوين`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePress}
            disabled={claiming || d.claimedToday}
            style={[styles.btn, canClaim ? styles.btnActive : styles.btnMuted]}
          >
            {claiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.btnText, !canClaim && { color: '#9CA3AF' }]}>
                {d.claimedToday ? '✓' : canClaim ? 'استلم' : 'تعلّم أولاً'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dots}>
          {d.rewards.map((r, i) => {
            const day = i + 1;
            const done = d.claimedToday ? day <= d.currentDay : day < d.nextDay;
            const today = !d.claimedToday && day === d.nextDay;
            return (
              <View
                key={day}
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  today && styles.dotToday,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    (done || today) && { color: '#0f0f1e' },
                  ]}
                >
                  {day === 7 ? '🎁' : r}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <CoinIcon size={14} />
          <Text style={styles.footerText}>اجمع المزيد من الكوينات</Text>
          <Ionicons name="chevron-back" size={14} color={COIN_COLORS.text} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  topRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'right' },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12.5,
    textAlign: 'right',
    marginTop: 2,
  },
  btn: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: '#10B981' },
  btnMuted: { backgroundColor: 'rgba(255,255,255,0.06)' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  dots: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 4,
  },
  dot: {
    flex: 1,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: '#10B981' },
  dotToday: { backgroundColor: COIN_COLORS.gold },
  dotText: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  footerText: { color: COIN_COLORS.text, fontSize: 12.5, fontWeight: '600' },
});
