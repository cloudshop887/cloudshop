import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVM8Zf17Zl6Ug9NEw7VBLLCT1Kahqj8Kk",
    authDomain: "cloud-shop-f7556.firebaseapp.com",
    projectId: "cloud-shop-f7556",
    storageBucket: "cloud-shop-f7556.firebasestorage.app",
    messagingSenderId: "927655980361",
    appId: "1:927655980361:web:b47cf274654abfc680fe98",
    measurementId: "G-YW5512XX0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account' // Always show account selection
});

// Helper function to setup reCAPTCHA for phone auth
export const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: (response) => {
                // reCAPTCHA solved
                console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
                // Response expired
                console.log('reCAPTCHA expired');
            }
        });
    }
    return window.recaptchaVerifier;
};

export default app;
