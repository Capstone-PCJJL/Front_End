import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseContext from '../Firebase/context';
import './VerifyEmail.css';
import { sendEmailVerification, reload } from 'firebase/auth';

const VerifyEmail = () => {
  const firebase = useContext(FirebaseContext);
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(null);

  const user = firebase.auth.currentUser;

  useEffect(() => {
    if (user && !user.emailVerified) {
      sendEmailVerification(user).catch(err => {
        console.error('Error sending verification email:', err);
        setError('Failed to send verification email. Try refreshing.');
      });
    }
  }, [user]);

  const handleRefresh = async () => {
    setChecking(true);
    setError(null);

    try {
      await reload(user);
      if (user.emailVerified) {
        const res = await fetch('http://localhost:5500/api/setVerified', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseId: user.uid }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification update failed');
        }

        navigate('/login');
      } else {
        setError('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
      setError('Something went wrong while checking status.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    try {
        if (user) {
        await sendEmailVerification(user);
        setResendSuccess('Verification email sent again!');
        setError(null);
        }
    } catch (err) {
        console.error('Error resending email:', err);
        setError('Could not resend email.');
    }
  };

  return (
    <div className="container_v">
      <div className="form">
        <h1>Verify Your Email</h1>
        <p>
          We've sent a verification link to <strong>{user?.email}</strong>.
          Please check your inbox and click the link. Email might be in your spam folder
        </p>

        <button className="verify-btn" onClick={handleRefresh} disabled={checking}>
          {checking ? 'Checking...' : 'I have verified my email'}
        </button>

        {error && <div className="error">{error}</div>}

        <button
            className="resend-btn"
            onClick={handleResend}
            type="button"
            >
            Resend verification email
        </button>

        {resendSuccess && <div className="success">{resendSuccess}</div>}
      </div>
    </div>
  );
};

export default VerifyEmail;
