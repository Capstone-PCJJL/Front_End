import React, { useEffect, useState } from 'react'; // add useState here
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from '../Landing';
import YourList from '../YourList';
import Recommendation from '../Recommendation';
import Login from '../Login';
import Signup from '../Signup';
import Profile from '../Profile';
import ImportCsv from '../ImportCsv';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [ratings, setRatings] = useState({});
  const [notInterested, setNotInterested] = useState([]);

  useEffect(() => {
    const fetchAllMovieData = async () => {
      try {
        const response = await fetch('/api/getMovies');
        if (!response.ok) throw new Error('Failed to fetch movies');
        const movies = await response.json();

        const detailedMovies = await Promise.all(
          movies.map(async (movie) => {
            const [genresRes, creditsRes] = await Promise.all([
              fetch(`/api/getGenres?movieId=${movie.id}`),
              fetch(`/api/getCredits?movieId=${movie.id}`),
            ]);

            const genres = await genresRes.json();
            const credits = await creditsRes.json();

            return {
              ...movie,
              genres: genres.map(g => g.genre_name),
              credits,
            };
          })
        );

        setMovies(detailedMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    fetchAllMovieData();
  }, []);

  const handleRatingChange = (id, rating) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

  const handleNotInterested = (movie) => {
    setMovies(prev => prev.filter(m => m.id !== movie.id));
    setNotInterested(prev => [...prev, movie]);
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes: pass props down */}
        <Route 
          path="/Recommendation" 
          element={
            <Recommendation 
              movies={movies} 
              ratings={ratings} 
              onRate={handleRatingChange} 
              onNotInterested={handleNotInterested} 
            />
          } 
        />
        <Route 
          path="/YourList" 
          element={<YourList />} 
        />
        <Route 
          path="/Home" 
          element={
            <Landing 
              movies={movies} 
              ratings={ratings} 
              onRate={handleRatingChange} 
              onNotInterested={handleNotInterested} 
            />
          } 
        />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/import-csv" element={<ImportCsv />} />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

