import '../Styling.css';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";



function Recommendation() {
    // set up list of movies, notinterest movies, and ratings
    const [movies, setMovies] = useState([]);
    const [notInterested, setNotInterested] = useState([]);
    const [ratings, setRatings] = useState([]);
    // Set up pages for naviation
    const pages = [
        { title: "Home", path: "/Home" },
        { title: "Recommendations", path: '/Recommendation' },
        { title: "Your List", path: '/YourList' },
    ];

    const navigate = useNavigate();

    // Make pages have hyper links
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

    // Grab a static 20 movies (the first 20) to start the recommendations with
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
                //console.log(data) // To see whether to use movieId or id
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        testApiCall();
    }, []);

    // When rating is changes, update based on the movie id
    const handleRatingChange = (id, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [id]: rating,
        }));
    };

    // when not interested pressed, remove movie from recs list and add to not interested list
    const handleNotInterested = (movie) => {
        setMovies((prevMovies) => prevMovies.filter((m) => m.id !== movie.id));
        setNotInterested((prevList) => [...prevList, movie]);
    };


    return (
        <div>
            {/* Building Nav Bar */}
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
            {/* Building Page Content */}
            <div className="main-content">
                {/* Simple Title */}
                <h2 style={{ color: 'white', fontWeight: 'bold', marginLeft: '20px' }}>Movie Recommendations</h2>
                {/* List movies as movie-cards. Styling on Styling.css */}
                {movies.map((movie) => (
                    <div key={movie.id} className="movie-card">
                        {/* Insert Image */}
                        <img
                            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                            alt={`${movie.title} Poster`}
                            className="movie-poster"
                        />
                        {/* Build movie info (title, overview, rating) */}
                        <div className="movie-info">
                            {/* Header is only title and overview since they are at the top while ratings are at the bottom */}
                            <div className="movie-header">
                                <h2 className="movie-title">{movie.title}</h2>
                                <p className="movie-overview">{movie.overview}</p>
                            </div>
                            <div className="movie-rating">
                                <label htmlFor={`rating-${movie.id}`}>Rate this movie:</label>
                                {/* Ratings drop down*/}
                                <select
                                    id={`rating-${movie.id}`}
                                    value={ratings[movie.id] || ""}
                                    onChange={(e) => handleRatingChange(movie.id, e.target.value)}
                                >
                                    <option value="" disabled>Select rating</option>
                                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                                        <option key={rating} value={rating}>
                                            {rating} ★
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Not interested button */}
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
