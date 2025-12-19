// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
// import {
//   GoogleAuthProvider,
//   signInWithCredential,
// } from 'firebase/auth';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { auth } from '../lib/firebase';
// import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
// import { createOrUpdateSocialAuthUser } from './authService';

// ===========================================================================================
// import * as WebBrowser from 'expo-web-browser';
// import {
//   GoogleAuthProvider,
//   signInWithCredential,
// } from 'firebase/auth';
// import { useState } from 'react';
// import { auth } from '../lib/firebase';
// // import { getFirebaseErrorHandler } from '../utils/firebaseErrorHandler';
// import * as AuthSession from 'expo-auth-session';
// import { createOrUpdateSocialAuthUser } from './authService';

// WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  console.warn("Google Auth Service disabled.");
  // const [authResult, setAuthResult] = useState<any>(null);
  // const [isAuthenticating, setIsAuthenticating] = useState(false);

  // const signInWithGoogle = async () => {
  //   setIsAuthenticating(true);
  //   setAuthResult(null);

  //   try {
  //     // 1. Get IDs from environment
  //     const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB?.trim();
  //     const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS?.trim();

  //     // 2. SAFETY GATE: Stop here if IDs are missing to prevent iOS Dictionary crash
  //     if (!webClientId || !iosClientId) {
  //       throw new Error('Configuration missing: Ensure .env variables are set and the app is rebuilt.');
  //     }

  //     // 3. Manual Discovery Logic
  //     // This replaces the hook. It only runs when this function is called.
  //     const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
      
  //     const config = {
  //       clientId: iosClientId, // On iOS, we use the iOS Client ID
  //       extraParams: {
  //         // This ensures we get the id_token needed for Firebase
  //         nonce: Math.random().toString(36).substring(7),
  //       },
  //       scopes: ['openid', 'profile', 'email'],
  //       redirectUri: AuthSession.makeRedirectUri({
  //         scheme: 'akademix', // Replace with your scheme from app.json
  //         path: 'auth'
  //       }),
  //     };

  //     // 4. Request the token
  //     const request = new AuthSession.AuthRequest(config);
  //     const result = await request.promptAsync(discovery);

  //     if (result.type === 'success') {
  //       const { id_token } = result.params;
        
  //       if (!id_token) throw new Error('No ID Token received from Google');

  //       // 5. Firebase Sign-in
  //       const credential = GoogleAuthProvider.credential(id_token);
  //       const userCredential = await signInWithCredential(auth, credential);
  //       const user = userCredential.user;

  //       // 6. Database Sync
  //       await createOrUpdateSocialAuthUser(
  //         user.uid,
  //         user.email,
  //         user.displayName,
  //         null,
  //         null
  //       );

  //       const successData = {
  //         success: true,
  //         userId: user.uid,
  //         email: user.email,
  //         displayName: user.displayName,
  //       };
        
  //       setAuthResult(successData);
  //       return successData;
  //     } else if (result.type === 'cancel') {
  //       setAuthResult({ success: false, error: 'auth.cancelled' });
  //     }
  //   } catch (error: any) {
  //     console.error("Google Manual Auth Error:", error);
  //     setAuthResult({
  //       success: false,
  //       error: error.message || 'auth.genericError',
  //     });
  //   } finally {
  //     setIsAuthenticating(false);
  //   }
  // };

  // return { signInWithGoogle, authResult, isAuthenticating };
};
// ===========================================================================================

// WebBrowser.maybeCompleteAuthSession();

// export const useGoogleAuth = () => {
//   const [authResult, setAuthResult] = useState<any>(null);
  
//   // Build configuration object with validated values
//   // Always provide valid config to prevent nil crashes in native NSDictionary
//   // The config uses environment variables, ensuring values are always strings (never nil)
//   const googleAuthConfig = useMemo(() => {
//     // Get client IDs from environment variables
//     // process.env values are strings or undefined, never null in JavaScript
//     const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB?.trim() || '';
//     const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS?.trim() || '';

//     // Validate that we have valid non-empty strings
//     if (!webClientId) {
//       console.error('Google Auth: EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB is not set in environment variables');
//     }
//     if (!iosClientId) {
//       console.warn('Google Auth: EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS is not set in environment variables');
//     }

//     // Always provide valid config (never nil) to prevent crashes
//     // Empty strings are safer than nil for native modules
//     // The hook initializes but won't cause issues as long as values are strings
//     const config = {
//       webClientId: webClientId || '',
//       iosClientId: iosClientId || '',
//     };

//     return config;
//   }, []);

//   // Call the hook with validated config
//   // The hook initializes safely with valid config (no nil values = no crash)
//   // Actual sign-in flow is deferred until user clicks the button (when promptAsync is called)
//   // This preserves cross-platform compatibility while preventing startup crashes
//   const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthConfig);

//   const handleGoogleSignIn = useCallback(async (tokens: { idToken?: string, accessToken?: string | null }) => {
//     try {
//       // Only strictly require the idToken
//       if (!tokens.idToken) {
//         throw new Error('No Google ID token received');
//       }

//       // Sign in with Firebase
//       // Pass null for accessToken if it's missing (optional for sign-in)
//       const credential = GoogleAuthProvider.credential(
//         tokens.idToken,
//         tokens.accessToken || null
//       );
      
//       const userCredential = await signInWithCredential(auth, credential);
//       const user = userCredential.user;

//       // Create or update user data
//       await createOrUpdateSocialAuthUser(
//         user.uid,
//         user.email,
//         user.displayName,
//         null,
//         null
//       );

//       setAuthResult({
//         success: true,
//         userId: user.uid,
//         email: user.email,
//         displayName: user.displayName,
//       });
//     } catch (error: any) {
//       console.error("Google sign-in error:", error);
//       const errorKey = getFirebaseErrorMessage(error);
//       setAuthResult({
//         success: false,
//         error: errorKey,
//       });
//     }
//   }, []);

//   useEffect(() => {
//     if (response?.type === 'success') {
//       // In some versions/platforms, the token is in response.params, not authentication
//       const { authentication, params } = response;
//       const idToken = authentication?.idToken || params?.id_token;
//       const accessToken = authentication?.accessToken || params?.access_token;

//       handleGoogleSignIn({ idToken, accessToken });
//     } else if (response?.type === 'error') {
//       setAuthResult({
//         success: false,
//         error: 'auth.genericError',
//       });
//     } else if (response?.type === 'cancel') {
//       setAuthResult({
//         success: false,
//         error: 'auth.cancelled',
//       });
//     }
//   }, [response, handleGoogleSignIn]);

//   const signInWithGoogle = async () => {
//     try {
//       setAuthResult(null);
      
//       // Call promptAsync to start the Google sign-in flow
//       // This is when the actual authentication happens (deferred until user clicks button)
//       // The hook initialized safely at component mount with valid config (no nil values)
//       if (promptAsync) {
//         await promptAsync();
//       } else {
//         throw new Error('Google Auth not available. Please ensure configuration is correct.');
//       }
//     } catch (error: any) {
//       console.error("Google prompt error:", error);
//       setAuthResult({
//         success: false,
//         error: 'auth.genericError',
//       });
//     }
//   };

//   return { signInWithGoogle, request, authResult };
// };
