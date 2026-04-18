import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDmA1bauiOUZciPDX6uoncqtp5Zr-7HUEc",
  authDomain: "quiz-app-15aea.firebaseapp.com",
  projectId: "quiz-app-15aea",
  storageBucket: "quiz-app-15aea.firebasestorage.app",
  messagingSenderId: "463928949463",
  appId: "1:463928949463:web:e2a6d8f7a4b37b692f0e92"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)