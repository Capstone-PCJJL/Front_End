import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseContext from '../Firebase/context';
import './Login.css';

const Login = () => {
  const firebase = useContext(FirebaseContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getOrCreateUser = async (firebaseId) => {
    const response = await fetch('http://localhost:5500/api/getOrCreateUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to link user');
    }

    return data.userId;
  };

  const handleAuth = async (firebaseUser) => {
    const firebaseId = firebaseUser.uid;
    try {
      const userId = await getOrCreateUser(firebaseId);
      localStorage.setItem('userId', userId);
      localStorage.setItem('firebaseId', firebaseId);
      navigate('/consent'); // route to consent page after login
    } catch (err) {
      setError(err.message);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await firebase.doSignInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.reload(); // Make sure we get latest user state from Firebase

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        navigate('/verifyemail');
        return;
      }

      await handleAuth(user);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await firebase.doSignInWithGoogle(); // ✅ capture return value
      // localStorage.setItem('userId', userCredential.user.uid); // ✅ safe now
      // navigate('/Home');
      await handleAuth(userCredential.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const isInvalid = password === '' || email === '' || loading;

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-control"
            />
          </div>
          <button
            type="submit"
            disabled={isInvalid}
            className={`login-button ${isInvalid ? 'disabled' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={onGoogleSignIn}
            className="login-button google-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login with Google'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="login-footer">
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 

