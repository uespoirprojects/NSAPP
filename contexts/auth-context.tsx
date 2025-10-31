import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsGuest: (value: boolean) => void;
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

  // Load auth state from storage on mount
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
      }
    } catch (error) {
      console.error('Failed to save guest state:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        setIsAuthenticated,
        setIsGuest,
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

