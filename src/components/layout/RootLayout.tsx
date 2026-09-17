import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Orbit, ShieldCheck } from 'lucide-react';
import MiniPlayer from '../player/MiniPlayer';
import FullscreenPlayer from '../player/FullscreenPlayer';

export const RootLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Navigation */}
      <Navbar />

      {/* Persistent Audio Player — survives route transitions */}
      <MiniPlayer />
      <FullscreenPlayer />

      {/* Main Content View Outlet */}
      <main id="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Global Footer & Standing Legal Disclaimer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(6, 7, 19, 0.95)',
        padding: '3rem 1.5rem 6rem 1.5rem', // extra bottom padding for floating mini player
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Standing Disclaimer Block (§1 & §2.9) */}
          <div className="cosmic-glass" style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '2.5rem',
            borderColor: 'rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              color: 'var(--celestial-cyan)',
              flexShrink: 0,
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#ffffff',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Standing Framework & Scientific Integrity Disclaimer
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This experience is designed for visualization, affirmations, reflection, and personal motivation.
                Manifestation and the Law of Attraction are belief-based philosophical frameworks and are not guarantees
                that external events will occur simply because you think about them. Science does not establish that thought
                alone causes external events. Use these practices alongside realistic planning and consistent, disciplined action.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Orbit size={20} color="var(--celestial-cyan)" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                  ORBIT
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Think about your desire from the perspective that it is already part of your life, rather than constantly thinking about getting it in the future.
              </p>
              <div style={{
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: 'var(--celestial-gold)',
                fontWeight: 600,
              }}>
                INTENTION + BELIEF + CONSISTENT ACTION + PATIENCE + REFLECTION
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '0.75rem' }}>
                Platform Pillars
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Philosophy & Science</Link></li>
                <li><Link to="/app" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Celestial Universe Simulation</Link></li>
                <li><Link to="/explore" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Solfeggio & Binaural Soundscapes</Link></li>
                <li><Link to="/modes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>5 Session Modes</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '0.75rem' }}>
                Daily Retention Loops
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li><Link to="/ritual" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Morning Identity Launch</Link></li>
                <li><Link to="/ritual" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Evening Gratitude & Reflection</Link></li>
                <li><Link to="/actions" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Controllable Aligned Actions</Link></li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}>
            <span>© 2026 Orbit. Dream + Action. Not Dream instead of Action.</span>
            <span>WCAG AA Accessible • Zero Ads • Ethical AI Proxy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
