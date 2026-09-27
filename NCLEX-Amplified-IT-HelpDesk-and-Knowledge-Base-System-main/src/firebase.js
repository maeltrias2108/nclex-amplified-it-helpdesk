import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getAuth, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updatePassword, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';

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
  const profileRef = doc(db, 'students', result.user.uid);
  const profile = await getDoc(profileRef);
  const admin = await getDoc(doc(db, 'admins', result.user.uid));
  if (admin.exists()) return { role: 'admin', name: profile.data()?.name || result.user.displayName || 'Administrator', email: result.user.email, verified: result.user.emailVerified };
  if (!profile.exists()) {
    await signOut(auth);
    throw new Error('This student account has no active profile. Contact an administrator.');
  }
  if (profile.exists() && profile.data().active === false) {
    await signOut(auth);
    throw new Error('This student account is deactivated. Contact an administrator.');
  }
  if (!result.user.emailVerified) {
    await signOut(auth);
    throw new Error('Please verify your email address before signing in.');
  }
  const student = profile.data() || {};
  const authProfile = {
    email: result.user.email,
    verified: result.user.emailVerified,
    ...(result.user.displayName ? { name: result.user.displayName } : {})
  };
  const changed = Object.entries(authProfile).some(([key, value]) => student[key] !== value);
  if (profile.exists() && changed) {
    await updateDoc(profileRef, { ...authProfile, updatedAt: serverTimestamp() });
  }
  return {
    role: 'student',
    name: authProfile.name || student.name || result.user.email.split('@')[0],
    email: result.user.email,
    verified: result.user.emailVerified,
    phone: student.phone || '',
    address: student.address || ''
  };
};

export const firebaseRegister = async (name, email, password) => {
  if (!auth || !db) throw new Error('Firebase is not configured.');

  let result;
  let resent = false;
  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;
    result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user.emailVerified) {
      await signOut(auth);
      throw error;
    }
    resent = true;
  }

  const user = result.user;
  const profileRef = doc(db, 'students', user.uid);
  try {
    const profile = await getDoc(profileRef);
    const studentName = user.displayName || profile.data()?.name || name;
    if (!user.displayName) await updateProfile(user, { displayName: studentName });

    const profileValues = {
      name: studentName,
      email: user.email,
      verified: user.emailVerified,
      updatedAt: serverTimestamp()
    };
    if (profile.exists()) {
      await updateDoc(profileRef, profileValues);
    } else {
      await setDoc(profileRef, {
        ...profileValues,
        active: true,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    await signOut(auth).catch(() => {});
    const profileError = new Error(
      'Your Firebase account was created, but its student profile could not be saved. Check the deployed Firestore rules and Firebase project, then submit registration again with the same email and password to finish setup.'
    );
    profileError.code = 'auth/student-profile-write-failed';
    profileError.cause = error;
    throw profileError;
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    await signOut(auth).catch(() => {});
    const verificationError = new Error(
      'Your account and student profile were created, but the verification email could not be sent. Submit registration again with the same email and password to retry.'
    );
    verificationError.code = 'auth/verification-email-failed';
    verificationError.cause = error;
    throw verificationError;
  }

  await signOut(auth);
  return { resent };
};

const requireCurrentUser = async () => {
  if (!auth || !db) throw new Error('Firebase is not configured.');
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Your session has expired. Please sign in again.');
  return auth.currentUser;
};

export const firebaseSaveStudentProfile = async ({ name, phone, address }) => {
  const user = await requireCurrentUser();
  await updateProfile(user, { displayName: name });
  await updateDoc(doc(db, 'students', user.uid), {
    name,
    email: user.email,
    phone,
    address,
    updatedAt: serverTimestamp()
  });
};

export const firebaseRequestEmailChange = async (email) => {
  const user = await requireCurrentUser();
  await verifyBeforeUpdateEmail(user, email, {
    url: window.location.origin,
    handleCodeInApp: false
  });
};

export const firebaseSyncStudentProfile = async () => {
  const user = await requireCurrentUser();
  await user.reload();
  const currentUser = auth.currentUser;
  const profileRef = doc(db, 'students', currentUser.uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) throw new Error('Your student profile could not be found.');

  const student = snapshot.data();
  const authProfile = {
    email: currentUser.email,
    verified: currentUser.emailVerified,
    ...(currentUser.displayName ? { name: currentUser.displayName } : {})
  };
  const changed = Object.entries(authProfile).some(([key, value]) => student[key] !== value);
  if (changed) {
    await updateDoc(profileRef, { ...authProfile, updatedAt: serverTimestamp() });
  }

  return { id: snapshot.id, ...student, ...authProfile };
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

export const firebaseSubscribeStudents = (onChange, onError) => {
  if (!db) throw new Error('Firebase is not configured.');
  return onSnapshot(collection(db, 'students'), (snapshot) => {
    onChange(snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
      createdAt: entry.data().createdAt?.toDate?.()?.toISOString() || entry.data().createdAt,
      updatedAt: entry.data().updatedAt?.toDate?.()?.toISOString() || entry.data().updatedAt
    })));
  }, onError);
};

export const firebaseSetStudentActive = async (uid, active) => {
  if (!db) throw new Error('Firebase is not configured.');
  await updateDoc(doc(db, 'students', uid), { active, updatedAt: serverTimestamp() });
};

export const firebaseDeactivateCurrentStudent = async () => {
  const user = await requireCurrentUser();
  await firebaseSetStudentActive(user.uid, false);
};

export const firebaseDeleteCurrentStudentAccount = async () => {
  if (!db) throw new Error('Firebase is not configured.');
  const user = await requireCurrentUser();
  const idToken = await user.getIdToken();
  const uid = user.uid;

  await deleteUser(user);

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/students/${encodeURIComponent(uid)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } }
    );
    if (!response.ok) {
      const cleanupError = new Error('Your sign-in was deleted, but your Firestore profile could not be removed. Contact an administrator to complete cleanup.');
      cleanupError.code = 'auth/student-profile-cleanup-failed';
      throw cleanupError;
    }
  } catch (error) {
    if (error.code === 'auth/student-profile-cleanup-failed') throw error;
    const cleanupError = new Error('Your sign-in was deleted, but your Firestore profile could not be removed. Contact an administrator to complete cleanup.');
    cleanupError.code = 'auth/student-profile-cleanup-failed';
    cleanupError.cause = error;
    throw cleanupError;
  }
};

export const firebaseDeleteStudentProfile = async (uid) => {
  if (!db) throw new Error('Firebase is not configured.');
  const batch = writeBatch(db);
  batch.delete(doc(db, 'students', uid));
  batch.set(doc(db, 'deletedStudentAccounts', uid), { deletedAt: serverTimestamp() });
  await batch.commit();
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
  'auth/requires-recent-login': 'For your security, sign out and sign back in before trying to delete your account.',
  'auth/student-profile-cleanup-failed': error?.message,
  'auth/student-profile-write-failed': error?.message,
  'auth/verification-email-failed': error?.message,
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.'
}[error?.code] || error?.message || 'Something went wrong. Please try again.');
