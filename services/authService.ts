// services/authService.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    Timestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrorHandler";

export type FriendlyErrorType = 'offline' | 'unknown';

export class FriendlyError extends Error {
  type: FriendlyErrorType;

  constructor(type: FriendlyErrorType, message?: string) {
    super(message);
    this.name = 'FriendlyError';
    this.type = type;
    Object.setPrototypeOf(this, FriendlyError.prototype);
  }
}

/**
 * User roles
 */
export type UserRole = 'user' | 'admin';

/**
 * Type pour les données utilisateur étendues
 */
export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  dateOfBirth?: string | null;
  role: UserRole; // User role: 'user' (default) or 'admin'
  createdAt: Timestamp;
  firebaseUid: string;
};

/**
 * Inscription avec Firebase Auth + sauvegarde complète dans Firestore
 */
export const signUp = async (
  email: string,
  password: string,
  userData: {
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    province?: string;
    dateOfBirth?: string;
  }
): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    // 1. Créer l'utilisateur dans Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid: firebaseUid } = userCredential.user;

    // 2. Préparer les données à sauvegarder
    const userDocData: UserData = {
      firebaseUid,
      email: email.trim(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      address: userData.address?.trim() || null,
      city: userData.city?.trim() || null,
      province: userData.province?.trim() || null,
      dateOfBirth: userData.dateOfBirth?.trim() || null,
      role: 'user', // Default role is 'user'
      createdAt: Timestamp.now(),
    };

    // 3. Sauvegarder dans Firestore sous le Firebase UID
    await setDoc(doc(db, "users", firebaseUid), userDocData);

    return { success: true, userId: firebaseUid };
  } catch (error: any) {
    console.error("Sign up error:", error);
    const errorKey = getFirebaseErrorMessage(error);
    return { success: false, error: errorKey };
  }
};

/**
 * Connexion avec Firebase Auth + vérification dans Firestore
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCredential.user.uid;

    // Vérifier si l'utilisateur existe dans Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUid));
    if (!userDoc.exists()) {
      // Optionnel : créer un profil minimal si absent (ex: pour comptes social login)
      await setDoc(doc(db, "users", firebaseUid), {
        firebaseUid,
        email,
        role: 'user' as UserRole, // Default role is 'user'
        createdAt: Timestamp.now(),
      });
    } else {
      // Ensure existing users have a role field (migration for old users)
      const userData = userDoc.data();
      if (!userData.role) {
        await setDoc(doc(db, "users", firebaseUid), {
          role: 'user' as UserRole,
        }, { merge: true });
      }
    }

    return { success: true, userId: firebaseUid };
  } catch (error: any) {
    console.error("Sign in error:", error);
    const errorKey = getFirebaseErrorMessage(error);
    return { success: false, error: errorKey };
  }
};

/**
 * Déconnexion
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

/**
 * Récupérer les données utilisateur depuis Firestore
 */
export const getUserData = async (firebaseUid: string): Promise<UserData | null> => {
  try {
    // Check if user is authenticated before making the request
    if (!auth.currentUser || auth.currentUser.uid !== firebaseUid) {
      // User is not authenticated or UID doesn't match - return null silently
      return null;
    }

    const docRef = doc(db, "users", firebaseUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    const message = firebaseError?.message || '';
    const code = firebaseError?.code || '';
    
    // Check if it's a permission error - suppress these as they're expected in some cases
    const isPermissionError = code === 'permission-denied' || 
                             code === 'permissions-denied' ||
                             message.toLowerCase().includes('permission');
    
    // Check if it's an offline error
    const isOffline =
      code === 'unavailable' ||
      code === 'failed-precondition' ||
      message.toLowerCase().includes('client is offline');

    // Only log non-permission errors
    if (!isPermissionError) {
      console.error("Get user data error:", error);
    }

    // If permission error and user is not authenticated, return null silently
    if (isPermissionError && !auth.currentUser) {
      return null;
    }

    if (isOffline) {
      throw new FriendlyError('offline');
    }

    // For permission errors when authenticated, still throw but as a friendly error
    if (isPermissionError) {
      throw new FriendlyError('unknown');
    }

    throw new FriendlyError('unknown');
  }
};

/**
 * Mettre à jour les données utilisateur dans Firestore
 */
export const updateUserData = async (
  firebaseUid: string,
  updates: Partial<Omit<UserData, 'firebaseUid' | 'createdAt' | 'email'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, "users", firebaseUid);
    await setDoc(docRef, updates, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Update user data error:", error);
    return { success: false, error: "Échec de la mise à jour du profil." };
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (firebaseUid: string): Promise<boolean> => {
  try {
    const userData = await getUserData(firebaseUid);
    return userData?.role === 'admin';
  } catch (error) {
    console.error("Check admin role error:", error);
    return false;
  }
};

/**
 * Get user role
 */
export const getUserRole = async (firebaseUid: string): Promise<UserRole | null> => {
  try {
    const userData = await getUserData(firebaseUid);
    return userData?.role || 'user';
  } catch (error) {
    console.error("Get user role error:", error);
    return null;
  }
};
