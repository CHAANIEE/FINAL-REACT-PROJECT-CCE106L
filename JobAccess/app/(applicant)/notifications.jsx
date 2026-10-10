import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useUserNotifications } from '../../src/features/notifications/useNotifications';
import NotificationList from '../../src/components/NotificationList';
import { COLORS } from '../../src/constants/theme';

export default function ApplicantAlerts() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, loading, error } = useUserNotifications(user?.uid);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Text style={styles.heading}>Notifications</Text>
        <Text style={styles.subheading}>Updates on your applications and PESO Tagum</Text>
      </View>

      <NotificationList items={data} loading={loading} error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  subheading: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});