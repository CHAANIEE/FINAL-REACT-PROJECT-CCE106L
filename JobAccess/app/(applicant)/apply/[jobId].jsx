import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useJob } from '../../../src/features/postings/useJob';
import { useMyApplications } from '../../../src/features/applications/useApplications';
import { createApplication } from '../../../src/features/applications/applicationService';

export default function ApplyScreen() {
  const { jobId: param } = useLocalSearchParams();
  const jobId = Array.isArray(param) ? param[0] : param;
  const router = useRouter();
  const { user, profile } = useAuth();
  const { job, loading, error } = useJob(jobId);
  const { data: myApps } = useMyApplications(user?.uid);
  const alreadyApplied = myApps.some((a) => a.jobId === jobId);

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  const profileIncomplete =
    !profile?.phone || !profile?.location || !(profile?.skills || []).length;

  const submit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await createApplication({
        job,
        applicant: { uid: user.uid, name: profile?.name || 'Applicant', email: user.email },
        note: note.trim(),
      });
      setDone(true);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Apply for this job</Text>

        {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#1d4ed8" />}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !job && (
          <Text style={styles.muted}>This job is no longer available.</Text>
        )}

        {!!job && (
          <>
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobCompany}>{job.company}</Text>
              <Text style={styles.jobMeta}>{job.location} · {job.type}</Text>
            </View>

            <Text style={styles.label}>Applying as</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{profile?.name}</Text>
              <Text style={styles.profileLine}>{user?.email}</Text>
              {!!profile?.phone && <Text style={styles.profileLine}>{profile.phone}</Text>}
              {!!profile?.location && <Text style={styles.profileLine}>{profile.location}</Text>}
              {!!(profile?.skills || []).length && (
                <Text style={styles.profileLine}>Skills: {profile.skills.join(', ')}</Text>
              )}
            </View>

            {profileIncomplete && (
              <TouchableOpacity
                style={styles.warnBox}
                onPress={() => router.push('/(applicant)/profile')}
              >
                <Ionicons name="information-circle-outline" size={18} color="#b45309" />
                <Text style={styles.warnText}>
                  Your profile is incomplete. Add your phone, barangay and skills so PESO can
                  review you faster. Tap to update.
                </Text>
              </TouchableOpacity>
            )}

            {done ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#15803d" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.successText}>
                    Application sent. PESO staff will review it.
                  </Text>
                  <TouchableOpacity onPress={() => router.replace('/(applicant)/applications')}>
                    <Text style={styles.successLink}>View my applications</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : alreadyApplied ? (
              <View style={styles.warnBox}>
                <Ionicons name="information-circle-outline" size={18} color="#b45309" />
                <Text style={styles.warnText}>You already applied for this job.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Message to the employer (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tell them why you are a good fit"
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={note}
                  onChangeText={setNote}
                />

                {!!submitError && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
                    <Text style={styles.errorText}>{submitError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submit, submitting && styles.submitDisabled]}
                  onPress={submit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  muted: { fontSize: 16, color: '#64748b', marginTop: 40, textAlign: 'center' },
  jobCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
  },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  jobCompany: { fontSize: 14, color: '#475569', marginTop: 2 },
  jobMeta: { fontSize: 13, color: '#64748b', marginTop: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 20 },
  profileCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  profileName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  profileLine: { fontSize: 14, color: '#475569', marginTop: 2 },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fffbeb',
  },
  warnText: { flex: 1, color: '#b45309', fontSize: 14, lineHeight: 20 },
  input: {
    minHeight: 100,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: 16,
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
  },
  successText: { color: '#15803d', fontSize: 14 },
  successLink: { color: '#1d4ed8', fontSize: 14, fontWeight: '700', marginTop: 4 },
  submit: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});