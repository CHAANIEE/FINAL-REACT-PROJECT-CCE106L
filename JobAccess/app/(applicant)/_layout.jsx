import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicantLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1d4ed8' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}