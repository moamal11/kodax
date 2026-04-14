/**
 * CodeSnippetCard.tsx
 *
 * Description: Published code snippet preview card with actions
 * Features: Syntax preview, author info, likes, comments, language badge
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
}

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
  onLike?: () => void;
  onComment?: () => void;
  onClick?: () => void;
  liked?: boolean;
}

export function CodeSnippetCard({
  snippet,
  onLike,
  onComment,
  onClick,
  liked = false,
}: CodeSnippetCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onClick}
      activeOpacity={0.9}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {snippet.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{snippet.author.name}</Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(snippet.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>{snippet.language}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {snippet.title}
          </Text>

          {/* Code Preview */}
          <View style={styles.codePreview}>
            <Text style={styles.code} numberOfLines={4}>
              {snippet.code}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <TouchableOpacity style={styles.statButton} onPress={onLike}>
              <MaterialIcons
                name={liked ? 'favorite' : 'favorite-border'}
                size={18}
                color={liked ? '#ef4444' : '#9ca3af'}
              />
              <Text style={styles.statText}>{snippet.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statButton} onPress={onComment}>
              <MaterialIcons name="comment" size={18} color="#9ca3af" />
              <Text style={styles.statText}>{snippet.comments}</Text>
            </TouchableOpacity>

            <View style={styles.statButton}>
              <MaterialIcons name="visibility" size={18} color="#9ca3af" />
              <Text style={styles.statText}>{snippet.views}</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  blur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  languageBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  codePreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#e0e0e0',
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
});
