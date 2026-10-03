/**
 * قياس شريط التبويبات الفعلي (يُرسم فوق الصفحات بموضع absolute).
 * الصفحات التي فيها حقل كتابة أسفل الشاشة (مثل صفحة المساعد) تستخدم الارتفاع الحقيقي
 * بدل رقم تقديري، حتى لا يختفي الحقل خلف الشريط.
 */
import { useEffect, useState } from 'react';

export interface TabBarMetrics {
  /** ارتفاع الشريط السفلي (الهاتف) — 0 إذا كان مخفياً */
  bottom: number;
  /** ارتفاع الشريط العلوي (الويب على الشاشات الكبيرة) */
  top: number;
}

let metrics: TabBarMetrics = { bottom: 0, top: 0 };
const listeners = new Set<(m: TabBarMetrics) => void>();

export function setTabBarMetrics(patch: Partial<TabBarMetrics>) {
  const next = { ...metrics, ...patch };
  if (next.bottom === metrics.bottom && next.top === metrics.top) return;
  metrics = next;
  listeners.forEach((l) => l(metrics));
}

export function useTabBarMetrics(): TabBarMetrics {
  const [m, setM] = useState(metrics);
  useEffect(() => {
    listeners.add(setM);
    setM(metrics);
    return () => {
      listeners.delete(setM);
    };
  }, []);
  return m;
}
