/**
 * ExplainWithAI.tsx
 *
 * مساعد الذكاء الاصطناعي داخل التحديات والدروس.
 * جزء من تجربة التعلم ومجاني للجميع، بمستويات مساعدة متدرجة:
 *   تلميح ← اشرح المشكلة ← تتبّع الخطأ ← أصلح كودي ← الحل الكامل
 * حدود الاستخدام اليومية تُطبّق على السيرفر (حماية تكلفة الـAI) ولا ترتبط بأي دفع.
 *
 * - السياق المرسل: الوصف + الاختبارات الظاهرة فقط + المتطلبات + كود الطالب + نتائج آخر تشغيل حقيقي.
 *   الاختبارات المخفية لا تُرسل (عددها فقط).
 * - الذكاء لا يحكم على الحل: أي كود يقترحه (أصلح/الحل) يُشغَّل على اختبارات التحدي
 *   ويُعرض معه "تم التحقق" أو "لم يجتز" أو "غير متحقق منه".
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AIMessageRenderer } from './AIMessageRenderer';
import {
  aiChatService,
  AIServiceError,
  AI_UNAVAILABLE_MESSAGE,
} from '@/services/aiChatService';
import { conversationsService } from '@/services/conversationsService';
import { coinService, AIQuota } from '@/services/coinService';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/crossPlatformAlert';
import type { ChallengeRunSummary } from '@/components/challenge/ChallengeResults';
import {
  assistantCacheKey,
  buildAssistantPrompt,
  extractCode,
  hasFailedRun as runHasFailures,
  hasUserCode as contextHasUserCode,
  type AssistantContext,
  type HelpLevel,
} from './challengeAssistantPrompt';

interface TestCaseInfo {
  input: string;
  expectedOutput: string;
  description: string;
  hidden?: boolean;
}

interface ExplainWithAIProps {
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  starterCode?: string;
  language: string;
  contentType?: 'challenge' | 'lesson';
  // Full challenge context for AI
  testCases?: TestCaseInfo[];
  hints?: string[];
  solution?: string;
  userCode?: string;
  /** المتطلبات البنيوية (للتحديات التي تُفحص بقراءة الكود) */
  requirements?: string[];
  /** نتائج آخر تشغيل حقيقي لكود الطالب */
  lastRun?: ChallengeRunSummary | null;
  /** يشغّل كوداً على اختبارات التحدي (للتحقق من كود الذكاء) */
  verifyCode?: (code: string) => Promise<ChallengeRunSummary>;
  /** استبدال كود الطالب بعد موافقته */
  onApplyCode?: (code: string) => void;
}


type Verification =
  | { status: 'checking' }
  | { status: 'verified' | 'failed'; passed: number; total: number; structural: boolean }
  | { status: 'unverified'; reason: string };

const LEVELS: Array<{
  id: HelpLevel;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  {
    id: 'hint',
    label: 'تلميح',
    desc: 'دفعة صغيرة بدون الحل',
    icon: 'bulb-outline',
    color: '#10b981',
  },
  {
    id: 'explain',
    label: 'اشرح المشكلة',
    desc: 'ليش الكود ما يشتغل؟',
    icon: 'search',
    color: '#3b82f6',
  },
  {
    id: 'debug',
    label: 'تتبّع الخطأ',
    desc: 'لماذا فشل الاختبار؟',
    icon: 'bug-outline',
    color: '#ef4444',
  },
  {
    id: 'fix',
    label: 'أصلح كودي',
    desc: 'تعديل كودك الحالي',
    icon: 'construct-outline',
    color: '#f59e0b',
  },
  {
    id: 'solve',
    label: 'الحل الكامل',
    desc: 'حل كامل مع الشرح',
    icon: 'checkmark-done',
    color: '#a855f7',
  },
];

const MODE_FOR_LEVEL: Record<HelpLevel, string> = {
  hint: 'challenge-hint',
  explain: 'challenge-explain',
  debug: 'challenge-debug',
  fix: 'challenge-fix',
  solve: 'challenge-solve',
};

// Global cache: keyed by `${challengeId}:${level}:${بصمة الكود والنتائج}`
const explanationCache: Record<string, string> = {};

