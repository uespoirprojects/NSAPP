import { Typography } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const colors = useThemeColors();
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
        <Stack.Screen
          name="users"
          options={{
            title: 'Users',
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

