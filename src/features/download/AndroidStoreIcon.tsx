import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/design';

export function AndroidStoreIcon({ size = 24 }: { size?: number }) {
  const t = useTheme();
  return <MaterialCommunityIcons name="android" size={size} color={t.colors.textOnAccent} accessible={false} />;
}
