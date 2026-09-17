import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Orbit, Compass, Sparkles, SunMoon, CheckCircle2, Headphones, User as UserIcon, LogOut } from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await api.login(email, password);
        setUser(res.user);
      } else {
        const res = await api.register(name, email, password);
        setUser(res.user);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.guestDemo();
      setUser(res.user);
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const navLinks = [
    { path: '/', label: 'Philosophy', icon: Compass },
    { path: '/app', label: 'My Universe', icon: Orbit },
    { path: '/explore', label: 'Soundscapes', icon: Headphones },
    { path: '/modes', label: '5 Modes', icon: Sparkles },
    { path: '/ritual', label: 'Daily Ritual', icon: SunMoon },
    { path: '/actions', label: 'Aligned Actions', icon: CheckCircle2 },
  ];

  return (
    <>
      <header className="navbar-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(6, 7, 19, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.85rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'inherit',
          }} aria-label="Orbit Home">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
            }}>
              <Orbit size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ORBIT
              </span>
              <span style={{
                display: 'block',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--celestial-cyan)',
                fontWeight: 600,
                lineHeight: 1,
              }}>
                Live From Reality
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav aria-label="Main Navigation" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} color={isActive ? 'var(--celestial-cyan)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth Profile CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/app"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--celestial-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  {user.streak?.current > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--celestial-gold)',
                      fontWeight: 700,
                    }}>
                      ⚡ {user.streak.current}d
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleDemoSignIn}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                >
                  <Sparkles size={14} color="var(--celestial-gold)" />
                  <span>Explore Demo</span>
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <UserIcon size={14} />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="cosmic-glass-elevated" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {isLogin ? 'Welcome Back' : 'Begin Your Orbit'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {isLogin
                ? 'Resume your celestial visualization practice and aligned actions.'
                : 'Create your universe to start tracking goals as evolving celestial planets.'}
            </p>

            {error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Cosmic Explorer"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@orbit.cosmos"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Entering Orbit...' : isLogin ? 'Sign In' : 'Create Universe'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--celestial-cyan)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
              }}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
