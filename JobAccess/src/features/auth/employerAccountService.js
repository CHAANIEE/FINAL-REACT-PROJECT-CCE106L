import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

// Saves the company profile. The name field is also set so the dashboard and postings show the company name.
export async function saveEmployerProfile(uid, data) {
  await setDoc(
    doc(db, 'users', uid),
    { ...data, name: data.companyName, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Takes down all live vacancies, deletes the company profile, then deletes the login.
export async function deleteEmployerAccount(uid) {
  const jobsSnap = await getDocs(
    query(collection(db, 'jobs'), where('employerId', '==', uid))
  );

  const batch = writeBatch(db);
  jobsSnap.docs.forEach((d) => {
    if (d.data().status === 'live') {
      batch.update(d.ref, { status: 'removed', updatedAt: serverTimestamp() });
    }
  });
  await batch.commit();

  // Must run after the batch, because the job rules check the user's role
  await deleteDoc(doc(db, 'users', uid));

  // Last step: removes the login
  await deleteUser(auth.currentUser);
}