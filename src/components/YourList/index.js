import '../Styling.css';
import * as React from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import MovieCard from '../Recommendation/MovieCard';  // adjust import path if needed
import { MovieListContext } from '../movieListContext';

function YourList({ ratings, onRate, onNotInterested }) {
  const pages = [
    { title: "Home", path: "/Home" },
    { title: "Recommendations", path: '/Recommendation' },
    { title: "Your List", path: '/YourList' },
  ];

  const navigate = useNavigate();

  const { movieList } = useContext(MovieListContext);

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
          Your Movie List
        </h2>
        {movieList.length === 0 ? (
          <p style={{ color: 'white', marginLeft: '20px' }}>Your list is empty.</p>
        ) : (
          movieList.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rating={ratings ? ratings[movie.id] : undefined}
              onRate={onRate}
              onNotInterested={onNotInterested}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default YourList;
