import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Clock,
  Heart,
  Radio,
  Layers,
  Flame,
  Sun,
  Moon,
  Zap,
  Repeat,
  Compass,
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../../types/subliminal';
import type { UsageType } from '../../types/subliminal';
import './SubliminalDrawer.css';

interface SubliminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string;
  activeUsage?: string;
  onSelectCategory?: (slug: string) => void;
  onSelectUsage?: (usage: UsageType | 'All') => void;
  onSelectDiscover?: (tab: 'made-for-you' | 'recent' | 'favorites' | 'all') => void;
}

const USAGE_ITEMS: { type: UsageType; label: string; icon: React.ReactNode }[] = [
  { type: 'ONE TIME', label: 'One Time (Reset)', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
  { type: 'MORNING', label: 'Morning', icon: <Sun className="w-3.5 h-3.5 text-yellow-400" /> },
  { type: 'DAYTIME', label: 'Daytime', icon: <Radio className="w-3.5 h-3.5 text-emerald-400" /> },
  { type: 'NIGHT', label: 'Night', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
  { type: 'SLEEP', label: 'Sleep / Overnight', icon: <Moon className="w-3.5 h-3.5 text-purple-400" /> },
  { type: 'FOCUS', label: 'Focus & Deep Work', icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
  { type: 'REPEAT', label: 'Continuous Loop', icon: <Repeat className="w-3.5 h-3.5 text-pink-400" /> },
];

export const SubliminalDrawer: React.FC<SubliminalDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory = 'all',
  activeUsage = 'All',
  onSelectCategory,
  onSelectUsage,
  onSelectDiscover,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else {
      navigate(`/subliminals/category/${slug}`);
    }
    onClose();
  };

  const handleUsageClick = (type: UsageType | 'All') => {
    if (onSelectUsage) {
      onSelectUsage(type);
    } else {
      navigate('/subliminals');
    }
    onClose();
  };

  const handleDiscoverClick = (tab: 'made-for-you' | 'recent' | 'favorites' | 'all') => {
    if (onSelectDiscover) {
      onSelectDiscover(tab);
    } else {
      navigate('/subliminals');
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`orbit-drawer-backdrop ${isOpen ? 'orbit-drawer-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <aside
        ref={drawerRef}
        className={`orbit-drawer ${isOpen ? 'orbit-drawer--open' : ''}`}
        aria-label="Subliminal Reality Library Menu"
      >
        {/* Drawer Header */}
        <div className="orbit-drawer__header">
          <div className="orbit-drawer__brand">
            <span className="orbit-drawer__brand-pulse" />
            <h2 className="orbit-drawer__title">REALITY LIBRARY</h2>
          </div>
          <button
            type="button"
            className="orbit-drawer__close-btn"
            onClick={onClose}
            aria-label="Close library menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="orbit-drawer__body">
          {/* SECTION: DISCOVER */}
          <div className="orbit-drawer__section">
            <span className="orbit-drawer__section-label">DISCOVER</span>
            <ul className="orbit-drawer__list">
              <li>
                <button
                  type="button"
                  className="orbit-drawer__item"
                  onClick={() => handleDiscoverClick('made-for-you')}
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Made For You</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="orbit-drawer__item"
                  onClick={() => handleDiscoverClick('recent')}
                >
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Recently Played</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="orbit-drawer__item"
                  onClick={() => handleDiscoverClick('favorites')}
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Favorites</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="orbit-drawer__divider" />

          {/* SECTION: BY INTENTION (17 Categories) */}
          <div className="orbit-drawer__section">
            <div className="flex items-center justify-between pr-2">
              <span className="orbit-drawer__section-label">BY INTENTION</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                17 Spheres
              </span>
            </div>
            <ul className="orbit-drawer__list">
              {Object.values(CATEGORY_DEFINITIONS).map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <li key={cat.slug}>
                    <button
                      type="button"
                      className={`orbit-drawer__item ${
                        isActive ? 'orbit-drawer__item--active' : ''
                      }`}
                      onClick={() => handleCategoryClick(cat.slug)}
                    >
                      <span
                        className="orbit-drawer__cat-dot"
                        style={{
                          backgroundColor: cat.accentColor,
                          boxShadow: isActive ? `0 0 10px ${cat.accentColor}` : 'none',
                        }}
                      />
                      <span className="orbit-drawer__item-text">{cat.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="orbit-drawer__divider" />

          {/* SECTION: BY USAGE SITUATION */}
          <div className="orbit-drawer__section">
            <span className="orbit-drawer__section-label">BY USAGE / SITUATION</span>
            <ul className="orbit-drawer__list">
              {USAGE_ITEMS.map((item) => {
                const isActive = activeUsage === item.type;
                return (
                  <li key={item.type}>
                    <button
                      type="button"
                      className={`orbit-drawer__item ${
                        isActive ? 'orbit-drawer__item--active' : ''
                      }`}
                      onClick={() => handleUsageClick(item.type)}
                    >
                      {item.icon}
                      <span className="orbit-drawer__item-text">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="orbit-drawer__divider" />

          {/* SECTION: LIBRARY */}
          <div className="orbit-drawer__section">
            <span className="orbit-drawer__section-label">LIBRARY</span>
            <ul className="orbit-drawer__list">
              <li>
                <button
                  type="button"
                  className={`orbit-drawer__item ${
                    activeCategory === 'all' && activeUsage === 'All'
                      ? 'orbit-drawer__item--active'
                      : ''
                  }`}
                  onClick={() => handleDiscoverClick('all')}
                >
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>All Subliminals</span>
                </button>
              </li>
              <li>
                <Link
                  to="/subliminals"
                  className="orbit-drawer__item"
                  onClick={onClose}
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Overview & Matrix</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="orbit-drawer__footer">
          <p className="text-xs text-slate-500">
            ORBIT Reality Tuning Engine v2.4
          </p>
        </div>
      </aside>
    </>
  );
};

export default SubliminalDrawer;
