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
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ROLES } from '../../src/constants/roles';
import { register } from '../../src/features/auth/authService';
import { saveBusinessPermit } from '../../src/features/auth/permitService';
import { pickDocument, uploadDocument } from '../../src/features/documents/documentService';
import { auth } from '../../src/lib/firebase';

const ROLE_OPTIONS = [
  { value: ROLES.APPLICANT, label: 'Job Seeker', icon: 'person-outline' },
  { value: ROLES.EMPLOYER, label: 'Employer', icon: 'business-outline' },
];

export default function RegisterScreen() {
  const [role, setRole] = useState(ROLES.APPLICANT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmployer = role === ROLES.EMPLOYER;

  const choosePermit = async () => {
    setError('');
    try {
      const asset = await pickDocument();
      if (asset) setPermit(asset);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (isEmployer && !permit) {
      setError('Employers must upload a business permit to create an account.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });

      // Employers: save the permit and mark the account as pending PESO review
      if (isEmployer) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Account was created but could not be verified. Please log in.');
        const uploaded = await uploadDocument('permits', uid, permit);
        await saveBusinessPermit(uid, uploaded);
      }
      // Redirect is handled automatically in app/_layout.jsx
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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join JobAccess PESO Tagum</Text>

        <Text style={styles.label}>I am a</Text>
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((opt) => {
            const active = role === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.roleButton, active && styles.roleButtonActive]}
                onPress={() => setRole(opt.value)}
                activeOpacity={0.8}
              >
                <Ionicons name={opt.icon} size={20} color={active ? '#ffffff' : '#475569'} />
                <Text style={[styles.roleText, active && styles.roleTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>{isEmployer ? 'Company name' : 'Full name'}</Text>
        <View style={styles.inputWrap}>
          <Ionicons
            name={isEmployer ? 'business-outline' : 'person-outline'}
            size={20}
            color="#64748b"
          />
          <TextInput
            style={styles.input}
            placeholder={isEmployer ? 'Your company name' : 'Juan Dela Cruz'}
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Text style={styles.label}>Confirm password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        {isEmployer && (
          <>
            <Text style={styles.label}>Business permit</Text>
            <TouchableOpacity
              style={[styles.permitBox, !!permit && styles.permitBoxDone]}
              onPress={choosePermit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name={permit ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={22}
                color={permit ? '#15803d' : '#1d4ed8'}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.permitTitle} numberOfLines={1}>
                  {permit ? permit.name : 'Upload your business permit'}
                </Text>
                <Text style={styles.permitSub}>
                  {permit
                    ? 'Tap to choose a different file'
                    : 'PDF, Word or image, under 500 KB. PESO reviews it before you can post.'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.note}>
              Your account stays pending until PESO Tagum approves your business permit.
            </Text>
          </>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submit, loading && styles.submitDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              {isEmployer ? 'Submit for Verification' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Log in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#ffffff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 16 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  roleButtonActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  roleText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  roleTextActive: { color: '#ffffff' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  permitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  permitBoxDone: { borderStyle: 'solid', borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  permitTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  permitSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  note: { fontSize: 12, color: '#64748b', marginTop: 8 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b', fontSize: 14 },
  link: { color: '#1d4ed8', fontSize: 14, fontWeight: '700' },
});