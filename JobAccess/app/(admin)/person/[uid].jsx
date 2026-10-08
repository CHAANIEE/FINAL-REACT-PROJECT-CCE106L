import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPersonDetails } from '../../../src/features/admin/peopleService';
import { STATUS_LABELS } from '../../../src/features/applications/statusMachine';
import { COLORS, RADIUS } from '../../../src/constants/theme';

const JOB_STATUS = {
  live: { label: 'Live', color: COLORS.primary, bg: COLORS.primaryLight },
  removed: { label: 'Taken down', color: COLORS.danger, bg: '#fee2e2' },
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function PersonProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid: param } = useLocalSearchParams();
  const uid = Array.isArray(param) ? param[0] : param;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getPersonDetails(uid)
      .then((d) => active && setDetails(d))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [uid]);

  const user = details?.user;
  const isEmployer = user?.role === 'employer';
  const displayName = isEmployer ? user?.companyName || user?.name : user?.name;
  const initials = (displayName || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEmployer ? 'Employer Profile' : 'Job Seeker Profile'}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !user && (
          <Text style={styles.muted}>This account no longer exists.</Text>
        )}

        {!!user && (
          <>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>
                  {displayName || 'Unnamed'}
                </Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.card}>
              {isEmployer ? (
                <>
                  <Field label="Contact phone" value={user.phone} />
                  <Field label="Address" value={user.address} />
                  <Field label="Industry" value={user.industry} />
                  <Field label="About" value={user.about} />
                </>
              ) : (
                <>
                  <Field label="Phone" value={user.phone} />
                  <Field label="Barangay" value={user.location} />
                  <Field label="Education" value={user.education} />
                  <Field
                    label="Skills"
                    value={(user.skills || []).join(', ')}
                  />
                  <Field label="Desired category" value={user.desiredCategory} />
                </>
              )}
              {!user.phone && !user.location && !user.address && !user.about && (
                <Text style={styles.muted}>This person has not filled in their profile yet.</Text>
              )}
            </View>

            {isEmployer ? (
              <>
                <Text style={styles.sectionLabel}>Vacancies ({details.jobs.length})</Text>
                {details.jobs.length === 0 && (
                  <Text style={styles.muted}>No vacancies posted.</Text>
                )}
                {details.jobs.map((j) => {
                  const st = JOB_STATUS[j.status] || JOB_STATUS.live;
                  return (
                    <View key={j.id} style={styles.listCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listTitle} numberOfLines={1}>{j.title}</Text>
                        <Text style={styles.listSub} numberOfLines={1}>
                          {j.type} · {j.location}
                        </Text>
                      </View>
                      <View style={[styles.pill, { backgroundColor: st.bg }]}>
                        <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  Applications ({details.applications.length})
                </Text>
                {details.applications.length === 0 && (
                  <Text style={styles.muted}>No applications yet.</Text>
                )}
                {details.applications.map((a) => (
                  <View key={a.id} style={styles.listCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle} numberOfLines={1}>{a.jobTitle}</Text>
                      <Text style={styles.listSub} numberOfLines={1}>{a.company}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: COLORS.blueSoft }]}>
                      <Text style={[styles.pillText, { color: COLORS.blue }]}>
                        {STATUS_LABELS[a.status] || a.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 20, paddingBottom: 40 },

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

  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  fieldValue: { fontSize: 15, color: COLORS.text, marginTop: 2, lineHeight: 21 },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 24,
    marginBottom: 10,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  listSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { fontSize: 12, fontWeight: '700' },

  muted: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
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
});