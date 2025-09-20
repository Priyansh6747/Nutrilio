import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCeokxYRTUlWCnJI8ZRtg-w-KzKn8IB1W4",
    authDomain: "nutrilio-ea247.firebaseapp.com",
    projectId: "nutrilio-ea247",
    storageBucket: "nutrilio-ea247.firebasestorage.app",
    messagingSenderId: "470528429648",
    appId: "1:470528429648:web:8e9c3b58253f2345950b55",
    measurementId: "G-XZP9DYPJFY"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});