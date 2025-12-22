import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { SupportedLanguage, useI18n } from '@/contexts/i18n-context';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { effectiveTheme, themeMode, setThemeMode } = useTheme();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { logout, user, isLoading, refreshUserData, deleteAccount } = useAuth();
  const [isLogoutPressed, setIsLogoutPressed] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.7, 720);
  const responsiveContainerStyle: ViewStyle = {
    width: isWideLayout ? contentMaxWidth : '100%',
    alignSelf: isWideLayout ? 'center' : 'stretch',
  };

  const isDarkMode = effectiveTheme === 'dark';

  // Refresh user data when screen comes into focus (skip if account deletion in progress)
  useFocusEffect(
    useCallback(() => {
      if (!isDeletingAccount) {
        refreshUserData();
      }
    }, [refreshUserData, isDeletingAccount])
  );

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
      // Clear all authentication state
      await logout();
      // Close modal
      setShowLogoutModal(false);
      // Navigate to login screen and reset navigation stack
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Close modal
      setShowLogoutModal(false);
      // Still navigate even if there's an error
      router.replace('/login');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      setShowDeleteAccountModal(false); // Close modal immediately
      const result = await deleteAccount();
      
      if (result.success) {
        // Navigate to login screen immediately after successful deletion
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      } else {
        // Show error message
        Alert.alert(
          t('profile.deleteAccountError') || 'Error',
          result.error === 'not_authenticated' 
            ? t('profile.deleteAccountNotAuthenticated') || 'You must be logged in to delete your account.'
            : t('profile.deleteAccountFailed') || 'Failed to delete account. Please try again.'
        );
        setIsDeletingAccount(false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert(
        t('profile.deleteAccountError') || 'Error',
        t('profile.deleteAccountFailed') || 'Failed to delete account. Please try again.'
      );
      setIsDeletingAccount(false);
    }
  };

  // Get user info from Firestore or use defaults
  const userInfo = React.useMemo(() => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'User';
      const email = user.email || '';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
      
      return {
        name: fullName,
        email: email,
        initials: initials,
        firstName: firstName,
        lastName: lastName,
        address: user.address || null,
        city: user.city || null,
        province: user.province || null,
      };
    }
    
    // Default values if user data not loaded
    return {
      name: 'User',
      email: '',
      initials: 'U',
      firstName: '',
      lastName: '',
      address: null,
      city: null,
      province: null,
    };
  }, [user]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        alignItems: isWideLayout ? 'center' : 'stretch',
      }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 20,
          alignItems: isWideLayout ? 'center' : 'stretch',
          gap: 24,
        }}
      >
        {/* Avatar Section */}
        <View style={[{ alignItems: 'center', marginBottom: 24 }, responsiveContainerStyle]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.blue} style={{ marginBottom: 16 }} />
          ) : (
            <>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.blue,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: colors.white,
                  marginBottom: 16,
                }}
              >
                <Typography variant="h1" style={{ color: colors.white }}>
                  {userInfo.initials}
                </Typography>
              </View>

              <Typography variant="h2" color={colors.text} style={{ marginBottom: 8 }}>
                {userInfo.name}
              </Typography>
              {userInfo.email && (
                <Typography variant="body" color={colors.text} style={{ marginBottom: 4 }}>
                  {userInfo.email}
                </Typography>
              )}
              
              {/* Additional User Info */}
              {(userInfo.address || userInfo.city || userInfo.province) && (
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  {userInfo.address && (
                    <Typography variant="caption" color={colors.text} style={{ opacity: 0.7, marginBottom: 2 }}>
                      {userInfo.address}
                    </Typography>
                  )}
                  {(userInfo.city || userInfo.province) && (
                    <Typography variant="caption" color={colors.text} style={{ opacity: 0.7 }}>
                      {[userInfo.city, userInfo.province].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Settings Cards */}
        <View style={[{ gap: 12, marginBottom: 24 }, responsiveContainerStyle]}>
          {/* Dark Mode Card */}
          <TouchableOpacity
            style={[
              {
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              },
              responsiveContainerStyle,
            ]}
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
            style={[
              {
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              },
              responsiveContainerStyle,
            ]}
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
            style={[
              {
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              },
              responsiveContainerStyle,
            ]}
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
        </View>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.red,
              marginBottom: 12,
            },
            responsiveContainerStyle,
          ]}
          activeOpacity={0.7}
          onPress={handleDeleteAccount}
        >
          <IconSymbol name="trash-outline" size={20} color={colors.red} />
          <Typography variant="body" color={colors.red} style={{ marginLeft: 8 }}>
            {t('profile.deleteAccount') || 'Delete Account'}
          </Typography>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            {
              backgroundColor: isLogoutPressed ? colors.red : colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.red,
            },
            responsiveContainerStyle,
          ]}
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

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteAccountModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingAccount && setShowDeleteAccountModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 12, textAlign: 'center' }}>
              {t('profile.deleteAccount') || 'Delete Account'}
            </Typography>
            <Typography variant="body" color={colors.text} style={{ marginBottom: 8, textAlign: 'center', opacity: 0.9 }}>
              {t('profile.deleteAccountWarning') || 'This action cannot be undone. Your account will be permanently deactivated.'}
            </Typography>
            <Typography variant="caption" color={colors.text} style={{ marginBottom: 24, textAlign: 'center', opacity: 0.7 }}>
              {t('profile.deleteAccountConsequences') || 'You will lose access to all your learning progress, quiz results, and course data.'}
            </Typography>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.grey,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  opacity: isDeletingAccount ? 0.5 : 1,
                }}
                onPress={() => setShowDeleteAccountModal(false)}
                disabled={isDeletingAccount}
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
                  opacity: isDeletingAccount ? 0.7 : 1,
                }}
                onPress={confirmDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Typography variant="body" color={colors.white}>
                    {t('profile.deleteAccountConfirm') || 'Delete Account'}
                  </Typography>
                )}
              </TouchableOpacity>
            </View>
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