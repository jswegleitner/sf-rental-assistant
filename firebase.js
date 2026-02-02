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
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
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

// Save properties to Firebase
export const savePropertiesToFirebase = async (properties) => {
  if (!database) return;
  try {
    const userId = getUserId();
    await set(ref(database, `users/${userId}/properties`), properties);
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
};

// Get properties from Firebase
export const getPropertiesFromFirebase = async () => {
  if (!database) return null;
  try {
    const userId = getUserId();
    const snapshot = await get(ref(database, `users/${userId}/properties`));
    return snapshot.exists() ? snapshot.val() : null;
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
  if (!database) return () => {};
  try {
    const userId = getUserId();
    const propertiesRef = ref(database, `users/${userId}/properties`);
    return onValue(propertiesRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : [];
      callback(data);
    });
  } catch (error) {
    console.error('Error listening to Firebase:', error);
    return () => {};
  }
};

export default { getUserId, savePropertiesToFirebase, getPropertiesFromFirebase, deletePropertyFromFirebase, onPropertiesChange };
