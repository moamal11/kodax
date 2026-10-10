import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '@/design';
import { brandArtwork } from './brandArtwork';
/** Transparent original mask; color changes leave the custom symbol/letter contours intact. */
export function BrandMark({ width = 180, variant, tone }: { width?: number; variant?: 'full' | 'symbol'; tone?: 'light' | 'dark' }) {
  const t = useTheme();
  const light = (tone ?? t.mode) === 'light';
  const artwork = brandArtwork[variant ?? (width <= 64 ? 'symbol' : 'full')];
  const box = artwork.box;
  const scale = width / box.width;
  return <View accessible accessibilityLabel="Kodax" accessibilityRole="image" style={{ width, height: box.height * scale, overflow: 'hidden' }}>
    <Image source={artwork.source} accessible={false}
      resizeMode="contain" style={{ position: 'absolute', width: box.imageW * scale, height: box.imageH * scale, left: -box.left * scale, top: -box.top * scale, tintColor: light ? '#311e42' : '#ffffff' }} />
  </View>;
}
