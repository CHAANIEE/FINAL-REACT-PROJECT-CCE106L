import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useMyApplications } from '../../src/features/applications/useApplications';
import { STATUS_LABELS } from '../../src/features/applications/statusMachine';
import { withdrawApplication } from '../../src/features/auth/accountService';
import StatusTimeline from '../../src/components/StatusTimeline';
import { COLORS, RADIUS } from '../../src/constants/theme';

const STATUS_COLORS = {
  submitted: { color: '#475569', bg: '#e2e8f0' },
  under_review: { color: COLORS.blue, bg: '#dbeafe' },
  shortlisted: { color: '#b45309', bg: '#fef3c7' },
  interview: { color: '#7e22ce', bg: '#f3e8ff' },
  hired: { color: COLORS.primary, bg: COLORS.primaryLight },
  not_selected: { color: COLORS.danger, bg: '#fee2e2' },
  withdrawn: { color: COLORS.textMuted, bg: '#f1f5f9' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'hired', label: 'Hired' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

// Statuses that can still be withdrawn (a rejected application cannot)
const CAN_WITHDRAW = ['submitted', 'under_review', 'shortlisted', 'interview', 'hired'];

function formatDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const router = useRouter();
  const { data: applications, loading, error } = useMyApplications(user?.uid);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const visible =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const doWithdraw = async (app) => {
    setActionError('');
    setBusyId(app.id);
    try {
      await withdrawApplication(app, profile?.name);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmWithdraw = (app) => {
    const isHired = app.status === 'hired';
    const title = isHired ? 'Withdraw from this job?' : 'Withdraw application?';
    const message = isHired
      ? `You were hired for "${app.jobTitle}". Withdrawing will end this job and notify your employer.`
      : `Your application for "${app.jobTitle}" will be withdrawn and your employer will be notified.`;

    // Web browsers don't support Alert buttons, so use the built-in confirm box there
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        doWithdraw(app);
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => doWithdraw(app) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Text style={styles.heading}>My Applications</Text>
        <Text style={styles.subheading}>
          {applications.length} application{applications.length === 1 ? '' : 's'} total
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
                {f.key === 'all' ? ` (${applications.length})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

        {!!(error || actionError) && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error || actionError}</Text>
          </View>
        )}

        {!loading && !error && applications.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyNote}>Jobs you apply for will be tracked here.</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(applicant)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.browseText}>Browse jobs</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && applications.length > 0 && visible.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No applications in this status</Text>
            <Text style={styles.emptyNote}>Try another filter above.</Text>
          </View>
        )}

        {visible.map((app) => {
          const st = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
          const label = STATUS_LABELS[app.status] || app.status;
          const withdrawable = CAN_WITHDRAW.includes(app.status);
          const busy = busyId === app.id;

          return (
            <View key={app.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>{app.jobTitle}</Text>
                  <Text style={styles.company} numberOfLines={1}>{app.company}</Text>
                  {!!formatDate(app.createdAt) && (
                    <Text style={styles.date}>Applied {formatDate(app.createdAt)}</Text>
                  )}
                </View>
                <View style={[styles.pill, { backgroundColor: st.bg }]}>
                  <Text style={[styles.pillText, { color: st.color }]}>{label}</Text>
                </View>
              </View>

              {app.status !== 'withdrawn' && (
                <View style={{ marginTop: 14 }}>
                  <StatusTimeline status={app.status} />
                </View>
              )}

              {withdrawable && (
                <TouchableOpacity
                  style={[styles.withdrawBtn, busy && styles.disabled]}
                  onPress={() => confirmWithdraw(app)}
                  disabled={busy}
                  activeOpacity={0.85}
                >
                  {busy ? (
                    <ActivityIndicator color={COLORS.danger} />
                  ) : (
                    <>
                      <Ionicons name="exit-outline" size={18} color={COLORS.danger} />
                      <Text style={styles.withdrawText}>
                        {app.status === 'hired' ? 'Withdraw from job' : 'Withdraw application'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  subheading: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  chipScroll: { marginTop: 16, flexGrow: 0 },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  chipTextActive: { color: '#ffffff' },

  content: { padding: 20, paddingBottom: 40 },
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
  browseBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  browseText: { color: '#ffffff', fontWeight: '700' },

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
    padding: 16,
    marginBottom: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  company: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { fontSize: 12, fontWeight: '700' },

  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  withdrawText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});