/**
 * إعلان الشارات الجديدة: بطاقة واحدة غير حاجبة أعلى الشاشة تجمع كل ما حصل عليه المستخدم دفعة واحدة.
 * (بدل نافذة لكل شارة + رسالة لكل شارة). الضغط يفتح صفحة الحساب حيث الشارات.
 */
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useReducedMotion, Text, Row, IconButton } from '@/design';
import type { BadgeDefinition } from '@/constants/badgeDefinitions';

const RARITY: Record<string, string> = { legendary: 'أسطورية', epic: 'ملحمية', rare: 'نادرة', common: 'عادية' };

export function BadgeBanner({ badges, onClose }: { badges: BadgeDefinition[]; onClose: () => void }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(onClose, reduced ? 6000 : 4500);
    return () => clearTimeout(timer);
  }, [badges]);
  if (!badges.length) return null;
  const first = badges[0];
  const title = badges.length === 1 ? `شارة جديدة: ${first.nameAr}` : `حصلت على ${badges.length} شارات جديدة`;
  const body = badges.length === 1 ? `${first.descriptionAr} · ${RARITY[first.rarity] ?? ''}` : badges.map((b) => b.nameAr).slice(0, 3).join('، ') + (badges.length > 3 ? ` و${badges.length - 3} غيرها` : '');
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 10, left: 12, right: 12, alignItems: 'center', zIndex: 9998 }}>
      <Animated.View entering={reduced ? undefined : FadeInUp.duration(240)} exiting={reduced ? undefined : FadeOutUp.duration(200)} style={{ width: '100%', maxWidth: 440 }}>
        <Pressable
          onPress={() => {
            onClose();
            router.push('/profile' as any);
          }}
          accessibilityRole="button"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${title}. ${body}`}
          accessibilityHint="يفتح صفحة حسابك والشارات"
        >
          <Row gap={12} style={{ backgroundColor: t.colors.surfaceRaised, borderWidth: 1, borderColor: t.colors.xp, borderRadius: t.radius.lg, padding: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name={first.icon} size={24} color={t.colors.xp} />
              {badges.length > 1 && (
                <View style={{ position: 'absolute', bottom: -4, left: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: t.colors.xp, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                  <Text variant="caption" weight="bold" align="center" style={{ color: '#1a1200', fontSize: 11, lineHeight: 14 }}>
                    {badges.length}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label" weight="semibold" numberOfLines={1}>
                {title}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={2}>
                {body}
              </Text>
            </View>
            <IconButton icon="close" label="إغلاق" onPress={onClose} size={18} />
          </Row>
        </Pressable>
      </Animated.View>
    </View>
  );
}
