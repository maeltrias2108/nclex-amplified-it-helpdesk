import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Object.values(config).every(Boolean);
export const firebaseApp = firebaseConfigured ? initializeApp(config) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export const firebaseLogin = async (email, password) => {
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getDoc(doc(db, 'students', result.user.uid));
  const admin = await getDoc(doc(db, 'admins', result.user.uid));
  if (admin.exists()) return { role: 'admin', name: profile.data()?.name || result.user.displayName || 'Administrator', email: result.user.email, verified: result.user.emailVerified };
  if (profile.exists() && profile.data().active === false) {
    await signOut(auth);
    throw new Error('This student account is deactivated. Contact an administrator.');
  }
  if (!result.user.emailVerified) {
    await signOut(auth);
    throw new Error('Please verify your email address before signing in.');
  }
  return { role: 'student', name: profile.data()?.name || result.user.displayName || result.user.email.split('@')[0], email: result.user.email, verified: true };
};

export const firebaseRegister = async (name, email, password) => {
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await setDoc(doc(db, 'students', result.user.uid), { name, email, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await sendEmailVerification(result.user);
  await signOut(auth);
};

export const firebaseResetPassword = async (email) => {
  if (!auth) throw new Error('Firebase is not configured.');
  await sendPasswordResetEmail(auth, email);
};

export const firebaseChangePassword = async (password) => {
  if (!auth?.currentUser) throw new Error('Your session has expired. Please sign in again.');
  await updatePassword(auth.currentUser, password);
};

export const firebaseLogout = () => auth ? signOut(auth) : Promise.resolve();

export const firebaseListStudents = async () => {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data(), createdAt: entry.data().createdAt?.toDate?.()?.toISOString() || entry.data().createdAt }));
};

export const firebaseSetStudentActive = async (uid, active) => {
  if (!db) throw new Error('Firebase is not configured.');
  await updateDoc(doc(db, 'students', uid), { active, updatedAt: serverTimestamp() });
};

const CONTENT_COLLECTIONS = { articles: 'articles', faqs: 'faqs', announcements: 'announcements' };
const timestampValue = (value) => value?.toDate?.()?.toISOString?.() || value || null;
const contentRecord = (entry) => ({ id: entry.id, ...entry.data(), createdAt: timestampValue(entry.data().createdAt), updatedAt: timestampValue(entry.data().updatedAt), publishedAt: timestampValue(entry.data().publishedAt), expirationDate: timestampValue(entry.data().expirationDate) });

export const firebaseListContent = async (type, publicOnly = false) => {
  if (!db || !CONTENT_COLLECTIONS[type]) throw new Error('Firebase content service is not configured.');
  const source = collection(db, CONTENT_COLLECTIONS[type]);
  const records = await getDocs(publicOnly ? (type === 'announcements' ? query(source, where('published', '==', true), where('archived', '==', false), where('publishedAt', '<=', Timestamp.now())) : query(source, where('published', '==', true), where('archived', '==', false))) : source);
  return records.docs.map(contentRecord);
};

const firestoreContentValues = (type, values) => type === 'announcements' ? { ...values, publishedAt: values.publishedAt ? Timestamp.fromDate(new Date(values.publishedAt)) : null, expirationDate: values.expirationDate ? Timestamp.fromDate(new Date(values.expirationDate)) : null } : values;

export const firebaseCreateContent = async (type, values) => {
  if (!db || !CONTENT_COLLECTIONS[type]) throw new Error('Firebase content service is not configured.');
  const reference = await addDoc(collection(db, CONTENT_COLLECTIONS[type]), { ...firestoreContentValues(type, values), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return reference.id;
};

export const firebaseUpdateContent = async (type, id, values) => {
  if (!db || !CONTENT_COLLECTIONS[type]) throw new Error('Firebase content service is not configured.');
  await updateDoc(doc(db, CONTENT_COLLECTIONS[type], id), { ...firestoreContentValues(type, values), updatedAt: serverTimestamp() });
};

export const firebaseDeleteContent = async (type, id) => {
  if (!db || !CONTENT_COLLECTIONS[type]) throw new Error('Firebase content service is not configured.');
  await deleteDoc(doc(db, CONTENT_COLLECTIONS[type], id));
};

export const firebaseErrorMessage = (error) => ({
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/wrong-password': 'The email or password is incorrect.',
  'auth/email-already-in-use': 'An active account already uses this email.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Use a stronger password with at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.'
}[error?.code] || error?.message || 'Something went wrong. Please try again.');
