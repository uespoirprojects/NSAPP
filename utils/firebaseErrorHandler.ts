/**
 * Converts Firebase error codes to user-friendly messages
 * Returns a translation key that can be used with i18n
 */
export const getFirebaseErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return 'auth.genericError';
  }

  const code = error.code;

  // Authentication errors
  switch (code) {
    // Email/Password errors
    case 'auth/email-already-in-use':
      return 'auth.emailAlreadyInUse';
    case 'auth/invalid-email':
      return 'auth.invalidEmail';
    case 'auth/weak-password':
      return 'auth.weakPassword';
    case 'auth/user-not-found':
      return 'auth.userNotFound';
    case 'auth/wrong-password':
      return 'auth.wrongPassword';
    case 'auth/invalid-credential':
      return 'auth.invalidCredential';
    case 'auth/user-disabled':
      return 'auth.userDisabled';
    case 'auth/too-many-requests':
      return 'auth.tooManyRequests';
    case 'auth/operation-not-allowed':
      return 'auth.operationNotAllowed';
    case 'auth/requires-recent-login':
      return 'auth.requiresRecentLogin';
    
    // Network errors
    case 'auth/network-request-failed':
      return 'auth.networkError';
    case 'auth/internal-error':
      return 'auth.internalError';
    
    // Google Sign-In errors
    case 'auth/popup-closed-by-user':
      return 'auth.popupClosed';
    case 'auth/cancelled-popup-request':
      return 'auth.cancelled';
    case 'auth/popup-blocked':
      return 'auth.popupBlocked';
    case 'auth/account-exists-with-different-credential':
      return 'auth.accountExistsWithDifferentCredential';
    
    // Firestore errors
    case 'unavailable':
    case 'failed-precondition':
      return 'auth.networkError';
    
    default:
      // Check if error message contains common patterns
      const message = error.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('offline') || message.includes('connection')) {
        return 'auth.networkError';
      }
      if (message.includes('quota') || message.includes('limit')) {
        return 'auth.tooManyRequests';
      }
      return 'auth.genericError';
  }
};

