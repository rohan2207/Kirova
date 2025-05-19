// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Create the context
const AuthContext = createContext();

// Create the hook for using the context
export function useAuth() {
  return useContext(AuthContext);
}

// Create the provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    // Set flag for just logged in to trigger store data refresh
    sessionStorage.setItem('kirova_just_logged_in', 'true');
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signup(email, password) {
    // Also set just logged in flag for new users
    sessionStorage.setItem('kirova_just_logged_in', 'true');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function signOut() {
    // Clear any user-specific caches when logging out
    return firebaseSignOut(auth).then(() => {
      // Don't clear location data, as it's useful for non-logged in users too
      // But do clear any specific user data caches
      
      // Clear store cache refresh flag
      sessionStorage.removeItem('kirova_just_logged_in');
    });
  }

  function loginWithGoogle() {
    // Set flag for just logged in
    sessionStorage.setItem('kirova_just_logged_in', 'true');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // If user logged in, this is a good time to set the login flag
      if (user) {
        sessionStorage.setItem('kirova_just_logged_in', 'true');
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    signOut,
    loginWithGoogle,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}