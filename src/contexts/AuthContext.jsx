import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase'; // Ensure 'db' is imported
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
// Import Firestore functions needed to save user profiles
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Add these imports

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sign up function
  const signup = async (email, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // --- NEW: Save user profile to Firestore on signup ---
      await setDoc(doc(db, 'userProfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.email.split('@')[0], // A simple display name (e.g., "john.doe" from "john.doe@example.com")
        createdAt: serverTimestamp(),
      }, { merge: true }); // Use merge:true to ensure it creates if not exists, and won't overwrite existing fields if profile already exists (e.g., from an earlier manual entry)
      // --- END NEW ---

      setCurrentUser(user);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error.message);
      setLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // --- NEW: Update user profile on login (e.g., last login time, or create if somehow missing) ---
      await setDoc(doc(db, 'userProfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        // Optionally update displayName, or keep existing one if user changes it later
        displayName: user.displayName || user.email.split('@')[0], // Update if a display name is set or default
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
      // --- END NEW ---

      setCurrentUser(user);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message);
      return false;
    }
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      // Optional: If you want to update user profile on initial load too
      if (user) {
        try {
          await setDoc(doc(db, 'userProfiles', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastActiveAt: serverTimestamp(), // Update last active time
          }, { merge: true });
        } catch (error) {
          console.warn("Failed to update user profile on auth state change:", error);
        }
      }
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Only render children once loading is false */}
    </AuthContext.Provider>
  );
};