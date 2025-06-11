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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleFirstNameChange = event => {
    setFirstName(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, firstName: false }));
  };

  const handleLastNameChange = event => {
    setLastName(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, lastName: false }));
  };

  const handleUserNameChange = event => {
    setUserName(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, userName: false }));
  };

  const handleEmailChange = event => {
    setEmail(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, email: false }));
  };

  const handlePasswordChange = event => {
    setPassword(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, password: false }));
  };

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    let hasErrors = false;
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = true;
      hasErrors = true;
    }
    if (!lastName) {
      newErrors.lastName = true;
      hasErrors = true;
    }
    if (!userName) {
      newErrors.userName = true;
      hasErrors = true;
    }
    if (!email || !isValidEmail(email)) {
      newErrors.email = true;
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = true;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const authUser = await firebase.doCreateUserWithEmailAndPassword(email, password);
      console.log('User created successfully:', authUser);

      // Call API to store additional user data
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
        throw new Error('Failed to store user data');
      }

      // Reset form and navigate to dashboard
      setFirstName('');
      setLastName('');
      setUserName('');
      setEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ firebase: error.message });
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !firstName || !lastName || !userName || !email || !password || loading;

  return (
    <div className="container_s">
      <h1>Sign Up</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={handleFirstNameChange}
            required
          />
          {errors.firstName && (
            <span className="error">Please enter your first name</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={handleLastNameChange}
            required
          />
          {errors.lastName && (
            <span className="error">Please enter your last name</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="userName"
            placeholder="Username"
            value={userName}
            onChange={handleUserNameChange}
            required
          />
          {errors.userName && (
            <span className="error">Please enter a username</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {errors.email && (
            <span className="error">Please enter a valid email address</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {errors.password && (
            <span className="error">Please enter a password</span>
          )}
        </div>

        {errors.firebase && (
          <div className="error">{errors.firebase}</div>
        )}

        <button 
          className="btn" 
          type="submit"
          disabled={isInvalid}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default SignUp;