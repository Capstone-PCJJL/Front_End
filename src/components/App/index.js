import React, { useEffect, useState } from 'react'; // add useState here
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from '../Home';
import Watchlist from '../Watchlist';
import Login from '../Login';
import Signup from '../Signup';
import Profile from '../Profile';
import Project from '../Project';
import Consent from '../Consent';
import VerifyEmail from '../VerifyEmail';

const App = () => {

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Watchlist" element={<Watchlist />} />
        <Route path="/Home" element={<Home/>} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/project" element={<Project />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/project" replace />} />
        <Route path="*" element={<Navigate to="/project" replace />} />

        {/* <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} /> */}

      </Routes>
    </Router>
  );
};

export default App;

