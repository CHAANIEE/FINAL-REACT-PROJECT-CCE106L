import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={COLORS.textMuted} />
      <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

export default function JobCard({ job, onPress }) {
  const router = useRouter();
  const open = onPress || (() => router.push(`/(applicant)/job/${job.id}`));

  return (
    <TouchableOpacity style={styles.card} onPress={open} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
        </View>
        {job.match != null && (
          <View style={styles.match}>
            <Text style={styles.matchText}>{job.match}% match</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Meta icon="location-outline" text={job.location} />
        <Meta icon="time-outline" text={job.type} />
      </View>

      <Text style={styles.salary}>{job.salary}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  company: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  match: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
  },
  matchText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  salary: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 10 },
});