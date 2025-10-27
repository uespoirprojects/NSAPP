import { Typography } from '@/components/ui';
import { View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F8FF' }}>
      <Typography variant="h1" color="#155DFC" style={{ textAlign: 'center', marginBottom: 16 }}>
        Profile
      </Typography>
      <Typography variant="body" color="#030213" style={{ textAlign: 'center' }}>
        Profile Section
      </Typography>
    </View>
  );
}
