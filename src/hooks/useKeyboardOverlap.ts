/**
 * مقدار تغطية الكيبورد لعنصر (عادةً جذر الصفحة) على Android.
 *
 * مع edge-to-edge (Expo 54: edgeToEdgeEnabled) لا يصغّر Android النافذة عند ظهور الكيبورد
 * (adjustResize لم يعد يعمل)، فيغطي الكيبورد حقول الكتابة أسفل الشاشة. هذا الـhook يحسب
 * الجزء المغطّى فعلاً من العنصر: إذا صغّر النظام النافذة بنفسه (أجهزة/إعدادات أخرى)
 * تكون النتيجة 0، فلا تتضاعف المسافة.
 * على iOS والويب يرجع 0 (iOS يستخدم KeyboardAvoidingView).
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, Platform, type View } from 'react-native';
import { keyboardOverlapForFrame } from '@/utils/keyboardGeometry';

export function useKeyboardOverlap(targetRef: RefObject<View | null>): number {
  const [overlap, setOverlap] = useState(0);
  const lastScreenY = useRef<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      const screenY = lastScreenY.current;
      if (screenY == null) return;
      targetRef.current?.measureInWindow((_x, y, _w, h) => {
        if (alive && lastScreenY.current === screenY) setOverlap(keyboardOverlapForFrame(y, h, screenY));
      });
    };
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      lastScreenY.current = e.endCoordinates.screenY;
      measure();
      // إعادة القياس بعد استقرار التخطيط (بعض الأجهزة تغيّر حجم النافذة بعد الحدث)
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 150);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      lastScreenY.current = null;
      if (timer) clearTimeout(timer);
      setOverlap(0);
    });
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      show.remove();
      hide.remove();
    };
  }, [targetRef]);

  return overlap;
}
