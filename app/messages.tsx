/**
 * صفحة المحادثات - Messages List
 * View all conversations with other users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';
import { getConversations, Conversation } from '@/services/messageService';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== Helpers ====================

function formatTimestamp(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return `${Math.floor(days / 30)} شهر`;
  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  if (minutes > 0) return `${minutes} دقيقة`;
  return 'الآن';
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

// ==================== Conversation Card ====================

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}

const ConversationCard = React.memo(
  ({ conversation, currentUserId, onPress }: ConversationCardProps) => {
    const { other_user, last_message, unread_count } = conversation;
    const displayName = getUserDisplayName(other_user);
    const initial = getInitial(displayName);

    const isUnread = unread_count > 0;
    const isSentByMe = last_message?.sender_id === currentUserId;

    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={[styles.card, isUnread && styles.cardUnread]}>
            {/* Avatar with Online Indicator */}
            <View style={styles.avatarSection}>
              {other_user.avatar_url ? (
                <Image
                  source={{ uri: other_user.avatar_url }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={
                    isUnread ? ['#8b5cf6', '#7c3aed'] : ['#4b5563', '#374151']
                  }
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{initial}</Text>
                </LinearGradient>
              )}
              {isUnread && (
                <View style={styles.onlineIndicator}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.onlineGradient}
                  />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text
                  style={[styles.userName, isUnread && styles.userNameUnread]}
                  numberOfLines={1}
                >
                  {displayName}
                  <VerifiedBadge verified={other_user.is_verified} size={14} />
                </Text>
                {last_message && (
                  <View style={styles.timestampContainer}>
                    <Text
                      style={[
                        styles.timestamp,
                        isUnread && styles.timestampUnread,
                      ]}
                    >
                      {formatTimestamp(last_message.created_at)}
                    </Text>
                  </View>
                )}
              </View>
              {last_message && (
                <View style={styles.messageRow}>
                  {isSentByMe && (
                    <Ionicons
                      name="checkmark-done"
                      size={15}
                      color={isUnread ? '#8b5cf6' : '#6b7280'}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.lastMessage,
                      isUnread && styles.lastMessageUnread,
                    ]}
                    numberOfLines={2}
                  >
                    {last_message.content}
                  </Text>
                </View>
              )}
            </View>

            {/* Unread Badge */}
            {isUnread && (
              <View style={styles.unreadBadge}>
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.unreadBadgeGradient}
                >
                  <Text style={styles.unreadBadgeText}>
                    {unread_count > 99 ? '99+' : unread_count}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

// ==================== Empty State ====================

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons
      name="message-text-outline"
      size={80}
      color="#374151"
    />
    <Text style={styles.emptyTitle}>لا توجد محادثات</Text>
    <Text style={styles.emptySubtitle}>ابدأ محادثة مع أصدقائك في التطبيق</Text>
  </View>
);

// ==================== Main Screen ====================

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { isLargeScreen } = useResponsiveLayout();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await getConversations(user.id);
    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    if (data) {
      setConversations(data);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  // Navigate to conversation
  const handleConversationPress = useCallback(
    (conversationId: string) => {
      router.push(`/message/${conversationId}` as any);
    },
    [router]
  );

  // Render conversation card
  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationCard
        conversation={item}
        currentUserId={user?.id || ''}
        onPress={() => handleConversationPress(item.id)}
      />
    ),
    [user?.id]
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isLargeScreen && styles.containerWeb]}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#d1d5db" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name="message-text"
              size={28}
              color="#8b5cf6"
            />
            <Text style={styles.headerTitle}>الرسائل</Text>
          </View>
        </Animated.View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>جاري تحميل المحادثات...</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.list,
              conversations.length === 0 && styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={Platform.OS !== 'web'}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#8b5cf6"
                colors={['#8b5cf6']}
              />
            }
            ListEmptyComponent={<EmptyState />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 70 : 0,
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardUnread: {
    backgroundColor: '#1e1e4a',
    borderColor: '#8b5cf620',
    borderWidth: 2,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#252550',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1a1a3e',
    overflow: 'hidden',
  },
  onlineGradient: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
    flex: 1,
  },
  userNameUnread: {
    color: '#ffffff',
    fontWeight: '700',
  },
  timestampContainer: {
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  timestampUnread: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  unreadBadge: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 24,
    height: 24,
  },
  unreadBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    height: 24,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
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
});
