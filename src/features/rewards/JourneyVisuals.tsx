import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Polygon, Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useTheme } from '@/design';

export type JourneyState = 'current' | 'completed' | 'upcoming' | 'locked';

/** The shape conveys status as well as colour, on native and Web. */
export function JourneyNode({ state, number, size = 44 }: { state: JourneyState; number?: number; size?: number }) {
  const t = useTheme();
  const color = state === 'completed' ? t.colors.xp : state === 'current' ? t.colors.brandText : t.colors.textSecondary;
  return (
    <View
      accessible
      accessibilityLabel={{ current: 'المرحلة الحالية', completed: 'مكتمل', upcoming: 'قادم', locked: 'مقفل' }[state]}
      style={{ width: size, height: size, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox="0 0 60 60" style={{ position: 'absolute' }}>
        {state === 'completed' ? (
          <Polygon points="8,6 52,6 52,43 42,54 8,54" fill={t.colors.xpSoft} stroke={color} strokeWidth="1.5" />
        ) : state === 'current' ? (
          <>
            <Path d="M14 5H5V55H14 M46 5H55V55H46" stroke={color} strokeWidth="2.5" fill="none" />
            <Path d="M12 12H48V48H12Z" fill={t.colors.brandSoft} />
            <Path d="M44 48H49V53H44Z" fill={t.colors.xp} />
          </>
        ) : (
          <Circle
            cx="30"
            cy="30"
            r="22"
            stroke={t.colors.borderStrong}
            strokeWidth="1.8"
            strokeDasharray={state === 'locked' ? '4 3' : undefined}
            fill="none"
          />
        )}
      </Svg>
      {state === 'completed' || state === 'locked' ? (
        <MaterialIcons name={state === 'completed' ? 'done' : 'lock-outline'} size={size * 0.43} color={color} />
      ) : (
        <Text variant="label" mono ltr align="center" allowFontScaling={false} style={{ color, fontSize: size * 0.32 }}>
          {number ?? '›'}
        </Text>
      )}
    </View>
  );
}

/** Collectable seal; the existing badge definition supplies its meaningful symbol. */
export function AchievementSeal({ icon, earned, size = 72 }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; earned: boolean; size?: number }) {
  const t = useTheme();
  // The frame is metallic gold; its symbol stays darker for readability on light surfaces.
  const light = t.mode === 'light';
  const gold = light ? '#D8AD57' : t.colors.xp;
  const outline = light ? '#BB8B35' : gold;
  const symbol = light ? '#79551E' : gold;
  const face = light ? '#FFF8E9' : t.colors.surfaceRaised;
  return (
    <View
      style={{ width: size, height: size * 1.1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size * 1.1} viewBox="0 0 100 110" style={{ position: 'absolute' }}>
        <Polygon
          points="20,3 80,3 97,23 97,76 50,105 3,76 3,23"
          fill={earned ? gold : 'none'}
          stroke={earned ? outline : t.colors.textMuted}
          strokeWidth="2"
          strokeDasharray={earned ? undefined : '5 4'}
        />
        <Polygon points="23,10 77,10 89,27 89,71 50,95 11,71 11,27" fill={earned ? face : 'none'} stroke={earned ? gold : t.colors.borderStrong} strokeWidth="1" />
        <Path d="M30 26H24V62H30 M70 26H76V62H70" fill="none" stroke={earned ? symbol : t.colors.textSecondary} strokeWidth="1.7" />
        <Path d="M36 75H64" stroke={earned ? gold : t.colors.borderStrong} strokeWidth="2" />
      </Svg>
      <MaterialIcons name={icon} size={size * 0.35} color={earned ? symbol : t.colors.textSecondary} style={{ marginTop: -size * 0.12 }} />
      <View style={{ position: 'absolute', bottom: size * 0.13 }}>
        <MaterialIcons name={earned ? 'done' : 'radio-button-unchecked'} size={size * 0.16} color={earned ? symbol : t.colors.textSecondary} />
      </View>
    </View>
  );
}
