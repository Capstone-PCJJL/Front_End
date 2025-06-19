import {initializeApp} from 'firebase/app';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5qXWDJ_oEXPP6t1Tfzd7if-3Hhm6CcQY",
  authDomain: "capstone-pcjjl.firebaseapp.com",
  projectId: "capstone-pcjjl",
  storageBucket: "capstone-pcjjl.firebasestorage.app",
  messagingSenderId: "728853282912",
  appId: "1:728853282912:web:be40b8c972f9109afd8305",
  measurementId: "G-3B11W2GTRZ"
};

const app = initializeApp(firebaseConfig);

class Firebase {
  constructor() {
    this.auth = getAuth(app);
    this.googleProvider = new GoogleAuthProvider();
  }
  doCreateUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(this.auth, email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    signInWithEmailAndPassword(this.auth, email, password);

  doSignOut = () => signOut(this.auth);

  doPasswordReset = email => sendPasswordResetEmail(this.auth, email);

  doPasswordUpdate = password =>
    updatePassword(this.auth.currentUser, password);

  doGetIdToken = () => {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        user
          .getIdToken()
          .then(token => {
            resolve(token);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        reject(new Error('No user is signed in.'));
      }
    });
  };

  doSignInWithGoogle = () => signInWithPopup(this.auth, this.googleProvider);
}

export default Firebase;