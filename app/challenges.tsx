/**
 * Challenges Page - Kodax Programming Challenges
 * مع تصنيف حسب الفئات ومستويات الصعوبة
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ViewStyle,
  TextStyle,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartIcon } from '@/components/ui/SmartIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import {
  ALL_CHALLENGES,
  ALL_COURSES,
  Challenge,
  getChallengeAccessType,
  getChallengeRequiredCourseId,
  getCourseTitleById,
  isCourseAccessible,
} from '@/constants/courseData';
import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';
// ===== نظام Hybrid: التقدم من Supabase =====
import { hybridSyncService } from '@/services/hybridSyncService';
import { useCoins } from '@/contexts/CoinsContext';
import { THEME_COLORS, SHADOWS, BORDER_RADIUS } from '@/styles/theme';

const { width } = Dimensions.get('window');

// Web-specific styles with explicit type assertions
const webStyles = {
  scrollContentWeb: {
    paddingHorizontal: 60,
    paddingTop: 80,
    paddingBottom: 60,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  headerWeb: {
    marginBottom: 32,
  } as ViewStyle,
  greetingWeb: {
    fontSize: 16,
  } as TextStyle,
  headerTitleWeb: {
    fontSize: 36,
  } as TextStyle,
  statsCardWeb: {
    padding: 28,
    marginBottom: 32,
  } as ViewStyle,
  statValueWeb: {
    fontSize: 32,
  } as TextStyle,
  statLabelWeb: {
    fontSize: 14,
  } as TextStyle,
  filterTitleWeb: {
    fontSize: 16,
    marginBottom: 16,
  } as TextStyle,
  webContainer: {
    flexDirection: 'row',
    gap: 40,
  } as ViewStyle,
  webLeftColumn: {
    flex: 2,
  } as ViewStyle,
  webRightColumn: {
    flex: 1,
    gap: 24,
    position: 'sticky',
    top: 20,
    alignSelf: 'flex-start',
  } as ViewStyle,
  categoryGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  } as ViewStyle,
  categoryTabWeb: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  } as ViewStyle,
  categoryLabelWeb: {
    fontSize: 14,
  } as TextStyle,
  tabsContainerWeb: {
    gap: 12,
    marginBottom: 8,
  } as ViewStyle,
  difficultyTabGradientWeb: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  } as ViewStyle,
  difficultyLabelWeb: {
    fontSize: 15,
  } as TextStyle,
  challengesGridWeb: {
    gap: 16,
  } as ViewStyle,
  sectionTitleWeb: {
    fontSize: 22,
    marginBottom: 20,
  } as TextStyle,
  challengeCardGradientWeb: {
    padding: 20,
  } as ViewStyle,
  challengeIconWeb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16,
  } as ViewStyle,
  challengeTitleWeb: {
    fontSize: 18,
  } as TextStyle,
  challengeDescriptionWeb: {
    fontSize: 14,
    marginBottom: 12,
  } as TextStyle,
  tipsCardWeb: {
    marginBottom: 0,
  } as ViewStyle,
  tipsGradientWeb: {
    padding: 28,
  } as ViewStyle,
  tipsTitleWeb: {
    fontSize: 18,
  } as TextStyle,
  tipsSubtitleWeb: {
    fontSize: 14,
  } as TextStyle,
};

// تصنيفات التحديات
const CHALLENGE_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: 'apps', color: '#3b82f6' },
  { id: 'web', label: 'الويب', icon: 'logo-html5', color: '#f59e0b' },
  { id: 'python', label: 'Python', icon: 'logo-python', color: '#3776ab' },
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'logo-javascript',
    color: '#f7df1e',
  },
  { id: 'algorithms', label: 'خوارزميات', icon: 'analytics', color: '#8b5cf6' },
  {
    id: 'data-structures',
    label: 'هياكل البيانات',
    icon: 'git-network',
    color: '#10b981',
  },
  { id: 'css', label: 'CSS', icon: 'color-palette', color: '#264de4' },
  { id: 'react', label: 'React', icon: 'logo-react', color: '#61dafb' },
  {
    id: 'cyber',
    label: 'الأمن السيبراني',
    icon: 'shield-checkmark',
    color: '#ef4444',
  },
];

// تصنيف التحدي حسب اللغة أو الفئة
// ✅ تحقق من الفئة أولاً للتحديات الخاصة (أمن سيبراني، خوارزميات، هياكل بيانات)
const getChallengeCategory = (challenge: Challenge): string => {
  const lang = challenge.language?.toLowerCase() || '';
  const cat = challenge.category?.toLowerCase() || '';

  // ✅ أولوية للفئات الخاصة (قبل اللغة)
  if (cat.includes('cyber') || cat.includes('security')) return 'cyber';
  if (cat.includes('algorithm')) return 'algorithms';
  if (cat.includes('data-structure') || cat.includes('array'))
    return 'data-structures';

  // ثم تحقق من اللغة
  if (lang.includes('python')) return 'python';
  if (lang.includes('javascript') || lang.includes('js')) return 'javascript';
  if (lang.includes('css')) return 'css';
  if (lang.includes('html')) return 'web';
  if (lang.includes('react')) return 'react';
  if (cat.includes('web')) return 'web';

  return 'other';
};

// Difficulty Tab Component - مُحسّن بـ memo
const DifficultyTab = memo(
  ({
    label,
    isSelected,
    color,
    count,
    onPress,
  }: {
    label: string;
    isSelected: boolean;
    color: string;
    count: number;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.difficultyTab,
        isSelected && { borderColor: color },
        { ...SHADOWS.redGlowLight },
      ]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          isSelected ? [color + '40', color + '20'] : ['#1a1a3e', '#252550']
        }
        style={styles.difficultyTabGradient}
      >
        <Text style={[styles.difficultyLabel, isSelected && { color }]}>
          {label}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: color + '30' }]}>
          <Text style={[styles.countText, { color }]}>{count}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.count === nextProps.count
    );
  }
);

// Category Tab Component - مُحسّن بـ memo
const CategoryTab = memo(
  ({
    category,
    isSelected,
    count,
    onPress,
  }: {
    category: (typeof CHALLENGE_CATEGORIES)[0];
    isSelected: boolean;
    count: number;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryTab,
        isSelected && {
          borderColor: category.color,
          backgroundColor: category.color + '20',
        },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={category.icon as any}
        size={18}
        color={isSelected ? category.color : '#9ca3af'}
      />
      <Text
        style={[styles.categoryLabel, isSelected && { color: category.color }]}
      >
        {category.label}
      </Text>
      <View
        style={[
          styles.categoryCount,
          { backgroundColor: category.color + '30' },
        ]}
      >
        <Text style={[styles.categoryCountText, { color: category.color }]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.count === nextProps.count &&
      prevProps.category.id === nextProps.category.id
    );
  }
);

// Challenge Card Component - مُحسّن بـ memo
const ChallengeCard = memo(
  ({
    challenge,
    index,
    isCompleted,
    unlockedCourses,
  }: {
    challenge: Challenge;
    index: number;
    isCompleted: boolean;
    unlockedCourses: string[];
  }) => {
    const difficultyColors = {
      easy: '#22c55e',
      medium: '#f59e0b',
      hard: '#ef4444',
    };

    const difficultyLabels = {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
    };

    const color = difficultyColors[challenge.difficulty];

    // ===== نظام الوصول: جزء مجاني، والباقي يُفتح مع الدورة (بالكوينات) =====
    const accessType = getChallengeAccessType(challenge);
    const requiredCourseId = getChallengeRequiredCourseId(challenge);

    let isLocked = false;
    let lockMessage = '';

    if (accessType === 'free') {
      isLocked = false;
    } else {
      // course-required
      if (requiredCourseId) {
        const courseOpen = isCourseAccessible(
          requiredCourseId,
          unlockedCourses
        );
        isLocked = !courseOpen;
        lockMessage = `يُفتح بالتقدم إلى دورة ${getCourseTitleById(requiredCourseId)}`;
      } else {
        isLocked = false;
      }
    }

    return (
      <Animated.View
        entering={
          index < 15 ? FadeInDown.delay(index * 60).springify() : undefined
        }
        style={styles.challengeCardContainer}
      >
        <TouchableOpacity
          style={[styles.challengeCard, { ...SHADOWS.redGlowLight }]}
          onPress={() => {
            if (!isLocked) {
              router.push(`/challenge/${challenge.id}` as any);
            }
          }}
          activeOpacity={isLocked ? 0.5 : 0.7}
          disabled={isLocked}
        >
          <LinearGradient
            colors={
              isLocked
                ? Platform.OS === 'android'
                  ? ['rgba(25, 25, 50, 0.9)', 'rgba(18, 18, 40, 1)']
                  : ['#1a1a3e', '#252550']
                : Platform.OS === 'android'
                  ? ['#1a1a3e', '#252550']
                  : [color + '30', color + '25']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.challengeCardGradient}
          >
            {/* Lock Overlay */}
            {isLocked && (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={24} color="#6b7280" />
                <Text style={styles.lockText}>{lockMessage}</Text>
              </View>
            )}

            {/* Completed Badge */}
            {isCompleted && !isLocked && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
              </View>
            )}

            {/* Icon */}
            <View
              style={[styles.challengeIcon, { backgroundColor: color + '30' }]}
            >
              <SmartIcon name={challenge.icon} size={24} color={color} />
            </View>

            {/* Content */}
            <View style={styles.challengeContent}>
              <View style={styles.challengeHeader}>
                <Text
                  style={[styles.challengeTitle, isLocked && styles.lockedText]}
                >
                  {challenge.title}
                </Text>
                <View
                  style={[styles.pointsBadge, { backgroundColor: '#fbbf2420' }]}
                >
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.pointsText}>{challenge.points}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.challengeDescription,
                  isLocked && styles.lockedText,
                ]}
                numberOfLines={2}
              >
                {challenge.description}
              </Text>

              <View style={styles.challengeMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: color + '20' },
                  ]}
                >
                  <Text style={[styles.difficultyText, { color }]}>
                    {difficultyLabels[challenge.difficulty]}
                  </Text>
                </View>
                <View style={styles.languageBadge}>
                  <Text style={styles.languageText}>{challenge.language}</Text>
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: '#8b5cf620' },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>
                    {getChallengeCategory(challenge) === 'algorithms'
                      ? 'خوارزميات'
                      : getChallengeCategory(challenge) === 'data-structures'
                        ? 'هياكل بيانات'
                        : getChallengeCategory(challenge)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            {!isLocked && (
              <Ionicons name="chevron-back" size={20} color="#6b7280" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // مقارنة لتحسين الأداء
    return (
      prevProps.challenge.id === nextProps.challenge.id &&
      prevProps.isCompleted === nextProps.isCompleted &&
      prevProps.unlockedCourses === nextProps.unlockedCourses
    );
  }
);

export default function ChallengesScreen() {
  const { user } = useAuth();
  const { unlockedCourses } = useCoins();
  const { isLargeScreen, isWeb, contentPaddingTop, contentPaddingBottom } =
    useResponsiveLayout();
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const PAGE_SIZE = 15;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // ===== جلب التحديات المكتملة من Supabase =====
  const loadProgress = useCallback(async () => {
    if (!user?.id) return;

    await hybridSyncService.setUser(user.id);
    // جلب كل الدروس المكتملة (التحديات تُعامل كدروس)
    const completed = await hybridSyncService.fetchAllCompletedLessons();
    // تصفية التحديات فقط
    const completedChallengeIds = completed.filter((id) =>
      ALL_CHALLENGES.some((ch) => ch.id === id)
    );
    setCompletedChallenges(completedChallengeIds);
  }, [user?.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // تحديث عند العودة للصفحة
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  // حساب عدد التحديات الفعلي من المصفوفة
  const totalChallengesCount = ALL_CHALLENGES.length;

  // تصفية التحديات حسب الفئة والصعوبة
  const filteredChallenges = useMemo(() => {
    let filtered = ALL_CHALLENGES;

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (ch) => getChallengeCategory(ch) === selectedCategory
      );
    }

    // تصفية حسب الصعوبة
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((ch) => ch.difficulty === selectedDifficulty);
    }

    // ترتيب: المفتوحة أولاً ثم المقفولة
    filtered = [...filtered].sort((a, b) => {
      const aAccess = getChallengeAccessType(a);
      const bAccess = getChallengeAccessType(b);

      // تحديد مستوى القفل: 0 = مفتوح، 1 = مقفول (يتطلب فتح الدورة)
      const getLockLevel = (access: string, challenge: any) => {
        if (access === 'free') return 0;
        // course-required
        const courseId = getChallengeRequiredCourseId(challenge);
        const isOpen = courseId
          ? isCourseAccessible(courseId, unlockedCourses)
          : true;
        return isOpen ? 0 : 1;
      };

      const aLevel = getLockLevel(aAccess, a);
      const bLevel = getLockLevel(bAccess, b);

      return aLevel - bLevel; // المفتوحة أولاً
    });

    return filtered;
  }, [selectedCategory, selectedDifficulty, unlockedCourses]);

  // حساب عدد التحديات حسب الصعوبة والفئة - مع memoization
  const challengeCounts = useMemo(() => {
    const byDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
      let challenges = ALL_CHALLENGES;
      if (selectedCategory !== 'all') {
        challenges = challenges.filter(
          (ch) => getChallengeCategory(ch) === selectedCategory
        );
      }
      return challenges.filter((ch) => ch.difficulty === difficulty).length;
    };
    return {
      easy: byDifficulty('easy'),
      medium: byDifficulty('medium'),
      hard: byDifficulty('hard'),
    };
  }, [selectedCategory]);

  const getChallengeCountByCategory = useCallback((categoryId: string) => {
    if (categoryId === 'all') return ALL_CHALLENGES.length;
    return ALL_CHALLENGES.filter(
      (ch) => getChallengeCategory(ch) === categoryId
    ).length;
  }, []);

  // Count challenges by difficulty (للتوافق مع الكود القديم)
  const easyChallenges = challengeCounts.easy;
  const mediumChallenges = challengeCounts.medium;
  const hardChallenges = challengeCounts.hard;

  // Stats - memoized
  const completedChallengesCount = completedChallenges.length;
  const totalPoints = useMemo(
    () => ALL_CHALLENGES.reduce((sum: number, ch) => sum + ch.points, 0),
    []
  );
  const earnedPoints = useMemo(
    () =>
      completedChallenges.reduce((sum, chId) => {
        const ch = ALL_CHALLENGES.find((c) => c.id === chId);
        return sum + (ch?.points || 0);
      }, 0),
    [completedChallenges]
  );

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedDifficulty]);

  // Visible slice for mobile pagination
  const visibleChallenges = useMemo(
    () => filteredChallenges.slice(0, visibleCount),
    [filteredChallenges, visibleCount]
  );
  const hasMore = visibleCount < filteredChallenges.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    // Small delay for smooth UX
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredChallenges.length)
      );
      setLoadingMore(false);
    }, 200);
  }, [hasMore, loadingMore, filteredChallenges.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProgress().finally(() => setRefreshing(false));
  }, [loadProgress]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isLargeScreen && isWeb && webStyles.scrollContentWeb,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInUp.springify()}
            style={[
              styles.header,
              isLargeScreen && isWeb && webStyles.headerWeb,
            ]}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.headerTitleRow}>
                <Text
                  style={[
                    styles.greeting,
                    isLargeScreen && isWeb && webStyles.greetingWeb,
                  ]}
                >
                  تحديات البرمجة
                </Text>
                <Ionicons
                  name="trophy"
                  size={isLargeScreen && isWeb ? 22 : 18}
                  color="#fbbf24"
                />
              </View>
              <Text
                style={[
                  styles.headerTitle,
                  isLargeScreen && isWeb && webStyles.headerTitleWeb,
                ]}
              >
                اختبر مهاراتك
              </Text>
            </View>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={['rgba(28, 23, 66, 0.91)', 'rgba(40, 25, 67, 1)']}
              style={[
                styles.statsCard,
                { ...SHADOWS.purpleGlow },
                isLargeScreen && isWeb && webStyles.statsCardWeb,
              ]}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      isLargeScreen && isWeb && webStyles.statValueWeb,
                    ]}
                  >
                    {completedChallengesCount}/{totalChallengesCount}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isLargeScreen && isWeb && webStyles.statLabelWeb,
                    ]}
                  >
                    مكتملة
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      isLargeScreen && isWeb && webStyles.statValueWeb,
                    ]}
                  >
                    {earnedPoints}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isLargeScreen && isWeb && webStyles.statLabelWeb,
                    ]}
                  >
                    نقاط مكتسبة
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      isLargeScreen && isWeb && webStyles.statValueWeb,
                    ]}
                  >
                    {totalPoints}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isLargeScreen && isWeb && webStyles.statLabelWeb,
                    ]}
                  >
                    إجمالي
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Category Tabs */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.categoryContainer}
          >
            <Text
              style={[
                styles.filterTitle,
                isLargeScreen && isWeb && webStyles.filterTitleWeb,
              ]}
            >
              تصنيف حسب الفئة
            </Text>
            {isLargeScreen && isWeb ? (
              <View style={webStyles.categoryGridWeb}>
                {CHALLENGE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={[
                      styles.categoryTab,
                      webStyles.categoryTabWeb,
                      selectedCategory === category.id && {
                        borderColor: category.color,
                        backgroundColor: category.color + '20',
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={
                        selectedCategory === category.id
                          ? category.color
                          : '#9ca3af'
                      }
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        webStyles.categoryLabelWeb,
                        selectedCategory === category.id && {
                          color: category.color,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                    <View
                      style={[
                        styles.categoryCount,
                        { backgroundColor: category.color + '30' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryCountText,
                          { color: category.color },
                        ]}
                      >
                        {getChallengeCountByCategory(category.id)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CHALLENGE_CATEGORIES.map((category) => (
                  <CategoryTab
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    count={getChallengeCountByCategory(category.id)}
                    onPress={() => setSelectedCategory(category.id)}
                  />
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Difficulty Tabs */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.tabsContainer}
          >
            <Text
              style={[
                styles.filterTitle,
                isLargeScreen && isWeb && webStyles.filterTitleWeb,
              ]}
            >
              تصنيف حسب الصعوبة
            </Text>
            {isLargeScreen && isWeb ? (
              <View style={webStyles.tabsContainerWeb}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {[
                    {
                      key: 'all',
                      label: 'الكل',
                      color: '#3b82f6',
                      count:
                        selectedCategory === 'all'
                          ? totalChallengesCount
                          : getChallengeCountByCategory(selectedCategory),
                    },
                    {
                      key: 'easy',
                      label: 'سهل',
                      color: '#22c55e',
                      count: easyChallenges,
                    },
                    {
                      key: 'medium',
                      label: 'متوسط',
                      color: '#f59e0b',
                      count: mediumChallenges,
                    },
                    {
                      key: 'hard',
                      label: 'صعب',
                      color: '#ef4444',
                      count: hardChallenges,
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => setSelectedDifficulty(item.key as any)}
                      style={[
                        styles.difficultyTab,
                        selectedDifficulty === item.key && {
                          borderColor: item.color,
                        },
                        { ...SHADOWS.redGlowLight },
                      ]}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          selectedDifficulty === item.key
                            ? [item.color + '40', item.color + '20']
                            : ['#1a1a3e', '#252550']
                        }
                        style={[
                          styles.difficultyTabGradient,
                          webStyles.difficultyTabGradientWeb,
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyLabel,
                            webStyles.difficultyLabelWeb,
                            selectedDifficulty === item.key && {
                              color: item.color,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <View
                          style={[
                            styles.countBadge,
                            { backgroundColor: item.color + '30' },
                          ]}
                        >
                          <Text
                            style={[styles.countText, { color: item.color }]}
                          >
                            {item.count}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
              >
                <DifficultyTab
                  label="الكل"
                  isSelected={selectedDifficulty === 'all'}
                  color="#3b82f6"
                  count={
                    selectedCategory === 'all'
                      ? totalChallengesCount
                      : filteredChallenges.length +
                        easyChallenges +
                        mediumChallenges +
                        hardChallenges -
                        filteredChallenges.length
                  }
                  onPress={() => setSelectedDifficulty('all')}
                />
                <DifficultyTab
                  label="سهل"
                  isSelected={selectedDifficulty === 'easy'}
                  color="#22c55e"
                  count={easyChallenges}
                  onPress={() => setSelectedDifficulty('easy')}
                />
                <DifficultyTab
                  label="متوسط"
                  isSelected={selectedDifficulty === 'medium'}
                  color="#f59e0b"
                  count={mediumChallenges}
                  onPress={() => setSelectedDifficulty('medium')}
                />
                <DifficultyTab
                  label="صعب"
                  isSelected={selectedDifficulty === 'hard'}
                  color="#ef4444"
                  count={hardChallenges}
                  onPress={() => setSelectedDifficulty('hard')}
                />
              </ScrollView>
            )}
          </Animated.View>

          {/* Two-column layout for web */}
          {isLargeScreen && isWeb ? (
            <View style={webStyles.webContainer}>
              {/* Left Column - Challenges */}
              <View style={webStyles.webLeftColumn}>
                <View style={styles.challengesSection}>
                  <Text
                    style={[styles.sectionTitle, webStyles.sectionTitleWeb]}
                  >
                    {selectedCategory !== 'all'
                      ? `تحديات ${CHALLENGE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || ''}`
                      : selectedDifficulty === 'all'
                        ? 'كل التحديات'
                        : selectedDifficulty === 'easy'
                          ? 'التحديات السهلة'
                          : selectedDifficulty === 'medium'
                            ? 'التحديات المتوسطة'
                            : 'التحديات الصعبة'}{' '}
                    ({filteredChallenges.length})
                  </Text>

                  {filteredChallenges.length > 0 ? (
                    <View style={webStyles.challengesGridWeb}>
                      {filteredChallenges
                        .slice(0, 20)
                        .map((challenge, index) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            index={index}
                            isCompleted={completedChallenges.includes(
                              challenge.id
                            )}
                            unlockedCourses={unlockedCourses}
                          />
                        ))}
                      {filteredChallenges.length > 20 && (
                        <View>
                          {filteredChallenges
                            .slice(20)
                            .map((challenge, index) => (
                              <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                index={index + 20}
                                isCompleted={completedChallenges.includes(
                                  challenge.id
                                )}
                                unlockedCourses={unlockedCourses}
                              />
                            ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="trophy-outline"
                        size={48}
                        color="#6b7280"
                      />
                      <Text style={styles.emptyText}>
                        لا توجد تحديات في هذه الفئة
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right Column - Tips */}
              <View style={webStyles.webRightColumn}>
                <Animated.View
                  entering={FadeInDown.delay(400).springify()}
                  style={[styles.tipsCard, webStyles.tipsCardWeb]}
                >
                  <LinearGradient
                    colors={['#3b82f620', '#3b82f610']}
                    style={[styles.tipsGradient, webStyles.tipsGradientWeb]}
                  >
                    <View style={styles.tipsContent}>
                      <View style={styles.tipsIconContainer}>
                        <Ionicons name="bulb" size={28} color="#fbbf24" />
                      </View>
                      <View style={styles.tipsText}>
                        <Text
                          style={[styles.tipsTitle, webStyles.tipsTitleWeb]}
                        >
                          نصيحة
                        </Text>
                        <Text
                          style={[
                            styles.tipsSubtitle,
                            webStyles.tipsSubtitleWeb,
                          ]}
                        >
                          ابدأ بالتحديات السهلة لبناء الثقة ثم انتقل تدريجياً
                          للأصعب
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
            </View>
          ) : (
            <>
              {/* Challenges List - Mobile (FlatList with pagination) */}
              <View style={styles.challengesSection}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory !== 'all'
                    ? `تحديات ${CHALLENGE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || ''}`
                    : selectedDifficulty === 'all'
                      ? 'كل التحديات'
                      : selectedDifficulty === 'easy'
                        ? 'التحديات السهلة'
                        : selectedDifficulty === 'medium'
                          ? 'التحديات المتوسطة'
                          : 'التحديات الصعبة'}{' '}
                  ({filteredChallenges.length})
                </Text>

                {visibleChallenges.length > 0 ? (
                  <>
                    {visibleChallenges.map((challenge, index) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        index={index}
                        isCompleted={completedChallenges.includes(challenge.id)}
                        unlockedCourses={unlockedCourses}
                      />
                    ))}
                    {hasMore && (
                      <TouchableOpacity
                        style={styles.loadMoreBtn}
                        onPress={loadMore}
                        activeOpacity={0.7}
                      >
                        {loadingMore ? (
                          <ActivityIndicator size="small" color="#8b5cf6" />
                        ) : (
                          <Text style={styles.loadMoreText}>
                            عرض المزيد (
                            {filteredChallenges.length - visibleCount} متبقي)
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={48} color="#6b7280" />
                    <Text style={styles.emptyText}>
                      لا توجد تحديات في هذه الفئة
                    </Text>
                  </View>
                )}
              </View>

              {/* Tips Section - Mobile */}
              <Animated.View
                entering={FadeInDown.delay(400).springify()}
                style={styles.tipsCard}
              >
                <LinearGradient
                  colors={['rgba(19, 30, 66, 0.7)', 'rgba(19, 30, 66, 0.8)']}
                  style={styles.tipsGradient}
                >
                  <View style={styles.tipsContent}>
                    <View style={styles.tipsIconContainer}>
                      <Ionicons name="bulb" size={24} color="#fbbf24" />
                    </View>
                    <View style={styles.tipsText}>
                      <Text style={styles.tipsTitle}>نصيحة</Text>
                      <Text style={styles.tipsSubtitle}>
                        ابدأ بالتحديات السهلة لبناء الثقة ثم انتقل تدريجياً
                        للأصعب
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ffffff20',
  },
  // Category styles
  categoryContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 10,
    paddingRight: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(25, 25, 50, 0.95)' : '#1a1a3e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android' ? 'rgba(139, 92, 246, 0.5)' : 'transparent',
    gap: 8,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  categoryCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Difficulty tabs
  tabsContainer: {
    marginBottom: 24,
  },
  tabsScroll: {
    gap: 12,
  },
  difficultyTab: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: Platform.OS === 'android' ? 1.5 : 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    elevation: Platform.OS === 'android' ? 5 : 0,
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(25, 25, 50, 0.95)' : 'transparent',
  },
  difficultyTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  challengeCardContainer: {
    marginBottom: 12,
  },
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'android' ? 1.5 : 0,
    borderColor:
      Platform.OS === 'android' ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  challengeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f1e90',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  lockText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  lockedText: {
    opacity: 0.5,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  challengeDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  languageBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(25, 25, 50, 0.95)' : '#1a1a3e',
    borderRadius: 16,
    borderWidth: Platform.OS === 'android' ? 1.5 : 0,
    borderColor:
      Platform.OS === 'android' ? 'rgba(139, 92, 246, 0.5)' : 'transparent',
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
  },
  tipsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'android' ? 1.5 : 0,
    borderColor:
      Platform.OS === 'android' ? 'rgba(139, 92, 246, 0.5)' : 'transparent',
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  tipsGradient: {
    padding: 20,
  },
  tipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipsText: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tipsSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#8b5cf630',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
});
