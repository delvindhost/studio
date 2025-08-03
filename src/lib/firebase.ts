// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, auth, db };
