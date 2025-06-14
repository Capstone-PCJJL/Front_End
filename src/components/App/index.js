import { useEffect } from 'react';
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from '../Landing';
import YourList from '../YourList';
import Recommendation from '../Recommendation';
import Login from '../Login';
import Signup from '../Signup';
import Profile from '../Profile';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Protected routes - require authentication */}
          <Route path="/Recommendation" element={<Recommendation />} />
          <Route path="/YourList" element={<YourList />} />
          <Route path="/Home" element={<Landing />} />
          <Route path="/Profile" element={<Profile />} />
          {/* Default route - redirect to login (users can choose signup or login) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch all other routes and redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
