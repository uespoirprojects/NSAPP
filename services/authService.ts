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
      createdAt: Timestamp.now(),
    };

    // 3. Sauvegarder dans Firestore sous le Firebase UID
    await setDoc(doc(db, "users", firebaseUid), userDocData);

    return { success: true, userId: firebaseUid };
  } catch (error: any) {
    let message = "Inscription échouée.";
    if (error.code === "auth/email-already-in-use") {
      message = "Cet email est déjà utilisé.";
    } else if (error.code === "auth/invalid-email") {
      message = "Email invalide.";
    } else if (error.code === "auth/weak-password") {
      message = "Mot de passe trop faible (min. 6 caractères).";
    } else if (error.code === "auth/operation-not-allowed") {
      message = "Inscription temporairement désactivée.";
    }
    console.error("Sign up error:", error);
    return { success: false, error: message };
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
        createdAt: Timestamp.now(),
      });
    }

    return { success: true, userId: firebaseUid };
  } catch (error: any) {
    let message = "Connexion échouée.";
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Email ou mot de passe incorrect.";
    } else if (error.code === "auth/invalid-email") {
      message = "Email invalide.";
    } else if (error.code === "auth/user-disabled") {
      message = "Ce compte a été désactivé.";
    }
    console.error("Sign in error:", error);
    return { success: false, error: message };
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
    const docRef = doc(db, "users", firebaseUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Get user data error:", error);
    const firebaseError = error as { code?: string; message?: string };
    const message = firebaseError?.message || '';
    const code = firebaseError?.code || '';
    const isOffline =
      code === 'unavailable' ||
      code === 'failed-precondition' ||
      message.toLowerCase().includes('client is offline');

    if (isOffline) {
      throw new FriendlyError('offline');
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
