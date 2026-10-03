import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PROGRAMMING_FIELDS } from '@/constants';
import {
  getCoursesByField,
  Course,
  getLessonsByCourse,
  ALL_COURSES,
  getFieldRemainingPrice,
  getLockedPaidCourses,
  FULL_FIELD_DISCOUNT,
} from '@/constants/courseData';
import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';
// ===== نظام Hybrid: التقدم من Supabase =====
import { hybridSyncService } from '@/services/hybridSyncService';
import { useCoins } from '@/contexts/CoinsContext';
import { CoinBalance } from '@/components/coins/CoinBalance';
import { CoinIcon } from '@/components/coins/CoinIcon';
import { useCertificate } from '@/hooks/useCertificate';
import CertificateProgressCard from '@/components/certificate/CertificateProgressCard';

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
  streakBadgeWeb: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  } as ViewStyle,
  streakTextWeb: {
    fontSize: 16,
  } as TextStyle,
  sectionTitleWeb: {
    fontSize: 22,
    marginBottom: 16,
  } as TextStyle,
  fieldsGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  } as ViewStyle,
  fieldCardWeb: {
    minWidth: 140,
    flex: 1,
    maxWidth: 180,
  } as ViewStyle,
  fieldCardGradientWeb: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    minWidth: 140,
  } as ViewStyle,
  fieldNameWeb: {
    fontSize: 14,
    marginTop: 8,
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
  coursesGridWeb: {
    gap: 16,
  } as ViewStyle,
  courseCardWrapperWeb: {
    marginBottom: 0,
  } as ViewStyle,
  progressCardWeb: {
    marginBottom: 0,
  } as ViewStyle,
  progressGradientWeb: {
    padding: 28,
  } as ViewStyle,
  progressTitleWeb: {
    fontSize: 22,
  } as TextStyle,
  progressPercentWeb: {
    fontSize: 24,
  } as TextStyle,
  progressBarWeb: {
    height: 10,
    marginBottom: 12,
  } as ViewStyle,
  progressSubtextWeb: {
    fontSize: 14,
  } as TextStyle,
  comingSoonBannerWeb: {
    marginBottom: 0,
  } as ViewStyle,
  comingSoonGradientWeb: {
    padding: 28,
  } as ViewStyle,
  comingSoonTitleWeb: {
    fontSize: 18,
  } as TextStyle,
  comingSoonSubtitleWeb: {
    fontSize: 14,
  } as TextStyle,
};

// Field Card Component
const FieldCard = React.memo(
  ({
    field,
    isSelected,
    onPress,
  }: {
    field: (typeof PROGRAMMING_FIELDS)[0];
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fieldCard, isSelected && styles.fieldCardSelected]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          isSelected
            ? [field.color + '40', field.color + '20']
            : ['#1a1a3e', '#252550']
        }
        style={styles.fieldCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons
          name={field.icon as any}
          size={28}
          color={isSelected ? field.color : '#9ca3af'}
        />
        <Text style={[styles.fieldName, isSelected && { color: field.color }]}>
          {field.nameAr}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  )
);

