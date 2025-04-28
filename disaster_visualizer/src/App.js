import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisasterMap from './DisasterMap';
import CountryProfile from './CountryProfile';
import CountryComparison from './CountryComparison';
import AuthForm from './Auth';
import PrivateRoute from './PrivateRoute';
import StateProfile from './StateProfile';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute><DisasterMap /></PrivateRoute>} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/country/:countryName" element={<PrivateRoute><CountryProfile /></PrivateRoute>} />
        <Route path="/state/:stateName" element={<PrivateRoute><StateProfile /></PrivateRoute>} />
        <Route path="/compare" element={<PrivateRoute><CountryComparison /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;