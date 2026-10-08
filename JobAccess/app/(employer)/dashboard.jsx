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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { logout } from '../../src/features/auth/authService';
import { useEmployerPostings } from '../../src/features/postings/usePostings';
import { useEmployerApplications } from '../../src/features/applications/useEmployerApplications';
import { useUserNotifications } from '../../src/features/notifications/useNotifications';
import { COLORS, RADIUS } from '../../src/constants/theme';

const STATUS_STYLE = {
  live: { label: 'Live', color: COLORS.primary, bg: COLORS.primaryLight },
  removed: { label: 'Taken down', color: COLORS.danger, bg: '#fee2e2' },
};

const RECENT_LIMIT = 5;

export default function EmployerDashboard() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const router = useRouter();
  const { data: postings, loading, error } = useEmployerPostings(user?.uid);
  const { data: applications } = useEmployerApplications(user?.uid);
  const { data: alerts } = useUserNotifications(user?.uid);

  const unread = alerts.filter((n) => !n.read).length;
  const live = postings.filter((p) => p.status === 'live').length;
  const underReview = postings.filter((p) => p.status === 'live' && !p.reviewed).length;
  const applicantCount = (jobId) => applications.filter((a) => a.jobId === jobId).length;

  const stats = [
    {
      label: 'Live',
      value: live,
      icon: 'checkmark-circle-outline',
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      label: 'Under review',
      value: underReview,
      icon: 'hourglass-outline',
      color: '#b45309',
      bg: '#fef3c7',
    },
    {
      label: 'Applicants',
      value: applications.length,
      icon: 'people-outline',
      color: COLORS.blue,
      bg: COLORS.blueSoft,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>EMPLOYER</Text>
          <Text style={styles.hello} numberOfLines={1}>
            {profile?.name || 'Employer'}
          </Text>
          <Text style={styles.sub}>Manage your vacancies and applicants</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(employer)/notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.primaryDark} />
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary action */}
      <TouchableOpacity
        style={styles.postBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/(employer)/post-vacancy')}
      >
        <View style={styles.postIcon}>
          <Ionicons name="add" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postBtnTitle}>Post a new vacancy</Text>
          <Text style={styles.postBtnSub}>It goes live right away and PESO reviews it</Text>
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

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && postings.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No postings yet</Text>
          <Text style={styles.emptyNote}>
            Post your first vacancy. It goes live as soon as you submit it.
          </Text>
        </View>
      )}

      {postings.slice(0, RECENT_LIMIT).map((p) => {
        const st = STATUS_STYLE[p.status] || STATUS_STYLE.live;
        const isLive = p.status === 'live';
        return (
          <TouchableOpacity
            key={p.id}
            style={styles.postingCard}
            activeOpacity={0.85}
            disabled={!isLive}
            onPress={() => router.push(`/(employer)/applicants/${p.id}`)}
          >
            <View style={styles.postingIcon}>
              <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.postingTitle} numberOfLines={1}>{p.title}</Text>
              <Text style={styles.postingSub} numberOfLines={1}>
                {isLive
                  ? `${applicantCount(p.id)} applicant(s)`
                  : `${p.type} · ${p.location}`}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
              <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
            </View>
            {isLive && (
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  hello: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },
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
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
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
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  postIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  postBtnSub: { color: COLORS.primaryLight, fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
  seeAll: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

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
  emptyNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  postingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postingIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  postingSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  statusText: { fontSize: 12, fontWeight: '700' },
});