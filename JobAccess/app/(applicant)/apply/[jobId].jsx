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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useJob } from '../../../src/features/postings/useJob';
import { useMyApplications } from '../../../src/features/applications/useApplications';
import { createApplication } from '../../../src/features/applications/applicationService';
import { COLORS, RADIUS } from '../../../src/constants/theme';

export default function ApplyScreen() {
  const insets = useSafeAreaInsets();
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
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Apply for Job</Text>

        {loading && <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !job && (
          <Text style={styles.muted}>This job is no longer available.</Text>
        )}

        {!!job && (
          <>
            {/* Job summary */}
            <View style={styles.jobCard}>
              <View style={styles.jobIcon}>
                <Ionicons name="briefcase" size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                <Text style={styles.jobCompany} numberOfLines={1}>{job.company}</Text>
                <View style={styles.jobTags}>
                  <View style={styles.tag}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textBody} />
                    <Text style={styles.tagText}>{job.location}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textBody} />
                    <Text style={styles.tagText}>{job.type}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Applicant details */}
            <Text style={styles.sectionLabel}>Applying as</Text>
            <View style={styles.card}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(profile?.name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{profile?.name}</Text>
                  <Text style={styles.profileLine}>{user?.email}</Text>
                </View>
              </View>

              {!!profile?.phone && <Text style={styles.detail}>Phone: {profile.phone}</Text>}
              {!!profile?.location && (
                <Text style={styles.detail}>Barangay: {profile.location}</Text>
              )}
              {!!(profile?.skills || []).length && (
                <Text style={styles.detail}>Skills: {profile.skills.join(', ')}</Text>
              )}
            </View>

            {profileIncomplete && (
              <TouchableOpacity
                style={styles.warnBox}
                onPress={() => router.push('/(applicant)/profile')}
                activeOpacity={0.85}
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
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.successText}>
                    Application sent. PESO staff will review it.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.replace('/(applicant)/applications')}
                  >
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
                <Text style={styles.sectionLabel}>Message to the employer (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tell them why you are a good fit"
                  placeholderTextColor="#9ca3af"
                  multiline
                  value={note}
                  onChangeText={setNote}
                />

                {!!submitError && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
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
                    <>
                      <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
                      <Text style={styles.submitText}>Submit Application</Text>
                    </>
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
  flex: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  muted: { fontSize: 15, color: COLORS.textMuted, marginTop: 40, textAlign: 'center' },

  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  jobCompany: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  jobTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bg,
  },
  tagText: { fontSize: 12, color: COLORS.textBody },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  profileName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  profileLine: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  detail: { fontSize: 13, color: COLORS.textBody, marginTop: 6 },

  warnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: '#fffbeb',
  },
  warnText: { flex: 1, color: '#b45309', fontSize: 13, lineHeight: 19 },

  input: {
    minHeight: 110,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: 'top',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  successText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  successLink: { color: COLORS.primary, fontSize: 14, fontWeight: '800', marginTop: 6 },

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});