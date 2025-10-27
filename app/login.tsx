import { Typography } from '@/components/ui';
import { View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F2F8FF' }}>
      <Typography variant="h1" color="#155DFC" style={{ marginBottom: 16, textAlign: 'center' }}>
        NSAPP
      </Typography>

      <Typography variant="body" color="##5D6777" style={{ textAlign: 'center' }}>
        Start the login here
      </Typography>
    </View>
  );
}