import { Button, Typography } from '@/components/ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function HomeScreen() {
  const handleGetStarted = () => {
    router.push('/modal');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
      <Typography variant="h1" color="#155DFC" style={{ marginBottom: 16 }}>
        Welcome to NS App
      </Typography>
      <Typography variant="body" style={{ textAlign: 'center', marginBottom: 32 }}>
        Start building your app here with Poppins font and custom colors
      </Typography>
      <Button 
        title="Get Started" 
        onPress={handleGetStarted}
        variant="primary"
      />
    </View>
  );
}