import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '../../src/utils/useKeyboardHeight';
import { listenPeopleByRole } from '../../src/features/admin/peopleService';
import { COLORS, RADIUS } from '../../src/constants/theme';

const TABS = [
  { key: 'applicant', label: 'Job Seekers', icon: 'person-outline' },
  { key: 'employer', label: 'Employers', icon: 'business-outline' },
];

export default function PeopleScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const router = useRouter();
  const [role, setRole] = useState('applicant');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const unsubscribe = listenPeopleByRole(
      role,
      (list) => {
        setPeople(list);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, [role]);

  const q = search.trim().toLowerCase();
  const visible = people.filter((p) => {
    if (!q) return true;
    return [p.name, p.companyName, p.email, p.location, p.address].some((v) =>
      (v || '').toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 16, paddingBottom: 40 + keyboardHeight },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
    >
      <View style={styles.header}>
        <Text style={styles.heading}>People</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{people.length}</Text>
        </View>
      </View>
      <Text style={styles.sub}>View job seeker and employer profiles.</Text>

      <View style={styles.segment}>
        {TABS.map((t) => {
          const active = role === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.segBtn, active && styles.segBtnActive]}
              onPress={() => setRole(t.key)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={active ? '#ffffff' : COLORS.primary}
              />
              <Text style={[styles.segText, active && styles.segTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or barangay"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

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
            <Ionicons name="people-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {people.length === 0 ? 'No accounts yet' : 'No matches'}
          </Text>
          <Text style={styles.emptyNote}>
            {people.length === 0
              ? 'Accounts for this role will appear here.'
              : 'Try a different search.'}
          </Text>
        </View>
      )}

      {visible.map((p) => {
        const displayName = role === 'employer' ? p.companyName || p.name : p.name;
        const subline =
          role === 'employer'
            ? p.industry || p.address || p.email
            : p.location || p.email;
        return (
          <TouchableOpacity
            key={p.uid}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(admin)/person/${p.uid}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(displayName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName || 'Unnamed'}
              </Text>
              <Text style={styles.sub2} numberOfLines={1}>
                {subline || 'No details yet'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
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
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  segment: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 4,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: RADIUS.sm,
  },
  segBtnActive: { backgroundColor: COLORS.primary },
  segText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  segTextActive: { color: '#ffffff' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    height: 46,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 14 },

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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.primaryDark, fontSize: 16, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sub2: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});