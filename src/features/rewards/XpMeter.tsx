/**
 * عداد XP والمستوى — هدف شرارات المكافأة. يظهر في رأس الصفحات وفي الشريط الجانبي على Desktop.
 * القيمة: XP الملف الشخصي (من السيرفر)، أو القيمة المتحركة أثناء احتفال مكافأة.
 */
import React, { useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme, useReducedMotion, Text, Row, ProgressBar } from '@/design';
import { useApp } from '@/contexts/AppContext';
import { useRewards } from './RewardLayer';
import { formatXp, levelProgress } from './level';

export function useShownXp(): number {
  const { profile } = useApp();
  const { displayXp } = useRewards();
  return displayXp ?? Number((profile as any)?.xp ?? 0);
}

type Props = {
  /** compact: كبسولة صغيرة للرأس؛ full: بطاقة بالشريط والأرقام */
  variant?: 'compact' | 'full';
  /** الضغط يفتح صفحة المكافآت */
  link?: boolean;
};

export function XpMeter({ variant = 'compact', link = true }: Props) {
  const t = useTheme();
  const router = useRouter();
  const reduced = useReducedMotion();
  const xp = useShownXp();
  const { arrival, levelUp, registerTarget } = useRewards();
  const ref = useRef<View>(null);
  const pulse = useSharedValue(1);
  const p = levelProgress(xp);

  useEffect(() => registerTarget(ref), [registerTarget]);
  useEffect(() => {
    if (arrival && !reduced) pulse.value = withSequence(withTiming(1.08, { duration: 90 }), withTiming(1, { duration: 160 }));
  }, [arrival, reduced]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const a11y = `المستوى ${p.level}، ${formatXp(xp)} نقطة خبرة، باقي ${formatXp(p.remaining)} للمستوى التالي`;
  const glow = levelUp ? { borderColor: t.colors.xp } : null;

  const body =
    variant === 'compact' ? (
      <Animated.View ref={ref as any} collapsable={false} style={[{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, height: 36, paddingHorizontal: 10, borderRadius: 18, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }, glow, st]}>
        <View style={{ minWidth: 22, height: 22, paddingHorizontal: 4, borderRadius: 6, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" weight="bold" tone="xp" align="center" ltr tabular style={{ fontSize: 12, lineHeight: 16 }}>
            {p.level}
          </Text>
        </View>
        <View style={{ width: 52 }}>
          <ProgressBar value={p.ratio} tone="xp" height={4} />
        </View>
        <Text variant="caption" weight="semibold" ltr tabular style={{ color: t.colors.text }}>
          {formatXp(xp)}
        </Text>
      </Animated.View>
    ) : (
      <Animated.View ref={ref as any} collapsable={false} style={[{ gap: 8, padding: 12, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }, glow, st]}>
        <Row justify="space-between">
          <Row gap={8}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="label" weight="bold" tone="xp" align="center" ltr tabular>
                {p.level}
              </Text>
            </View>
            <Text variant="label" weight="semibold">
              المستوى {p.level}
            </Text>
          </Row>
          <Text variant="caption" tone="muted" ltr tabular>
            {formatXp(xp)} / {formatXp(p.next)}
          </Text>
        </Row>
        <ProgressBar value={p.ratio} tone="xp" height={6} />
        <Text variant="caption" tone="muted">
          باقي {formatXp(p.remaining)} XP للمستوى {p.level + 1}
        </Text>
      </Animated.View>
    );

  if (!link) return <View accessible accessibilityLabel={a11y}>{body}</View>;
  return (
    <Pressable onPress={() => router.push('/rewards' as any)} accessibilityRole="button" accessibilityLabel={a11y} accessibilityHint="يفتح صفحة المكافآت">
      {body}
    </Pressable>
  );
}
