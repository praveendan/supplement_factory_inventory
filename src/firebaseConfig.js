import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

var firebaseConfig = {
  apiKey: "AIzaSyC5zuTL4y3Fp_LThWw4396-46_1eoma1XI",
  authDomain: "sf-inventory.firebaseapp.com",
  projectId: "sf-inventory",
  storageBucket: "sf-inventory.appspot.com",
  messagingSenderId: "1092517702761",
  appId: "1:1092517702761:web:3b08d92eac5206f9d786f8",
  measurementId: "G-QZ3V77T21R"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyA1B_kyi4zTzr49O6gkHtl1Ij-jZDafQ5w",
//   authDomain: "sf-inventory-1.firebaseapp.com",
//   projectId: "sf-inventory-1",
//   storageBucket: "sf-inventory-1.appspot.com",
//   messagingSenderId: "316396475358",
//   appId: "1:316396475358:web:b1920a76d7950993c4434f",
//   measurementId: "G-YWCQHDQDBV"
// };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const provider = new firebase.auth.EmailAuthProvider();
export const auth = firebase.auth();
//auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

export const dbInstance = firebase.firestore();
// Initialize Cloud Functions through Firebase
export const functions = firebase.functions();
// db.settings({
//   timestampsInSnapshots: true
// });
export default firebase;