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
import { ROLES } from '../../src/constants/roles';
import { login } from '../../src/features/auth/authService';

const GREEN = '#15803d';
const GREEN_DARK = '#14532d';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await login(email, password, ROLES.ADMIN);
      // If the role is admin, app/_layout.jsx redirects to the admin dashboard
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
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
            <Text style={styles.badgeText}>STAFF PORTAL</Text>
          </View>
          <Text style={styles.welcome}>PESO Admin</Text>
          <Text style={styles.welcomeSub}>Authorized PESO Tagum staff only</Text>

          {/* Email */}
          <Text style={styles.label}>Staff email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="staff@example.com"
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
              <Text style={styles.submitText}>Log In as Admin  →</Text>
            )}
          </TouchableOpacity>

          {/* Back link */}
          <View style={styles.backRow}>
            <Ionicons name="arrow-back" size={16} color={GREEN} />
            <Link href="/(auth)/login" style={styles.link}>
              Back to Job Seeker / Employer login
            </Link>
          </View>
        </View>

        <Text style={styles.tagline}>Trabaho para sa Mas Maunlad na Tagum!</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  welcome: { fontSize: 24, fontWeight: '800', color: GREEN_DARK, textAlign: 'center' },
  welcomeSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },

  label: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 6, marginTop: 14 },

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

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 13 },

  submit: {
    marginTop: 18,
    height: 50,
    borderRadius: 10,
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
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