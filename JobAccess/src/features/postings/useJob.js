import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!jobId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');
    getDoc(doc(db, 'jobs', jobId))
      .then((snap) => {
        if (!active) return;
        setJob(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  return { job, loading, error };
}