import { AchievementSeal } from '@/features/rewards/JourneyVisuals';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Surface, Col, Row, Text, Button, ProgressBar, ListSkeleton, Tag, useTheme } from '@/design';
import { showAlert } from '@/utils/crossPlatformAlert';
import { CertificateLevel, CERTIFICATE_LEVEL_CONFIG, EligibilityResult, CertificateSummaryItem } from '@/types/certificate';
import CertificateAwardModal from './CertificateAwardModal';
import { getChallengesByCourse, ALL_COURSES } from '@/constants/courseData';
interface CertificateProgressCardProps {
  fieldId: string;
  fieldName: string;
  fieldNameAr?: string;
  currentCertificate: CertificateSummaryItem | null;
  silverEligibility: EligibilityResult | null;
  goldEligibility: EligibilityResult | null;
  platinumEligibility: EligibilityResult | null;
  canClaim: boolean;
  claimableLevel: CertificateLevel | null;
  isLoading: boolean;
  isIssuing: boolean;
  onIssueCertificate: (level: CertificateLevel) => Promise<any>;
}

export default function CertificateProgressCard(p: CertificateProgressCardProps) {
  const t = useTheme();
  const [awarded, setAwarded] = useState<{ id: string; level: CertificateLevel; next: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const levels: CertificateLevel[] = ['silver', 'gold', 'platinum'];
  const eligibility = { silver: p.silverEligibility, gold: p.goldEligibility, platinum: p.platinumEligibility };
  const current = p.currentCertificate?.status === 'valid' ? p.currentCertificate.level : null;
  const next = p.claimableLevel ?? levels[levels.indexOf(current as CertificateLevel) + 1];
  const goal = next ? eligibility[next] : p.platinumEligibility;
  const issue = async () => {
    if (!p.claimableLevel || p.isIssuing) return;
    setError(null);
    try {
      const r = await p.onIssueCertificate(p.claimableLevel);
      const id = r?.certificate?.id || r?.certificate_id;
      if (r?.success && id) setAwarded({ id, level: p.claimableLevel, next: r.next_level });
      else setError(r?.error || 'لم تصدر الشهادة. حاول مرة أخرى.');
    } catch (e: any) {
      setError(e?.message || 'تعذّر إصدار الشهادة.');
    }
  };
  if (p.isLoading)
    return (
      <Surface padding={16}>
        <ListSkeleton rows={1} />
      </Surface>
    );
  return (
    <>
      <Surface padding={18}>
        <Col gap={14}>
          <Row gap={10}>
            <AchievementSeal icon="workspace-premium" earned={!!current} size={54} />
            <Col flex={1} gap={2}>
              <Text variant="heading">شهادة المسار</Text>
              <Text variant="bodySm" tone="secondary">
                {p.fieldNameAr || p.fieldName}
              </Text>
            </Col>
          </Row>
          <Row gap={8} wrap>
            {levels.map((level) => (
              <Tag
                key={level}
                label={`${CERTIFICATE_LEVEL_CONFIG[level].labelAr}${level === current ? ' · مكتسبة' : eligibility[level]?.eligible ? ' · مؤهل' : ''}`}
                tone={level === current ? 'success' : level === next ? 'brand' : 'muted'}
              />
            ))}
          </Row>
          {goal && (
            <Col gap={10}>
              <Text variant="label" weight="semibold">
                {next ? `خطوتك التالية: ${CERTIFICATE_LEVEL_CONFIG[next].labelAr}` : 'أكملت أعلى مستوى'}
              </Text>
              <Text variant="bodySm" tone="secondary">
                التقدم الحالي في المسار كله، وليس هذه الدورة وحدها.
              </Text>
              <Row justify="space-between" gap={8}>
                <Text variant="bodySm">الدروس</Text>
                <Text variant="bodySm" ltr>
                  {goal.progress.lessons_completed} / {goal.progress.lessons_total}
                </Text>
              </Row>
              <ProgressBar value={goal.progress.lessons_percent / 100} label="دروس المسار" />
              <Row justify="space-between" gap={8}>
                <Text variant="bodySm">التحديات</Text>
                <Text variant="bodySm" ltr>
                  {goal.progress.challenges_completed} / {goal.progress.challenges_total}
                </Text>
              </Row>
              <ProgressBar value={goal.progress.challenges_percent / 100} label="تحديات المسار" />
              {!p.canClaim &&
                next &&
                goal.reasons.map((reason) => (
                  <Text key={reason} variant="bodySm" tone="secondary">
                    • {reason}
                  </Text>
                ))}
            </Col>
          )}
          {error && (
            <Text variant="bodySm" tone="danger" accessibilityRole="alert">
              {error}
            </Text>
          )}
          {p.canClaim && p.claimableLevel && (
            <Button label={`استلم الشهادة ${CERTIFICATE_LEVEL_CONFIG[p.claimableLevel].labelAr}`} icon="ribbon-outline" loading={p.isIssuing} onPress={issue} />
          )}
          {p.currentCertificate && (
            <Button label="عرض الشهادة الحالية" variant="secondary" onPress={() => router.push(`/certificate/${p.currentCertificate!.id}` as any)} />
          )}
          <Button label={details ? 'إخفاء تفاصيل التحديات' : 'تفاصيل التحديات حسب الدورة'} variant="ghost" onPress={() => setDetails(!details)} />
          {details && (
            <Col gap={8}>
              {ALL_COURSES.filter((c) => c.fieldId === p.fieldId).map((c) => (
                <Text key={c.id} variant="bodySm" tone="secondary">
                  {c.title}: {getChallengesByCourse(c.id).length} تحدٍّ
                </Text>
              ))}
            </Col>
          )}
          <Text variant="caption" tone="muted">
            الأهلية تُراجع عند الإصدار. شهادة إتمام من Kodax، وليست اعتمادًا أكاديميًا.
          </Text>
        </Col>
      </Surface>
      <CertificateAwardModal
        visible={!!awarded}
        level={awarded?.level ?? 'silver'}
        courseTitle={p.fieldName}
        courseTitleAr={p.fieldNameAr || ''}
        onClose={() => setAwarded(null)}
        onViewCertificate={awarded ? () => router.push(`/certificate/${awarded.id}` as any) : undefined}
        nextLevel={awarded?.next}
      />
    </>
  );
}
