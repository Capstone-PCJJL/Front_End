import React from 'react';

// MovieCard containing all information associated with the movie
const MovieCard = ({ movie, rating, onRate, onNotInterested }) => (
    <div className="movie-card">
        <img
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            alt={`${movie.title} Poster`}
            className="movie-poster"
        />
        <div className="movie-info">
            <div className="movie-header">
                <h2 className="movie-title">{movie.title}</h2>
                <p className="movie-overview">{movie.overview}</p>
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
                        {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => (
                            <option key={r} value={r}>{r} ★</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
        {onNotInterested && (
            <button className="not-interested-button" onClick={() => onNotInterested(movie)}>
                Not Interested
            </button>
        )}
    </div>
);

export default MovieCard;