import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User as FirebaseUser,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUser, getUser, updateUser, seedInitialData } from './firestore';

const ADMIN_EMAIL = 'admin@kamilshop.my.id';

export async function handlePostLogin(firebaseUser: FirebaseUser) {
  let user = await getUser(firebaseUser.uid);

  if (!user) {
    const isAdmin = firebaseUser.email === ADMIN_EMAIL;
    await createUser(firebaseUser.uid, {
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
      phone: firebaseUser.phoneNumber || '',
      role: isAdmin ? 'admin' : 'user',
    });
    user = await getUser(firebaseUser.uid);

    if (isAdmin) {
      await seedInitialData();
    }
  } else if (firebaseUser.email === ADMIN_EMAIL && user.role !== 'admin') {
    await updateUser(firebaseUser.uid, { role: 'admin' });
    user.role = 'admin';
  }

  // Set cookies for middleware
  document.cookie = `session=${firebaseUser.uid}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `role=${user?.role || 'user'}; path=/; max-age=86400; SameSite=Lax`;

  return user;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return handlePostLogin(result.user);
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  phone?: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return handlePostLogin({ ...result.user, displayName, phoneNumber: phone || null });
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return handlePostLogin(result.user);
}

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
}

export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export async function verifyOTP(confirmationResult: ConfirmationResult, otp: string) {
  const result = await confirmationResult.confirm(otp);
  return handlePostLogin(result.user);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await signOut(auth);
  document.cookie = 'session=; path=/; max-age=0';
  document.cookie = 'role=; path=/; max-age=0';
}
