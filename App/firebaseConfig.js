// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

let analytics = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    }).catch((error) => {
        console.log('Analytics not supported:', error);
    });
}

export {app , auth , analytics}