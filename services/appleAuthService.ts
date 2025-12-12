// services/appleAuthService.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import {
    OAuthProvider,
    signInWithCredential,
    UserCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../lib/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
import { createOrUpdateSocialAuthUser } from './authService';

/**
 * Sign in with Apple
 * Only works on iOS devices
 */
export const signInWithApple = async (): Promise<{
  success: boolean;
  error?: string;
  userId?: string;
  email?: string | null;
  displayName?: string | null;
}> => {
  console.log('[appleAuth] Starting Apple sign-in, Platform:', Platform.OS);
  
  // Check if platform supports Apple Sign In
  if (Platform.OS !== 'ios') {
    console.log('[appleAuth] Not iOS platform, returning error');
    return {
      success: false,
      error: 'auth.appleNotSupported',
    };
  }

  // Check if Apple Authentication is available
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    console.log('[appleAuth] Apple Authentication available:', isAvailable);
    
    if (!isAvailable) {
      return {
        success: false,
        error: 'auth.appleNotAvailable',
      };
    }
  } catch (error) {
    console.error('[appleAuth] Error checking availability:', error);
    return {
      success: false,
      error: 'auth.appleNotAvailable',
    };
  }

  try {
    console.log('[appleAuth] Requesting Apple authentication...');
    
    // Request Apple authentication
    const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('[appleAuth] Apple auth response received:', {
      hasIdentityToken: !!appleAuthRequestResponse.identityToken,
      hasFullName: !!appleAuthRequestResponse.fullName,
      hasEmail: !!appleAuthRequestResponse.email,
    });

    const { identityToken, fullName, email } = appleAuthRequestResponse;

    if (!identityToken) {
      return {
        success: false,
        error: 'auth.genericError',
      };
    }

    // Create OAuth credential for Firebase
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
    });

    // Sign in to Firebase with Apple credential
    const userCredential: UserCredential = await signInWithCredential(
      auth,
      credential
    );

    const user = userCredential.user;

    // Extract name information
    const firstName = fullName?.givenName || null;
    const lastName = fullName?.familyName || null;
    const displayName = fullName
      ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
      : null;

    // Create or update user data in Firestore
    await createOrUpdateSocialAuthUser(
      user.uid,
      email || user.email,
      displayName,
      firstName,
      lastName
    );

    return {
      success: true,
      userId: user.uid,
      email: email || user.email,
      displayName,
    };
  } catch (error: any) {
    console.error('[appleAuth] Apple sign-in error:', error);
    console.error('[appleAuth] Error code:', error?.code);
    console.error('[appleAuth] Error message:', error?.message);
    console.error('[appleAuth] Error details:', JSON.stringify(error, null, 2));

    // Handle user cancellation
    if (
      error?.code === 'ERR_REQUEST_CANCELED' ||
      error?.code === 'ERR_CANCELED' ||
      error?.code === 'ERR_REQUEST_INTERRUPTED' ||
      error?.message?.toLowerCase().includes('cancel') ||
      error?.message?.toLowerCase().includes('interrupted')
    ) {
      console.log('[appleAuth] User cancelled sign-in');
      return {
        success: false,
        error: 'auth.cancelled',
      };
    }

    const errorKey = getFirebaseErrorMessage(error);
    console.log('[appleAuth] Returning error key:', errorKey);
    return {
      success: false,
      error: errorKey,
    };
  }
};

