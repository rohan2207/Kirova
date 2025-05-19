// src/services/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlvhSGfiymIAuYIh_NAJ3UtvOG7I5CIfA",
  authDomain: "kirova-d154d.web.app",
  projectId: "kirova-d154d",
  storageBucket: "kirova-d154d.firebasestorage.app",
  messagingSenderId: "134725139613",
  appId: "1:134725139613:web:4aa53370b14ba725f0e874"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Simplified Google sign-in function
const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // No additional configuration - keep it simple
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google Sign-in Error:", error.code, error.message);
    return { 
      success: false, 
      error: error.message
    };
  }
};

// Export all services and functions
export { 
  auth, 
  db, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithGoogle
};