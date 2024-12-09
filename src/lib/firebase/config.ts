import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDLVfcJRMRz5hk80J6sj0j2cKwGo9KDACQ",
  authDomain: "listapp-6c4dc.firebaseapp.com",
  projectId: "listapp-6c4dc",
  storageBucket: "listapp-6c4dc.firebasestorage.app",
  messagingSenderId: "361311533027",
  appId: "1:361311533027:web:82ada5d586139c69c112d6",
  measurementId: "G-EDVJWBTHNX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);