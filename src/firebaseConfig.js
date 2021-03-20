import firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyC5zuTL4y3Fp_LThWw4396-46_1eoma1XI",
  authDomain: "sf-inventory.firebaseapp.com",
  projectId: "sf-inventory",
  storageBucket: "sf-inventory.appspot.com",
  messagingSenderId: "1092517702761",
  appId: "1:1092517702761:web:3b08d92eac5206f9d786f8",
  measurementId: "G-QZ3V77T21R"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const provider = new firebase.auth.EmailAuthProvider();
export const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

export const dbInstance = firebase.firestore();
// db.settings({
//   timestampsInSnapshots: true
// });
export default firebase;