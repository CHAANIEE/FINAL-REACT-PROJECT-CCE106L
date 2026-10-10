import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  listenPendingEmployers,
  reviewEmployer,
} from '../../src/features/admin/verificationService';
import { COLORS, RADIUS } from '../../src/constants/theme';

export default function VerifyEmployers() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubscribe = listenPendingEmployers(
      (list) => {
        setEmployers(list);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  const decide = async (employer, status) => {
    setError('');
    setBusyId(employer.uid);
    try {
      await reviewEmployer(
        employer.uid,
        status,
        user.uid,
        employer.companyName || employer.name || 'the company'
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: 16 }]}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Verify Employers</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{employers.length}</Text>
        </View>
      </View>
      <Text style={styles.sub}>
        Check each business permit, then approve or reject the employer.
      </Text>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && employers.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyNote}>No employers are waiting for verification.</Text>
        </View>
      )}

      {employers.map((e) => {
        const busy = busyId === e.uid;
        const permit = e.businessPermit;
        return (
          <View key={e.uid} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Ionicons name="business-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.company} numberOfLines={1}>
                  {e.companyName || e.name || 'Unnamed company'}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>{e.email}</Text>
                {!!e.address && (
                  <Text style={styles.meta} numberOfLines={2}>{e.address}</Text>
                )}
              </View>
            </View>

            {permit ? (
              <TouchableOpacity
                style={styles.permitBtn}
                onPress={() => Linking.openURL(permit.url)}
                activeOpacity={0.85}
              >
                <Ionicons name="document-attach-outline" size={18} color={COLORS.primary} />
                <Text style={styles.permitText} numberOfLines={1}>
                  View business permit: {permit.name}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.missing}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.missingText}>No business permit uploaded</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.reject, busy && styles.disabled]}
                onPress={() => decide(e, 'rejected')}
                disabled={busy}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.approve, busy && styles.disabled]}
                onPress={() => decide(e, 'approved')}
                disabled={busy || !permit}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.approveText}>Approve</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  countPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 16, lineHeight: 18 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyNote: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  company: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  permitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  permitText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.primary },
  missing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerBg,
  },
  missingText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reject: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: '#fecaca' },
  rejectText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
  approve: { backgroundColor: COLORS.primary },
  approveText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
});