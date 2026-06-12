import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/components/theme-context';
import { AppVariant, getBuildVariant, getStoredAppVariant, getStoredPersonUid, refreshAppVariant } from '@/services/api';

export default function TabLayout() {
  const { colors } = useAppTheme();
  // Each deployed site has its arm baked in, so the tab bar is correct
  // from the first frame; backend per-person data still wins if it differs.
  const [variant, setVariant] = useState<AppVariant | null>(getBuildVariant());

  useEffect(() => {
    let active = true;

    async function loadVariant() {
      // Cached arm first so the tab bar settles immediately, then refresh
      // from the backend in case the research team reassigned the arm.
      const stored = await getStoredAppVariant();
      if (active && stored) {
        setVariant(stored);
      }
      const uid = await getStoredPersonUid();
      if (!uid) {
        return;
      }
      const fresh = await refreshAppVariant(uid);
      if (active && fresh) {
        setVariant(fresh);
      }
    }

    void loadVariant();
    return () => {
      active = false;
    };
  }, []);

  const supportOnly = variant === 'support_only';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarButton: (props) => <HapticTab {...(props as any)} />,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          // Group B (support_only) never sees the Events surface.
          href: supportOnly ? null : undefined,
          title: 'Events',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
