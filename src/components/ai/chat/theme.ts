/** ألوان وأبعاد صفحة مساعد Kodax */
import { Platform } from 'react-native';
import { darkColors, fontFamily } from '@/design/tokens';

/** ألوان صفحة المساعد = رموز نظام التصميم (المود الداكن) */
export const C = {
  bg: darkColors.bg,
  bgAlt: darkColors.bg,
  surface: darkColors.surface,
  surfaceStrong: darkColors.surfaceRaised,
  border: darkColors.border,
  borderStrong: darkColors.borderStrong,
  text: darkColors.text,
  textSoft: darkColors.textSecondary,
  muted: darkColors.textMuted,
  accent: darkColors.brand,
  accentSoft: darkColors.brandSoft,
  accent2: darkColors.info,
  userA: darkColors.brandStrong,
  userB: darkColors.brandStrong,
  success: darkColors.successText,
  warning: darkColors.warningText,
  danger: darkColors.dangerText,
  inlineCodeBg: darkColors.brandSoft,
  inlineCode: darkColors.brandText,
};

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
