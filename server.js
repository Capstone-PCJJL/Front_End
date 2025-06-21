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

app.get('/api/getMovies', (req, res) => {
  const connection = mysql.createConnection(config);

  const sql = 'SELECT * FROM movie_capstone_db.movies LIMIT 20;';
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

app.listen(port, () => console.log(`Listening on port ${port}`));
