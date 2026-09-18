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
import CelestialUniversePage from './pages/CelestialUniversePage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="app" element={<CelestialUniversePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="session/:id" element={<SessionDetailPage />} />
            <Route path="modes" element={<SessionModesPage />} />
            <Route path="ritual" element={<RitualPage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="generator" element={<AIGeneratorPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
