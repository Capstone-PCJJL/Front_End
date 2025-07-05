import React, { useEffect, useState, useContext } from 'react';
import { MovieListContext, MovieListProvider } from '../movieListContext';

// HomeCard contains all the information required for a user to rate and review initial movies
const HomeCard = ({ movie, rating, onRate, onNotInterested }) => {
  const { movieList, addToMovieList, removeFromMovieList } = useContext(MovieListContext);
  if (!movie) return null; // safety check

  const isInMovieList = movieList.some(m => m.id === movie.id);
  return (
    <div className="home-card">
      <img
        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
        alt={`${movie.title} Poster`}
        className="movie-poster"
      />
      <div className="movie-info">
        <div className="movie-header">
          <h2 className="movie-title">
            {movie.title} <span className="movie-date">({new Date(movie.release_date).getFullYear()})</span>
          </h2>
          <p className="movie-genres">
            <span className="genre-label">Genres:</span>{' '}
            <span className="genre-list">{movie.genres?.join(', ')}</span>
          </p>
          <p className="movie-runtime">
            <span className="runtime-label">Runtime:</span>{' '}
            <span className="runtime-list">{movie.runtime} minutes</span>
          </p>
          <p className="movie-overview">{movie.overview}</p>
          <div className="movie-credits">
            <span className='director-label'>Director: </span>
              <span className='director-name'>
                {movie.credits
                  ?.filter(c => c.job.toLowerCase() === "director")
                  .map(c => c.name)
                  .join(', ')}
              </span>
            </div>
            <div className="movie-actors">
              <span className='actors-label'>Actors: </span>
              <span className='actors-names'>
                {movie.credits
                  ?.filter(c => c.job.toLowerCase() === "actor")
                  .map(c => c.name)
                  .join(', ')}
              </span>
          </div>
        </div>
        {onRate && (
          <div className="movie-rating">
            <label htmlFor={`rating-${movie.id}`}>Rate this movie:</label>
            <select
              id={`rating-${movie.id}`}
              value={rating || ""}
              onChange={(e) => onRate(movie.id, e.target.value)}
            >
              <option value="" disabled>Select rating</option>
              {[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(r => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="action-buttons">
        <button
          className="add-to-list-button"
          onClick={() =>
            isInMovieList ? removeFromMovieList(movie.id) : addToMovieList(movie)
          }
        >
          {isInMovieList ? 'Remove from your list' : 'Add to your list'}
        </button>
        {onNotInterested && (
          <button className="not-interested-button" onClick={() => onNotInterested(movie)}>
            Not Interested
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeCard;