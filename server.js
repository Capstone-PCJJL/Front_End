const mysql = require('mysql');
const config = require('./config.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

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

  // Change patrick_test when updated
  const sql = `
    SELECT * FROM movie_capstone_db.movies
    WHERE id NOT IN (
      SELECT movie_id FROM movie_capstone_db.not_interested WHERE user_id = ?
      UNION
      SELECT movie_id FROM movie_capstone_db.watchlists WHERE user_id = ?
      UNION
      SELECT movie_id FROM patrick_test.ratings WHERE user_id = ?
    )
    LIMIT 20;
  `;

  pool.query(sql, [userId, userId, userId], (error, results) => {
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
  // console.log(`Received request for genres with movieId: ${movieId}`);

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

// API PUT that assigns ratings
app.post('/api/addToRatings', (req, res) => {
  const { userId, movieId, rating } = req.body;
  if (!userId || !movieId || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get the movie's name and year for this movieId
  pool.query('SELECT title, release_date FROM movies WHERE id = ?', [movieId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Movie not found' });
    }
    const name = results[0].title;
    const year = results[0].release_date ? new Date(results[0].release_date).getFullYear() : null;

    // Insert into ratings table
    pool.query(
      'INSERT INTO ratings (userId, name, year, rating, movie_id, watched_date, letterboxd_uri) VALUES (?, ?, ?, ?, ?, NULL, NULL)',
      [userId, name, year, rating, movieId],
      (err2, result) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to insert rating' });
        }
        res.status(200).json({ success: true, id: result.insertId });
      }
    );
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


// Fuzzy match ratings for a user after import
async function fuzzyMatchRatingsForUser(userId, pool) {
  const query = (sql, params) => new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  const ratings = await query('SELECT id, name, year FROM ratings WHERE userId = ? AND movie_id IS NULL', [userId]);
  const movies = (await query('SELECT id, title, release_date FROM movies')).map(m => ({
    ...m,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null
  }));

  for (const rating of ratings) {
    const moviesForYear = movies.filter(m => m.year === rating.year);
    if (moviesForYear.length === 0) continue;
    const titles = moviesForYear.map(m => m.title);
    const { bestMatch } = stringSimilarity.findBestMatch(rating.name, titles);
    // Find the movie object for the best match (within the year)
    const matchedMovie = moviesForYear.find(m => m.title === bestMatch.target);
    if (bestMatch.rating > 0.7 && matchedMovie) {
      await query('UPDATE ratings SET movie_id = ? WHERE id = ?', [matchedMovie.id, rating.id]);
      console.log(`Matched: '${rating.name}' (${rating.year}) -> '${matchedMovie.title}' (id=${matchedMovie.id})`);
    } else {
      console.log(`No good match for: '${rating.name}' (${rating.year})`);
    }
  }
}

// Fuzzy match likes for a user after import
async function fuzzyMatchLikesForUser(userId, pool) {
  const query = (sql, params) => new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  const likes = await query('SELECT id, name, year FROM likes WHERE userId = ? AND movie_id IS NULL', [userId]);
  const movies = (await query('SELECT id, title, release_date FROM movies')).map(m => ({
    ...m,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null
  }));

  for (const like of likes) {
    const moviesForYear = movies.filter(m => m.year === like.year);
    if (moviesForYear.length === 0) continue;
    const titles = moviesForYear.map(m => m.title);
    const { bestMatch } = stringSimilarity.findBestMatch(like.name, titles);
    // Find the movie object for the best match (within the year)
    const matchedMovie = moviesForYear.find(m => m.title === bestMatch.target);
    if (bestMatch.rating > 0.7 && matchedMovie) {
      await query('UPDATE likes SET movie_id = ? WHERE id = ?', [matchedMovie.id, like.id]);
      console.log(`Matched Like: '${like.name}' (${like.year}) -> '${matchedMovie.title}' (id=${matchedMovie.id})`);
    } else {
      console.log(`No good match for Like: '${like.name}' (${like.year})`);
    }
  }
}

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
    pool.query(insertSql, [values], async (error, results) => {
      if (error) {
        console.error('❌ MySQL insert error:', error.message);
        return res.status(500).json({ error: 'Failed to insert CSV data' });
      }
      // Fuzzy match after successful import
      try {
        await fuzzyMatchRatingsForUser(userId, pool);
      } catch (err) {
        console.error('Fuzzy match error:', err);
      }
      res.status(200).json({ message: `${table} CSV imported successfully`, inserted: results.affectedRows });
    });
    return;
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

  pool.query(insertSql, [values], async (error, results) => {
    if (error) {
      console.error('❌ MySQL insert error:', error.message);
      return res.status(500).json({ error: 'Failed to insert CSV data' });
    }
    // Fuzzy match after successful import
    try {
      await fuzzyMatchLikesForUser(userId, pool);
    } catch (err) {
      console.error('Fuzzy match error (likes):', err);
    }
    res.status(200).json({ message: `${table} CSV imported successfully`, inserted: results.affectedRows });
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

  const sql = 'UPDATE movie_capstone_db.users SET consented = TRUE WHERE userId = ?';

  pool.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error updating consent:', err.message);
      return res.status(500).json({ error: 'Failed to update consent' });
    }

    res.status(200).json({ success: true });
  });
});

app.get('/api/getUserConsent', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const sql = 'SELECT consented FROM movie_capstone_db.users WHERE userId = ?';
  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking consent:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ consented: results[0].consented === 1 });
  });
});

app.post('/api/getOrCreateUser', (req, res) => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    return res.status(400).json({ error: 'Missing firebaseId' });
  }

  const selectSql = 'SELECT userId FROM movie_capstone_db.users WHERE firebaseId = ?';
  pool.query(selectSql, [firebaseId], (err, results) => {
    if (err) {
      console.error('Error querying user:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }

    if (results.length > 0) {
      // Existing user
      return res.status(200).json({ userId: results[0].userId });
    }

    // Insert new user
    const insertSql = 'INSERT INTO movie_capstone_db.users (firebaseId, consented) VALUES (?, FALSE)';
    pool.query(insertSql, [firebaseId], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err.message);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.status(201).json({ userId: result.insertId });
    });
  });
});

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const sql = 'SELECT imported FROM movie_capstone_db.users WHERE userId = ?';
  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking consent:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ consented: results[0].consented === 1 });
  });

  app.get('/api/getUserImport', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const sql = 'SELECT imported FROM movie_capstone_db.users WHERE userId = ?';
  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking consent:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ consented: results[0].consented === 1 });
  });
});


app.post('/api/setImport', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const sql = 'UPDATE movie_capstone_db.users SET imported = TRUE WHERE userId = ?';

  pool.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error updating consent:', err.message);
      return res.status(500).json({ error: 'Failed to update consent' });
    }

    res.status(200).json({ success: true });
  });
});

app.post('/api/likeMovie', (req, res) => {
  const { userId, movieId } = req.body;
  if (!userId || !movieId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get the movie's name and year for this movieId
  pool.query('SELECT title, release_date FROM movies WHERE id = ?', [movieId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Movie not found' });
    }
    const name = results[0].title;
    const year = results[0].release_date ? new Date(results[0].release_date).getFullYear() : null;

    // Insert into likes table
    pool.query(
      'INSERT INTO likes (userId, date, name, year, letterboxd_uri, movie_id) VALUES (?, NULL, ?, ?, NULL, ?)',
      [userId, name, year, movieId],
      (err2, result) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to insert like' });
        }
        res.status(200).json({ success: true, id: result.insertId });
      }
    );
  });
});


app.listen(port, () => console.log(`Listening on port ${port}`));