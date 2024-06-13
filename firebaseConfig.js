import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYqBwSLz5eOvIYdikmd-yZr6xfLgp61fI",
  authDomain: "flitflok-de730.firebaseapp.com",
  projectId: "flitflok-de730",
  storageBucket: "flitflok-de730.appspot.com",
  messagingSenderId: "179030744469",
  appId: "1:179030744469:web:46ce0b2ea8a7853ef56a9c",
  measurementId: "G-TNHDF3ND1Q",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
