import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#155DFC',
        tabBarInactiveTintColor: '#030213',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#ECECF0',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: 'My Learning',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
