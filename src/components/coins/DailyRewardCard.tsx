/**
 * بطاقة مختصرة للمكافأة اليومية + رابط صفحة "اجمع الكوينات"
 * تُستخدم في الملف الشخصي والصفحة الرئيسية.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Surface, Row, Button, Text as DText, useTheme } from '@/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';

export default function DailyRewardCard() {
  const t = useTheme();
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
      showToast.success(`استلمت ${res.reward} كوين — مكافأة اليوم ${res.day}`);
    else showToast.info(coinMessage(res.code, res));
  };

  return (
    <Surface onPress={() => router.push('/rewards' as any)} accessibilityLabel="مكافأة اليوم والكوينات" padding={14}>
      <Row gap={12}>
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.successSoft }}>
          <Ionicons name="gift-outline" size={20} color={t.colors.successText} />
        </View>
        <View style={{ flex: 1 }}>
          <DText variant="label" weight="semibold">
            {d.claimedToday ? 'استلمت مكافأة اليوم' : 'مكافأة اليوم'}
          </DText>
          <DText variant="caption" tone="muted">
            {d.claimedToday ? `باجر: ${reward} كوين` : `اليوم ${dayNumber} من 7 · ${reward} كوين`}
            {!d.claimedToday && !canClaim ? ' · أكمل درساً أو تحدياً أولاً' : ''}
          </DText>
        </View>
        {d.claimedToday ? (
          <Ionicons name="checkmark-circle" size={22} color={t.colors.successText} accessibilityLabel="تم الاستلام" />
        ) : (
          <Button label={canClaim ? 'استلم' : 'تعلّم أولاً'} size="sm" variant={canClaim ? 'success' : 'secondary'} onPress={handlePress} loading={claiming} />
        )}
      </Row>
      <Row gap={6} style={{ marginTop: 12 }}>
        {d.rewards.map((r, i) => {
          const day = i + 1;
          const done = d.claimedToday ? day <= d.currentDay : day < d.nextDay;
          const today = !d.claimedToday && day === d.nextDay;
          return (
            <View
              key={day}
              accessible
              accessibilityLabel={`اليوم ${day}: ${r} كوين${done ? '، مستلمة' : today ? '، اليوم' : ''}`}
              style={{ flex: 1, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? t.colors.successSoft : t.colors.surfaceSunken, borderWidth: today ? 1.5 : 0, borderColor: t.colors.success }}
            >
              <DText variant="caption" weight="semibold" align="center" ltr tone={done ? 'success' : today ? 'default' : 'muted'} style={{ fontSize: 11 }}>
                {r}
              </DText>
            </View>
          );
        })}
      </Row>
    </Surface>
  );
}
