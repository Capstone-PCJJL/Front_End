const mysql = require('mysql');
const config = require('./config.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
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

/*

This is the signup endpoint. It creates a new user in the database.

*/
app.post('/api/createUser', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send('userId is required');
  }

  const connection = mysql.createConnection(config);

  const createTableSql = 'CREATE TABLE IF NOT EXISTS users (userId VARCHAR(255) PRIMARY KEY)';
  connection.query(createTableSql, (error) => {
    if (error) {
      console.error('Error creating table:', error.message);
      connection.end();
      return res.status(500).send('Error creating table');
    }

    const checkUserSql = 'SELECT userId FROM users WHERE userId = ?';
    connection.query(checkUserSql, [userId], (error, results) => {
      if (error) {
        console.error('Error checking user existence:', error.message);
        connection.end();
        return res.status(500).send('Error checking user');
      }

      if (results.length > 0) {
        // User already exists
        connection.end();
        return res.status(200).send('User already exists');
      }

      const insertUserSql = 'INSERT INTO users (userId) VALUES (?)';
      connection.query(insertUserSql, [userId], (error) => {
        if (error) {
          console.error('Error inserting user:', error.message);
          connection.end();
          return res.status(500).send('Error creating user');
        }

        connection.end();
        res.status(201).send('User created successfully');
      });
    });
  });
});


app.post('/api/importCsv', (req, res) => {
  const { data, userId, table } = req.body;

  if (!Array.isArray(data) || !userId || !table) {
    console.error('Invalid data, missing userId, or missing table');
    return res.status(400).json({ error: 'Invalid data, missing userId, or missing table' });
  }

  let insertSql, values;

  if (table === 'ratings') {
    // ratings.csv: Name, Year, Date, Letterboxd URI, Rating
    insertSql = `
      INSERT INTO ratings (userId, name, year, watched_date, letterboxd_uri, rating)
      VALUES ?
    `;
    values = data.map(row => [
      userId,
      row.Name || null,
      parseInt(row.Year) || null,
      row.Date || null,
      row['Letterboxd URI'] || null,
      parseFloat(row.Rating) || null
    ]);
  } else if (table === 'likes') {
    // likes/films.csv: Date, Name, Year, Letterboxd URI
    insertSql = `
      INSERT INTO likes (userId, date, name, year, letterboxd_uri)
      VALUES ?
    `;
    values = data.map(row => [
      userId,
      row.Date || null,
      row.Name || null,
      parseInt(row.Year) || null,
      row['Letterboxd URI'] || null
    ]);
  } else {
    return res.status(400).json({ error: 'Invalid table specified' });
  }

  pool.query(insertSql, [values], (error, results) => {
    if (error) {
      console.error('❌ MySQL insert error:', error.message);
      return res.status(500).json({ error: 'Failed to insert CSV data' });
    }
    res.status(200).json({ message: `${table} CSV imported successfully`, inserted: results.affectedRows });
  });
});


app.listen(port, () => console.log(`Listening on port ${port}`));