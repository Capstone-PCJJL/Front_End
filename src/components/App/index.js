import { useEffect } from 'react';
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from '../Landing';
import YourList  from '../YourList';
import Recommendation from '../Recommendation';
import Login from '../Login';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/Recommendation" element={<Recommendation />} />
          <Route path="/Your List" element={<YourList />} />
          <Route path="/Home" element={<Landing />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
