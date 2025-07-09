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
// Does not pull movies if the user has "Not Interested the Film"
app.get('/api/getMovies', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Need to update later when using main database (Not patrick_test)
  const sql = `
    SELECT * FROM movie_capstone_db.movies
    WHERE id NOT IN (
      SELECT movie_id FROM movie_capstone_db.not_interested WHERE user_id = ?
      UNION
      SELECT movie_id FROM movie_capstone_db.watchlists WHERE user_id = ?
    )
    LIMIT 20;
  `;

  pool.query(sql, [userId, userId], (error, results) => {
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

// API call that pulls the credits (top 9 actors and director)
app.get('/api/getCredits', (req, res) => {
  const movieId = req.query.movieId;
  console.log(`Received request for genres with movieId: ${movieId}`);

  if (!movieId) {
    return res.status(400).json({ error: 'Missing movieId parameter' });
  }

  const sql = `
      SELECT people.name, credits.credit_type
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

// API call that pulls all saved movies from a user
app.get('/api/getWatchlist', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const sql = `
    SELECT m.*
    FROM movie_capstone_db.watchlists w
    JOIN movies m ON w.movie_id = m.id
    WHERE w.user_id = ?
  `;

  pool.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching watchlist:', error);
      return res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
    res.json(results);
  });
});

// API PUT that assigns movie as "Not Interested"
app.post('/api/notInterested', (req, res) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return res.status(400).json({ error: 'Missing userId or movieId' });
  }

  const sql = 'INSERT INTO movie_capstone_db.not_interested (user_id, movie_id) VALUES (?, ?)';
  pool.query(sql, [userId, movieId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Failed to save not interested movie' });
    }

    res.status(200).json({ success: true });
  });
});

// API PUT that assigns movie to watchlist
app.post('/api/addToWatchlist', (req, res) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return res.status(400).json({ error: 'Missing userId or movieId' });
  }

  const sql = 'INSERT INTO movie_capstone_db.watchlists (user_id, movie_id) VALUES (?, ?)';
  pool.query(sql, [userId, movieId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Failed to save watchlisted movie' });
    }

    res.status(200).json({ success: true });
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
  const { data, userId } = req.body;

  if (!Array.isArray(data) || !userId) {
    console.error('Invalid data or missing userId');
    return res.status(400).json({ error: 'Invalid data or missing userId' });
  }


  const insertSql = `
    INSERT INTO user_movies (userId, name, year, watched_date, letterboxd_uri, rating)
    VALUES ?
  `;

  const values = data.map(row => [
    userId,
    row.Name || null,
    parseInt(row.Year) || null,
    row.Date || null,
    row['Letterboxd URI'] || null,
    parseFloat(row.Rating) || null
  ]);

  pool.query(insertSql, [values], (error, results) => {
    if (error) {
      console.error('❌ MySQL insert error:', error.message);
      return res.status(500).json({ error: 'Failed to insert CSV data' });
    }
    res.status(200).json({ message: 'CSV imported successfully', inserted: results.affectedRows });
  });
});

app.post('/api/removeFromWatchlist', (req, res) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return res.status(400).json({ error: 'Missing userId or movieId' });
  }

  const sql = 'DELETE FROM movie_capstone_db.watchlists WHERE user_id = ? AND movie_id = ?';
  pool.query(sql, [userId, movieId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Failed to remove movie from watchlist' });
    }

    res.status(200).json({ success: true });
  });
});

app.post('/api/setConsent', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const checkSql = 'SELECT * FROM levent_test.users WHERE userId = ?';

  pool.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user:', err.message);
      return res.status(500).json({ error: 'Database error during check' });
    }

    if (results.length === 0) {
      // Insert new user with consent = true
      const insertSql = 'INSERT INTO levent_test.users (userId, consented) VALUES (?, TRUE)';
      pool.query(insertSql, [userId], (err) => {
        if (err) {
          console.error('Error inserting user:', err.message);
          return res.status(500).json({ error: 'Failed to insert new user' });
        }
        return res.status(201).json({ message: 'New user created with consent' });
      });
    } else {
      // Update existing user's consent
      const updateSql = 'UPDATE levent_test.users SET consented = TRUE WHERE userId = ?';
      pool.query(updateSql, [userId], (err) => {
        if (err) {
          console.error('Error updating consent:', err.message);
          return res.status(500).json({ error: 'Failed to update consent' });
        }
        return res.status(200).json({ message: 'Consent updated successfully' });
      });
    }
  });
});

app.post('/api/createAnonUser', (req, res) => {
  const sql = 'INSERT INTO levent_test.users (consented) VALUES (FALSE)';
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error creating anon user:', err.message);
      return res.status(500).json({ error: 'Failed to create anonymous user' });
    }

    const insertedId = result.insertId;
    return res.status(201).json({ userId: insertedId });
  });
});

app.post('/api/linkOrSwitchUser', (req, res) => {
  const { firebaseId, currentUserId } = req.body;

  if (!firebaseId) {
    return res.status(400).json({ error: 'Missing firebaseId' });
  }

  // 1. Check if the firebaseId already exists
  const checkSql = 'SELECT userId FROM levent_test.users WHERE firebaseId = ?';
  pool.query(checkSql, [firebaseId], (err, results) => {
    if (err) {
      console.error('Error checking firebaseId:', err.message);
      return res.status(500).json({ error: 'Failed to check firebaseId' });
    }

    if (results.length > 0) {
      // User already exists → switch to their userId
      return res.status(200).json({ userId: results[0].userId });
    }

    // 2. Link firebaseId to existing anonymous user (by internal userId)
    if (!currentUserId) {
      return res.status(400).json({ error: 'Missing current userId for linking' });
    }

    const updateSql = 'UPDATE movie_capstone_db.users SET firebaseId = ? WHERE userId = ?';
    pool.query(updateSql, [firebaseId, currentUserId], (err) => {
      if (err) {
        console.error('Error linking firebaseId:', err.message);
        return res.status(500).json({ error: 'Failed to link firebaseId' });
      }

      return res.status(200).json({ userId: currentUserId });
    });
  });
});




app.listen(port, () => console.log(`Listening on port ${port}`));
