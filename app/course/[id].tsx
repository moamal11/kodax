import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../_layout';
// استخدام البيانات المحلية للمحتوى (Hybrid)
import {
  ALL_COURSES,
  getLessonsByCourse,
  Lesson,
  getChallengesByCourse,
} from '@/constants/courseData';
// استخدام Hook الهجين للتقدم من Supabase
import { useHybridProgress, useCourseUnlock } from '@/hooks/useHybridProgress';
import { useCoins } from '@/contexts/CoinsContext';
import { useResponsiveLayout } from '@/hooks';
import LockedCourseScreen from '@/components/coins/LockedCourseScreen';
import { showToast } from '@/components/ui/Toast';
import { useCertificate } from '@/hooks/useCertificate';
import CertificateProgressCard from '@/components/certificate/CertificateProgressCard';

const { width } = Dimensions.get('window');

// Lesson Card Component - مُحسّن بـ memo
const LessonCard = memo(
  ({
    lesson,
    index,
    isCompleted,
    isLocked,
    onPress,
  }: {
    lesson: Lesson;
    index: number;
    isCompleted: boolean;
    isLocked: boolean;
    onPress: () => void;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={styles.lessonCardContainer}
    >
      <TouchableOpacity
        style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        {/* Number Badge */}
        <View
          style={[
            styles.lessonNumber,
            isCompleted && styles.lessonNumberCompleted,
            isLocked && styles.lessonNumberLocked,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="#10b981" />
          ) : isLocked ? (
            <Ionicons name="lock-closed" size={14} color="#6b7280" />
          ) : (
            <Text style={styles.lessonNumberText}>{index + 1}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.lessonContent}>
          <Text style={[styles.lessonTitle, isLocked && styles.textLocked]}>
            {lesson.title}
          </Text>
          <Text
            style={[styles.lessonDescription, isLocked && styles.textLocked]}
          >
            {lesson.description}
          </Text>
          <View style={styles.lessonMeta}>
            <View style={styles.lessonMetaItem}>
              <Ionicons name="flash" size={12} color="#fbbf24" />
              <Text style={styles.lessonMetaText}>{lesson.xpReward} XP</Text>
            </View>
            {lesson.quiz && (
              <View style={styles.lessonMetaItem}>
                <Ionicons name="help-circle" size={12} color="#8b5cf6" />
                <Text style={styles.lessonMetaText}>اختبار</Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        {!isLocked && (
          <Ionicons name="chevron-back" size={20} color="#6b7280" />
        )}
      </TouchableOpacity>
    </Animated.View>
  ),
  (prev, next) =>
    prev.isCompleted === next.isCompleted &&
    prev.isLocked === next.isLocked &&
    prev.lesson.id === next.lesson.id &&
    prev.index === next.index
);

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isLargeScreen, isWeb, contentPaddingTop, contentPaddingBottom } =
    useResponsiveLayout();
  const [unlockedLessons, setUnlockedLessons] = useState<string[]>([]);

  // ===== نظام Hybrid: المحتوى محلي، التقدم من Supabase =====

  // جلب الكورس من البيانات المحلية (سرعة)
  const course = ALL_COURSES.find((c) => c.id === id);
  const lessons = useMemo(
    () =>
      course
        ? getLessonsByCourse(course.id).sort((a, b) => a.order - b.order)
        : [],
    [course?.id]
  );

  // جلب التقدم من Supabase (مزامنة)
  const {
    completedLessons: completedLessonIds,
    completedCount,
    progressPercent,
    lastCompletedLessonId,
    lastCompletedOrder,
    isLoading: progressLoading,
    isLessonCompleted,
    refresh,
  } = useHybridProgress({ courseId: id || '', userId: user?.id });

  // قفل الدروس بالتسلسل — لكن لا يُقفل درس أكمله المستخدم أو يقع قبل أبعد درس وصل إليه.
  // (عند إضافة دروس جديدة داخل الدورة لا تُقفل الدروس التي أكملها المستخدم سابقاً)
  const furthestCompletedIndex = useMemo(
    () => lessons.reduce((max, l, i) => (completedLessonIds.includes(l.id) ? i : max), -1),
    [lessons, completedLessonIds]
  );
  const isLessonLocked = (index: number) =>
    index > 0 &&
    index > furthestCompletedIndex &&
    !completedLessonIds.includes(lessons[index].id) &&
    !completedLessonIds.includes(lessons[index - 1].id);

  // عنوان القسم قبل أول درس فيه
  const sectionHeaderFor = (index: number) => {
    const section = lessons[index]?.section;
    if (!section || section === lessons[index - 1]?.section) return null;
    return (
      <View style={styles.lessonSectionHeader}>
        <View style={styles.lessonSectionLine} />
        <Text style={styles.lessonSectionText}>{section}</Text>
        <View style={styles.lessonSectionLine} />
      </View>
    );
  };

  // التحقق من فتح الكورس من Supabase
  const { isUnlocked: isCourseUnlocked, isLoading: unlockLoading } =
    useCourseUnlock(id || '', user?.id, course?.pointsCost || 0);

  // نظام الكوينات (مجاني — تُكتسب من التعلم)
  const { isCourseUnlocked: isCourseAlreadyUnlocked, rewardCourseCompletion } =
    useCoins();

  // نظام الشهادات - الآن على مستوى المجال بأكمله
  const certificate = useCertificate({
    fieldId: course?.fieldId || '',
    fieldName: course?.fieldName || course?.fieldId || '',
    fieldNameAr: course?.fieldNameAr || course?.title || '',
    userId: user?.id,
    isProgressLoading: progressLoading,
  });

  // هل الدورة تحتاج فتح بالكوينات وغير مفتوحة؟
  const isCourseLocked =
    course &&
    course.pointsCost > 0 &&
    course.isLocked &&
    !isCourseUnlocked &&
    !isCourseAlreadyUnlocked(course?.id || '');

  // مكافأة إكمال الدورة بالكوينات (السيرفر يتحقق من الإكمال ويمنع التكرار)
  useEffect(() => {
    if (!course || !user?.id || isCourseLocked || progressPercent < 100) return;
    rewardCourseCompletion(course.id).then((res) => {
      if (res.success && !res.duplicate && res.reward) {
        showToast.success(`🎉 أكملت الدورة! +${res.reward} كوين`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, user?.id, isCourseLocked, progressPercent]);

  const isLoading = progressLoading || unlockLoading;

  // تحديث عند العودة للصفحة - جلب التقدم من السحاب
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // حساب الدروس المفتوحة بناءً على التقدم من Supabase
  useEffect(() => {
    if (!course || !lessons.length) return;

    // أول درس دائماً مفتوح، والدروس التالية تفتح حسب إكمال السابق
    const unlocked: string[] = [];
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

    for (let i = 0; i < sortedLessons.length; i++) {
      const lesson = sortedLessons[i];
      if (i === 0) {
        // أول درس مفتوح دائماً
        unlocked.push(lesson.id);
      } else {
        // الدرس السابق يجب أن يكون مكتملاً
        const prevLesson = sortedLessons[i - 1];
        if (completedLessonIds.includes(prevLesson.id)) {
          unlocked.push(lesson.id);
        }
      }
    }
    setUnlockedLessons(unlocked);
  }, [course, lessons.length, completedLessonIds]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>جاري تحميل الكورس...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorText}>الدورة غير موجودة</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const difficultyLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };

  const difficultyColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  // ===== الدورة مقفلة: عرض المحتوى + معاينة مجانية + الفتح بالكوينات =====
  if (isCourseLocked) {
    return <LockedCourseScreen course={course} onBack={() => router.back()} />;
  }

  // progressPercent يأتي من useHybridProgress مباشرة

  // Web layout rendering
  if (isLargeScreen && isWeb) {
    return (
      <View style={webStyles.container}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={styles.gradient}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInUp.springify()}
            style={webStyles.headerWeb}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
            <View style={{ width: 40 }} />
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={webStyles.scrollContentWeb}
          >
            <View style={webStyles.webContainer}>
              {/* Left Column - Main Content */}
              <View style={webStyles.webLeftColumn}>
                {/* Course Hero */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <LinearGradient
                    colors={[course.color + '40', course.color + '20']}
                    style={webStyles.heroCardWeb}
                  >
                    <View style={webStyles.heroIconContainerWeb}>
                      <Ionicons
                        name={(course.icon || 'book') as any}
                        size={56}
                        color={course.color}
                      />
                    </View>
                    <Text style={webStyles.heroTitleWeb}>{course.title}</Text>
                    <Text style={webStyles.heroDescriptionWeb}>
                      {course.description}
                    </Text>

                    {/* Stats Row */}
                    <View style={webStyles.statsRowWeb}>
                      <View style={styles.statBox}>
                        <Ionicons name="book-outline" size={24} color="#fff" />
                        <Text style={webStyles.statValueWeb}>
                          {completedCount}/{lessons.length}
                        </Text>
                        <Text style={webStyles.statLabelWeb}>دروس مكتملة</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Ionicons name="star" size={24} color="#fbbf24" />
                        <Text style={webStyles.statValueWeb}>
                          {course.totalXP}
                        </Text>
                        <Text style={webStyles.statLabelWeb}>XP</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Ionicons
                          name="speedometer"
                          size={24}
                          color={difficultyColors[course.difficulty]}
                        />
                        <Text
                          style={[
                            webStyles.statValueWeb,
                            { color: difficultyColors[course.difficulty] },
                          ]}
                        >
                          {difficultyLabels[course.difficulty]}
                        </Text>
                        <Text style={webStyles.statLabelWeb}>المستوى</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>

                {/* Lessons Section */}
                <View style={webStyles.lessonsSectionWeb}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="book" size={24} color="#a855f7" />
                    <Text style={webStyles.sectionTitleWeb}>الدروس</Text>
                  </View>

                  {lessons.length > 0 ? (
                    lessons.map((lesson, index) => {
                      const isCompleted = completedLessonIds.includes(
                        lesson.id
                      );
                      const isLocked = isLessonLocked(index);

                      return (
                        <React.Fragment key={lesson.id}>
                          {sectionHeaderFor(index)}
                          <LessonCard
                            lesson={lesson}
                            index={index}
                            isCompleted={isCompleted}
                            isLocked={isLocked}
                            onPress={() =>
                              router.push(`/lesson/${lesson.id}` as any)
                            }
                          />
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <View style={styles.emptyLessons}>
                      <Ionicons
                        name="document-outline"
                        size={48}
                        color="#6b7280"
                      />
                      <Text style={styles.emptyText}>
                        لا توجد دروس متاحة حالياً
                      </Text>
                      <Text style={styles.emptySubtext}>
                        سيتم إضافة الدروس قريباً
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right Column - Sidebar */}
              <View style={webStyles.webRightColumn}>
                {/* Progress Card */}
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                  <View style={webStyles.progressCardWeb}>
                    <Text style={webStyles.progressTitleWeb}>
                      التقدم في الدورة
                    </Text>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>الدروس المكتملة</Text>
                      <Text style={styles.progressValue}>
                        {completedCount} / {lessons.length}
                      </Text>
                    </View>
                    <View style={webStyles.progressBarWeb}>
                      <View
                        style={[
                          webStyles.progressFillWeb,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: course.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.progressValue,
                        { marginTop: 12, textAlign: 'center' },
                      ]}
                    >
                      {Math.round(progressPercent)}% مكتمل
                    </Text>
                  </View>
                </Animated.View>

                {/* Certificate Progress Card */}
                {course && !isCourseLocked && (
                  <Animated.View entering={FadeInDown.delay(175).springify()}>
                    <CertificateProgressCard
                      fieldId={course.fieldId}
                      fieldName={course.fieldName || course.fieldId}
                      fieldNameAr={course.fieldNameAr || course.title}
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
                  </Animated.View>
                )}

                {/* Course Stats Card */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <View style={webStyles.sidebarCard}>
                    <Text style={webStyles.sidebarTitle}>معلومات الدورة</Text>

                    <View style={webStyles.sidebarStatRow}>
                      <View
                        style={[
                          webStyles.sidebarStatIcon,
                          { backgroundColor: '#3b82f620' },
                        ]}
                      >
                        <Ionicons name="book" size={22} color="#3b82f6" />
                      </View>
                      <View>
                        <Text style={webStyles.sidebarStatLabel}>
                          عدد الدروس
                        </Text>
                        <Text style={webStyles.sidebarStatValue}>
                          {lessons.length} درس
                        </Text>
                      </View>
                    </View>

                    <View style={webStyles.sidebarStatRow}>
                      <View
                        style={[
                          webStyles.sidebarStatIcon,
                          { backgroundColor: '#fbbf2420' },
                        ]}
                      >
                        <Ionicons name="star" size={22} color="#fbbf24" />
                      </View>
                      <View>
                        <Text style={webStyles.sidebarStatLabel}>
                          إجمالي XP
                        </Text>
                        <Text style={webStyles.sidebarStatValue}>
                          {course.totalXP} XP
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        webStyles.sidebarStatRow,
                        { borderBottomWidth: 0 },
                      ]}
                    >
                      <View
                        style={[
                          webStyles.sidebarStatIcon,
                          {
                            backgroundColor:
                              difficultyColors[course.difficulty] + '20',
                          },
                        ]}
                      >
                        <Ionicons
                          name="speedometer"
                          size={22}
                          color={difficultyColors[course.difficulty]}
                        />
                      </View>
                      <View>
                        <Text style={webStyles.sidebarStatLabel}>
                          مستوى الصعوبة
                        </Text>
                        <Text
                          style={[
                            webStyles.sidebarStatValue,
                            { color: difficultyColors[course.difficulty] },
                          ]}
                        >
                          {difficultyLabels[course.difficulty]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                {/* Start Button */}
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  <TouchableOpacity
                    style={[
                      webStyles.startButtonWeb,
                      { backgroundColor: course.color },
                    ]}
                    onPress={() => {
                      if (lessons.length > 0) {
                        const sortedLessons = [...lessons].sort(
                          (a, b) => a.order - b.order
                        );
                        let nextLessonId: string | undefined;

                        if (lastCompletedLessonId) {
                          const lastIndex = sortedLessons.findIndex(
                            (l) => l.id === lastCompletedLessonId
                          );
                          if (
                            lastIndex >= 0 &&
                            lastIndex < sortedLessons.length - 1
                          ) {
                            nextLessonId = sortedLessons[lastIndex + 1].id;
                          }
                        }

                        if (!nextLessonId) {
                          const nextLesson = sortedLessons.find(
                            (l) => !completedLessonIds.includes(l.id)
                          );
                          nextLessonId = nextLesson?.id || sortedLessons[0].id;
                        }

                        router.push(`/lesson/${nextLessonId}` as any);
                      }
                    }}
                  >
                    <Ionicons
                      name={completedCount > 0 ? 'play' : 'rocket'}
                      size={26}
                      color="#fff"
                    />
                    <Text style={webStyles.startButtonTextWeb}>
                      {completedCount > 0 ? 'متابعة التعلم' : 'ابدأ الآن'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Tips Card */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <View style={webStyles.tipsCard}>
                    <Text style={webStyles.tipsTitle}>نصائح للتعلم</Text>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        أكمل الدروس بالترتيب للحصول على أفضل تجربة
                      </Text>
                    </View>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        طبق الأمثلة في محرر الأكواد لتعزيز الفهم
                      </Text>
                    </View>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        أجب على الاختبارات لكسب XP إضافي
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Mobile layout rendering
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.springify()} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: isLargeScreen ? 1200 : '100%',
              width: '100%',
              alignSelf: 'center',
              paddingTop: contentPaddingTop + 20,
              paddingBottom: contentPaddingBottom + 20,
            },
          ]}
        >
          {/* Course Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={[course.color + '40', course.color + '20']}
              style={styles.heroCard}
            >
              <View style={styles.heroIconContainer}>
                <Ionicons
                  name={(course.icon || 'book') as any}
                  size={48}
                  color={course.color}
                />
              </View>
              <Text style={styles.heroTitle}>{course.title}</Text>
              <Text style={styles.heroDescription}>{course.description}</Text>

              {/* Stats Row - عداد الدروس من Supabase */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Ionicons name="book-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {completedCount}/{lessons.length}
                  </Text>
                  <Text style={styles.statLabel}>دروس مكتملة</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="star" size={20} color="#fbbf24" />
                  <Text style={styles.statValue}>{course.totalXP}</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons
                    name="speedometer"
                    size={20}
                    color={difficultyColors[course.difficulty]}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: difficultyColors[course.difficulty] },
                    ]}
                  >
                    {difficultyLabels[course.difficulty]}
                  </Text>
                  <Text style={styles.statLabel}>المستوى</Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>التقدم</Text>
                  <Text style={styles.progressValue}>
                    {Math.round(progressPercent)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: course.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Lessons Section */}
          <View style={styles.lessonsSection}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="book" size={20} color="#a855f7" />
              <Text style={styles.sectionTitle}>الدروس</Text>
            </View>

            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isLocked = isLessonLocked(index);

                return (
                  <React.Fragment key={lesson.id}>
                    {sectionHeaderFor(index)}
                    <LessonCard
                      lesson={lesson}
                      index={index}
                      isCompleted={isCompleted}
                      isLocked={isLocked}
                      onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                    />
                  </React.Fragment>
                );
              })
            ) : (
              <View style={styles.emptyLessons}>
                <Ionicons name="document-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyText}>لا توجد دروس متاحة حالياً</Text>
                <Text style={styles.emptySubtext}>
                  سيتم إضافة الدروس قريباً
                </Text>
              </View>
            )}
          </View>

          {/* Certificate Progress Card */}
          {course && !isCourseLocked && (
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <CertificateProgressCard
                fieldId={course.fieldId}
                fieldName={course.fieldName || course.fieldId}
                fieldNameAr={course.fieldNameAr || course.title}
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
            </Animated.View>
          )}

          {/* Start/Continue Button - محدث للاستمرارية */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: course.color }]}
              onPress={() => {
                if (lessons.length > 0) {
                  // البحث عن الدرس التالي للاستمرار
                  const sortedLessons = [...lessons].sort(
                    (a, b) => a.order - b.order
                  );
                  let nextLessonId: string | undefined;

                  // إذا كان هناك آخر درس مكتمل، انتقل للدرس التالي
                  if (lastCompletedLessonId) {
                    const lastIndex = sortedLessons.findIndex(
                      (l) => l.id === lastCompletedLessonId
                    );
                    if (
                      lastIndex >= 0 &&
                      lastIndex < sortedLessons.length - 1
                    ) {
                      nextLessonId = sortedLessons[lastIndex + 1].id;
                    }
                  }

                  // إذا لم نجد، ابحث عن أول درس غير مكتمل
                  if (!nextLessonId) {
                    const nextLesson = sortedLessons.find(
                      (l) => !completedLessonIds.includes(l.id)
                    );
                    nextLessonId = nextLesson?.id || sortedLessons[0].id;
                  }

                  router.push(`/lesson/${nextLessonId}` as any);
                }
              }}
            >
              <Ionicons
                name={completedCount > 0 ? 'play' : 'rocket'}
                size={24}
                color="#fff"
              />
              <Text style={styles.startButtonText}>
                {completedCount > 0 ? 'متابعة التعلم' : 'ابدأ الآن'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  lessonSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },
  lessonSectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(168, 85, 247, 0.35)' },
  lessonSectionText: { color: '#c4b5fd', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  heroIconContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ffffff20',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  lessonsSection: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonCardContainer: {
    marginBottom: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: '#10b98120',
  },
  lessonNumberLocked: {
    backgroundColor: '#6b728020',
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  textLocked: {
    opacity: 0.5,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyLessons: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// Web-specific styles with explicit type assertions
const webStyles = {
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  } as ViewStyle,
  scrollContentWeb: {
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 40,
  } as ViewStyle,
  headerWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 40,
    paddingBottom: 16,
  } as ViewStyle,
  webContainer: {
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    gap: 32,
  } as ViewStyle,
  webLeftColumn: {
    flex: 2,
    minWidth: 0,
  } as ViewStyle,
  webRightColumn: {
    flex: 1,
    maxWidth: 380,
    position: 'sticky',
    top: 20,
    alignSelf: 'flex-start',
  } as ViewStyle,
  heroCardWeb: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
  } as ViewStyle,
  heroIconContainerWeb: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  heroTitleWeb: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  heroDescriptionWeb: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  } as TextStyle,
  statsRowWeb: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
  } as ViewStyle,
  statValueWeb: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  } as TextStyle,
  statLabelWeb: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  } as TextStyle,
  lessonsSectionWeb: {
    marginBottom: 32,
  } as ViewStyle,
  sectionTitleWeb: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  } as TextStyle,
  lessonCardWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,
  lessonCardHoverWeb: {
    borderColor: '#3b82f640',
    backgroundColor: '#1f1f4a',
  } as ViewStyle,
  lessonTitleWeb: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  } as TextStyle,
  lessonDescriptionWeb: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 10,
  } as TextStyle,
  startButtonWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
  } as ViewStyle,
  startButtonTextWeb: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  } as TextStyle,
  // Right sidebar styles
  sidebarCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  } as ViewStyle,
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  sidebarStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  } as ViewStyle,
  sidebarStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  } as ViewStyle,
  sidebarStatLabel: {
    fontSize: 14,
    color: '#9ca3af',
  } as TextStyle,
  sidebarStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  } as TextStyle,
  progressCardWeb: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  } as ViewStyle,
  progressTitleWeb: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  progressBarWeb: {
    height: 12,
    backgroundColor: '#ffffff20',
    borderRadius: 6,
    marginTop: 12,
  } as ViewStyle,
  progressFillWeb: {
    height: '100%',
    borderRadius: 6,
  } as ViewStyle,
  tipsCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
  } as ViewStyle,
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  } as ViewStyle,
  tipText: {
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  } as TextStyle,
};
