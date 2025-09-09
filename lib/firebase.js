import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, updateDoc, where, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if we have valid configuration
let app = null;
let auth = null;
let db = null;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { auth, db };
export default app;

// Admin configuration
export const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PLUS: 'plus'
};

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
  SUSPENDED: 'suspended'
};

// Firebase helper functions
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user || !db) return null;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, uid } = user;
    const createdAt = new Date();
    const role = email === ADMIN_EMAIL ? USER_ROLES.ADMIN : USER_ROLES.USER;
    
    try {
      await setDoc(userRef, {
        uid,
        displayName,
        email,
        role,
        subscriptionTier: SUBSCRIPTION_TIERS.FREE,
        status: USER_STATUS.ACTIVE,
        createdAt,
        lastActive: createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
  
  return userRef;
};

export const getUserProfile = async (uid) => {
  if (!uid || !db) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!uid || !db) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const getAllUsers = async () => {
  if (!db) return [];
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const banUser = async (uid) => {
  return updateUserProfile(uid, { 
    status: USER_STATUS.BANNED,
    bannedAt: new Date()
  });
};

export const suspendUser = async (uid, duration = '7d') => {
  const suspendedUntil = new Date();
  if (duration === '7d') {
    suspendedUntil.setDate(suspendedUntil.getDate() + 7);
  } else if (duration === '30d') {
    suspendedUntil.setDate(suspendedUntil.getDate() + 30);
  }
  
  return updateUserProfile(uid, { 
    status: USER_STATUS.SUSPENDED,
    suspendedAt: new Date(),
    suspendedUntil
  });
};

export const reactivateUser = async (uid) => {
  return updateUserProfile(uid, { 
    status: USER_STATUS.ACTIVE,
    reactivatedAt: new Date()
  });
};

export const updateSubscriptionTier = async (uid, tier) => {
  return updateUserProfile(uid, { 
    subscriptionTier: tier,
    subscriptionUpdatedAt: new Date()
  });
};

export const isAdmin = (userProfile) => {
  return userProfile?.role === USER_ROLES.ADMIN;
};

export const canUseFeature = (userProfile, feature) => {
  if (!userProfile || userProfile.status !== USER_STATUS.ACTIVE) {
    return false;
  }
  
  const tier = userProfile.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
  
  switch (feature) {
    case 'chat':
      return true; // All tiers can chat
    case 'advanced_chat':
      return tier === SUBSCRIPTION_TIERS.PRO || tier === SUBSCRIPTION_TIERS.PLUS;
    case 'file_upload':
      return tier === SUBSCRIPTION_TIERS.PLUS;
    case 'voice_input':
      return tier === SUBSCRIPTION_TIERS.PRO || tier === SUBSCRIPTION_TIERS.PLUS;
    case 'unlimited_history':
      return tier === SUBSCRIPTION_TIERS.PLUS;
    default:
      return false;
  }
};