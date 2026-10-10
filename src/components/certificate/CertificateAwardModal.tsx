import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Sheet, Col, Text, Button, Surface, useTheme } from '@/design';
import { CertificateLevel, CERTIFICATE_LEVEL_CONFIG } from '@/types/certificate';
interface CertificateAwardModalProps {
  visible: boolean;
  level: CertificateLevel;
  courseTitle: string;
  courseTitleAr?: string;
  onClose: () => void;
  onViewCertificate?: () => void;
  nextLevel?: {
    level: CertificateLevel;
    requirements: string[];
  } | null;
}

export default function CertificateAwardModal({
  visible,
  level,
  courseTitle,
  courseTitleAr,
  onClose,
  onViewCertificate,
  nextLevel,
}: CertificateAwardModalProps) {
  const t = useTheme();
  const cfg = CERTIFICATE_LEVEL_CONFIG[level];
  return (
    <Sheet visible={visible} onClose={onClose} title="إنجاز جديد" maxWidth={520}>
      <Col gap={18} align="center">
        <Ionicons name={cfg.iconName} size={52} color={t.colors.xp} />
        <Text variant="title" align="center">
          حصلت على الشهادة {cfg.labelAr}
        </Text>
        <Text variant="heading" tone="secondary" align="center">
          {courseTitleAr || courseTitle}
        </Text>
        <Text variant="bodySm" tone="secondary" align="center">
          خطواتك في التعلّم صار لها شهادة إتمام تحفظها وتشاركها.
        </Text>
        {nextLevel && nextLevel.requirements?.length > 0 && (
          <Surface padding={14} style={{ alignSelf: 'stretch' }}>
            <Col gap={8}>
              <Text variant="label">للمستوى التالي: {CERTIFICATE_LEVEL_CONFIG[nextLevel.level].labelAr}</Text>
              {nextLevel.requirements.map((req, i) => (
                <Text key={i} variant="bodySm" tone="secondary">
                  • {req}
                </Text>
              ))}
            </Col>
          </Surface>
        )}
        {onViewCertificate && (
          <Button
            label="عرض الشهادة"
            icon="ribbon-outline"
            full
            onPress={() => {
              onClose();
              onViewCertificate();
            }}
          />
        )}
        <Button label="أكمل التعلم" variant="ghost" full onPress={onClose} />
      </Col>
    </Sheet>
  );
}
