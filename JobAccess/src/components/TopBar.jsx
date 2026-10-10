import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

// Slim bar shown at the top of every tab screen.
// Notifications live here (bell on the right) instead of in the bottom tab bar.
export default function TopBar({ navigation, route, unreadCount = 0 }) {
  const insets = useSafeAreaInsets();
  const onAlerts = route.name === 'notifications';

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      {onAlerts ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={goBack}
          activeOpacity={0.8}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.brand}>JobAccess</Text>
      )}

      <TouchableOpacity
        style={[styles.iconBtn, onAlerts && styles.iconBtnActive]}
        onPress={() => {
          if (!onAlerts) navigation.navigate('notifications');
        }}
        activeOpacity={0.8}
        accessibilityLabel="Notifications"
      >
        <Ionicons
          name={onAlerts ? 'notifications' : 'notifications-outline'}
          size={20}
          color={onAlerts ? '#ffffff' : COLORS.primaryDark}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: COLORS.bg,
  },
  brand: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
});