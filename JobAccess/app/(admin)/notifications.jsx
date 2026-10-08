import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminNotifications } from '../../src/features/notifications/useNotifications';
import {
  markNotificationRead,
  markAllRead,
} from '../../src/features/notifications/notificationService';
import { COLORS, RADIUS } from '../../src/constants/theme';

const TYPE_ICON = {
  vacancy_submitted: { name: 'document-text-outline', color: COLORS.blue, bg: COLORS.blueSoft },
  application_submitted: {
    name: 'person-add-outline',
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
};
const DEFAULT_ICON = { name: 'notifications-outline', color: COLORS.primaryDark, bg: '#e2e8f0' };

function timeAgo(ts) {
  if (!ts?.seconds) return 'Just now';
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - ts.seconds));
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminAlerts() {
  const insets = useSafeAreaInsets();
  const { data: alerts, loading, error } = useAdminNotifications();
  const unread = alerts.filter((n) => !n.read).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Alerts</Text>
          <Text style={styles.sub}>
            {unread > 0 ? `${unread} unread` : 'You are all caught up'}
          </Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={() => markAllRead(alerts)}
            activeOpacity={0.8}
          >
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && alerts.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptyNote}>
            New vacancies and applications will show up here.
          </Text>
        </View>
      )}

      {alerts.map((n) => {
        const icon = TYPE_ICON[n.type] || DEFAULT_ICON;
        return (
          <TouchableOpacity
            key={n.id}
            style={[styles.card, !n.read && styles.cardUnread]}
            activeOpacity={0.85}
            onPress={() => !n.read && markNotificationRead(n.id)}
          >
            <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name} size={20} color={icon.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.message}>{n.message}</Text>
              <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
            </View>
            {!n.read && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
  },
  markAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  empty: { alignItems: 'center', paddingVertical: 40 },
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
  emptyNote: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryLight },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  message: { fontSize: 14, color: COLORS.textBody, marginTop: 2, lineHeight: 20 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4 },
});