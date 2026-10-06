import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { logout } from '../../src/features/auth/authService';
import { useEmployerPostings } from '../../src/features/postings/usePostings';
import { useEmployerApplications } from '../../src/features/applications/useEmployerApplications';
import { useUserNotifications } from '../../src/features/notifications/useNotifications';

const STATUS_STYLE = {
  approved: { label: 'Approved', color: '#15803d', bg: '#dcfce7' },
  pending: { label: 'Pending review', color: '#b45309', bg: '#fef3c7' },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fee2e2' },
};

const RECENT_LIMIT = 5;

export default function EmployerDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { data: postings, loading, error } = useEmployerPostings(user?.uid);
  const { data: applications } = useEmployerApplications(user?.uid);
  const { data: alerts } = useUserNotifications(user?.uid);

  const unread = alerts.filter((n) => !n.read).length;
  const approved = postings.filter((p) => p.status === 'approved').length;
  const pending = postings.filter((p) => p.status === 'pending').length;
  const applicantCount = (jobId) => applications.filter((a) => a.jobId === jobId).length;

  const stats = [
    { label: 'Approved', value: approved, icon: 'checkmark-circle-outline', color: '#15803d', bg: '#dcfce7' },
    { label: 'Pending review', value: pending, icon: 'hourglass-outline', color: '#b45309', bg: '#fef3c7' },
    { label: 'Applicants', value: applications.length, icon: 'people-outline', color: '#1d4ed8', bg: '#eff6ff' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>EMPLOYER</Text>
          <Text style={styles.hello} numberOfLines={1}>{profile?.name || 'Employer'}</Text>
          <Text style={styles.sub}>Manage your vacancies and applicants</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(employer)/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#475569" />
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary action */}
      <TouchableOpacity
        style={styles.postBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/(employer)/post-vacancy')}
      >
        <Ionicons name="add-circle" size={24} color="#ffffff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.postBtnTitle}>Post a new vacancy</Text>
          <Text style={styles.postBtnSub}>PESO staff will review it before it goes live</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={18} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Postings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your postings</Text>
        {postings.length > RECENT_LIMIT && (
          <TouchableOpacity onPress={() => router.push('/(employer)/my-postings')}>
            <Text style={styles.seeAll}>View all</Text>
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

      {!loading && !error && postings.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-text-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>No postings yet</Text>
          <Text style={styles.emptyNote}>
            Post your first vacancy. It will go live after PESO approves it.
          </Text>
        </View>
      )}

      {postings.slice(0, RECENT_LIMIT).map((p) => {
        const st = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
        const isApproved = p.status === 'approved';
        return (
          <TouchableOpacity
            key={p.id}
            style={styles.postingCard}
            activeOpacity={0.85}
            disabled={!isApproved}
            onPress={() => router.push(`/(employer)/applicants/${p.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.postingTitle}>{p.title}</Text>
              <Text style={styles.postingSub}>
                {isApproved
                  ? `${applicantCount(p.id)} applicant(s)`
                  : `${p.type} · ${p.location}`}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
              <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
            </View>
            {isApproved && <Ionicons name="chevron-forward" size={18} color="#94a3b8" />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  hello: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1d4ed8',
  },
  postBtnTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  postBtnSub: { color: '#dbeafe', fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#1d4ed8' },
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
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
  postingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postingTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  postingSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
});