import { useEffect } from 'react';
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from '../Landing';
import YourList from '../YourList';
import Recommendation from '../Recommendation';
import Login from '../Login';
import Signup from '../Signup';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/Recommendation" element={<Recommendation />} />
          <Route path="/Your List" element={<YourList />} />
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
