/**
 * رسائل قصيرة غير حاجبة: أعلى الشاشة في الوسط، 3 كحد أقصى، تختفي تلقائياً أو بالضغط.
 * الواجهة: showToast.success|error|warning|info(message, duration?)
 */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useReducedMotion, Text, Row } from '@/design';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastRef: ((t: Omit<ToastConfig, 'id'>) => void) | null = null;
let nextId = 1;

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

function ToastItem({ cfg, onHide }: { cfg: ToastConfig; onHide: (id: number) => void }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    const timer = setTimeout(() => onHide(cfg.id), cfg.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [cfg.id]);
  const color = { success: t.colors.successText, error: t.colors.dangerText, warning: t.colors.warningText, info: t.colors.infoText }[cfg.type];
  return (
    <Animated.View entering={reduced ? undefined : FadeInUp.duration(200)} exiting={reduced ? undefined : FadeOutUp.duration(180)}>
      <Pressable onPress={() => onHide(cfg.id)} accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityLabel={cfg.message} accessibilityHint="اضغط للإغلاق">
        <Row
          gap={10}
          style={{
            backgroundColor: t.colors.surfaceRaised,
            borderWidth: 1,
            borderColor: t.colors.borderStrong,
            borderRadius: t.radius.md,
            paddingHorizontal: 14,
            paddingVertical: 10,
            minHeight: 48,
          }}
        >
          <Ionicons name={ICON[cfg.type]} size={20} color={color} />
          <Text variant="bodySm" weight="medium" style={{ flex: 1 }} numberOfLines={3}>
            {cfg.message}
          </Text>
        </Row>
      </Pressable>
    </Animated.View>
  );
}

export const ToastContainer = () => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  useEffect(() => {
    toastRef = (cfg) =>
      setToasts((prev) => {
        // نفس الرسالة المكررة لا تتراكم
        if (prev.some((p) => p.message === cfg.message)) return prev;
        return [...prev, { ...cfg, id: nextId++ }].slice(-3);
      });
    return () => {
      toastRef = null;
    };
  }, []);
  const hide = (id: number) => setToasts((prev) => prev.filter((p) => p.id !== id));
  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 10, left: 12, right: 12, alignItems: 'center', zIndex: 10000 }}>
      <View pointerEvents="box-none" style={{ width: '100%', maxWidth: 440, gap: 8 }}>
        {toasts.map((cfg) => (
          <ToastItem key={cfg.id} cfg={cfg} onHide={hide} />
        ))}
      </View>
    </View>
  );
};

/** للتوافق: مكون Toast مفرد (غير مستخدم مباشرة في التطبيق) */
export function Toast({ message, type = 'info', duration = 3000, onHide }: { message: string; type?: ToastType; duration?: number; onHide?: () => void }) {
  return <ToastItem cfg={{ id: 0, message, type, duration }} onHide={() => onHide?.()} />;
}

export const showToast = {
  success: (message: string, duration?: number) => toastRef?.({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => toastRef?.({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) => toastRef?.({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) => toastRef?.({ message, type: 'info', duration }),
};

export default Toast;
