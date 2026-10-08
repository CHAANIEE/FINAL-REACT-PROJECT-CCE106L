import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { usePendingPostings } from '../../src/features/postings/usePostings';
import { reviewPosting } from '../../src/features/postings/postingService';
import { COLORS, RADIUS } from '../../src/constants/theme';

export default function UnderReview() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: postings, loading, error } = usePendingPostings();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const act = async (jobId, action) => {
    setActionError('');
    setBusyId(jobId);
    try {
      await reviewPosting(jobId, action, user.uid);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Under Review</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{postings.length}</Text>
        </View>
      </View>
      <Text style={styles.sub}>
        These vacancies are live. Mark them reviewed once checked, or take one down if it
        breaks PESO rules.
      </Text>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />}

      {!!(error || actionError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error || actionError}</Text>
        </View>
      )}

      {!loading && !error && postings.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="checkmark-done-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyNote}>No new vacancies are waiting for review.</Text>
        </View>
      )}

      {postings.map((job) => {
        const busy = busyId === job.id;
        return (
          <View key={job.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
                <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.meta}>
                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{job.type}</Text>
              </View>
            </View>

            <Text style={styles.salary}>{job.salary}</Text>

            <View style={styles.block}>
              <Text style={styles.blockLabel}>Description</Text>
              <Text style={styles.blockText}>{job.description}</Text>
            </View>

            {!!job.requirements && (
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Requirements</Text>
                <Text style={styles.blockText}>{job.requirements}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.takeDown, busy && styles.disabled]}
                onPress={() => act(job.id, 'removed')}
                disabled={busy}
                activeOpacity={0.8}
              >
                <Text style={styles.takeDownText}>Take down</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.reviewed, busy && styles.disabled]}
                onPress={() => act(job.id, 'reviewed')}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.reviewedText}>Mark reviewed</Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  company: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  salary: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 8 },

  block: { marginTop: 14, padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.bg },
  blockLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  blockText: { fontSize: 14, color: COLORS.textBody, marginTop: 4, lineHeight: 20 },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeDown: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: '#fecaca' },
  takeDownText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
  reviewed: { backgroundColor: COLORS.primary },
  reviewedText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
});