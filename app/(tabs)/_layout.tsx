import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { isAuthenticated, isGuest } = useAuth();

  // Show different tabs based on authentication state
  // If user is guest (not authenticated and browsed videos), show Home and Settings
  // If user is authenticated, show Home, My Learning, and Profile
  const isGuestMode = isGuest && !isAuthenticated;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
        },
      }}>
      {/* Home tab - always visible */}
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="home-outline" color={color} />,
        }}
      />
      
      {/* My Learning tab - visible only when authenticated */}
      <Tabs.Screen
        name="my-learning"
        options={{
          title: t('tabs.myLearning'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book-outline" color={color} />,
          href: isGuestMode ? null : undefined, // Hide in guest mode
        }}
      />
      
      {/* Profile tab - visible only when authenticated */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person-outline" color={color} />,
          href: isGuestMode ? null : undefined, // Hide in guest mode
        }}
      />
      
      {/* Settings tab - visible only in guest mode */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="settings-outline" color={color} />,
          href: !isGuestMode ? null : undefined, // Hide when not in guest mode
        }}
      />
    </Tabs>
  );
}
