import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

// Web-only: CodeMirror professional editor
let CodeMirrorEditor: any = null;
if (Platform.OS === 'web') {
  try {
    CodeMirrorEditor = require('@/components/editor/CodeMirrorEditor').default;
  } catch (e) {
    CodeMirrorEditor = null;
  }
}
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SmartIcon } from '@/components/ui/SmartIcon';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ALL_CHALLENGES,
  getChallengeAccessType,
  getChallengeRequiredCourseId,
  getCourseTitleById,
  isCourseAccessible,
} from '@/constants/courseData';
import CustomModal, { useCustomModal } from '@/components/ui/CustomModal';
import { useAuth } from '../_layout';
import { useCoins } from '@/contexts/CoinsContext';
import { hybridSyncService } from '@/services/hybridSyncService';
import {
  validateChallenge,
  quickValidate,
} from '@/services/challengeValidator';
import { loadChallengeDraft, saveChallengeDraft } from '@/services/challengeDraft';
import { submitChallengeSolution } from '@/services/challengeSubmissionService';
import {
  ChallengeResults,
  ChallengeRequirements,
  type ChallengeRunSummary,
} from '@/components/challenge/ChallengeResults';
import { ExplainWithAI } from '@/components/ai';
import SolutionReveal, { type ChallengeAttemptState } from '@/components/challenge/SolutionReveal';
import { coinService } from '@/services/coinService';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';
import { progressService } from '@/services/progressService';
import { useBadges } from '@/contexts/BadgeContext';

// Conditional import: MobileWebEditor uses react-native-webview (not available on web)
// On web, CodeMirrorEditor or TextInput is used instead
interface MobileWebEditorRef {
  setCodeExternal: (code: string) => void;
  replaceWord: (word: string) => void;
  focus: () => void;
}
let MobileWebEditor: any = null;
if (Platform.OS !== 'web') {
  try {
    MobileWebEditor = require('@/components/editor/MobileWebEditor').default;
  } catch (_e) {
    MobileWebEditor = null;
  }
}

const MOBILE_BREAKPOINT = 768;

