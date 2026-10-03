/**
 * عرض مستند قانوني (سياسة الخصوصية / شروط الاستخدام) بالعربية أو الإنجليزية.
 * الصفحة عامة: تعمل بدون تسجيل دخول (داخل التطبيق وعلى kodax.app).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_LINKS,
  LEGAL_UPDATED_AT,
  type LegalDocument,
} from '@/constants/legal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  documents: Record<'ar' | 'en', LegalDocument>;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function LegalScreen({ documents, icon }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const doc = documents[lang];
  const rtl = lang === 'ar';
  const align = { textAlign: rtl ? ('right' as const) : ('left' as const), writingDirection: rtl ? ('rtl' as const) : ('ltr' as const) };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack} accessibilityLabel="رجوع">
            <Ionicons name="arrow-back" size={24} color="#d1d5db" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Ionicons name={icon} size={22} color="#8b5cf6" />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {doc.title}
            </Text>
          </View>
          <View style={styles.langSwitch}>
            {(['ar', 'en'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => setLang(l)}
                style={[styles.langBtn, lang === l && styles.langBtnActive]}
              >
                <Text style={[styles.langText, lang === l && styles.langTextActive]}>
                  {l === 'ar' ? 'عربي' : 'EN'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.updated, align]}>
            {rtl ? 'آخر تحديث: ' : 'Last updated: '}
            {LEGAL_UPDATED_AT[lang]}
          </Text>
          <Text style={[styles.intro, align]}>{doc.intro}</Text>

          {doc.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, align]}>{section.title}</Text>
              {section.paragraphs?.map((p) => (
                <Text key={p} style={[styles.paragraph, align]}>
                  {p}
                </Text>
              ))}
              {section.bullets?.map((b) => (
                <View key={b} style={[styles.bulletRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={[styles.bulletText, align]}>{b}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, align]}>{rtl ? 'التواصل' : 'Contact'}</Text>
            <Text style={[styles.paragraph, align]}>
              {rtl
                ? 'للاستفسارات أو طلبات الخصوصية: من داخل التطبيق عبر الإعدادات ← المساعدة والدعم، أو:'
                : 'For questions or privacy requests: in the app via Settings → Help & Support, or:'}
            </Text>
            {LEGAL_CONTACT_EMAIL ? (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${LEGAL_CONTACT_EMAIL}`)}>
                <Text style={[styles.link, align]}>{LEGAL_CONTACT_EMAIL}</Text>
              </TouchableOpacity>
            ) : null}
            {LEGAL_CONTACT_LINKS.map((c) => (
              <TouchableOpacity key={c.url} onPress={() => Linking.openURL(c.url)}>
                <Text style={[styles.link, align]}>
                  {c.label}: {c.url.replace('https://', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f0f1e' },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 24 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { flexShrink: 1, fontSize: 20, fontWeight: '800', color: '#ffffff' },
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#252550',
  },
  langBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  langBtnActive: { backgroundColor: '#8b5cf6' },
  langText: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  langTextActive: { color: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 16 },
  updated: { color: '#6b7280', fontSize: 12 },
  intro: { color: '#d1d5db', fontSize: 15, lineHeight: 24 },
  section: {
    gap: 8,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
  },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  paragraph: { color: '#d1d5db', fontSize: 14, lineHeight: 23 },
  bulletRow: { alignItems: 'flex-start', gap: 8 },
  bulletDot: { color: '#8b5cf6', fontSize: 16, lineHeight: 23 },
  bulletText: { flex: 1, color: '#d1d5db', fontSize: 14, lineHeight: 23 },
  link: { color: '#a78bfa', fontSize: 14, lineHeight: 24, textDecorationLine: 'underline' },
});
