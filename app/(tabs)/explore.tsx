import { Button, Typography } from '@/components/ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function ExploreScreen() {
  const handleLearnMore = () => {
    router.push('/modal');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
      <Typography variant="h2" color="#155DFC" style={{ marginBottom: 16 }}>
        Explore
      </Typography>
      <Typography variant="body" style={{ textAlign: 'center', marginBottom: 32 }}>
        Discover features and functionality
      </Typography>
      <Button 
        title="Learn More" 
        onPress={handleLearnMore}
        variant="secondary"
      />
    </View>
  );
}