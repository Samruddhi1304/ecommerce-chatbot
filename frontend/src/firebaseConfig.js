// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Remove this line

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "e-commerce-chatbot-b0364.firebaseapp.com",
  projectId: "e-commerce-chatbot-b0364",
  storageBucket: "e-commerce-chatbot-b0364.firebasestorage.app",
  messagingSenderId: "794449988182",
  appId: "1:794449988182:web:543297ddaee89ac796c9f7",
  measurementId: "G-NMZ3LT2063"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app); // Remove this line