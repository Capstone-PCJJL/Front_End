// src/utils/useConsentGuard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useConsentGuard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConsent = async () => {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch(`http://localhost:5500/api/getUserConsent?userId=${userId}`);
        const data = await res.json();

        if (!res.ok || !data.consented) {
          navigate('/consent');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Consent check failed:', err);
        navigate('/login');
      }
    };

    checkConsent();
  }, [navigate]);

  return loading;
};

export default useConsentGuard;
