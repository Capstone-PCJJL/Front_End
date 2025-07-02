import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
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
      setError('Please select a CSV file to import.');
      return;
    }

    const userId = localStorage.getItem('userId');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        try {
          const response = await fetch('/api/importCsv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: results.data, userId }),
          });

          if (!response.ok) throw new Error('Failed to import CSV to server.');

          setImported(true);
          setTimeout(() => navigate('/Home'), 1000);
        } catch (err) {
          setError('Upload failed: ' + err.message);
        }
      },
      error: function (err) {
        setError('Parsing failed: ' + err.message);
      },
    });
  };

  return (
    <div className="container_s">
      <div className="form">
        <h1>Import Your Letterboxd CSV</h1>
        <p>*You are required to import your Letterboxd CSV before proceeding further.</p> 
        <form onSubmit={handleImport}>
          <div className="form-group">
            <input type="file" accept=".csv" onChange={handleFileChange} className="form-control" />
          </div>
          {error && <div className="error">{error}</div>}
          {imported && <div className="success">CSV imported! Redirecting...</div>}
          <button type="submit" className="btn" style={{ marginTop: 16 }}>
            Import CSV
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImportCsv;
