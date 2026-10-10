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
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROLES } from '../../src/constants/roles';
import { login } from '../../src/features/auth/authService';

const GREEN = '#15803d';
const GREEN_DARK = '#14532d';
const GREEN_LIGHT = '#dcfce7';

const ROLE_OPTIONS = [
  { value: ROLES.APPLICANT, label: 'Job Seeker', icon: 'person-outline' },
  { value: ROLES.EMPLOYER, label: 'Employer', icon: 'business-outline' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState(ROLES.APPLICANT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, role);
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
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        nestedScrollEnabled
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require('../../assets/peesotagum.jpg')}
              style={styles.sealImage}
              resizeMode="contain"
            />
          </View>
            <Text style={styles.brand}>JobAccess</Text>
              <Text style={styles.pesoName}>PESO TAGUM</Text>
                <Text style={styles.office}>
                Public Employment Service Office{'\n'}Tagum City
            </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcome}>Welcome Back!</Text>
          <Text style={styles.welcomeSub}>Sign in to your JobAccess account</Text>

          {/* Role selector */}
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
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? '#ffffff' : GREEN}
                  />
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Email */}
          <Text style={styles.label}>Email or Username</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email or username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* Remember me / Forgot password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={GREEN}
              />
              <Text style={styles.optionText}>Remember me</Text>
            </TouchableOpacity>
            <Text style={styles.forgot}>Forgot password?</Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Create account */}
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={18} color={GREEN} />
              <Text style={styles.createText}>Create a new account</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Register
            </Link>
          </View>

        </View>

        <Text style={styles.tagline}>Trabaho para sa Mas Maunlad na Tagum!</Text>
      </ScrollView>
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Login button */}
        <TouchableOpacity
          style={[styles.submit, loading && styles.submitDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Log In  →</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  footerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#f0fdf4',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  flex: { flex: 1, backgroundColor: '#f0fdf4' },
  container: { flexGrow: 1, padding: 20, paddingTop: 48 },

  header: { alignItems: 'center', marginBottom: 20 },
  logo: {
  width: 84,
  height: 84,
  borderRadius: 42,
  backgroundColor: '#ffffff',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: 8,
  },
  sealImage: { width: 84, height: 84 },
  brand: { fontSize: 34, fontWeight: '800', color: GREEN_DARK },
  pesoName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  office: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  welcome: { fontSize: 24, fontWeight: '800', color: GREEN_DARK, textAlign: 'center' },
  welcomeSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },

  label: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 6, marginTop: 14 },

  roleRow: { flexDirection: 'row', gap: 10 },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: '#ffffff',
  },
  roleButtonActive: { backgroundColor: GREEN },
  roleText: { fontSize: 14, fontWeight: '600', color: GREEN },
  roleTextActive: { color: '#ffffff' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  input: { flex: 1, fontSize: 15, color: '#0f172a' },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionText: { fontSize: 13, color: '#334155' },
  forgot: { fontSize: 13, color: GREEN, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 13 },

  submit: {
    marginTop: 0,
    height: 50,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  createButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createText: { color: GREEN, fontSize: 15, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  footerText: { color: '#64748b', fontSize: 13 },
  link: { color: GREEN, fontSize: 13, fontWeight: '700' },

  tagline: {
    textAlign: 'center',
    color: GREEN,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
});