/**
 * صفحة المحادثة - Individual Conversation
 * Chat with another user in real-time
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks';
import {
  blockUser,
  unblockUser,
  isUserBlocked,
} from '@/services/codeFeedService';
import { showAlert } from '@/utils/crossPlatformAlert';
import ReportUserSheet from '@/components/social/ReportUserSheet';
import { showToast } from '@/components/ui/Toast';
import {
  getConversationDetail,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  editMessage,
  deleteMessage,
  ConversationDetail,
  Message,
} from '@/services/messageService';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== Helpers ====================

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  // If today, show time
  if (diffMins < 1440 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) {
    return 'أمس';
  }

  // Otherwise show date
  return date.toLocaleDateString('ar-IQ', {
    day: 'numeric',
    month: 'short',
  });
}

function getUserDisplayName(user: {
  full_name: string | null;
  username: string | null;
}): string {
  return user.full_name || user.username || 'مستخدم';
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ==================== Message Bubble ====================

interface MessageBubbleProps {
  message: Message & {
    sender: {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  };
  isOwn: boolean;
  onLongPress?: () => void;
}

const MessageBubble = React.memo(
  ({ message, isOwn, onLongPress }: MessageBubbleProps) => {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}
      >
        {!isOwn && (
          <View style={styles.avatarSmall}>
            {message.sender.avatar_url ? (
              <Image
                source={{ uri: message.sender.avatar_url }}
                style={styles.avatarSmallImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#7c3aed', '#a855f7']}
                style={styles.avatarSmallImage}
              >
                <Text style={styles.avatarSmallText}>
                  {getInitial(
                    getUserDisplayName({
                      full_name: message.sender.full_name,
                      username: message.sender.username,
                    })
                  )}
                </Text>
              </LinearGradient>
            )}
          </View>
        )}

        <TouchableOpacity
          onLongPress={() => {
            if (!message.is_deleted && onLongPress) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onLongPress();
            }
          }}
          activeOpacity={0.7}
          disabled={message.is_deleted}
        >
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
              message.is_deleted && styles.bubbleDeleted,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isOwn && styles.messageTextOwn,
                message.is_deleted && styles.messageTextDeleted,
              ]}
            >
              {message.content}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                style={[styles.messageTime, isOwn && styles.messageTimeOwn]}
              >
                {formatTimestamp(message.created_at)}
              </Text>
              {message.is_edited && !message.is_deleted && (
                <Text style={styles.editedLabel}>• معدلة</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ==================== Main Screen ====================

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { isLargeScreen } = useResponsiveLayout();

  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<
    Array<
      Message & {
        sender: {
          id: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
        };
      }
    >
  >([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [report, setReport] = useState<{ messageId: string | null; preview: string | null } | null>(null);

  // Edit/Delete modal state
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');

  const flatListRef = useRef<FlatList>(null);

  // Load conversation
  const loadConversation = useCallback(async () => {
    if (!id || !user?.id) return;

    const { data, error } = await getConversationDetail(id, user.id);
    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    if (data) {
      setConversation(data);
      setMessages(data.messages);
      if (data.other_user?.id) {
        isUserBlocked(data.other_user.id).then(setIsBlocked);
      }
      // Mark messages as read
      await markMessagesAsRead(id, user.id);
    }
    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Subscribe to new messages
  useEffect(() => {
    if (!id || !user?.id) return;

    console.log(
      '[ConversationScreen] Setting up real-time subscription for:',
      id
    );

    const unsubscribe = subscribeToMessages(id, {
      onInsert: (newMessage) => {
        console.log('[ConversationScreen] New message received:', newMessage);
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage as any];
        });
        // Mark as read if not sent by me
        if (newMessage.sender_id !== user.id) {
          markMessagesAsRead(id, user.id);
        }
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);
      },
      onUpdate: (updatedMessage) => {
        console.log('[ConversationScreen] Message updated:', updatedMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id
              ? { ...msg, ...updatedMessage, sender: msg.sender }
              : msg
          )
        );
      },
      onDelete: (deletedMessage) => {
        console.log('[ConversationScreen] Message deleted:', deletedMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === deletedMessage.id
              ? { ...msg, ...deletedMessage, sender: msg.sender }
              : msg
          )
        );
      },
    });

    return () => {
      console.log('[ConversationScreen] Cleaning up subscription');
      unsubscribe();
    };
  }, [id, user?.id]);

  // حظر / إلغاء حظر الطرف الآخر (user_blocks)
  const doToggleBlock = async () => {
    const otherId = conversation?.other_user?.id;
    if (!otherId || blockBusy) return;
    const name = getUserDisplayName(conversation!.other_user);
    setBlockBusy(true);
    const res = isBlocked ? await unblockUser(otherId) : await blockUser(otherId);
    setBlockBusy(false);
    if (!res.success) {
      showToast.error(
        isBlocked ? 'تعذّر إلغاء الحظر. حاول مرة أخرى.' : 'تعذّر الحظر. حاول مرة أخرى.'
      );
      return;
    }
    setIsBlocked(!isBlocked);
    showToast.success(isBlocked ? `تم إلغاء حظر ${name}` : `تم حظر ${name}`);
  };
  const handleBlockToggle = () => {
    if (!conversation?.other_user) return;
    const name = getUserDisplayName(conversation.other_user);
    showAlert(
      isBlocked ? `إلغاء حظر ${name}؟` : `حظر ${name}؟`,
      isBlocked
        ? 'ستتمكنان من تبادل الرسائل مجدداً.'
        : 'لن يستطيع مراسلتك ولن تستطيع مراسلته حتى تلغي الحظر. الرسائل السابقة تبقى كما هي.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: isBlocked ? 'إلغاء الحظر' : 'حظر',
          style: 'destructive',
          onPress: doToggleBlock,
        },
      ]
    );
  };

  // Send message
  const handleSend = async () => {
    if (!messageText.trim() || !id || !user?.id || sending) return;

    const content = messageText.trim();
    setMessageText('');
    setSending(true);

    const { data, error } = await sendMessage(id, user.id, content);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(content);
      // الحظر (بأي اتجاه) يُرفض على السيرفر عبر RLS
      if (error?.code === '42501' || String(error?.message ?? '').includes('row-level security')) {
        showToast.error('لا يمكن إرسال رسائل إلى هذا المستخدم.');
      } else {
        showToast.error('تعذّر إرسال الرسالة. حاول مرة أخرى.');
      }
    } else if (data) {
      // Optimistically add message to UI immediately
      const newMessage = {
        ...data,
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          username: user.user_metadata?.username || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      };

      setMessages((prev) => {
        // Check if already exists (from real-time)
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        return [...prev, newMessage as any];
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }

    setSending(false);
  };

  // Handle message long press
  const handleMessageLongPress = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg && msg.sender_id !== user?.id) {
      // رسالة من الطرف الآخر: الإبلاغ عنها
      setReport({ messageId, preview: msg.content });
      return;
    }
    setSelectedMessage(messageId);
    setShowMessageMenu(true);
  };

  // Handle edit message
  const handleEditMessage = () => {
    const message = messages.find((m) => m.id === selectedMessage);
    if (message) {
      setEditText(message.content);
      setShowMessageMenu(false);
      setEditModalVisible(true);
    }
  };

  // Confirm edit
  const confirmEdit = async () => {
    if (!editText.trim() || !selectedMessage) return;

    const { error } = await editMessage(selectedMessage, editText.trim());
    if (error) {
      console.error('Error editing message:', error);
      Alert.alert('خطأ', 'فشل تعديل الرسالة');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setEditModalVisible(false);
    setSelectedMessage(null);
    setEditText('');
  };

  // Handle delete message
  const handleDeleteMessage = () => {
    setShowMessageMenu(false);

    // ✅ استخدام confirm للويب و Alert للموبايل
    if (Platform.OS === 'web') {
      const confirmed = confirm('هل أنت متأكد من حذف هذه الرسالة؟');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert('حذف الرسالة', 'هل أنت متأكد من حذف هذه الرسالة؟', [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  };

  const performDelete = async () => {
    if (!selectedMessage) return;
    const { error } = await deleteMessage(selectedMessage);
    if (error) {
      console.error('Error deleting message:', error);
      if (Platform.OS === 'web') {
        alert('خطأ: فشل حذف الرسالة');
      } else {
        Alert.alert('خطأ', 'فشل حذف الرسالة');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSelectedMessage(null);
  };

  // Render message
  const renderItem = useCallback(
    ({ item }: { item: (typeof messages)[0] }) => (
      <MessageBubble
        message={item}
        isOwn={item.sender_id === user?.id}
        onLongPress={() => handleMessageLongPress(item.id)}
      />
    ),
    [user?.id, messages]
  );

  const keyExtractor = useCallback((item: (typeof messages)[0]) => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>جاري تحميل المحادثة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={60} color="#6b7280" />
          <Text style={styles.errorText}>لم يتم العثور على المحادثة</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = conversation.other_user;
  const displayName = getUserDisplayName(otherUser);
  const initial = getInitial(displayName);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.container, isLargeScreen && styles.containerWeb]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#d1d5db" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              {otherUser.avatar_url ? (
                <Image
                  source={{ uri: otherUser.avatar_url }}
                  style={styles.headerAvatar}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#7c3aed', '#a855f7']}
                  style={styles.headerAvatar}
                >
                  <Text style={styles.headerAvatarText}>{initial}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                onPress={() => router.push(`/user/${otherUser.id}` as any)}
              >
                <Text style={styles.headerName}>
                  {displayName}
                  <VerifiedBadge verified={otherUser.is_verified} size={15} />
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.backBtn, { marginRight: 8 }]}
              onPress={() => setReport({ messageId: null, preview: null })}
              accessibilityLabel="الإبلاغ عن المستخدم"
            >
              <Ionicons name="flag-outline" size={19} color="#fbbf24" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBlockToggle}
              disabled={blockBusy}
              accessibilityLabel={isBlocked ? 'إلغاء حظر المستخدم' : 'حظر المستخدم'}
            >
              {blockBusy ? (
                <ActivityIndicator size="small" color="#f87171" />
              ) : (
                <Ionicons
                  name={isBlocked ? 'ban' : 'ban-outline'}
                  size={20}
                  color="#f87171"
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={60}
                  color="#374151"
                />
                <Text style={styles.emptyText}>
                  ابدأ المحادثة مع {displayName}
                </Text>
              </View>
            }
          />

          {/* Input Area */}
          {isBlocked ? (
            <View style={styles.blockedBar}>
              <Text style={styles.blockedBarText}>
                لقد حظرت {displayName}. لا يمكنكما تبادل الرسائل.
              </Text>
              <TouchableOpacity
                style={styles.blockedBarBtn}
                onPress={handleBlockToggle}
                disabled={blockBusy}
                activeOpacity={0.7}
              >
                <Text style={styles.blockedBarBtnText}>إلغاء الحظر</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!messageText.trim() || sending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
            >
              <LinearGradient
                colors={
                  messageText.trim() && !sending
                    ? ['#8b5cf6', '#7c3aed']
                    : ['#374151', '#1f2937']
                }
                style={styles.sendBtnGradient}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color="#ffffff"
                    style={{ transform: [{ scaleX: -1 }] }}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TextInput
              style={[
                styles.input,
                Platform.OS === 'web' && ({ outline: 'none' } as any),
              ]}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#6b7280"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={5000}
              textAlign="right"
            />
          </View>
          )}
        </View>

        <ReportUserSheet
          visible={!!report}
          onClose={() => setReport(null)}
          userId={otherUser.id}
          userName={displayName}
          messageId={report?.messageId}
          messagePreview={report?.preview}
          hideBlock={isBlocked}
          onBlocked={() => setIsBlocked(true)}
        />

        {/* Message Menu Modal */}
        <Modal
          visible={showMessageMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMessageMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMessageMenu(false)}
          >
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={styles.menuContainer}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEditMessage}
              >
                <Ionicons name="create-outline" size={22} color="#8b5cf6" />
                <Text style={styles.menuItemText}>تعديل</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeleteMessage}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                  حذف
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Message Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.editContainer}
              >
                <Text style={styles.editTitle}>تعديل الرسالة</Text>

                <TextInput
                  style={[
                    styles.editInput,
                    Platform.OS === 'web' && ({ outline: 'none' } as any),
                  ]}
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="اكتب رسالة..."
                  placeholderTextColor="#6b7280"
                  multiline
                  maxLength={5000}
                  textAlign="right"
                  autoFocus
                />

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editBtn, styles.editBtnCancel]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setEditText('');
                    }}
                  >
                    <Text style={styles.editBtnTextCancel}>إلغاء</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editBtn,
                      styles.editBtnSave,
                      !editText.trim() && styles.editBtnDisabled,
                    ]}
                    onPress={confirmEdit}
                    disabled={!editText.trim()}
                  >
                    <LinearGradient
                      colors={
                        editText.trim()
                          ? ['#8b5cf6', '#7c3aed']
                          : ['#374151', '#1f2937']
                      }
                      style={styles.editBtnGradient}
                    >
                      <Text style={styles.editBtnTextSave}>حفظ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  containerWeb: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252550',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  messageContainerOwn: {
    flexDirection: 'row-reverse',
  },
  avatarSmall: {
    width: 28,
    height: 28,
  },
  avatarSmallImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  bubble: {
    maxWidth: '75%',
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      },
    }),
  },
  bubbleOther: {
    backgroundColor: '#1a1a3e',
    borderBottomLeftRadius: 6,
  },
  bubbleOwn: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 6,
  },
  bubbleDeleted: {
    backgroundColor: '#1f2937',
    opacity: 0.7,
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 6,
    flexShrink: 1,
  },
  messageTextOwn: {
    color: '#ffffff',
  },
  messageTextDeleted: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  messageTimeOwn: {
    color: '#e9d5ff',
  },
  editedLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Blocked bar
  blockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: '#252550',
    backgroundColor: '#0f0f1e',
  },
  blockedBarText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  blockedBarBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  blockedBarBtnText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },

  // Input
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: 1,
    borderTopColor: '#252550',
    gap: 8,
    backgroundColor: '#0f0f1e',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#252550',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Message Menu
  menuContainer: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 8,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#252550',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuItemDanger: {
    color: '#ef4444',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#252550',
    marginHorizontal: 8,
  },

  // Edit Modal
  editContainer: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#252550',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#252550',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editBtnCancel: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnSave: {
    overflow: 'hidden',
  },
  editBtnGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnDisabled: {
    opacity: 0.5,
  },
  editBtnTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  editBtnTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
