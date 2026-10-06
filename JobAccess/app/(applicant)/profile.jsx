import { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { logout } from '../../src/features/auth/authService';
import { saveApplicantProfile } from '../../src/features/auth/profileService';

const EDUCATION = [
  'High School',
  'Senior High School',
  'TESDA / Vocational',
  'College Undergraduate',
  'College Graduate',
];

const EMPTY = { phone: '', location: '', education: '', skills: '', desiredCategory: '' };

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Fill the form once, when the profile first loads
  useEffect(() => {
    if (profile && !loaded) {
      setForm({
        phone: profile.phone || '',
        location: profile.location || '',
        education: profile.education || '',
        skills: (profile.skills || []).join(', '),
        desiredCategory: profile.desiredCategory || '',
      });
      setLoaded(true);
    }
  }, [profile, loaded]);

  const set = (key) => (value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const filled = [
    form.phone,
    form.location,
    form.education,
    form.skills,
    form.desiredCategory,
  ].filter((v) => v.trim()).length;
  const percent = Math.round((filled / 5) * 100);

  const initials = (profile?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const save = async () => {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await saveApplicantProfile(user.uid, {
        phone: form.phone.trim(),
        location: form.location.trim(),
        education: form.education,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        desiredCategory: form.desiredCategory.trim(),
      });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* Completeness */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Profile {percent}% complete</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressNote}>
            A complete profile helps PESO match you with the right jobs.
          </Text>
        </View>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0917 123 4567"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={set('phone')}
        />

        <Text style={styles.label}>Barangay (Tagum City)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Apokon"
          placeholderTextColor="#94a3b8"
          value={form.location}
          onChangeText={set('location')}
        />

        <Text style={styles.label}>Education</Text>
        <View style={styles.chips}>
          {EDUCATION.map((e) => {
            const active = form.education === e;
            return (
              <TouchableOpacity
                key={e}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => set('education')(e)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Skills (separate with commas)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="e.g. Cashiering, Customer service, MS Excel"
          placeholderTextColor="#94a3b8"
          multiline
          value={form.skills}
          onChangeText={set('skills')}
        />

        <Text style={styles.label}>Desired job category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sales, Office work, Delivery"
          placeholderTextColor="#94a3b8"
          value={form.desiredCategory}
          onChangeText={set('desiredCategory')}
        />

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#15803d" />
            <Text style={styles.successText}>Profile saved.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.save, saving && styles.saveDisabled]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  email: { fontSize: 14, color: '#64748b', marginTop: 2 },
  progressCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { fontSize: 14, fontWeight: '700', color: '#1d4ed8' },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dbeafe',
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#1d4ed8' },
  progressNote: { fontSize: 12, color: '#475569', marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 18 },
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
  multiline: { minHeight: 90, textAlignVertical: 'top' },
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
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
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
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
  },
  successText: { color: '#15803d', fontSize: 14, fontWeight: '600' },
  save: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutText: { color: '#b91c1c', fontSize: 15, fontWeight: '700' },
});