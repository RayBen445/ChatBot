import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, createUserProfile, getUserProfile, updateUserProfile } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    // Send email verification
    await sendEmailVerification(result.user);
    // Create user profile in Firestore
    await createUserProfile(result.user, { displayName });
    return result;
  };

  const login = (email, password) => {
    if (!auth) throw new Error('Firebase not initialized');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = (email) => {
    if (!auth) throw new Error('Firebase not initialized');
    return sendPasswordResetEmail(auth, email);
  };

  const resendVerification = () => {
    if (!auth || !currentUser) throw new Error('User not authenticated');
    return sendEmailVerification(currentUser);
  };

  const logout = () => {
    if (!auth) throw new Error('Firebase not initialized');
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Create or get user profile
          await createUserProfile(user);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Update last active
          await updateUserProfile(user.uid, { lastActive: new Date() });
        } catch (error) {
          console.error('Error setting up user profile:', error);
          // Even if profile setup fails, we should still set a basic profile
          // to ensure the UI doesn't break
          setUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'user',
            subscriptionTier: 'free',
            status: 'active'
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update last active every 5 minutes
  useEffect(() => {
    const updateLastActive = async () => {
      if (currentUser) {
        await updateUserProfile(currentUser.uid, { lastActive: new Date() });
      }
    };

    if (currentUser) {
      const interval = setInterval(updateLastActive, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    resendVerification,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80 text-lg">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};