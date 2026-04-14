/**
 * FuturisticTabBar.tsx
 *
 * Futuristic Bottom Navigation Bar with Neon Glow & Glassmorphism
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export function FuturisticTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {/* Outer Glow Effect */}
      <View style={styles.outerGlow} />

      {/* Glass Background with Blur */}
      <LinearGradient
        colors={
          [
            'rgba(88, 28, 135, 0.4)', // Purple with 40% opacity
            'rgba(147, 51, 234, 0.35)', // Violet
            'rgba(220, 38, 38, 0.3)', // Cosmic Red
          ] as [string, string, ...string[]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassBackground}
      >
        {/* Frosted Glass Overlay */}
        <View style={styles.frostedOverlay}>
          {/* Inner Gradient */}
          <LinearGradient
            colors={
              ['rgba(15, 15, 30, 0.6)', 'rgba(30, 30, 60, 0.5)'] as [
                string,
                string,
                ...string[],
              ]
            }
            style={styles.innerGradient}
          >
            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                  });
                };

                return (
                  <TabButton
                    key={route.key}
                    icon={options.tabBarIcon}
                    isFocused={isFocused}
                    onPress={onPress}
                    onLongPress={onLongPress}
                  />
                );
              })}
            </View>

            {/* Neon Bottom Line */}
            <LinearGradient
              colors={
                [
                  'rgba(147, 51, 234, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(220, 38, 38, 0.8)',
                ] as [string, string, ...string[]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.neonLine}
            />
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
}

interface TabButtonProps {
  icon: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabButton({ icon, isFocused, onPress, onLongPress }: TabButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    glowOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
  }, [isFocused]);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {/* Icon Glow Effect */}
        <Animated.View style={[styles.iconGlow, glowStyle]} />

        {/* Active Background */}
        {isFocused && (
          <LinearGradient
            colors={
              ['rgba(147, 51, 234, 0.3)', 'rgba(236, 72, 153, 0.2)'] as [
                string,
                string,
                ...string[],
              ]
            }
            style={styles.activeBackground}
          />
        )}

        {/* Icon */}
        <View style={styles.iconWrapper}>
          {icon?.({
            color: isFocused ? '#ffffff' : '#9ca3af',
            size: 24,
            focused: isFocused,
          })}
        </View>

        {/* Soft Glow for Icon */}
        {isFocused && <Animated.View style={[styles.softGlow, glowStyle]} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    zIndex: 1000,
  },
  outerGlow: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
  glassBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  frostedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 30, 0.4)',
    backdropFilter: 'blur(20px)',
  },
  innerGradient: {
    flex: 1,
    paddingTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  activeBackground: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  iconWrapper: {
    zIndex: 2,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  softGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  neonLine: {
    height: 3,
    width: width * 0.6,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 2,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 15,
  },
});
