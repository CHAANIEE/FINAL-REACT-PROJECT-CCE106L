import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Live list of applications sent to one employer's jobs
export function useEmployerApplications(employerId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employerId) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');
    const unsubscribe = onSnapshot(
      query(collection(db, 'applications'), where('employerId', '==', employerId)),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data({ serverTimestamps: 'estimate' }),
        }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setData(list);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [employerId]);

  return { data, loading, error };
}