import mysql from 'mysql';
import config from './config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import response from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  app.listen(port, () => console.log(`Listening on port ${port}`));