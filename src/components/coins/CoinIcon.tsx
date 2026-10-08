/**
 * أيقونة الكوين الموحدة في Kodax
 * (دائرة ذهبية بحرف K — لا تعتمد على emoji حتى تظهر بنفس الشكل على كل الأجهزة)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { darkColors } from '@/design/tokens';
export const COIN_COLORS = {
  gold: darkColors.warningText,
  goldDark: '#D97706',
  text: darkColors.warningText,
  bg: 'rgba(245,158,11,0.12)',
  border: 'rgba(245,158,11,0.3)',
};

export function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[COIN_COLORS.gold, COIN_COLORS.goldDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.coin,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size * 0.74,
            height: size * 0.74,
            borderRadius: (size * 0.74) / 2,
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize: size * 0.46, fontFamily: 'Plex-400' }]}>K</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  letter: {
    color: '#78350F',
    
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'Plex-700' },
});

export default CoinIcon;
