import '../Styling.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import MovieCard from './SavedMovie';
import useConsentGuard from '../utils/useConsentGuard';

const Watchlist = () => {
    const loadingConsent = useConsentGuard();

    const userId = localStorage.getItem('userId');
    const [watchlist, setWatchlist] = useState([]);

    const pages = [
        { title: "Home", path: "/Home" },
        { title: "Watchlist", path: '/Watchlist' },
    ];
    
    const navigate = useNavigate();
    
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

        const fetchWatchlist = async () => {
            try {
              const res = await fetch(`/api/getWatchlist?userId=${userId}`);
              if (!res.ok) throw new Error('Failed to fetch watchlist');
              const movies = await res.json();
          
              const detailedMovies = await Promise.all(
                movies.map(async (movie) => {
                  const [genresRes, creditsRes] = await Promise.all([
                    fetch(`/api/getGenres?movieId=${movie.id}`),
                    fetch(`/api/getCredits?movieId=${movie.id}`)
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
          
              setWatchlist(detailedMovies);
            } catch (error) {
              console.error('Error fetching detailed watchlist:', error);
              setWatchlist([]);
            }
        };

        const handleRemoveFromWatchlist = async (movieId) => {
            try {
                const res = await fetch('/api/removeFromWatchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, movieId }),
                });

                if (!res.ok) throw new Error('Failed to remove movie from watchlist');

                setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
            } catch (err) {
                console.error('Error removing movie:', err);
            }
        };

        useEffect(() => {
            fetchWatchlist();
        }, []);
          
    if (loadingConsent) return <div>Loading...</div>;
        
    return (
        <div>
            <header className="navbar">
                <img
                    src="logo-placeholder.png"
                    alt="Logo"
                    className="navbar-logo"
                />
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
                <h2 style={{ color: 'white', fontWeight: 'bold', marginLeft: '20px' }}>
                Your Watchlist
                </h2>
                {watchlist.length > 0 ? (
                watchlist.map((movie) => (
                    <MovieCard
                    key={movie.id}
                    movie={movie}
                    onRemoveFromWatchlist={handleRemoveFromWatchlist}
                    // Add more props if needed
                    />
                ))
                ) : (
                <p style={{ color: 'white', marginLeft: '20px' }}>No movies in your watchlist yet.</p>
                )}
            </div>
        </div>
    );
}

export default Watchlist;
