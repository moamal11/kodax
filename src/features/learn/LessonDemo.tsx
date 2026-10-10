import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Button, CodeView, Col, Row, Segmented, Text, useReducedMotion, useTheme } from '@/design';
import { AchievementSeal, JourneyNode } from '@/features/rewards/JourneyVisuals';

/** A public, explicitly illustrative lesson. It never calls progress or reward APIs. */
export function LessonDemo() {
  const t = useTheme();
  const reduced = useReducedMotion();
  const [operator, setOperator] = useState<'gte' | 'lt'>('gte');
  const [ran, setRan] = useState(false);
  const reveal = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    reveal.stopAnimation();
    if (!ran || reduced) {
      reveal.setValue(1);
      return;
    }
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [ran, reduced, reveal]);
  const code = `score = 8\nif score ${operator === 'gte' ? '>=' : '<'} 5:\n    print("ناجح")\nelse:\n    print("حاول مرة ثانية")`;
  return (
    <Col style={{ borderWidth: 1, borderColor: t.colors.borderStrong, borderRadius: 16, overflow: 'hidden', backgroundColor: t.colors.surface }}>
      <Row justify="space-between" gap={12} style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
        <Col gap={3}>
          <Text variant="caption" tone="brand">
            درس صغير · مثال توضيحي
          </Text>
          <Text variant="heading">الكود يختار حسب الشرط</Text>
        </Col>
        <Text variant="label" mono ltr tone="secondary">
          Python
        </Text>
      </Row>
      <Col gap={16} style={{ padding: 18 }}>
        <Row gap={10} wrap>
          {['الشرط', 'الكود', 'النتيجة'].map((label, i) => (
            <Row key={label} gap={6}>
              <JourneyNode state={ran ? 'completed' : i === 0 ? 'current' : 'upcoming'} number={i + 1} size={30} />
              <Text variant="caption" tone={i === 0 || ran ? 'default' : 'secondary'}>
                {label}
              </Text>
            </Row>
          ))}
        </Row>
        <Text variant="bodySm" tone="secondary">
          الدرجة 8. غيّر المقارنة وشوف شنو يطبع البرنامج.
        </Text>
        <Segmented
          value={operator}
          onChange={(v) => {
            setOperator(v);
            setRan(false);
          }}
          options={[
            { value: 'gte', label: '8 أكبر أو تساوي 5' },
            { value: 'lt', label: '8 أصغر من 5' },
          ]}
        />
        <CodeView language="python" code={code} />
        <Button full label={ran ? 'شغّل مرة ثانية' : 'شغّل المثال'} icon="play" onPress={() => setRan(true)} />
        <Animated.View style={{ opacity: reveal }} accessibilityLiveRegion="polite">
          <Col
            gap={8}
            style={{
              padding: 14,
              backgroundColor: t.colors.codeBg,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: ran ? t.colors.borderStrong : t.colors.border,
            }}
          >
            <Text variant="caption" tone="secondary">
              النتيجة
            </Text>
            <Text selectable tone={ran ? 'default' : 'secondary'}>
              {ran ? (operator === 'gte' ? 'ناجح' : 'حاول مرة ثانية') : 'تظهر بعد التشغيل'}
            </Text>
            {ran && (
              <Text variant="bodySm" tone="secondary">
                {operator === 'gte' ? 'الشرط صحيح، اشتغل السطر الأول.' : 'الشرط غير صحيح، اشتغل سطر else.'}
              </Text>
            )}
          </Col>
        </Animated.View>
        <Row gap={14} style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: t.colors.border }}>
          <AchievementSeal icon="call-split" earned={ran} size={50} />
          <Col flex={1} gap={2}>
            <Text variant="label">{ran ? 'فهمت قرار الكود' : 'جرّب الشرطين'}</Text>
            <Text variant="caption" tone="secondary">
              تجربة توضيحية، بدون XP أو شارة للحساب.
            </Text>
          </Col>
        </Row>
      </Col>
    </Col>
  );
}
