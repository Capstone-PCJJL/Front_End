const mysql = require('mysql');
const config = require('./config.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5500;
const pool = mysql.createPool(config);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));

// API call that pulls the first 20 movies
app.get('/api/getMovies', (req, res) => {
  const sql = 'SELECT * FROM movie_capstone_db.movies LIMIT 20;';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching movies:', error);
      return res.status(500).json({ error: 'Error fetching movies' });
    }
    res.json(results);
  });
});

// API call that pulls the genres for a movieID
app.get('/api/getGenres', (req, res) => {
  const movieId = req.query.movieId;

  if (!movieId) {
    return res.status(400).json({ error: 'Missing movieId parameter' });
  }

  const sql = 'SELECT genre_name FROM movie_capstone_db.genres WHERE movie_id = ?';
  pool.query(sql, [movieId], (error, results) => { 
    if (error) {
      console.error('Error fetching genres:', error);
      return res.status(500).json({ error: 'Error fetching genres' });
    }
    res.json(results);
  });
});

// API call that pulls the credits (top 7 actors and director)
app.get('/api/getCredits', (req, res) => {
  const movieId = req.query.movieId;
  console.log(`Received request for genres with movieId: ${movieId}`);

  if (!movieId) {
    return res.status(400).json({ error: 'Missing movieId parameter' });
  }

  const sql = `
      SELECT people.name, credits.job
      FROM movie_capstone_db.people 
      JOIN movie_capstone_db.credits ON people.id = credits.person_id 
      WHERE credits.movie_ID = ? 
      ORDER BY credit_order 
      LIMIT 10
    `;
  pool.query(sql, [movieId], (error, results) => { 
    if (error) {
      console.error('Error fetching genres:', error);
      return res.status(500).json({ error: 'Error fetching genres' });
    }
    res.json(results);
  });
});


app.listen(port, () => console.log(`Listening on port ${port}`));
