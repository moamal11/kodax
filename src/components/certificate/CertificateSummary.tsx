import * as Clipboard from 'expo-clipboard';
import { CertificatePaper } from './CertificatePaper';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Col, Text, Row, ProgressBar, Button, useTheme } from '@/design';
import { type CertificateSummaryItem } from '@/types/certificate';

export function CertificateSummary({ certificate: cert, holder }: { certificate: CertificateSummaryItem; holder: string }) {
  const t = useTheme();
  const [fullId, setFullId] = useState(false);
  const [copied, setCopied] = useState(false);
  const snapshot = cert.achievement_snapshot;
  return (
    <Col gap={20}>
      <CertificatePaper certificate={cert} holder={holder} />
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 14 }}>
            <Text variant="caption" tone="muted" align="center">
              رقم الشهادة
            </Text>
            <Text variant="caption" mono ltr selectable align="center" style={{ marginTop: 4 }}>
              {fullId ? cert.id : `${cert.id.slice(0, 8)}…${cert.id.slice(-4)}`}
            </Text>
            <Row justify="center" wrap gap={4}>
              <Button label={fullId ? 'إخفاء الرقم الكامل' : 'إظهار الرقم الكامل'} variant="ghost" onPress={() => setFullId(!fullId)} />
              <Button
                label={copied ? 'تم نسخ الرقم' : 'نسخ رقم الشهادة'}
                icon={copied ? 'checkmark' : 'copy-outline'}
                variant="ghost"
                onPress={async () => {
                  await Clipboard.setStringAsync(cert.id);
                  setCopied(true);
                }}
              />
            </Row>
          </View>
      {snapshot && (
        <Col gap={12}>
          <Text variant="heading">الإنجاز المسجّل وقت الإصدار</Text>
          {(
            [
              ['الدروس المكتملة', snapshot.lessons_percent],
              ['التحديات المحلولة', snapshot.challenges_percent],
            ] as const
          ).map(
            ([label, percent]) =>
              typeof percent === 'number' && (
                <Col key={label} gap={8}>
                  <Row justify="space-between">
                    <Text variant="bodySm">{label}</Text>
                    <Text variant="label" ltr tabular>
                      {Math.round(percent)}%
                    </Text>
                  </Row>
                  <ProgressBar value={percent / 100} label={label} />
                </Col>
              )
          )}
        </Col>
      )}
      <Text variant="caption" tone="muted">
        شهادة إتمام من Kodax توثّق تقدمك في المسار، وليست اعتمادًا أكاديميًا. التحقق من رقمها متاح لمن لديه حساب.
      </Text>
    </Col>
  );
}
