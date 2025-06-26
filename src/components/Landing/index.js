import '../Styling.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import HomeCard from './HomeCard';

const Landing = ({ movies, ratings, onRate, onNotInterested }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    
  const pages = [
    { title: "Home", path: "/Home" },
    { title: "Recommendations", path: '/Recommendation' },
    { title: "Your List", path: '/YourList' },
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

    // Reset currentIndex if movies list changes (optional)
    useEffect(() => {
        if (currentIndex >= movies.length) {
        setCurrentIndex(0);
        }
    }, [movies, currentIndex]);

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
              Welcome to CinemaStack, please see your recommended films:
            </h2>
            {movies.length > 0 && (
              <HomeCard
                key={movies[currentIndex].id}
                movie={movies[currentIndex]}
                rating={ratings[movies[currentIndex].id]}
                onRate={onRate}
                onNotInterested={onNotInterested}
              />
            )}
            {movies.length > 0 && currentIndex < movies.length && (
              <div style={{ display: 'flex', gap: '1rem', marginLeft: '20px' }}>
                <button
                  className="prev-button"
                  onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  className="next-button"
                  onClick={() => setCurrentIndex(i => Math.min(i + 1, movies.length - 1))}
                  disabled={currentIndex >= movies.length - 1}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

export default Landing;

