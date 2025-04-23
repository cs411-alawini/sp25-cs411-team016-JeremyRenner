import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisasterMap from './DisasterMap';
import CountryProfile from './CountryProfile';
import CountryComparison from './CountryComparison';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DisasterMap />} />
        <Route path="/country/:countryName" element={<CountryProfile />} />
        <Route path="/compare" element={<CountryComparison/>} />
      </Routes>
    </Router>
  );
}

export default App;