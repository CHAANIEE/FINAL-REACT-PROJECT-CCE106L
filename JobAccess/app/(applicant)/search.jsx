import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApprovedJobs } from '../../src/features/postings/usePostings';
import JobCard from '../../src/components/JobCard';
import { COLORS, RADIUS } from '../../src/constants/theme';

const TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Find Jobs</Text>

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Job title, keyword, barangay..."
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {!!text && (
            <TouchableOpacity onPress={() => setText('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => Keyboard.dismiss()}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={18} color="#ffffff" />
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
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
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
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

      {!loading && !error && (
        <View style={styles.countRow}>
          <Text style={styles.count}>
            {results.length} job{results.length === 1 ? '' : 's'} found
          </Text>
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={32} color={COLORS.primary} />
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
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 16 },

  searchRow: { flexDirection: 'row', gap: 10 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  searchBtn: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  searchBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  chipScroll: { marginTop: 14, flexGrow: 0 },
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

  countRow: { marginTop: 18, marginBottom: 12 },
  count: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
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
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },
});