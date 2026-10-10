/**
 * الشارات: ملخص صغير في حسابي + ورقة كاملة مجمّعة حسب الفئة.
 * الشارة المكتسبة بلونها، غير المكتسبة رمادية مع شرط الحصول عليها.
 */
import React, { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { BADGE_CATEGORIES, ALL_BADGES, type BadgeDefinition } from '@/constants/badgeDefinitions';
import { Sheet, Text, Row, Col, Button, useTheme } from '@/design';
import { AchievementSeal } from './JourneyVisuals';

const RARITY_LABEL: Record<string, string> = { common: 'عادية', rare: 'نادرة', epic: 'ملحمية', legendary: 'أسطورية' };

function BadgeTile({ b, earned, size = 'md' }: { b: BadgeDefinition; earned: boolean; size?: 'sm' | 'md' }) {
  return (
    <View
      style={{ width: size === 'sm' ? '100%' : 104, alignItems: 'center', gap: 6 }}
      accessible
      accessibilityLabel={`${b.nameAr}${earned ? '، مكتسبة' : `، لم تُكتسب بعد: ${b.descriptionAr}`}`}
    >
      <AchievementSeal icon={b.icon} earned={earned} size={size === 'sm' ? 64 : 76} />
      <Text variant="caption" align="center" tone={earned ? 'default' : 'secondary'}>
        {b.nameAr}
      </Text>
      <Text variant="caption" align="center" tone={earned ? 'xp' : 'secondary'}>
        {earned ? 'مكتسبة' : 'قادمة'}
      </Text>
    </View>
  );
}

export function BadgesSummary({ earnedIds, onOpen, title = 'الشارات' }: { earnedIds: string[]; onOpen: () => void; title?: string }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const columns = width >= 620 ? 6 : 3;
  const earned = ALL_BADGES.filter((b) => earnedIds.includes(b.id));
  const next = ALL_BADGES.filter((b) => !earnedIds.includes(b.id)).slice(0, Math.max(0, 6 - earned.slice(0, 6).length));
  const shown = [...earned.slice(-6).reverse(), ...next];
  return (
    <View>
      <Row justify="space-between" align="flex-end" gap={12} style={{ marginBottom: 10 }}>
        <Col flex={1} gap={2}>
          <Text variant="heading" accessibilityRole="header">{title}</Text>
          <Text variant="bodySm" tone="muted">{earned.length} من {ALL_BADGES.length} · مكتسبة</Text>
        </Col>
        <Button label="كل الشارات" variant="ghost" onPress={onOpen} style={{ minWidth: 112 * Math.min(fontScale, 1.6), flexShrink: 0 }} />
      </Row>
      <View style={{ paddingVertical: 16 }}>
        <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`الشارات: ${earned.length} من ${ALL_BADGES.length}. عرض الكل`}>
          <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', rowGap: 16 }}>
            {shown.map((b) => (
              <View key={b.id} style={{ width: `${100 / columns}%`, paddingHorizontal: 4, minHeight: 92 }}>
                <BadgeTile b={b} earned={earnedIds.includes(b.id)} size="sm" />
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export function BadgesSheet({ visible, onClose, earnedIds }: { visible: boolean; onClose: () => void; earnedIds: string[] }) {
  const t = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title="الشارات" maxWidth={640}>
      <Col gap={20}>
        {BADGE_CATEGORIES.map((cat) => {
          const got = cat.badges.filter((b) => earnedIds.includes(b.id)).length;
          return (
            <View key={cat.id} style={{ gap: 10 }}>
              <Row justify="space-between">
                <Text variant="label" weight="semibold">
                  {cat.nameAr}
                </Text>
                <Text variant="caption" tone="muted" tabular>
                  {got} من {cat.badges.length}
                </Text>
              </Row>
              <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 }}>
                {cat.badges.map((b) => {
                  const on = earnedIds.includes(b.id);
                  return (
                    <View
                      key={b.id}
                      accessible
                      accessibilityLabel={`${b.nameAr}${on ? '، مكتسبة' : `، لم تُكتسب بعد: ${b.descriptionAr}`}`}
                      style={{
                        width: 150,
                        flexGrow: 1,
                        flexDirection: 'row-reverse',
                        gap: 10,
                        alignItems: 'center',
                        padding: 10,
                        borderRadius: t.radius.md,
                        backgroundColor: t.colors.surface,
                        borderWidth: 1,
                        borderColor: on ? t.colors.xp : t.colors.border,
                      }}
                    >
                      <AchievementSeal icon={b.icon} earned={on} size={48} />
                      <View style={{ flex: 1 }}>
                        <Text variant="label" weight="semibold" tone={on ? 'default' : 'secondary'}>
                          {b.nameAr}
                        </Text>
                        <Text variant="caption" tone={on ? 'xp' : 'secondary'}>
                          {on ? 'مكتسبة' : 'قادمة'}
                        </Text>
                        <Text variant="caption" tone="secondary">
                          {b.descriptionAr} · {RARITY_LABEL[b.rarity] ?? ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </Col>
    </Sheet>
  );
}