// Map challenge language to CodeMirror language name
function getCMLanguage(lang: string): string {
  const map: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    'c++': 'cpp',
    'c#': 'csharp',
    html: 'html',
    css: 'css',
    react: 'tsx',
    sql: 'sql',
  };
  return map[lang.toLowerCase()] || 'javascript';
}

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const { width: SW, height: SH } = Dimensions.get('window');

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { unlockedCourses, refresh: refreshCoins } = useCoins();
  const { checkBadges } = useBadges();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width >= MOBILE_BREAKPOINT;
  const isWeb = Platform.OS === 'web';
  const mobileEditorRef = useRef<MobileWebEditorRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const editorLayoutRef = useRef<number>(0);
  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    { passed: boolean; message: string }[] | null
  >(null);
  // النتيجة الكاملة لآخر تشغيل (للعرض المفصل ولمساعد الذكاء)
  const [runSummary, setRunSummary] = useState<ChallengeRunSummary | null>(null);
  // الكود الذي أنتج آخر نتيجة — إذا تغيّر الكود لا تُستخدم النتيجة القديمة (للذكاء أو كأنها حالية)
  const [runCode, setRunCode] = useState<string | null>(null);
  // لا نعرض المحرر قبل تحميل المسودة حتى لا يكتب الكود الابتدائي فوقها
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  // حالة المحاولات من السيرفر: مستوى التلميح وأهلية إظهار الحل
  const [attemptState, setAttemptState] = useState<ChallengeAttemptState | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { showModal, hideModal, ModalComponent } = useCustomModal();

  // ===== التحقق من حالة إكمال التحدي عند الدخول =====
  useEffect(() => {
    const checkCompleted = async () => {
      if (user?.id && id) {
        await hybridSyncService.setUser(user.id);
        const completed = await hybridSyncService.checkLessonCompleted(id);
        setIsAlreadyCompleted(!!completed);
        const st = await coinService.challengeAttemptState(id);
        if (st.success) setAttemptState(st as ChallengeAttemptState);
        coinService.track('challenge_opened', { challenge_id: id });
      }
    };
    checkCompleted();
  }, [user?.id, id]);

  // ===== تمرير الشاشة للمحرر عند فتح الكيبورد =====
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      // تمرير للمحرر عند فتح الكيبورد
      if (editorLayoutRef.current > 0 && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: editorLayoutRef.current - 120,
            animated: true,
          });
        }, 100);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Find challenge
  const challenge = ALL_CHALLENGES.find((c) => c.id === id);

  // ===== التحقق من الصلاحية: هل التحدي مقفول؟ =====
  const accessType = challenge ? getChallengeAccessType(challenge) : 'free';
  const isLocked = useMemo(() => {
    if (!challenge) return false;
    if (accessType === 'free') return false;
    if (accessType === 'course-required') {
      const reqCourseId = getChallengeRequiredCourseId(challenge);
      if (!reqCourseId) return false;
      return !isCourseAccessible(reqCourseId, unlockedCourses);
    }
    return false;
  }, [challenge, accessType, unlockedCourses]);

  // Initialize code with starter code
  // (يجب أن يكون قبل أي return مبكر حتى لا يتغير ترتيب الـ hooks)
  // (مع استعادة مسودة المستخدم المحفوظة إن وجدت)
  useEffect(() => {
    if (!challenge) return;
    let cancelled = false;
    setDraftLoaded(false);
    loadChallengeDraft(user?.id, challenge.id).then((draft) => {
      if (cancelled) return;
      setCode(draft ?? challenge.starterCode ?? '');
      setDraftLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id, user?.id]);

  // حفظ المسودة تلقائياً بعد التوقف عن الكتابة
  useEffect(() => {
    if (!challenge || !draftLoaded) return;
    const t = setTimeout(() => {
      saveChallengeDraft(user?.id, challenge.id, code, challenge.starterCode ?? '');
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, draftLoaded]);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorText}>التحدي غير موجود</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ===== شاشة القفل: إذا كان التحدي مقفولاً =====
  if (isLocked) {
    const reqCourseId = getChallengeRequiredCourseId(challenge);
    const reqCourseTitle = reqCourseId ? getCourseTitleById(reqCourseId) : null;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0f0f1e', '#1a1a3e']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="lock-closed" size={64} color="#f59e0b" />
            <Text
              style={[styles.errorText, { color: '#f59e0b', marginTop: 16 }]}
            >
              هذا التحدي مقفول
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 24,
              }}
            >
              {reqCourseTitle
                ? `هذا التحدي جزء من دورة "${reqCourseTitle}"، ويُفتح مجاناً عندما تصل لهذه الدورة في مسارك.`
                : 'أكمل المتطلبات اللازمة لفتح هذا التحدي'}
            </Text>
            {reqCourseId && (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  { marginTop: 20, backgroundColor: '#7c3aed' },
                ]}
                onPress={() => router.replace(`/course/${reqCourseId}` as any)}
              >
                <Text style={styles.backButtonText}>عرض الدورة</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.backButton, { marginTop: 12 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const visibleTestCases = challenge.testCases.filter((tc) => !tc.hidden);
  const hiddenTestCount = challenge.testCases.length - visibleTestCases.length;
  const validateOptions = {
    checks: challenge.checks,
    entryFunction: challenge.entryFunction,
    validation: challenge.validation,
    prelude: challenge.prelude,
  };

  // التحقق من كود يقترحه مساعد الذكاء بنفس اختبارات التحدي
  const verifyAICode = async (candidate: string): Promise<ChallengeRunSummary> => {
    const r = await validateChallenge(
      candidate,
      challenge.starterCode,
      challenge.language,
      challenge.testCases,
      validateOptions
    );
    return {
      results: r.results,
      passedTests: r.passedTests,
      totalTests: r.totalTests,
      allPassed: r.allPassed,
      serviceError: r.serviceError,
      mode: r.mode,
    };
  };

  // استبدال كود المحرر بعد موافقة المستخدم (من مساعد الذكاء)
  const applyCodeToEditor = (newCode: string) => {
    setCode(newCode);
    mobileEditorRef.current?.setCodeExternal(newCode);
    setRunSummary(null);
    setTestResults(null);
  };

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

  const handleRunCode = async () => {
    // Quick validation first
    const quickCheck = quickValidate(
      code,
      challenge.starterCode,
      challenge.language
    );

    if (!quickCheck.valid) {
      showModal({
        type: 'warning',
        title: 'تحقق من الكود',
        message: quickCheck.message,
        buttons: [
          { text: 'حسناً', onPress: () => hideModal(), style: 'primary' },
        ],
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setTestResults(null);
    setRunSummary(null);

    try {
      // كل الاختبارات (الظاهرة والمخفية) + المتطلبات البنيوية
      const validationResult = await validateChallenge(
        code,
        challenge.starterCode,
        challenge.language,
        challenge.testCases,
        validateOptions
      );

      // Convert results to display format
      const results = validationResult.results.map((result) => ({
        passed: result.passed,
        message: result.message,
      }));

      setTestResults(results);
      setRunCode(code);
      setRunSummary({
        results: validationResult.results,
        passedTests: validationResult.passedTests,
        totalTests: validationResult.totalTests,
        allPassed: validationResult.allPassed,
        serviceError: validationResult.serviceError,
        mode: validationResult.mode,
      });

      // Show summary
      if (validationResult.allPassed) {
        setOutput(
          `[نجاح] نجحت جميع الاختبارات! (${validationResult.passedTests}/${validationResult.totalTests})`
        );
        // Auto-submit after successful run
        // Small delay to let user see the success message
        setTimeout(() => {
          handleAutoSubmit();
        }, 800);
      } else {
        setOutput(
          `[تحذير] ${validationResult.passedTests}/${validationResult.totalTests} اختبارات ناجحة`
        );
        if (user?.id && !validationResult.serviceError) {
          coinService
            .recordChallengeAttempt(challenge.id, validationResult.passedTests, validationResult.totalTests)
            .then((st) => st.success && applyAttemptState(st as ChallengeAttemptState));
        }
      }
    } catch (error) {
      const failure = {
        passed: false,
        message: 'حدث خطأ غير متوقع أثناء التحقق — كودك محفوظ، حاول مرة أخرى',
      };
      setTestResults([failure]);
      setRunSummary({
        results: [{ ...failure, kind: 'service_error' }],
        passedTests: 0,
        totalTests: 1,
        allPassed: false,
        serviceError: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // حفظ الإكمال: السيرفر يعيد تشغيل الاختبارات (المخفية أيضاً) ويسجّل الإكمال
  // ويمنح XP والكوينات مرة واحدة. العميل لا يكتب الإكمال بنفسه.
  const saveVerifiedCompletion = async () => {
    if (!challenge) return;
    if (!user?.id) {
      showModal({
        type: 'success',
        title: 'أحسنت!',
        message: 'حللت التحدي! سجّل الدخول ليُحفظ إكمالك وتحصل على XP والكوينات.',
        buttons: [{ text: 'حسناً', onPress: () => hideModal(), style: 'primary' }],
      });
      return;
    }

    setIsSaving(true);
    let submission: Awaited<ReturnType<typeof submitChallengeSolution>>;
    try {
      submission = await submitChallengeSolution(challenge.id, code);
    } finally {
      setIsSaving(false);
    }

    if (!submission.ok) {
      showModal({
        type: 'warning',
        title: 'لم يُحفظ الإكمال بعد',
        message: submission.message,
        buttons: [
          { text: 'إعادة الإرسال', onPress: () => { hideModal(); saveVerifiedCompletion(); }, style: 'primary' },
          { text: 'لاحقاً', onPress: () => hideModal() },
        ],
      });
      return;
    }

    if (!submission.verified) {
      if (submission.attempts) applyAttemptState(submission.attempts);
      // نتيجة السيرفر هي المعتمدة — نعرضها بدل النتيجة المحلية
      setTestResults(submission.results.map((r) => ({ passed: r.passed, message: r.message })));
      setRunCode(code);
      setRunSummary({
        results: submission.results,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests,
        allPassed: false,
        mode: submission.mode,
      });
      showModal({
        type: 'warning',
        title: 'لم يجتز التحقق النهائي',
        message: `التحقق على السيرفر: ${submission.passedTests}/${submission.totalTests} اختبارات ناجحة. راجع النتائج ثم أعد المحاولة.`,
        buttons: [{ text: 'حسناً', onPress: () => hideModal(), style: 'primary' }],
      });
      return;
    }

    const isFirstTime = submission.completion.firstTime;
    const coinsEarned =
      submission.coins?.success && !submission.coins.duplicate ? submission.coins.reward ?? 0 : 0;
    setIsAlreadyCompleted(true);
    if (coinsEarned > 0) refreshCoins().catch(() => {});

    if (isFirstTime) {
      try {
        // سجل محلي للشارات (لا يؤثر على السيرفر)
        await progressService.completeChallenge(challenge.id, challenge.points, code, currentHint);
        await badgeService.incrementChallengeStreak();
        if (currentHint === 0 && !showHints) {
          await badgeService.incrementNoHintCount();
        }
        if (challenge.difficulty === 'hard') {
          await badgeService.incrementHardChallengeCount();
        }
        await notificationService.notifyChallengeCompleted(challenge.id, challenge.points);
        await checkBadges();
      } catch (e) {
        // Error in badge check
      }
    }

    showModal(
      isFirstTime
        ? {
            type: 'success',
            title: 'أحسنت!',
            message:
              coinsEarned > 0
                ? `لقد حللت التحدي بنجاح! +${coinsEarned} كوين`
                : 'لقد حللت التحدي بنجاح!',
            xpReward: submission.completion.xpAwarded || undefined,
            buttons: [
              { text: 'التحدي التالي', onPress: () => { hideModal(); router.back(); }, style: 'primary' },
            ],
          }
        : {
            type: 'success',
            title: 'تم الحل مجدداً',
            message: 'لقد حللت هذا التحدي من قبل. لا يتم منح XP مرة أخرى.',
            buttons: [
              { text: 'التحدي التالي', onPress: () => { hideModal(); router.back(); }, style: 'primary' },
            ],
          }
    );
  };

  // Auto-submit when all tests pass locally (the server re-checks everything)
  const handleAutoSubmit = () => saveVerifiedCompletion();

  const handleSubmit = async () => {
    if (!testResults || testResults.some((r) => !r.passed)) {
      showModal({
        type: 'warning',
        title: 'لم تنجح جميع الاختبارات',
        message: 'الرجاء التأكد من نجاح جميع الاختبارات قبل الإرسال',
        buttons: [
          { text: 'حسناً', onPress: () => hideModal(), style: 'primary' },
        ],
      });
      return;
    }
    await saveVerifiedCompletion();
  };

  // المحاولة الأولى: ملاحظات فقط. الثانية: تلميح. الثالثة: تلميح أقوى. بلا أي عقوبة أو إعلان.
  const applyAttemptState = (st: ChallengeAttemptState) => {
    setAttemptState(st);
    const level = Math.min(st.hint_level ?? 0, challenge.hints.length);
    if (level > 0) {
      setShowHints(true);
      setCurrentHint((h) => Math.max(h, level - 1));
    }
  };

  const showNextHint = () => {
    if (currentHint < challenge.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  // Web layout rendering
  if (isLargeScreen && isWeb) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
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
            <View style={styles.headerCenter}>
              <Text style={webStyles.headerTitleWeb} numberOfLines={1}>
                {challenge.title}
              </Text>
              <View style={styles.headerBadges}>
                {isAlreadyCompleted && (
                  <View
                    style={[
                      styles.completedHeaderBadge,
                      { backgroundColor: '#22c55e20' },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#22c55e"
                    />
                    <Text
                      style={{
                        color: '#22c55e',
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginLeft: 4,
                      }}
                    >
                      مكتمل
                    </Text>
                  </View>
                )}
                <View
                  style={[styles.pointsBadge, { backgroundColor: '#fbbf2420' }]}
                >
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={[styles.pointsText, { fontSize: 14 }]}>
                    {challenge.points} XP
                  </Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        difficultyColors[challenge.difficulty] + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      {
                        color: difficultyColors[challenge.difficulty],
                        fontSize: 12,
                      },
                    ]}
                  >
                    {difficultyLabels[challenge.difficulty]}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.hintBtn}
              onPress={() => setShowHints(!showHints)}
            >
              <Ionicons name="bulb-outline" size={24} color="#fbbf24" />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={webStyles.scrollContentWeb}
          >
            <View style={webStyles.webContainer}>
              {/* Left Column - Editor */}
              <View style={webStyles.webLeftColumn}>
                {/* Challenge Description */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <View style={webStyles.descriptionCardWeb}>
                    <View style={styles.descriptionHeader}>
                      <SmartIcon
                        name={challenge.icon}
                        size={28}
                        color="#3b82f6"
                      />
                      <Text style={webStyles.descriptionTitleWeb}>المطلوب</Text>
                    </View>
                    <Text style={webStyles.descriptionTextWeb}>
                      {challenge.description}
                    </Text>

                    <View style={webStyles.languageInfoWeb}>
                      <Ionicons name="code-slash" size={18} color="#9ca3af" />
                      <Text style={webStyles.languageTextWeb}>
                        اللغة: {challenge.language}
                      </Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Code Editor */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <View style={webStyles.editorCardWeb}>
                    <View style={webStyles.editorHeaderWeb}>
                      <View style={styles.editorTabs}>
                        <View style={webStyles.editorTabWeb}>
                          <Text style={webStyles.editorTabTextWeb}>
                            {challenge.language === 'Python'
                              ? 'main.py'
                              : challenge.language === 'JavaScript'
                                ? 'main.js'
                                : challenge.language === 'Java'
                                  ? 'Main.java'
                                  : challenge.language === 'C++'
                                    ? 'main.cpp'
                                    : challenge.language === 'C#'
                                      ? 'Program.cs'
                                      : challenge.language === 'TypeScript'
                                        ? 'main.ts'
                                        : 'code.' +
                                          challenge.language.toLowerCase()}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={() => setCode(challenge.starterCode)}
                      >
                        <Ionicons name="refresh" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    {!draftLoaded ? (
                      <View style={{ minHeight: 400 }} />
                    ) : Platform.OS === 'web' && CodeMirrorEditor ? (
                      <View style={{ minHeight: 400 }}>
                        <CodeMirrorEditor
                          code={code}
                          language={getCMLanguage(challenge.language)}
                          onChange={setCode}
                          height={400}
                        />
                      </View>
                    ) : (
                      <TextInput
                        style={[
                          webStyles.codeInputWeb,
                          Platform.OS === 'web' && ({ outline: 'none' } as any),
                        ]}
                        value={code}
                        onChangeText={setCode}
                        multiline
                        placeholder="اكتب الكود هنا..."
                        placeholderTextColor="#4b5563"
                        textAlignVertical="top"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  </View>
                </Animated.View>

                {/* Test Results */}
                {runSummary && (
                  <Animated.View entering={FadeIn}>
                    <ChallengeResults summary={runSummary} stale={runCode !== null && runCode !== code} />
                  </Animated.View>
                )}

                {/* Action Buttons */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <View style={webStyles.actionsContainerWeb}>
                    <TouchableOpacity
                      style={[
                        webStyles.runButtonWeb,
                        (isRunning || isSaving) && styles.buttonDisabled,
                        !(
                          testResults && testResults.every((r) => r.passed)
                        ) && { flex: 1 },
                      ]}
                      onPress={handleRunCode}
                      disabled={isRunning || isSaving}
                    >
                      <Ionicons
                        name={
                          isRunning
                            ? 'hourglass'
                            : isSaving
                              ? 'cloud-upload'
                              : 'play'
                        }
                        size={22}
                        color="#fff"
                      />
                      <Text style={webStyles.runButtonTextWeb}>
                        {isRunning
                          ? 'جاري التنفيذ...'
                          : isSaving
                            ? 'جاري الإرسال...'
                            : 'تشغيل الكود'}
                      </Text>
                    </TouchableOpacity>

                    {testResults && testResults.every((r) => r.passed) && (
                      <TouchableOpacity
                        style={[
                          webStyles.submitButtonWeb,
                          isSaving && styles.buttonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSaving}
                      >
                        <Ionicons
                          name={isSaving ? 'hourglass' : 'checkmark-circle'}
                          size={22}
                          color="#fff"
                        />
                        <Text style={webStyles.submitButtonTextWeb}>
                          {isSaving ? 'جاري الإرسال...' : 'إرسال الحل'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Right Column - Sidebar */}
              <View style={webStyles.webRightColumn}>
                {/* Hints Section */}
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                  <View style={webStyles.hintsCardWeb}>
                    <View style={styles.hintsHeader}>
                      <Ionicons name="bulb" size={22} color="#fbbf24" />
                      <Text style={webStyles.hintsTitleWeb}>تلميحات</Text>
                    </View>

                    {challenge.hints
                      .slice(0, currentHint + 1)
                      .map((hint, index) => (
                        <View key={index} style={webStyles.hintItemWeb}>
                          <Text style={webStyles.hintNumberWeb}>
                            {index + 1}.
                          </Text>
                          <Text style={webStyles.hintTextWeb}>{hint}</Text>
                        </View>
                      ))}

                    {currentHint < challenge.hints.length - 1 && (
                      <TouchableOpacity
                        style={webStyles.showMoreHintWeb}
                        onPress={showNextHint}
                      >
                        <Text style={webStyles.showMoreHintTextWeb}>
                          إظهار تلميح آخر ({currentHint + 1}/
                          {challenge.hints.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>

                {/* المتطلبات (للتحديات التي تُفحص بقراءة الكود) */}
                {!!challenge.checks?.length && (
                  <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <ChallengeRequirements checks={challenge.checks} />
                  </Animated.View>
                )}

                {/* Test Cases — الظاهرة فقط؛ المخفية لا تُعرض */}
                {visibleTestCases.length > 0 && (
                  <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={webStyles.testCasesCard}>
                      <Text style={webStyles.testCasesTitle}>
                        حالات الاختبار
                      </Text>
                      {visibleTestCases
                        .slice(0, 3)
                        .map((testCase, index) => (
                          <View key={index} style={webStyles.testCaseItem}>
                            <Text style={webStyles.testCaseLabel}>المدخل:</Text>
                            <Text style={webStyles.testCaseValue}>
                              {testCase.input || 'لا يوجد'}
                            </Text>
                            <Text
                              style={[
                                webStyles.testCaseLabel,
                                { marginTop: 8 },
                              ]}
                            >
                              المتوقع:
                            </Text>
                            <Text style={webStyles.testCaseValue}>
                              {testCase.expectedOutput}
                            </Text>
                          </View>
                        ))}
                      {hiddenTestCount > 0 && (
                        <Text style={[webStyles.testCaseLabel, { marginTop: 8 }]}>
                          + {hiddenTestCount} اختبارات مخفية تتحقق من حالات أخرى
                        </Text>
                      )}
                    </View>
                  </Animated.View>
                )}

                {/* Show Solution */}
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  {/* زر شرح بالذكاء */}
                  <Animated.View
                    entering={FadeInDown.delay(150).springify()}
                    style={{
                      paddingHorizontal: 16,
                      marginTop: 12,
                    }}
                  >
                    <ExplainWithAI
                      challengeId={challenge.id}
                      challengeTitle={challenge.title}
                      challengeDescription={challenge.description}
                      starterCode={challenge.starterCode}
                      language={challenge.language}
                      testCases={challenge.testCases}
                      hints={challenge.hints}
                      userCode={code}
                      requirements={challenge.checks?.map((c) => c.message)}
                      lastRun={runSummary && runCode === code ? runSummary : null}
                      verifyCode={verifyAICode}
                      onApplyCode={applyCodeToEditor}
                    />
                  </Animated.View>
                  <SolutionReveal
                    challengeId={challenge.id}
                    language={challenge.language}
                    isCompleted={isAlreadyCompleted}
                    attemptState={attemptState}
                    onAttemptState={setAttemptState}
                    onApplyCode={applyCodeToEditor}
                  />
                </Animated.View>

                {/* Tips */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <View style={[webStyles.tipsCard, { marginTop: 20 }]}>
                    <Text style={webStyles.tipsTitle}>نصائح</Text>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        اقرأ المطلوب بعناية قبل البدء
                      </Text>
                    </View>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        استخدم التلميحات إذا واجهت صعوبة
                      </Text>
                    </View>

                    <View style={webStyles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={webStyles.tipText}>
                        جرب الكود قبل الإرسال للتأكد من صحته
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>
          </ScrollView>

          {/* Custom Modal */}
          <ModalComponent />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Mobile layout rendering
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {challenge.title}
            </Text>
            <View style={styles.headerBadges}>
              {isAlreadyCompleted && (
                <View
                  style={[
                    styles.completedHeaderBadge,
                    { backgroundColor: '#22c55e20' },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                  <Text
                    style={{
                      color: '#22c55e',
                      fontSize: 10,
                      fontWeight: 'bold',
                      marginLeft: 3,
                    }}
                  >
                    مكتمل
                  </Text>
                </View>
              )}
              <View
                style={[styles.pointsBadge, { backgroundColor: '#fbbf2420' }]}
              >
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.pointsText}>{challenge.points}</Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      difficultyColors[challenge.difficulty] + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: difficultyColors[challenge.difficulty] },
                  ]}
                >
                  {difficultyLabels[challenge.difficulty]}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.hintBtn}
            onPress={() => setShowHints(!showHints)}
          >
            <Ionicons name="bulb-outline" size={24} color="#fbbf24" />
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            onContentSizeChange={() => {
              // تمرير تلقائي عند تغير حجم المحتوى (عند الكتابة) فقط إذا كان الكيبورد مفتوحاً
              if (
                keyboardVisible &&
                editorLayoutRef.current > 0 &&
                scrollViewRef.current
              ) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: editorLayoutRef.current - 50,
                    animated: false,
                  });
                }, 50);
              }
            }}
          >
            {/* Challenge Description */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View style={styles.descriptionCard}>
                <View style={styles.descriptionHeader}>
                  <SmartIcon name={challenge.icon} size={24} color="#3b82f6" />
                  <Text style={styles.descriptionTitle}>المطلوب</Text>
                </View>
                <Text style={styles.descriptionText}>
                  {challenge.description}
                </Text>

                <View style={styles.languageInfo}>
                  <Ionicons name="code-slash" size={16} color="#9ca3af" />
                  <Text style={styles.languageText}>
                    اللغة: {challenge.language}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Hints Section */}
            {showHints && (
              <Animated.View entering={FadeIn} style={styles.hintsCard}>
                <View style={styles.hintsHeader}>
                  <Ionicons name="bulb" size={20} color="#fbbf24" />
                  <Text style={styles.hintsTitle}>تلميحات</Text>
                </View>

                {challenge.hints
                  .slice(0, currentHint + 1)
                  .map((hint, index) => (
                    <View key={index} style={styles.hintItem}>
                      <Text style={styles.hintNumber}>{index + 1}.</Text>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ))}

                {currentHint < challenge.hints.length - 1 && (
                  <TouchableOpacity
                    style={styles.showMoreHint}
                    onPress={showNextHint}
                  >
                    <Text style={styles.showMoreHintText}>
                      إظهار تلميح آخر ({currentHint + 1}/
                      {challenge.hints.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            {/* المتطلبات (للتحديات التي تُفحص بقراءة الكود) */}
            {!!challenge.checks?.length && (
              <ChallengeRequirements checks={challenge.checks} />
            )}

            {/* Code Editor */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View
                style={styles.editorCard}
                onLayout={(e) => {
                  editorLayoutRef.current = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.editorHeader}>
                  <View style={styles.editorTabs}>
                    <View style={styles.editorTab}>
                      <Text style={styles.editorTabText}>
                        {challenge.language === 'Python'
                          ? 'main.py'
                          : challenge.language === 'JavaScript'
                            ? 'main.js'
                            : challenge.language === 'Java'
                              ? 'Main.java'
                              : challenge.language === 'C++'
                                ? 'main.cpp'
                                : challenge.language === 'C#'
                                  ? 'Program.cs'
                                  : challenge.language === 'TypeScript'
                                    ? 'main.ts'
                                    : 'code.' +
                                      challenge.language.toLowerCase()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setCode(challenge.starterCode);
                      mobileEditorRef.current?.setCodeExternal(
                        challenge.starterCode
                      );
                    }}
                  >
                    <Ionicons name="refresh" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* محرر الكود — MobileWebEditor على الموبايل، CodeMirror/TextInput على الويب */}
                <View style={{ height: 300 }}>
                  {!draftLoaded ? null : Platform.OS !== 'web' && MobileWebEditor ? (
                    <MobileWebEditor
                      ref={mobileEditorRef}
                      initialCode={code || challenge.starterCode || ''}
                      language={getCMLanguage(challenge.language)}
                      onChange={setCode}
                    />
                  ) : CodeMirrorEditor ? (
                    <CodeMirrorEditor
                      code={code}
                      language={getCMLanguage(challenge.language)}
                      onChange={setCode}
                      height={300}
                    />
                  ) : (
                    <TextInput
                      style={{
                        flex: 1,
                        color: '#e5e7eb',
                        fontFamily: MONO,
                        fontSize: 14,
                        padding: 16,
                        backgroundColor: '#111827',
                        textAlignVertical: 'top',
                      }}
                      value={code}
                      onChangeText={setCode}
                      multiline
                      placeholder="اكتب الكود هنا..."
                      placeholderTextColor="#4b5563"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                </View>
              </View>
            </Animated.View>

            {/* Test Results */}
            {runSummary && (
              <Animated.View entering={FadeIn}>
                <ChallengeResults summary={runSummary} stale={runCode !== null && runCode !== code} />
              </Animated.View>
            )}
            {/* زر شرح بالذكاء - Mobile */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <ExplainWithAI
                challengeId={challenge.id}
                challengeTitle={challenge.title}
                challengeDescription={challenge.description}
                starterCode={challenge.starterCode}
                language={challenge.language}
                testCases={challenge.testCases}
                hints={challenge.hints}
                userCode={code}
                requirements={challenge.checks?.map((c) => c.message)}
                lastRun={runSummary && runCode === code ? runSummary : null}
                verifyCode={verifyAICode}
                onApplyCode={applyCodeToEditor}
              />
            </Animated.View>
            <SolutionReveal
              challengeId={challenge.id}
              language={challenge.language}
              isCompleted={isAlreadyCompleted}
              attemptState={attemptState}
              onAttemptState={setAttemptState}
              onApplyCode={applyCodeToEditor}
            />
            {/* Action Buttons */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.actionsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.runButton,
                  (isRunning || isSaving) && styles.buttonDisabled,
                  // Full width if submit button not visible
                  !(testResults && testResults.every((r) => r.passed)) && {
                    flex: 1,
                  },
                ]}
                onPress={handleRunCode}
                disabled={isRunning || isSaving}
              >
                <Ionicons
                  name={
                    isRunning ? 'hourglass' : isSaving ? 'cloud-upload' : 'play'
                  }
                  size={20}
                  color="#fff"
                />
                <Text style={styles.runButtonText}>
                  {isRunning
                    ? 'جاري التنفيذ...'
                    : isSaving
                      ? 'جاري الإرسال...'
                      : 'تشغيل الكود'}
                </Text>
              </TouchableOpacity>

              {testResults && testResults.every((r) => r.passed) && (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSaving && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSaving}
                >
                  <Ionicons
                    name={isSaving ? 'hourglass' : 'checkmark-circle'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.submitButtonText}>
                    {isSaving ? 'جاري الإرسال...' : 'إرسال الحل'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            <View style={{ height: Math.max(80, insets.bottom + 30) }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Custom Modal */}
        <ModalComponent />
      </LinearGradient>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerWeb: {
    paddingTop: 80,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbbf2420',
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
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  completedHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
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
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollContentWeb: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  cardWeb: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  descriptionCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  descriptionText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 12,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  hintsCard: {
    backgroundColor: '#fbbf2410',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf2430',
  },
  hintsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  hintItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  hintNumber: {
    color: '#fbbf24',
    fontWeight: 'bold',
    marginLeft: 8,
    width: 20,
  },
  hintText: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 14,
  },
  showMoreHint: {
    alignItems: 'center',
    paddingTop: 8,
  },
  showMoreHintText: {
    color: '#fbbf24',
    fontSize: 12,
  },
  editorCard: {
    backgroundColor: '#0d1117',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  editorCardWeb: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  editorTabs: {
    flexDirection: 'row',
  },
  editorTab: {
    backgroundColor: '#0d1117',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editorTabText: {
    color: '#8b949e',
    fontSize: 12,
  },
  resetBtn: {
    padding: 8,
  },
  codeInput: {
    minHeight: 200,
    padding: 16,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#e6edf3',
    lineHeight: 22,
  },
  codeInputWeb: {
    minHeight: 350,
    fontSize: 15,
    lineHeight: 26,
    padding: 24,
  },
  resultsCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 13,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionsContainerWeb: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
  },
  runButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  solutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  solutionButtonText: {
    color: '#6b7280',
    fontSize: 14,
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

// Enhanced web-specific styles with two-column layout
const webStyles = {
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
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  headerTitleWeb: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  } as TextStyle,
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
  challengeInfoCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  } as ViewStyle,
  challengeInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  } as TextStyle,
  challengeBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  } as ViewStyle,
  badgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  } as ViewStyle,
  badgeTextLarge: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  descriptionCardWeb: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  } as ViewStyle,
  descriptionTitleWeb: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  descriptionTextWeb: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 28,
    marginBottom: 16,
  } as TextStyle,
  languageInfoWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  } as ViewStyle,
  languageTextWeb: {
    fontSize: 14,
    color: '#9ca3af',
  } as TextStyle,
  editorCardWeb: {
    backgroundColor: '#0d1117',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#30363d',
  } as ViewStyle,
  editorHeaderWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  } as ViewStyle,
  editorTabWeb: {
    backgroundColor: '#0d1117',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,
  editorTabTextWeb: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  codeInputWeb: {
    minHeight: 400,
    padding: 24,
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#e6edf3',
    lineHeight: 26,
  } as TextStyle,
  actionsContainerWeb: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  } as ViewStyle,
  runButtonWeb: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  } as ViewStyle,
  runButtonTextWeb: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  } as TextStyle,
  submitButtonWeb: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  } as ViewStyle,
  submitButtonTextWeb: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  } as TextStyle,
  resultsCardWeb: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  } as ViewStyle,
  resultsTitleWeb: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  resultItemWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff08',
    borderRadius: 10,
  } as ViewStyle,
  resultTextWeb: {
    fontSize: 15,
    flex: 1,
  } as TextStyle,
  // Sidebar styles
  hintsCardWeb: {
    backgroundColor: '#fbbf2410',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fbbf2430',
  } as ViewStyle,
  hintsTitleWeb: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 16,
  } as TextStyle,
  hintItemWeb: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
  } as ViewStyle,
  hintNumberWeb: {
    color: '#fbbf24',
    fontWeight: 'bold',
    marginLeft: 10,
    width: 24,
    fontSize: 15,
  } as TextStyle,
  hintTextWeb: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  showMoreHintWeb: {
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#fbbf2420',
  } as ViewStyle,
  showMoreHintTextWeb: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  testCasesCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  } as ViewStyle,
  testCasesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  } as TextStyle,
  testCaseItem: {
    backgroundColor: '#ffffff08',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  } as ViewStyle,
  testCaseLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  } as TextStyle,
  testCaseValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
  } as TextStyle,
  solutionButtonWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: '#1a1a3e',
    borderRadius: 14,
    marginTop: 12,
  } as ViewStyle,
  solutionButtonTextWeb: {
    color: '#9ca3af',
    fontSize: 15,
  } as TextStyle,
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
