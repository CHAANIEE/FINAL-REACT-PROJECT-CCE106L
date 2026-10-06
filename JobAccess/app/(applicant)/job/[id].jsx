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
import { useMyApplications } from '../../../src/features/applications/useApplications';
import { STATUS_LABELS } from '../../../src/features/applications/statusMachine';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const jobId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuth();
  const { job, loading, error } = useJob(jobId);
  const { data: myApps } = useMyApplications(user?.uid);
  const applied = myApps.find((a) => a.jobId === jobId);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#1d4ed8" />}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !job && (
          <Text style={styles.notFound}>This job is no longer available.</Text>
        )}

        {!!job && (
          <>
            <View style={styles.iconBox}>
              <Ionicons name="briefcase-outline" size={28} color="#1d4ed8" />
            </View>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>

            <View style={styles.tags}>
              <View style={styles.tag}>
                <Ionicons name="location-outline" size={14} color="#475569" />
                <Text style={styles.tagText}>{job.location}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="time-outline" size={14} color="#475569" />
                <Text style={styles.tagText}>{job.type}</Text>
              </View>
            </View>

            <Text style={styles.salary}>{job.salary}</Text>

            <Text style={styles.sectionLabel}>Description</Text>
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
        <View style={styles.footer}>
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
              <Text style={styles.applyText}>Apply Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  notFound: { fontSize: 16, color: '#64748b', marginTop: 40, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  company: { fontSize: 16, color: '#64748b', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  tagText: { fontSize: 13, color: '#475569' },
  salary: { fontSize: 18, fontWeight: '700', color: '#1d4ed8', marginTop: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 24 },
  body: { fontSize: 15, color: '#334155', marginTop: 6, lineHeight: 22 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  applyBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  appliedText: { textAlign: 'center', color: '#15803d', fontWeight: '700', marginBottom: 10 },
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
});