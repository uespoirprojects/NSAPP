// app/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const auth = getAuth(app);
export const db = getFirestore(app);