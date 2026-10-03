import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { useAuth } from '../_layout';
// ===== نظام Hybrid: المحتوى محلي، التقدم من Supabase =====
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ALL_LESSONS,
  ALL_COURSES,
  getLessonsByCourse,
  Lesson,
} from '@/constants/courseData';
import { useCoins } from '@/contexts/CoinsContext';
import { coinService } from '@/services/coinService';
import LockedCourseScreen, {
  getPreviewLessonId,
} from '@/components/coins/LockedCourseScreen';
import { useHybridProgress } from '@/hooks/useHybridProgress';
import { ExplainWithAI } from '@/components/ai';
import CustomModal, {
  useCustomModal,
  ModalType,
} from '@/components/ui/CustomModal';
import CodeHighlight from '@/components/ui/CodeHighlight';
import LessonContent from '@/components/lesson/LessonContent';
import { useResponsiveLayout } from '@/hooks';

const { width } = Dimensions.get('window');

// Web-specific styles
const webStyles = {
  scrollContentWeb: {
    paddingHorizontal: 60,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  headerWeb: {
    paddingHorizontal: 60,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  headerTitleWeb: {
    fontSize: 20,
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
    gap: 20,
    position: 'sticky',
    top: 20,
    alignSelf: 'flex-start',
  } as ViewStyle,
  contentCardWeb: {
    padding: 32,
    borderRadius: 20,
  } as ViewStyle,
  contentH1Web: {
    fontSize: 32,
    marginBottom: 20,
  } as TextStyle,
  contentH2Web: {
    fontSize: 24,
    marginBottom: 16,
    marginTop: 24,
  } as TextStyle,
  contentH3Web: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 16,
  } as TextStyle,
  contentParagraphWeb: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 12,
  } as TextStyle,
  codeHeaderWeb: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  } as ViewStyle,
  codeBlockWeb: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  } as ViewStyle,
  continueButtonWeb: {
    padding: 20,
    borderRadius: 20,
  } as ViewStyle,
  continueButtonTextWeb: {
    fontSize: 18,
  } as TextStyle,
  quizCardWeb: {
    padding: 32,
    borderRadius: 24,
  } as ViewStyle,
  quizTitleWeb: {
    fontSize: 24,
  } as TextStyle,
  quizQuestionWeb: {
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 32,
  } as TextStyle,
  optionWeb: {
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,
  optionTextWeb: {
    fontSize: 16,
  } as TextStyle,
  explanationCardWeb: {
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,
  explanationTextWeb: {
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,
  submitButtonWeb: {
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,
  submitButtonTextWeb: {
    fontSize: 18,
  } as TextStyle,
  lessonInfoCardWeb: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
  } as ViewStyle,
  lessonInfoTitleWeb: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  lessonInfoItemWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  } as ViewStyle,
  lessonInfoTextWeb: {
    fontSize: 15,
    color: '#9ca3af',
  } as TextStyle,
  lessonInfoValueWeb: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  } as TextStyle,
};

