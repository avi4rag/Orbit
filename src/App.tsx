import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { PlayerProvider } from './context/PlayerContext';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import RitualPage from './pages/RitualPage';
import ActionsPage from './pages/ActionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import SessionModesPage from './pages/SessionModesPage';

const UniverseView: React.FC = () => (
  <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem' }}>My Celestial Universe</h1>
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
            <Route path="session/:id" element={<SessionDetailPage />} />
            <Route path="modes" element={<SessionModesPage />} />
            <Route path="ritual" element={<RitualPage />} />
            <Route path="actions" element={<ActionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
