import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDashboardStats, migrateHardcodedData, testFirestoreConnection } from '@/services/adminService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardStats {
  categoriesCount: number;
  subjectsCount: number;
  usersCount: number;
}

export default function AdminDashboard() {
  const colors = useThemeColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.9, 1200);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload stats every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await testFirestoreConnection();
      if (isConnected) {
        Alert.alert('Connection Test', '✅ Firestore connection is working!');
      } else {
        Alert.alert('Connection Test', '❌ Firestore connection failed. Check your Firebase configuration.');
      }
    } catch (error: any) {
      Alert.alert('Connection Test Error', error.message || 'Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    Alert.alert(
      'Migrate Data',
      'This will migrate hardcoded categories and subjects from the codebase to Firestore. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await migrateHardcodedData();
              
              let message = `Migrated ${result.categoriesMigrated} categories and ${result.subjectsMigrated} subjects to Firestore.`;
              if (result.errors.length > 0) {
                message += `\n\nErrors:\n${result.errors.slice(0, 3).join('\n')}`;
                if (result.errors.length > 3) {
                  message += `\n... and ${result.errors.length - 3} more errors.`;
                }
              }
              
              Alert.alert('Migration Complete', message);
              loadStats();
            } catch (error: any) {
              Alert.alert('Migration Error', error.message || 'Failed to migrate data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    color, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    value: number | string; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.grey,
        width: isWideLayout ? '30%' : '100%',
        minWidth: isWideLayout ? 200 : undefined,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <IconSymbol name={icon} size={24} color={color} />
        </View>
        <Typography variant="h3" color={colors.text} style={{ flex: 1 }}>
          {title}
        </Typography>
      </View>
      <Typography
        variant="h1"
        color={colors.text}
        style={{
          fontSize: 32,
          fontFamily: 'Poppins-Bold',
          marginTop: 8,
        }}
      >
        {value}
      </Typography>
    </TouchableOpacity>
  );

  const ActionCard = ({
    icon,
    title,
    description,
    onPress,
    color,
  }: {
    icon: string;
    title: string;
    description: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.grey,
        width: isWideLayout ? '48%' : '100%',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <IconSymbol name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Typography variant="h3" color={colors.text} style={{ marginBottom: 4 }}>
            {title}
          </Typography>
          <Typography variant="body" color={colors.text} style={{ opacity: 0.7 }}>
            {description}
          </Typography>
        </View>
        <IconSymbol name="chevron-forward" size={20} color={colors.grey} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        width: '100%',
      }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          padding: 20,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isWideLayout ? contentMaxWidth : '100%',
            alignSelf: 'center',
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Typography
              variant="h1"
              color={colors.blue}
              style={{
                fontSize: 32,
                fontFamily: 'Poppins-Bold',
                marginBottom: 8,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body" color={colors.text} style={{ opacity: 0.7 }}>
              Manage categories, subjects, and view statistics
            </Typography>
          </View>

          {/* Statistics Cards */}
          {loading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.blue} />
            </View>
          ) : stats ? (
            <View
              style={{
                flexDirection: isWideLayout ? 'row' : 'column',
                justifyContent: 'space-between',
                marginBottom: 32,
                gap: isWideLayout ? 16 : 0,
              }}
            >
              <StatCard
                icon="folder-outline"
                title="Categories"
                value={stats.categoriesCount}
                color={colors.blue}
                onPress={() => router.push({ pathname: '/admin/categories' } as any)}
              />
              <StatCard
                icon="book-outline"
                title="Subjects"
                value={stats.subjectsCount}
                color="#4CAF50"
                onPress={() => router.push({ pathname: '/admin/subjects' } as any)}
              />
              <StatCard
                icon="people-outline"
                title="Users"
                value={stats.usersCount}
                color="#FF9800"
              />
            </View>
          ) : null}

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <Typography
              variant="h2"
              color={colors.text}
              style={{
                fontSize: 24,
                fontFamily: 'Poppins-SemiBold',
                marginBottom: 16,
              }}
            >
              Quick Actions
            </Typography>
            <View
              style={{
                flexDirection: isWideLayout ? 'row' : 'column',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: isWideLayout ? 16 : 0,
              }}
            >
              <ActionCard
                icon="add-circle-outline"
                title="Create Category"
                description="Add a new course category"
                color={colors.blue}
                onPress={() => router.push({ pathname: '/admin/categories' } as any)}
              />
              <ActionCard
                icon="add-circle-outline"
                title="Create Subject"
                description="Add a new subject to a category"
                color="#4CAF50"
                onPress={() => router.push({ pathname: '/admin/subjects' } as any)}
              />
            </View>
          </View>

          {/* Migration Section */}
          {stats && (stats.categoriesCount === 0 || stats.subjectsCount === 0) && (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.blue,
                borderStyle: 'dashed',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <IconSymbol name="information-circle-outline" size={24} color={colors.blue} style={{ marginRight: 12 }} />
                <Typography variant="h3" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Initial Setup Required
                </Typography>
              </View>
              <Typography variant="body" color={colors.text} style={{ marginBottom: 16, opacity: 0.8 }}>
                No data found in Firestore. You can either:
                {'\n'}1. Create categories/subjects manually using the buttons above
                {'\n'}2. Migrate existing hardcoded data from the codebase
              </Typography>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleTestConnection}
                  style={{
                    flex: 1,
                    backgroundColor: colors.grey,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol name="checkmark-circle-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                    Test Connection
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMigrate}
                  style={{
                    flex: 1,
                    backgroundColor: colors.blue,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol name="sync-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={colors.white} style={{ fontFamily: 'Poppins-SemiBold' }}>
                    Migrate Data
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

