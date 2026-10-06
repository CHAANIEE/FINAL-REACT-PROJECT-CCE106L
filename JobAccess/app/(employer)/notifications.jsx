import { useAuth } from '../../src/features/auth/AuthProvider';
import { useUserNotifications } from '../../src/features/notifications/useNotifications';
import NotificationList from '../../src/components/NotificationList';

export default function EmployerAlerts() {
  const { user } = useAuth();
  const { data, loading, error } = useUserNotifications(user?.uid);

  return <NotificationList items={data} loading={loading} error={error} />;
}