// دالة خلط المصفوفة (Fisher-Yates)
const shuffleArray = <T,>(
  array: T[]
): { shuffled: T[]; indexMap: number[] } => {
  const shuffled = [...array];
  const indexMap = array.map((_, i) => i);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    [indexMap[i], indexMap[j]] = [indexMap[j], indexMap[i]];
  }

  return { shuffled, indexMap };
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  useEffect(() => {
    if (user?.id && id) coinService.track('lesson_opened', { lesson_id: String(id) });
  }, [user?.id, id]);
  const { isLargeScreen, isWeb } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const { showModal, hideModal, ModalComponent } = useCustomModal();
  const { isCourseUnlocked: checkCourseUnlocked } = useCoins();

  // ===== نظام Hybrid: المحتوى من البيانات المحلية =====
  const lesson = ALL_LESSONS.find((l) => l.id === id) || null;
  const lessonLoading = false; // البيانات المحلية لا تحتاج تحميل

  // ===== التقدم من Supabase عبر Hybrid Hook =====
  const {
    isLessonCompleted,
    markLessonComplete,
    refresh: refreshProgress,
    isLoading: progressLoading,
  } = useHybridProgress({ courseId: lesson?.courseId || '', userId: user?.id });

  // حالة الإكمال من Supabase
  const isCompleted = lesson ? isLessonCompleted(lesson.id) : false;

  // خلط إجابات الاختبار مرة واحدة عند تحميل الدرس
  const shuffledQuiz = useMemo(() => {
    if (!lesson?.quiz) return null;

    const quiz = lesson.quiz;
    const { shuffled, indexMap } = shuffleArray(quiz.options);
    // إيجاد الموقع الجديد للإجابة الصحيحة
    const newCorrectIndex = indexMap.indexOf(quiz.correctAnswer);

    return {
      options: shuffled,
      correctAnswer: newCorrectIndex,
      // الخيار المعروض i هو الخيار الأصلي indexMap[i] — السيرفر يتحقق بالترتيب الأصلي
      indexMap,
      originalQuestion: quiz.question,
      explanation: quiz.explanation,
    };
  }, [lesson?.id, lesson?.quiz]);

  // Loading state
  if (lessonLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>جاري تحميل الدرس...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorText}>الدرس غير موجود</Text>
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

  // ===== حماية الوصول: الدورات المتقدمة تُفتح بالكوينات =====
  // الدرس الأول من كل دورة متاح دائماً كمعاينة مجانية.
  const parentCourse = ALL_COURSES.find((c) => c.id === lesson.courseId);
  const isPreviewLesson = parentCourse
    ? getPreviewLessonId(parentCourse.id) === lesson.id
    : false;
  const isCourseLocked = parentCourse
    ? parentCourse.pointsCost > 0 &&
      parentCourse.isLocked &&
      !checkCourseUnlocked(parentCourse.id) &&
      !isPreviewLesson
    : false;

  if (isCourseLocked && parentCourse) {
    return (
      <LockedCourseScreen
        course={parentCourse}
        onBack={() => router.back()}
        lockedLessonTitle={lesson.title}
      />
    );
  }

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      showModal({
        type: 'warning',
        title: 'تنبيه',
        message: 'الرجاء اختيار إجابة أولاً',
        buttons: [
          { text: 'حسناً', onPress: () => hideModal(), style: 'primary' },
        ],
      });
      return;
    }
    setIsAnswered(true);
  };

  // التحقق من صحة الإجابة
  const isCorrectAnswer =
    shuffledQuiz && selectedAnswer === shuffledQuiz.correctAnswer;

  const handleCompleteLesson = async () => {
    if (!lesson || isCompletingLesson) return;

    // إذا كان هناك اختبار، تحقق من الإجابة الصحيحة أولاً
    if (lesson.quiz && !isCorrectAnswer) {
      showModal({
        type: 'error',
        title: 'إجابة خاطئة!',
        message: 'الرجاء مراجعة الدرس والمحاولة مرة أخرى',
        buttons: [
          {
            text: 'حاول مرة أخرى',
            onPress: () => {
              hideModal();
              setSelectedAnswer(null);
              setIsAnswered(false);
            },
            style: 'primary',
          },
          {
            text: 'العودة للدرس',
            onPress: () => {
              hideModal();
              setShowQuiz(false);
              setSelectedAnswer(null);
              setIsAnswered(false);
            },
            style: 'secondary',
          },
        ],
      });
      return;
    }

    // عرض حالة التحميل
    setIsCompletingLesson(true);

    // الإكمال يُوثَّق على السيرفر (الإجابة بالترتيب الأصلي للخيارات)، و XP يُحسب هناك
    const originalAnswer =
      shuffledQuiz && selectedAnswer !== null && selectedAnswer !== undefined
        ? shuffledQuiz.indexMap[selectedAnswer]
        : null;
    const result = await markLessonComplete(lesson.id, lesson.xpReward, undefined, originalAnswer);

    setIsCompletingLesson(false);

    // Show completion message
    if (result.success) {
      // إذا كان الدرس مكتملاً من قبل، لا نعرض XP
      if (result.alreadyCompleted) {
        showModal({
          type: 'success',
          title: 'مراجعة ممتازة!',
          message: 'لقد راجعت هذا الدرس بنجاح. أحسنت!',
          buttons: [
            {
              text: 'الدرس التالي',
              onPress: () => {
                hideModal();
                goToNextLesson();
              },
              style: 'primary',
            },
            {
              text: 'رجوع',
              onPress: () => {
                hideModal();
                router.back();
              },
              style: 'secondary',
            },
          ],
        });
      } else {
        // درس جديد - نعرض XP
        showModal({
          type: 'success',
          title: 'أحسنت!',
          message: 'لقد أكملت هذا الدرس بنجاح!',
          xpReward: result.xpAwarded ?? lesson.xpReward,
          buttons: [
            {
              text: 'الدرس التالي',
              onPress: () => {
                hideModal();
                goToNextLesson();
              },
              style: 'primary',
            },
            {
              text: 'رجوع',
              onPress: () => {
                hideModal();
                router.back();
              },
              style: 'secondary',
            },
          ],
        });
      }
    } else if (!result.queued) {
      // رفض من السيرفر (درس سابق غير مكتمل، دورة لم تُفتح بعد، إجابة غير صحيحة...) — بلا أي عقوبة
      showModal({
        type: 'warning',
        title: result.code === 'previous_required' ? 'خطوة واحدة قبلها' : 'لم يُحفظ التقدم',
        message: result.error || 'حاول مرة أخرى.',
        buttons: [
          {
            text: 'حسناً',
            onPress: () => {
              hideModal();
              if (result.code === 'wrong_answer') {
                setSelectedAnswer(null);
                setIsAnswered(false);
              }
            },
            style: 'primary',
          },
        ],
      });
    } else {
      showModal({
        type: 'warning',
        title: 'سنحفظ تقدمك لاحقاً',
        message: 'لا يوجد اتصال الآن. سيُرسل إكمال الدرس تلقائياً عند عودة الإنترنت.',
        buttons: [
          {
            text: 'الدرس التالي',
            onPress: () => {
              hideModal();
              goToNextLesson();
            },
            style: 'primary',
          },
          {
            text: 'رجوع',
            onPress: () => {
              hideModal();
              router.back();
            },
            style: 'secondary',
          },
        ],
      });
    }
  };

  const goToNextLesson = () => {
    if (!lesson) return;

    // Get all lessons for this course and find next
    const courseLessons = getLessonsByCourse(lesson.courseId).sort(
      (a, b) => a.order - b.order
    );
    const currentIndex = courseLessons.findIndex((l) => l.id === lesson.id);

    if (currentIndex < courseLessons.length - 1) {
      const nextLesson = courseLessons[currentIndex + 1];
      router.replace(`/lesson/${nextLesson.id}` as any);
    } else {
      // Last lesson in course - find next course in same field
      const currentCourse = ALL_COURSES.find((c) => c.id === lesson.courseId);
      let nextCourse: typeof currentCourse | undefined;

      if (currentCourse) {
        const fieldCourses = ALL_COURSES.filter(
          (c) => c.fieldId === currentCourse.fieldId
        ).sort((a, b) => a.order - b.order);
        const courseIndex = fieldCourses.findIndex(
          (c) => c.id === currentCourse.id
        );
        if (courseIndex >= 0 && courseIndex < fieldCourses.length - 1) {
          nextCourse = fieldCourses[courseIndex + 1];
        }
      }

      const buttons: any[] = [];

      if (nextCourse) {
        buttons.push({
          text: `الدورة التالية: ${nextCourse.title}`,
          onPress: () => {
            hideModal();
            router.replace(`/course/${nextCourse!.id}` as any);
          },
          style: 'primary',
        });
        buttons.push({
          text: 'العودة للدورة الحالية',
          onPress: () => {
            hideModal();
            router.back();
          },
          style: 'secondary',
        });
      } else {
        // No more courses in this field
        buttons.push({
          text: 'العودة',
          onPress: () => {
            hideModal();
            router.back();
          },
          style: 'primary',
        });
      }

      showModal({
        type: 'achievement',
        title: 'مبروك! 🎉',
        message: nextCourse
          ? `لقد أكملت جميع دروس هذه الدورة بنجاح!\nالدورة التالية: ${nextCourse.title}`
          : 'لقد أكملت جميع دروس هذه الدورة بنجاح!\nأحسنت! لقد أنهيت جميع دورات هذا المجال!',
        buttons,
      });
    }
  };

  // التحقق من صحة الإجابة باستخدام الخيارات المخلوطة
  const isCorrect =
    shuffledQuiz && selectedAnswer === shuffledQuiz.correctAnswer;

  // محتوى الدرس (Markdown مبسّط مع كتل الكود والجداول) — انظر LessonContent
  const renderedContent = useMemo(
    () => <LessonContent content={lesson.content} defaultLanguage={lesson.language} />,
    [lesson.content, lesson.language]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={[
            styles.header,
            { paddingTop: Math.max(50, insets.top + 10) },
            isLargeScreen && isWeb && webStyles.headerWeb,
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Text
                style={[
                  styles.headerTitle,
                  isLargeScreen && isWeb && webStyles.headerTitleWeb,
                ]}
                numberOfLines={1}
              >
                {lesson.title}
              </Text>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                </View>
              )}
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isLargeScreen && isWeb && webStyles.scrollContentWeb,
          ]}
        >
          {isLargeScreen && isWeb ? (
            // Web Layout - Two columns
            <View style={webStyles.webContainer}>
              {/* Left Column - Main Content */}
              <View style={webStyles.webLeftColumn}>
                {!showQuiz ? (
                  <>
                    {/* Lesson Content */}
                    <Animated.View
                      entering={FadeInDown.delay(100).springify()}
                      style={[styles.contentCard, webStyles.contentCardWeb]}
                    >
                      {renderedContent}
                    </Animated.View>

                    {/* Code Example */}
                    {lesson.codeExample && (
                      <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                      >
                        <TouchableOpacity
                          style={[styles.codeHeader, webStyles.codeHeaderWeb]}
                          onPress={() => setShowCode(!showCode)}
                        >
                          <View style={styles.codeHeaderLeft}>
                            <Ionicons
                              name="code-slash"
                              size={20}
                              color="#3b82f6"
                            />
                            <Text style={styles.codeHeaderTitle}>
                              مثال برمجي
                            </Text>
                            {lesson.language && (
                              <View style={styles.languageBadge}>
                                <Text style={styles.languageText}>
                                  {lesson.language}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Ionicons
                            name={showCode ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#6b7280"
                          />
                        </TouchableOpacity>

                        {showCode && (
                          <Animated.View
                            entering={FadeIn}
                            style={[styles.codeBlock, webStyles.codeBlockWeb]}
                          >
                            <CodeHighlight
                              code={lesson.codeExample}
                              language={lesson.language || 'javascript'}
                            />
                          </Animated.View>
                        )}
                      </Animated.View>
                    )}

                    {/* Continue/Quiz Button */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                      <TouchableOpacity
                        style={[
                          styles.continueButton,
                          webStyles.continueButtonWeb,
                          isCompletingLesson &&
                            !lesson.quiz && { opacity: 0.85 },
                        ]}
                        onPress={() =>
                          lesson.quiz
                            ? setShowQuiz(true)
                            : handleCompleteLesson()
                        }
                        disabled={isCompletingLesson && !lesson.quiz}
                      >
                        {isCompletingLesson && !lesson.quiz ? (
                          <>
                            <ActivityIndicator
                              size="small"
                              color="#fff"
                              style={{ marginLeft: 8 }}
                            />
                            <Text
                              style={[
                                styles.continueButtonText,
                                webStyles.continueButtonTextWeb,
                              ]}
                            >
                              جاري الحفظ...
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text
                              style={[
                                styles.continueButtonText,
                                webStyles.continueButtonTextWeb,
                              ]}
                            >
                              {lesson.quiz ? 'انتقل للاختبار' : 'أكمل الدرس'}
                            </Text>
                            <Ionicons
                              name="arrow-back"
                              size={24}
                              color="#fff"
                            />
                          </>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                ) : (
                  /* Quiz Section */
                  <Animated.View entering={FadeInDown.springify()}>
                    <View style={[styles.quizCard, webStyles.quizCardWeb]}>
                      <View style={styles.quizHeader}>
                        <Ionicons
                          name="help-circle"
                          size={40}
                          color="#8b5cf6"
                        />
                        <Text
                          style={[styles.quizTitle, webStyles.quizTitleWeb]}
                        >
                          اختبر فهمك
                        </Text>
                      </View>

                      <Text
                        style={[styles.quizQuestion, webStyles.quizQuestionWeb]}
                      >
                        {shuffledQuiz?.originalQuestion}
                      </Text>

                      <View style={styles.optionsContainer}>
                        {shuffledQuiz?.options.map((option, index) => {
                          const isSelected = selectedAnswer === index;
                          const isCorrectOption =
                            index === shuffledQuiz?.correctAnswer;

                          let optionStyle = {
                            ...styles.option,
                            ...webStyles.optionWeb,
                          };
                          let optionTextStyle = {
                            ...styles.optionText,
                            ...webStyles.optionTextWeb,
                          };

                          if (isAnswered) {
                            if (isCorrectOption) {
                              optionStyle = {
                                ...optionStyle,
                                ...styles.optionCorrect,
                              };
                              optionTextStyle = {
                                ...optionTextStyle,
                                color: '#10b981',
                              };
                            } else if (isSelected && !isCorrectOption) {
                              optionStyle = {
                                ...optionStyle,
                                ...styles.optionWrong,
                              };
                              optionTextStyle = {
                                ...optionTextStyle,
                                color: '#ef4444',
                              };
                            }
                          } else if (isSelected) {
                            optionStyle = {
                              ...optionStyle,
                              ...styles.optionSelected,
                            };
                          }

                          return (
                            <TouchableOpacity
                              key={index}
                              style={optionStyle}
                              onPress={() => handleAnswerSelect(index)}
                              disabled={isAnswered}
                            >
                              <View style={styles.optionLetter}>
                                <Text style={styles.optionLetterText}>
                                  {String.fromCharCode(65 + index)}
                                </Text>
                              </View>
                              <Text style={optionTextStyle}>{option}</Text>
                              {isAnswered && isCorrectOption && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color="#10b981"
                                />
                              )}
                              {isAnswered && isSelected && !isCorrectOption && (
                                <Ionicons
                                  name="close-circle"
                                  size={24}
                                  color="#ef4444"
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Explanation */}
                      {isAnswered && shuffledQuiz?.explanation && (
                        <Animated.View
                          entering={FadeIn}
                          style={[
                            styles.explanationCard,
                            webStyles.explanationCardWeb,
                          ]}
                        >
                          <Ionicons
                            name={
                              isCorrect
                                ? 'checkmark-circle'
                                : 'information-circle'
                            }
                            size={28}
                            color={isCorrect ? '#10b981' : '#3b82f6'}
                          />
                          <Text
                            style={[
                              styles.explanationText,
                              webStyles.explanationTextWeb,
                            ]}
                          >
                            {shuffledQuiz.explanation}
                          </Text>
                        </Animated.View>
                      )}

                      {/* Action Button */}
                      {!isAnswered ? (
                        <TouchableOpacity
                          style={[
                            styles.submitButton,
                            webStyles.submitButtonWeb,
                            selectedAnswer === null &&
                              styles.submitButtonDisabled,
                          ]}
                          onPress={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                        >
                          <Text
                            style={[
                              styles.submitButtonText,
                              webStyles.submitButtonTextWeb,
                            ]}
                          >
                            تحقق من الإجابة
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.submitButton,
                            webStyles.submitButtonWeb,
                            {
                              backgroundColor: isCompletingLesson
                                ? '#059669'
                                : '#10b981',
                            },
                            isCompletingLesson && { opacity: 0.85 },
                          ]}
                          onPress={handleCompleteLesson}
                          disabled={isCompletingLesson}
                        >
                          {isCompletingLesson ? (
                            <>
                              <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={{ marginLeft: 8 }}
                              />
                              <Text
                                style={[
                                  styles.submitButtonText,
                                  webStyles.submitButtonTextWeb,
                                ]}
                              >
                                جاري الحفظ...
                              </Text>
                            </>
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color="#fff"
                              />
                              <Text
                                style={[
                                  styles.submitButtonText,
                                  webStyles.submitButtonTextWeb,
                                ]}
                              >
                                أكمل الدرس
                              </Text>
                              <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#fff"
                              />
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      {/* Back to lesson */}
                      <TouchableOpacity
                        style={styles.backToLesson}
                        onPress={() => {
                          setShowQuiz(false);
                          setSelectedAnswer(null);
                          setIsAnswered(false);
                        }}
                      >
                        <Ionicons name="arrow-back" size={16} color="#6b7280" />
                        <Text style={styles.backToLessonText}>
                          العودة للدرس
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}
              </View>

              {/* Right Column - Lesson Info */}
              <View style={webStyles.webRightColumn}>
                <Animated.View
                  entering={FadeInDown.delay(150).springify()}
                  style={webStyles.lessonInfoCardWeb}
                >
                  <Text style={webStyles.lessonInfoTitleWeb}>
                    معلومات الدرس
                  </Text>
                  <View style={webStyles.lessonInfoItemWeb}>
                    <Ionicons name="star" size={20} color="#fbbf24" />
                    <Text style={webStyles.lessonInfoTextWeb}>المكافأة:</Text>
                    <Text style={webStyles.lessonInfoValueWeb}>
                      {lesson.xpReward} XP
                    </Text>
                  </View>
                  {lesson.language && (
                    <View style={webStyles.lessonInfoItemWeb}>
                      <Ionicons name="code-slash" size={20} color="#3b82f6" />
                      <Text style={webStyles.lessonInfoTextWeb}>اللغة:</Text>
                      <Text style={webStyles.lessonInfoValueWeb}>
                        {lesson.language}
                      </Text>
                    </View>
                  )}
                  <View style={webStyles.lessonInfoItemWeb}>
                    <Ionicons
                      name={
                        isCompleted ? 'checkmark-circle' : 'ellipse-outline'
                      }
                      size={20}
                      color={isCompleted ? '#10b981' : '#6b7280'}
                    />
                    <Text style={webStyles.lessonInfoTextWeb}>الحالة:</Text>
                    <Text
                      style={[
                        webStyles.lessonInfoValueWeb,
                        { color: isCompleted ? '#10b981' : '#f59e0b' },
                      ]}
                    >
                      {isCompleted ? 'مكتمل' : 'غير مكتمل'}
                    </Text>
                  </View>
                  {lesson.quiz && (
                    <View
                      style={[
                        webStyles.lessonInfoItemWeb,
                        { borderBottomWidth: 0 },
                      ]}
                    >
                      <Ionicons name="help-circle" size={20} color="#8b5cf6" />
                      <Text style={webStyles.lessonInfoTextWeb}>اختبار:</Text>
                      <Text style={webStyles.lessonInfoValueWeb}>متضمن</Text>
                    </View>
                  )}
                </Animated.View>

                {/* زر شرح بالذكاء - Web */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <ExplainWithAI
                    challengeId={lesson.id}
                    challengeTitle={lesson.title}
                    challengeDescription={lesson.content}
                    starterCode={lesson.codeExample}
                    language={lesson.language || 'javascript'}
                    contentType="lesson"
                  />
                </Animated.View>
              </View>
            </View>
          ) : (
            // Mobile Layout
            <>
              {!showQuiz ? (
                <>
                  {/* Lesson Content */}
                  <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={styles.contentCard}
                  >
                    {renderedContent}
                  </Animated.View>

                  {/* Code Example */}
                  {lesson.codeExample && (
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                      <TouchableOpacity
                        style={styles.codeHeader}
                        onPress={() => setShowCode(!showCode)}
                      >
                        <View style={styles.codeHeaderLeft}>
                          <Ionicons
                            name="code-slash"
                            size={20}
                            color="#3b82f6"
                          />
                          <Text style={styles.codeHeaderTitle}>مثال برمجي</Text>
                          {lesson.language && (
                            <View style={styles.languageBadge}>
                              <Text style={styles.languageText}>
                                {lesson.language}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Ionicons
                          name={showCode ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>

                      {showCode && (
                        <Animated.View
                          entering={FadeIn}
                          style={styles.codeBlock}
                        >
                          <CodeHighlight
                            code={lesson.codeExample}
                            language={lesson.language || 'javascript'}
                          />
                        </Animated.View>
                      )}
                    </Animated.View>
                  )}
                  {/* زر شرح بالذكاء - Mobile */}
                  <Animated.View
                    entering={FadeInDown.delay(400).springify()}
                    style={{ marginBottom: 10 }}
                  >
                    <ExplainWithAI
                      challengeId={lesson.id}
                      challengeTitle={lesson.title}
                      challengeDescription={lesson.content}
                      starterCode={lesson.codeExample}
                      language={lesson.language || 'javascript'}
                      contentType="lesson"
                    />
                  </Animated.View>

                  {/* Continue/Quiz Button */}
                  <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <TouchableOpacity
                      style={[
                        styles.continueButton,
                        isCompletingLesson && !lesson.quiz && { opacity: 0.85 },
                      ]}
                      onPress={() =>
                        lesson.quiz ? setShowQuiz(true) : handleCompleteLesson()
                      }
                      disabled={isCompletingLesson && !lesson.quiz}
                    >
                      {isCompletingLesson && !lesson.quiz ? (
                        <>
                          <ActivityIndicator
                            size="small"
                            color="#fff"
                            style={{ marginLeft: 8 }}
                          />
                          <Text style={styles.continueButtonText}>
                            جاري الحفظ...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.continueButtonText}>
                            {lesson.quiz ? 'انتقل للاختبار' : 'أكمل الدرس'}
                          </Text>
                          <Ionicons name="arrow-back" size={20} color="#fff" />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </>
              ) : (
                /* Quiz Section */
                <Animated.View entering={FadeInDown.springify()}>
                  <View style={styles.quizCard}>
                    <View style={styles.quizHeader}>
                      <Ionicons name="help-circle" size={32} color="#8b5cf6" />
                      <Text style={styles.quizTitle}>اختبر فهمك</Text>
                    </View>

                    <Text style={styles.quizQuestion}>
                      {shuffledQuiz?.originalQuestion}
                    </Text>

                    <View style={styles.optionsContainer}>
                      {shuffledQuiz?.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption =
                          index === shuffledQuiz?.correctAnswer;

                        let optionStyle = styles.option;
                        let optionTextStyle = styles.optionText;

                        if (isAnswered) {
                          if (isCorrectOption) {
                            optionStyle = {
                              ...optionStyle,
                              ...styles.optionCorrect,
                            };
                            optionTextStyle = {
                              ...optionTextStyle,
                              color: '#10b981',
                            };
                          } else if (isSelected && !isCorrectOption) {
                            optionStyle = {
                              ...optionStyle,
                              ...styles.optionWrong,
                            };
                            optionTextStyle = {
                              ...optionTextStyle,
                              color: '#ef4444',
                            };
                          }
                        } else if (isSelected) {
                          optionStyle = {
                            ...optionStyle,
                            ...styles.optionSelected,
                          };
                        }

                        return (
                          <TouchableOpacity
                            key={index}
                            style={optionStyle}
                            onPress={() => handleAnswerSelect(index)}
                            disabled={isAnswered}
                          >
                            <View style={styles.optionLetter}>
                              <Text style={styles.optionLetterText}>
                                {String.fromCharCode(65 + index)}
                              </Text>
                            </View>
                            <Text style={optionTextStyle}>{option}</Text>
                            {isAnswered && isCorrectOption && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#10b981"
                              />
                            )}
                            {isAnswered && isSelected && !isCorrectOption && (
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="#ef4444"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Explanation */}
                    {isAnswered && shuffledQuiz?.explanation && (
                      <Animated.View
                        entering={FadeIn}
                        style={styles.explanationCard}
                      >
                        <Ionicons
                          name={
                            isCorrect
                              ? 'checkmark-circle'
                              : 'information-circle'
                          }
                          size={24}
                          color={isCorrect ? '#10b981' : '#3b82f6'}
                        />
                        <Text style={styles.explanationText}>
                          {shuffledQuiz.explanation}
                        </Text>
                      </Animated.View>
                    )}

                    {/* Action Button */}
                    {!isAnswered ? (
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          selectedAnswer === null &&
                            styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                      >
                        <Text style={styles.submitButtonText}>
                          تحقق من الإجابة
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          {
                            backgroundColor: isCompletingLesson
                              ? '#059669'
                              : '#10b981',
                          },
                          isCompletingLesson && { opacity: 0.85 },
                        ]}
                        onPress={handleCompleteLesson}
                        disabled={isCompletingLesson}
                      >
                        {isCompletingLesson ? (
                          <>
                            <ActivityIndicator
                              size="small"
                              color="#fff"
                              style={{ marginLeft: 8 }}
                            />
                            <Text style={styles.submitButtonText}>
                              جاري الحفظ...
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#fff"
                            />
                            <Text style={styles.submitButtonText}>
                              أكمل الدرس
                            </Text>
                            <Ionicons
                              name="arrow-back"
                              size={20}
                              color="#fff"
                            />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Back to lesson */}
                    <TouchableOpacity
                      style={styles.backToLesson}
                      onPress={() => {
                        setShowQuiz(false);
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                      }}
                    >
                      <Ionicons name="arrow-back" size={16} color="#6b7280" />
                      <Text style={styles.backToLessonText}>العودة للدرس</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </>
          )}

          <View style={{ height: Math.max(40, insets.bottom + 20) }} />
        </ScrollView>
      </LinearGradient>

      {/* Custom Modal */}
      <ModalComponent />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf2420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  contentCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  contentH1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  contentH2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  contentH3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
    marginTop: 12,
  },
  contentParagraph: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  listBullet: {
    color: '#3b82f6',
    fontSize: 16,
    marginLeft: 8,
    width: 16,
  },
  listNumber: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    width: 20,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a3e',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  codeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  languageBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#0d1117',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#e6edf3',
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  quizCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  quizQuestion: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252550',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f620',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444420',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#252550',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backToLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  backToLessonText: {
    fontSize: 14,
    color: '#6b7280',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    backgroundColor: '#10b98120',
    borderRadius: 10,
    padding: 2,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  lockedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  lockedSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
});
