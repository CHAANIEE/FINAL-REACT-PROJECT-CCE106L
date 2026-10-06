import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useJob } from '../../../src/features/postings/useJob';
import { useEmployerApplications } from '../../../src/features/applications/useEmployerApplications';
import { updateApplicationStatus } from '../../../src/features/applications/applicationService';
import { STATUS_LABELS, nextStatuses } from '../../../src/features/applications/statusMachine';
import StatusTimeline from '../../../src/components/StatusTimeline';

const STATUS_COLORS = {
  submitted: { color: '#475569', bg: '#e2e8f0' },
  under_review: { color: '#1d4ed8', bg: '#dbeafe' },
  shortlisted: { color: '#b45309', bg: '#fef3c7' },
  interview: { color: '#7e22ce', bg: '#f3e8ff' },
  hired: { color: '#15803d', bg: '#dcfce7' },
  not_selected: { color: '#b91c1c', bg: '#fee2e2' },
};

// PESO screens applicants up to "Shortlisted". Employers decide from there.
const EMPLOYER_STAGES = ['shortlisted', 'interview'];

const ACTION_LABELS = {
  interview: 'Schedule Interview',
  hired: 'Mark as Hired',
  not_selected: 'Not Selected',
};

function formatDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PostingApplicants() {
  const { postingId } = useLocalSearchParams();
  const jobId = Array.isArray(postingId) ? postingId[0] : postingId;
  const router = useRouter();
  const { user } = useAuth();
  const { job } = useJob(jobId);
  const { data: all, loading, error } = useEmployerApplications(user?.uid);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const applicants = all.filter((a) => a.jobId === jobId);

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
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#0f172a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Applicants</Text>
      {!!job && <Text style={styles.sub}>{job.title}</Text>}

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!(error || actionError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error || actionError}</Text>
        </View>
      )}

      {!loading && !error && applicants.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>No applicants yet</Text>
          <Text style={styles.emptyNote}>Job seekers who apply will appear here.</Text>
        </View>
      )}

      {applicants.map((app) => {
        const st = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
        const canAct = EMPLOYER_STAGES.includes(app.status);
        const options = canAct ? nextStatuses(app.status) : [];
        const busy = busyId === app.id;
        const screening = app.status === 'submitted' || app.status === 'under_review';

        return (
          <View key={app.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{app.applicantName || 'Applicant'}</Text>
                {!!app.applicantEmail && <Text style={styles.email}>{app.applicantEmail}</Text>}
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

            {!!app.note && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Message</Text>
                <Text style={styles.noteText}>{app.note}</Text>
              </View>
            )}

            <View style={{ marginTop: 14 }}>
              <StatusTimeline status={app.status} />
            </View>

            {screening && (
              <Text style={styles.hint}>PESO is still screening this applicant.</Text>
            )}

            {options.length > 0 && (
              <View style={styles.actions}>
                {options.map((next) => {
                  const negative = next === 'not_selected';
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
                          {ACTION_LABELS[next] || STATUS_LABELS[next]}
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
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 15, color: '#64748b', marginTop: 4, marginBottom: 16 },
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
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 13, color: '#475569', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700' },
  noteBox: { marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#f8fafc' },
  noteLabel: { fontSize: 12, fontWeight: '700', color: '#475569' },
  noteText: { fontSize: 14, color: '#334155', marginTop: 2, lineHeight: 20 },
  hint: { fontSize: 13, color: '#b45309', marginTop: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  btn: {
    flexGrow: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPositive: { backgroundColor: '#1d4ed8' },
  btnPositiveText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  btnNegative: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  btnNegativeText: { color: '#b91c1c', fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.6 },
});