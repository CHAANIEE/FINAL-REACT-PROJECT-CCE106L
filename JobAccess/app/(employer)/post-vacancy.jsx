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
import { useAuth } from '../../src/features/auth/AuthProvider';
import { createPosting } from '../../src/features/postings/postingService';

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.note}>
          Your vacancy will be reviewed by PESO Tagum staff before job seekers can see it.
        </Text>

        <Text style={styles.label}>Job title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sales Associate"
          placeholderTextColor="#94a3b8"
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
          placeholderTextColor="#94a3b8"
          value={form.location}
          onChangeText={set('location')}
        />

        <Text style={styles.label}>Salary</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ₱14,000 - ₱16,000 / month"
          placeholderTextColor="#94a3b8"
          value={form.salary}
          onChangeText={set('salary')}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="What will the employee do?"
          placeholderTextColor="#94a3b8"
          multiline
          value={form.description}
          onChangeText={set('description')}
        />

        <Text style={styles.label}>Requirements (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Skills, education, documents needed"
          placeholderTextColor="#94a3b8"
          multiline
          value={form.requirements}
          onChangeText={set('requirements')}
        />

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#15803d" />
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
  flex: { flex: 1, backgroundColor: '#ffffff' },
  container: { padding: 20, paddingBottom: 40 },
  note: {
    fontSize: 13,
    color: '#475569',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 16 },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: 16,
    color: '#0f172a',
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
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
    marginTop: 16,
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