export const ExplainWithAI: React.FC<ExplainWithAIProps> = ({
  challengeId,
  challengeTitle,
  challengeDescription,
  starterCode,
  language,
  contentType = 'challenge',
  testCases,
  hints,
  userCode,
  requirements,
  lastRun,
  verifyCode,
  onApplyCode,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState<HelpLevel | null>(null);
  const [quota, setQuota] = useState<AIQuota | null>(null);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const isChallenge = contentType === 'challenge';
  const assistantCtx: AssistantContext = {
    isChallenge,
    title: challengeTitle,
    description: challengeDescription,
    language,
    starterCode,
    userCode,
    testCases,
    hints,
    requirements,
    lastRun,
  };
  const hasUserCode = contextHasUserCode(assistantCtx);
  const hasFailedRun = runHasFailures(assistantCtx);
  const cacheKey = (lv: HelpLevel) => assistantCacheKey(challengeId, lv, assistantCtx);

  const loadQuota = useCallback(async () => {
    setQuota(await coinService.getAIQuota());
  }, []);

  useEffect(() => {
    if (modalVisible) loadQuota();
  }, [modalVisible, loadQuota]);

  // حصة واحدة لكل مستويات المساعدة (ومشتركة مع صفحة المساعد)
  const remainingFor = (_lv: HelpLevel): number | null => (quota ? quota.remaining : null);

  // Build a prompt that matches the requested help level
  const buildPrompt = useCallback(
    (lv: HelpLevel) => buildAssistantPrompt(lv, assistantCtx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isChallenge, challengeTitle, challengeDescription, language, starterCode, userCode, testCases, hints, requirements, lastRun]
  );

  /** تشغيل الكود المقترح من الذكاء على اختبارات التحدي — الحكم للاختبارات لا للذكاء */
  const verifySuggestion = useCallback(
    async (text: string, lv: HelpLevel) => {
      setSuggestedCode(null);
      setVerification(null);
      if (!isChallenge || (lv !== 'fix' && lv !== 'solve')) return;
      const snippet = extractCode(text);
      if (!snippet) return;
      setSuggestedCode(snippet);
      if (!verifyCode) {
        setVerification({ status: 'unverified', reason: 'لا يمكن التحقق من هذا الكود هنا' });
        return;
      }
      setVerification({ status: 'checking' });
      try {
        const r = await verifyCode(snippet);
        if (r.serviceError) {
          setVerification({ status: 'unverified', reason: 'تعذّر تشغيل الاختبارات الآن (مشكلة اتصال)' });
        } else {
          setVerification({
            status: r.allPassed ? 'verified' : 'failed',
            passed: r.passedTests,
            total: r.totalTests,
            structural: r.mode === 'structural',
          });
        }
      } catch {
        setVerification({ status: 'unverified', reason: 'تعذّر تشغيل الاختبارات الآن' });
      }
    },
    [isChallenge, verifyCode]
  );

  const confirmApply = () => {
    if (!suggestedCode || !onApplyCode) return;
    const failed = verification?.status === 'failed';
    showAlert(
      'استبدال كودك؟',
      failed
        ? 'هذا الكود لم يجتز كل الاختبارات. سيُستبدل كودك الحالي به — هل تريد المتابعة؟'
        : 'سيُستبدل الكود الموجود في المحرر بهذا الكود. هل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استبدال',
          style: 'default',
          onPress: () => {
            onApplyCode(suggestedCode);
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const fetchHelp = useCallback(
    async (lv: HelpLevel, forceRefresh = false) => {
      const key = cacheKey(lv);
      setLevel(lv);
      setSuggestedCode(null);
      setVerification(null);

      // تتبّع الخطأ يحتاج نتيجة تشغيل حقيقية فاشلة — لا نترك الذكاء يخمّن
      if (lv === 'debug' && !hasFailedRun) {
        setExplanation(
          lastRun?.allPassed
            ? 'كودك اجتاز كل الاختبارات — لا يوجد خطأ لتتبّعه.'
            : 'شغّل الكود أولاً.\n\nتتبّع الخطأ يعتمد على نتيجة تشغيل حقيقية لكودك (الاختبار الفاشل أو رسالة الخطأ). اضغط "تشغيل الكود" ثم عد إلى هنا.'
        );
        return;
      }

      if (!forceRefresh && explanationCache[key]) {
        setExplanation(explanationCache[key]);
        verifySuggestion(explanationCache[key], lv);
        return;
      }

      const remaining = remainingFor(lv);
      if (remaining !== null && remaining <= 0) {
        setExplanation(
          `وصلت للحد اليومي لـ «${LEVELS.find((l) => l.id === lv)?.label}».\n\n` +
            'يتجدد الحد غداً. جرّب مستوى مساعدة آخر، أو راجع التلميحات الموجودة في التحدي.'
        );
        return;
      }

      setIsLoading(true);
      setExplanation('');

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          aiChatService.setUser(session.user.id);
          conversationsService.setUser(session.user.id);
        }

        const result = await aiChatService.sendMessage(
          buildPrompt(lv),
          isChallenge ? MODE_FOR_LEVEL[lv] : 'lesson-explain',
          [],
          isChallenge ? { challengeId } : {}
        );

        setExplanation(result.response);
        explanationCache[key] = result.response;
        verifySuggestion(result.response, lv);
        if (result.tokensUsed > 0) {
          await conversationsService.trackTokenUsage(result.tokensUsed);
        }
      } catch (error: any) {
        const message =
          error instanceof AIServiceError
            ? error.message
            : AI_UNAVAILABLE_MESSAGE;
        setExplanation(
          `${message}\n\n` +
            (isChallenge
              ? 'نصيحة: يمكنك استخدام زر "تلميحات" في التحدي للحصول على مساعدة فورية.'
              : 'نصيحة: راجع محتوى الدرس مرة أخرى للفهم الأفضل.')
        );
      } finally {
        setIsLoading(false);
        loadQuota();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [challengeId, buildPrompt, isChallenge, quota, loadQuota, hasFailedRun, lastRun, verifySuggestion]
  );

  const handleOpen = async () => {
    setModalVisible(true);
    if (!isChallenge) {
      await fetchHelp('explain');
    } else {
      setLevel(null);
      setExplanation('');
    }
  };

  const handleSelectLevel = (lv: HelpLevel) => {
    if (lv === 'solve' && !explanationCache[cacheKey('solve')]) {
      showAlert(
        'شرح الحل الكامل؟',
        'شرح الحل الكامل بالذكاء متاح بعد إظهار الحل (زر «إظهار الحل» في التحدي) أو بعد حلّه. تتعلم أكثر إذا جربت تلميحاً أولاً.',
        [
          {
            text: 'جرّب تلميحاً',
            style: 'cancel',
            onPress: () => fetchHelp('hint'),
          },
          {
            text: 'اعرض الحل',
            style: 'default',
            onPress: () => fetchHelp('solve'),
          },
        ]
      );
      return;
    }
    fetchHelp(lv);
  };

  const activeLevel = LEVELS.find((l) => l.id === level);

  return (
    <>
      {/* زر المساعد الذكي */}
      <TouchableOpacity
        style={styles.explainButton}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#7c3aed', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Ionicons
            name={isChallenge ? 'sparkles' : 'bulb'}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isChallenge ? 'مساعد التحدي الذكي' : 'شرح بالذكاء'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* مودال المساعدة */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            Platform.OS === 'android' && {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
            },
          ]}
        >
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.modalContainer,
              isWeb &&
                isLargeScreen && {
                  marginTop: 80,
                  marginHorizontal: 'auto',
                  maxWidth: 900,
                  width: '90%',
                  alignSelf: 'center',
                },
            ]}
          >
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.aiIcon}>
                    <MaterialIcons
                      name="auto-awesome"
                      size={24}
                      color="#a855f7"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>
                      {isChallenge
                        ? activeLevel?.label || 'كيف أساعدك؟'
                        : 'شرح ذكي'}
                    </Text>
                    <Text style={styles.modalSubtitle} numberOfLines={1}>
                      {challengeTitle}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerActions}>
                  {explanation && !isLoading && level && (
                    <TouchableOpacity
                      onPress={() => fetchHelp(level, true)}
                      style={styles.refreshButton}
                      accessibilityLabel="إعادة المحاولة"
                    >
                      <MaterialIcons name="refresh" size={22} color="#a855f7" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                    accessibilityLabel="إغلاق"
                  >
                    <MaterialIcons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* مستويات المساعدة */}
              {isChallenge && (
                <View style={styles.levelsGrid}>
                  {LEVELS.map((lv) => {
                    const rem = remainingFor(lv.id);
                    const active = level === lv.id;
                    return (
                      <TouchableOpacity
                        key={lv.id}
                        style={[
                          styles.levelChip,
                          active && {
                            borderColor: lv.color,
                            backgroundColor: `${lv.color}1f`,
                          },
                        ]}
                        onPress={() => handleSelectLevel(lv.id)}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={lv.icon} size={18} color={lv.color} />
                        <Text style={styles.levelLabel}>{lv.label}</Text>
                        <Text style={styles.levelDesc}>{lv.desc}</Text>
                        {rem !== null && (
                          <Text
                            style={[
                              styles.levelQuota,
                              rem === 0 && { color: '#f87171' },
                            ]}
                          >
                            {rem === 0
                              ? 'انتهى حد اليوم'
                              : `متبقي اليوم: ${rem}`}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Content */}
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text style={styles.loadingText}>جاري التحضير...</Text>
                    <Text style={styles.loadingSubtext}>
                      الذكاء الاصطناعي يحلل{' '}
                      {isChallenge ? 'التحدي وكودك' : 'الدرس'}
                    </Text>
                  </View>
                ) : explanation ? (
                  <Animated.View entering={FadeIn.delay(150)}>
                    <AIMessageRenderer content={explanation} isUser={false} />

                    {/* نتيجة تشغيل الكود المقترح على اختبارات التحدي */}
                    {suggestedCode && verification && (
                      <View
                        style={[
                          styles.verifyBox,
                          verification.status === 'verified' && styles.verifyOk,
                          verification.status === 'failed' && styles.verifyFail,
                        ]}
                      >
                        {verification.status === 'checking' ? (
                          <View style={styles.verifyRow}>
                            <ActivityIndicator size="small" color="#a855f7" />
                            <Text style={styles.verifyText}>
                              جاري تشغيل الكود المقترح على اختبارات التحدي...
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.verifyRow}>
                            <Ionicons
                              name={
                                verification.status === 'verified'
                                  ? 'shield-checkmark'
                                  : verification.status === 'failed'
                                    ? 'warning'
                                    : 'help-circle'
                              }
                              size={20}
                              color={
                                verification.status === 'verified'
                                  ? '#22c55e'
                                  : verification.status === 'failed'
                                    ? '#f87171'
                                    : '#f59e0b'
                              }
                            />
                            <Text style={styles.verifyText}>
                              {verification.status === 'verified'
                                ? `تم التحقق: الكود المقترح اجتاز ${verification.structural ? 'كل المتطلبات' : 'كل اختبارات التحدي'} (${verification.passed}/${verification.total})`
                                : verification.status === 'failed'
                                  ? `تنبيه: الكود المقترح لم يجتز كل الاختبارات (${verification.passed}/${verification.total}) — الذكاء قد يخطئ، راجعه قبل استخدامه`
                                  : `غير متحقق منه: ${'reason' in verification ? verification.reason : ''}`}
                            </Text>
                          </View>
                        )}
                        {onApplyCode && verification.status !== 'checking' && (
                          <TouchableOpacity style={styles.applyButton} onPress={confirmApply}>
                            <Ionicons name="code-download-outline" size={18} color="#fff" />
                            <Text style={styles.applyButtonText}>استخدم هذا الكود في المحرر</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {isChallenge && level !== 'solve' && (
                      <View style={styles.tipsContainer}>
                        <View style={styles.tipHeader}>
                          <Ionicons name="rocket" size={20} color="#10b981" />
                          <Text style={styles.tipTitle}>الخطوة التالية</Text>
                        </View>
                        <Text style={styles.tipText}>
                          جرّب تطبيق الفكرة بنفسك ثم شغّل الاختبارات. إذا بقيت
                          عالقاً، انتقل لمستوى المساعدة التالي.
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                ) : isChallenge ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="school-outline" size={40} color="#6b7280" />
                    <Text style={styles.loadingSubtext}>
                      اختر مستوى المساعدة. ننصح بالبدء بالتلميح — تتعلم أكثر
                      عندما تصل للحل بنفسك.
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Footer */}
              {!isLoading && (
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.tryButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.tryButtonText}>جربها بنفسك</Text>
                    <Ionicons name="arrow-forward" size={20} color="#a855f7" />
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  explainButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  levelChip: {
    flexGrow: 1,
    flexBasis: '46%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'flex-end',
    gap: 2,
  },
  levelLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  levelDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },
  levelQuota: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  verifyBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    gap: 10,
  },
  verifyOk: {
    borderColor: 'rgba(34, 197, 94, 0.4)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  verifyFail: {
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  verifyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  verifyText: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'right',
  },
  applyButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  tipText: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  tryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7',
  },
});
