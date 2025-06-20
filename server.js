const mysql = require('mysql');
const config = require('./config.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5500;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));

app.post('/api/getMovies', (req, res) => {
  const connection = mysql.createConnection(config);

  const sql = 'SELECT * FROM movie_capstone_db.movies_raw LIMIT 20;';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error.message);
      res.status(500).send('Error fetching movies');
      return;
    }
    res.json(results);
  });

  connection.end();
});

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

    const insertUserSql = 'INSERT INTO users (userId) VALUES (?)';
    connection.query(insertUserSql, [userId], (error) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // User already exists, which is fine.
          connection.end();
          return res.status(200).send('User already exists');
        }
        console.error('Error inserting user:', error.message);
        connection.end();
        return res.status(500).send('Error creating user');
      }

      res.status(201).send('User created successfully');
      connection.end();
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
