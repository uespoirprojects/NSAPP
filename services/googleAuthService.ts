// services/googleAuthService.ts
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
import { createOrUpdateSocialAuthUser } from './authService';


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
      return { success: false, error: 'auth.cancelled' };
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return { success: false, error: 'auth.genericError' };
    }

    // 🔑 Échanger le code contre une credential Firebase
    const credential = GoogleAuthProvider.credential(null, code);
    const userCredential: UserCredential = await signInWithCredential(auth, credential);

    const user = userCredential.user;

    // Create or update user data in Firestore using shared helper
    await createOrUpdateSocialAuthUser(
      user.uid,
      user.email,
      user.displayName,
      null, // Google doesn't provide separate firstName/lastName
      null
    );

    return {
      success: true,
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    const errorKey = getFirebaseErrorMessage(error);
    return {
      success: false,
      error: errorKey,
    };
  }
};