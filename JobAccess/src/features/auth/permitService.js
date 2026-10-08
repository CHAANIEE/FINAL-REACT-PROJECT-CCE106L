import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Saves the business permit and puts the employer in the PESO review queue
export async function saveBusinessPermit(uid, permit) {
  await setDoc(
    doc(db, 'users', uid),
    {
      businessPermit: permit,
      verificationStatus: 'pending',
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );
}