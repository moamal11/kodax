import React from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Text, type Tone } from './Text';
import { Row } from './Layout';
import type { IconName } from './Button';

type SurfaceProps = ViewProps & {
  variant?: 'surface' | 'raised' | 'sunken' | 'outline' | 'brand' | 'success' | 'warning' | 'danger' | 'xp';
  padding?: number;
  radius?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

/** سطح محتوى: يُستخدم فقط حين يجمع محتوى مترابطاً فعلاً (لا لكل قسم) */
export function Surface({ variant = 'surface', padding = 16, radius, onPress, style, children, accessibilityLabel, accessibilityHint, ...rest }: SurfaceProps) {
  const t = useTheme();
  const c = t.colors;
  const map = {
    surface: { bg: c.surface, border: c.border },
    raised: { bg: c.surfaceRaised, border: c.border },
    sunken: { bg: c.surfaceSunken, border: c.border },
    outline: { bg: 'transparent', border: c.border },
    brand: { bg: c.brandSoft, border: c.borderStrong },
    success: { bg: c.successSoft, border: 'transparent' },
    warning: { bg: c.warningSoft, border: 'transparent' },
    danger: { bg: c.dangerSoft, border: 'transparent' },
    xp: { bg: c.xpSoft, border: 'transparent' },
  }[variant];
  const base: ViewStyle = {
    backgroundColor: map.bg,
    borderWidth: 1,
    borderColor: map.border,
    borderRadius: radius ?? t.radius.md,
    padding,
  };
  if (!onPress)
    return (
      <View {...rest} style={[base, style]}>
        {children}
      </View>
    );
  return (
    <Pressable
      {...(rest as any)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={(state: any) => [
        base,
        (state.pressed || state.hovered) && {
          backgroundColor: variant === 'surface' || variant === 'raised' ? c.surfacePressed : map.bg,
          borderColor: c.borderStrong,
        },
        Platform.OS === 'web' && state.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: Tone;
  /** نص أو عنصر في الطرف الأيسر */
  value?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  /** آخر صف في المجموعة (بلا خط فاصل) */
  last?: boolean;
  accessibilityHint?: string;
};

/** صف إعدادات/قائمة: أيقونة، عنوان، وصف، قيمة، سهم */
export function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'secondary',
  value,
  trailing,
  onPress,
  danger,
  chevron = !!onPress,
  last,
  accessibilityHint,
}: ListRowProps) {
  const t = useTheme();
  const c = t.colors;
  const content = (
    <Row gap={12} style={{ paddingVertical: 12, paddingHorizontal: 14, minHeight: 56, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }}>
      {icon && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: t.radius.sm,
            backgroundColor: danger ? c.dangerSoft : c.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color={danger ? c.dangerText : iconTone === 'secondary' ? c.textSecondary : undefined} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="medium" tone={danger ? 'danger' : 'default'} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="caption" tone="muted" numberOfLines={3}>
            {subtitle}
          </Text>
        )}
      </View>
      {!!value && (
        <Text variant="bodySm" tone="muted" numberOfLines={1} style={{ maxWidth: 140 }}>
          {value}
        </Text>
      )}
      {trailing}
      {chevron && <Ionicons name="chevron-back" size={18} color={c.textMuted} />}
    </Row>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}، ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={(state: any) => [
        { backgroundColor: state.pressed || state.hovered ? c.surfacePressed : 'transparent' },
        Platform.OS === 'web' && state.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus, outlineOffset: -2 } as any) : null,
      ]}
    >
      {content}
    </Pressable>
  );
}

/** مجموعة صفوف داخل سطح واحد */
export function ListGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}

/** عنوان قسم + إجراء اختياري */
export function SectionHeader({ title, action, onAction, subtitle }: { title: string; action?: string; onAction?: () => void; subtitle?: string }) {
  const t = useTheme();
  return (
    <Row justify="space-between" align="flex-end" style={{ marginBottom: 10, gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="bodySm" tone="muted">
            {subtitle}
          </Text>
        )}
      </View>
      {!!action && (
        <Pressable onPress={onAction} accessibilityRole="link" hitSlop={8} style={(s: any) => ({ opacity: s.pressed ? 0.6 : 1, paddingVertical: 4 })}>
          <Text variant="label" style={{ color: t.colors.brandText }}>
            {action}
          </Text>
        </Pressable>
      )}
    </Row>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.colors.border }, style]} />;
}
