// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBO341S2I8ZOEEwAW7bgV-ZIbUy42B1v-g",
    authDomain: "yaper-36b50.firebaseapp.com",
    projectId: "yaper-36b50",
    storageBucket: "yaper-36b50.appspot.com",
    messagingSenderId: "64419287008",
    appId: "1:64419287008:web:c98c23efcff3176456e585",
    measurementId: "G-PM1HZHFL2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };
