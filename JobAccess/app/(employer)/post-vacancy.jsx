import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { createPosting } from '../../src/features/postings/postingService';
import { COLORS, RADIUS } from '../../src/constants/theme';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const EMPTY = {
  title: '',
  type: 'Full-time',
  location: '',
  salary: '',
  description: '',
  requirements: '',
};

export default function PostVacancy() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError('');
    setSuccess(false);

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.salary.trim() ||
      !form.description.trim()
    ) {
      setError('Please fill in the job title, location, salary and description.');
      return;
    }

    setLoading(true);
    try {
      await createPosting({
        employerId: user.uid,
        company: profile?.name || 'Employer',
        title: form.title.trim(),
        type: form.type,
        location: form.location.trim(),
        salary: form.salary.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim(),
      });
      setForm(EMPTY);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Post a Vacancy</Text>

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
          <Text style={styles.noteText}>
            Your vacancy will be reviewed by PESO Tagum staff before job seekers can see it.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Job title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sales Associate"
            placeholderTextColor="#9ca3af"
            value={form.title}
            onChangeText={set('title')}
          />

          <Text style={styles.label}>Job type</Text>
          <View style={styles.chips}>
            {TYPES.map((t) => {
              const active = form.type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => set('type')(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Location (barangay, Tagum City)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Apokon, Tagum City"
            placeholderTextColor="#9ca3af"
            value={form.location}
            onChangeText={set('location')}
          />

          <Text style={styles.label}>Salary</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ₱14,000 - ₱16,000 / month"
            placeholderTextColor="#9ca3af"
            value={form.salary}
            onChangeText={set('salary')}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="What will the employee do?"
            placeholderTextColor="#9ca3af"
            multiline
            value={form.description}
            onChangeText={set('description')}
          />

          <Text style={styles.label}>Requirements (optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Skills, education, documents needed"
            placeholderTextColor="#9ca3af"
            multiline
            value={form.requirements}
            onChangeText={set('requirements')}
          />
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.successText}>
                Submitted. Your vacancy is waiting for PESO approval.
              </Text>
              <TouchableOpacity onPress={() => router.push('/(employer)/dashboard')}>
                <Text style={styles.successLink}>Go to dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submit, loading && styles.submitDisabled]}
          onPress={submit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Submit for Approval</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 12 },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  noteText: { flex: 1, fontSize: 13, color: COLORS.textBody, lineHeight: 18 },

  formCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.text,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  chipTextActive: { color: '#ffffff' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primarySoft,
  },
  successText: { color: COLORS.primary, fontSize: 14 },
  successLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700', marginTop: 4 },

  submit: {
    marginTop: 20,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});