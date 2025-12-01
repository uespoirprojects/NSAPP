import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { SupportedLanguage, useI18n } from '@/contexts/i18n-context';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDashboardStats, migrateHardcodedData, testFirestoreConnection } from '@/services/adminService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardStats {
  categoriesCount: number;
  subjectsCount: number;
  usersCount: number;
}

export default function AdminDashboard() {
  const colors = useThemeColors();
  const { effectiveTheme, themeMode, setThemeMode } = useTheme();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { logout, user } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.9, 1200);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutPressed, setIsLogoutPressed] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

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

  const handleThemeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const languages: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
    { code: 'fr', label: 'French', nativeLabel: 'Français' },
    { code: 'ht', label: 'Haitian Creole', nativeLabel: 'Kreyòl Ayisyen' },
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  ];

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await changeLanguage(language);
    setShowLanguageModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutModal(false);
      router.replace('/login');
    }
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Typography
                  variant="h1"
                  color={colors.blue}
                  style={{
                    fontSize: 32,
                    fontFamily: 'Poppins-Bold',
                    marginBottom: 8,
                  }}
                >
                  {t('admin.dashboardTitle')}
                </Typography>
                <Typography variant="body" color={colors.text} style={{ opacity: 0.7 }}>
                  {t('admin.dashboardSubtitle')}
                </Typography>
              </View>
            </View>
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
                title={t('admin.categories')}
                value={stats.categoriesCount}
                color={colors.blue}
                onPress={() => router.push({ pathname: '/admin/categories' } as any)}
              />
              <StatCard
                icon="book-outline"
                title={t('admin.subjects')}
                value={stats.subjectsCount}
                color="#4CAF50"
                onPress={() => router.push({ pathname: '/admin/subjects' } as any)}
              />
              <StatCard
                icon="people-outline"
                title={t('admin.users')}
                value={stats.usersCount}
                color="#FF9800"
                onPress={() => router.push({ pathname: '/admin/users' } as any)}
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
              {t('admin.quickActions')}
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
                title={t('admin.createCategory')}
                description={t('admin.createCategoryDescription')}
                color={colors.blue}
                onPress={() => router.push({ pathname: '/admin/categories' } as any)}
              />
              <ActionCard
                icon="add-circle-outline"
                title={t('admin.createSubject')}
                description={t('admin.createSubjectDescription')}
                color="#4CAF50"
                onPress={() => router.push({ pathname: '/admin/subjects' } as any)}
              />
              <ActionCard
                icon="people-outline"
                title={t('admin.manageUsers')}
                description={t('admin.manageUsersDescription')}
                color="#FF9800"
                onPress={() => router.push({ pathname: '/admin/users' } as any)}
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
                  {t('admin.initialSetupRequired')}
                </Typography>
              </View>
              <Typography variant="body" color={colors.text} style={{ marginBottom: 16, opacity: 0.8 }}>
                {t('admin.initialSetupMessage')}
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
                    {t('admin.testConnection')}
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
                    {t('admin.migrateData')}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Settings Section */}
          <View style={{ marginTop: 32, marginBottom: 24 }}>
            <Typography
              variant="h2"
              color={colors.text}
              style={{
                fontSize: 24,
                fontFamily: 'Poppins-SemiBold',
                marginBottom: 16,
              }}
            >
              {t('admin.settings')}
            </Typography>
            
            {/* Dark Mode Card */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              }}
              activeOpacity={0.7}
            >
              <IconSymbol 
                name={isDarkMode ? "moon-outline" : "sunny-outline"} 
                size={24} 
                color={colors.blue} 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="body" color={colors.text}>
                  {t('profile.darkMode')}
                </Typography>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.grey, true: colors.blue }}
                thumbColor={colors.white}
              />
            </TouchableOpacity>

            {/* Language Selection Card */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              }}
              activeOpacity={0.7}
              onPress={() => setShowLanguageModal(true)}
            >
              <IconSymbol name="language-outline" size={24} color={colors.blue} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="body" color={colors.text}>
                  {t('profile.language')}
                </Typography>
                <Typography variant="caption" color={colors.text} style={{ marginTop: 4, opacity: 0.7 }}>
                  {languages.find(l => l.code === currentLanguage)?.nativeLabel}
                </Typography>
              </View>
              <IconSymbol name="chevron-forward-outline" size={20} color={colors.blue} />
            </TouchableOpacity>

            {/* Privacy Policy Card */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              }}
              activeOpacity={0.7}
              onPress={() => router.push('/privacy-policy' as any)}
            >
              <IconSymbol name="shield-outline" size={24} color={colors.blue} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="body" color={colors.text}>
                  {t('profile.privacyPolicy')}
                </Typography>
              </View>
              <IconSymbol name="chevron-forward-outline" size={20} color={colors.blue} />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={{
                backgroundColor: isLogoutPressed ? colors.red : colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.red,
                marginTop: 8,
              }}
              activeOpacity={1}
              onPressIn={() => setIsLogoutPressed(true)}
              onPressOut={() => setIsLogoutPressed(false)}
              onPress={handleLogout}
            >
              <IconSymbol name="log-out-outline" size={20} color={isLogoutPressed ? colors.white : colors.red} />
              <Typography variant="body" color={isLogoutPressed ? colors.white : colors.red} style={{ marginLeft: 8 }}>
                {t('common.logout')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 }}>
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 20, textAlign: 'center' }}>
              {t('profile.selectLanguage')}
            </Typography>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  backgroundColor: currentLanguage === lang.code ? colors.blue : colors.grey,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View>
                  <Typography variant="body" color={currentLanguage === lang.code ? colors.white : colors.text}>
                    {lang.nativeLabel}
                  </Typography>
                  <Typography variant="caption" color={currentLanguage === lang.code ? colors.white : colors.text} style={{ opacity: 0.7 }}>
                    {lang.label}
                  </Typography>
                </View>
                {currentLanguage === lang.code && (
                  <IconSymbol name="checkmark-circle" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                backgroundColor: colors.grey,
                borderRadius: 12,
                padding: 16,
                marginTop: 12,
                alignItems: 'center',
              }}
              onPress={() => setShowLanguageModal(false)}
            >
              <Typography variant="body" color={colors.text}>
                {t('common.cancel')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 12, textAlign: 'center' }}>
              {t('common.logout') || 'Logout'}
            </Typography>
            <Typography variant="body" color={colors.text} style={{ marginBottom: 24, textAlign: 'center', opacity: 0.8 }}>
              {t('profile.logoutConfirm') || 'Are you sure you want to logout?'}
            </Typography>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.grey,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={() => setShowLogoutModal(false)}
              >
                <Typography variant="body" color={colors.text}>
                  {t('common.cancel') || 'Cancel'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.red,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={confirmLogout}
              >
                <Typography variant="body" color={colors.white}>
                  {t('common.logout') || 'Logout'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

