import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1d4ed8' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-vacancy"
        options={{
          title: 'Post Job',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-postings"
        options={{
          title: 'My Postings',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />

      {/* Opened from a posting, so hidden from the tab bar */}
      <Tabs.Screen name="applicants/[postingId]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}