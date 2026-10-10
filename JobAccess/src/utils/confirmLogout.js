import { Alert, Platform } from 'react-native';
import { logout } from '../features/auth/authService';

const TITLE = 'Log out?';
const MESSAGE = 'Are you sure you want to log out of JobAccess?';

export function confirmLogout() {
  if (Platform.OS === 'web') {
    if (window.confirm(`${TITLE}\n\n${MESSAGE}`)) {
      logout();
    }
    return;
  }

  Alert.alert(TITLE, MESSAGE, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => logout() },
  ]);
}