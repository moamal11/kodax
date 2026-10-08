import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Row, useTheme } from '@/design';

/** رابط غير موجود: شرح قصير وطريق واضح للعودة */
export default function NotFound() {
  const router = useRouter();
  const t = useTheme();
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 }}>
        <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.md, backgroundColor: t.colors.codeBg, borderWidth: 1, borderColor: t.colors.codeBorder }}>
          <Text mono ltr align="center" style={{ color: t.colors.codeComment }}>
            {'// 404: page not found'}
          </Text>
        </View>
        <Text variant="title" align="center" accessibilityRole="header">
          الصفحة غير موجودة
        </Text>
        <Text variant="body" tone="secondary" align="center" style={{ maxWidth: 380 }}>
          ممكن الرابط قديم أو فيه خطأ بسيط. ارجع للرئيسية وكمّل من حيث توقفت.
        </Text>
        <Row gap={8} style={{ marginTop: 6 }}>
          <Button label="الرئيسية" icon="home-outline" onPress={() => router.replace('/')} />
          <Button label="الدورات" variant="secondary" onPress={() => router.replace('/learn' as any)} />
        </Row>
      </View>
    </Screen>
  );
}
