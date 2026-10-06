import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApprovedJobs } from '../../src/features/postings/usePostings';
import JobCard from '../../src/components/JobCard';

const TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

export default function SearchScreen() {
  const { data: jobs, loading, error } = useApprovedJobs();
  const [text, setText] = useState('');
  const [type, setType] = useState('All');

  const results = useMemo(() => {
    const q = text.trim().toLowerCase();
    return jobs.filter((j) => {
      const typeOk = type === 'All' || j.type === type;
      const textOk =
        !q ||
        [j.title, j.company, j.location, j.requirements].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      return typeOk && textOk;
    });
  }, [jobs, text, type]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={20} color="#64748b" />
        <TextInput
          style={styles.input}
          placeholder="Search jobs, companies, barangays"
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
        />
        {!!text && (
          <TouchableOpacity onPress={() => setText('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {TYPES.map((t) => {
          const active = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#1d4ed8" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <Text style={styles.count}>
          {results.length} job{results.length === 1 ? '' : 's'} found
        </Text>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.emptyTitle}>
            {jobs.length === 0 ? 'No job openings yet' : 'No matching jobs'}
          </Text>
          <Text style={styles.emptyNote}>
            {jobs.length === 0
              ? 'Vacancies approved by PESO Tagum will appear here.'
              : 'Try a different keyword or job type.'}
          </Text>
        </View>
      )}

      {results.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  chipScroll: { marginTop: 14, flexGrow: 0 },
  chipRow: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
  count: { fontSize: 13, color: '#64748b', marginTop: 16, marginBottom: 12 },
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 14 },
});