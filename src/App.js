import './App.css';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const testApiCall = async () => {
      try {
        const response = await fetch('/api/getMovies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    testApiCall();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to our Capstone Project
        </p>
      </header>
    </div>
  );
}

export default App;
