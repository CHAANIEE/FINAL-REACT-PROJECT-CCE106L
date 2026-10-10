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
import { confirmLogout } from '../../src/utils/confirmLogout';
import { useApprovedJobs } from '../../src/features/postings/usePostings';
import { useMyApplications } from '../../src/features/applications/useApplications';
import JobCard from '../../src/components/JobCard';
import { COLORS, RADIUS } from '../../src/constants/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export default function ApplicantHome() {
  const insets = useSafeAreaInsets();
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
      color: COLORS.blue,
      bg: COLORS.blueSoft,
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
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Green header card with greeting and search */}
      <View style={[styles.hero, { paddingTop: 16 }]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.search}
          activeOpacity={0.8}
          onPress={() => router.push('/(applicant)/search')}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.searchText}>Search jobs, companies, barangays</Text>
        </TouchableOpacity>
      </View>

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
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
          <Text style={styles.verified}>PESO verified</Text>
        </View>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && jobs.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="briefcase-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No job openings yet</Text>
          <Text style={styles.emptyNote}>
            Vacancies approved by PESO Tagum will appear here.
          </Text>
        </View>
      )}

      <View style={styles.jobList}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 32 },

  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 14, color: COLORS.primaryLight },
  name: { fontSize: 26, fontWeight: '800', color: '#ffffff', marginTop: 2 },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
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
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  searchText: { color: COLORS.textMuted, fontSize: 15 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 20,
  },
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
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
  },
  verified: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  jobList: { paddingHorizontal: 20 },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
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
    marginHorizontal: 20,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },
});