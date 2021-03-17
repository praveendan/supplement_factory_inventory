import firebase from 'firebase'

var firebaseConfig = {

};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const provider = new firebase.auth.EmailAuthProvider();
export const auth = firebase.auth();
export default firebase;