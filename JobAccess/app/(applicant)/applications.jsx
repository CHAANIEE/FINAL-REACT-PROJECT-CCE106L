import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useMyApplications } from '../../src/features/applications/useApplications';
import { STATUS_LABELS } from '../../src/features/applications/statusMachine';
import StatusTimeline from '../../src/components/StatusTimeline';

const STATUS_COLORS = {
  submitted: { color: '#475569', bg: '#e2e8f0' },
  under_review: { color: '#1d4ed8', bg: '#dbeafe' },
  shortlisted: { color: '#b45309', bg: '#fef3c7' },
  interview: { color: '#7e22ce', bg: '#f3e8ff' },
  hired: { color: '#15803d', bg: '#dcfce7' },
  not_selected: { color: '#b91c1c', bg: '#fee2e2' },
};

function formatDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApplicationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: applications, loading, error } = useMyApplications(user?.uid);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && applications.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-text-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptyNote}>Jobs you apply for will be tracked here.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(applicant)/search')}
          >
            <Text style={styles.browseText}>Browse jobs</Text>
          </TouchableOpacity>
        </View>
      )}

      {applications.map((app) => {
        const st = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
        return (
          <View key={app.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{app.jobTitle}</Text>
                <Text style={styles.company} numberOfLines={1}>{app.company}</Text>
                {!!formatDate(app.createdAt) && (
                  <Text style={styles.date}>Applied {formatDate(app.createdAt)}</Text>
                )}
              </View>
              <View style={[styles.pill, { backgroundColor: st.bg }]}>
                <Text style={[styles.pillText, { color: st.color }]}>
                  {STATUS_LABELS[app.status] || app.status}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <StatusTimeline status={app.status} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  emptyNote: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' },
  browseBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
  },
  browseText: { color: '#ffffff', fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  company: { fontSize: 13, color: '#64748b', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700' },
});