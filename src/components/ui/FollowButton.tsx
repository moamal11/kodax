/**
 * FollowButton - زر المتابعة / إلغاء المتابعة
 * يُستخدم في صفحة الأكواد وملفات المستخدمين
 */

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { toggleFollow } from '@/services/followService';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  isFollowing: boolean;
  onToggle: (isNowFollowing: boolean) => void;
  compact?: boolean;
}

export default function FollowButton({
  currentUserId,
  targetUserId,
  isFollowing,
  onToggle,
  compact = false,
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (currentUserId === targetUserId) return;

    setLoading(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await toggleFollow(currentUserId, targetUserId);

    setLoading(false);

    if (!result.error) {
      onToggle(result.isFollowing);
    }
  }, [currentUserId, targetUserId, onToggle]);

  if (currentUserId === targetUserId) return null;

  if (loading) {
    return (
      <TouchableOpacity
        style={[styles.button, compact && styles.buttonCompact]}
        disabled
      >
        <ActivityIndicator size="small" color="#7c3aed" />
      </TouchableOpacity>
    );
  }

  if (isFollowing) {
    return (
      <TouchableOpacity
        style={[styles.button, compact && styles.buttonCompact]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(156, 163, 175, 0.15)', 'rgba(107, 114, 128, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.unfollowGradient, compact && styles.gradientCompact]}
        >
          <Ionicons
            name="checkmark-circle"
            size={compact ? 14 : 16}
            color="#9ca3af"
          />
          <Text style={[styles.unfollowText, compact && styles.textCompact]}>
            متابَع
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, compact && styles.buttonCompact]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.followGradient, compact && styles.gradientCompact]}
      >
        <Ionicons name="person-add" size={compact ? 14 : 16} color="#fff" />
        <Text style={[styles.followText, compact && styles.textCompact]}>
          متابعة
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonCompact: {
    borderRadius: 16,
  },
  followGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  unfollowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.3)',
    borderRadius: 20,
  },
  gradientCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  unfollowText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  textCompact: {
    fontSize: 12,
  },
});
