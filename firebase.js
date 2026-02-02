import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

// Firebase configuration
// You'll need to replace these with your Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-project.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
let app;
let database;

try {
  console.log('Initializing Firebase with config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '***' : 'MISSING'
  });
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  alert('Firebase connection failed. Data will only be saved locally. Error: ' + error.message);
}

// Get or create user ID (stored in localStorage)
export const getUserId = () => {
  let userId = localStorage.getItem('sf-rental-user-id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sf-rental-user-id', userId);
  }
  return userId;
};

// Set custom user ID
export const setUserId = (newUserId) => {
  if (newUserId && newUserId.trim()) {
    const sanitized = newUserId.trim().replace(/[.#$\[\]]/g, '_');
    localStorage.setItem('sf-rental-user-id', sanitized);
    return sanitized;
  }
  return getUserId();
};

// Update last active timestamp
export const updateLastActive = async () => {
  if (!database) return;
  try {
    const userId = getUserId();
    await set(ref(database, `users/${userId}/lastActive`), Date.now());
  } catch (error) {
    console.error('Error updating last active:', error);
  }
};

// Clean up inactive users (30 days)
export const cleanupInactiveData = async () => {
  if (!database) return;
  try {
    const userId = getUserId();
    const snapshot = await get(ref(database, `users/${userId}/lastActive`));
    const lastActive = snapshot.exists() ? snapshot.val() : Date.now();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    if (lastActive < thirtyDaysAgo) {
      // Data is older than 30 days, clear it
      await set(ref(database, `users/${userId}`), null);
      console.log('Cleaned up inactive user data');
    }
  } catch (error) {
    console.error('Error cleaning up data:', error);
  }
};

// Save properties to Firebase
export const savePropertiesToFirebase = async (properties) => {
  if (!database) {
    console.warn('Firebase not initialized, skipping save');
    return false;
  }
  try {
    const userId = getUserId();
    console.log('Saving to Firebase for user:', userId, 'Properties count:', properties.length);
    await set(ref(database, `users/${userId}/properties`), properties);
    console.log('Successfully saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
};

// Get properties from Firebase
export const getPropertiesFromFirebase = async () => {
  if (!database) {
    console.warn('Firebase not initialized, cannot load');
    return null;
  }
  try {
    const userId = getUserId();
    console.log('Loading from Firebase for user:', userId);
    const snapshot = await get(ref(database, `users/${userId}/properties`));
    const data = snapshot.exists() ? snapshot.val() : null;
    console.log('Loaded from Firebase:', data ? `${data.length} properties` : 'no data');
    return data;
  } catch (error) {
    console.error('Error getting from Firebase:', error);
    return null;
  }
};

// Delete property from Firebase
export const deletePropertyFromFirebase = async (propertyId) => {
  if (!database) return;
  try {
    const userId = getUserId();
    const properties = await getPropertiesFromFirebase();
    if (properties) {
      const updated = properties.filter(p => p.id !== propertyId);
      await set(ref(database, `users/${userId}/properties`), updated);
    }
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
  }
};

// Listen to Firebase changes (for real-time sync across tabs/devices)
export const onPropertiesChange = (callback) => {
  if (!database) {
    console.warn('Firebase not initialized, cannot listen to changes');
    return () => {};
  }
  try {
    const userId = getUserId();
    console.log('Setting up Firebase listener for user:', userId);
    const propertiesRef = ref(database, `users/${userId}/properties`);
    return onValue(propertiesRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : [];
      console.log('Firebase data changed:', data ? `${data.length} properties` : 'empty');
      callback(data);
    });
  } catch (error) {
    console.error('Error listening to Firebase:', error);
    return () => {};
  }
};

export default { getUserId, setUserId, savePropertiesToFirebase, getPropertiesFromFirebase, deletePropertyFromFirebase, onPropertiesChange, updateLastActive, cleanupInactiveData };
