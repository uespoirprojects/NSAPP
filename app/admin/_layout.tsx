import { Typography } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const colors = useThemeColors();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated (after loading completes)
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
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

  // Don't render admin screens if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, width: '100%' }} edges={['top', 'bottom']}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.screenBackground,
            width: '100%',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            title: 'Categories',
          }}
        />
        <Stack.Screen
          name="subjects"
          options={{
            title: 'Subjects',
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

