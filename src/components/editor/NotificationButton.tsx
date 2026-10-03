/**
 * NotificationButton.tsx
 *
 * Real-time notification button with badge and dropdown
 * يستخدم بيانات حقيقية من نظام الإشعارات
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useBadges } from '@/contexts/BadgeContext';

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

export function NotificationButton({
  userId,
  onNotificationPress,
}: NotificationButtonProps) {
  const [visible, setVisible] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const bellScale = useSharedValue(1);

  // استخدام بيانات حقيقية من BadgeContext
  let badgeContext: ReturnType<typeof useBadges> | null = null;
  try {
    badgeContext = useBadges();
  } catch {
    // BadgeProvider غير متاح - سيعمل بدون إشعارات حقيقية
  }

  const unreadCount = badgeContext?.unreadCount ?? 0;

  // Animation for bell icon when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      bellScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 150 }),
          withTiming(1, { duration: 150 })
        ),
        2,
        false
      );
    }
  }, [unreadCount]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  // تحويل الإشعارات الحقيقية للعرض
  useEffect(() => {
    if (badgeContext?.notifications) {
      const mapped: Notification[] = badgeContext.notifications.map((n) => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        read: n.read,
        timestamp: new Date(n.timestamp),
        metadata: n.metadata,
      }));
      setDisplayNotifications(mapped);
    }
  }, [badgeContext?.notifications]);

  const markAsRead = async (notificationId: string) => {
    if (badgeContext) {
      await badgeContext.markAsRead(notificationId);
    }
  };

  const markAllAsRead = async () => {
    if (badgeContext) {
      await badgeContext.markAllAsRead();
    }
  };

  return (
    <>
      {/* Notification Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Animated.View style={bellStyle}>
          <MaterialIcons name="notifications" size={24} color="#ffffff" />
        </Animated.View>
        {unreadCount > 0 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.badge}>
            <LinearGradient
              colors={['#8b5cf6', '#a855f7'] as [string, string, ...string[]]}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Notification Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color="#8b5cf6"
                  />
                  <Text style={styles.headerTitle}>الإشعارات</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={markAllAsRead}
                >
                  <MaterialIcons name="done-all" size={18} color="#a855f7" />
                  <Text style={styles.markAllText}>تحديد الكل كمقروء</Text>
                </TouchableOpacity>
              )}

              {/* Notification List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
              ) : displayNotifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="notifications-none"
                    size={64}
                    color="#4b5563"
                  />
                  <Text style={styles.emptyText}>لا توجد إشعارات</Text>
                  <Text style={styles.emptySubtext}>
                    أنت على اطلاع بكل جديد!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={displayNotifications}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <NotificationCard
                      notification={item}
                      index={index}
                      onPress={() => {
                        markAsRead(item.id);
                        onNotificationPress?.(item);
                        setVisible(false);
                      }}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function NotificationCard({
  notification,
  index,
  onPress,
}: {
  notification: Notification;
  index: number;
  onPress: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'achievement':
      case 'badge':
        return 'emoji-events';
      case 'level_up':
        return 'trending-up';
      case 'challenge':
        return 'extension';
      case 'lesson':
        return 'school';
      case 'course':
        return 'verified';
      case 'streak':
        return 'local-fire-department';
      case 'xp':
        return 'flash-on';
      case 'like':
        return 'favorite';
      case 'comment':
        return 'chat-bubble';
      case 'follow':
        return 'person-add';
      case 'purchase':
        return 'shopping-cart';
      case 'payment_approved':
        return 'check-circle';
      case 'payment_rejected':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'achievement':
      case 'badge':
        return '#f59e0b';
      case 'level_up':
        return '#8b5cf6';
      case 'challenge':
        return '#10b981';
      case 'lesson':
        return '#3b82f6';
      case 'course':
        return '#06b6d4';
      case 'streak':
        return '#ef4444';
      case 'xp':
        return '#eab308';
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      case 'follow':
        return '#10b981';
      case 'purchase':
        return '#a855f7';
      case 'payment_approved':
        return '#10b981';
      case 'payment_rejected':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !notification.read && styles.notificationCardUnread,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getIconColor()}20` },
          ]}
        >
          <MaterialIcons name={getIcon()} size={24} color={getIconColor()} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.timestamp)}
          </Text>
        </View>

        {!notification.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    includeFontPadding: false,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: '#0f0f1e',
  },
  modal: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  unreadBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a855f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    marginLeft: 8,
  },
});
