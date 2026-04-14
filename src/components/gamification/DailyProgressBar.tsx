/**
 * DailyProgressBar Component
 * شريط التقدم اليومي - يُعاد تعيينه كل 24 ساعة
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { progressService, DailyProgressData } from '@/services/progressService';

interface DailyProgressBarProps {
  compact?: boolean;
}

export function DailyProgressBar({ compact = false }: DailyProgressBarProps) {
  const [daily, setDaily] = useState<DailyProgressData | null>(null);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const dp = await progressService.getDailyProgress();
      setDaily(dp);
      setPercentage(progressService.getDailyProgressPercentage());
    } catch (error) {
      console.error('Error loading daily progress:', error);
    }
  };

  if (!daily) return null;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Ionicons name="today-outline" size={14} color="#a78bfa" />
          <Text style={styles.compactLabel}>التقدم اليومي</Text>
          <Text style={styles.compactPercentage}>{percentage}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={
              percentage >= 100
                ? ['#22c55e', '#16a34a']
                : ['#7c3aed', '#a855f7']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="today" size={18} color="#a78bfa" />
          <Text style={styles.title}>التقدم اليومي</Text>
        </View>
        <Text
          style={[
            styles.percentage,
            percentage >= 100 && styles.percentageComplete,
          ]}
        >
          {percentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={
            percentage >= 100 ? ['#22c55e', '#16a34a'] : ['#7c3aed', '#a855f7']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${Math.min(percentage, 100)}%` },
          ]}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={14} color="#60a5fa" />
          <Text style={styles.statValue}>
            {daily.lessonsCompleted}/{daily.goalLessons}
          </Text>
          <Text style={styles.statLabel}>دروس</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="code-slash" size={14} color="#f59e0b" />
          <Text style={styles.statValue}>
            {daily.challengesCompleted}/{daily.goalChallenges}
          </Text>
          <Text style={styles.statLabel}>تحديات</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={14} color="#a78bfa" />
          <Text style={styles.statValue}>
            {daily.xpEarned}/{daily.goalXP}
          </Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>

      {percentage >= 100 && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={styles.completedText}>اكتمل هدف اليوم!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '800',
    color: '#a78bfa',
  },
  percentageComplete: {
    color: '#22c55e',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  // Compact styles
  compactContainer: {
    gap: 6,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactLabel: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  compactPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
  },
});

export default DailyProgressBar;
