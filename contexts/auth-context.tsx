import { auth } from '@/lib/firebase';
import { FriendlyError, getUserData, signOutUser, UserData } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useI18n } from './i18n-context';

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsGuest: (value: boolean) => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
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

  // Load user profile data from Firestore
  const loadUserProfile = async (firebaseUid: string) => {
    try {
      const userData = await getUserData(firebaseUid);
      setUser(userData);
    } catch (error) {
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
      setUser(null);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (firebaseUser?.uid) {
      await loadUserProfile(firebaseUser.uid);
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
        
        // Load user profile from Firestore
        await loadUserProfile(firebaseUser.uid);
        
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
        // User is signed out
        setFirebaseUser(null);
        setUser(null);
        
        // Check if user is in guest mode
        try {
          const guestState = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
          if (guestState === 'true') {
            setIsGuestState(true);
            setIsAuthenticatedState(false);
          } else {
            setIsAuthenticatedState(false);
            setIsGuestState(false);
          }
        } catch (error) {
          console.error('Failed to load guest state:', error);
          setIsAuthenticatedState(false);
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        user,
        firebaseUser,
        isLoading,
        setIsAuthenticated,
        setIsGuest,
        logout,
        refreshUserData,
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

