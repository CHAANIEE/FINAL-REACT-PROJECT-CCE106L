import * as DocumentPicker from 'expo-document-picker';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const MAX_BYTES = 500 * 1024; // 500 KB keeps the user document under Firestore's 1 MB limit

// Opens the phone's file picker. Returns the chosen file, or null if cancelled.
export async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/*',
    ],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

// Converts a blob to a base64 string. Works on web and on phones.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(blob);
  });
}

// Reads the picked file and returns a record to store in Firestore.
// The folder argument is kept so existing calls still work.
export async function uploadDocument(_folder, uid, asset) {
  if (asset.size && asset.size > MAX_BYTES) {
    throw new Error('The file is too large. Please use a file under 500 KB.');
  }

  const response = await fetch(asset.uri);
  const blob = await response.blob();
  if (blob.size > MAX_BYTES) {
    throw new Error('The file is too large. Please use a file under 500 KB.');
  }

  const data = await blobToBase64(blob);

  return {
    name: asset.name,
    mimeType: asset.mimeType || 'application/octet-stream',
    size: blob.size,
    data,
    uploadedAt: new Date().toISOString(),
  };
}

// Saves the applicant's resume on their user profile
export async function saveResume(uid, resumeInfo) {
  await setDoc(doc(db, 'users', uid), { resume: resumeInfo }, { merge: true });
}