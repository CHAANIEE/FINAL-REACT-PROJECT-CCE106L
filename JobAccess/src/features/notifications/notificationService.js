import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const notificationsRef = collection(db, 'notifications');

function listen(q, onData, onError) {
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data({ serverTimestamps: 'estimate' }),
      }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      onData(list);
    },
    (error) => onError && onError(error)
  );
}

// Alerts for PESO admin (shared by all admin accounts)
export function listenAdminNotifications(onData, onError) {
  return listen(query(notificationsRef, where('audience', '==', 'admin')), onData, onError);
}

// Alerts for one employer or job seeker
export function listenUserNotifications(userId, onData, onError) {
  return listen(
    query(notificationsRef, where('audience', '==', 'user'), where('userId', '==', userId)),
    onData,
    onError
  );
}

export function markNotificationRead(id) {
  return updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function markAllRead(items) {
  const unread = items.filter((n) => !n.read);
  if (unread.length === 0) return;
  const batch = writeBatch(db);
  unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
  await batch.commit();
}