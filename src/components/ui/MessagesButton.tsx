/**
 * MessagesButton Component
 * Displays unread messages count and navigates to messages screen
 */

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { getUnreadCount, subscribeToMessages } from '@/services/messageService';

interface MessagesButtonProps {
  userId: string;
}

export const MessagesButton: React.FC<MessagesButtonProps> = ({ userId }) => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const scale = useSharedValue(1);

  // Load unread count
  useEffect(() => {
    if (!userId) return;

    const loadUnreadCount = async () => {
      const { data } = await getUnreadCount(userId);
      if (data !== null) {
        setUnreadCount(data);
        // Animate badge when count changes
        if (data > 0) {
          scale.value = withSequence(
            withSpring(1.3, { damping: 3 }),
            withSpring(1)
          );
        }
      }
    };

    loadUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    router.push('/messages' as any);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubble-outline" size={24} color="#d1d5db" />
      {unreadCount > 0 && (
        <Animated.View style={[styles.badge, animatedBadgeStyle]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e1e3e',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#252550',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0f0f1e',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
