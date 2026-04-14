/**
 * Modal.tsx
 *
 * Description: Full-screen modal with backdrop blur and smooth animations
 * Features: Slide animation, blur background, escape to close, customizable content
 * Props: {visible} - Show/hide modal, {onClose} - Close handler, {children} - Modal content
 *
 * @example
 * <Modal visible={isVisible} onClose={handleClose}>
 *   <Text>Modal Content</Text>
 * </Modal>
 */

import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  BackHandler,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Types
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  animationType?: 'slide' | 'fade' | 'scale';
}

export function Modal({
  visible,
  onClose,
  children,
  closeOnBackdrop = true,
  animationType = 'slide',
}: ModalProps) {
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(1000);
  const scale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animations
      backdropOpacity.value = withTiming(1, { duration: 300 });

      if (animationType === 'slide') {
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 300,
        });
      } else if (animationType === 'scale') {
        scale.value = withSpring(1, {
          damping: 20,
          stiffness: 300,
        });
      }

      contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Hide animations
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(1000, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
      contentOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, animationType]);

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [visible, onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: contentOpacity.value,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: contentOpacity.value,
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const getContentStyle = () => {
    switch (animationType) {
      case 'slide':
        return slideStyle;
      case 'scale':
        return scaleStyle;
      case 'fade':
        return fadeStyle;
      default:
        return slideStyle;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop with Blur */}
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Content */}
      <SafeAreaView style={styles.container} pointerEvents="box-none">
        <TouchableWithoutFeedback>
          <Animated.View style={[styles.content, getContentStyle()]}>
            {children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
});
