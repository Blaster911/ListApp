import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLVfcJRMRz5hk80J6sj0j2cKwGo9KDACQ",
  authDomain: "listapp-6c4dc.firebaseapp.com",
  projectId: "listapp-6c4dc",
  storageBucket: "listapp-6c4dc.firebasestorage.app",
  messagingSenderId: "361311533027",
  appId: "1:361311533027:web:82ada5d586139c69c112d6",
  measurementId: "G-EDVJWBTHNX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);