import React, { useState, useEffect } from 'react';
import { Orbit, Sparkles, X, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    authModalMode,
    closeAuthModal,
    login,
    register,
    demoSignIn,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(authModalMode);
    setError('');
  }, [authModalMode, showAuthModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal, closeAuthModal]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    try {
      await demoSignIn();
    } catch (err: any) {
      setError(err?.message || 'Demo access failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 4, 12, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1.25rem',
        animation: 'authFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="cosmic-glass-elevated"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.25rem',
          position: 'relative',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          background: 'radial-gradient(ellipse at top, rgba(30, 27, 75, 0.7) 0%, rgba(10, 11, 26, 0.95) 100%)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
          }}>
            <Orbit size={18} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
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
            }}>
              Live From Reality
            </span>
          </div>
        </div>

        <h2 id="auth-modal-title" style={{
          fontSize: '1.45rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '0.35rem',
          letterSpacing: '-0.02em',
        }}>
          {mode === 'login' ? 'Welcome Back' : 'Begin Your Orbit'}
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
        }}>
          {mode === 'login'
            ? 'Access your celestial universe, soundscapes, daily rituals, and aligned actions.'
            : 'Step into your future reality today. Align intention, visualization, and disciplined daily action.'}
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('network') && (
              <div style={{ fontSize: '0.75rem', color: '#fecdd3' }}>
                Tip: Click <strong>Instant Demo Access</strong> below to explore offline.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cosmic Explorer"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem 0.7rem 2.4rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@orbit.com"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('traveler@orbit.com');
                    setPassword('123456');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--celestial-cyan)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Use Demo Credentials
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>{loading ? 'Aligning...' : mode === 'login' ? 'Sign In to ORBIT' : 'Create My Universe'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast-Track Button */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={15} color="var(--celestial-gold)" />
            <span>Instant Demo Access (No Password)</span>
          </button>
        </div>

        {/* Toggle Login/Register */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--celestial-cyan)',
              fontSize: '0.825rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Privacy & Ethical Guarantee Notice */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.725rem',
        }}>
          <ShieldCheck size={13} color="var(--celestial-purple)" />
          <span>Zero spam • 100% private celestial workspace</span>
        </div>
      </div>
    </div>
  );
};
