import '../Navbar.css';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";



function Recommendation() {
    const [movies, setMovies] = useState([]);
    const [notInterested, setNotInterested] = useState([]);
    const [ratings, setRatings] = useState([]);
    const pages = [
        { title: "Home", path: "/Home" },
        { title: "Recommendations", path: '/Recommendation' },
        { title: "Your List", path: '/YourList' },
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
    
    useEffect(() => {
        const testApiCall = async () => {
            try {
                const response = await fetch('/api/getMovies', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setMovies(data); 
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        testApiCall();
    }, []);
    
    const handleRatingChange = (movieId, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [movieId]: rating,
        }));
    };

    const handleNotInterested = (movie) => {
        setMovies((prevMovies) => prevMovies.filter((m) => m.movieId !== movie.movieId));
        setNotInterested((prevList) => [...prevList, movie]);
    };


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
                <h2>Movie Recommendations</h2>
                {movies.map((movie) => (
                    <div key={movie.movieId} className="movie-card">
                        <h2 className="movie-title">{movie.title}</h2>
                        <p className="movie-genres">{movie.genres}</p>
                        <div className="movie-rating">
                            <label htmlFor={`rating-${movie.movieId}`}>Rate this movie:</label>
                            <select
                                id={`rating-${movie.movieId}`}
                                value={ratings[movie.movieId] || ""}
                                onChange={(e) => handleRatingChange(movie.movieId, e.target.value)}
                            >
                                <option value="" disabled>Select rating</option>
                                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                                    <option key={rating} value={rating}>
                                        {rating} ★
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="not-interested-button"
                            onClick={() => handleNotInterested(movie)}
                        >
                            Not Interested
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recommendation;
