/**
 * LeaderboardCard.tsx
 *
 * Description: Animated leaderboard entry with rank badge, XP bar, and province flag
 * Features: Rank badge, XP bar, avatar, province flag, slide animation, tap handler
 * Props: {user} - User data, {rank} - User rank, {animated} - Enable animations, {onClick} - Tap handler
 *
 * @example
 * <LeaderboardCard user={userData} rank={1} animated onClick={handlePress} />
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { formatXP } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

// Types
interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  province?: string;
  verified?: boolean;
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  rank: number;
  animated?: boolean;
  delay?: number;
  onClick?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const LeaderboardCard = React.memo(
  function LeaderboardCard({
    user,
    rank,
    animated = true,
    delay = 0,
    onClick,
  }: LeaderboardCardProps) {
    const translateX = useSharedValue(animated ? -100 : 0);
    const opacity = useSharedValue(animated ? 0 : 1);
    const scale = useSharedValue(1);

    useEffect(() => {
      if (animated) {
        translateX.value = withDelay(
          delay,
          withSpring(0, {
            damping: 20,
            stiffness: 200,
          })
        );

        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
      }
    }, [animated, delay]);

    const handlePressIn = () => {
      scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
      opacity: opacity.value,
    }));

    // Get rank badge style
    const getRankBadgeStyle = () => {
      if (rank === 1) return styles.rankBadgeGold;
      if (rank === 2) return styles.rankBadgeSilver;
      if (rank === 3) return styles.rankBadgeBronze;
      return styles.rankBadgeDefault;
    };

    const getRankIcon = () => {
      if (rank === 1)
        return { name: 'emoji-events' as const, color: '#f59e0b' };
      if (rank === 2)
        return { name: 'emoji-events' as const, color: '#9ca3af' };
      if (rank === 3)
        return { name: 'emoji-events' as const, color: '#f97316' };
      return null;
    };

    const rankIcon = getRankIcon();

    return (
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPress={onClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handlePressOut}
        activeOpacity={0.9}
        disabled={!onClick}
      >
        <LinearGradient
          colors={
            rank <= 3
              ? ['rgba(30, 20, 75, 0.6)', 'rgba(10, 33, 106,0.35)']
              : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Rank Badge */}
          <View style={[styles.rankBadge, getRankBadgeStyle()]}>
            {rankIcon ? (
              <MaterialIcons
                name={rankIcon.name}
                size={24}
                color={rankIcon.color}
              />
            ) : (
              <Text style={styles.rankText}>#{rank}</Text>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <UserAvatar
              userId={user.id}
              avatarUrl={user.avatar}
              name={user.name}
              size="large"
              color={rank <= 3 ? rankIcon?.color || '#8b5cf6' : '#6b7280'}
            />
            {rank <= 3 && (
              <View style={styles.crownContainer}>
                <MaterialIcons name="stars" size={16} color={rankIcon?.color} />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
                <VerifiedBadge verified={user.verified} size={13} />
              </Text>
              {user.province && (
                <View style={styles.provinceTag}>
                  <MaterialIcons name="location-on" size={12} color="#9ca3af" />
                  <Text style={styles.provinceText}>{user.province}</Text>
                </View>
              )}
            </View>

            {/* XP Display */}
            <View style={styles.xpContainer}>
              <MaterialIcons name="bolt" size={16} color="#f59e0b" />
              <Text style={styles.xpText}>{formatXP(user.xp)} XP</Text>
            </View>

            {/* XP Progress Bar */}
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#7c3aed', '#3b82f6']}
                style={[
                  styles.progressFill,
                  { width: `${Math.min((user.xp / 10000) * 100, 100)}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Arrow */}
          {onClick && (
            <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  },
  (prev, next) => {
    return (
      prev.user.id === next.user.id &&
      prev.rank === next.rank &&
      prev.user.xp === next.user.xp &&
      prev.user.name === next.user.name &&
      prev.user.avatar === next.user.avatar &&
      prev.user.province === next.user.province &&
      prev.onClick === next.onClick
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  rankBadgeGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  rankBadgeSilver: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderColor: '#9ca3af',
  },
  rankBadgeBronze: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: '#f97316',
  },
  rankBadgeDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: '#6b7280',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  avatarPlaceholder: {
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 2,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  userInfo: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  provinceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  provinceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
