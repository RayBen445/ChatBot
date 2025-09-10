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
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Send email verification with better error handling
      try {
        // 🐛 ISSUE 2 ROOT CAUSE: Email verification ERR_CONNECTION_REFUSED
        // The fallback URL may not be properly authorized in Firebase Console
        // handleCodeInApp: true requires proper Firebase Dynamic Links setup
        // or the domain must be in Firebase Console > Authentication > Settings > Authorized domains
        // Current fallback URL: window.location.origin + "/"
        // SOLUTION NEEDED: Ensure proper domain authorization in Firebase Console
        await sendEmailVerification(result.user, {
          url: `${window.location.origin}/`,  // Fallback URL
          handleCodeInApp: true
        });
      } catch (verificationError) {
        console.error('Email verification sending failed:', verificationError);
        // Don't fail signup if email verification fails
        // User can resend verification later
      }
      
      // Create user profile in Firestore
      await createUserProfile(result.user, { displayName });
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = (email, password) => {
    if (!auth) throw new Error('Firebase not initialized');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = (email) => {
    if (!auth) throw new Error('Firebase not initialized');
    return sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (!auth || !currentUser) throw new Error('User not authenticated');
    try {
      // 🐛 ISSUE 2 CONTINUED: Same domain authorization issue applies here
      // ERR_CONNECTION_REFUSED occurs when Firebase cannot reach the continuation URL
      // or when the domain is not authorized in Firebase Console
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}/`,  // Fallback URL
        handleCodeInApp: true
      });
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Email verification resend failed:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to send verification email. ';
      if (error.code === 'auth/too-many-requests') {
        userMessage += 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/network-request-failed') {
        userMessage += 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
        userMessage += 'Unable to reach verification service. Please try again later or contact support.';
      } else {
        userMessage += 'Please try again later or contact support if the problem persists.';
      }
      
      return { 
        success: false, 
        message: userMessage,
        error: error.code || 'unknown-error' 
      };
    }
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