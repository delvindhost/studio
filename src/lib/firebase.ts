// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhDyVaRlMyxIwSAIMcsB15zLKKJYdTvt0",
  authDomain: "controle-q.firebaseapp.com",
  projectId: "controle-q",
  storageBucket: "controle-q.firebasestorage.app",
  messagingSenderId: "611076568023",
  appId: "1:611076568023:web:1673b0fc82d1f42584d192",
  measurementId: "G-52K5PJ8WE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics if running in the browser
if (typeof window !== 'undefined') {
  getAnalytics(app);
}


export { app, auth, db };
