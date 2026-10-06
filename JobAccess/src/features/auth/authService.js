import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { ROLE_LABELS } from '../../constants/roles';

function friendlyError(error) {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

export async function login(email, password, expectedRole) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));

    if (!snap.exists()) {
      await signOut(auth);
      throw new Error('Account profile not found. Please register again.');
    }

    const { role } = snap.data();
    if (role !== expectedRole) {
      await signOut(auth);
      throw new Error(
        `This account is registered as ${ROLE_LABELS[role] || role}. Please select the correct account type.`
      );
    }

    return { uid: cred.user.uid, ...snap.data() };
  } catch (error) {
    if (error.code) throw new Error(friendlyError(error));
    throw error;
  }
}

export async function register({ name, email, password, role }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      createdAt: serverTimestamp(),
    });
    return cred.user;
  } catch (error) {
    if (error.code) throw new Error(friendlyError(error));
    throw error;
  }
}

export function logout() {
  return signOut(auth);
}