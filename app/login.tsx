import { Typography } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function LoginScreen() {
  const colors = useThemeColors();

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
        NSAPP
      </Typography>

      <Typography variant="body" color={colors.text} style={{ textAlign: 'center', opacity: 0.7 }}>
        Start the login here
      </Typography>
    </View>
  );
}