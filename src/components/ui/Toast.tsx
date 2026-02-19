/**
 * Toast.tsx
 *
 * Description: Notification toast system with slide animations and auto-dismiss
 * Features: Slide in/out animations, auto-dismiss, icon support, multiple types, stacking
 * Props: {message} - Toast message, {type} - Toast type, {duration} - Display duration
 *
 * @example
 * Toast.show('Success!', 'success', 3000);
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

interface ToastConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  backgroundColor: string;
}

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    icon: 'check-circle',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  error: {
    icon: 'error',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  warning: {
    icon: 'warning',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  info: {
    icon: 'info',
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const config = toastConfigs[type];

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    opacity.value = withTiming(1, { duration: 300 });

    // Auto dismiss
    const hideTimeout = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });

      setTimeout(() => {
        if (onHide) {
          onHide();
        }
      }, 300);
    }, duration);

    return () => clearTimeout(hideTimeout);
  }, [duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {Platform.OS === 'android' ? (
        <View
          style={[
            styles.blurContainer,
            { backgroundColor: 'rgba(15, 15, 30, 0.92)' },
          ]}
        >
          <View
            style={[
              styles.content,
              { backgroundColor: config.backgroundColor },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: config.color + '33' },
              ]}
            >
              <MaterialIcons
                name={config.icon}
                size={20}
                color={config.color}
              />
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </View>
      ) : (
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View
            style={[
              styles.content,
              { backgroundColor: config.backgroundColor },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: config.color + '33' },
              ]}
            >
              <MaterialIcons
                name={config.icon}
                size={20}
                color={config.color}
              />
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </BlurView>
      )}
    </Animated.View>
  );
}

// Toast Manager (for global usage)
let toastRef: ((toast: ToastProps) => void) | null = null;

export const ToastContainer = () => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: number })[]>(
    []
  );

  React.useEffect(() => {
    toastRef = (toast: ToastProps) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...toast, id }]);
    };

    return () => {
      toastRef = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[styles.toastWrapper, { top: 50 + index * 80 }]}
          pointerEvents="box-none"
        >
          <Toast
            {...toast}
            onHide={() => {
              removeToast(toast.id);
              toast.onHide?.();
            }}
          />
        </View>
      ))}
    </View>
  );
};

// Global toast functions
export const showToast = {
  success: (message: string, duration?: number) => {
    toastRef?.({ message, type: 'success', duration });
  },
  error: (message: string, duration?: number) => {
    toastRef?.({ message, type: 'error', duration });
  },
  warning: (message: string, duration?: number) => {
    toastRef?.({ message, type: 'warning', duration });
  },
  info: (message: string, duration?: number) => {
    toastRef?.({ message, type: 'info', duration });
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    pointerEvents: 'box-none',
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 20,
  },
});
