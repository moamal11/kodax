import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import {
  CosmicCard,
  ProgressRing,
  AnimatedButton,
  showToast,
} from '@/components';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { DailyProgressBar } from '@/components/gamification/DailyProgressBar';
import { supabaseService } from '@/services/supabaseService';
import { getGreeting, calculateLevel } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks';
import { useAuth } from '../_layout';
import { NotificationButton } from '@/components/editor/NotificationButton';
import { MessagesButton } from '@/components/ui';
import { CoinBalance } from '@/components/coins/CoinBalance';
// ===== نظام Hybrid: الكورسات من البيانات المحلية، الإحصائيات من Supabase =====
import {
  ALL_COURSES,
  ALL_CHALLENGES,
  ALL_LESSONS,
} from '@/constants/courseData';
import { useUserStats } from '@/hooks/useHybridProgress';
import { coinService } from '@/services/coinService';
// removed: useApp import (authVersion is now in useAuth)

const { width } = Dimensions.get('window');

// Web-specific styles
const webStyles = {
  scrollContentWeb: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  } as ViewStyle,
  webContainer: {
    flexDirection: 'row',
    gap: 32,
  } as ViewStyle,
  webLeftColumn: {
    flex: 2,
  } as ViewStyle,
  webRightColumn: {
    flex: 1,
    maxWidth: 380,
  } as ViewStyle,
  heroContainerWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  } as ViewStyle,
  heroTitleWeb: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  } as TextStyle,
  categoriesGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  } as ViewStyle,
  categoryCardWeb: {
    width: '23%',
    minWidth: 160,
    borderRadius: 20,
    overflow: 'hidden',
  } as ViewStyle,
  categoryGradientWeb: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minHeight: 140,
    justifyContent: 'center',
  } as ViewStyle,
  categoryIconWeb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,
  categoryTitleWeb: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  } as TextStyle,
  sectionTitleWeb: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  } as TextStyle,
  coursesGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  } as ViewStyle,
  courseCardWeb: {
    width: '23%',
    minWidth: 180,
  } as ViewStyle,
  statsCardWeb: {
    marginBottom: 24,
    padding: 8,
  } as ViewStyle,
  weeklyContainerWeb: {
    padding: 20,
  } as ViewStyle,
  ctaCardWeb: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  } as ViewStyle,
  ctaTitleWeb: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  } as TextStyle,
  webCtaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  } as ViewStyle,
};

