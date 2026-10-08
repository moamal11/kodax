/**
 * ملاحة Kodax: خمس وجهات مسماة.
 * - الهاتف/اللوحي: شريط سفلي بأيقونة + تسمية (يختفي مع لوحة المفاتيح على Android/iOS)
 * - Desktop (ويب ≥ 1024): شريط جانبي يمين بالتسميات + عداد المستوى/XP
 */
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useBreakpoint, Text, Row, Col, Avatar } from '@/design';
import { XpMeter } from '@/features/rewards/XpMeter';
import { useApp } from '@/contexts/AppContext';

type IconName = keyof typeof Ionicons.glyphMap;
export const TAB_ITEMS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'الرئيسية', icon: 'home-outline', active: 'home' },
  learn: { label: 'تعلّم', icon: 'school-outline', active: 'school' },
  code: { label: 'المجتمع', icon: 'code-slash-outline', active: 'code-slash' },
  ai: { label: 'المساعد', icon: 'sparkles-outline', active: 'sparkles' },
  profile: { label: 'حسابي', icon: 'person-circle-outline', active: 'person-circle' },
};
const ORDER = ['index', 'learn', 'code', 'ai', 'profile'];

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const c = t.colors;
  const insets = useSafeAreaInsets();
  const { hasSidebar } = useBreakpoint();
  const { profile } = useApp();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const routes = ORDER.map((name) => state.routes.find((r) => r.name === name)).filter(Boolean) as typeof state.routes;
  const activeName = state.routes[state.index]?.name;
  const go = (name: string, key: string) => {
    const e = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (activeName !== name && !e.defaultPrevented) navigation.navigate(name as never);
  };

  if (hasSidebar) {
    return (
      <View
        role="navigation"
        style={{ width: t.layout.sidebarWidth, backgroundColor: c.bg, borderLeftWidth: 1, borderLeftColor: c.border, paddingVertical: 20, paddingHorizontal: 14, justifyContent: 'space-between' }}
      >
        <Col gap={4}>
          <Row style={{ paddingHorizontal: 8, marginBottom: 20 }}>
            <Image source={require('../../../assets/kodax-wordmark.png')} style={{ width: 118, height: 27 }} resizeMode="contain" accessibilityLabel="Kodax" />
          </Row>
          {routes.map((r) => {
            const item = TAB_ITEMS[r.name];
            const on = r.name === activeName;
            return (
              <Pressable
                key={r.key}
                onPress={() => go(r.name, r.key)}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: on }}
                style={(s: any) => [
                  {
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    gap: 12,
                    height: 44,
                    paddingHorizontal: 12,
                    borderRadius: t.radius.md,
                    backgroundColor: on ? c.brandSoft : s.hovered ? c.surface : 'transparent',
                  },
                  s.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null,
                ]}
              >
                <Ionicons name={on ? item.active : item.icon} size={20} color={on ? c.brandText : c.textSecondary} />
                <Text variant="body" weight={on ? 'semibold' : 'medium'} style={{ color: on ? c.text : c.textSecondary }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </Col>
        <Col gap={12}>
          <XpMeter variant="full" />
          <Pressable onPress={() => go('profile', routes.find((r) => r.name === 'profile')?.key ?? '')} accessibilityRole="link" accessibilityLabel="حسابي">
            <Row gap={10} style={{ paddingHorizontal: 4 }}>
              <Avatar uri={(profile as any)?.avatar_url} name={(profile as any)?.full_name || (profile as any)?.username} size={32} />
              <Text variant="bodySm" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                {(profile as any)?.full_name || (profile as any)?.username || 'حسابي'}
              </Text>
            </Row>
          </Pressable>
        </Col>
      </View>
    );
  }

  if (keyboardOpen) return null;
  return (
    <View accessibilityRole="tablist" style={{ backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 6) }}>
      <View style={{ flexDirection: 'row-reverse', height: 58, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {routes.map((r) => {
          const item = TAB_ITEMS[r.name];
          const on = r.name === activeName;
          return (
            <Pressable
              key={r.key}
              onPress={() => go(r.name, r.key)}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: on }}
              style={(s: any) => [{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, opacity: s.pressed ? 0.7 : 1 }, Platform.OS === 'web' && s.focused ? ({ outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.focus } as any) : null]}
            >
              <View style={{ position: 'absolute', top: 0, width: 28, height: 2, borderRadius: 1, backgroundColor: on ? c.brand : 'transparent' }} />
              <Ionicons name={on ? item.active : item.icon} size={22} color={on ? c.brandText : c.textMuted} />
              <Text variant="caption" weight={on ? 'semibold' : 'medium'} align="center" numberOfLines={1} style={{ color: on ? c.text : c.textMuted, fontSize: 11, lineHeight: 14 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
