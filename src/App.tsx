import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { PlayerProvider } from './context/PlayerContext';

// Placeholder views before full component assembly
const LandingView: React.FC = () => (
  <div style={{ padding: '4rem 1.5rem', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="gradient-text-cosmic">
      Live From The Reality You Want
    </h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
      Instead of constantly thinking about what you don't have, Orbit helps you visualize your desired life as though you are already living it.
    </p>
  </div>
);

const UniverseView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>My Celestial Universe</h1>
  </div>
);

const ExploreView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>Explore Soundscapes & Visualizations</h1>
  </div>
);

const SessionDetailView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>Session Detail</h1>
  </div>
);

const ModesView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>5 Session Modes</h1>
  </div>
);

const RitualView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>Daily Retention Ritual</h1>
  </div>
);

const ActionsView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>Aligned Action Board</h1>
  </div>
);

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingView />} />
            <Route path="app" element={<UniverseView />} />
            <Route path="explore" element={<ExploreView />} />
            <Route path="session/:id" element={<SessionDetailView />} />
            <Route path="modes" element={<ModesView />} />
            <Route path="ritual" element={<RitualView />} />
            <Route path="actions" element={<ActionsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
