/**
 * إظهار الحل الجاهز للتحدي — اختصار اختياري عبر إعلان Rewarded.
 *
 * - المحاولة بنفسك مجانية دائماً (بلا حد، بلا إعلان). التلميحات تظهر تدريجياً بعد الأخطاء.
 * - بعد محاولات كافية أو مدة معقولة (السيرفر يقرر): زر «إظهار الحل» → تأكيد واضح → إعلان → الحل.
 * - كشف الحل قبل حلّه: لا كوينات لهذا التحدي، ونصف XP عند حلّه. مشاهدة الإعلان لا تمنح أي مكافأة.
 * - من حلّ التحدي يرى الحل النموذجي للمقارنة بلا إعلان.
 * - الحل لا يوجد في التطبيق: يأتي من السيرفر (challenge_reveal_solution) بعد التحقق.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Surface, Text, Row, Button, CodeView, useTheme } from '@/design';
import { coinService, coinMessage } from '@/services/coinService';
import { watchRewardedAd, isRewardedAdsSupported } from '@/services/rewardedAds';

export interface ChallengeAttemptState {
  attempts?: number;
  failed_attempts?: number;
  solved?: boolean;
  revealed?: boolean;
  hint_level?: number;
  can_reveal?: boolean;
  reveal_needs_ad?: boolean;
  attempts_needed?: number;
  minutes_left?: number;
}

interface Props {
  challengeId: string;
  language: string;
  isCompleted: boolean;
  attemptState: ChallengeAttemptState | null;
  onAttemptState?: (s: ChallengeAttemptState) => void;
  onApplyCode?: (code: string) => void;
  /** يُستدعى بعد كشف الحل (لتحديث حالة الشاشة) */
  onRevealed?: () => void;
}

type Phase = 'idle' | 'confirm' | 'busy' | 'shown';

export default function SolutionReveal({
  challengeId,
  language,
  isCompleted,
  attemptState,
  onAttemptState,
  onApplyCode,
  onRevealed,
}: Props) {
  const t = useTheme();
  const [phase, setPhase] = useState<Phase>('idle');
  const [solution, setSolution] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const free = isCompleted || attemptState?.solved || attemptState?.revealed;
  const canReveal = free || attemptState?.can_reveal;

  const fetchSolution = async () => {
    const res = await coinService.revealSolution(challengeId);
    if (res.success && typeof res.solution === 'string') {
      setSolution(res.solution);
      setPhase('shown');
      onRevealed?.();
      return true;
    }
    if (res.state) onAttemptState?.(res.state);
    return false;
  };

  const handlePress = async () => {
    coinService.track('solution_button_tapped', { challenge_id: challengeId });
    setNote(null);
    setPhase('busy');
    if (await fetchSolution()) return;
    setPhase(canReveal ? 'confirm' : 'idle');
    if (!canReveal) setNote(coinMessage('try_first', { state: attemptState ?? {} }));
  };

  const handleWatch = async () => {
    setPhase('busy');
    setNote(null);
    const ad = await watchRewardedAd('solution', { challengeId });
    if (ad.success && ad.solutionUnlocked && (await fetchSolution())) return;
    setPhase('confirm');
    setNote(ad.message ?? 'تعذّر إظهار الحل الآن. حاول مرة أخرى.');
  };

  if (phase === 'shown' && solution) {
    return (
      <Surface padding={14}>
        <Row gap={8}>
          <Ionicons name="bulb-outline" size={18} color={t.colors.warningText} />
          <Text variant="label" weight="semibold">
            الحل النموذجي
          </Text>
        </Row>
        <Text variant="bodySm" tone="secondary" style={{ marginVertical: 8 }}>
          اقرأ الحل وافهم الفكرة، ثم جرّب كتابته بنفسك — هكذا تتعلم أكثر.
        </Text>
        <CodeView code={solution} language={language.toLowerCase()} />
        {onApplyCode && !isCompleted && <Button label="ضعه في المحرر" variant="ghost" icon="create-outline" onPress={() => onApplyCode(solution)} style={{ alignSelf: 'flex-start', marginTop: 8 }} />}
      </Surface>
    );
  }

  return (
    <Surface padding={14}>
      <Row gap={8}>
        <Ionicons name="eye-outline" size={18} color={t.colors.brandText} />
        <Text variant="label" weight="semibold">
          الحل الكامل
        </Text>
      </Row>
      {phase === 'confirm' && !free ? (
        <View style={{ gap: 10, marginTop: 8 }}>
          <Text variant="bodySm" tone="secondary">
            يظهر الحل بعد مشاهدة إعلان قصير. إذا أظهرته قبل أن تحل التحدي فلن تحصل على كوينات هذا التحدي، وستحصل على نصف XP عند حله. المحاولة بنفسك تبقى مجانية دائماً.
          </Text>
          {isRewardedAdsSupported() ? (
            <Button label="شاهد إعلاناً وأظهر الحل" icon="play-circle-outline" onPress={handleWatch} />
          ) : (
            <Text variant="caption" tone="muted">
              إظهار الحل بالإعلان متاح في تطبيق الهاتف. يمكنك متابعة المحاولة والتلميحات هنا.
            </Text>
          )}
          <Button label="سأحاول مرة أخرى" variant="ghost" onPress={() => setPhase('idle')} />
        </View>
      ) : (
        <View style={{ gap: 10, marginTop: 8 }}>
          <Text variant="bodySm" tone="secondary">
            {free ? 'حللت التحدي — قارن حلك بالحل النموذجي.' : canReveal ? 'إذا علقت، يمكنك إظهار الحل الكامل.' : 'حاول بنفسك أولاً: بعد كل محاولة يظهر تلميح جديد، ويمكنك إظهار الحل بعد عدة محاولات.'}
          </Text>
          <Button label={free ? 'اعرض الحل النموذجي' : 'إظهار الحل'} variant="secondary" onPress={handlePress} loading={phase === 'busy'} style={{ alignSelf: 'flex-start' }} />
        </View>
      )}
      {!!note && (
        <Text variant="caption" tone="warning" style={{ marginTop: 8 }}>
          {note}
        </Text>
      )}
    </Surface>
  );
}
