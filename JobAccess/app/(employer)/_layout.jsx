import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useUserNotifications } from '../../src/features/notifications/useNotifications';
import { COLORS } from '../../src/constants/theme';

function TabIcon({ name, focused, color, size }) {
  return (
    <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
  );
}

export default function EmployerLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: alerts } = useUserNotifications(user?.uid);

  const unreadCount = alerts.filter((n) => !n.read).length;
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },
        tabBarBadgeStyle: {
          backgroundColor: COLORS.danger,
          color: '#ffffff',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: (props) => <TabIcon name="grid" {...props} />,
        }}
      />
      <Tabs.Screen
        name="post-vacancy"
        options={{
          title: 'Post Job',
          tabBarIcon: (props) => <TabIcon name="add-circle" {...props} />,
        }}
      />
      <Tabs.Screen
        name="my-postings"
        options={{
          title: 'My Postings',
          tabBarIcon: (props) => <TabIcon name="list" {...props} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: (props) => <TabIcon name="notifications" {...props} />,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Company',
          tabBarIcon: (props) => <TabIcon name="business" {...props} />,
        }}
      />

      {/* Opened from a posting, so hidden from the tab bar */}
      <Tabs.Screen name="applicants/[postingId]" options={{ href: null }} />
    </Tabs>
  );
}