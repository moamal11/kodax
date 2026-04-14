import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  gradient?: boolean;
  glowColor?: string;
  darkMode?: boolean;
}

export function GlassCard({
  children,
  intensity = 10,
  gradient = false,
  glowColor,
  darkMode = true,
  style,
  ...props
}: GlassCardProps) {
  const isAndroid = Platform.OS === 'android';

  if (gradient) {
    return (
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          glowColor && { shadowColor: glowColor, shadowOpacity: 0.5 },
          style,
        ]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  // Android: Modern solid card with subtle gradients (NO BLUR)
  if (isAndroid) {
    return (
      <LinearGradient
        colors={['rgba(30, 30, 60, 0.95)', 'rgba(20, 20, 45, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          styles.androidCard,
          glowColor && {
            shadowColor: glowColor,
            borderColor: glowColor
              .replace('rgb', 'rgba')
              .replace(')', ', 0.5)'),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  // iOS: Use BlurView
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        styles.card,
        glowColor && { shadowColor: glowColor, shadowOpacity: 0.4 },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    overflow: 'hidden',
    backgroundColor:
      Platform.OS === 'android' ? 'transparent' : 'rgba(26, 26, 46, 0.5)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  androidCard: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    borderWidth: 1.5,
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  content: {
    flex: 1,
  },
});
