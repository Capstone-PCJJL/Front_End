import React, { useState, useContext } from 'react'; // <-- include useContext here
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

  const handleAuthSuccess = async (firebaseUser) => {
    const firebaseId = firebaseUser.uid;
    const currentUserId = localStorage.getItem('userId');

    try {
      const response = await fetch('http://localhost:5500/api/linkOrSwitchUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseId, currentUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Replace localStorage userId with the linked/final one
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('firebaseId', firebaseId);
        navigate('/Home');
      } else {
        setError(data.error || 'Failed to link Firebase ID');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await firebase.doSignInWithEmailAndPassword(email, password); 
      // Changing this to line call back function above
      // --------------------------------------------------------
      // localStorage.setItem('userId', userCredential.user.uid);
      // navigate('/Home');
      // --------------------------------------------------------
      setEmail('');
      setPassword('');
      await handleAuthSuccess(userCredential.user);
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
      // Changing this to line call back function above
      // --------------------------------------------------------
      // localStorage.setItem('userId', userCredential.user.uid); // ✅ safe now
      // navigate('/Home');
      // --------------------------------------------------------
      await handleAuthSuccess(userCredential.user);
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