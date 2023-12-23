// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKLeIlCv5nkQ6zlJrt8AXXjIuX2nIVSFU",
  authDomain: "whatsappclone-5fb1b.firebaseapp.com",
  projectId: "whatsappclone-5fb1b",
  storageBucket: "whatsappclone-5fb1b.appspot.com",
  messagingSenderId: "463702684546",
  appId: "1:463702684546:web:e946497048c9ce72b8559b",
  measurementId: "G-YRCWFJQMBD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
