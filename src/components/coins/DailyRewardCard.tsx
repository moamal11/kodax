/**
 * بطاقة مختصرة للمكافأة اليومية + رابط صفحة "اجمع الكوينات"
 * تُستخدم في الملف الشخصي والصفحة الرئيسية.
 */

import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Surface, Row, Button, Text as DText, useTheme } from '@/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export default function DailyRewardCard({ detailed = false }: { detailed?: boolean }) {
  const t = useTheme();
  const router = useRouter();
  const { state, claimDailyReward } = useCoins();
  const [claiming, setClaiming] = useState(false);
  const [gridWidth, setGridWidth] = useState(0);
  const { fontScale } = useWindowDimensions();
  const cellWidth = 56 * fontScale;
  const columns = gridWidth >= 7 * (cellWidth + 6) ? 7 : Math.max(1, Math.min(4, gridWidth ? Math.floor(gridWidth / (cellWidth + 6)) : 4));

  if (!state) return null;
  const d = state.daily;
  const canClaim = !d.claimedToday && (!d.requiresActivity || d.hasActivityToday);
  const reward = d.claimedToday ? d.rewards[d.currentDay % 7] : d.rewards[d.nextDay - 1];
  const dayNumber = d.claimedToday ? d.currentDay : d.nextDay;

  const handlePress = async () => {
    if (!canClaim) {
      router.push('/learn' as any);
      return;
    }
    setClaiming(true);
    const res = await claimDailyReward();
    setClaiming(false);
    if (res.success) showToast.success(`استلمت ${res.reward} كوين — مكافأة اليوم ${res.day}`);
    else showToast.info(coinMessage(res.code, res));
  };

  return (
    <Surface onPress={detailed ? undefined : () => router.push('/rewards' as any)} accessibilityLabel="مكافأة اليوم والكوينات" padding={14}>
      <Row gap={12}>
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.successSoft }}>
          <Ionicons name="gift-outline" size={20} color={t.colors.successText} />
        </View>
        <View style={{ flex: 1 }}>
          <DText variant="label" weight="semibold">
            {d.claimedToday ? 'استلمت مكافأة اليوم' : canClaim ? 'مكافأتك جاهزة' : 'خطوتك القادمة'}
          </DText>
          <DText variant="caption" tone="muted">
            {d.claimedToday ? (detailed ? `اليوم ${dayNumber} من 7 · تم الاستلام` : `باجر: ${reward} كوين`) : `اليوم ${dayNumber} من 7 · ${reward} كوين`}
            {!d.claimedToday && !canClaim ? ' · أكمل درساً أو تحدياً أولاً' : ''}
          </DText>
        </View>
        {d.claimedToday ? (
          <Ionicons name="checkmark-circle" size={22} color={t.colors.successText} accessibilityLabel="تم الاستلام" />
        ) : (
          <Button label={canClaim ? 'استلم' : 'تعلّم أولاً'} size="sm" variant={canClaim ? 'success' : 'secondary'} onPress={handlePress} loading={claiming} />
        )}
      </Row>
      {detailed && (
        <DText variant="bodySm" tone="secondary" style={{ marginTop: 12 }}>
          {d.claimedToday
            ? `باجر: اليوم ${d.nextDay} · ${reward} كوين. كمّل نشاطك اليومي حتى تحافظ على التسلسل.`
            : canClaim
              ? `استلم ${reward} كوين اليوم، وارجع باجر للخطوة التالية.`
              : `أكمل درسًا أو تحديًا، ثم استلم ${reward} كوين مكافأة اليوم.`}
        </DText>
      )}
      <Row
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
        wrap={detailed}
        gap={detailed ? 0 : 6}
        style={{ marginTop: 12, rowGap: detailed ? 8 : undefined }}
      >
        {d.rewards.map((r, i) => {
          const day = i + 1;
          const done = d.claimedToday ? day <= d.currentDay : day < d.nextDay;
          const today = !d.claimedToday && day === d.nextDay;
          return (
            <View
              key={day}
              accessible
              accessibilityLabel={`اليوم ${day}: ${r} كوين${done ? '، مستلمة' : today ? '، اليوم' : '، قادمة'}`}
              style={{ flex: detailed ? undefined : 1, width: detailed ? `${100 / columns}%` : undefined, paddingHorizontal: detailed ? 3 : 0 }}
            >
              <View style={{ minHeight: detailed ? 104 : 40, paddingVertical: detailed ? 8 : 0, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 8, backgroundColor: today && detailed ? t.colors.brandSoft : 'transparent' }}>
                {detailed && <DText variant="caption" tone="secondary" align="center">اليوم {day}</DText>}
                {detailed && <JourneyNode state={done ? 'completed' : today ? 'current' : 'upcoming'} number={day} size={28} />}
                <DText variant="caption" weight="semibold" align="center" ltr={!detailed} tone={done ? 'xp' : today ? 'default' : 'secondary'}>
                  {detailed ? `${r} كوين` : r}
                </DText>
              </View>
            </View>
          );
        })}
      </Row>
    </Surface>
  );
}
