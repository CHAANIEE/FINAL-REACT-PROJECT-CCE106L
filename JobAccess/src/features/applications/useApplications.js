import { useEffect, useState } from 'react';
import { listenAllApplications, listenMyApplications } from './applicationService';

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

export function useAllApplications() {
  return useLive((onData, onError) => listenAllApplications(onData, onError), []);
}

export function useMyApplications(applicantId) {
  return useLive(
    (onData, onError) => {
      if (!applicantId) {
        onData([]);
        return null;
      }
      return listenMyApplications(applicantId, onData, onError);
    },
    [applicantId]
  );
}