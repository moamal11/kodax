import React from 'react';
import { Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, AppBar, Col, Row, Button, ErrorState, ListSkeleton } from '@/design';
import { useCertificateDetail } from '@/hooks/useCertificateDetail';
import { CertificateSummary } from '@/components/certificate/CertificateSummary';
import { showToast } from '@/components/ui/Toast';

export default function CertificateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { certificate, holder, loading, error, reload } = useCertificateDetail(id);
  const share = async () => {
    if (!certificate) return;
    try {
      await Share.share({
        message: `شهادة إتمام ${certificate.field_name_ar || certificate.course_title_ar || certificate.field_name || certificate.course_title || 'المسار'} من Kodax\nhttps://kodax.app/certificate/verify?id=${encodeURIComponent(certificate.id)}`,
      });
    } catch {
      showToast.error('تعذّرت المشاركة. حاول مرة أخرى.');
    }
  };
  return (
    <Screen width="reading" header={<AppBar title="تفاصيل الشهادة" fallback="/certificate" />}>
      {loading ? (
        <ListSkeleton rows={2} />
      ) : error || !certificate ? (
        <ErrorState body={error || 'لم نعثر على الشهادة.'} onRetry={reload} />
      ) : (
        <Col gap={24}>
          <CertificateSummary certificate={certificate} holder={holder} />
          <Row gap={8} wrap>
            <Button label="نسخة للطباعة والمشاركة" icon="download-outline" onPress={() => router.push({ pathname: '/certificate/download', params: { id } })} />
            <Button
              label="تحقق من الشهادة"
              variant="secondary"
              icon="shield-checkmark-outline"
              onPress={() => router.push({ pathname: '/certificate/verify', params: { id } })}
            />
            <Button label="مشاركة" variant="ghost" icon="share-outline" onPress={share} />
          </Row>
        </Col>
      )}
    </Screen>
  );
}
