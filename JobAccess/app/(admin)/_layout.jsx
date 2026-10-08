import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePendingPostings } from '../../src/features/postings/usePostings';
import { useAdminNotifications } from '../../src/features/notifications/useNotifications';
import { COLORS } from '../../src/constants/theme';

function TabIcon({ name, focused, color, size }) {
  return (
    <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
  );
}

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const { data: pending } = usePendingPostings();
  const { data: alerts } = useAdminNotifications();

  const reviewCount = pending.length;
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
        name="approval-queue"
        options={{
          title: 'Review',
          tabBarIcon: (props) => <TabIcon name="checkmark-done" {...props} />,
          tabBarBadge: reviewCount > 0 ? reviewCount : undefined,
        }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Pipeline',
          tabBarIcon: (props) => <TabIcon name="people" {...props} />,
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'People',
          tabBarIcon: (props) => <TabIcon name="id-card" {...props} />,
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

      {/* Opened from the People list, so hidden from the tab bar */}
      <Tabs.Screen name="person/[uid]" options={{ href: null }} />
    </Tabs>
  );
}