import { useEffect } from 'react';
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from '../Landing';
import YourList  from '../YourList';
import Recommendation from '../Recommendation';
import Profile from '../Profile';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/Recommendation" element={<Recommendation />} />
          <Route path="/YourList" element={<YourList />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/" element={<Landing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
