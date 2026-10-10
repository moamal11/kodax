/**
 * نظام تصميم Kodax — الرموز الدلالية (semantic tokens).
 *
 * القاعدة: الصفحات لا تكتب ألواناً مباشرة؛ تستخدم theme.colors.* عبر makeStyles/useTheme.
 * ألوان الهوية (brand) منفصلة عن ألوان الحالة (success/danger/...) وعن ألوان المكافآت (xp/coin/streak).
 *
 * المود الداكن هو المعتمد. المود النهاري موجود للتحقق من جاهزية النظام فقط ولا يُعرض للمستخدم بعد
 * (يُفعَّل في نسخ التطوير عبر ?theme=light على الويب).
 */

export type ColorTokens = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  surfacePressed: string;
  overlay: string;
  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;

  brand: string;
  brandStrong: string;
  brandText: string;
  brandSoft: string;
  focus: string;

  success: string;
  successText: string;
  successSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  info: string;
  infoText: string;
  infoSoft: string;

  xp: string;
  xpSoft: string;
  coin: string;
  streak: string;

  codeBg: string;
  codeBorder: string;
  codeText: string;
  codeMuted: string;
  codeKeyword: string;
  codeString: string;
  codeNumber: string;
  codeFunction: string;
  codeComment: string;
};

const dark: ColorTokens = {
  bg: '#0E0E14',
  surface: '#16161F',
  surfaceRaised: '#1D1D29',
  surfaceSunken: '#0A0A10',
  surfacePressed: '#22222F',
  overlay: 'rgba(5, 5, 10, 0.72)',
  border: '#262634',
  borderStrong: '#36364C',

  text: '#EDEDF4',
  textSecondary: '#B6B6C8',
  textMuted: '#A2A2B8',
  textOnAccent: '#FFFFFF',

  brand: '#8B5CF6',
  brandStrong: '#7C3AED',
  brandText: '#C4B5FD',
  brandSoft: 'rgba(139, 92, 246, 0.14)',
  focus: '#A78BFA',

  success: '#22C55E',
  successText: '#4ADE80',
  successSoft: 'rgba(34, 197, 94, 0.12)',
  danger: '#EF4444',
  dangerText: '#F87171',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  warning: '#F59E0B',
  warningText: '#FBBF24',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  info: '#38BDF8',
  infoText: '#7DD3FC',
  infoSoft: 'rgba(56, 189, 248, 0.12)',

  xp: '#F5B83D',
  xpSoft: 'rgba(245, 184, 61, 0.14)',
  coin: '#F59E0B',
  streak: '#FB923C',

  codeBg: '#0B0B12',
  codeBorder: '#22222F',
  codeText: '#E4E4EF',
  codeMuted: '#85859E',
  codeKeyword: '#C792EA',
  codeString: '#A8D68A',
  codeNumber: '#F78C6C',
  codeFunction: '#82AAFF',
  codeComment: '#8B8EAD',
};

const light: ColorTokens = {
  bg: '#F6F5FA',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#EEEDF5',
  surfacePressed: '#ECEAF4',
  overlay: 'rgba(20, 18, 30, 0.45)',
  border: '#E2E0EB',
  borderStrong: '#CBC7DC',

  text: '#16141F',
  textSecondary: '#403D51',
  textMuted: '#57546B',
  textOnAccent: '#FFFFFF',

  brand: '#7C3AED',
  brandStrong: '#6D28D9',
  brandText: '#5B2A9C',
  brandSoft: 'rgba(124, 58, 237, 0.10)',
  focus: '#7C3AED',

  success: '#16A34A',
  successText: '#15803D',
  successSoft: 'rgba(22, 163, 74, 0.10)',
  danger: '#DC2626',
  dangerText: '#B91C1C',
  dangerSoft: 'rgba(220, 38, 38, 0.08)',
  warning: '#D97706',
  warningText: '#B45309',
  warningSoft: 'rgba(217, 119, 6, 0.10)',
  info: '#0284C7',
  infoText: '#0369A1',
  infoSoft: 'rgba(2, 132, 199, 0.08)',

  xp: '#8C5B12',
  xpSoft: 'rgba(183, 121, 31, 0.12)',
  coin: '#C2780A',
  streak: '#EA580C',

  // كتل الكود تبقى داكنة في المود النهاري (أوضح للقراءة ومطابقة لمحررات الكود)
  codeBg: '#17151F',
  codeBorder: '#2A2737',
  codeText: '#E4E4EF',
  codeMuted: '#9393AD',
  codeKeyword: '#C792EA',
  codeString: '#A8D68A',
  codeNumber: '#F78C6C',
  codeFunction: '#82AAFF',
  codeComment: '#9699B7',
};

export const palettes = { dark, light } as const;
/** للأنماط الثابتة خارج React (المود المعتمد) */
export const darkColors = dark;
export type ThemeMode = keyof typeof palettes;

/** مسافات (أساس 4) */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  14: 56,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** عائلات الخطوط (كل وزن عائلة مستقلة حتى لا يُركّب المتصفح وزناً صناعياً) */
export const fontFamily = {
  regular: 'Plex-400',
  medium: 'Plex-500',
  semibold: 'Plex-600',
  bold: 'Plex-700',
  mono: 'Mono-400',
  monoBold: 'Mono-600',
} as const;

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodySm' | 'label' | 'caption' | 'number';

/** سلّم الخطوط: الحجم / ارتفاع السطر / الوزن الافتراضي */
export const typeScale: Record<TextVariant, { size: number; line: number; weight: keyof typeof fontFamily }> = {
  display: { size: 28, line: 38, weight: 'bold' },
  title: { size: 22, line: 32, weight: 'bold' },
  heading: { size: 18, line: 28, weight: 'semibold' },
  body: { size: 16, line: 26, weight: 'regular' },
  bodySm: { size: 15, line: 24, weight: 'regular' },
  label: { size: 15, line: 23, weight: 'medium' },
  caption: { size: 13, line: 21, weight: 'regular' },
  number: { size: 16, line: 22, weight: 'semibold' },
};

export const motion = {
  press: 120,
  fast: 160,
  base: 220,
  enter: 320,
  reward: 900,
} as const;

/** نقاط التخطيط */
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export const layout = {
  maxContent: 1120,
  readingWidth: 720,
  sidebarWidth: 232,
  gutterPhone: 16,
  gutterDesktop: 28,
  tabBarHeight: 64,
  touchMin: 44,
} as const;
