import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color="#64748b" />
      <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

export default function JobCard({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase-outline" size={22} color="#1d4ed8" />
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  company: { fontSize: 13, color: '#64748b', marginTop: 2 },
  match: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
  },
  matchText: { fontSize: 12, fontWeight: '700', color: '#15803d' },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { fontSize: 13, color: '#64748b' },
  salary: { fontSize: 14, fontWeight: '600', color: '#1d4ed8', marginTop: 10 },
});