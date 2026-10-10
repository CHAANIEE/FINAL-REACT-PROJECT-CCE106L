import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useEmployerPostings } from '../../src/features/postings/usePostings';
import { useEmployerApplications } from '../../src/features/applications/useEmployerApplications';
import { COLORS, RADIUS } from '../../src/constants/theme';

const STATUS_STYLE = {
  live: { label: 'Live', color: COLORS.primary, bg: COLORS.primaryLight },
  removed: { label: 'Taken down', color: COLORS.danger, bg: '#fee2e2' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'removed', label: 'Taken down' },
];

export default function MyPostings() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const { data: postings, loading, error } = useEmployerPostings(user?.uid);
  const { data: applications } = useEmployerApplications(user?.uid);
  const [filter, setFilter] = useState('all');

  const countFor = (key) =>
    key === 'all' ? postings.length : postings.filter((p) => p.status === key).length;
  const visible = filter === 'all' ? postings : postings.filter((p) => p.status === filter);
  const applicantCount = (jobId) => applications.filter((a) => a.jobId === jobId).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: 16 }]}
    >
      <Text style={styles.heading}>My Postings</Text>
      <Text style={styles.subheading}>
        {postings.length} vacancy{postings.length === 1 ? '' : 'ies'} posted
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label} ({countFor(f.key)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && visible.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="list-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {postings.length === 0 ? 'No postings yet' : 'Nothing here'}
          </Text>
          <Text style={styles.emptyNote}>
            {postings.length === 0
              ? 'Vacancies you post will be listed here.'
              : 'No postings match this filter.'}
          </Text>
          {postings.length === 0 && (
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => router.push('/(employer)/post-vacancy')}
              activeOpacity={0.85}
            >
              <Text style={styles.postBtnText}>Post a vacancy</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {visible.map((p) => {
        const st = STATUS_STYLE[p.status] || STATUS_STYLE.live;
        const isLive = p.status === 'live';
        return (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{p.title}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {p.type} · {p.location}
                </Text>
                <Text style={styles.salary}>{p.salary}</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: st.bg }]}>
                <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>

            {!!p.description && (
              <Text style={styles.description} numberOfLines={3}>{p.description}</Text>
            )}

            {isLive && !p.reviewed && (
              <Text style={styles.hint}>Live. PESO has not reviewed this vacancy yet.</Text>
            )}
            {p.status === 'removed' && (
              <Text style={styles.hintRed}>
                PESO took this vacancy down. Check the description and requirements, then post a
                corrected one.
              </Text>
            )}

            {isLive && (
              <TouchableOpacity
                style={styles.viewBtn}
                activeOpacity={0.85}
                onPress={() => router.push(`/(employer)/applicants/${p.id}`)}
              >
                <Ionicons name="people-outline" size={18} color="#ffffff" />
                <Text style={styles.viewBtnText}>
                  View applicants ({applicantCount(p.id)})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  description: { fontSize: 13, color: COLORS.textBody, marginTop: 10, lineHeight: 19 },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark },
  subheading: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  chipScroll: { marginTop: 16, marginBottom: 8, flexGrow: 0 },
  chipRow: { gap: 8 },
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
  postBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  postBtnText: { color: '#ffffff', fontWeight: '700' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginTop: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  salary: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { fontSize: 12, fontWeight: '700' },
  hint: { fontSize: 13, color: '#b45309', marginTop: 12 },
  hintRed: { fontSize: 13, color: COLORS.danger, marginTop: 12, lineHeight: 18 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    marginTop: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  viewBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});