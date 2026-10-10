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
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { confirmLogout } from '../../src/utils/confirmLogout';
import {
  saveEmployerProfile,
  deleteEmployerAccount,
} from '../../src/features/auth/employerAccountService';
import { COLORS, RADIUS } from '../../src/constants/theme';

const INDUSTRIES = [
  'Retail',
  'Food & Beverage',
  'Manufacturing',
  'Services',
  'Construction',
  'Healthcare',
  'Education',
  'Others',
];

const EMPTY = { companyName: '', phone: '', address: '', industry: '', about: '' };

const DELETE_TITLE = 'Delete company account?';
const DELETE_MESSAGE =
  'Your live vacancies will be taken down and your company profile will be deleted. This cannot be undone.';

export default function EmployerProfile() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Fill the form once, when the profile first loads
  useEffect(() => {
    if (profile && !loaded) {
      setForm({
        companyName: profile.companyName || profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        industry: profile.industry || '',
        about: profile.about || '',
      });
      setLoaded(true);
    }
  }, [profile, loaded]);

  const set = (key) => (value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const filled = [form.companyName, form.phone, form.address, form.industry, form.about].filter(
    (v) => v.trim()
  ).length;
  const percent = Math.round((filled / 5) * 100);

  const initials = (form.companyName || profile?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const save = async () => {
    setError('');
    setSaved(false);
    if (!form.companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }
    setSaving(true);
    try {
      await saveEmployerProfile(user.uid, {
        companyName: form.companyName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        industry: form.industry,
        about: form.about.trim(),
      });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setError('');
    setDeleting(true);
    try {
      await deleteEmployerAccount(user.uid);
      // On success the auth listener signs the user out and returns them to login
    } catch (e) {
      setError(
        e.code === 'auth/requires-recent-login'
          ? 'For security, log out, log in again, then delete your account.'
          : e.message || 'Could not delete the account. Please try again.'
      );
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    // Web browsers don't support Alert buttons, so use the built-in confirm box there
    if (Platform.OS === 'web') {
      if (window.confirm(`${DELETE_TITLE}\n\n${DELETE_MESSAGE}`)) {
        doDelete();
      }
      return;
    }

    Alert.alert(DELETE_TITLE, DELETE_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        nestedScrollEnabled
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.heading}>Company Profile</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={confirmLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Identity card */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {form.companyName || 'Your company'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        {/* Completeness */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Company profile {percent}% complete</Text>
            <Text style={styles.progressPercent}>{percent}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressNote}>
            A complete company profile helps job seekers trust your vacancies.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Company name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC Hardware"
            placeholderTextColor="#9ca3af"
            value={form.companyName}
            onChangeText={set('companyName')}
          />

          <Text style={styles.label}>Contact phone</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0917 123 4567"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={set('phone')}
          />

          <Text style={styles.label}>Address (barangay, Tagum City)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mabini St., Apokon, Tagum City"
            placeholderTextColor="#9ca3af"
            value={form.address}
            onChangeText={set('address')}
          />

          <Text style={styles.label}>Industry</Text>
          <View style={styles.chips}>
            {INDUSTRIES.map((i) => {
              const active = form.industry === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => set('industry')(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{i}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>About the company</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="What does your company do?"
            placeholderTextColor="#9ca3af"
            multiline
            value={form.about}
            onChangeText={set('about')}
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
            <Text style={styles.successText}>Company profile saved.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.save, saving && styles.disabled]}
          onPress={save}
          disabled={saving || deleting}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveText}>Save Company Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && styles.disabled]}
          onPress={confirmDelete}
          disabled={saving || deleting}
          activeOpacity={0.85}
        >
          {deleting ? (
            <ActivityIndicator color={COLORS.danger} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              <Text style={styles.deleteText}>Delete account</Text>
            </>
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
    borderRadius: RADIUS.lg,
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
  saveText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});