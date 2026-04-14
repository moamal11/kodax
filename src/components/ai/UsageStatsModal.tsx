import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { AIUsageStats } from '@/services/conversationsService';

interface UsageStatsModalProps {
  visible: boolean;
  onClose: () => void;
  stats: AIUsageStats | null;
}

const { width } = Dimensions.get('window');

export default function UsageStatsModal({
  visible,
  onClose,
  stats,
}: UsageStatsModalProps) {
  if (!stats) return null;

  const getUsageColor = () => {
    if (stats.usage_percentage >= 90) return '#ef4444'; // red
    if (stats.usage_percentage >= 70) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  const getUsageIcon = () => {
    if (stats.usage_percentage >= 90) return 'warning';
    if (stats.usage_percentage >= 70) return 'info';
    return 'check-circle';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={40} style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.duration(400).springify()}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={['#1f2937', '#111827']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="analytics" size={24} color="#8b5cf6" />
                </View>
                <Text style={styles.title}>إحصائيات الاستخدام</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Usage Circle */}
            <View style={styles.circleContainer}>
              <View style={styles.circleWrapper}>
                <LinearGradient
                  colors={[getUsageColor(), getUsageColor() + '40']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.circleProgress,
                    {
                      transform: [
                        {
                          rotate: `${(stats.usage_percentage / 100) * 360}deg`,
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.circleInner}>
                  <MaterialIcons
                    name={getUsageIcon()}
                    size={48}
                    color={getUsageColor()}
                  />
                  <Text style={[styles.percentage, { color: getUsageColor() }]}>
                    {stats.usage_percentage}%
                  </Text>
                  <Text style={styles.percentageLabel}>مستخدم</Text>
                </View>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View
                  style={[styles.statIcon, { backgroundColor: '#8b5cf620' }]}
                >
                  <MaterialIcons name="bolt" size={24} color="#8b5cf6" />
                </View>
                <Text style={styles.statValue}>
                  {stats.tokens_used_today.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Tokens اليوم</Text>
                <Text style={styles.statSubLabel}>
                  من {stats.daily_limit.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[styles.statIcon, { backgroundColor: '#3b82f620' }]}
                >
                  <MaterialIcons name="chat" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.statValue}>{stats.total_messages}</Text>
                <Text style={styles.statLabel}>إجمالي الرسائل</Text>
                <Text style={styles.statSubLabel}>جميع الأوقات</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[styles.statIcon, { backgroundColor: '#10b98120' }]}
                >
                  <MaterialIcons name="forum" size={24} color="#10b981" />
                </View>
                <Text style={styles.statValue}>
                  {stats.conversations_count}
                </Text>
                <Text style={styles.statLabel}>المحادثات</Text>
                <Text style={styles.statSubLabel}>نشطة</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[styles.statIcon, { backgroundColor: '#f59e0b20' }]}
                >
                  <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statValue}>
                  {stats.total_tokens_used.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>إجمالي Tokens</Text>
                <Text style={styles.statSubLabel}>كل المحادثات</Text>
              </View>
            </View>

            {/* Usage Info */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={20} color="#6366f1" />
              <Text style={styles.infoText}>
                {stats.usage_percentage >= 90
                  ? '⚠️ اقتربت من الحد اليومي! قد تحتاج إلى الانتظار أو الترقية.'
                  : stats.usage_percentage >= 70
                    ? '💡 استهلكت معظم حصتك اليومية. استخدم بحكمة!'
                    : '✅ مازال لديك استخدام كافٍ لليوم. استمر في التعلم!'}
              </Text>
            </View>

            {/* Bottom Button */}
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <LinearGradient
                colors={['#8b5cf6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneGradient}
              >
                <Text style={styles.doneText}>فهمت!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 500,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  modalGradient: {
    padding: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  circleWrapper: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  circleProgress: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
  },
  circleInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1f2937',
    position: 'absolute',
    top: 10,
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  percentage: {
    fontSize: 48,
    fontWeight: '900',
  },
  percentageLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  statSubLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  doneGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});
