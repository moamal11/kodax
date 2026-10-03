/** ألوان وأبعاد صفحة مساعد Kodax */
import { Platform } from 'react-native';

export const C = {
  bg: '#0b0b18',
  bgAlt: '#11112a',
  surface: 'rgba(255,255,255,0.04)',
  surfaceStrong: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(167,139,250,0.35)',
  text: '#e8e8f0',
  textSoft: '#c9c9d6',
  muted: '#8f8fa3',
  accent: '#8b5cf6',
  accentSoft: 'rgba(139,92,246,0.16)',
  accent2: '#22d3ee',
  userA: '#7c3aed',
  userB: '#4f46e5',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  inlineCodeBg: 'rgba(139,92,246,0.18)',
  inlineCode: '#d8ccff',
};

export const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

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
