import React, { createContext, useEffect, useState } from 'react';

export const MovieListContext = createContext();

export const MovieListProvider = ({ children }) => {
  const [movieList, setMovieList] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('movieList');
    if (stored) setMovieList(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('movieList', JSON.stringify(movieList));
  }, [movieList]);

  const addToMovieList = (movie) => {
    setMovieList(prev => (prev.some(m => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const removeFromMovieList = (id) => {
    setMovieList(prev => prev.filter(movie => movie.id !== id));
  };

  return (
    <MovieListContext.Provider value={{ movieList, addToMovieList, removeFromMovieList }}>
      {children}
    </MovieListContext.Provider>
  );
};
