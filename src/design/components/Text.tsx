import React from 'react';
import { Text as RNText, Platform, StyleSheet, useWindowDimensions, type TextProps, type TextStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme';
import type { TextVariant } from '../tokens';

export type Tone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'xp'
  | 'coin'
  | 'streak'
  | 'onAccent';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'right' | 'left' | 'center';
  /** نص لاتيني/تقني يُقرأ من اليسار (كود، بريد، روابط) */
  ltr?: boolean;
  mono?: boolean;
  /** أرقام بعرض ثابت (عدادات) */
  tabular?: boolean;
  style?: StyleProp<TextStyle>;
};

export function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: Tone): string {
  switch (tone) {
    case 'secondary':
      return colors.textSecondary;
    case 'muted':
      return colors.textMuted;
    case 'brand':
      return colors.brandText;
    case 'success':
      return colors.successText;
    case 'danger':
      return colors.dangerText;
    case 'warning':
      return colors.warningText;
    case 'info':
      return colors.infoText;
    case 'xp':
      return colors.xp;
    case 'coin':
      return colors.coin;
    case 'streak':
      return colors.streak;
    case 'onAccent':
      return colors.textOnAccent;
    default:
      return colors.text;
  }
}

/**
 * نص Kodax: الافتراضي عربي من اليمين بخط IBM Plex Sans Arabic.
 * تكبير الخط من النظام مسموح حتى 1.6x حتى لا ينكسر التخطيط.
 */
export function Text({ variant = 'body', tone = 'default', weight, align, ltr, mono, tabular, style, ...rest }: AppTextProps) {
  const t = useTheme();
  const { fontScale } = useWindowDimensions();
  const scale = t.type[variant];
  const w = weight ?? scale.weight;
  const family = mono ? (w === 'bold' || w === 'semibold' ? t.font.monoBold : t.font.mono) : t.font[w];
  const textAlign = align ?? (ltr ? 'left' : 'right');
  const custom = StyleSheet.flatten(style);
  const android = Platform.OS === 'android';
  const limit = rest.maxFontSizeMultiplier ?? 1.6;
  const multiplier = rest.allowFontScaling === false ? 1 : limit >= 1 ? Math.min(fontScale, limit) : fontScale;
  // RN 0.81 can retain old paragraph measurements during a live font change.
  // Explicit dp sizes update both the measurement cache and painted glyphs;
  // keeping this Text node mounted preserves selections and surrounding state.
  const androidType = android ? {
    fontSize: (custom?.fontSize ?? (mono && variant === 'body' ? 14 : scale.size)) * multiplier,
    lineHeight: (custom?.lineHeight ?? (mono && variant === 'body' ? 22 : scale.line)) * multiplier,
  } : undefined;
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      allowFontScaling={android ? false : rest.allowFontScaling}
      style={[
        {
          fontFamily: family,
          fontSize: mono && variant === 'body' ? 14 : scale.size,
          lineHeight: mono && variant === 'body' ? 22 : scale.line,
          color: toneColor(t.colors, tone),
          textAlign,
          writingDirection: ltr ? 'ltr' : 'rtl',
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        Platform.OS === 'web' ? ({ overflowWrap: 'anywhere', ...(ltr ? { direction: 'ltr', unicodeBidi: 'isolate' } : {}) } as any) : null,
        style,
        androidType,
      ]}
    />
  );
}

/** يعزل مقطع LTR (كود/اسم دالة) داخل جملة عربية حتى لا تنقلب الأقواس: print() */
export const ltrIsolate = (s: string) => `⁦${s}⁩`;
