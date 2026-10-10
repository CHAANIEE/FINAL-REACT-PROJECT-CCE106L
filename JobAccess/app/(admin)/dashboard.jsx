import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { confirmLogout } from '../../src/utils/confirmLogout';
import { COLORS, RADIUS } from '../../src/constants/theme';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  return (
    <View style={[styles.screen, { paddingTop: 16 }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
            <Text style={styles.badgeText}>STAFF PORTAL</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            Welcome, {profile?.name || 'Admin'}
          </Text>
          <Text style={styles.sub}>PESO Admin dashboard</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons name="grid-outline" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Admin tools coming soon</Text>
        <Text style={styles.emptyNote}>
          Approval queue, pipeline, and notifications are available from the tabs below.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 8,
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
});