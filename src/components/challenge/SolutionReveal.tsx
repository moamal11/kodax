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
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CodeBlock } from '@/components/ui/CodeBlock';
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
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="bulb" size={18} color="#FBBF24" />
          <Text style={styles.title}>الحل النموذجي</Text>
        </View>
        <Text style={styles.text}>
          اقرأ الحل وافهم الفكرة، ثم جرّب كتابته بنفسك — هكذا تتعلم أكثر.
        </Text>
        <CodeBlock code={solution} language={language.toLowerCase()} maxHeight={320} />
        {onApplyCode && !isCompleted && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => onApplyCode(solution)}>
            <Ionicons name="create-outline" size={16} color="#C4B5FD" />
            <Text style={styles.secondaryText}>ضعه في المحرر</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={18} color="#A78BFA" />
        <Text style={styles.title}>الحل الكامل</Text>
      </View>

      {phase === 'confirm' && !free ? (
        <>
          <Text style={styles.text}>
            يظهر الحل بعد مشاهدة إعلان قصير. إذا أظهرته قبل أن تحل التحدي فلن تحصل على
            كوينات هذا التحدي، وستحصل على نصف XP عند حله. المحاولة بنفسك تبقى مجانية دائماً.
          </Text>
          {isRewardedAdsSupported() ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleWatch}>
              <Ionicons name="play-circle" size={18} color="#1F2937" />
              <Text style={styles.primaryText}>شاهد إعلاناً وأظهر الحل</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.note}>
              إظهار الحل بالإعلان متاح في تطبيق الهاتف. يمكنك متابعة المحاولة والتلميحات هنا.
            </Text>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setPhase('idle')}>
            <Text style={styles.secondaryText}>سأحاول مرة أخرى</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.text}>
            {free
              ? 'حللت التحدي — يمكنك مقارنة حلك بالحل النموذجي.'
              : canReveal
                ? 'إذا علقت، يمكنك إظهار الحل الكامل.'
                : 'حاول بنفسك أولاً: بعد كل محاولة يظهر لك تلميح جديد، ويمكنك إظهار الحل بعد عدة محاولات.'}
          </Text>
          <TouchableOpacity
            style={[styles.outlineBtn, phase === 'busy' && { opacity: 0.6 }]}
            onPress={handlePress}
            disabled={phase === 'busy'}
          >
            {phase === 'busy' ? (
              <ActivityIndicator color="#C4B5FD" />
            ) : (
              <Text style={styles.outlineText}>{free ? 'اعرض الحل النموذجي' : 'إظهار الحل'}</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    gap: 10,
  },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  title: { color: '#E9D5FF', fontSize: 15, fontWeight: '700' },
  text: { color: '#D1D5DB', fontSize: 13, lineHeight: 21, textAlign: 'right' },
  note: { color: '#FCD34D', fontSize: 12, lineHeight: 19, textAlign: 'right' },
  primaryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FBBF24',
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryText: { color: '#1F2937', fontWeight: '700', fontSize: 14 },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.5)',
  },
  outlineText: { color: '#C4B5FD', fontWeight: '600', fontSize: 14 },
  secondaryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  secondaryText: { color: '#C4B5FD', fontSize: 13 },
});
