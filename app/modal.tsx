import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Modal Screen
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
        This is a modal screen
      </Text>
      <Link href="/" style={{ padding: 10, backgroundColor: '#155DFC', borderRadius: 5 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Close Modal</Text>
      </Link>
    </View>
  );
}