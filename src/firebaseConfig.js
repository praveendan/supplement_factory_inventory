import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

var firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJ_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MSG_SENDR_ID",
  appId: "APP_ID",
  measurementId: "MEASURE_ID"
};

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