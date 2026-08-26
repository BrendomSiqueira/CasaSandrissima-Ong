import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Configure provider parameters for smooth prompt
googleProvider.setCustomParameters({ prompt: 'select_account' });
facebookProvider.setCustomParameters({ display: 'popup' });
microsoftProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Social Log in utilities
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.warn("Google Sign-In caught error code:", error?.code, error?.message);
    }
    throw error;
  }
}

export async function signInWithFacebook(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.warn("Facebook Sign-In caught error code:", error?.code, error?.message);
    }
    throw error;
  }
}

export async function signInWithMicrosoft(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, microsoftProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.warn("Microsoft Sign-In caught error code:", error?.code, error?.message);
    }
    throw error;
  }
}

export async function signInWithSocial(provider: 'google' | 'facebook' | 'microsoft'): Promise<User> {
  switch (provider) {
    case 'google':
      return signInWithGoogle();
    case 'facebook':
      return signInWithFacebook();
    case 'microsoft':
      return signInWithMicrosoft();
    default:
      return signInWithGoogle();
  }
}

// Email & Password Auth utilities
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  } catch (error: any) {
    if (error?.code !== 'auth/operation-not-allowed') {
      console.warn("Notice signing in with email:", error?.message || error);
    }
    throw error;
  }
}

export async function signUpWithEmail(email: string, pass: string, displayName: string): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName?.trim()) {
      await updateProfile(cred.user, {
        displayName: displayName.trim()
      });
    }
    return cred.user;
  } catch (error: any) {
    if (error?.code !== 'auth/operation-not-allowed') {
      console.warn("Notice creating user with email:", error?.message || error);
    }
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    if (error?.code !== 'auth/operation-not-allowed') {
      console.warn("Notice sending password reset email:", error?.message || error);
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info("Firestore client is offline; using cached data and local state.");
    } else if (error?.code === 'unavailable' || error?.message?.includes('could not be completed')) {
      // Background retry handler for transient connection
      console.info("Firestore connecting to backend service...");
    }
  }
}
testConnection();
