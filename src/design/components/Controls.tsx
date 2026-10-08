import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, TextInput, View, type KeyboardTypeOptions, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Row } from './Layout';
import type { IconName } from './Button';

/* ------------------------------------------------------------------ */
/* Field: label ظاهر دائماً، hint/error تحت الحقل، أيقونة الإجراء بمساحة محجوزة */
/* ------------------------------------------------------------------ */
type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string | null;
  icon?: IconName;
  secure?: boolean;
  ltr?: boolean;
  keyboardType?: KeyboardTypeOptions;
  inputRef?: React.Ref<TextInput>;
  style?: StyleProp<ViewStyle>;
  /** يخفي الـlabel بصرياً ويُبقيه لقارئ الشاشة */
  hideLabel?: boolean;
};

export function Field({ label, hint, error, icon, secure, ltr, inputRef, style, multiline, hideLabel, ...input }: FieldProps) {
  const t = useTheme();
  const c = t.colors;
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const borderColor = error ? c.danger : focused ? c.focus : c.borderStrong;
  return (
    <View style={[{ gap: 6 }, style]}>
      {!hideLabel && (
        <Text variant="label" tone="secondary">
          {label}
        </Text>
      )}
      <Row
        gap={8}
        style={{
          minHeight: multiline ? 96 : 48,
          backgroundColor: c.surfaceSunken,
          borderWidth: 1,
          borderColor,
          borderRadius: t.radius.md,
          paddingHorizontal: 12,
          alignItems: multiline ? 'flex-start' : 'center',
        }}
      >
        {icon && <Ionicons name={icon} size={18} color={focused ? c.brandText : c.textMuted} style={multiline ? { marginTop: 14 } : undefined} />}
        <TextInput
          ref={inputRef}
          {...input}
          multiline={multiline}
          secureTextEntry={secure && !reveal}
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={c.textMuted}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              minWidth: 0,
              color: c.text,
              fontFamily: t.font.regular,
              fontSize: 16,
              paddingVertical: multiline ? 12 : 10,
              textAlign: ltr ? 'left' : 'right',
              writingDirection: ltr ? 'ltr' : 'rtl',
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? 96 : undefined,
            },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
          ]}
        />
        {secure && (
          <Pressable
            onPress={() => setReveal((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            hitSlop={8}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
          </Pressable>
        )}
      </Row>
      {!!(error || hint) && (
        <Text variant="caption" tone={error ? 'danger' : 'muted'} accessibilityLiveRegion={error ? 'polite' : undefined}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SwitchRow: الاسم والوصف مربوطان بالمفتاح، والصف كله قابل للضغط          */
/* ------------------------------------------------------------------ */
export function SwitchRow({ title, hint, value, onValueChange, icon, disabled, last }: { title: string; hint?: string; value: boolean; onValueChange: (v: boolean) => void; icon?: IconName; disabled?: boolean; last?: boolean }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={hint ? `${title}، ${hint}` : title}
      accessibilityState={{ checked: value, disabled }}
      style={(s: any) => [
        { backgroundColor: s.hovered ? c.surfacePressed : 'transparent' },
        Platform.OS === 'web' && s.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus, outlineOffset: -2 } as any) : null,
      ]}
    >
      <Row gap={12} style={{ paddingVertical: 12, paddingHorizontal: 14, minHeight: 60, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border, opacity: disabled ? 0.5 : 1 }}>
        {icon && <Ionicons name={icon} size={20} color={c.textSecondary} />}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body" weight="medium">
            {title}
          </Text>
          {!!hint && (
            <Text variant="caption" tone="muted">
              {hint}
            </Text>
          )}
        </View>
        <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Switch value={value} disabled={disabled} trackColor={{ false: c.borderStrong, true: c.brand }} thumbColor="#ffffff" {...(Platform.OS === 'web' ? ({ activeThumbColor: '#ffffff', tabIndex: -1 } as any) : {})} />
        </View>
      </Row>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Chip و Segmented                                                    */
/* ------------------------------------------------------------------ */
export function Chip({ label, selected, onPress, icon, count }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; count?: number }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count != null ? `${label} (${count})` : label}
      style={(s: any) => [
        {
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 6,
          minHeight: 36,
          paddingHorizontal: 12,
          borderRadius: t.radius.pill,
          backgroundColor: selected ? c.brandSoft : s.hovered || s.pressed ? c.surfacePressed : c.surface,
          borderWidth: 1,
          borderColor: selected ? c.brand : c.border,
        },
        Platform.OS === 'web' && s.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null,
      ]}
    >
      {icon && <Ionicons name={icon} size={15} color={selected ? c.brandText : c.textSecondary} />}
      <Text variant="label" style={{ color: selected ? c.brandText : c.textSecondary }} numberOfLines={1}>
        {label}
      </Text>
      {count != null && (
        <Text variant="caption" tabular style={{ color: selected ? c.brandText : c.textMuted }}>
          {count}
        </Text>
      )}
    </Pressable>
  );
}

/** شريط شرائح أفقي قابل للتمرير يبدأ من اليمين (أول شريحة ظاهرة) */
export function ChipBar({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = React.useRef<ScrollView>(null);
  const atStart = React.useRef(true);
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ flexGrow: 0 }, style]}
      contentContainerStyle={{ flexDirection: 'row-reverse', gap: 8, paddingVertical: 2, flexGrow: 1 }}
      onScroll={() => {
        atStart.current = false;
      }}
      scrollEventThrottle={64}
      // المحتوى مرتب من اليمين؛ البداية المرئية = نهاية التمرير الأفقي
      onContentSizeChange={() => {
        if (atStart.current) ref.current?.scrollToEnd({ animated: false });
      }}
    >
      {children}
    </ScrollView>
  );
}

export function Segmented<T extends string>({ options, value, onChange, style }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Row accessibilityRole="tablist" style={[{ backgroundColor: c.surfaceSunken, borderRadius: t.radius.md, padding: 4, gap: 4, borderWidth: 1, borderColor: c.border }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={(s: any) => [
              { flex: 1, minHeight: 38, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surfaceRaised : s.hovered ? c.surfacePressed : 'transparent', borderWidth: on ? 1 : 0, borderColor: c.borderStrong, flexDirection: 'row-reverse', gap: 6 },
              Platform.OS === 'web' && s.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null,
            ]}
          >
            <Text variant="label" weight={on ? 'semibold' : 'medium'} tone={on ? 'default' : 'muted'} align="center">
              {o.label}
            </Text>
            {o.count != null && (
              <Text variant="caption" tone="muted" tabular>
                {o.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </Row>
  );
}
