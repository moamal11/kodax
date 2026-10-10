/**
 * زر الإشعارات داخل التطبيق: أيقونة بعدد غير المقروء + قائمة في ورقة (هاتف) أو نافذة صغيرة (Desktop).
 * البيانات من BadgeContext (app_notifications).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBadges } from '@/contexts/BadgeContext';
import { IconButton, Sheet, Text, Row, Col, EmptyState, useTheme, type IconName } from '@/design';

export interface Notification {
  id: string;
  type:
    | 'achievement'
    | 'like'
    | 'comment'
    | 'post'
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
  post: 'newspaper-outline',
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
  const [readError, setReadError] = useState('');
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

  const unreadKey = items.filter(n => !n.read).map(n => n.id).join('|');
  useEffect(() => {
    if (!visible || !unread || !ctx) return;
    let active = true;
    setReadError('');
    ctx.markAllAsRead().catch(() => { if (active) setReadError('تعذّر حفظ حالة القراءة. تُعاد المحاولة عند فتح الإشعارات مرة أخرى.'); });
    return () => { active = false; };
  }, [visible, unreadKey, ctx?.markAllAsRead]);
  const shown = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const dayKey = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  const groups = [
    { title: 'اليوم', items: shown.filter((n) => dayKey(n.timestamp) === today) },
    { title: 'أمس', items: shown.filter((n) => dayKey(n.timestamp) === yesterday) },
    { title: 'سابقًا', items: shown.filter((n) => ![today, yesterday].includes(dayKey(n.timestamp))) },
  ].filter((g) => g.items.length);
  const colorFor = (type: Notification['type']) => {
    if (['achievement', 'badge', 'level_up', 'streak', 'xp'].includes(type)) return { text: t.colors.xp, soft: t.colors.xpSoft };
    if (type === 'follow') return { text: t.colors.infoText, soft: t.colors.infoSoft };
    if (type === 'like') return { text: t.colors.dangerText, soft: t.colors.dangerSoft };
    if (['lesson', 'course', 'challenge'].includes(type)) return { text: t.colors.successText, soft: t.colors.successSoft };
    return { text: t.colors.brandText, soft: t.colors.brandSoft };
  };
  return (
    <>
      <IconButton
        icon="notifications-outline"
        label={unread ? `الإشعارات، ${unread} غير مقروءة` : 'الإشعارات'}
        onPress={() => {
          setReadError('');
          setVisible(true);
        }}
        badge={unread}
      />
      <Sheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="الإشعارات"
        maxWidth={520}
      >
        <Col gap={18}>
          <Row gap={12} style={{ paddingBottom: 4 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: t.colors.brandSoft, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={24} color={t.colors.brandText} />
            </View>
            <Col gap={3} flex={1}>
              <Text variant="heading">{unread ? `${unread} إشعارات بانتظارك` : 'أنت متابع كل جديد'}</Text>
              <Text variant="bodySm" tone="secondary">
                نشاط مجتمعك وإنجازاتك، في مكان واحد.
              </Text>
            </Col>
          </Row>
          {!!readError && <Text variant="bodySm" tone="danger" accessibilityRole="alert">{readError}</Text>}
          {shown.length === 0 ? (
            <EmptyState
              icon={items.length ? 'checkmark-done-outline' : 'notifications-off-outline'}
              title={items.length ? 'ماكو إشعارات غير مقروءة' : 'ماكو إشعارات بعد'}
              body={items.length ? 'اطّلعت على كل الجديد.' : 'تظهر هنا تفاعلات المجتمع وتقدمك في التعلم.'}
              compact
            />
          ) : (
            groups.map((g) => (
              <Col key={g.title} gap={8}>
                <Text variant="label" tone="secondary" weight="semibold">
                  {g.title}
                </Text>
                <Col gap={8}>
                  {g.items.map((n) => {
                    const color = colorFor(n.type);
                    return (
                      <Pressable
                        key={n.id}
                        onPress={() => {
                          setVisible(false);
                          onNotificationPress?.(n);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${n.read ? '' : 'غير مقروء: '}${n.title}. ${n.message}`}
                        style={({ pressed }) => ({
                          padding: 14,
                          minHeight: 88,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: n.read ? t.colors.border : t.colors.borderStrong,
                          backgroundColor: pressed ? t.colors.surfacePressed : n.read ? t.colors.surface : t.colors.surfaceSunken,
                        })}
                      >
                        <Row gap={12} align="flex-start">
                          <View
                            style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: color.soft, justifyContent: 'center', alignItems: 'center' }}
                          >
                            <Ionicons name={ICONS[n.type] ?? 'notifications-outline'} size={21} color={color.text} />
                          </View>
                          <Col flex={1} gap={5}>
                            <Row gap={8}>
                              <Text variant="bodySm" weight="semibold" style={{ flex: 1 }}>
                                {n.title}
                              </Text>
                              {!n.read && (
                                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.colors.brand }} accessibilityElementsHidden />
                              )}
                            </Row>
                            <Text variant="bodySm" tone="secondary">
                              {n.message}
                            </Text>
                            <Text variant="caption" tone="secondary">
                              {timeAgo(n.timestamp)}
                            </Text>
                          </Col>
                        </Row>
                      </Pressable>
                    );
                  })}
                </Col>
              </Col>
            ))
          )}
        </Col>
      </Sheet>
    </>
  );
}

export default NotificationButton;
