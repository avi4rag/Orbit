import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { PlayerProvider } from './context/PlayerContext';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';

const UniverseView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>My Celestial Universe</h1>
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
            <Route index element={<LandingPage />} />
            <Route path="app" element={<UniverseView />} />
            <Route path="explore" element={<ExplorePage />} />
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
