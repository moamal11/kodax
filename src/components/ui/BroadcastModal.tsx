/**
 * BroadcastModal.tsx
 *
 * مكون الرسائل المنبثقة من لوحة التحكم
 * يعرض رسالة منبثقة بشكل احترافي مع دعم الصور والإغلاق
 *
 * إصلاح جذري للتجمد:
 * 1. لا يُعرض الـ Modal في الـ DOM إطلاقاً عندما visible=false
 * 2. الأنميشن تُدار عبر onShow/onDismiss فقط
 * 3. لا يوجد أي overlay أو View تبقى بعد الإغلاق
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface BroadcastModalProps {
  visible: boolean;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  onClose: () => void;
}

export default function BroadcastModal({
  visible,
  title,
  body,
  imageUrl,
  onClose,
}: BroadcastModalProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  // حالة داخلية للتحكم الكامل بدورة الحياة
  const [internalVisible, setInternalVisible] = useState(false);

  // عندما يصبح visible = true → نعرض الـ Modal الداخلي
  React.useEffect(() => {
    if (visible) {
      setInternalVisible(true);
    }
  }, [visible]);

  // أنميشن الظهور عند عرض الـ Modal فعلياً
  const handleShow = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  // إغلاق بأنميشن ثم إزالة الـ Modal من الـ DOM بالكامل
  const handleClose = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.85, { duration: 150 }, () => {
      runOnJS(doClose)();
    });
  }, [onClose]);

  // إزالة كاملة من DOM ثم إبلاغ الأب
  const doClose = useCallback(() => {
    scale.value = 0.8;
    opacity.value = 0;
    setInternalVisible(false);
    onClose();
  }, [onClose]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // ⚡ حل جذري: لا نعرض أي شيء إذا لم يكن مرئياً
  if (!internalVisible) return null;

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      onShow={handleShow}
      statusBarTranslucent
      hardwareAccelerated
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[styles.cardContainer, animatedStyle]}>
              <LinearGradient
                colors={['#1e1e3a', '#151530', '#0f0f1e']}
                style={styles.card}
              >
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#9ca3af" />
                </TouchableOpacity>

                {/* Image */}
                {imageUrl ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={['#7c3aed', '#3b82f6']}
                      style={styles.iconCircle}
                    >
                      <Ionicons name="megaphone" size={28} color="#fff" />
                    </LinearGradient>
                  </View>
                )}

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Body */}
                {body ? <Text style={styles.body}>{body}</Text> : null}

                {/* Dismiss Button */}
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={handleClose}
                >
                  <Text style={styles.dismissText}>حسناً</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  body: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  dismissButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  dismissText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
  },
});