// Course Card Component
const CourseCard = React.memo(
  ({
    course,
    index,
    completedLessonsCount,
    isCourseUnlocked,
    onLockPress,
  }: {
    course: Course;
    index: number;
    completedLessonsCount: number;
    isCourseUnlocked: boolean;
    onLockPress: (course: Course) => void;
  }) => {
    const difficultyColors = {
      beginner: '#22c55e',
      intermediate: '#f59e0b',
      advanced: '#ef4444',
    };

    const difficultyLabels = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    };

    // التحقق من حالة القفل - إذا كانت مجانية أو مفتوحة بالكوينات
    const isActuallyLocked =
      course.isLocked && course.pointsCost > 0 && !isCourseUnlocked;

    // حساب عدد الدروس الفعلي من قاعدة البيانات
    const courseLessons = getLessonsByCourse(course.id);
    const actualTotalLessons = courseLessons.length;

    const progressPercent =
      actualTotalLessons > 0
        ? Math.round((completedLessonsCount / actualTotalLessons) * 100)
        : 0;
    const isCompleted = progressPercent === 100;

    const handlePress = () => {
      if (isActuallyLocked) {
        onLockPress(course);
      } else {
        router.push(`/course/${course.id}` as any);
      }
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={styles.courseCardContainer}
      >
        <TouchableOpacity
          style={styles.courseCard}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isActuallyLocked
                ? ['#1a1a3e', '#252550']
                : [course.color + '30', course.color + '10']
            }
            style={styles.courseCardGradient}
          >
            {/* Completion Badge */}
            {isCompleted && (
              <View style={styles.completionBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              </View>
            )}

            {/* Lock Overlay with Coin Cost */}
            {isActuallyLocked && (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <View style={styles.pointsCostBadge}>
                  <CoinIcon size={12} />
                  <Text style={styles.pointsCostText}>{course.pointsCost}</Text>
                </View>
              </View>
            )}

            {/* Course Icon */}
            <View
              style={[
                styles.courseIcon,
                { backgroundColor: course.color + '30' },
                isCompleted && { borderColor: '#22c55e', borderWidth: 2 },
              ]}
            >
              <Ionicons
                name={course.icon as any}
                size={24}
                color={course.color}
              />
            </View>

            {/* Course Info */}
            <View style={styles.courseInfo}>
              <View style={styles.courseTitleRow}>
                <Text
                  style={[
                    styles.courseTitle,
                    isActuallyLocked && styles.lockedText,
                  ]}
                >
                  {course.title}
                </Text>
                {progressPercent > 0 && !isCompleted && (
                  <Text style={styles.progressText}>{progressPercent}%</Text>
                )}
              </View>
              <Text
                style={[
                  styles.courseDescription,
                  isActuallyLocked && styles.lockedText,
                ]}
              >
                {course.description}
              </Text>

              {/* Progress Bar */}
              {progressPercent > 0 && (
                <View style={styles.courseProgressBar}>
                  <View
                    style={[
                      styles.courseProgressFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: isCompleted ? '#22c55e' : course.color,
                      },
                    ]}
                  />
                </View>
              )}

              {/* Stats */}
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Ionicons name="book-outline" size={14} color="#9ca3af" />
                  <Text style={styles.statText}>
                    {completedLessonsCount}/{actualTotalLessons} دروس
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.statText}>{course.totalXP} XP</Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        difficultyColors[course.difficulty] + '30',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficultyColors[course.difficulty] },
                    ]}
                  >
                    {difficultyLabels[course.difficulty]}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrow or Unlock */}
            {isActuallyLocked ? (
              <View style={styles.unlockHint}>
                <Ionicons name="star" size={16} color="#F59E0B" />
              </View>
            ) : (
              <Ionicons
                name="chevron-back"
                size={20}
                color="#6b7280"
                style={styles.courseArrow}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default function LearnScreen() {
  const { user, fullName } = useAuth();
  const { isCourseUnlocked } = useCoins();
  const { isLargeScreen, isWeb, contentPaddingTop, contentPaddingBottom } =
    useResponsiveLayout();
  const [selectedField, setSelectedField] = useState<string>('web-dev');
  const [refreshing, setRefreshing] = useState(false);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(
    {}
  );

  const courses = getCoursesByField(selectedField);
  const selectedFieldData = PROGRAMMING_FIELDS.find(
    (f) => f.id === selectedField
  );

  // نظام الشهادات للمجال المحدد
  const certificate = useCertificate({
    fieldId: selectedField,
    fieldName: selectedFieldData?.name || selectedField,
    fieldNameAr: selectedFieldData?.nameAr,
    userId: user?.id,
    isProgressLoading: false,
  });

  // الدورة المقفلة: صفحة الدورة تعرض المحتوى + معاينة مجانية + الفتح بالكوينات
  const handleLockedCoursePress = useCallback((course: Course) => {
    router.push(`/course/${course.id}` as any);
  }, []);

  // ===== جلب التقدم من Supabase =====
  const loadProgress = useCallback(async () => {
    if (!user?.id) return;

    // تعيين المستخدم في خدمة المزامنة
    await hybridSyncService.setUser(user.id);

    // جلب التقدم بشكل متوازي بدل تتابعي
    const progressEntries = await Promise.all(
      courses.map(async (course) => {
        const courseLessons = getLessonsByCourse(course.id);
        const totalLessons = courseLessons.length;
        const progress = await hybridSyncService.fetchCourseProgress(
          course.id,
          totalLessons
        );
        return [course.id, progress.completedCount] as const;
      })
    );

    const progressMap: Record<string, number> = {};
    for (const [id, count] of progressEntries) {
      progressMap[id] = count;
    }
    setCourseProgress(progressMap);
  }, [user?.id, selectedField]);

  // تحميل التقدم عند تغيير المجال أو المستخدم
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // تحديث عند العودة للصفحة (مع تأخير لمنع التحديث المتكرر)
  const lastLoadRef = React.useRef(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // لا تحديث إذا مرت أقل من 30 ثانية
      if (now - lastLoadRef.current > 30000) {
        lastLoadRef.current = now;
        loadProgress();
      }
    }, [loadProgress])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  }, [loadProgress]);

  const totalCourses = courses.length;
  const completedCourses = useMemo(
    () =>
      courses.filter((course) => {
        const actualTotal = getLessonsByCourse(course.id).length;
        return courseProgress[course.id] >= actualTotal && actualTotal > 0;
      }).length,
    [courses, courseProgress]
  );
  const progressPercent = useMemo(
    () => (totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0),
    [completedCourses, totalCourses]
  );

  // حساب معلومات الخصم للمجال الحالي - memoized
  const unlockedCourseIds = useMemo(
    () => ALL_COURSES.filter((c) => isCourseUnlocked(c.id)).map((c) => c.id),
    [isCourseUnlocked]
  );

  const fieldPricing = useMemo(
    () => getFieldRemainingPrice(selectedField, unlockedCourseIds),
    [selectedField, unlockedCourseIds]
  );
  const lockedFieldCourses = useMemo(
    () => getLockedPaidCourses(selectedField, unlockedCourseIds),
    [selectedField, unlockedCourseIds]
  );
  const hasFieldDiscount =
    lockedFieldCourses.length > 1 && fieldPricing && fieldPricing.remaining > 0;
  const firstLockedCourse = lockedFieldCourses[0];

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
              <View style={styles.greetingRow}>
                <Text
                  style={[
                    styles.greeting,
                    isLargeScreen && isWeb && webStyles.greetingWeb,
                  ]}
                >
                  مرحباً، {fullName || user?.email?.split('@')[0] || 'متعلم'}
                </Text>
                <Ionicons name="hand-right" size={16} color="#fbbf24" />
              </View>
              <Text
                style={[
                  styles.headerTitle,
                  isLargeScreen && isWeb && webStyles.headerTitleWeb,
                ]}
              >
                تعلّم البرمجة
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.streakBadge,
                isLargeScreen && isWeb && webStyles.streakBadgeWeb,
              ]}
            >
              <Ionicons
                name="flame"
                size={isLargeScreen && isWeb ? 22 : 18}
                color="#f97316"
              />
              <Text
                style={[
                  styles.streakText,
                  isLargeScreen && isWeb && webStyles.streakTextWeb,
                ]}
              >
                5
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Fields Selector */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                isLargeScreen && isWeb && webStyles.sectionTitleWeb,
              ]}
            >
              اختر المجال
            </Text>
            {isLargeScreen && isWeb ? (
              <View style={webStyles.fieldsGridWeb}>
                {PROGRAMMING_FIELDS.map((field) => (
                  <TouchableOpacity
                    key={field.id}
                    onPress={() => setSelectedField(field.id)}
                    style={[
                      styles.fieldCard,
                      webStyles.fieldCardWeb,
                      selectedField === field.id && styles.fieldCardSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        selectedField === field.id
                          ? [field.color + '40', field.color + '20']
                          : ['#1a1a3e', '#252550']
                      }
                      style={[
                        styles.fieldCardGradient,
                        webStyles.fieldCardGradientWeb,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={field.icon as any}
                        size={32}
                        color={
                          selectedField === field.id ? field.color : '#9ca3af'
                        }
                      />
                      <Text
                        style={[
                          styles.fieldName,
                          webStyles.fieldNameWeb,
                          selectedField === field.id && { color: field.color },
                        ]}
                      >
                        {field.nameAr}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fieldsContainer}
              >
                {PROGRAMMING_FIELDS.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    isSelected={selectedField === field.id}
                    onPress={() => setSelectedField(field.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Two-column layout for web */}
          {isLargeScreen && isWeb ? (
            <View style={webStyles.webContainer}>
              {/* Left Column - Courses */}
              <View style={webStyles.webLeftColumn}>
                {/* Courses List */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[styles.sectionTitle, webStyles.sectionTitleWeb]}
                    >
                      الدورات المتاحة
                    </Text>
                    <View style={styles.headerActions}>
                      <CoinBalance size="small" />
                    </View>
                  </View>
                  {courses.length > 0 ? (
                    <View style={webStyles.coursesGridWeb}>
                      {courses.map((course, index) => (
                        <View
                          key={course.id}
                          style={webStyles.courseCardWrapperWeb}
                        >
                          <CourseCard
                            course={course}
                            index={index}
                            completedLessonsCount={
                              courseProgress[course.id] || 0
                            }
                            isCourseUnlocked={isCourseUnlocked(course.id)}
                            onLockPress={handleLockedCoursePress}
                          />
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="school-outline"
                        size={48}
                        color="#6b7280"
                      />
                      <Text style={styles.emptyText}>
                        لا توجد دورات في هذا المجال حالياً
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right Column - Progress & Coming Soon */}
              <View style={webStyles.webRightColumn}>
                {/* Progress Card */}
                {selectedFieldData && (
                  <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    style={[styles.progressCard, webStyles.progressCardWeb]}
                  >
                    <LinearGradient
                      colors={[
                        selectedFieldData.color + '30',
                        selectedFieldData.color + '10',
                      ]}
                      style={[
                        styles.progressGradient,
                        webStyles.progressGradientWeb,
                      ]}
                    >
                      <View style={styles.progressHeader}>
                        <Text
                          style={[
                            styles.progressTitle,
                            webStyles.progressTitleWeb,
                          ]}
                        >
                          {selectedFieldData.name}
                        </Text>
                        <Text
                          style={[
                            styles.progressPercent,
                            webStyles.progressPercentWeb,
                          ]}
                        >
                          {Math.round(progressPercent)}%
                        </Text>
                      </View>
                      <View
                        style={[styles.progressBar, webStyles.progressBarWeb]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progressPercent}%`,
                              backgroundColor: selectedFieldData.color,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progressSubtext,
                          webStyles.progressSubtextWeb,
                        ]}
                      >
                        {completedCourses} من {totalCourses} دورات مكتملة
                      </Text>
                    </LinearGradient>
                    {hasFieldDiscount && firstLockedCourse && (
                      <TouchableOpacity
                        style={styles.discountBadgeButton}
                        onPress={() =>
                          router.push(`/course/${firstLockedCourse.id}` as any)
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="gift" size={14} color="#10b981" />
                        <Text style={styles.discountBadgeText}>
                          افتح كل دورات المسار بالكوينات ووفّر 15%
                        </Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                )}

                {/* Certificate Progress Card - Web */}
                {selectedFieldData && (
                  <CertificateProgressCard
                    fieldId={selectedField}
                    fieldName={selectedFieldData.name}
                    fieldNameAr={selectedFieldData.nameAr}
                    currentCertificate={certificate.currentCertificate}
                    silverEligibility={certificate.silverEligibility}
                    goldEligibility={certificate.goldEligibility}
                    platinumEligibility={certificate.platinumEligibility}
                    canClaim={certificate.canClaim}
                    claimableLevel={certificate.claimableLevel}
                    isLoading={certificate.isLoading}
                    isIssuing={certificate.isIssuing}
                    onIssueCertificate={certificate.issueCertificate}
                  />
                )}

                {/* Coming Soon Banner */}
                <Animated.View
                  entering={FadeInDown.delay(400).springify()}
                  style={[
                    styles.comingSoonBanner,
                    webStyles.comingSoonBannerWeb,
                  ]}
                >
                  <LinearGradient
                    colors={['#7c3aed30', '#7c3aed10']}
                    style={[
                      styles.comingSoonGradient,
                      webStyles.comingSoonGradientWeb,
                    ]}
                  >
                    <View style={styles.comingSoonContent}>
                      <Text style={styles.comingSoonIcon}>
                        <Ionicons
                          name="time-outline"
                          size={28}
                          color="#7c3aed"
                        />
                      </Text>
                      <View style={styles.comingSoonText}>
                        <Text
                          style={[
                            styles.comingSoonTitle,
                            webStyles.comingSoonTitleWeb,
                          ]}
                        >
                          دورات جديدة قريباً!
                        </Text>
                        <Text
                          style={[
                            styles.comingSoonSubtitle,
                            webStyles.comingSoonSubtitleWeb,
                          ]}
                        >
                          نعمل على إضافة المزيد من الدورات المميزة
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
            </View>
          ) : (
            <>
              {/* Progress Card - Mobile */}
              {selectedFieldData && (
                <Animated.View
                  entering={FadeInDown.delay(200).springify()}
                  style={styles.progressCard}
                >
                  <LinearGradient
                    colors={[
                      selectedFieldData.color + '30',
                      selectedFieldData.color + '10',
                    ]}
                    style={styles.progressGradient}
                  >
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>
                        {selectedFieldData.name}
                      </Text>
                      <Text style={styles.progressPercent}>
                        {Math.round(progressPercent)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: selectedFieldData.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressSubtext}>
                      {completedCourses} من {totalCourses} دورات مكتملة
                    </Text>
                  </LinearGradient>
                  {hasFieldDiscount && firstLockedCourse && (
                    <TouchableOpacity
                      style={styles.discountBadgeButton}
                      onPress={() =>
                        router.push(`/course/${firstLockedCourse.id}` as any)
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="gift" size={14} color="#10b981" />
                      <Text style={styles.discountBadgeText}>
                        افتح كل دورات المسار بالكوينات ووفّر 15%
                      </Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              )}

              {/* Certificate Progress Card - Mobile */}
              {selectedFieldData && (
                <View style={{ marginBottom: 16 }}>
                  <CertificateProgressCard
                    fieldId={selectedField}
                    fieldName={selectedFieldData.name}
                    fieldNameAr={selectedFieldData.nameAr}
                    currentCertificate={certificate.currentCertificate}
                    silverEligibility={certificate.silverEligibility}
                    goldEligibility={certificate.goldEligibility}
                    platinumEligibility={certificate.platinumEligibility}
                    canClaim={certificate.canClaim}
                    claimableLevel={certificate.claimableLevel}
                    isLoading={certificate.isLoading}
                    isIssuing={certificate.isIssuing}
                    onIssueCertificate={certificate.issueCertificate}
                  />
                </View>
              )}

              {/* Courses List - Mobile */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>الدورات المتاحة</Text>
                  <View style={styles.headerActions}>
                    <CoinBalance size="small" />
                  </View>
                </View>
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={index}
                      completedLessonsCount={courseProgress[course.id] || 0}
                      isCourseUnlocked={isCourseUnlocked(course.id)}
                      onLockPress={handleLockedCoursePress}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="school-outline" size={48} color="#6b7280" />
                    <Text style={styles.emptyText}>
                      لا توجد دورات في هذا المجال حالياً
                    </Text>
                  </View>
                )}
              </View>

              {/* Coming Soon Banner - Mobile */}
              <Animated.View
                entering={FadeInDown.delay(400).springify()}
                style={styles.comingSoonBanner}
              >
                <LinearGradient
                  colors={['#7c3aed30', '#7c3aed10']}
                  style={styles.comingSoonGradient}
                >
                  <View style={styles.comingSoonContent}>
                    <Text style={styles.comingSoonIcon}>
                      <Ionicons name="time-outline" size={24} color="#7c3aed" />
                    </Text>
                    <View style={styles.comingSoonText}>
                      <Text style={styles.comingSoonTitle}>
                        دورات جديدة قريباً!
                      </Text>
                      <Text style={styles.comingSoonSubtitle}>
                        نعمل على إضافة المزيد من الدورات المميزة
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
    justifyContent: 'space-between',
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
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf2420',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  fieldsContainer: {
    paddingVertical: 4,
  },
  fieldCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fieldCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  fieldCardGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 90,
    borderRadius: 16,
  },
  fieldIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  fieldName: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ffffff20',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  courseCardContainer: {
    marginBottom: 12,
  },
  courseCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f1e80',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseIconText: {
    fontSize: 28,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  courseDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  courseProgressBar: {
    height: 4,
    backgroundColor: '#ffffff20',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  lockedText: {
    opacity: 0.5,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
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
  courseArrow: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  comingSoonBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  comingSoonGradient: {
    padding: 20,
    borderRadius: 16,
  },
  comingSoonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingSoonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  comingSoonText: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  comingSoonSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  pointsCostText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unlockHint: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b98120',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  discountBadgeText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
});
