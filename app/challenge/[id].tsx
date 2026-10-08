/**
 * صفحة التحدي: المطلوب + المحرر + التشغيل + التحقق على السيرفر.
 * Desktop: عمودان (المهمة | المحرر والنتائج). الهاتف: عمود واحد بترتيب العمل.
 * الإكمال يوثَّق على السيرفر (verify-challenge) ويمنح XP مرة واحدة؛ النتيجة داخل الصفحة مع شرارات XP.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ALL_CHALLENGES, getChallengeAccessType, getChallengeRequiredCourseId, getCourseTitleById, isCourseAccessible } from '@/constants/courseData';
import { quickValidate, validateChallenge } from '@/services/challengeValidator';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useCoins } from '@/contexts/CoinsContext';
import { hybridSyncService } from '@/services/hybridSyncService';
import { loadChallengeDraft, saveChallengeDraft } from '@/services/challengeDraft';
import { submitChallengeSolution } from '@/services/challengeSubmissionService';
import { ChallengeResults, ChallengeRequirements, type ChallengeRunSummary } from '@/components/challenge/ChallengeResults';
import { ExplainWithAI } from '@/components/ai';
import SolutionReveal, { type ChallengeAttemptState } from '@/components/challenge/SolutionReveal';
import { coinService } from '@/services/coinService';
import { badgeService } from '@/services/badgeService';
import { notificationService } from '@/services/notificationService';
import { progressService } from '@/services/progressService';
import { useBadges } from '@/contexts/BadgeContext';
import { supabase } from '@/lib/supabase';
import { Screen, AppBar, Text, Row, Col, Surface, Button, IconButton, Tag, EmptyState, useTheme, useBreakpoint, useReducedMotion } from '@/design';
import { XpMeter } from '@/features/rewards/XpMeter';
import { useRewards } from '@/features/rewards/RewardLayer';
import { challengeCategory } from '@/features/learn/ChallengesBrowser';
import { languageLabel } from '@/features/community/SnippetCard';

interface MobileWebEditorRef {
  setCodeExternal: (code: string) => void;
  replaceWord: (word: string) => void;
  focus: () => void;
}
let MobileWebEditor: any = null;
let CodeMirrorEditor: any = null;
if (Platform.OS !== 'web') {
  try {
    MobileWebEditor = require('@/components/editor/MobileWebEditor').default;
  } catch {
    MobileWebEditor = null;
  }
} else {
  try {
    CodeMirrorEditor = require('@/components/editor/CodeMirrorEditor').default;
  } catch {
    CodeMirrorEditor = null;
  }
}

function cmLanguage(lang: string): string {
  const map: Record<string, string> = { python: 'python', javascript: 'javascript', typescript: 'typescript', java: 'java', 'c++': 'cpp', 'c#': 'csharp', html: 'html', css: 'css', react: 'tsx', sql: 'sql' };
  return map[lang.toLowerCase()] || 'javascript';
}
function fileName(lang: string) {
  const l = lang.toLowerCase();
  return l === 'python' ? 'main.py' : l === 'javascript' ? 'main.js' : l === 'java' ? 'Main.java' : l === 'c++' ? 'main.cpp' : l === 'c#' ? 'Program.cs' : l === 'typescript' ? 'main.ts' : `code.${l}`;
}
const DIFF = { easy: { label: 'سهل', tone: 'success' as const }, medium: { label: 'متوسط', tone: 'warning' as const }, hard: { label: 'صعب', tone: 'danger' as const } };

type Outcome =
  | { kind: 'solved'; xp: number; coins: number; first: boolean }
  | { kind: 'not_verified'; passed: number; total: number }
  | { kind: 'error'; message: string }
  | { kind: 'guest' };

export default function ChallengeScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { refreshProfile } = useApp();
  const { unlockedCourses, refresh: refreshCoins } = useCoins();
  const { checkBadges } = useBadges();
  const { celebrate } = useRewards();
  const reduced = useReducedMotion();
  const { isDesktop } = useBreakpoint();
  const editorRef = useRef<MobileWebEditorRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const resultRef = useRef<View>(null);

  const challenge = ALL_CHALLENGES.find((c) => c.id === id);
  const [code, setCode] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<ChallengeRunSummary | null>(null);
  const [runCode, setRunCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [attemptState, setAttemptState] = useState<ChallengeAttemptState | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(false);

  useEffect(() => {
    setOutcome(null);
    setSummary(null);
    setRunCode(null);
    setNotice(null);
    setHintLevel(0);
    setHintsUsed(false);
    if (!user?.id || !id) return;
    (async () => {
      await hybridSyncService.setUser(user.id);
      setAlreadyDone(!!(await hybridSyncService.checkLessonCompleted(id)));
      const st = await coinService.challengeAttemptState(id);
      if (st.success) applyAttemptState(st as ChallengeAttemptState);
      coinService.track('challenge_opened', { challenge_id: id });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id]);

  // المسودة: استعادة ثم حفظ تلقائي
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
  useEffect(() => {
    if (!challenge || !draftLoaded) return;
    const timer = setTimeout(() => saveChallengeDraft(user?.id, challenge.id, code, challenge.starterCode ?? ''), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, draftLoaded]);

  const locked = useMemo(() => {
    if (!challenge || getChallengeAccessType(challenge) === 'free') return null;
    const req = getChallengeRequiredCourseId(challenge);
    return req && !isCourseAccessible(req, unlockedCourses) ? req : null;
  }, [challenge, unlockedCourses]);

  const nextChallenge = useMemo(() => {
    if (!challenge) return undefined;
    const cat = challengeCategory(challenge);
    const list = ALL_CHALLENGES.filter((c) => challengeCategory(c) === cat);
    return list[list.findIndex((c) => c.id === challenge.id) + 1];
  }, [challenge?.id]);

  function applyAttemptState(st: ChallengeAttemptState) {
    setAttemptState(st);
    if (!challenge) return;
    const level = Math.min(st.hint_level ?? 0, challenge.hints.length);
    if (level > 0) setHintLevel((h) => Math.max(h, level));
  }

  const validateOptions = challenge ? { checks: challenge.checks, entryFunction: challenge.entryFunction, validation: challenge.validation, prelude: challenge.prelude } : undefined;

  const verifyAICode = async (candidate: string): Promise<ChallengeRunSummary> => {
    const r = await validateChallenge(candidate, challenge!.starterCode, challenge!.language, challenge!.testCases, validateOptions);
    return { results: r.results, passedTests: r.passedTests, totalTests: r.totalTests, allPassed: r.allPassed, serviceError: r.serviceError, mode: r.mode };
  };
  const applyCode = (c: string) => {
    setCode(c);
    editorRef.current?.setCodeExternal(c);
    setSummary(null);
  };

  const submit = useCallback(async () => {
    if (!challenge) return;
    if (!user?.id) {
      setOutcome({ kind: 'guest' });
      return;
    }
    setSaving(true);
    let sub: Awaited<ReturnType<typeof submitChallengeSolution>>;
    try {
      sub = await submitChallengeSolution(challenge.id, code);
    } finally {
      setSaving(false);
    }
    if (!sub.ok) {
      setOutcome({ kind: 'error', message: sub.message });
      return;
    }
    if (!sub.verified) {
      if (sub.attempts) applyAttemptState(sub.attempts);
      setRunCode(code);
      setSummary({ results: sub.results, passedTests: sub.passedTests, totalTests: sub.totalTests, allPassed: false, mode: sub.mode });
      setOutcome({ kind: 'not_verified', passed: sub.passedTests, total: sub.totalTests });
      return;
    }
    const first = sub.completion.firstTime;
    const xp = first ? sub.completion.xpAwarded || 0 : 0;
    const coins = sub.coins?.success && !sub.coins.duplicate ? sub.coins.reward ?? 0 : 0;
    setAlreadyDone(true);
    setOutcome({ kind: 'solved', xp, coins, first });
    if (coins > 0) refreshCoins().catch(() => undefined);
    if (xp > 0) {
      // XP الإجمالي من السيرفر بعد المنح
      const { data } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
      const after = Number((data as any)?.xp);
      setTimeout(() => {
        if (Number.isFinite(after)) celebrate({ key: `challenge:${challenge.id}`, xpBefore: after - xp, xpAfter: after, sourceRef: resultRef });
        setTimeout(() => refreshProfile(), 1800);
      }, reduced ? 0 : 280);
    }
    if (first) {
      try {
        await progressService.completeChallenge(challenge.id, challenge.points, code, hintLevel);
        await badgeService.incrementChallengeStreak();
        if (!hintsUsed) await badgeService.incrementNoHintCount();
        if (challenge.difficulty === 'hard') await badgeService.incrementHardChallengeCount();
        await notificationService.notifyChallengeCompleted(challenge.id, challenge.points);
        await checkBadges();
      } catch {
        // السجل المحلي للشارات لا يؤثر على السيرفر
      }
    }
  }, [challenge, user?.id, code, hintLevel, hintsUsed, celebrate, refreshProfile, refreshCoins, checkBadges, reduced]);

  const run = async () => {
    if (!challenge) return;
    Keyboard.dismiss();
    setNotice(null);
    setOutcome(null);
    const quick = quickValidate(code, challenge.starterCode, challenge.language);
    if (!quick.valid) {
      setNotice(quick.message);
      return;
    }
    setRunning(true);
    setSummary(null);
    try {
      const r = await validateChallenge(code, challenge.starterCode, challenge.language, challenge.testCases, validateOptions);
      setRunCode(code);
      setSummary({ results: r.results, passedTests: r.passedTests, totalTests: r.totalTests, allPassed: r.allPassed, serviceError: r.serviceError, mode: r.mode });
      if (r.allPassed) {
        // نجاح محلي → تحقق نهائي على السيرفر (يعيد كل الاختبارات المخفية أيضاً)
        await submit();
      } else if (user?.id && !r.serviceError) {
        coinService.recordChallengeAttempt(challenge.id, r.passedTests, r.totalTests).then((st) => st.success && applyAttemptState(st as ChallengeAttemptState));
      }
    } catch {
      setSummary({ results: [{ passed: false, message: 'حدث خطأ غير متوقع أثناء التحقق — كودك محفوظ، حاول مرة أخرى', kind: 'service_error' } as any], passedTests: 0, totalTests: 1, allPassed: false, serviceError: true });
    } finally {
      setRunning(false);
    }
  };

  if (!challenge) {
    return (
      <Screen header={<AppBar title="التحدي" fallback={'/learn?tab=challenges' as any} />}>
        <EmptyState icon="alert-circle-outline" title="التحدي غير موجود" body="ممكن الرابط قديم أو التحدي تغيّر اسمه." action="كل التحديات" onAction={() => router.replace('/learn?tab=challenges' as any)} />
      </Screen>
    );
  }
  if (locked) {
    return (
      <Screen header={<AppBar title={challenge.title} fallback={'/learn?tab=challenges' as any} />}>
        <EmptyState
          icon="lock-closed-outline"
          title="هذا التحدي مقفل حالياً"
          body={`جزء من دورة «${getCourseTitleById(locked)}»، ويُفتح مجاناً عندما تصل لهذه الدورة في مسارك.`}
          action="عرض الدورة"
          onAction={() => router.replace(`/course/${locked}` as any)}
          secondary="كل التحديات"
          onSecondary={() => router.replace('/learn?tab=challenges' as any)}
        />
      </Screen>
    );
  }

  const d = DIFF[challenge.difficulty] ?? DIFF.easy;
  const visibleTests = challenge.testCases.filter((tc: any) => !tc.hidden);
  const hiddenCount = challenge.testCases.length - visibleTests.length;
  const stale = runCode !== null && runCode !== code;
  const busy = running || saving;

  const task = (
    <Col gap={14}>
      <View style={{ gap: 8 }}>
        <Row gap={6} style={{ justifyContent: 'flex-start' }} wrap>
          <Tag label={languageLabel(challenge.language) || challenge.language} />
          <Tag label={d.label} tone={d.tone} />
          <Tag label={`+${challenge.points} XP`} tone="xp" />
          {alreadyDone && <Tag label="محلول" tone="success" icon="checkmark" />}
        </Row>
        <Text variant="title" accessibilityRole="header">
          {challenge.title}
        </Text>
        <Text variant="body" tone="secondary">
          {challenge.description}
        </Text>
      </View>
      {visibleTests.length > 0 && challenge.validation !== 'structural' && (
        <Surface padding={12}>
          <Text variant="label" weight="semibold" style={{ marginBottom: 6 }}>
            أمثلة الاختبار
          </Text>
          {visibleTests.slice(0, 3).map((tc: any, i: number) => (
            <View key={i} style={{ marginTop: i ? 8 : 0, gap: 2 }}>
              {!!tc.description && (
                <Text variant="caption" tone="muted">
                  {tc.description}
                </Text>
              )}
              <View style={{ backgroundColor: t.colors.codeBg, borderRadius: t.radius.sm, padding: 8, borderWidth: 1, borderColor: t.colors.codeBorder }}>
                {!!tc.input && (
                  <Text mono ltr variant="caption" style={{ color: t.colors.codeMuted }}>
                    {`in:  ${tc.input}`}
                  </Text>
                )}
                <Text mono ltr variant="caption" style={{ color: t.colors.codeText }}>
                  {`out: ${tc.expectedOutput}`}
                </Text>
              </View>
            </View>
          ))}
          {hiddenCount > 0 && (
            <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
              + {hiddenCount} اختبارات مخفية يتحقق منها السيرفر
            </Text>
          )}
        </Surface>
      )}
      {!!challenge.checks?.length && <ChallengeRequirements checks={challenge.checks} />}
      {challenge.hints.length > 0 && (
        <Surface padding={12}>
          <Row justify="space-between">
            <Row gap={6}>
              <Ionicons name="bulb-outline" size={16} color={t.colors.warningText} />
              <Text variant="label" weight="semibold">
                تلميحات
              </Text>
            </Row>
            <Text variant="caption" tone="muted">
              {hintLevel} من {challenge.hints.length}
            </Text>
          </Row>
          {challenge.hints.slice(0, hintLevel).map((h, i) => (
            <Row key={i} gap={8} align="flex-start" style={{ marginTop: 8 }}>
              <Text variant="caption" tone="warning" weight="bold" ltr>
                {i + 1}
              </Text>
              <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                {h}
              </Text>
            </Row>
          ))}
          {hintLevel === 0 && (
            <Text variant="caption" tone="muted" style={{ marginTop: 6 }}>
              تظهر التلميحات تدريجياً بعد أول محاولة غير ناجحة — بلا أي خصم.
            </Text>
          )}
          {hintLevel > 0 && hintLevel < challenge.hints.length && (
            <Button
              label="تلميح آخر"
              variant="ghost"
              size="sm"
              onPress={() => {
                setHintsUsed(true);
                setHintLevel((h) => Math.min(challenge.hints.length, h + 1));
              }}
              style={{ alignSelf: 'flex-start', marginTop: 6 }}
            />
          )}
        </Surface>
      )}
    </Col>
  );

  const editor = (
    <View style={{ borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.codeBorder, overflow: 'hidden', backgroundColor: t.colors.codeBg }}>
      <Row justify="space-between" style={{ paddingHorizontal: 6, height: 40, borderBottomWidth: 1, borderBottomColor: t.colors.codeBorder }}>
        <IconButton
          icon="refresh"
          label="إرجاع الكود الابتدائي"
          size={18}
          onPress={() => {
            setCode(challenge.starterCode);
            editorRef.current?.setCodeExternal(challenge.starterCode);
          }}
        />
        <Text mono variant="caption" ltr style={{ color: t.colors.codeMuted, paddingHorizontal: 8 }}>
          {fileName(challenge.language)}
        </Text>
      </Row>
      <View style={{ height: isDesktop ? 380 : 300 }}>
        {!draftLoaded ? null : Platform.OS !== 'web' && MobileWebEditor ? (
          <MobileWebEditor ref={editorRef} initialCode={code || challenge.starterCode || ''} language={cmLanguage(challenge.language)} onChange={setCode} />
        ) : CodeMirrorEditor ? (
          <CodeMirrorEditor code={code} language={cmLanguage(challenge.language)} onChange={setCode} height={isDesktop ? 380 : 300} />
        ) : (
          <TextInput
            value={code}
            onChangeText={setCode}
            multiline
            accessibilityLabel="محرر الكود"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, color: t.colors.codeText, fontFamily: t.font.mono, fontSize: 14, padding: 14, textAlignVertical: 'top', textAlign: 'left', writingDirection: 'ltr' }}
          />
        )}
      </View>
    </View>
  );

  const actions = (
    <Col gap={8}>
      <Button label={running ? 'جارٍ التشغيل…' : saving ? 'جارٍ التحقق على السيرفر…' : 'شغّل وتحقق'} icon="play" variant="success" size="lg" onPress={run} loading={busy} full />
      {!!notice && (
        <Text variant="bodySm" tone="warning" accessibilityLiveRegion="polite">
          {notice}
        </Text>
      )}
    </Col>
  );

  const result = (
    <>
      {outcome?.kind === 'solved' && (
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(260)}>
          <Surface variant="success" padding={16} accessibilityLiveRegion="polite">
            <Row gap={12}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="heading">{outcome.first ? 'حللت التحدي!' : 'حللته مجدداً'}</Text>
                <Text variant="bodySm" tone="secondary">
                  {outcome.first ? `تحقق السيرفر من كل الاختبارات${outcome.coins ? `، وكسبت ${outcome.coins} كوين` : ''}.` : 'محلول من قبل، فلا XP إضافية.'}
                </Text>
              </View>
              {outcome.xp > 0 && (
                <View ref={resultRef} collapsable={false} style={{ paddingHorizontal: 12, height: 40, borderRadius: 12, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="heading" weight="bold" tone="xp" ltr>
                    +{outcome.xp} XP
                  </Text>
                </View>
              )}
            </Row>
            <Row gap={8} style={{ marginTop: 12 }} wrap>
              {nextChallenge && <Button label="التحدي التالي" icon="arrow-back" iconPosition="end" onPress={() => router.replace(`/challenge/${nextChallenge.id}` as any)} />}
              <Button label="كل التحديات" variant="ghost" onPress={() => router.replace('/learn?tab=challenges' as any)} />
            </Row>
          </Surface>
        </Animated.View>
      )}
      {outcome?.kind === 'not_verified' && (
        <Surface variant="warning" padding={14}>
          <Text variant="label" tone="warning">
            لم يجتز التحقق النهائي
          </Text>
          <Text variant="bodySm" tone="secondary">
            على السيرفر نجح {outcome.passed} من {outcome.total}. راجع النتائج ثم أعد المحاولة.
          </Text>
        </Surface>
      )}
      {outcome?.kind === 'error' && (
        <Surface variant="warning" padding={14}>
          <Text variant="label" tone="warning">
            لم يُحفظ الإكمال بعد
          </Text>
          <Text variant="bodySm" tone="secondary">
            {outcome.message}
          </Text>
          <Button label="أعد الإرسال" variant="secondary" size="sm" onPress={submit} style={{ alignSelf: 'flex-start', marginTop: 8 }} loading={saving} />
        </Surface>
      )}
      {outcome?.kind === 'guest' && (
        <Surface variant="brand" padding={14}>
          <Text variant="label">أحسنت! سجّل الدخول ليُحفظ حلك وتحصل على XP.</Text>
        </Surface>
      )}
      {summary && (
        <Animated.View entering={reduced ? undefined : FadeIn}>
          <ChallengeResults summary={summary} stale={stale} />
        </Animated.View>
      )}
    </>
  );

  const helpers = (
    <Col gap={14}>
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
        lastRun={summary && runCode === code ? summary : null}
        verifyCode={verifyAICode}
        onApplyCode={applyCode}
      />
      <SolutionReveal challengeId={challenge.id} language={challenge.language} isCompleted={alreadyDone} attemptState={attemptState} onAttemptState={setAttemptState} onApplyCode={applyCode} />
    </Col>
  );

  return (
    <Screen
      width={isDesktop ? 'wide' : 'content'}
      scrollRef={scrollRef}
      header={<AppBar title="تحدي" subtitle={challenge.title} fallback={'/learn?tab=challenges' as any} actions={<XpMeter />} border />}
    >
      {isDesktop ? (
        <Row align="flex-start" gap={24} style={{ paddingTop: 8 }}>
          <Col gap={16} style={{ width: 420 }}>
            {task}
            {helpers}
          </Col>
          <Col gap={12} flex={1}>
            {editor}
            {actions}
            {result}
          </Col>
        </Row>
      ) : (
        <Col gap={14} style={{ paddingTop: 4 }}>
          {task}
          {editor}
          {actions}
          {result}
          {helpers}
        </Col>
      )}
    </Screen>
  );
}
