import { useEffect, useState } from 'react';
import { listenAdminNotifications, listenUserNotifications } from './notificationService';

function useLive(subscribe, deps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const unsubscribe = subscribe(
      (list) => {
        setData(list);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, deps);

  return { data, loading, error };
}

export function useAdminNotifications() {
  return useLive((onData, onError) => listenAdminNotifications(onData, onError), []);
}

export function useUserNotifications(userId) {
  return useLive(
    (onData, onError) => {
      if (!userId) {
        onData([]);
        return null;
      }
      return listenUserNotifications(userId, onData, onError);
    },
    [userId]
  );
}