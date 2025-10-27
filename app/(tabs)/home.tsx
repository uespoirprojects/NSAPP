import { Typography } from '@/components/ui';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F8FF' }}>
      <Typography variant="h1" color="#155DFC" style={{ textAlign: 'center', marginBottom: 16 }}>
        Home
      </Typography>
      <Typography variant="body" color="#030213" style={{ textAlign: 'center' }}>
        Welcome to NS App
      </Typography>
    </View>
  );
}
