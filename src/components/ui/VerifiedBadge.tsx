/**
 * شارة التوثيق بجانب اسم المستخدم — تظهر فقط عندما يمنحها المشرف (profiles.is_verified)
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { useTheme } from '@/design/theme';

// Twelve teeth keep the seal readable even beside a small username.
const seal=Array.from({length:24},(_,i)=>{
  const angle=-Math.PI/2+i*Math.PI/12,r=i%2===0?11:9;
  return `${(12+Math.cos(angle)*r).toFixed(2)},${(12+Math.sin(angle)*r).toFixed(2)}`;
}).join(' ');

export default function VerifiedBadge({ verified, size = 14 }: { verified?: boolean | null; size?: number }) {
  const t=useTheme();
  if (!verified) return null;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="حساب موثّق"
      testID="verified-account-seal"
      style={{ marginHorizontal: 3, width:size, height:size, flexShrink:0 }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
        <Polygon points={seal} fill={t.colors.brand} />
        <Path d="M7.5 12.2L10.5 15.2L16.5 9.2" fill="none" stroke={t.colors.textOnAccent} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
