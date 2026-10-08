import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Live list of users with a given role ('applicant' or 'employer')
export function listenPeopleByRole(role, onData, onError) {
  return onSnapshot(
    query(collection(db, 'users'), where('role', '==', role)),
    (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      list.sort((a, b) =>
        (a.name || a.companyName || '').localeCompare(b.name || b.companyName || '')
      );
      onData(list);
    },
    (error) => onError && onError(error)
  );
}

// One person's profile, plus their applications (applicant) or vacancies (employer)
export async function getPersonDetails(uid) {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;

  const user = { uid, ...userSnap.data() };

  if (user.role === 'applicant') {
    const appsSnap = await getDocs(
      query(collection(db, 'applications'), where('applicantId', '==', uid))
    );
    return {
      user,
      applications: appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  if (user.role === 'employer') {
    const jobsSnap = await getDocs(
      query(collection(db, 'jobs'), where('employerId', '==', uid))
    );
    return {
      user,
      jobs: jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  return { user };
}