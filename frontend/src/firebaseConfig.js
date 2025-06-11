// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYaUR01ADDufVLwAQBY_S0W9Mbd6cPMns",
  authDomain: "e-commerce-chatbot-b0364.firebaseapp.com",
  projectId: "e-commerce-chatbot-b0364",
  storageBucket: "e-commerce-chatbot-b0364.firebasestorage.app",
  messagingSenderId: "794449988182",
  appId: "1:794449988182:web:94fbe8c87e6e203996c9f7",
  measurementId: "G-KBX2LT2B0S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);