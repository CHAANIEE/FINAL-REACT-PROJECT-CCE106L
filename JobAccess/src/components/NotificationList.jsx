import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  markNotificationRead,
  markAllRead,
} from '../features/notifications/notificationService';

const TYPE_ICON = {
  application_status: { name: 'swap-horizontal-outline', color: '#1d4ed8', bg: '#dbeafe' },
  vacancy_approved: { name: 'checkmark-circle-outline', color: '#15803d', bg: '#dcfce7' },
  vacancy_rejected: { name: 'close-circle-outline', color: '#b91c1c', bg: '#fee2e2' },
  vacancy_submitted: { name: 'document-text-outline', color: '#1d4ed8', bg: '#dbeafe' },
  vacancy_removed: { name: 'close-circle-outline', color: '#b91c1c', bg: '#fee2e2' },
  verification_result: { name: 'shield-checkmark-outline', color: '#15803d', bg: '#dcfce7' },
  application_submitted: { name: 'person-add-outline', color: '#15803d', bg: '#dcfce7' },
};
const DEFAULT_ICON = { name: 'notifications-outline', color: '#475569', bg: '#e2e8f0' };

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

export default function NotificationList({ items, loading, error }) {
  const unread = items.filter((n) => !n.read).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.sub}>
          {unread > 0 ? `${unread} unread` : 'You are all caught up'}
        </Text>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAllRead(items)}>
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptyNote}>Updates from PESO Tagum will show up here.</Text>
        </View>
      )}

      {items.map((n) => {
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
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sub: { fontSize: 14, color: '#64748b' },
  markAll: { fontSize: 14, fontWeight: '700', color: '#1d4ed8' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  emptyNote: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardUnread: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  message: { fontSize: 14, color: '#334155', marginTop: 2, lineHeight: 20 },
  time: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1d4ed8', marginTop: 4 },
});