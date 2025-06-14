import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseContext from '../Firebase/context';
import './SignUp.css';

const SignUp = () => {
  const firebase = useContext(FirebaseContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate all fields
    if (!firstName || !lastName || !userName || !email || !password) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the user in Firebase
      const authUser = await firebase.doCreateUserWithEmailAndPassword(email, password);
      console.log('User created successfully:', authUser);

      // Try to store additional user data (optional - won't fail if backend is down)
      try {
        const response = await fetch('/api/SignUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            userName,
            email,
            password,
          }),
        });

        if (!response.ok) {
          console.warn('Failed to store user data in backend, but Firebase auth succeeded');
        }
      } catch (backendError) {
        console.warn('Backend server not available, but Firebase auth succeeded:', backendError);
      }

      // Reset form and navigate directly to Home
      setFirstName('');
      setLastName('');
      setUserName('');
      setEmail('');
      setPassword('');
      navigate('/Home');
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !firstName || !lastName || !userName || !email || !password || loading;

  return (
    <div className="container_s">
      <div className="form">
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="btn"
            type="submit"
            disabled={isInvalid}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;