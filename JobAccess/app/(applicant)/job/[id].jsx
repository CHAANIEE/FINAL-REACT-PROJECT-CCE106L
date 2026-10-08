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
import { useMyApplications } from '../../../src/features/applications/useApplications';
import { STATUS_LABELS } from '../../../src/features/applications/statusMachine';
import { COLORS, RADIUS } from '../../../src/constants/theme';

export default function JobDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const jobId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuth();
  const { job, loading, error } = useJob(jobId);
  const { data: myApps } = useMyApplications(user?.uid);
  const applied = myApps.find((a) => a.jobId === jobId);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
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
          <Text style={styles.notFound}>This job is no longer available.</Text>
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

      {!!job && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {applied ? (
            <>
              <Text style={styles.appliedText}>
                You applied · {STATUS_LABELS[applied.status] || applied.status}
              </Text>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push('/(applicant)/applications')}
              >
                <Text style={styles.secondaryText}>View my applications</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.85}
              onPress={() => router.push(`/(applicant)/apply/${jobId}`)}
            >
              <Ionicons name="briefcase-outline" size={18} color="#ffffff" />
              <Text style={styles.applyText}>Apply Now</Text>
            </TouchableOpacity>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  infoCard: {
    marginTop: 18,
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
  applyBtn: {
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  appliedText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 10,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});