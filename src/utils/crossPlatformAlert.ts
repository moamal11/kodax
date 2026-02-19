/**
 * crossPlatformAlert.ts
 * بديل متعدد المنصات لـ Alert.alert
 * يعمل على Mobile و Web بدون مشاكل
 */

import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * عرض تنبيه متوافق مع جميع المنصات
 * - على Mobile: يستخدم Alert.alert الأصلي
 * - على Web: يستخدم window.confirm / window.alert
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS !== 'web') {
    // Native: استخدم Alert.alert العادي
    Alert.alert(title, message, buttons);
    return;
  }

  // Web: استخدم confirm/alert المتصفح
  if (!buttons || buttons.length === 0) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  // زر واحد فقط (معلومات)
  if (buttons.length === 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    buttons[0].onPress?.();
    return;
  }

  // زران: cancel + action (confirm dialog)
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const actionButton = buttons.find((b) => b.style !== 'cancel') || buttons[1];

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);

  if (confirmed) {
    actionButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
