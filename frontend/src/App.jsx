import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Niche } from './pages/Niche';
import { All } from './pages/All';
import { ScrapeCountdownToast } from './components/ScrapeCountdownToast';

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
        <ScrapeCountdownToast />
        <Analytics />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;

