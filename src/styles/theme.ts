/**
 * أنماط الهوية البصرية - Kodax Visual Identity Styles
 * حواف مستديرة + ظل أحمر قوي + تأثيرات تفاعلية
 */

import { StyleSheet, Platform } from 'react-native';

// ألوان الهوية البصرية
export const THEME_COLORS = {
  primary: '#ef4444', // أحمر قوي
  primaryDark: '#dc2626',
  primaryLight: '#f87171',
  secondary: '#8b5cf6', // بنفسجي
  secondaryDark: '#7c3aed',
  accent: '#3b82f6', // أزرق

  // الخلفيات
  backgroundDark: '#0f0f1e',
  backgroundMedium: '#1a1a3e',
  backgroundLight: '#252550',

  // النصوص
  textPrimary: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',

  // الحدود
  borderDark: '#374151',
  borderLight: '#4b5563',

  // الظلال
  shadowRed: '#ef4444',
  shadowPurple: '#8b5cf6',
  shadowBlue: '#3b82f6',

  // حالات
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// أنصاف أقطار الحواف المستديرة
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// الظلال (مخففة)
export const SHADOWS = {
  // ظل قوي
  redGlow: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  // ظل متوسط
  redGlowMedium: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  // ظل خفيف
  redGlowLight: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // ظل بنفسجي
  purpleGlow: {
    shadowColor: THEME_COLORS.shadowPurple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // ظل أزرق
  blueGlow: {
    shadowColor: THEME_COLORS.shadowBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  // ظل افتراضي
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
};

// أنماط البطاقات
export const cardStyles = StyleSheet.create({
  // بطاقة أساسية مع ظل أحمر
  primary: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    ...SHADOWS.redGlow,
    ...Platform.select({
      web: {
        boxShadow: `0 2px 12px rgba(239, 68, 68, 0.15)`,
      },
    }),
  },
  // بطاقة ثانوية مع ظل بنفسجي
  secondary: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    ...SHADOWS.purpleGlow,
    ...Platform.select({
      web: {
        boxShadow: `0 2px 10px rgba(139, 92, 246, 0.15)`,
      },
    }),
  },
  // بطاقة عادية
  default: {
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    ...SHADOWS.default,
  },
  // بطاقة تفاعلية (للضغط)
  interactive: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    ...SHADOWS.redGlowLight,
    // تأثير الضغط يُضاف برمجياً
  },
});

// أنماط الأزرار
export const buttonStyles = StyleSheet.create({
  // زر أساسي أحمر
  primary: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...SHADOWS.redGlow,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 2px 10px rgba(239, 68, 68, 0.15)`,
      },
    }),
  },
  // زر ثانوي بنفسجي
  secondary: {
    backgroundColor: THEME_COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...SHADOWS.purpleGlow,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  // زر شبح (outline)
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  // نص الزر
  text: {
    color: THEME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center' as const,
  },
});

// أنماط حقول الإدخال
export const inputStyles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  focused: {
    borderColor: THEME_COLORS.primary,
    ...SHADOWS.redGlowLight,
  },
  text: {
    color: THEME_COLORS.textPrimary,
    fontSize: 16,
  },
  placeholder: {
    color: THEME_COLORS.textMuted,
  },
});

// تأثيرات الضغط
export const PRESS_ANIMATION = {
  activeOpacity: 0.85,
  pressedScale: 0.98,
  pressedShadowOpacity: 0.7,
};

// دالة للحصول على ستايل الضغط
export const getPressedStyle = (isPressed: boolean) => ({
  transform: [{ scale: isPressed ? PRESS_ANIMATION.pressedScale : 1 }],
  opacity: isPressed ? PRESS_ANIMATION.activeOpacity : 1,
});

// تدرجات الألوان
export const GRADIENTS = {
  primary: ['#ef4444', '#dc2626'] as [string, string],
  secondary: ['#8b5cf6', '#7c3aed'] as [string, string],
  dark: ['#0f0f1e', '#1a1a3e'] as [string, string],
  card: ['rgba(30, 30, 40, 0.9)', 'rgba(40, 40, 55, 0.9)'] as [string, string],
  redGlow: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.05)'] as [
    string,
    string,
  ],
};

export default {
  THEME_COLORS,
  BORDER_RADIUS,
  SHADOWS,
  cardStyles,
  buttonStyles,
  inputStyles,
  PRESS_ANIMATION,
  getPressedStyle,
  GRADIENTS,
};
