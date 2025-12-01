import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    // Check authentication and admin role
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace('/login');
      } else if (user) {
        // Check if user is admin
        if (user.role !== 'admin') {
          Alert.alert(
            'Access Denied',
            'You do not have permission to access the admin dashboard.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/home'),
              },
            ]
          );
        } else {
          setIsCheckingRole(false);
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading screen while checking authentication and role
  if (isLoading || isCheckingRole) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, width: '100%' }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Typography variant="body" color={colors.text} style={{ marginTop: 16, opacity: 0.7 }}>
            Loading...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render admin screens if not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

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
      }}
    >
      {/* Dashboard tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('admin.dashboard'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="grid-outline" color={color} />,
        }}
      />
      
      {/* Settings tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('admin.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="settings-outline" color={color} />,
        }}
      />

      {/* Hidden tabs for nested routes - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tabs, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          href: null, // Hide from tabs, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null, // Hide from tabs, accessible via navigation
        }}
      />
    </Tabs>
  );
}

