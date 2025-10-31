import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SupportedLanguage, useI18n } from '@/contexts/i18n-context';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useState } from 'react';
import { Modal, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { effectiveTheme, themeMode, setThemeMode } = useTheme();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
            {t('settings.title')}
          </Typography>
          <Typography variant="body" color={colors.text}>
            {t('settings.subtitle')}
          </Typography>
        </View>

        {/* Settings Cards */}
        <View style={{ gap: 12 }}>
          {/* Dark Mode Card */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
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
                {t('settings.darkMode')}
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
                {t('settings.language')}
              </Typography>
              <Typography variant="caption" color={colors.text} style={{ marginTop: 4, opacity: 0.7 }}>
                {languages.find(l => l.code === currentLanguage)?.nativeLabel}
              </Typography>
            </View>
            <IconSymbol name="chevron-forward-outline" size={20} color={colors.blue} />
          </TouchableOpacity>
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
              {t('settings.selectLanguage')}
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
    </SafeAreaView>
  );
}

