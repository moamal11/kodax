/**
 * StreakCounter.tsx
 *
 * Description: Daily streak visualization with flame animation and calendar grid
 * Features: Flame animation, calendar grid, milestone markers, current streak count
 * Props: {streakDays} - Current streak, {lastActive} - Last active date, {milestones} - Milestone days
 *
 * @example
 * <StreakCounter streakDays={7} lastActive={new Date()} milestones={[7, 14, 30]} />
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Types
interface StreakCounterProps {
  streakDays: number;
  lastActive: Date;
  milestones?: number[];
  showCalendar?: boolean;
}

export function StreakCounter({
  streakDays,
  lastActive,
  milestones = [7, 14, 30, 60, 100],
  showCalendar = true,
}: StreakCounterProps) {
  const flameScale = useSharedValue(1);
  const flameOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Flame animation
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    flameOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity: flameOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Check if streak is active (last active is today in local timezone)
  const getLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = getLocalDateStr(new Date());
  const lastActiveStr = getLocalDateStr(lastActive);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterdayDate);

  const isActive = todayStr === lastActiveStr;
  const isEndingSoon = !isActive && yesterdayStr === lastActiveStr;

  // Get next milestone
  const nextMilestone =
    milestones.find((m) => m > streakDays) || milestones[milestones.length - 1];
  const progress = (streakDays / nextMilestone) * 100;

  // Get flame color based on streak
  const getFlameColor = () => {
    if (streakDays >= 100) return ['#f59e0b', '#ef4444'];
    if (streakDays >= 30) return ['#f59e0b', '#f97316'];
    if (streakDays >= 7) return ['#fbbf24', '#f59e0b'];
    return ['#fcd34d', '#fbbf24'];
  };

  // Generate last 7 days with accurate streak tracking
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Day is in streak only if it's within the streak range AND streak hasn't broken
      const daysBehindToday = i;
      const isInStreak = isActive
        ? daysBehindToday < streakDays
        : isEndingSoon
          ? daysBehindToday > 0 && daysBehindToday <= streakDays
          : false;
      days.push({ date, isInStreak });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <View style={styles.container}>
      {/* Flame Icon */}
      <View style={styles.flameContainer}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.flameGlow,
            {
              shadowColor: getFlameColor()[0],
            },
            glowStyle,
          ]}
        />

        {/* Flame */}
        <Animated.View style={flameStyle}>
          <LinearGradient
            colors={getFlameColor() as [string, string, ...string[]]}
            style={styles.flameGradient}
          >
            <MaterialIcons
              name="local-fire-department"
              size={60}
              color="#ffffff"
            />
          </LinearGradient>
        </Animated.View>

        {/* Streak Count */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakNumber}>{streakDays}</Text>
        </View>
      </View>

      {/* Streak Info */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Ionicons
            name={isActive ? 'flame' : 'warning'}
            size={18}
            color={isActive ? '#f97316' : '#fbbf24'}
          />
          <Text style={styles.title}>
            {isActive
              ? 'السلسلة نشطة!'
              : isEndingSoon
                ? 'السلسلة على وشك الانتهاء'
                : 'السلسلة انقطعت'}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {isActive
            ? `استمر! ${streakDays} يوم متواصل`
            : isEndingSoon
              ? 'سجّل دخولك اليوم للحفاظ على السلسلة'
              : 'ابدأ سلسلة جديدة بالتعلم اليوم!'}
        </Text>
      </View>

      {/* Progress to Next Milestone */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          الهدف القادم: {nextMilestone} يوم
        </Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={getFlameColor() as [string, string, ...string[]]}
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% مكتمل</Text>
      </View>

      {/* Calendar Grid */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Text style={styles.calendarTitle}>آخر 7 أيام</Text>
          <View style={styles.calendarGrid}>
            {last7Days.map((day, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  day.isInStreak && styles.calendarDayActive,
                ]}
              >
                <Text style={styles.calendarDayText}>
                  {
                    day.date.toLocaleDateString('ar', {
                      weekday: 'short',
                    })[0]
                  }
                </Text>
                {day.isInStreak && (
                  <View style={styles.calendarCheck}>
                    <MaterialIcons name="check" size={12} color="#ffffff" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Milestones */}
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>الإنجازات</Text>
        <View style={styles.milestonesList}>
          {milestones.map((milestone) => {
            const achieved = streakDays >= milestone;
            return (
              <View
                key={milestone}
                style={[
                  styles.milestoneItem,
                  achieved && styles.milestoneItemAchieved,
                ]}
              >
                <MaterialIcons
                  name={achieved ? 'check-circle' : 'radio-button-unchecked'}
                  size={20}
                  color={achieved ? '#10b981' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.milestoneText,
                    achieved && styles.milestoneTextAchieved,
                  ]}
                >
                  {milestone} يوم
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flameGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  flameGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  calendarContainer: {
    gap: 12,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarDayActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  calendarCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#10b981',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestonesContainer: {
    gap: 12,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  milestonesList: {
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneItemAchieved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  milestoneTextAchieved: {
    color: '#10b981',
  },
});
