import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const jobsRef = collection(db, 'jobs');
const notificationsRef = collection(db, 'notifications');

function toList(snap) {
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data({ serverTimestamps: 'estimate' }),
  }));
  // Newest first (sorted here so no Firestore index is needed)
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

function listen(q, onData, onError) {
  return onSnapshot(
    q,
    (snap) => onData(toList(snap)),
    (error) => onError && onError(error)
  );
}

// Employer posts a vacancy. It goes live immediately and PESO is notified to review it.
export async function createPosting({
  employerId,
  company,
  title,
  type,
  location,
  salary,
  description,
  requirements,
}) {
  const jobRef = doc(jobsRef);
  const batch = writeBatch(db);

  batch.set(jobRef, {
    employerId,
    company,
    title,
    type,
    location,
    salary,
    description,
    requirements,
    status: 'live',
    reviewed: false,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(notificationsRef), {
    audience: 'admin',
    type: 'vacancy_submitted',
    title: 'New vacancy to review',
    message: `${company} posted "${title}". It is live and waiting for review.`,
    refId: jobRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return jobRef;
}

// Admin action on a live vacancy.
// action: 'reviewed' marks it as checked. 'removed' takes it down and alerts the employer.
export async function reviewPosting(jobId, action, adminId) {
  const jobRef = doc(db, 'jobs', jobId);
  const snap = await getDoc(jobRef);
  if (!snap.exists()) throw new Error('This vacancy no longer exists.');
  const job = snap.data();

  const batch = writeBatch(db);

  if (action === 'reviewed') {
    batch.update(jobRef, {
      reviewed: true,
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    });

    // Tell the employer their vacancy was approved
    batch.set(doc(notificationsRef), {
      audience: 'user',
      userId: job.employerId,
      type: 'vacancy_approved',
      title: 'Vacancy approved',
      message: `PESO reviewed and approved your vacancy "${job.title}". It stays live for job seekers.`,
      refId: jobId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } else if (action === 'removed') {
    batch.update(jobRef, {
      status: 'removed',
      reviewed: true,
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    });

    batch.set(doc(notificationsRef), {
      audience: 'user',
      userId: job.employerId,
      type: 'vacancy_removed',
      title: 'Vacancy taken down',
      message: `Your vacancy "${job.title}" was taken down by PESO and is no longer visible to job seekers.`,
      refId: jobId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } else {
    throw new Error('Unknown review action.');
  }

  await batch.commit();
}

// Job seekers see live vacancies only
export function listenApprovedJobs(onData, onError) {
  return listen(query(jobsRef, where('status', '==', 'live')), onData, onError);
}

// Employer sees only their own postings
export function listenEmployerPostings(employerId, onData, onError) {
  return listen(query(jobsRef, where('employerId', '==', employerId)), onData, onError);
}

// Admin "Under review" queue: live vacancies PESO has not checked yet
export function listenPendingPostings(onData, onError) {
  return listen(query(jobsRef, where('reviewed', '==', false)), onData, onError);
}