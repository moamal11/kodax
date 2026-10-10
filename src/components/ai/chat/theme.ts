/** ألوان وأبعاد صفحة مساعد Kodax */
import { Platform } from 'react-native';
import { darkColors, fontFamily, type ColorTokens } from '@/design/tokens';

import { useTheme } from '@/design/theme';
/** Chat uses the same semantic palette as every other screen. */
export const chatColors = (colors: ColorTokens) => ({
  bg: colors.bg,
  bgAlt: colors.bg,
  surface: colors.surface,
  surfaceStrong: colors.surfaceRaised,
  border: colors.border,
  borderStrong: colors.borderStrong,
  text: colors.text,
  textSoft: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.brand,
  accentSoft: colors.brandSoft,
  accent2: colors.info,
  userA: colors.brandStrong,
  userB: colors.brandStrong,
  success: colors.successText,
  warning: colors.warningText,
  danger: colors.dangerText,
  inlineCodeBg: colors.brandSoft,
  inlineCode: colors.brandText,
});
export const C = chatColors(darkColors);
export function useChatColors() { return chatColors(useTheme().colors); }

export const FONT_MONO = fontFamily.mono;

/** هل يبدأ النص بحرف عربي؟ (لاتجاه الفقرة) */
export function isRtlText(text: string): boolean {
  const m = text.match(/[A-Za-z؀-ۿ]/);
  return !!m && /[؀-ۿ]/.test(m[0]);
}

export type Breakpoint = 'phone' | 'tablet' | 'desktop';
export function breakpointFor(width: number): Breakpoint {
  if (width >= 1100) return 'desktop';
  if (width >= 640) return 'tablet';
  return 'phone';
}
