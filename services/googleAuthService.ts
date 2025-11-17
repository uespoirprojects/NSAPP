// app/services/googleAuthService.ts
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth, db } from '../lib/firebase';
import {
  signInWithCredential,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';


WebBrowser.maybeCompleteAuthSession();


export const signInWithGoogle = async () => {
  try {
    
    const WEB_CLIENT_ID = "975955270723-go7241vhcrplmulpa63iumi2oj9sp894.apps.googleusercontent.com";

    
    const redirectUri = AuthSession.makeRedirectUri({
      native: 'nsapp://login',
    });

    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: WEB_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: 'google',
    });

    // 🔓 Ouvre le navigateur système
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      return { success: false, error: "Google sign-in cancelled or failed" };
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return { success: false, error: "No authorization code received" };
    }

    // 🔑 Échanger le code contre une credential Firebase
    const credential = GoogleAuthProvider.credential(null, code);
    const userCredential: UserCredential = await signInWithCredential(auth, credential);

    
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        firebaseUid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: Timestamp.now(),
      });
    }

    return {
      success: true,
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred during Google sign-in",
    };
  }
};