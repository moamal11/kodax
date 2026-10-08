import React from 'react';
import { ActivityIndicator, Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Text } from './Text';

export type IconName = keyof typeof Ionicons.glyphMap;
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'soft';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  /** مكان الأيقونة بالنسبة للنص في القراءة العربية: start = يمين النص */
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

const HEIGHT = { sm: 36, md: 44, lg: 52 } as const;

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, iconPosition = 'start', loading, disabled, full, style, accessibilityLabel, accessibilityHint, testID }: Props) {
  const t = useTheme();
  const c = t.colors;
  const palette: Record<ButtonVariant, { bg: string; bgPressed: string; fg: string; border?: string }> = {
    primary: { bg: c.brand, bgPressed: c.brandStrong, fg: c.textOnAccent },
    success: { bg: c.success, bgPressed: '#16a34a', fg: '#06240F' },
    danger: { bg: c.danger, bgPressed: '#dc2626', fg: c.textOnAccent },
    secondary: { bg: c.surfaceRaised, bgPressed: c.surfacePressed, fg: c.text, border: c.borderStrong },
    soft: { bg: c.brandSoft, bgPressed: c.surfacePressed, fg: c.brandText },
    ghost: { bg: 'transparent', bgPressed: c.surfacePressed, fg: c.brandText },
  };
  const p = palette[variant];
  const inactive = disabled || loading;
  const iconSize = size === 'sm' ? 16 : 18;
  const iconEl = icon ? <Ionicons name={icon} size={iconSize} color={p.fg} /> : null;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      hitSlop={size === 'sm' ? 4 : 0}
      style={(state: any) => [
        {
          minHeight: HEIGHT[size],
          paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 22 : 16,
          borderRadius: t.radius.md,
          backgroundColor: state.pressed ? p.bgPressed : state.hovered && variant !== 'ghost' ? p.bgPressed : state.hovered ? c.surfacePressed : p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row-reverse',
          gap: 8,
          opacity: disabled ? 0.45 : 1,
          alignSelf: full ? 'stretch' : 'auto',
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        Platform.OS === 'web' && state.focused ? { outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus, outlineOffset: 2 } as any : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} />
      ) : (
        <>
          {iconPosition === 'start' && iconEl}
          <Text variant={size === 'sm' ? 'label' : 'label'} weight="semibold" style={{ color: p.fg, fontSize: size === 'lg' ? 16 : size === 'sm' ? 13 : 15 }} align="center" numberOfLines={1}>
            {label}
          </Text>
          {iconPosition === 'end' && iconEl}
        </>
      )}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  /** اسم الزر لقارئ الشاشة (إلزامي: الزر بلا نص ظاهر) */
  label: string;
  onPress?: () => void;
  variant?: 'ghost' | 'surface' | 'brand';
  size?: number;
  color?: string;
  badge?: number;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, label, onPress, variant = 'ghost', size = 22, color, badge, disabled, selected, style }: IconButtonProps) {
  const t = useTheme();
  const c = t.colors;
  const bg = variant === 'surface' ? c.surfaceRaised : variant === 'brand' ? c.brandSoft : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      hitSlop={6}
      style={(state: any) => [
        {
          width: 44,
          height: 44,
          borderRadius: t.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state.pressed || state.hovered ? c.surfacePressed : bg,
          borderWidth: variant === 'surface' ? 1 : 0,
          borderColor: c.border,
          opacity: disabled ? 0.4 : 1,
        },
        Platform.OS === 'web' && state.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color ?? (variant === 'brand' ? c.brandText : c.textSecondary)} />
      {!!badge && badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            borderRadius: 9,
            backgroundColor: c.danger,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: c.bg,
          }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Text variant="caption" weight="bold" style={{ color: '#fff', fontSize: 10, lineHeight: 12 }} align="center">
            {badge > 99 ? '99+' : String(badge)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
