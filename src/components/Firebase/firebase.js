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
  doCreateUserWithEmailAndPassword = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (userCredential.user) {
      const userId = userCredential.user.uid;
      try {
        await fetch('/api/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      } catch (error) {
        console.error('Failed to create user in SQL database', error);
        // We might want to handle this error more gracefully
      }
    }
    return userCredential;
  };

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

  doSignInWithGoogle = async () => {
    const userCredential = await signInWithPopup(this.auth, this.googleProvider);
    if (userCredential.user) {
      const { uid } = userCredential.user;
      // Check if this is a new user
      const { additionalUserInfo } = userCredential;
      if (additionalUserInfo?.isNewUser) {
        try {
          await fetch('/api/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid }),
          });
        } catch (error) {
          console.error('Failed to create user in SQL database', error);
        }
      }
    }
    return userCredential;
  };
}

export default Firebase;