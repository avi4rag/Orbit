import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { SubliminalSession } from '../../types/subliminal';
import { SubliminalCard } from './SubliminalCard';
import './SubliminalRail.css';

interface SubliminalRailProps {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  sessions: SubliminalSession[];
  onPlay?: (session: SubliminalSession) => void;
  accentColor?: string;
}

export const SubliminalRail: React.FC<SubliminalRailProps> = ({
  title,
  subtitle,
  categorySlug,
  sessions,
  onPlay,
  accentColor,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!sessions || sessions.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -480 : 480;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="orbit-subliminal-rail">
      <div className="orbit-subliminal-rail__header">
        <div className="orbit-subliminal-rail__titles">
          <div className="orbit-subliminal-rail__title-row">
            {accentColor && (
              <span
                className="orbit-subliminal-rail__accent-dot"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
              />
            )}
            <h2 className="orbit-subliminal-rail__title">{title}</h2>
            <span className="orbit-subliminal-rail__count">{sessions.length} sessions</span>
          </div>
          {subtitle && <p className="orbit-subliminal-rail__subtitle">{subtitle}</p>}
        </div>

        <div className="orbit-subliminal-rail__actions">
          {categorySlug && (
            <Link
              to={`/subliminals/category/${categorySlug}`}
              className="orbit-subliminal-rail__view-all"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <div className="orbit-subliminal-rail__arrows">
            <button
              type="button"
              className="orbit-subliminal-rail__arrow-btn"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="orbit-subliminal-rail__arrow-btn"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="orbit-subliminal-rail__track-wrapper">
        <div className="orbit-subliminal-rail__track" ref={scrollContainerRef}>
          {sessions.map((session) => (
            <div key={session.id} className="orbit-subliminal-rail__item">
              <SubliminalCard session={session} onPlay={onPlay} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
