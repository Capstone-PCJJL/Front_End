import '../Styling.css';
import './HomeStyling.css';
import HomeCard from './HomeCard';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import useConsentGuard from '../utils/useConsentGuard';

// Notification Popups
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Home Page Component
// Generates list of recommended movies
const Home = () => {
    const loadingConsent = useConsentGuard();

    const [currentIndex, setCurrentIndex] = useState(0); // Currently viewed movie (0-20)
    const [movies, setMovies] = useState([]); // Recommended Movies
    const [ratings, setRatings] = useState({}); // User rates movie
    const [notInterested, setNotInterested] = useState([]); // User labels movie not interested
    const [loading, setLoading] = useState(false); // Checks if data is loaded
    const navigate = useNavigate(); // Navigate between movies
    const userId = localStorage.getItem('userId'); // UserID (Currently firebase_id)
    
  const pages = [
    { title: "Home", path: "/Home" },
    { title: "Watchlist", path: '/Watchlist' },
  ];

  const renderLinks = () =>
    pages.map((page) => (
      <li key={page.title}>
        <a
          href={page.path}
          className={
            window.location.pathname.toLowerCase() === page.path.toLowerCase()
              ? "active"
              : ""
          }
          onClick={(e) => {
            e.preventDefault();
            navigate(page.path);
          }}
        >
          {page.title}
        </a>
      </li>
    ));

 
  // Temp API request pulling the first 20 movies
  // Pulls credits and genres for the movies
// Put this above useEffect so both useEffect and your button can use it
const fetchAllMovieData = async () => {
    try {
      const response = await fetch(`/api/getMovies?userId=${userId}`);
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

  // User is not interested in film
  // Removed from recommended list
  const handleNotInterested = async (movie) => {
    try {
      // Removed from visible list (Front End)
      setMovies(prev => prev.filter(m => m.id !== movie.id));
      setNotInterested(prev => [...prev, movie]);
  
      // POST request to backend (Flagging movie)
      const response = await fetch('/api/notInterested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'), // Gets firebase_id
          movieId: movie.id, // Gets movie_id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save not interested movie');
      }

      toast.warn('Movie added to not interested', {
        closeButton: false,
      });
    } catch (error) {
      console.error('Error sending not interested to server:', error);
    }
  };

  // User adds film to watchlist
  // Removed from recommended list
  const handleAddToWatchlist = async (movie) => {
    try {

      // Removed from visible list (Front End)
      setMovies(prev => prev.filter(m => m.id !== movie.id));
      setNotInterested(prev => [...prev, movie]);
  
      // POST request to backend (Flagging movie)
      const response = await fetch('/api/addToWatchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          movieId: movie.id,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }

      toast.success('Added to Watchlist!', {
        closeButton: false,
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };
  

  const handleRatingChange = (id, rating) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

    // Reset currentIndex if movies list changes
    useEffect(() => {
        if (currentIndex >= movies.length) {
        setCurrentIndex(0);
        }
    }, [movies, currentIndex]);

    useEffect(() => {
        fetchAllMovieData();
    }, []);

    // When user confirms their rating
    const handleConfirmRating = async (movieId) => {
      const rating = ratings[movieId];
      if (!rating) return;
    
      try {
        const response = await fetch('/api/addToRatings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            movieId,
            rating,
          }),
        });
    
        if (!response.ok) {
          throw new Error('Failed to save rating');
        }
    
        toast.success('Rating saved!', {
          closeButton: false,
        });
        setMovies(prev => prev.filter(movie => movie.id !== movieId));
        
      } catch (error) {
        console.error('Error saving rating:', error);
      }
    };
    
      
    if (loadingConsent) return <div>Loading...</div>;

    return (
        <div>
          <header className="navbar">
            <img src="logo-placeholder.png" alt="Logo" className="navbar-logo" />
            <ul className="navbar-links">{renderLinks()}</ul>
            <div className="navbar-profile">
              <a
                href="/Profile"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/Profile");
                }}
              >
                <AiOutlineUser className="navbar-profile-icon" />
              </a>
            </div>
          </header>
          
          <div className="main-content">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="recommendation-header">
              <h2 className="recommendation-title">
                Please see your recommended films:
              </h2>

              {movies.length > 0 && currentIndex < movies.length && (
                <div className="navigation-buttons">
                  <button
                    className="nav-button"
                    onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                    disabled={currentIndex === 0}
                  >
                    <FaArrowLeft style={{ marginRight: '8px' }} />
                    Previous
                  </button>
                  <button
                    className="nav-button"
                    onClick={() => setCurrentIndex(i => Math.min(i + 1, movies.length - 1))}
                    disabled={currentIndex >= movies.length - 1}
                  >
                    Next
                    <FaArrowRight style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              )}

              <button onClick={fetchAllMovieData} className="refresh-button">
                <FiRefreshCw style={{ marginRight: '8px' }} />
                Refresh Recommendations
              </button>
            </div>
            {movies.length > 0 && (
              <HomeCard
                key={movies[currentIndex].id}
                movie={movies[currentIndex]}
                rating={ratings[movies[currentIndex].id]}
                onRate={handleRatingChange}
                onNotInterested={handleNotInterested}
                onAddToWatchlist={handleAddToWatchlist}
                onConfirmRating={handleConfirmRating}
              />
            )}
          </div>
        </div>
      );
    }

export default Home;

