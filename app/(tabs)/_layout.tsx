import React from 'react';
import { Tabs } from 'expo-router';
import { AppTabBar, TAB_ITEMS } from '@/components/navigation/AppTabBar';
import { useBreakpoint, useTheme } from '@/design';

export default function TabLayout() {
  const { hasSidebar } = useBreakpoint();
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // RTL: الشريط الجانبي على اليمين في Desktop
        tabBarPosition: hasSidebar ? 'right' : 'bottom',
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: TAB_ITEMS.index.label }} />
      <Tabs.Screen name="learn" options={{ title: TAB_ITEMS.learn.label }} />
      <Tabs.Screen name="code" options={{ title: TAB_ITEMS.code.label }} />
      <Tabs.Screen name="ai" options={{ title: TAB_ITEMS.ai.label }} />
      <Tabs.Screen name="profile" options={{ title: TAB_ITEMS.profile.label }} />
    </Tabs>
  );
}
