import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
import { createOrUpdateSocialAuthUser } from './authService';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [authResult, setAuthResult] = useState<any>(null);
  
  // Use useIdTokenAuthRequest instead of useAuthRequest
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: "975955270723-go7241vhcrplmulpa63iumi2oj9sp894.apps.googleusercontent.com",
    // iosClientId: "YOUR_IOS_CLIENT_ID", 
    // androidClientId: "YOUR_ANDROID_CLIENT_ID", 
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // In some versions/platforms, the token is in response.params, not authentication
      const { authentication, params } = response;
      const idToken = authentication?.idToken || params?.id_token;
      const accessToken = authentication?.accessToken || params?.access_token;

      handleGoogleSignIn({ idToken, accessToken });
    } else if (response?.type === 'error') {
      setAuthResult({
        success: false,
        error: 'auth.genericError',
      });
    } else if (response?.type === 'cancel') {
      setAuthResult({
        success: false,
        error: 'auth.cancelled',
      });
    }
  }, [response]);

  const handleGoogleSignIn = async (tokens: { idToken?: string, accessToken?: string | null }) => {
    try {
      // Only strictly require the idToken
      if (!tokens.idToken) {
        throw new Error('No Google ID token received');
      }

      // Sign in with Firebase
      // Pass null for accessToken if it's missing (optional for sign-in)
      const credential = GoogleAuthProvider.credential(
        tokens.idToken,
        tokens.accessToken || null
      );
      
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Create or update user data
      await createOrUpdateSocialAuthUser(
        user.uid,
        user.email,
        user.displayName,
        null,
        null
      );

      setAuthResult({
        success: true,
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      const errorKey = getFirebaseErrorMessage(error);
      setAuthResult({
        success: false,
        error: errorKey,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthResult(null);
      await promptAsync();
    } catch (error: any) {
      console.error("Google prompt error:", error);
      setAuthResult({
        success: false,
        error: 'auth.genericError',
      });
    }
  };

  return { signInWithGoogle, request, authResult };
};
