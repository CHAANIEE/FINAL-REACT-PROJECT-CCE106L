import { useEffect, useState } from 'react';
import {
  listenApprovedJobs,
  listenEmployerPostings,
  listenPendingPostings,
} from './postingService';

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

export function useApprovedJobs() {
  return useLive((onData, onError) => listenApprovedJobs(onData, onError), []);
}

export function useEmployerPostings(employerId) {
  return useLive(
    (onData, onError) => {
      if (!employerId) {
        onData([]);
        return null;
      }
      return listenEmployerPostings(employerId, onData, onError);
    },
    [employerId]
  );
}

export function usePendingPostings() {
  return useLive((onData, onError) => listenPendingPostings(onData, onError), []);
}