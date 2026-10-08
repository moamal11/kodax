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

import { Sheet, Surface, Button, Row, Text as DText, useTheme } from '@/design';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
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
  const t = useTheme();
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
      {/* مدخل هادئ للمساعد: لا يزاحم المحتوى */}
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={isChallenge ? 'مساعد التحدي الذكي: تلميح، شرح، تتبع الخطأ' : 'اشرح لي هذا الدرس بالذكاء'}
        style={(s: any) => ({
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: t.colors.border,
          backgroundColor: s.pressed || s.hovered ? t.colors.surfacePressed : t.colors.surface,
        })}
      >
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sparkles" size={18} color={t.colors.brandText} />
        </View>
        <View style={{ flex: 1 }}>
          <DText variant="label" weight="semibold">
            {isChallenge ? 'علقت؟ اسأل مساعد Kodax' : 'ما وضحت فكرة؟ اسأل مساعد Kodax'}
          </DText>
          <DText variant="caption" tone="muted">
            {isChallenge ? 'تلميح، شرح المشكلة، تتبّع الخطأ، أو الحل' : 'شرح مبسّط لهذا الدرس بأمثلة'}
          </DText>
        </View>
        <Ionicons name="chevron-back" size={18} color={t.colors.textMuted} />
      </Pressable>

      <Sheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={isChallenge ? activeLevel?.label || 'كيف أساعدك؟' : 'شرح ذكي'}
        maxWidth={760}
        footer={
          !isLoading ? (
            <Row gap={8}>
              {explanation && level ? <Button label="إجابة ثانية" variant="ghost" icon="refresh" onPress={() => fetchHelp(level, true)} /> : null}
              <Button label="جربها بنفسك" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
            </Row>
          ) : undefined
        }
      >
        <DText variant="caption" tone="muted" numberOfLines={1} style={{ marginBottom: 10 }}>
          {challengeTitle}
        </DText>
        {isChallenge && (
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {LEVELS.map((lv) => {
              const rem = remainingFor(lv.id);
              const active = level === lv.id;
              return (
                <Pressable
                  key={lv.id}
                  onPress={() => handleSelectLevel(lv.id)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active, disabled: isLoading }}
                  accessibilityLabel={`${lv.label}: ${lv.desc}${rem !== null ? `، متبقي اليوم ${rem}` : ''}`}
                  style={(s: any) => ({
                    flexGrow: 1,
                    flexBasis: 150,
                    gap: 2,
                    padding: 10,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: active ? t.colors.brand : t.colors.border,
                    backgroundColor: active ? t.colors.brandSoft : s.hovered ? t.colors.surfacePressed : t.colors.surface,
                  })}
                >
                  <Row gap={6} style={{ justifyContent: 'flex-start' }}>
                    <Ionicons name={lv.icon} size={16} color={active ? t.colors.brandText : t.colors.textSecondary} />
                    <DText variant="label" weight="semibold">
                      {lv.label}
                    </DText>
                  </Row>
                  <DText variant="caption" tone="muted">
                    {lv.desc}
                  </DText>
                  {rem !== null && (
                    <DText variant="caption" tone={rem === 0 ? 'danger' : 'muted'}>
                      {rem === 0 ? 'انتهى حد اليوم' : `متبقي اليوم: ${rem}`}
                    </DText>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 28, gap: 8 }} accessibilityLabel="جارٍ التحضير">
            <ActivityIndicator size="large" color={t.colors.brand} />
            <DText variant="bodySm" tone="muted" align="center">
              المساعد يقرأ {isChallenge ? 'التحدي وكودك' : 'الدرس'}…
            </DText>
          </View>
        ) : explanation ? (
          <Animated.View entering={FadeIn.delay(100)} style={{ gap: 12 }}>
            <AIMessageRenderer content={explanation} isUser={false} />
            {suggestedCode && verification && (
              <Surface variant={verification.status === 'verified' ? 'success' : verification.status === 'failed' ? 'danger' : 'warning'} padding={12}>
                {verification.status === 'checking' ? (
                  <Row gap={8}>
                    <ActivityIndicator size="small" color={t.colors.brand} />
                    <DText variant="bodySm">نشغّل الكود المقترح على اختبارات التحدي…</DText>
                  </Row>
                ) : (
                  <Row gap={8} align="flex-start">
                    <Ionicons
                      name={verification.status === 'verified' ? 'shield-checkmark' : verification.status === 'failed' ? 'warning' : 'help-circle'}
                      size={18}
                      color={verification.status === 'verified' ? t.colors.successText : verification.status === 'failed' ? t.colors.dangerText : t.colors.warningText}
                    />
                    <DText variant="bodySm" style={{ flex: 1 }}>
                      {verification.status === 'verified'
                        ? `تم التحقق: الكود المقترح اجتاز ${verification.structural ? 'كل المتطلبات' : 'كل اختبارات التحدي'} (${verification.passed} من ${verification.total})`
                        : verification.status === 'failed'
                          ? `تنبيه: الكود المقترح لم يجتز كل الاختبارات (${verification.passed} من ${verification.total}) — الذكاء قد يخطئ، راجعه قبل استخدامه`
                          : `غير متحقق منه: ${'reason' in verification ? verification.reason : ''}`}
                    </DText>
                  </Row>
                )}
                {onApplyCode && verification.status !== 'checking' && <Button label="استخدم هذا الكود في المحرر" icon="code-download-outline" size="sm" onPress={confirmApply} style={{ alignSelf: 'flex-start', marginTop: 10 }} />}
              </Surface>
            )}
            {isChallenge && level !== 'solve' && (
              <DText variant="bodySm" tone="secondary">
                الخطوة التالية: طبّق الفكرة بنفسك ثم شغّل الاختبارات. إذا بقيت عالقاً، جرّب مستوى المساعدة التالي.
              </DText>
            )}
          </Animated.View>
        ) : isChallenge ? (
          <DText variant="bodySm" tone="muted" align="center" style={{ paddingVertical: 16 }}>
            اختر مستوى المساعدة. ابدأ بالتلميح — تتعلم أكثر عندما تصل للحل بنفسك.
          </DText>
        ) : null}
      </Sheet>
    </>
  );
};


