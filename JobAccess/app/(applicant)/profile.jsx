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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { logout } from '../../src/features/auth/authService';
import { saveApplicantProfile } from '../../src/features/auth/profileService';
import { COLORS, RADIUS } from '../../src/constants/theme';

const EDUCATION = [
  'High School',
  'Senior High School',
  'TESDA / Vocational',
  'College Undergraduate',
  'College Graduate',
];

const EMPTY = { phone: '', location: '', education: '', skills: '', desiredCategory: '' };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.heading}>My Profile</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Identity card */}
        <View style={styles.identity}>
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
            <Text style={styles.progressPercent}>{percent}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressNote}>
            A complete profile helps PESO match you with the right jobs.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0917 123 4567"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={set('phone')}
          />

          <Text style={styles.label}>Barangay (Tagum City)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Apokon"
            placeholderTextColor="#9ca3af"
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
                  activeOpacity={0.8}
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
            placeholderTextColor="#9ca3af"
            multiline
            value={form.skills}
            onChangeText={set('skills')}
          />

          <Text style={styles.label}>Desired job category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sales, Office work, Delivery"
            placeholderTextColor="#9ca3af"
            value={form.desiredCategory}
            onChangeText={set('desiredCategory')}
          />
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 48 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  progressCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  progressPercent: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  progressNote: { fontSize: 12, color: COLORS.textBody, marginTop: 8 },

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
  multiline: { minHeight: 90, textAlignVertical: 'top' },
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
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primarySoft,
  },
  successText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  save: {
    marginTop: 20,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});