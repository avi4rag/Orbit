import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Orbit,
  Compass,
  Sparkles,
  SunMoon,
  CheckCircle2,
  Headphones,
  Wand2,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Settings,
  Compass as GuideIcon,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileControlRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileControlRef.current &&
        !profileControlRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Navigation items based on authentication state
  // Unauthenticated: ONLY expose Philosophy / Overview
  // Authenticated: Primary navigation (Overview, Subliminals, 5 Modes, AI Architect, Daily Ritual, Aligned Actions)
  // Note: 'My Universe' is an account-level personal space and lives exclusively inside the Profile dropdown.
  const navLinks = isAuthenticated
    ? [
        { path: '/', label: 'Overview', icon: Compass },
        { path: '/subliminals', label: 'Subliminals', icon: Headphones },
        { path: '/modes', label: '5 Modes', icon: Sparkles },
        { path: '/generator', label: 'AI Architect', icon: Wand2 },
        { path: '/ritual', label: 'Daily Ritual', icon: SunMoon },
        { path: '/actions', label: 'Aligned Actions', icon: CheckCircle2 },
      ]
    : [{ path: '/', label: 'Philosophy / Overview', icon: Compass }];

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';
  const streakCount = user?.streak?.current ?? 0;

  return (
    <header className="orbit-navbar" role="banner">
      <div className="orbit-navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="orbit-brand" aria-label="ORBIT — Live From Reality">
          <div className="orbit-brand-icon">
            <Orbit size={20} color="#ffffff" />
          </div>
          <div>
            <span className="orbit-brand-title">ORBIT</span>
            <span className="orbit-brand-subtitle">Live From Reality</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary Navigation">
          <ul className="orbit-nav-links">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path} className="orbit-nav-item">
                  <Link
                    to={item.path}
                    className={`orbit-nav-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right-Side Actions (Auth state aware) */}
        <div className="orbit-nav-actions">
          {isAuthenticated && user ? (
            /* Premium Profile & Account Dropdown */
            <div className="orbit-profile-control" ref={profileControlRef}>
              <button
                type="button"
                className="orbit-profile-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label={`User account menu for ${user.name}`}
              >
                <div className="orbit-profile-avatar">{userInitial}</div>
                <span className="orbit-profile-name">{firstName}</span>
                {streakCount > 0 && (
                  <span className="orbit-profile-streak" title={`${streakCount} day alignment streak`}>
                    ⚡ {streakCount}d
                  </span>
                )}
                <span className="orbit-profile-chevron">
                  <ChevronDown size={14} />
                </span>
              </button>

              {/* Account Dropdown */}
              {dropdownOpen && (
                <div className="orbit-profile-dropdown" role="menu" aria-label="Account Menu">
                  <div className="orbit-dropdown-header">
                    <div className="orbit-dropdown-user-info">
                      <div className="orbit-dropdown-avatar-lg">{userInitial}</div>
                      <div className="orbit-dropdown-user-details">
                        <div className="orbit-dropdown-name">{user.name}</div>
                        <div className="orbit-dropdown-email">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <ul className="orbit-dropdown-menu">
                    <li>
                      <Link
                        to="/app"
                        className="orbit-dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Orbit size={16} />
                        <span>My Universe</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/profile"
                        className="orbit-dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Profile & Preferences</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/onboarding"
                        className="orbit-dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <GuideIcon size={16} />
                        <span>Alignment Onboarding</span>
                      </Link>
                    </li>

                    <li className="orbit-dropdown-divider" role="separator" />

                    <li>
                      <button
                        type="button"
                        className="orbit-dropdown-item danger"
                        role="menuitem"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out Actions: Sign In & Get Started / Sign Up */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                className="orbit-btn-ghost"
                onClick={() => openAuthModal('login')}
              >
                <UserIcon size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className="orbit-btn-primary"
                onClick={() => openAuthModal('register')}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="orbit-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="orbit-mobile-drawer" role="dialog" aria-label="Mobile Navigation">
          <div className="orbit-mobile-drawer-inner">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`orbit-mobile-drawer-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="orbit-mobile-drawer-actions">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/profile"
                    className="orbit-mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Profile & Preferences ({user.name})</span>
                  </Link>
                  <button
                    type="button"
                    className="orbit-btn-ghost"
                    style={{ justifyContent: 'center', color: '#fda4af' }}
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="orbit-btn-ghost"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                  >
                    <UserIcon size={15} />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className="orbit-btn-primary"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                  >
                    <span>Get Started / Sign Up</span>
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
