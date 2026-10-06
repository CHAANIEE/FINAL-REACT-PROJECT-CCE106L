import { View, Text, StyleSheet } from 'react-native';

const STEPS = ['submitted', 'under_review', 'shortlisted', 'interview', 'hired'];
const LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  hired: 'Hired',
};

export default function StatusTimeline({ status }) {
  if (status === 'not_selected') {
    return (
      <View style={styles.rejected}>
        <Text style={styles.rejectedText}>This application was not selected.</Text>
      </View>
    );
  }

  const current = Math.max(0, STEPS.indexOf(status));

  return (
    <View>
      <View style={styles.bar}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.segment, i <= current && styles.segmentDone]} />
        ))}
      </View>
      <Text style={styles.caption}>
        Step {current + 1} of {STEPS.length} · {LABELS[STEPS[current]]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e2e8f0' },
  segmentDone: { backgroundColor: '#1d4ed8' },
  caption: { fontSize: 12, color: '#64748b', marginTop: 6 },
  rejected: { padding: 10, borderRadius: 10, backgroundColor: '#fef2f2' },
  rejectedText: { color: '#b91c1c', fontSize: 13, fontWeight: '600' },
});