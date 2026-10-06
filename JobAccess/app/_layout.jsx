import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/features/auth/AuthProvider';
import { ROLE_HOME } from '../src/constants/roles';

function Gate() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const group = segments[0];

    // Not logged in: always go to login
    if (!user) {
      if (group !== '(auth)') router.replace('/(auth)/login');
      return;
    }

    // Logged in but profile not loaded yet
    if (!profile) return;

    // Logged in: keep the user inside their own role's area
    if (group !== `(${profile.role})`) {
      router.replace(ROLE_HOME[profile.role] || '/(auth)/login');
    }
  }, [user, profile, loading, segments]);

  return (
    <>
      <Slot />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Gate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});