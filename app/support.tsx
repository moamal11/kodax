/**
 * صفحة المساعدة والدعم - Help & Support
 * نموذج بسيط: فقط اكتب رسالتك + عرض المحادثات السابقة مع ردود الأدمن
 * البيانات (اسم، بريد، صورة) تُجلب تلقائياً من حساب المستخدم
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from './_layout';
import {
  supportService,
  SupportTicket,
  SupportMessage,
  SupportNotification,
} from '@/services/supportService';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: 'logo-instagram' as const,
    color: '#E1306C',
    url: 'https://instagram.com/mo_nz.0',
  },
  {
    name: 'TikTok',
    icon: 'logo-tiktok' as const,
    color: '#fff',
    url: 'https://tiktok.com/@irq.dv',
  },
  {
    name: 'Telegram',
    icon: 'paper-plane' as const,
    color: '#0088cc',
    url: 'https://t.me/mo7za',
  },
];

type ViewMode = 'compose' | 'tickets' | 'chat';

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width > 768;

  const [viewMode, setViewMode] = useState<ViewMode>('compose');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // التذاكر والمحادثات
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notifications, setNotifications] = useState<SupportNotification[]>([]);

  const scrollRef = useRef<ScrollView>(null);
  const messageRef = useRef<TextInput>(null);

  // جلب التذاكر والإشعارات
  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    const data = await supportService.getUserTickets();
    setTickets(data);
    setLoadingTickets(false);
  }, []);

  const loadNotifications = useCallback(async () => {
    const data = await supportService.getUnreadNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    loadTickets();
    loadNotifications();
  }, [loadTickets, loadNotifications]);

  // الاشتراك في إشعارات جديدة
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = supportService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // إذا كنا في محادثة نفس التذكرة، أعد تحميل الرسائل
        if (selectedTicket?.id === notification.ticket_id) {
          loadChatMessages(notification.ticket_id!);
        }
      }
    );
    return unsubscribe;
  }, [user?.id, selectedTicket?.id]);

  // جلب رسائل تذكرة
  const loadChatMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const msgs = await supportService.getTicketMessages(ticketId);
    setChatMessages(msgs);
    setLoadingMessages(false);
    // تعليم الإشعارات كمقروءة
    await supportService.markNotificationsRead(ticketId);
    setNotifications((prev) => prev.filter((n) => n.ticket_id !== ticketId));
  };

  // فتح محادثة تذكرة
  const openTicketChat = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewMode('chat');
    loadChatMessages(ticket.id);

    // الاشتراك في رسائل جديدة
    const unsubscribe = supportService.subscribeToTicketMessages(
      ticket.id,
      (newMsg) => {
        setChatMessages((prev) => [...prev, newMsg]);
      }
    );

    return unsubscribe;
  };

  // إرسال رسالة دعم جديدة
  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة رسالتك');
      return;
    }

    setSending(true);
    const result = await supportService.createTicket({
      message: message.trim(),
    });

    setSending(false);

    if (result.success) {
      setSent(true);
      setMessage('');
      loadTickets();
      setTimeout(() => setSent(false), 4000);
    } else {
      Alert.alert('خطأ', result.error || 'فشل في إرسال الرسالة');
    }
  };

  // إرسال رد في محادثة موجودة
  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    const success = await supportService.sendMessage(
      selectedTicket.id,
      replyText.trim()
    );

    if (success) {
      setReplyText('');
      loadChatMessages(selectedTicket.id);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوحة';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'تم الحل';
      case 'closed':
        return 'مغلقة';
      default:
        return status;
    }
  };

  // ===== عرض محادثة التذكرة =====
  const renderChatView = () => (
    <View style={{ flex: 1 }}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => {
            setViewMode('tickets');
            setSelectedTicket(null);
          }}
          style={styles.chatBackBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#e2e8f0" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatTitle}>{selectedTicket?.subject}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: getStatusColor(selectedTicket?.status || ''),
                },
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusText(selectedTicket?.status || '')}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {chatMessages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={FadeIn.duration(200)}
              style={[
                styles.msgBubble,
                msg.sender_type === 'user'
                  ? styles.msgBubbleUser
                  : styles.msgBubbleAdmin,
              ]}
            >
              {msg.sender_type === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#7c3aed" />
                  <Text style={styles.adminBadgeText}>فريق الدعم</Text>
                </View>
              )}
              <Text
                style={[
                  styles.msgText,
                  msg.sender_type === 'admin' && { color: '#e2e8f0' },
                ]}
              >
                {msg.message}
              </Text>
              <Text style={styles.msgTime}>
                {new Date(msg.created_at).toLocaleString('ar-IQ', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Reply Input */}
      {selectedTicket?.status !== 'closed' && (
        <View
          style={[
            styles.replyBar,
            { paddingBottom: Math.max(12, insets.bottom + 8) },
          ]}
        >
          <TextInput
            style={[
              styles.replyInput,
              Platform.OS === 'web' && ({ outline: 'none' } as any),
            ]}
            placeholder="اكتب ردك..."
            placeholderTextColor="#4b5563"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[styles.replySendBtn, !replyText.trim() && { opacity: 0.4 }]}
            onPress={handleReply}
            disabled={!replyText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color="#fff"
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ===== عرض قائمة التذاكر =====
  const renderTicketsList = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isLargeScreen && { maxWidth: 700, alignSelf: 'center', width: '100%' },
      ]}
    >
      <View style={styles.ticketActions}>
        <TouchableOpacity
          style={styles.newTicketBtn}
          onPress={() => setViewMode('compose')}
        >
          <Ionicons name="add-circle" size={20} color="#7c3aed" />
          <Text style={styles.newTicketBtnText}>رسالة جديدة</Text>
        </TouchableOpacity>
      </View>

      {loadingTickets ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
      ) : tickets.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color="#4b5563" />
          <Text style={styles.emptyText}>لا توجد رسائل سابقة</Text>
        </View>
      ) : (
        tickets.map((ticket) => {
          const hasNotif = notifications.some((n) => n.ticket_id === ticket.id);
          return (
            <TouchableOpacity
              key={ticket.id}
              style={[styles.ticketCard, hasNotif && styles.ticketCardNotif]}
              onPress={() => openTicketChat(ticket)}
              activeOpacity={0.7}
            >
              <View style={styles.ticketRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  <Text style={styles.ticketDate}>
                    {new Date(ticket.updated_at).toLocaleString('ar-IQ', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.ticketRight}>
                  <View
                    style={[
                      styles.ticketStatusBadge,
                      { backgroundColor: getStatusColor(ticket.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ticketStatusText,
                        { color: getStatusColor(ticket.status) },
                      ]}
                    >
                      {getStatusText(ticket.status)}
                    </Text>
                  </View>
                  {hasNotif && <View style={styles.notifDot} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  // ===== عرض نموذج الإرسال =====
  const renderComposeView = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isLargeScreen && { maxWidth: 700, alignSelf: 'center', width: '100%' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text style={styles.sectionTitle}>تواصل معنا</Text>
        <Text style={styles.sectionSubtitle}>
          اكتب رسالتك وسنرد عليك بأسرع وقت ممكن
        </Text>

        <View style={styles.formCard}>
          {/* عرض معلومات المستخدم تلقائياً */}
          <View style={styles.userInfoRow}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={18} color="#a78bfa" />
            </View>
            <View>
              <Text style={styles.userName}>
                {(user as any)?.user_metadata?.full_name ||
                  (user as any)?.email?.split('@')[0] ||
                  'مستخدم'}
              </Text>
              <Text style={styles.userEmail}>{(user as any)?.email || ''}</Text>
            </View>
          </View>

          {/* Chat-style bubble */}
          <View style={styles.chatBubbleLeft}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#a78bfa" />
            <Text style={styles.chatBubbleText}>
              مرحبا! كيف يمكننا مساعدتك؟
            </Text>
          </View>

          {/* Message Input */}
          <View
            style={[
              styles.inputWrapper,
              { minHeight: 140, alignItems: 'flex-start' },
            ]}
          >
            <TextInput
              ref={messageRef}
              style={[
                styles.input,
                {
                  minHeight: 120,
                  textAlignVertical: 'top',
                  paddingTop: 14,
                },
                Platform.OS === 'web' && ({ outline: 'none' } as any),
              ]}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="#4b5563"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, sending && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="send"
                  size={18}
                  color="#fff"
                  style={{ transform: [{ scaleX: -1 }] }}
                />
                <Text style={styles.sendButtonText}>إرسال الرسالة</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Success Message */}
          {sent && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.successText}>
                تم إرسال رسالتك بنجاح! سنرد عليك قريبا
              </Text>
            </View>
          )}
        </View>

        {/* عرض التذاكر السابقة إن وجدت */}
        {tickets.length > 0 && (
          <TouchableOpacity
            style={styles.viewTicketsBtn}
            onPress={() => setViewMode('tickets')}
          >
            <Ionicons name="chatbubbles" size={18} color="#a78bfa" />
            <Text style={styles.viewTicketsBtnText}>
              عرض الرسائل السابقة ({tickets.length})
            </Text>
            {notifications.length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Social Links */}
      <Animated.View entering={FadeInDown.delay(250).duration(500)}>
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>تابعنا على</Text>
        <View style={styles.socialGrid}>
          {SOCIAL_LINKS.map((social, i) => (
            <TouchableOpacity
              key={i}
              style={styles.socialCard}
              onPress={() => openLink(social.url)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.socialIconWrap,
                  { backgroundColor: `${social.color}15` },
                ]}
              >
                <Ionicons name={social.icon} size={24} color={social.color} />
              </View>
              <Text style={styles.socialName}>{social.name}</Text>
              <Ionicons name="open-outline" size={14} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (viewMode === 'chat') {
              setViewMode('tickets');
              setSelectedTicket(null);
            } else if (viewMode === 'tickets') {
              setViewMode('compose');
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {viewMode === 'chat'
            ? 'المحادثة'
            : viewMode === 'tickets'
              ? 'الرسائل السابقة'
              : 'المساعدة والدعم'}
        </Text>
        <View style={{ width: 40 }}>
          {viewMode === 'compose' && notifications.length > 0 && (
            <TouchableOpacity
              onPress={() => setViewMode('tickets')}
              style={styles.headerNotifBtn}
            >
              <Ionicons name="chatbubbles" size={20} color="#a78bfa" />
              <View style={styles.headerNotifDot} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {viewMode === 'compose' && renderComposeView()}
        {viewMode === 'tickets' && renderTicketsList()}
        {viewMode === 'chat' && renderChatView()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  headerNotifBtn: {
    position: 'relative',
    padding: 8,
  },
  headerNotifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 22,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 14,
    marginBottom: 16,
  },
  chatBubbleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 14,
    color: '#c4b5fd',
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
    paddingVertical: 14,
    width: '100%',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  successText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  viewTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.15)',
  },
  viewTicketsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a78bfa',
  },
  notifBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  ticketActions: {
    marginBottom: 16,
  },
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  newTicketBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7c3aed',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  ticketCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  ticketCardNotif: {
    borderColor: 'rgba(124, 58, 237, 0.3)',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  ticketRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ticketStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  chatBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  chatContent: {
    padding: 16,
    gap: 10,
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    gap: 6,
  },
  msgBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  msgBubbleAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomLeftRadius: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#a78bfa',
    fontWeight: '600',
  },
  msgText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  msgTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    alignSelf: 'flex-end',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0a1a',
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#e2e8f0',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  replySendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialGrid: {
    gap: 10,
    marginBottom: 32,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  socialIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
  },
});
