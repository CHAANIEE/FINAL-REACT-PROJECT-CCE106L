import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { logout } from '../../src/features/auth/authService';

export default function ApplicantHome() {
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.name}</Text>
      <Text style={styles.sub}>Job Seeker dashboard</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  sub: { color: '#64748b', marginTop: 4 },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
  },
  buttonText: { color: '#ffffff', fontWeight: '700' },
});