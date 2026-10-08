/**
 * الشارات: ملخص صغير في حسابي + ورقة كاملة مجمّعة حسب الفئة.
 * الشارة المكتسبة بلونها، غير المكتسبة رمادية مع شرط الحصول عليها.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BADGE_CATEGORIES, ALL_BADGES, type BadgeDefinition } from '@/constants/badgeDefinitions';
import { Sheet, Text, Row, Col, ProgressBar, SectionHeader, Surface, useTheme } from '@/design';

const RARITY_LABEL: Record<string, string> = { common: 'عادية', rare: 'نادرة', epic: 'ملحمية', legendary: 'أسطورية' };

function BadgeTile({ b, earned, size = 'md' }: { b: BadgeDefinition; earned: boolean; size?: 'sm' | 'md' }) {
  const t = useTheme();
  const box = size === 'sm' ? 44 : 52;
  return (
    <View style={{ width: size === 'sm' ? 64 : 92, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`${b.nameAr}${earned ? '، مكتسبة' : `، لم تُكتسب بعد: ${b.descriptionAr}`}`}>
      <View
        style={{
          width: box,
          height: box,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: earned ? t.colors.xpSoft : t.colors.surfaceSunken,
          borderWidth: 1,
          borderColor: earned ? t.colors.xp : t.colors.border,
          opacity: earned ? 1 : 0.6,
        }}
      >
        <MaterialIcons name={b.icon} size={size === 'sm' ? 22 : 26} color={earned ? t.colors.xp : t.colors.textMuted} />
      </View>
      <Text variant="caption" align="center" numberOfLines={2} tone={earned ? 'default' : 'muted'} style={{ fontSize: 11, lineHeight: 15 }}>
        {b.nameAr}
      </Text>
    </View>
  );
}

export function BadgesSummary({ earnedIds, onOpen }: { earnedIds: string[]; onOpen: () => void }) {
  const t = useTheme();
  const earned = ALL_BADGES.filter((b) => earnedIds.includes(b.id));
  const next = ALL_BADGES.filter((b) => !earnedIds.includes(b.id)).slice(0, Math.max(0, 6 - earned.slice(0, 6).length));
  const shown = [...earned.slice(-6).reverse(), ...next];
  return (
    <View>
      <SectionHeader title="الشارات" subtitle={`${earned.length} من ${ALL_BADGES.length}`} action="كل الشارات" onAction={onOpen} />
      <Surface padding={12}>
        <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`الشارات: ${earned.length} من ${ALL_BADGES.length}. عرض الكل`}>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: 12 }}>
            {shown.map((b) => (
              <BadgeTile key={b.id} b={b} earned={earnedIds.includes(b.id)} size="sm" />
            ))}
          </View>
          <ProgressBar value={earned.length / Math.max(1, ALL_BADGES.length)} tone="xp" height={4} style={{ marginTop: 12 }} />
        </Pressable>
      </Surface>
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
                    <View key={b.id} style={{ width: 150, flexGrow: 1, flexDirection: 'row-reverse', gap: 10, alignItems: 'center', padding: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: on ? t.colors.xp : t.colors.border }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.colors.xpSoft : t.colors.surfaceSunken }}>
                        <MaterialIcons name={b.icon} size={22} color={on ? t.colors.xp : t.colors.textMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="label" weight="semibold" tone={on ? 'default' : 'secondary'} numberOfLines={1}>
                          {b.nameAr}
                        </Text>
                        <Text variant="caption" tone="muted" numberOfLines={2}>
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
