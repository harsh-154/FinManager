import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Function to create/update user profile in Firestore
  const createUserProfile = async (user, displayName = null) => {
    try {
      const userRef = doc(db, 'userProfiles', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.email.split('@')[0], // Default display name
          createdAt: new Date(),
        });
      } else if (displayName && userDoc.data().displayName !== displayName) {
        // Only update if displayName is provided and different
        await updateDoc(userRef, { displayName: displayName });
      }
      return true;
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
      return false;
    }
  };

  const signup = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, email.split('@')[0]); // Create profile on signup
      return true;
    } catch (error) {
      console.error("Error during signup:", error);
      setAuthError(error.message);
      return false;
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      setAuthError(error.message);
      return false;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setCurrentUser(null); // Clear current user state on logout
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      setAuthError(error.message);
      return false;
    }
  };

  // NEW: Function to update user profile fields
  const updateUserProfile = async (uid, updates) => {
    if (!uid) {
        setAuthError('User ID is required for profile update.');
        return false;
    }
    if (!updates || Object.keys(updates).length === 0) {
        setAuthError('No updates provided.');
        return false;
    }
    try {
        const userRef = doc(db, 'userProfiles', uid);
        await updateDoc(userRef, updates);
        setAuthError(null);
        // Optimistically update currentUser state if displayName changes
        if (updates.displayName) {
            setCurrentUser(prevUser => ({
                ...prevUser,
                displayName: updates.displayName,
            }));
        }
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        setAuthError(`Failed to update profile: ${error.message}`);
        return false;
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile from Firestore if it exists
        const userProfileRef = doc(db, 'userProfiles', user.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          setCurrentUser({ ...user, ...userProfileSnap.data() }); // Merge auth user with profile data
        } else {
          // If no profile exists (e.g., old user or direct auth creation), create one
          await createUserProfile(user);
          const newUserProfileSnap = await getDoc(userProfileRef); // Re-fetch after creation
          setCurrentUser({ ...user, ...newUserProfileSnap.data() });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile, // Expose the new function
    loading,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Only render children once loading is complete */}
    </AuthContext.Provider>
  );
};