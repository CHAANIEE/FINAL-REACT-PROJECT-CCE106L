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

// Employer submits a vacancy. It always starts as "pending" and alerts the admin.
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
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  batch.set(doc(notificationsRef), {
    audience: 'admin',
    type: 'vacancy_submitted',
    title: 'New vacancy for review',
    message: `${company} submitted "${title}".`,
    refId: jobRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return jobRef;
}

// Admin decision: status = 'approved' or 'rejected'. Alerts the employer.
export async function reviewPosting(jobId, status, adminId) {
  const jobRef = doc(db, 'jobs', jobId);
  const snap = await getDoc(jobRef);
  if (!snap.exists()) throw new Error('This vacancy no longer exists.');
  const job = snap.data();

  const approved = status === 'approved';
  const batch = writeBatch(db);

  batch.update(jobRef, {
    status,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
  });

  batch.set(doc(notificationsRef), {
    audience: 'user',
    userId: job.employerId,
    type: approved ? 'vacancy_approved' : 'vacancy_rejected',
    title: approved ? 'Vacancy approved' : 'Vacancy rejected',
    message: approved
      ? `Your vacancy "${job.title}" is now live for job seekers.`
      : `Your vacancy "${job.title}" was not approved by PESO.`,
    refId: jobId,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

// Job Seekers see approved jobs only
export function listenApprovedJobs(onData, onError) {
  return listen(query(jobsRef, where('status', '==', 'approved')), onData, onError);
}

// Employer sees only their own postings
export function listenEmployerPostings(employerId, onData, onError) {
  return listen(query(jobsRef, where('employerId', '==', employerId)), onData, onError);
}

// Admin approval queue
export function listenPendingPostings(onData, onError) {
  return listen(query(jobsRef, where('status', '==', 'pending')), onData, onError);
}