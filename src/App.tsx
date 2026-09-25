import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import RitualPage from './pages/RitualPage';
import ActionsPage from './pages/ActionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import SessionModesPage from './pages/SessionModesPage';
import CelestialUniversePage from './pages/CelestialUniversePage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* Public route */}
              <Route index element={<LandingPage />} />

              {/* Onboarding flow for newly authenticated users */}
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute allowUnonboarded>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated routes guarded by ProtectedRoute */}
              <Route
                path="app"
                element={
                  <ProtectedRoute>
                    <CelestialUniversePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="explore"
                element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="session/:id"
                element={
                  <ProtectedRoute>
                    <SessionDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="modes"
                element={
                  <ProtectedRoute>
                    <SessionModesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="ritual"
                element={
                  <ProtectedRoute>
                    <RitualPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="actions"
                element={
                  <ProtectedRoute>
                    <ActionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="generator"
                element={
                  <ProtectedRoute>
                    <AIGeneratorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

