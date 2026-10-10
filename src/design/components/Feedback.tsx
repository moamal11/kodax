import React, { useEffect } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useReducedMotion } from '../hooks';
import { Text, toneColor, type Tone } from './Text';
import { Button, type IconName } from './Button';
import { Col, Row } from './Layout';

/* ---------------- ProgressBar ---------------- */
export function ProgressBar({ value, tone = 'brand', height = 6, label, style, animated = true }: { value: number; tone?: 'brand' | 'xp' | 'success' | 'warning'; height?: number; label?: string; style?: StyleProp<ViewStyle>; animated?: boolean }) {
  const t = useTheme();
  const c = t.colors;
  const reduced = useReducedMotion();
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const w = useSharedValue(v);
  useEffect(() => {
    w.value = animated && !reduced ? withTiming(v, { duration: t.motion.enter, easing: Easing.out(Easing.cubic) }) : v;
  }, [v, animated, reduced]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  const color = { brand: c.brand, xp: t.mode === 'light' ? '#D1A246' : c.xp, success: c.success, warning: c.warning }[tone];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={[{ height, borderRadius: height, backgroundColor: c.surfaceSunken, overflow: 'hidden', flexDirection: 'row-reverse' }, style]}
    >
      <Animated.View style={[{ height: '100%', borderRadius: height, backgroundColor: color }, fill]} />
    </View>
  );
}

/* ---------------- Avatar ---------------- */
const AVATAR_TINTS = ['#7C5CFA', '#2E9E6B', '#D9822B', '#2F7FD6', '#C2457A', '#5B8C2A'];
export function Avatar({ uri, name, size = 40 }: { uri?: string | null; name?: string | null; size?: number }) {
  const t = useTheme();
  const initial = (name ?? '?').trim().charAt(0) || '?';
  const tint = AVATAR_TINTS[[...(name ?? '?')].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_TINTS.length];
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.colors.surfaceRaised }} accessibilityIgnoresInvertColors accessible={false} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint + '33', borderWidth: 1, borderColor: tint + '66', alignItems: 'center', justifyContent: 'center' }} accessible={false}>
      <Text weight="bold" align="center" style={{ color: tint === '#7C5CFA' ? t.colors.brandText : tint, fontSize: size * 0.42, lineHeight: size * 0.56 }}>
        {initial}
      </Text>
    </View>
  );
}

/* ---------------- Tag (وسم صغير) ---------------- */
export function Tag({ label, tone = 'muted', icon, style }: { label: string; tone?: Tone; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const c = t.colors;
  const bg: Partial<Record<Tone, string>> = { brand: c.brandSoft, success: c.successSoft, danger: c.dangerSoft, warning: c.warningSoft, info: c.infoSoft, xp: c.xpSoft, coin: c.xpSoft, streak: c.warningSoft };
  const fg: Partial<Record<Tone, string>> = { brand: c.brandText, success: c.successText, danger: c.dangerText, warning: c.warningText, info: c.infoText, xp: c.xp, coin: c.coin, streak: c.streak };
  return (
    <Row gap={4} style={[{ alignSelf: 'flex-start', paddingHorizontal: 8, minHeight: 24, borderRadius: t.radius.xs, backgroundColor: bg[tone] ?? c.surfaceSunken }, style]}>
      {icon && <Ionicons name={icon} size={12} color={fg[tone] ?? c.textSecondary} />}
      <Text variant="caption" weight="medium" style={{ color: fg[tone] ?? c.textSecondary }} numberOfLines={1}>
        {label}
      </Text>
    </Row>
  );
}

/* ---------------- EmptyState / ErrorState ---------------- */
export function EmptyState({ icon, title, body, action, onAction, secondary, onSecondary, compact }: { icon: IconName; title: string; body?: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void; compact?: boolean }) {
  const t = useTheme();
  return (
    <Col align="center" gap={10} style={{ paddingVertical: compact ? 20 : 40, paddingHorizontal: 24 }}>
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: t.colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.colors.border }}>
        <Ionicons name={icon} size={26} color={t.colors.textSecondary} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {!!body && (
        <Text variant="bodySm" tone="muted" align="center" style={{ maxWidth: 360 }}>
          {body}
        </Text>
      )}
      {(action || secondary) && (
        <Row gap={8} style={{ marginTop: 6 }} wrap justify="center">
          {!!action && <Button label={action} onPress={onAction} />}
          {!!secondary && <Button label={secondary} onPress={onSecondary} variant="secondary" />}
        </Row>
      )}
    </Col>
  );
}

export function ErrorState({ title = 'تعذّر التحميل', body = 'تحقق من الاتصال ثم حاول مرة أخرى.', onRetry, compact }: { title?: string; body?: string; onRetry?: () => void; compact?: boolean }) {
  return <EmptyState icon="cloud-offline-outline" title={title} body={body} action={onRetry ? 'حاول مرة أخرى' : undefined} onAction={onRetry} compact={compact} />;
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ width = '100%', height = 16, radius, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const o = useSharedValue(0.55);
  useEffect(() => {
    if (reduced) { cancelAnimation(o); o.value = 1; return; }
    o.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.55, { duration: 700 })), 6, false);
    return () => cancelAnimation(o);
  }, [reduced]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View accessibilityElementsHidden importantForAccessibility="no" style={[{ width, height, borderRadius: radius ?? t.radius.sm, backgroundColor: t.colors.surfaceRaised }, st, style]} />;
}

/** هيكل تحميل لقائمة */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const t = useTheme();
  return (
    <Col gap={12} accessibilityLabel="جارٍ التحميل" accessibilityRole="progressbar">
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ padding: 16, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, gap: 10 }}>
          <Skeleton width="45%" height={16} />
          <Skeleton width="85%" height={12} />
          <Skeleton width="60%" height={12} />
        </View>
      ))}
    </Col>
  );
}

/* ---------------- Stat (رقم + وصف) ---------------- */
export function Stat({ value, label, tone = 'default', icon }: { value: string | number; label: string; tone?: Tone; icon?: IconName }) {
  const t = useTheme();
  return (
    <Col gap={2} style={{ flex: 1, minWidth: 72 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Row gap={6}>
        {icon && <Ionicons name={icon} size={16} color={tone === 'default' ? t.colors.textSecondary : toneColor(t.colors, tone)} />}
        <Text variant="heading" weight="bold" tone={tone} tabular numberOfLines={1} ltr align="right">
          {String(value)}
        </Text>
      </Row>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </Col>
  );
}
