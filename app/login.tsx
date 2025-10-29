import { Typography } from '@/components/ui';
import { CustomColors } from '@/constants/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function LoginScreen() {
  const handleLogin = () => {
    // TODO: Implement login logic
    // After successful login, navigate to home tab
    (router.push as any)('/home');
  };

  return (
    <View 
      style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: CustomColors.lightBlue }}
      onTouchEnd={handleLogin}
    >
      <Typography variant="h1" color={CustomColors.blue} style={{ marginBottom: 16, textAlign: 'center' }}>
        NSAPP
      </Typography>

      <Typography variant="body" color={CustomColors.grey} style={{ textAlign: 'center' }}>
        Start the login here
      </Typography>
    </View>
  );
}