const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
// const { getAnalytics } = require('firebase/analytics'); // Удалено для Node.js

const firebaseConfig = {
    apiKey: "AIzaSyBDDD3NMEKrfnXdaXu0qthRU1tG8OZiEms",
    authDomain: "godware-82514.firebaseapp.com",
    projectId: "godware-82514",
    storageBucket: "godware-82514.firebasestorage.app",
    messagingSenderId: "700914923489",
    appId: "1:700914923489:web:5b14ceb4d54ffc56e544a0",
    measurementId: "G-77XTK2VCBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Удалено для Node.js

module.exports = { auth, db }; // Экспортируем только auth и db 