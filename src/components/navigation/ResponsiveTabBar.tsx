/**
 * ResponsiveTabBar.tsx
 *
 * Responsive Tab Bar - Bottom on mobile, Top on web/large screens
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  useWindowDimensions,
  Keyboard,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setTabBarMetrics } from './tabBarMetrics';

const MOBILE_BREAKPOINT = 768;

export function ResponsiveTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= MOBILE_BREAKPOINT;
  const isWeb = Platform.OS === 'web';
  const isTopBar = isLargeScreen && isWeb;

  // على الهاتف: إخفاء الشريط أثناء ظهور الكيبورد حتى لا يغطي حقول الكتابة
  // (على Android ترتفع النافذة مع الكيبورد فيرتفع الشريط فوق الحقل)
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    if (isWeb) return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [isWeb]);

  useEffect(() => {
    if (isTopBar) setTabBarMetrics({ bottom: 0 });
    else setTabBarMetrics({ top: 0 });
    if (keyboardOpen) setTabBarMetrics({ bottom: 0 });
  }, [isTopBar, keyboardOpen]);

  if (keyboardOpen && !isTopBar) return null;

  // On large screens (web), show as top bar
  if (isTopBar) {
    return (
      <View
        style={[styles.topBarContainer, { paddingTop: insets.top || 0 }]}
        onLayout={(e) => setTabBarMetrics({ top: e.nativeEvent.layout.height })}
      >
        <LinearGradient
          colors={
            ['rgba(15, 15, 30, 0.95)', 'rgba(30, 30, 50, 0.9)'] as [
              string,
              string,
              ...string[],
            ]
          }
          style={styles.topBarGradient}
        >
          {/* Top Neon Line */}
          <LinearGradient
            colors={
              [
                'rgba(88, 28, 135, 0.6)',
                'rgba(147, 51, 234, 0.6)',
                'rgba(88, 28, 135, 0.6)',
              ] as [string, string, ...string[]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topNeonLine}
          />

          <View style={styles.topBarContent}>
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

              return (
                <TopTabButton
                  key={route.key}
                  icon={options.tabBarIcon}
                  label={options.title as string}
                  isFocused={isFocused}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Mobile: Bottom bar
  return (
    <View
      onLayout={(e) => setTabBarMetrics({ bottom: e.nativeEvent.layout.height })}
      style={[
        styles.bottomContainer,
        {
          paddingBottom: Math.max(insets.bottom - 20, 0),
          paddingTop: insets.top || 0,
          height: isWeb ? 'auto' : undefined,
          maxHeight: isWeb ? 'auto' : undefined,
        },
      ]}
    >
      {/* Outer Glow */}
      <View style={styles.outerGlow} />

      <LinearGradient
        colors={
          ['rgba(15, 15, 30, 0.95)', 'rgba(30, 30, 50, 0.9)'] as [
            string,
            string,
            ...string[],
          ]
        }
        style={styles.bottomBarGradient}
      >
        <View style={styles.bottomBarContent}>
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

            return (
              <BottomTabButton
                key={route.key}
                icon={options.tabBarIcon}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>

        {/* Bottom Neon Line */}
        <LinearGradient
          colors={
            [
              'rgba(88, 28, 135, 0.7)',
              'rgba(147, 51, 234, 0.7)',
              'rgba(88, 28, 135, 0.7)',
            ] as [string, string, ...string[]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomNeonLine}
        />
      </LinearGradient>
    </View>
  );
}

// Top Tab Button (for web/large screens)
function TopTabButton({ icon, label, isFocused, onPress }: any) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={styles.topTabButton}
    >
      <Animated.View style={[styles.topTabContent, animatedStyle]}>
        {isFocused && (
          <LinearGradient
            colors={
              ['rgba(88, 28, 135, 0.4)', 'rgba(147, 51, 234, 0.3)'] as [
                string,
                string,
                ...string[],
              ]
            }
            style={styles.topTabBackground}
          />
        )}

        <View style={styles.topTabIcon}>
          {icon?.({
            color: isFocused ? '#ffffff' : '#9ca3af',
            size: 22,
            focused: isFocused,
          })}
        </View>

        {/* Active Indicator */}
        {isFocused && <View style={styles.topTabIndicator} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Bottom Tab Button (for mobile)
function BottomTabButton({ icon, isFocused, onPress }: any) {
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      style={styles.bottomTabButton}
    >
      <Animated.View style={[styles.bottomIconContainer, animatedStyle]}>
        {/* Icon Glow */}
        {isFocused && <Animated.View style={[styles.iconGlow, glowStyle]} />}

        {/* Active Background */}
        {isFocused && (
          <LinearGradient
            colors={
              ['rgba(88, 28, 135, 0.4)', 'rgba(147, 51, 234, 0.3)'] as [
                string,
                string,
                ...string[],
              ]
            }
            style={styles.activeBackground}
          />
        )}

        {/* Icon */}
        <View
          style={[
            styles.iconWrapper,
            Platform.OS !== 'web' ? { shadowColor: '#ffffff' } : undefined,
          ]}
        >
          {icon?.({
            color: isFocused ? '#ffffff' : '#9ca3af',
            size: 24,
            focused: isFocused,
          })}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Top Bar (Web/Large Screens)
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  topBarGradient: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.3)',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 12,
    gap: 8,
  },
  topTabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topTabBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  topTabIcon: {
    zIndex: 2,
  },
  topTabIndicator: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#9333ea',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  topNeonLine: {
    height: 2,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },

  // Bottom Bar (Mobile)
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  outerGlow: {
    position: 'absolute',
    top: -15,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    shadowColor: `${Platform.OS === 'web' ? 'rgba(147, 51, 234, 0)' : '#8b5cf6'}`,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBarGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomIconContainer: {
    position: 'relative',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  activeBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 51, 234, 0.5)',
  },
  iconWrapper: {
    zIndex: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomNeonLine: {
    height: 3,
    width: '50%',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 3,
    borderRadius: 2,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 12,
  },
});
