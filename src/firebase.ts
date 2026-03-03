// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCEyMVcpdCIP3mdwNmYVIv-7kmQYKlodWs",
    authDomain: "reference-fact-225613.firebaseapp.com",
    projectId: "reference-fact-225613",
    storageBucket: "reference-fact-225613.firebasestorage.app",
    messagingSenderId: "174497847251",
    appId: "1:174497847251:web:2a46b36d59c74d3093c126"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };
