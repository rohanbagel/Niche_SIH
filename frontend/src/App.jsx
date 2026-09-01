import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Niche } from './pages/Niche';
import { All } from './pages/All';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/niche" element={<Niche />} />
          <Route path="/all" element={<All />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
