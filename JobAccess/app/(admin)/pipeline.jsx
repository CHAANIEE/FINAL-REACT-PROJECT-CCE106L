import { useState } from 'react';
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
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAllApplications } from '../../src/features/applications/useApplications';
import { updateApplicationStatus } from '../../src/features/applications/applicationService';
import {
  APPLICATION_STATUS,
  STATUS_LABELS,
  nextStatuses,
} from '../../src/features/applications/statusMachine';
import { COLORS, RADIUS } from '../../src/constants/theme';

const STATUS_COLORS = {
  submitted: { color: '#475569', bg: '#e2e8f0' },
  under_review: { color: COLORS.blue, bg: '#dbeafe' },
  shortlisted: { color: '#b45309', bg: '#fef3c7' },
  interview: { color: '#7e22ce', bg: '#f3e8ff' },
  hired: { color: COLORS.primary, bg: COLORS.primaryLight },
  not_selected: { color: COLORS.danger, bg: '#fee2e2' },
};

const FILTERS = ['all', ...Object.values(APPLICATION_STATUS)];

function formatDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Pipeline() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: applications, loading, error } = useAllApplications();
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const countFor = (f) =>
    f === 'all' ? applications.length : applications.filter((a) => a.status === f).length;

  const visible =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const move = async (application, newStatus) => {
    setActionError('');
    setBusyId(application.id);
    try {
      await updateApplicationStatus(application, newStatus, user.uid);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.heading}>Applicant Pipeline</Text>
      <Text style={styles.sub}>Review applications and move them through each stage.</Text>

      {/* Status filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f === 'all' ? 'All' : STATUS_LABELS[f]} ({countFor(f)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!(error || actionError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error || actionError}</Text>
        </View>
      )}

      {!loading && !error && visible.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {applications.length === 0 ? 'No applications yet' : 'Nothing in this stage'}
          </Text>
          <Text style={styles.emptyNote}>
            {applications.length === 0
              ? 'Applications from job seekers will appear here.'
              : 'Try another status filter.'}
          </Text>
        </View>
      )}

      {visible.map((app) => {
        const st = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
        const options = nextStatuses(app.status);
        const busy = busyId === app.id;

        return (
          <View key={app.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(app.applicantName || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {app.applicantName || 'Applicant'}
                </Text>
                <Text style={styles.job} numberOfLines={1}>
                  {app.jobTitle}
                  {app.company ? ` · ${app.company}` : ''}
                </Text>
                {!!formatDate(app.createdAt) && (
                  <Text style={styles.date}>Applied {formatDate(app.createdAt)}</Text>
                )}
              </View>
              <View style={[styles.pill, { backgroundColor: st.bg }]}>
                <Text style={[styles.pillText, { color: st.color }]}>
                  {STATUS_LABELS[app.status] || app.status}
                </Text>
              </View>
            </View>

            {options.length > 0 && (
              <View style={styles.actions}>
                {options.map((next) => {
                  const negative = next === APPLICATION_STATUS.NOT_SELECTED;
                  return (
                    <TouchableOpacity
                      key={next}
                      style={[
                        styles.btn,
                        negative ? styles.btnNegative : styles.btnPositive,
                        busy && styles.disabled,
                      ]}
                      onPress={() => move(app, next)}
                      disabled={busy}
                      activeOpacity={0.85}
                    >
                      {busy ? (
                        <ActivityIndicator color={negative ? COLORS.danger : '#ffffff'} />
                      ) : (
                        <Text style={negative ? styles.btnNegativeText : styles.btnPositiveText}>
                          {negative ? 'Not Selected' : `Move to ${STATUS_LABELS[next]}`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  filterScroll: { marginTop: 16, marginBottom: 12, flexGrow: 0 },
  filterRow: { gap: 8 },
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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.primaryDark, fontSize: 16, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  job: { fontSize: 13, color: COLORS.textBody, marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { fontSize: 12, fontWeight: '700' },

  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  btn: {
    flexGrow: 1,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPositive: { backgroundColor: COLORS.primary },
  btnPositiveText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  btnNegative: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: '#fecaca' },
  btnNegativeText: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.6 },
});