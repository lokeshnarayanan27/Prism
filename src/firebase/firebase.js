// Simulated Firebase config
// Real implementation would use: import { initializeApp } from 'firebase/app';
// import { getStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "SIMULATED_KEY",
  authDomain: "prism-app.firebaseapp.com",
  projectId: "prism-app",
  storageBucket: "prism-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Simulated initialization
export const mockFirebaseApp = {
  name: '[DEFAULT]'
};

export const mockStorage = {
  app: mockFirebaseApp
};

export const mockDb = {
  app: mockFirebaseApp
};

export default {
  app: mockFirebaseApp,
  storage: mockStorage,
  db: mockDb
};
