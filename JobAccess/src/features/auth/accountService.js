import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

const ACTIVE_STATUSES = ['submitted', 'under_review', 'shortlisted', 'interview', 'hired'];

// Withdraws one application (including a hired one) and alerts the employer.
export async function withdrawApplication(application, applicantName = 'An applicant') {
  const batch = writeBatch(db);
  const appRef = doc(db, 'applications', application.id);

  batch.update(appRef, {
    status: 'withdrawn',
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(collection(db, 'notifications')), {
    audience: 'user',
    userId: application.employerId,
    type: 'application_withdrawn',
    title: 'Applicant withdrew',
    message: `${applicantName} withdrew from "${application.jobTitle}".`,
    refId: application.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

// Withdraws every active application, then deletes the profile and the login.
export async function deleteMyAccount(uid, applicantName) {
  const appsSnap = await getDocs(
    query(collection(db, 'applications'), where('applicantId', '==', uid))
  );

  const batch = writeBatch(db);

  appsSnap.docs.forEach((d) => {
    const app = { id: d.id, ...d.data() };
    if (!ACTIVE_STATUSES.includes(app.status)) return;

    batch.update(doc(db, 'applications', app.id), {
      status: 'withdrawn',
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(collection(db, 'notifications')), {
      audience: 'user',
      userId: app.employerId,
      type: 'application_withdrawn',
      title: 'Applicant withdrew',
      message: `${applicantName || 'An applicant'} withdrew from "${app.jobTitle}" by deleting their account.`,
      refId: app.id,
      read: false,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();

  await deleteDoc(doc(db, 'users', uid));

  // Last step: removes the login. Firebase may ask the user to sign in again first.
  await deleteUser(auth.currentUser);
}