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
import { useApprovedJobs } from '../../src/features/postings/usePostings';
import { useMyApplications } from '../../src/features/applications/useApplications';
import JobCard from '../../src/components/JobCard';

export default function ApplicantHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { data: jobs, loading, error } = useApprovedJobs();
  const { data: applications } = useMyApplications(user?.uid);
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'there';

  const stats = [
    {
      label: 'Applied',
      value: applications.length,
      icon: 'paper-plane-outline',
      color: '#1d4ed8',
      bg: '#eff6ff',
    },
    {
      label: 'Shortlisted',
      value: applications.filter((a) => a.status === 'shortlisted').length,
      icon: 'star-outline',
      color: '#b45309',
      bg: '#fef3c7',
    },
    {
      label: 'Interviews',
      value: applications.filter((a) => a.status === 'interview').length,
      icon: 'calendar-outline',
      color: '#15803d',
      bg: '#dcfce7',
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hello, {firstName}</Text>
          <Text style={styles.sub}>Find your next job in Tagum City</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={styles.search}
        activeOpacity={0.8}
        onPress={() => router.push('/(applicant)/search')}
      >
        <Ionicons name="search-outline" size={20} color="#64748b" />
        <Text style={styles.searchText}>Search jobs, companies, barangays</Text>
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

      {/* PESO-approved jobs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Job Openings</Text>
        <Text style={styles.verified}>PESO verified</Text>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && jobs.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="briefcase-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>No job openings yet</Text>
          <Text style={styles.emptyNote}>
            Vacancies approved by PESO Tagum will appear here.
          </Text>
        </View>
      )}

      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchText: { color: '#94a3b8', fontSize: 15 },
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
  verified: { fontSize: 13, fontWeight: '600', color: '#15803d' },
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
});