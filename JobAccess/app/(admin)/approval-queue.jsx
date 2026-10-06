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
import { usePendingPostings } from '../../src/features/postings/usePostings';
import { reviewPosting } from '../../src/features/postings/postingService';

export default function ApprovalQueue() {
  const { user } = useAuth();
  const { data: pending, loading, error } = usePendingPostings();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const decide = async (jobId, status) => {
    setActionError('');
    setBusyId(jobId);
    try {
      await reviewPosting(jobId, status, user.uid);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Pending vacancies</Text>
      <Text style={styles.sub}>
        Approve a posting to publish it to job seekers, or reject it.
      </Text>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#0f172a" />}

      {!!(error || actionError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error || actionError}</Text>
        </View>
      )}

      {!loading && !error && pending.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="checkmark-done-outline" size={32} color="#0f172a" />
          </View>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyNote}>No vacancies are waiting for review.</Text>
        </View>
      )}

      {pending.map((job) => {
        const busy = busyId === job.id;
        return (
          <View key={job.id} style={styles.card}>
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.title}>{job.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.meta}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{job.type}</Text>
              </View>
            </View>

            <Text style={styles.salary}>{job.salary}</Text>

            <Text style={styles.blockLabel}>Description</Text>
            <Text style={styles.blockText}>{job.description}</Text>

            {!!job.requirements && (
              <>
                <Text style={styles.blockLabel}>Requirements</Text>
                <Text style={styles.blockText}>{job.requirements}</Text>
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.reject, busy && styles.disabled]}
                onPress={() => decide(job.id, 'rejected')}
                disabled={busy}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.approve, busy && styles.disabled]}
                onPress={() => decide(job.id, 'approved')}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.approveText}>Approve</Text>
                )}
              </TouchableOpacity>
            </View>
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
  sub: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 16 },
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
  emptyNote: { fontSize: 14, color: '#64748b', marginTop: 4 },
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
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  company: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748b' },
  salary: { fontSize: 14, fontWeight: '600', color: '#1d4ed8', marginTop: 8 },
  blockLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 14 },
  blockText: { fontSize: 14, color: '#334155', marginTop: 2, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reject: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  rejectText: { color: '#b91c1c', fontWeight: '700', fontSize: 15 },
  approve: { backgroundColor: '#15803d' },
  approveText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
});