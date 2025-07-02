import '../Styling.css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import MovieCard from './MovieCard';


const Recommendation = ({ movies, ratings, onRate, onNotInterested }) => {
    
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
                <h2 style={{ color: 'white', fontWeight: 'bold', marginLeft: '20px' }}>
                  Movie Recommendations
                </h2>
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    rating={ratings[movie.id]}
                    onRate={onRate}
                    onNotInterested={onNotInterested}
                  />
                ))}
              </div>
        </div>
        );
    };

export default Recommendation;
