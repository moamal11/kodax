/**
 * زر الإشعارات داخل التطبيق: أيقونة بعدد غير المقروء + قائمة في ورقة (هاتف) أو نافذة صغيرة (Desktop).
 * البيانات من BadgeContext (app_notifications).
 */
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBadges } from '@/contexts/BadgeContext';
import { IconButton, Sheet, Text, Row, EmptyState, Button, useTheme, type IconName } from '@/design';

export interface Notification {
  id: string;
  type:
    | 'achievement'
    | 'like'
    | 'comment'
    | 'follow'
    | 'system'
    | 'badge'
    | 'level_up'
    | 'challenge'
    | 'lesson'
    | 'course'
    | 'streak'
    | 'xp'
    // أنواع قديمة من نظام الدفع الملغى — لعرض السجل القديم فقط
    | 'purchase'
    | 'payment_approved'
    | 'payment_rejected';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  metadata?: any;
}

interface NotificationButtonProps {
  userId: string;
  onNotificationPress?: (notification: Notification) => void;
}

const ICONS: Partial<Record<Notification['type'], IconName>> = {
  like: 'heart-outline',
  comment: 'chatbox-outline',
  follow: 'person-add-outline',
  badge: 'ribbon-outline',
  achievement: 'trophy-outline',
  level_up: 'trending-up-outline',
  lesson: 'book-outline',
  course: 'school-outline',
  challenge: 'code-slash-outline',
  streak: 'flame-outline',
  xp: 'flash-outline',
  system: 'information-circle-outline',
};

export function timeAgo(d: Date): string {
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'الآن';
  const m = Math.floor(s / 60);
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const days = Math.floor(h / 24);
  if (days < 7) return days === 1 ? 'أمس' : `قبل ${days} أيام`;
  return d.toLocaleDateString('ar-IQ-u-nu-latn', { day: 'numeric', month: 'short', timeZone: 'Asia/Baghdad' });
}

export function NotificationButton({ onNotificationPress }: NotificationButtonProps) {
  const t = useTheme();
  const [visible, setVisible] = useState(false);
  let ctx: ReturnType<typeof useBadges> | null = null;
  try {
    ctx = useBadges();
  } catch {
    ctx = null;
  }
  const unread = ctx?.unreadCount ?? 0;
  const items: Notification[] = useMemo(
    () =>
      (ctx?.notifications ?? []).map((n) => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        read: n.read,
        timestamp: new Date(n.timestamp),
        metadata: n.metadata,
      })),
    [ctx?.notifications]
  );

  return (
    <>
      <IconButton icon="notifications-outline" label={unread ? `الإشعارات، ${unread} غير مقروءة` : 'الإشعارات'} onPress={() => setVisible(true)} badge={unread} />
      <Sheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="الإشعارات"
        maxWidth={440}
        footer={unread > 0 ? <Button label="تعليم الكل كمقروء" variant="secondary" icon="checkmark-done-outline" onPress={() => ctx?.markAllAsRead()} full /> : undefined}
      >
        {items.length === 0 ? (
          <EmptyState icon="notifications-off-outline" title="ماكو إشعارات بعد" body="هنا تظهر الإعجابات والتعليقات والمتابعات وإنجازاتك." compact />
        ) : (
          <View style={{ gap: 2 }}>
            {items.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => {
                  if (!n.read) ctx?.markAsRead(n.id);
                  setVisible(false);
                  onNotificationPress?.(n);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${n.read ? '' : 'غير مقروء: '}${n.title}. ${n.message}`}
                style={(s: any) => ({ borderRadius: t.radius.md, backgroundColor: s.pressed || s.hovered ? t.colors.surfacePressed : 'transparent' })}
              >
                <Row gap={12} align="flex-start" style={{ paddingVertical: 10, paddingHorizontal: 8 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: n.read ? t.colors.surfaceSunken : t.colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={ICONS[n.type] ?? 'notifications-outline'} size={18} color={n.read ? t.colors.textMuted : t.colors.brandText} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Row justify="space-between" gap={8}>
                      <Text variant="label" weight={n.read ? 'medium' : 'semibold'} numberOfLines={1} style={{ flex: 1 }}>
                        {n.title}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {timeAgo(n.timestamp)}
                      </Text>
                    </Row>
                    <Text variant="bodySm" tone={n.read ? 'muted' : 'secondary'} numberOfLines={3}>
                      {n.message}
                    </Text>
                  </View>
                  {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.brand, marginTop: 6 }} accessibilityElementsHidden />}
                </Row>
              </Pressable>
            ))}
          </View>
        )}
      </Sheet>
    </>
  );
}

export default NotificationButton;
