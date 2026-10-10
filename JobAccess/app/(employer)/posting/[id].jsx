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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useJob } from '../../../src/features/postings/useJob';
import { useEmployerApplications } from '../../../src/features/applications/useEmployerApplications';
import { COLORS, RADIUS } from '../../../src/constants/theme';

// Works out the status shown to the employer for a vacancy
function getStatus(job) {
  if (job.status === 'removed') {
    return {
      label: 'Taken down',
      color: COLORS.danger,
      bg: '#fee2e2',
      icon: 'close-circle-outline',
      note: 'PESO took this vacancy down. Job seekers can no longer see it. Check the description and requirements, then post a corrected one.',
    };
  }
  if (!job.reviewed) {
    return {
      label: 'Live · Waiting for PESO review',
      color: '#b45309',
      bg: '#fef3c7',
      icon: 'hourglass-outline',
      note: 'Your vacancy is live and job seekers can already see it. PESO has not reviewed it yet.',
    };
  }
  return {
    label: 'Live · Reviewed by PESO',
    color: COLORS.primary,
    bg: COLORS.primaryLight,
    icon: 'checkmark-circle-outline',
    note: 'Your vacancy is live and has been reviewed by PESO.',
  };
}

function formatPosted(createdAt) {
  if (!createdAt?.seconds) return '';
  return new Date(createdAt.seconds * 1000).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostingDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const jobId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuth();
  const { job, loading, error } = useJob(jobId);
  const { data: applications } = useEmployerApplications(user?.uid);

  const applicantCount = applications.filter((a) => a.jobId === jobId).length;
  const status = job ? getStatus(job) : null;
  const posted = job ? formatPosted(job.createdAt) : '';
  const isLive = job?.status === 'live';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Posting Details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !job && (
          <Text style={styles.notFound}>This posting no longer exists.</Text>
        )}

        {!!job && (
          <>
            <View style={styles.hero}>
              <View style={styles.iconBox}>
                <Ionicons name="briefcase" size={30} color={COLORS.primary} />
              </View>
              <Text style={styles.company}>{job.company}</Text>
            </View>

            <Text style={styles.title}>{job.title}</Text>

            {/* Status */}
            <View style={[styles.statusCard, { backgroundColor: status.bg }]}>
              <View style={styles.statusTop}>
                <Ionicons name={status.icon} size={20} color={status.color} />
                <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
              </View>
              <Text style={[styles.statusNote, { color: status.color }]}>{status.note}</Text>
            </View>

            {/* Job details */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>{job.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>{job.type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
                <Text style={styles.salary}>{job.salary}</Text>
              </View>
              {!!posted && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>Posted {posted}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {applicantCount} applicant{applicantCount === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Job Description</Text>
            <Text style={styles.body}>{job.description}</Text>

            {!!job.requirements && (
              <>
                <Text style={styles.sectionLabel}>Requirements</Text>
                <Text style={styles.body}>{job.requirements}</Text>
              </>
            )}
          </>
        )}
      </ScrollView>

      {!!job && isLive && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push(`/(employer)/applicants/${jobId}`)}
          >
            <Ionicons name="people-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryText}>View applicants ({applicantCount})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 20, paddingBottom: 24 },

  notFound: { fontSize: 16, color: COLORS.textMuted, marginTop: 40, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  hero: { alignItems: 'center', marginBottom: 16 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  company: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center' },

  statusCard: { marginTop: 18, padding: 14, borderRadius: RADIUS.lg },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 15, fontWeight: '800', flex: 1 },
  statusNote: { fontSize: 13, marginTop: 6, lineHeight: 19 },

  infoCard: {
    marginTop: 14,
    padding: 16,
    gap: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: COLORS.textBody, flex: 1 },
  salary: { fontSize: 16, fontWeight: '800', color: COLORS.primary, flex: 1 },

  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 24 },
  body: { fontSize: 14, color: COLORS.textBody, marginTop: 6, lineHeight: 22 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});