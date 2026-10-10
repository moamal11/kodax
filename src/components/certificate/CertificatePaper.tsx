import React, { useId, useState } from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BrandMark } from '@/components/ui/BrandMark';
import { Col, Row, Text } from '@/design';
import { CERTIFICATE_LEVEL_CONFIG, type CertificateSummaryItem } from '@/types/certificate';

export const certificateSignature = require('../../../assets/branding/moamal-signature.png');
export const signatureBox = { left: 129, top: 229, width: 1339, height: 769, imageW: 1536, imageH: 1024 };
export const certificatePaper = { background: '#F7FBFC', ink: '#262C35', muted: '#626B73', rule: '#DCE6E9', accent: '#786644' };
export const certificateSealColors = {
  silver: { fill: '#C3C9D1', highlight: '#F8FAFC', shade: '#9DA7B3', stroke: '#5D6776' },
  gold: { fill: '#DDB45A', highlight: '#FFF3C4', shade: '#B68A37', stroke: '#77551E' },
  platinum: { fill: '#CFDEE6', highlight: '#FFFFFF', shade: '#A7BBC8', stroke: '#526D7C' },
};
export function certificateSealSVG(level: CertificateSummaryItem['level']) {
  const c = certificateSealColors[level];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="seal-${level}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.shade}"/><stop offset=".35" stop-color="${c.highlight}"/><stop offset=".65" stop-color="${c.fill}"/><stop offset="1" stop-color="${c.shade}"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#seal-${level})" stroke="${c.stroke}" stroke-width="1.5"/><circle cx="50" cy="50" r="42" fill="none" stroke="${c.highlight}" stroke-width="1"/><circle cx="50" cy="50" r="38" fill="none" stroke="${c.stroke}" stroke-dasharray="2 4"/><path d="M34 34H28V66H34 M66 34H72V66H66 M38 50L46 58L62 42" fill="none" stroke="${c.stroke}" stroke-width="2.5"/></svg>`;
}

export function CertificatePaper({ certificate: cert, holder }: { certificate: CertificateSummaryItem; holder: string }) {
  const p = certificatePaper;
  const gradientId = `certificate-seal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [width, setWidth] = useState(0);
  const wide = width >= 520;
  const scale = 112 / signatureBox.width;
  const level = CERTIFICATE_LEVEL_CONFIG[cert.level];
  const field = cert.field_name_ar || cert.field_name || cert.course_title_ar || cert.course_title;
  const seal = certificateSealColors[cert.level];
  return <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ backgroundColor: p.background, borderColor: p.rule, borderWidth: 1, padding: 12, overflow: 'hidden' }}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: wide ? -72 : -42, right: wide ? -64 : -46, opacity: 0.07 }}>
      <BrandMark variant="symbol" width={wide ? 270 : 172} tone="light" />
    </View>
    <Col gap={22} align="center" style={{ paddingHorizontal: wide ? 32 : 16, paddingVertical: 28, minHeight: wide ? 500 : undefined }}>
      <Col gap={6} align="center">
        <Text variant="title" align="center" style={{ color: p.muted, fontSize: 24 }}>شهادة إتمام المسار</Text>
      </Col>
      <Col gap={12} align="center" style={{ width: '100%', paddingTop: wide ? 42 : 20, paddingBottom: wide ? 36 : 20 }}>
        <Text variant="bodySm" style={{ color: p.muted }}>تُمنح إلى</Text>
        <Text variant="title" align="center" style={{ color: p.ink, fontSize: wide ? 40 : 30, lineHeight: wide ? 56 : 44 }}>{holder || 'الطالب'}</Text>
        <Text variant="bodySm" style={{ color: p.muted }}>لإتمام مسار</Text>
        <Text variant="heading" align="center" style={{ color: p.ink, fontSize: wide ? 28 : 22, lineHeight: wide ? 40 : 34 }}>{field}</Text>
      </Col>
      {cert.status !== 'valid' && <Text variant="label" style={{ color: '#9B3434' }}>{cert.status === 'revoked' ? 'ملغاة' : 'مؤرشفة بعد الترقية'}</Text>}
      <Row gap={18} wrap justify="space-between" align="flex-end" style={{ width: '100%', marginTop: 'auto', paddingTop: 16 }}>
        <Col gap={4} align="center">
          <View accessible accessibilityLabel="توقيع مؤمل" style={{ width: 112, height: signatureBox.height * scale, overflow: 'hidden' }}>
            <Image source={certificateSignature} resizeMode="contain" style={{ position: 'absolute', width: signatureBox.imageW * scale, height: signatureBox.imageH * scale, left: -signatureBox.left * scale, top: -signatureBox.top * scale }} />
          </View>
          <Text variant="label" style={{ color: p.ink }}>مؤمل</Text>
          <Text variant="caption" style={{ color: p.muted }}>Kodax</Text>
        </Col>
        <Col gap={8} align="center" style={{ flex: 1, minWidth: 120 }}>
          <BrandMark width={112} tone="light" />
          <Text variant="caption" align="center" style={{ color: p.muted }}>{new Date(cert.issued_at).toLocaleDateString('ar-IQ-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Baghdad' })}</Text>
        </Col>
        <Col gap={4} align="center" style={{ width: 88 }}>
          <View pointerEvents="none" accessible={false} style={{ position: 'absolute', left: -156, top: -162, width: 400, height: 400, zIndex: 0 }}>
            <Svg width={400} height={400} viewBox="0 0 400 400">
              <Path d="M0 0H54L400 346V400H346L0 54Z" fill="#DDEBED" />
              <Circle cx={200} cy={200} r={50} fill="#DDEBED" />
            </Svg>
          </View>
          <View style={{ zIndex: 1 }}>
          <Svg width={76} height={76} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0" stopColor={seal.shade} />
                <Stop offset="0.35" stopColor={seal.highlight} />
                <Stop offset="0.65" stopColor={seal.fill} />
                <Stop offset="1" stopColor={seal.shade} />
              </LinearGradient>
            </Defs>
            <Circle cx={50} cy={50} r={46} fill={`url(#${gradientId})`} stroke={seal.stroke} strokeWidth={1.5} />
            <Circle cx={50} cy={50} r={42} fill="none" stroke={seal.highlight} strokeWidth={1} />
            <Circle cx={50} cy={50} r={38} fill="none" stroke={seal.stroke} strokeDasharray="2 4" />
            <Path d="M34 34H28V66H34 M66 34H72V66H66 M38 50L46 58L62 42" fill="none" stroke={seal.stroke} strokeWidth={2.5} />
          </Svg>
          </View>
          <Text variant="caption" style={{ color: seal.stroke, zIndex: 1 }}>{level.labelAr}</Text>
        </Col>
      </Row>
    </Col>
  </View>;
}
