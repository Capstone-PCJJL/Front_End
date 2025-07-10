import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { unzip } from 'unzipit';
import './ImportCsv.css';

const ImportCsv = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [imported, setImported] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a ZIP file to import.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in.');
      return;
    }

    try {
      // Unzip the file
      const { entries } = await unzip(file);
      // Find ratings.csv in the root
      const ratingsEntry = Object.values(entries).find(entry => entry.name.toLowerCase() === 'ratings.csv');
      // Find likes/films.csv (case-insensitive for folder and file)
      const filmsEntry = Object.values(entries).find(entry => {
        const name = entry.name.toLowerCase();
        return name.startsWith('likes/') && name.endsWith('films.csv');
      });

      if (!ratingsEntry || !filmsEntry) {
        setError('Could not find both "ratings.csv" in the root and "likes/films.csv" in the zip.');
        return;
      }

      // Read and parse both CSVs
      const [ratingsCsv, filmsCsv] = await Promise.all([
        ratingsEntry.text(),
        filmsEntry.text()
      ]);

      const ratingsData = Papa.parse(ratingsCsv, { header: true, skipEmptyLines: true }).data;
      const likesData = Papa.parse(filmsCsv, { header: true, skipEmptyLines: true }).data;

      // Send both to backend
      const [likesRes, ratingsRes] = await Promise.all([
        fetch('/api/importCsv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: likesData, userId, table: 'likes' }),
        }),
        fetch('/api/importCsv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: ratingsData, userId, table: 'ratings' }),
        })
      ]);

      if (!likesRes.ok || !ratingsRes.ok) {
        throw new Error('Failed to import one or both CSVs to server.');
      }

      setImported(true);
      setTimeout(() => navigate('/Home'), 1000);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="container_s">
      <div className="form">
        <h1>Import Your Letterboxd ZIP</h1>
        <p>*You are required to import your Letterboxd ZIP (containing ratings.csv and likes/films.csv) before proceeding further.</p> 
        <form onSubmit={handleImport}>
          <div className="form-group">
            <input type="file" accept=".zip" onChange={handleFileChange} className="form-control" />
          </div>
          {error && <div className="error">{error}</div>}
          {imported && <div className="success">ZIP imported! Redirecting...</div>}
          <button type="submit" className="btn" style={{ marginTop: 16 }}>
            Import ZIP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImportCsv;
