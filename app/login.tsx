import { Typography } from '@/components/ui';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();

  const handleLogin = () => {
    // TODO: Implement login logic
    // After successful login, navigate to home tab
    (router.push as any)('/home');
  };

  return (
    <View 
      style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.screenBackground }}
      onTouchEnd={handleLogin}
    >
      <Typography variant="h1" color={colors.blue} style={{ marginBottom: 16, textAlign: 'center' }}>
        {t('login.title')}
      </Typography>

      <Typography variant="body" color={colors.text} style={{ textAlign: 'center', opacity: 0.7 }}>
        {t('login.subtitle')}
      </Typography>
    </View>
  );
}