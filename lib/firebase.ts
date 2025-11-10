// lib/firebase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCca2ni5bBwJ1QhCMqNY7eV1zGT5dyvy3g",
  authDomain: "akademix-80099.firebaseapp.com",
  projectId: "akademix-80099",
  storageBucket: "akademix-80099.firebasestorage.app",
  messagingSenderId: "975955270723",
  appId: "1:975955270723:web:c1cce3250d3aa8b34488f6",
  measurementId: "G-Y0YPYJHEQQ"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
// Use initializeAuth for React Native, getAuth for web
let auth: Auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    // Import getReactNativePersistence dynamically for React Native
    // It's available in firebase/auth but TypeScript might not recognize it
    const authModule = require("firebase/auth");
    const getReactNativePersistence = (authModule as any).getReactNativePersistence;
    
    if (getReactNativePersistence && typeof getReactNativePersistence === 'function') {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } else {
      // Fallback: use getAuth without persistence if getReactNativePersistence is not available
      auth = getAuth(app);
      console.warn("Firebase Auth: getReactNativePersistence not available, using default auth (auth state will not persist)");
    }
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      // If initialization fails, fall back to regular getAuth
      console.warn("Firebase Auth: Could not initialize with AsyncStorage persistence:", error.message);
      auth = getAuth(app);
    }
  }
}

export { auth };

export const db = getFirestore(app);
