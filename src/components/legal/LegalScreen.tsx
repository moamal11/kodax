import React, { useRef, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Screen, AppBar, Text, Col, Row, Segmented, Button, useTheme, type IconName } from '@/design';
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_LINKS, LEGAL_UPDATED_AT, type LegalDocument } from '@/constants/legal';

export default function LegalScreen({ documents }: { documents: Record<'ar' | 'en', LegalDocument>; icon: IconName }) {
  const t = useTheme();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const scroll = useRef<ScrollView>(null);
  const doc = documents[lang];
  const rtl = lang === 'ar';
  const direction = { textAlign: rtl ? ('right' as const) : ('left' as const), writingDirection: rtl ? ('rtl' as const) : ('ltr' as const) };
  return (
    <Screen width="reading" scrollRef={scroll} header={<AppBar title={doc.title} fallback="/profile" />}>
      <Col gap={24}>
        <Segmented
          value={lang}
          onChange={(v) => {
            setLang(v);
            scroll.current?.scrollTo({ y: 0, animated: false });
          }}
          options={[
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ]}
        />
        <Text variant="caption" tone="muted" style={direction}>
          {rtl ? 'آخر تحديث: ' : 'Last updated: '}
          {LEGAL_UPDATED_AT[lang]}
        </Text>
        <Text variant="body" style={direction}>
          {doc.intro}
        </Text>
        {doc.sections.map((section) => (
          <Col key={section.title} gap={12} style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: t.colors.border }}>
            <Text variant="heading" accessibilityRole="header" style={direction}>
              {section.title}
            </Text>
            {section.paragraphs?.map((p) => (
              <Text key={p} tone="secondary" style={direction}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b) => (
              <View key={b} style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 10 }}>
                <Text tone="brand">•</Text>
                <Text tone="secondary" style={[{ flex: 1 }, direction]}>
                  {b}
                </Text>
              </View>
            ))}
          </Col>
        ))}
        <Col gap={12} style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: t.colors.border }}>
          <Text variant="heading" style={direction}>
            {rtl ? 'التواصل' : 'Contact'}
          </Text>
          <Text tone="secondary" style={direction}>
            {rtl
              ? 'للاستفسارات وطلبات الخصوصية، افتح المساعدة والدعم من حسابك أو تواصل معنا:'
              : 'For questions or privacy requests, open Help & Support from your account, or contact us:'}
          </Text>
          <Row gap={8} wrap>
            {!!LEGAL_CONTACT_EMAIL && (
              <Button variant="secondary" label={LEGAL_CONTACT_EMAIL} onPress={() => Linking.openURL(`mailto:${LEGAL_CONTACT_EMAIL}`)} />
            )}
            {LEGAL_CONTACT_LINKS.map((c) => (
              <Button key={c.url} variant="secondary" label={c.label} icon="open-outline" onPress={() => Linking.openURL(c.url)} />
            ))}
          </Row>
        </Col>
      </Col>
    </Screen>
  );
}
