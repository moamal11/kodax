/**
 * LockedFeatureOverlay.tsx
 *
 * Beautiful overlay for locked features with CTA to subscribe
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface LockedFeatureOverlayProps {
  title?: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onUnlock: () => void;
  style?: ViewStyle;
}

export function LockedFeatureOverlay({
  title = 'ميزة مدفوعة',
  message = 'اشترك للوصول لهذه الميزة',
  icon = 'lock',
  onUnlock,
  style,
}: LockedFeatureOverlayProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, style]}
    >
      <View style={styles.blur}>
        <LinearGradient
          colors={
            ['rgba(15, 15, 30, 0.98)', 'rgba(15, 15, 30, 0.95)'] as [
              string,
              string,
              ...string[],
            ]
          }
          style={styles.gradient}
        >
          <Animated.View
            entering={ZoomIn.delay(200).duration(400)}
            style={styles.iconContainer}
          >
            <View style={styles.iconBg}>
              <MaterialIcons name={icon} size={48} color="#8b5cf6" />
            </View>
          </Animated.View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.unlockButton}
            onPress={onUnlock}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8b5cf6', '#a855f7'] as [string, string, ...string[]]}
              style={styles.unlockGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons
                name="workspace-premium"
                size={24}
                color="#ffffff"
              />
              <Text style={styles.unlockText}>اشترك الآن</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  unlockButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
});
