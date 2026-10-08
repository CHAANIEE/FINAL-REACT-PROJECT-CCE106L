import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Employers waiting for PESO to check their business permit
export function listenPendingEmployers(onData, onError) {
  return onSnapshot(
    query(
      collection(db, 'users'),
      where('role', '==', 'employer'),
      where('verificationStatus', '==', 'pending')
    ),
    (snap) => onData(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    (error) => onError && onError(error)
  );
}

// status: 'approved' or 'rejected'. Alerts the employer either way.
export async function reviewEmployer(uid, status, adminId, companyName) {
  const approved = status === 'approved';
  const batch = writeBatch(db);

  batch.update(doc(db, 'users', uid), {
    verificationStatus: status,
    verifiedBy: adminId,
    verifiedAt: serverTimestamp(),
  });

  batch.set(doc(collection(db, 'notifications')), {
    audience: 'user',
    userId: uid,
    type: 'verification_result',
    title: approved ? 'Business permit approved' : 'Business permit rejected',
    message: approved
      ? `PESO approved ${companyName}. You can now post vacancies.`
      : `PESO could not verify ${companyName}. Please contact PESO Tagum for help.`,
    refId: uid,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}