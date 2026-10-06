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
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAllApplications } from '../../src/features/applications/useApplications';
import { updateApplicationStatus } from '../../src/features/applications/applicationService';
import {
  APPLICATION_STATUS,
  STATUS_LABELS,
  nextStatuses,
} from '../../src/features/applications/statusMachine';

const STATUS_COLORS = {
  submitted: { color: '#475569', bg: '#e2e8f0' },
  under_review: { color: '#1d4ed8', bg: '#dbeafe' },
  shortlisted: { color: '#b45309', bg: '#fef3c7' },
  interview: { color: '#7e22ce', bg: '#f3e8ff' },
  hired: { color: '#15803d', bg: '#dcfce7' },
  not_selected: { color: '#b91c1c', bg: '#fee2e2' },
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Applicant pipeline</Text>
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
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f === 'all' ? 'All' : STATUS_LABELS[f]} ({countFor(f)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#0f172a" />}

      {!!(error || actionError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error || actionError}</Text>
        </View>
      )}

      {!loading && !error && visible.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={32} color="#0f172a" />
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
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{app.applicantName || 'Applicant'}</Text>
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
                    >
                      {busy ? (
                        <ActivityIndicator color={negative ? '#b91c1c' : '#ffffff'} />
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
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  filterScroll: { marginTop: 16, marginBottom: 16, flexGrow: 0 },
  filterRow: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
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
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  job: { fontSize: 13, color: '#475569', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  btn: {
    flexGrow: 1,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPositive: { backgroundColor: '#0f172a' },
  btnPositiveText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  btnNegative: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  btnNegativeText: { color: '#b91c1c', fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.6 },
});