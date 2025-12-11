import { auth } from '@/lib/firebase';
import { deleteAccount, FriendlyError, getUserData, signOutUser, UserData } from '@/services/authService';
import { prefetchAllQuizzes } from '@/services/quizService';
import { getSubjectsSync } from '@/services/subjectSyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useI18n } from './i18n-context';

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean; // Helper to check if user is admin
  setIsAuthenticated: (value: boolean) => void;
  setIsGuest: (value: boolean) => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@app_auth_state';
const GUEST_STORAGE_KEY = '@app_guest_state';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [isGuest, setIsGuestState] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();
  const quizzesPrefetchedRef = useRef(false); // Track if quizzes have been prefetched

  // Load user profile data from Firestore
  const loadUserProfile = async (firebaseUid: string) => {
    // Don't try to load if user is not authenticated
    if (!firebaseUid || !auth.currentUser || auth.currentUser.uid !== firebaseUid) {
      setUser(null);
      return;
    }
    
    try {
      const userData = await getUserData(firebaseUid);
      setUser(userData);
    } catch (error) {
      // Check error type
      const firebaseError = error as { code?: string; message?: string };
      const code = firebaseError?.code || '';
      const message = firebaseError?.message || '';
      
      const isPermissionError = code === 'permission-denied' || 
                                code === 'permissions-denied' ||
                                message.toLowerCase().includes('permission') ||
                                message.toLowerCase().includes('insufficient permissions');
      
      // Suppress permission errors - they can happen during auth state transitions
      // Only show alerts for non-permission errors
      if (!isPermissionError) {
        console.error('Failed to load user profile:', error);
        if (error instanceof FriendlyError) {
          if (error.type === 'offline') {
            Alert.alert(t('errors.offlineTitle'), t('errors.offlineMessage'));
          } else {
            Alert.alert(t('errors.generalTitle'), t('errors.generalMessage'));
          }
        } else {
          Alert.alert(t('errors.generalTitle'), t('errors.generalMessage'));
        }
      } else {
        // Log permission errors silently (they're expected in some cases)
        console.warn('Permission error loading user profile (suppressed):', firebaseUid);
      }
      setUser(null);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    // Only refresh if user is authenticated and Firebase auth confirms it
    if (firebaseUser?.uid && auth.currentUser?.uid === firebaseUser.uid) {
      await loadUserProfile(firebaseUser.uid);
    } else {
      // Clear user data if not authenticated
      setUser(null);
    }
  };

  // Prefetch quizzes once after authentication
  const prefetchQuizzesOnce = async () => {
    // Only prefetch if not already done
    if (quizzesPrefetchedRef.current) {
      return;
    }

    try {
      const subjects = await getSubjectsSync();
      const uniqueQuizSlugs = [...new Set(
        subjects
          .map((s) => s.quizSlug)
          .filter((slug): slug is string => Boolean(slug && slug.trim()))
      )];
      
      if (uniqueQuizSlugs.length > 0) {
        console.log('[auth] Prefetching quizzes after authentication...');
        quizzesPrefetchedRef.current = true; // Mark as prefetched before starting
        await prefetchAllQuizzes(uniqueQuizSlugs);
        console.log('[auth] Quizzes prefetched successfully');
      }
    } catch (error) {
      console.warn('[auth] Failed to prefetch quizzes:', error);
      // Reset flag on error so it can be retried
      quizzesPrefetchedRef.current = false;
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        setFirebaseUser(firebaseUser);
        setIsAuthenticatedState(true);
        setIsGuestState(false);
        
        // Load user profile from Firestore (only if still authenticated)
        if (auth.currentUser?.uid === firebaseUser.uid) {
          // Check user status before loading profile
          try {
            const userData = await getUserData(firebaseUser.uid);
            
            // If user account is inactive, sign them out
            if (userData && userData.status === 'inactive') {
              console.warn('[auth] User account is inactive, signing out...');
              await signOutUser();
              setFirebaseUser(null);
              setUser(null);
              setIsAuthenticatedState(false);
              setIsGuestState(false);
              setIsLoading(false);
              return;
            }
            
            // Load profile if account is active
            await loadUserProfile(firebaseUser.uid);
            
            // Prefetch quizzes once after successful authentication
            // This runs in background and doesn't block the auth flow
            prefetchQuizzesOnce().catch((error) => {
              console.warn('[auth] Quiz prefetch error (non-blocking):', error);
            });
          } catch (error: any) {
            // Handle account inactive error
            if (error?.message === 'account_inactive' || error?.code === 'account_inactive') {
              console.warn('[auth] User account is inactive, signing out...');
              await signOutUser();
              setFirebaseUser(null);
              setUser(null);
              setIsAuthenticatedState(false);
              setIsGuestState(false);
            } else {
              // Other errors - still try to load profile
              await loadUserProfile(firebaseUser.uid);
            }
          }
        }
        
        // Save auth state
        try {
          await AsyncStorage.multiSet([
            [AUTH_STORAGE_KEY, 'true'],
            [GUEST_STORAGE_KEY, 'false'],
          ]);
        } catch (error) {
          console.error('Failed to save auth state:', error);
        }
      } else {
        // User is signed out - clear all state immediately
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticatedState(false);
        quizzesPrefetchedRef.current = false; // Reset prefetch flag on logout
        
        // Check if user is in guest mode
        try {
          const guestState = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
          if (guestState === 'true') {
            setIsGuestState(true);
          } else {
            setIsGuestState(false);
          }
        } catch (error) {
          console.error('Failed to load guest state:', error);
          setIsGuestState(false);
        }
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Load auth state from storage on mount (before Firebase Auth listener)
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [authState, guestState] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(GUEST_STORAGE_KEY),
        ]);
        
        if (authState === 'true') {
          setIsAuthenticatedState(true);
        } else if (guestState === 'true') {
          setIsGuestState(true);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      }
    };

    loadAuthState();
  }, []);

  const setIsAuthenticated = async (value: boolean) => {
    try {
      setIsAuthenticatedState(value);
      if (value) {
        // When user authenticates, clear guest state
        await AsyncStorage.multiSet([
          [AUTH_STORAGE_KEY, 'true'],
          [GUEST_STORAGE_KEY, 'false'],
        ]);
        setIsGuestState(false);
      } else {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'false');
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  const setIsGuest = async (value: boolean) => {
    try {
      setIsGuestState(value);
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, value ? 'true' : 'false');
      if (value) {
        // When entering guest mode, clear auth state
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'false');
        setIsAuthenticatedState(false);
        setFirebaseUser(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to save guest state:', error);
    }
  };

  // Logout function to clear all auth state and sign out from Firebase
  const logout = async () => {
    try {
      // Sign out from Firebase Auth
      await signOutUser();
      
      // Clear local state
      setIsAuthenticatedState(false);
      setIsGuestState(false);
      setFirebaseUser(null);
      setUser(null);
      
      // Clear storage keys
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY]);
    } catch (error) {
      console.error('Failed to logout:', error);
      // Still clear local state even if Firebase signout fails
      setIsAuthenticatedState(false);
      setIsGuestState(false);
      setFirebaseUser(null);
      setUser(null);
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY]);
    }
  };

  // Delete account function
  const handleDeleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser?.uid) {
      return { success: false, error: 'not_authenticated' };
    }

    try {
      const result = await deleteAccount(firebaseUser.uid);
      
      if (result.success) {
        // Clear local state
        setIsAuthenticatedState(false);
        setIsGuestState(false);
        setFirebaseUser(null);
        setUser(null);
        quizzesPrefetchedRef.current = false;
        
        // Clear storage keys
        await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY]);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return { success: false, error: 'unknown' };
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        user,
        firebaseUser,
        isLoading,
        isAdmin,
        setIsAuthenticated,
        setIsGuest,
        logout,
        refreshUserData,
        deleteAccount: handleDeleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