// نوع بيانات المستخدم في التصنيفات
interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  province?: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const { user, userId, fullName } = useAuth();
  const router = useRouter();
  const { contentPaddingTop, contentPaddingBottom, isLargeScreen, isWeb } =
    useResponsiveLayout();
  const { authVersion } = useAuth();

  // DAU/الاحتفاظ: فتح التطبيق مرة يومياً (السيرفر يتجاهل التكرار في نفس اليوم)
  useEffect(() => {
    if (userId) coinService.track('app_open');
  }, [userId]);

  // ===== نظام Hybrid: إحصائيات من Supabase، كورسات من البيانات المحلية =====
  const {
    stats,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useUserStats(userId);

  // الكورسات والتحديات من البيانات المحلية (سرعة)
  const courses = ALL_COURSES;
  const challengesCount = ALL_CHALLENGES.length;
  const totalLessons = ALL_LESSONS.length;

  // استخدام المستوى من قاعدة البيانات مباشرة
  const level = stats.level || 1;
  const featuredCourses = useMemo(() => courses.slice(0, 4), [courses]);

  // ===== إصلاح شاشة التحميل المعلقة =====
  // نعتمد على statsLoading فقط — بحلول الوصول إلى /(tabs) يكون authLoading=false دائماً.
  // نضيف timeout احتياطياً (8 ثوانٍ) لضمان عدم تعليق الشاشة للأبد.
  const [statsLoadingTimedOut, setStatsLoadingTimedOut] = useState(false);
  useEffect(() => {
    if (!statsLoading) {
      setStatsLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setStatsLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [statsLoading]);
  const isLoading = statsLoading && !statsLoadingTimedOut;

  // ===== حساب أيام الأسبوع النشطة بناءً على streak و lastActiveDate =====
  // الأيام: س ج خ أ ث إ ح (السبت=0 إلى الجمعة=6)
  const weeklyActiveDays = useMemo(() => {
    const activeDays = [false, false, false, false, false, false, false];
    const streak = stats.streak || 0;
    if (streak <= 0) return activeDays;

    // تحديد آخر يوم نشط
    const lastActive = stats.lastActiveDate
      ? new Date(stats.lastActiveDate + 'T12:00:00')
      : new Date();

    // التحقق: إذا كان آخر نشاط ليس اليوم ولا بالأمس، لا نعرض شيء (تم الإعادة)
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffMs = today.getTime() - lastActive.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return activeDays; // الفجوة أكبر من يوم = إعادة تعيين

    // تعليم الأيام النشطة: من اليوم رجوعاً بعدد الـ streak
    for (let i = 0; i < Math.min(streak, 7); i++) {
      const d = new Date(lastActive);
      d.setDate(d.getDate() - i);
      // اليوم من الأسبوع: السبت=0 بالنسبة للعرض العربي
      const jsDay = d.getDay(); // 0=أحد, 6=سبت
      const arabicDayIndex = jsDay === 6 ? 0 : jsDay + 1; // تحويل: سبت=0, أحد=1, ..., جمعة=6
      if (arabicDayIndex >= 0 && arabicDayIndex < 7) {
        activeDays[arabicDayIndex] = true;
      }
    }

    return activeDays;
  }, [stats.streak, stats.lastActiveDate]);

  // جلب أفضل 3 مستخدمين للتصنيفات
  // Re-fetch when user changes (e.g. after OAuth login) to ensure data loads
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const data = await supabaseService.getLeaderboard(3);
        const formatted: LeaderboardUser[] = data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username || 'مستخدم',
          avatar: u.avatar_url,
          xp: u.xp || 0,
          province: u.province,
        }));
        setTopUsers(formatted);
      } catch (error) {
        console.error('Error fetching top users:', error);
      }
    };
    fetchTopUsers();
  }, [userId, authVersion]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // تحديث الإحصائيات من Supabase فقط
    await refreshStats();

    setRefreshing(false);
  }, [refreshStats]);

  const userName = useMemo(
    () =>
      fullName ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.display_name ||
      user?.email?.split('@')[0] ||
      'مستخدم',
    [
      fullName,
      user?.email,
      user?.user_metadata?.display_name,
      user?.user_metadata?.full_name,
      user?.user_metadata?.name,
    ]
  );

  // Stable navigation callbacks
  const goToLearn = useCallback(() => router.push('/learn'), [router]);
  const goToLeaderboard = useCallback(
    () => router.push('/leaderboard'),
    [router]
  );
  const goToChallenges = useCallback(
    () => router.push('/challenges'),
    [router]
  );
  const handleNotificationPress = useCallback(
    (notification: any) => {
      if (notification.metadata?.navigateTo) {
        router.push(notification.metadata.navigateTo);
      }
    },
    [router]
  );

  // تحديد عرض المحتوى للويب
  const contentMaxWidth = isWeb && isLargeScreen ? 1400 : width;
  const shouldCenterContent = isWeb && isLargeScreen;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#9ca3af', marginTop: 12 }}>
          جاري تحميل البيانات...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={isLargeScreen && isWeb ? [] : ['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && isWeb && webStyles.scrollContentWeb,
          {
            paddingTop: contentPaddingTop + (isLargeScreen && isWeb ? 40 : 0),
            paddingBottom: contentPaddingBottom,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
      >
        {/* Web Layout */}
        {isLargeScreen && isWeb ? (
          <View style={webStyles.webContainer}>
            {/* Left Column - Main Content */}
            <View style={webStyles.webLeftColumn}>
              {/* Hero Section - Web */}
              <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                <View style={webStyles.heroContainerWeb}>
                  <View style={styles.heroLeft}>
                    <View style={styles.greetingRow}>
                      <Text style={styles.greeting}>
                        {getGreeting()}، {userName}
                      </Text>
                      <Ionicons
                        name="happy-outline"
                        size={16}
                        color="#fbbf24"
                        style={{ marginStart: 6 }}
                      />
                    </View>
                    <View style={styles.heroStats}>
                      <View style={styles.heroStatItem}>
                        <Ionicons name="flame" size={18} color="#f59e0b" />
                        <Text style={styles.heroStatText}>
                          {stats.streak} يوم
                        </Text>
                      </View>
                      <View style={styles.heroStatItem}>
                        <Ionicons name="trophy" size={18} color="#fbbf24" />
                        <Text style={styles.heroStatText}>مستوى {level}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.headerButtons}>
                    <CoinBalance size="small" />
                    <MessagesButton userId={userId || ''} />
                    <NotificationButton
                      userId={userId || ''}
                      onNotificationPress={handleNotificationPress}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Daily Progress - Web */}
              <Animated.View entering={FadeInUp.delay(150).duration(600)}>
                <View style={{ marginBottom: 16 }}>
                  <DailyProgressBar />
                </View>
              </Animated.View>

              {/* Categories - Web Grid */}
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="apps" size={24} color="#a855f7" />
                      <Text style={webStyles.sectionTitleWeb}>استكشف</Text>
                    </View>
                  </View>
                  <View style={webStyles.categoriesGridWeb}>
                    <TouchableOpacity
                      style={webStyles.categoryCardWeb}
                      onPress={() => router.push('/learn')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(59, 130, 246, 0.2)',
                          'rgba(37, 99, 235, 0.1)',
                        ]}
                        style={webStyles.categoryGradientWeb}
                      >
                        <View
                          style={[
                            webStyles.categoryIconWeb,
                            { backgroundColor: '#3b82f620' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="school"
                            size={28}
                            color="#3b82f6"
                          />
                        </View>
                        <Text style={webStyles.categoryTitleWeb}>الدروس</Text>
                        <Text style={styles.categoryCount}>{totalLessons}</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={webStyles.categoryCardWeb}
                      onPress={() => router.push('/challenges')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(236, 72, 153, 0.2)',
                          'rgba(219, 39, 119, 0.1)',
                        ]}
                        style={webStyles.categoryGradientWeb}
                      >
                        <View
                          style={[
                            webStyles.categoryIconWeb,
                            { backgroundColor: '#ec489920' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="trophy"
                            size={28}
                            color="#ec4899"
                          />
                        </View>
                        <Text style={webStyles.categoryTitleWeb}>التحديات</Text>
                        <Text style={styles.categoryCount}>
                          {challengesCount}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={webStyles.categoryCardWeb}
                      onPress={() => router.push('/code')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(16, 185, 129, 0.2)',
                          'rgba(5, 150, 105, 0.1)',
                        ]}
                        style={webStyles.categoryGradientWeb}
                      >
                        <View
                          style={[
                            webStyles.categoryIconWeb,
                            { backgroundColor: '#10b98120' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="code-braces"
                            size={28}
                            color="#10b981"
                          />
                        </View>
                        <Text style={webStyles.categoryTitleWeb}>المحرر</Text>
                        <Text style={styles.categoryCount}>∞</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={webStyles.categoryCardWeb}
                      onPress={() => router.push('/ai')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(139, 92, 246, 0.2)',
                          'rgba(124, 58, 237, 0.1)',
                        ]}
                        style={webStyles.categoryGradientWeb}
                      >
                        <View
                          style={[
                            webStyles.categoryIconWeb,
                            { backgroundColor: '#8b5cf620' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="robot"
                            size={28}
                            color="#8b5cf6"
                          />
                        </View>
                        <Text style={webStyles.categoryTitleWeb}>AI مساعد</Text>
                        <Text style={styles.categoryCount}>ذكي</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>

              {/* Leaderboard - Web */}
              <Animated.View
                entering={FadeInUp.delay(250).duration(600)}
                style={{ marginTop: 24 }}
              >
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <MaterialIcons
                        name="leaderboard"
                        size={24}
                        color="#f59e0b"
                      />
                      <Text style={webStyles.sectionTitleWeb}>التصنيفات</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push('/leaderboard' as any)}
                    >
                      <Text style={styles.seeAll}>عرض الكل</Text>
                    </TouchableOpacity>
                  </View>

                  {topUsers.length > 0 ? (
                    <View style={styles.leaderboardPreview}>
                      {topUsers.map((user, index) => (
                        <LeaderboardCard
                          key={user.id}
                          user={user}
                          rank={index + 1}
                          animated
                          delay={index * 100}
                          onClick={() => router.push('/leaderboard' as any)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyLeaderboard}>
                      <MaterialIcons
                        name="emoji-events"
                        size={32}
                        color="#4b5563"
                      />
                      <Text style={styles.emptyLeaderboardText}>
                        سجل دخولك للانضمام للتصنيفات!
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Featured Courses - Web Grid */}
              <Animated.View
                entering={FadeInUp.delay(300).duration(600)}
                style={{ marginTop: 24 }}
              >
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="book" size={24} color="#a855f7" />
                      <Text style={webStyles.sectionTitleWeb}>دورات مميزة</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/learn')}>
                      <Text style={styles.seeAll}>عرض الكل</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={webStyles.coursesGridWeb}>
                    {featuredCourses.map((course, index) => (
                      <TouchableOpacity
                        key={course.id}
                        style={webStyles.courseCardWeb}
                        activeOpacity={0.8}
                        onPress={() =>
                          router.push(`/course/${course.id}` as any)
                        }
                      >
                        <CosmicCard animated>
                          <LinearGradient
                            colors={[`${course.color}33`, `${course.color}11`]}
                            style={styles.courseContent}
                          >
                            <View
                              style={[
                                styles.courseIconContainer,
                                { backgroundColor: `${course.color}22` },
                              ]}
                            >
                              <Ionicons
                                name={course.icon as any}
                                size={32}
                                color={course.color}
                              />
                            </View>
                            <Text style={styles.courseName}>
                              {course.title}
                            </Text>
                            <View style={styles.courseStats}>
                              <Ionicons
                                name="book-outline"
                                size={14}
                                color="#9ca3af"
                              />
                              <Text style={styles.courseStatText}>
                                {course.totalLessons} دروس
                              </Text>
                            </View>
                          </LinearGradient>
                        </CosmicCard>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Right Column - Stats & CTA */}
            <View style={webStyles.webRightColumn}>
              {/* XP Progress */}
              <Animated.View entering={FadeInUp.delay(150).duration(600)}>
                <CosmicCard style={webStyles.statsCardWeb}>
                  <XPBar xp={stats.xp} showAnimation />
                </CosmicCard>
              </Animated.View>

              {/* Weekly Progress */}
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                <CosmicCard glowColor="#7c3aed" animated>
                  <View style={webStyles.weeklyContainerWeb}>
                    <View style={styles.weeklyHeader}>
                      <View style={styles.weeklyTitleRow}>
                        <Text style={styles.weeklyTitle}>التقدم الأسبوعي</Text>
                        <Ionicons
                          name="flame"
                          size={18}
                          color="#f59e0b"
                          style={{ marginStart: 8 }}
                        />
                      </View>
                      <Text style={styles.weeklySubtitle}>
                        استمر في التعلم!
                      </Text>
                    </View>
                    <View style={styles.weeklyDays}>
                      {['س', 'ج', 'خ', 'أ', 'ث', 'إ', 'ح'].map((day, index) => {
                        // عرض أيام الأسبوع النشطة بدقة
                        const isActive = weeklyActiveDays[index];
                        return (
                          <View key={index} style={styles.dayItem}>
                            <View
                              style={[
                                styles.dayCircle,
                                isActive && styles.dayCircleActive,
                              ]}
                            >
                              {isActive && (
                                <Ionicons
                                  name="checkmark"
                                  size={12}
                                  color="#fff"
                                />
                              )}
                            </View>
                            <Text style={styles.dayText}>{day}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </CosmicCard>
              </Animated.View>

              {/* CTA Card */}
              <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                <CosmicCard glowColor="#7c3aed" animated>
                  <View style={webStyles.ctaCardWeb}>
                    <View style={styles.ctaTitleRow}>
                      <Text style={webStyles.ctaTitleWeb}>جاهز للتحدي؟</Text>
                      <Ionicons
                        name="fitness"
                        size={24}
                        color="#22c55e"
                        style={{ marginStart: 8 }}
                      />
                    </View>
                    <Text style={styles.ctaSubtitle}>
                      اكسب المزيد من XP والشارات!
                    </Text>
                    <AnimatedButton
                      variant="success"
                      onPress={() => router.push('/challenges')}
                      style={webStyles.webCtaButton}
                    >
                      ابدأ التحدي
                    </AnimatedButton>
                  </View>
                </CosmicCard>
              </Animated.View>
            </View>
          </View>
        ) : (
          /* Mobile Layout */
          <>
            {/* Hero Section */}
            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
              <View style={styles.heroContainer}>
                <View style={styles.heroLeft}>
                  <View style={styles.greetingRow}>
                    <Text style={styles.greeting}>
                      {getGreeting()}، {userName}
                    </Text>
                    <Ionicons
                      name="happy-outline"
                      size={16}
                      color="#fbbf24"
                      style={{ marginStart: 6 }}
                    />
                  </View>
                  <View style={styles.heroStats}>
                    <View style={styles.heroStatItem}>
                      <Ionicons name="flame" size={16} color="#f59e0b" />
                      <Text style={styles.heroStatText}>
                        {stats.streak} يوم
                      </Text>
                    </View>
                    <View style={styles.heroStatItem}>
                      <Ionicons name="trophy" size={16} color="#fbbf24" />
                      <Text style={styles.heroStatText}>مستوى {level}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.headerButtons}>
                  <CoinBalance size="small" />
                  <MessagesButton userId={userId || ''} />
                  <NotificationButton
                    userId={userId || ''}
                    onNotificationPress={handleNotificationPress}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Daily Progress - Mobile */}
            <Animated.View entering={FadeInUp.delay(125).duration(600)}>
              <View style={{ marginBottom: 12 }}>
                <DailyProgressBar />
              </View>
            </Animated.View>

            {/* Weekly Progress */}
            <Animated.View entering={FadeInUp.delay(150).duration(600)}>
              <CosmicCard glowColor="#7c3aed" animated>
                <View style={styles.weeklyContainer}>
                  <View style={styles.weeklyHeader}>
                    <View style={styles.weeklyTitleRow}>
                      <Text style={styles.weeklyTitle}>التقدم الأسبوعي</Text>
                      <Ionicons
                        name="flame"
                        size={18}
                        color="#f59e0b"
                        style={{ marginStart: 8 }}
                      />
                    </View>
                    <Text style={styles.weeklySubtitle}>استمر في التعلم!</Text>
                  </View>
                  <View style={styles.weeklyDays}>
                    {['س', 'ج', 'خ', 'أ', 'ث', 'إ', 'ح'].map((day, index) => {
                      // عرض أيام الأسبوع النشطة بدقة
                      const isActive = weeklyActiveDays[index];
                      return (
                        <View key={index} style={styles.dayItem}>
                          <View
                            style={[
                              styles.dayCircle,
                              isActive && styles.dayCircleActive,
                            ]}
                          >
                            {isActive && (
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color="#fff"
                              />
                            )}
                          </View>
                          <Text style={styles.dayText}>{day}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </CosmicCard>
            </Animated.View>

            {/* XP Progress */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)}>
              <XPBar xp={stats.xp} showAnimation />
            </Animated.View>

            {/* Categories Section */}
            <Animated.View entering={FadeInUp.delay(225).duration(600)}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="apps" size={20} color="#a855f7" />
                    <Text style={styles.sectionTitle}>استكشف</Text>
                  </View>
                </View>
                <View style={styles.categoriesGrid}>
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => router.push('/learn')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(59, 130, 246, 0.2)',
                        'rgba(37, 99, 235, 0.1)',
                      ]}
                      style={styles.categoryGradient}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: '#3b82f620' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="school"
                          size={24}
                          color="#3b82f6"
                        />
                      </View>
                      <Text style={styles.categoryTitle}>الدروس</Text>
                      <Text style={styles.categoryCount}>{totalLessons}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => router.push('/challenges')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(236, 72, 153, 0.2)',
                        'rgba(219, 39, 119, 0.1)',
                      ]}
                      style={styles.categoryGradient}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: '#ec489920' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="trophy"
                          size={24}
                          color="#ec4899"
                        />
                      </View>
                      <Text style={styles.categoryTitle}>التحديات</Text>
                      <Text style={styles.categoryCount}>
                        {challengesCount}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => router.push('/code')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(16, 185, 129, 0.2)',
                        'rgba(5, 150, 105, 0.1)',
                      ]}
                      style={styles.categoryGradient}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: '#10b98120' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="code-braces"
                          size={24}
                          color="#10b981"
                        />
                      </View>
                      <Text style={styles.categoryTitle}>المحرر</Text>
                      <Text style={styles.categoryCount}>∞</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => router.push('/ai')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(139, 92, 246, 0.2)',
                        'rgba(124, 58, 237, 0.1)',
                      ]}
                      style={styles.categoryGradient}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: '#8b5cf620' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="robot"
                          size={24}
                          color="#8b5cf6"
                        />
                      </View>
                      <Text style={styles.categoryTitle}>AI</Text>
                      <Text style={styles.categoryCount}>مساعد</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* التصنيفات - Leaderboard Section */}
            <Animated.View entering={FadeInUp.delay(240).duration(600)}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialIcons
                      name="leaderboard"
                      size={20}
                      color="#f59e0b"
                    />
                    <Text style={styles.sectionTitle}>التصنيفات</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/leaderboard' as any)}
                  >
                    <Text style={styles.seeAll}>عرض الكل</Text>
                  </TouchableOpacity>
                </View>

                {topUsers.length > 0 ? (
                  <View style={styles.leaderboardPreview}>
                    {topUsers.map((user, index) => (
                      <LeaderboardCard
                        key={user.id}
                        user={user}
                        rank={index + 1}
                        animated
                        delay={index * 100}
                        onClick={() => router.push('/leaderboard' as any)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyLeaderboard}>
                    <MaterialIcons
                      name="emoji-events"
                      size={32}
                      color="#4b5563"
                    />
                    <Text style={styles.emptyLeaderboardText}>
                      سجل دخولك للانضمام للتصنيفات!
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Featured Courses */}
            <Animated.View entering={FadeInUp.delay(250).duration(600)}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="book" size={20} color="#a855f7" />
                    <Text style={styles.sectionTitle}>دورات مميزة</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/learn')}>
                    <Text style={styles.seeAll}>عرض الكل</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.coursesScroll}
                >
                  {featuredCourses.map((course, index) => (
                    <TouchableOpacity
                      key={course.id}
                      style={styles.courseCard}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/course/${course.id}` as any)}
                    >
                      <CosmicCard animated>
                        <LinearGradient
                          colors={[`${course.color}33`, `${course.color}11`]}
                          style={styles.courseContent}
                        >
                          <View
                            style={[
                              styles.courseIconContainer,
                              { backgroundColor: `${course.color}22` },
                            ]}
                          >
                            <Ionicons
                              name={course.icon as any}
                              size={28}
                              color={course.color}
                            />
                          </View>
                          <Text style={styles.courseName}>{course.title}</Text>
                          <View style={styles.courseStats}>
                            <Ionicons
                              name="book-outline"
                              size={12}
                              color="#9ca3af"
                            />
                            <Text style={styles.courseStatText}>
                              {course.totalLessons} دروس
                            </Text>
                          </View>
                        </LinearGradient>
                      </CosmicCard>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>

            {/* Call to Action */}
            <Animated.View entering={FadeInUp.delay(300).duration(600)}>
              <View style={styles.ctaCardWrapper}>
                <LinearGradient
                  colors={['#1a1040', '#2d1b69', '#1a1040']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGradient}
                >
                  <View style={styles.ctaContent}>
                    <View style={styles.ctaIconCircle}>
                      <Ionicons name="trophy" size={28} color="#fbbf24" />
                    </View>
                    <Text style={styles.ctaTitle}>جاهز للتحدي التالي؟</Text>
                    <Text style={styles.ctaSubtitle}>
                      اكسب المزيد من XP والشارات!
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/challenges')}
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaButtonText}>ابدأ التحدي</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  heroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  heroLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 19,
    color: '#ccc',
    marginBottom: 8,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 16,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroStatText: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  weeklyContainer: {
    padding: 4,
  },
  weeklyHeader: {
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  weeklySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  weeklyDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  dayItem: {
    alignItems: 'center',
    gap: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#8b5cf6',
  },
  dayText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 110,
    justifyContent: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickAccessGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 140,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  statsContainer: {
    gap: 16,
    padding: 4,
  },
  xpSection: {
    marginBottom: 8,
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniStat: {
    alignItems: 'center',
    gap: 4,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    width: '100%',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  seeAll: {
    fontSize: 14,
    color: '#ff6b9d',
    fontWeight: '600',
  },
  coursesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  courseCard: {
    width: 150,
    marginRight: 12,
  },
  courseContent: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    minHeight: 160,
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  courseStatText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  ctaContent: {
    alignItems: 'center',
    padding: 28,
    gap: 14,
  },
  ctaCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  ctaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  ctaButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'rgb(214, 167, 34)',
    borderRadius: 9999,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  leaderboardPreview: {
    gap: 8,
  },
  emptyLeaderboard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyLeaderboardText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
