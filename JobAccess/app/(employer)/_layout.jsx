import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1d4ed8' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}