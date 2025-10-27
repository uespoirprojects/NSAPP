import { Typography } from '@/components/ui';
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
      style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F2F8FF' }}
      onTouchEnd={handleLogin}
    >
      <Typography variant="h1" color="#155DFC" style={{ marginBottom: 16, textAlign: 'center' }}>
        NSAPP
      </Typography>

      <Typography variant="body" color="#ECECF0" style={{ textAlign: 'center' }}>
        Start the login here
      </Typography>
    </View>
  );
}