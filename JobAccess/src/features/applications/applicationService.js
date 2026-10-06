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
import { canTransition, STATUS_LABELS } from './statusMachine';

const applicationsRef = collection(db, 'applications');
const notificationsRef = collection(db, 'notifications');

function toList(snap) {
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data({ serverTimestamps: 'estimate' }),
  }));
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Admin: every application, newest first
export function listenAllApplications(onData, onError) {
  return onSnapshot(
    applicationsRef,
    (snap) => onData(toList(snap)),
    (error) => onError && onError(error)
  );
}

// Job seeker: only their own applications
export function listenMyApplications(applicantId, onData, onError) {
  return onSnapshot(
    query(applicationsRef, where('applicantId', '==', applicantId)),
    (snap) => onData(toList(snap)),
    (error) => onError && onError(error)
  );
}

// Job seeker applies to an approved job. One application per job.
export async function createApplication({ job, applicant, note }) {
  const appRef = doc(db, 'applications', `${job.id}_${applicant.uid}`);
  const batch = writeBatch(db);

  batch.set(appRef, {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    employerId: job.employerId,
    applicantId: applicant.uid,
    applicantName: applicant.name,
    applicantEmail: applicant.email,
    note: note || '',
    status: 'submitted',
    createdAt: serverTimestamp(),
  });

  batch.set(doc(notificationsRef), {
    audience: 'admin',
    type: 'application_submitted',
    title: 'New application',
    message: `${applicant.name} applied for "${job.title}" at ${job.company}.`,
    refId: appRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

// Admin moves an application to the next status and notifies the applicant
export async function updateApplicationStatus(application, newStatus, adminId) {
  if (!canTransition(application.status, newStatus)) {
    throw new Error(
      `Cannot move from ${STATUS_LABELS[application.status]} to ${STATUS_LABELS[newStatus]}.`
    );
  }

  const batch = writeBatch(db);

  batch.update(doc(db, 'applications', application.id), {
    status: newStatus,
    updatedBy: adminId,
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(notificationsRef), {
    audience: 'user',
    userId: application.applicantId,
    type: 'application_status',
    title: 'Application update',
    message: `Your application for "${application.jobTitle}" is now ${STATUS_LABELS[newStatus]}.`,
    refId: application.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}