import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { Conversation } from '@/services/conversationsService';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function ConversationsList({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: ConversationsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    return `منذ ${Math.floor(days / 30)} شهور`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المحادثات</Text>
        <TouchableOpacity onPress={onNew} style={styles.newButton}>
          <LinearGradient
            colors={['#8b5cf6', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newButtonGradient}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.newButtonText}>جديد</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={64}
              color="#4b5563"
            />
            <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
            <Text style={styles.emptyHint}>ابدأ محادثة جديدة الآن!</Text>
          </View>
        ) : (
          conversations.map((conv, index) => (
            <Animated.View
              key={conv.id}
              entering={FadeInLeft.delay(index * 50).duration(300)}
            >
              <TouchableOpacity
                onPress={() => onSelect(conv.id)}
                onLongPress={() => onDelete(conv.id)}
                style={[
                  styles.conversationCard,
                  selectedId === conv.id && styles.conversationCardSelected,
                ]}
              >
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text
                      style={styles.conversationTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {conv.title}
                    </Text>
                    <Text style={styles.conversationDate}>
                      {formatDate(conv.last_message_at)}
                    </Text>
                  </View>

                  {conv.last_message_preview && (
                    <Text
                      style={styles.conversationPreview}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {conv.last_message_preview}
                    </Text>
                  )}

                  <View style={styles.conversationStats}>
                    <View style={styles.stat}>
                      <MaterialIcons name="chat" size={14} color="#6b7280" />
                      <Text style={styles.statText}>{conv.total_messages}</Text>
                    </View>
                    {conv.total_tokens > 0 && (
                      <View style={styles.stat}>
                        <MaterialIcons name="bolt" size={14} color="#6b7280" />
                        <Text style={styles.statText}>
                          {conv.total_tokens.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {selectedId === conv.id && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  newButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
  },
  emptyHint: {
    fontSize: 14,
    color: '#6b7280',
  },
  conversationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  conversationCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  conversationContent: {
    gap: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  conversationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  conversationPreview: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  conversationStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#8b5cf6',
  },
});
