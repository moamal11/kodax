/**
 * حول Kodax: ماذا يقدّم التطبيق بأرقام المحتوى الفعلية، والإصدار من البناء نفسه (لا رقم ثابت).
 * الشهادات: «شهادات إتمام قابلة للتحقق» بما يطابق شروط الاستخدام (F14).
 */
import React from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { ALL_COURSES, ALL_LESSONS, ALL_CHALLENGES } from '@/constants/courseData';
import { Screen, AppBar, Text, Row, Col, ListGroup, ListRow, Surface, useTheme, type IconName } from '@/design';

/** إصدار البناء الحالي (app.json → expo.version وقت البناء) */
const appVersion = (): string => Constants.expoConfig?.version ?? '';

export default function AboutScreen() {
  const t = useTheme();
  const router = useRouter();
  const features: { icon: IconName; title: string; body: string }[] = [
    { icon: 'school-outline', title: `${ALL_COURSES.length} دورة و${ALL_LESSONS.length} درساً`, body: 'شرح عربي مبسّط، أمثلة كود، واختبار قصير في نهاية كل درس.' },
    { icon: 'code-slash-outline', title: `${ALL_CHALLENGES.length} تحدياً برمجياً`, body: 'تكتب الحل وتشغّله، ويتحقق السيرفر من الاختبارات قبل منح XP.' },
    { icon: 'sparkles-outline', title: 'مساعد Kodax', body: 'يشرح الدروس ويساعدك تتبع أخطاء كودك، بحصة يومية مجانية.' },
    { icon: 'people-outline', title: 'مجتمع المتعلمين', body: 'شارك أكوادك وعلّق وتابع غيرك وراسلهم.' },
    { icon: 'ribbon-outline', title: 'شهادات إتمام قابلة للتحقق', body: 'تُمنح عند إتمام متطلبات المسار، ولها رقم يمكن التحقق منه. ليست شهادة أكاديمية معتمدة.' },
  ];
  const version = appVersion();
  return (
    <Screen width="reading" header={<AppBar title="حول Kodax" fallback="/profile" />}>
      <Col gap={20}>
        <Col gap={10} align="center" style={{ paddingVertical: 12 }}>
          <Image source={require('../assets/kodax-wordmark.png')} style={{ width: 170, height: 39 }} resizeMode="contain" accessibilityLabel="Kodax" />
          <Text variant="body" tone="secondary" align="center" style={{ maxWidth: 420 }}>
            تطبيق عراقي لتعلّم البرمجة بالعربية: دروس، تحديات حقيقية، ومجتمع يكتب الكود معك.
          </Text>
          {!!version && (
            <Text variant="caption" tone="muted" ltr align="center">
              {`v${version}`}
            </Text>
          )}
        </Col>
        <Surface padding={0}>
          {features.map((f, i) => (
            <Row key={f.title} gap={12} align="flex-start" style={{ padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.brandSoft }}>
                <Ionicons name={f.icon} size={18} color={t.colors.brandText} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" weight="semibold">
                  {f.title}
                </Text>
                <Text variant="bodySm" tone="secondary">
                  {f.body}
                </Text>
              </View>
            </Row>
          ))}
        </Surface>
        <ListGroup>
          <ListRow icon="help-buoy-outline" title="الدعم الفني" onPress={() => router.push('/support' as any)} />
          <ListRow icon="shield-checkmark-outline" title="سياسة الخصوصية" onPress={() => router.push('/privacy' as any)} />
          <ListRow icon="document-text-outline" title="شروط الاستخدام" onPress={() => router.push('/terms' as any)} last />
        </ListGroup>
        <Text variant="caption" tone="muted" align="center">
          © 2026 Kodax
        </Text>
      </Col>
    </Screen>
  );
}
