import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicantLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1d4ed8' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* Opened from other screens, so hidden from the tab bar */}
      <Tabs.Screen name="job/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="apply/[jobId]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}