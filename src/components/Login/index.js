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
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await firebase.doSignInWithEmailAndPassword(email, password);
      setEmail('');
      setPassword('');
      navigate('/Home');
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