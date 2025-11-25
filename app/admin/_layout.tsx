import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const colors = useThemeColors();

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

