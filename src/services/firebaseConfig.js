// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJxQZxwMRH8NkM27Ezjuj4Y9gCQcFk9xA",
  authDomain: "focustar-d1d4a.firebaseapp.com",
  projectId: "focustar-d1d4a",
  storageBucket: "focustar-d1d4a.firebasestorage.app",
  messagingSenderId: "39399847854",
  appId: "1:39399847854:web:1aa91bcfd76a50cbeafa3f",
  measurementId: "G-3GB6YT3VHH"
}

// 🔹 Inicializar app
const app = initializeApp(firebaseConfig);

// 🔹 Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 🔹 Firestore
const db = getFirestore(app);

// 🔹 Exportar todo
export { auth, googleProvider, signInWithPopup, db };