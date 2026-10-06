import { useState } from 'react';
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
import { useEmployerPostings } from '../../src/features/postings/usePostings';
import { useEmployerApplications } from '../../src/features/applications/useEmployerApplications';

const STATUS_STYLE = {
  approved: { label: 'Approved', color: '#15803d', bg: '#dcfce7' },
  pending: { label: 'Pending review', color: '#b45309', bg: '#fef3c7' },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fee2e2' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyPostings() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: postings, loading, error } = useEmployerPostings(user?.uid);
  const { data: applications } = useEmployerApplications(user?.uid);
  const [filter, setFilter] = useState('all');

  const countFor = (key) =>
    key === 'all' ? postings.length : postings.filter((p) => p.status === key).length;
  const visible = filter === 'all' ? postings : postings.filter((p) => p.status === filter);
  const applicantCount = (jobId) => applications.filter((a) => a.jobId === jobId).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label} ({countFor(f.key)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && visible.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="list-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>
            {postings.length === 0 ? 'No postings yet' : 'Nothing here'}
          </Text>
          <Text style={styles.emptyNote}>
            {postings.length === 0
              ? 'Vacancies you post will be listed here.'
              : 'No postings match this filter.'}
          </Text>
          {postings.length === 0 && (
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => router.push('/(employer)/post-vacancy')}
            >
              <Text style={styles.postBtnText}>Post a vacancy</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {visible.map((p) => {
        const st = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
        const isApproved = p.status === 'approved';
        return (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{p.title}</Text>
                <Text style={styles.meta}>{p.type} · {p.location}</Text>
                <Text style={styles.salary}>{p.salary}</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: st.bg }]}>
                <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>

            {p.status === 'pending' && (
              <Text style={styles.hint}>Waiting for PESO staff to review this vacancy.</Text>
            )}
            {p.status === 'rejected' && (
              <Text style={styles.hintRed}>
                PESO did not approve this vacancy. You can post a corrected one.
              </Text>
            )}

            {isApproved && (
              <TouchableOpacity
                style={styles.viewBtn}
                activeOpacity={0.85}
                onPress={() => router.push(`/(employer)/applicants/${p.id}`)}
              >
                <Ionicons name="people-outline" size={18} color="#ffffff" />
                <Text style={styles.viewBtnText}>
                  View applicants ({applicantCount(p.id)})
                </Text>
              </TouchableOpacity>
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
  chipScroll: { marginBottom: 16, flexGrow: 0 },
  chipRow: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
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
  postBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
  },
  postBtnText: { color: '#ffffff', fontWeight: '700' },
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
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  salary: { fontSize: 14, fontWeight: '600', color: '#1d4ed8', marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700' },
  hint: { fontSize: 13, color: '#b45309', marginTop: 12 },
  hintRed: { fontSize: 13, color: '#b91c1c', marginTop: 12 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
  },
  viewBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});