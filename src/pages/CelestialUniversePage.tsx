import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import './CelestialUniversePage.css';

// ── Types ──────────────────────────────────────────────────────────
export type PillarCategory = 'all' | 'wealth' | 'health' | 'love' | 'focus' | 'peace';

export interface IntentionStar {
  id: string;
  title: string;
  category: 'wealth' | 'health' | 'love' | 'focus' | 'peace';
  categoryLabel: string;
  color: string;
  x: number; // percentage 5 - 95
  y: number; // percentage 10 - 90
  magnitude: number; // 1 to 5 (size/brightness)
  affirmation: string;
  completedActions: number;
  totalActions: number;
  streakDays: number;
  recommendedFreq: number; // e.g. 528
  connectedTo: string[]; // ids of connected stars
}

// ── Initial Seed Stars Constellations ──────────────────────────────
const INITIAL_STARS: IntentionStar[] = [
  {
    id: 'star-1',
    title: 'Design Studio Launch & 7-Figure Revenue',
    category: 'wealth',
    categoryLabel: 'Wealth & Success',
    color: '#f59e0b',
    x: 22,
    y: 35,
    magnitude: 5,
    affirmation: 'My creative enterprise generates extraordinary prosperity and deep fulfillment.',
    completedActions: 8,
    totalActions: 10,
    streakDays: 14,
    recommendedFreq: 528,
    connectedTo: ['star-2', 'star-4']
  },
  {
    id: 'star-2',
    title: 'Financial Independence & Asset Freedom',
    category: 'wealth',
    categoryLabel: 'Wealth & Success',
    color: '#fbbf24',
    x: 35,
    y: 20,
    magnitude: 4,
    affirmation: 'I am a wise, magnetic steward of overflowing wealth and freedom.',
    completedActions: 5,
    totalActions: 8,
    streakDays: 9,
    recommendedFreq: 528,
    connectedTo: ['star-1', 'star-5']
  },
  {
    id: 'star-3',
    title: 'Peak Cellular Vitality & Lean Strength',
    category: 'health',
    categoryLabel: 'Health & Vitality',
    color: '#10b981',
    x: 65,
    y: 30,
    magnitude: 4,
    affirmation: 'Every breath fills my physical vessel with radiant health and endless vigor.',
    completedActions: 12,
    totalActions: 15,
    streakDays: 21,
    recommendedFreq: 432,
    connectedTo: ['star-6']
  },
  {
    id: 'star-4',
    title: 'Unbreakable Deep Work & Daily Flow',
    category: 'focus',
    categoryLabel: 'Purpose & Focus',
    color: '#06b6d4',
    x: 28,
    y: 65,
    magnitude: 4,
    affirmation: 'I execute needle-moving priorities with calm precision and unstoppable focus.',
    completedActions: 9,
    totalActions: 12,
    streakDays: 11,
    recommendedFreq: 396,
    connectedTo: ['star-1', 'star-5']
  },
  {
    id: 'star-5',
    title: 'Profound Emotional Sovereignty & Calm',
    category: 'peace',
    categoryLabel: 'Inner Peace',
    color: '#8b5cf6',
    x: 48,
    y: 50,
    magnitude: 5,
    affirmation: 'I am the quiet space behind all thoughts; unshaken and whole.',
    completedActions: 14,
    totalActions: 14,
    streakDays: 28,
    recommendedFreq: 174,
    connectedTo: ['star-2', 'star-4', 'star-6']
  },
  {
    id: 'star-6',
    title: 'Soul-Aligned Romantic Union & Deep Trust',
    category: 'love',
    categoryLabel: 'Love & Magnetism',
    color: '#ec4899',
    x: 75,
    y: 60,
    magnitude: 3,
    affirmation: 'I radiate authentic warmth and attract relationships grounded in divine respect.',
    completedActions: 4,
    totalActions: 7,
    streakDays: 6,
    recommendedFreq: 639,
    connectedTo: ['star-3', 'star-5']
  }
];

export const CelestialUniversePage: React.FC = () => {
  const navigate = useNavigate();
  const player = usePlayer();

  const [stars, setStars] = useState<IntentionStar[]>(INITIAL_STARS);
  const [selectedCategory, setSelectedCategory] = useState<PillarCategory>('all');
  const [activeStar, setActiveStar] = useState<IntentionStar | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State for Adding New Star
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'wealth' | 'health' | 'love' | 'focus' | 'peace'>('wealth');
  const [newAffirmation, setNewAffirmation] = useState<string>('');

  // Filtered stars
  const filteredStars = useMemo(() => {
    if (selectedCategory === 'all') return stars;
    return stars.filter((s) => s.category === selectedCategory);
  }, [stars, selectedCategory]);

  // Constellation Lines: Pairs of coordinates
  const constellationLines = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; key: string }> = [];
    const starMap = new Map(stars.map((s) => [s.id, s]));

    stars.forEach((star) => {
      star.connectedTo.forEach((targetId) => {
        const target = starMap.get(targetId);
        if (target) {
          // Avoid duplicate backwards lines
          const key = [star.id, target.id].sort().join('-');
          if (!lines.some((l) => l.key === key)) {
            // Check if both stars match filter if filtered
            const isVisible =
              selectedCategory === 'all' ||
              (star.category === selectedCategory && target.category === selectedCategory);

            if (isVisible) {
              lines.push({
                x1: star.x,
                y1: star.y,
                x2: target.x,
                y2: target.y,
                color: star.color,
                key
              });
            }
          }
        }
      });
    });

    return lines;
  }, [stars, selectedCategory]);

  // Overall Universe Stats
  const universeStats = useMemo(() => {
    const totalManifested = stars.reduce((acc, s) => acc + s.completedActions, 0);
    const maxStreak = Math.max(...stars.map((s) => s.streakDays), 0);
    const totalStars = stars.length;
    return { totalManifested, maxStreak, totalStars };
  }, [stars]);

  // Handle Add Intention Star
  const handleCreateStar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAffirmation.trim()) return;

    const colors = {
      wealth: '#f59e0b',
      health: '#10b981',
      love: '#ec4899',
      focus: '#06b6d4',
      peace: '#8b5cf6'
    };

    const frequencies = {
      wealth: 528,
      health: 432,
      love: 639,
      focus: 396,
      peace: 174
    };

    const labels = {
      wealth: 'Wealth & Success',
      health: 'Health & Vitality',
      love: 'Love & Magnetism',
      focus: 'Purpose & Focus',
      peace: 'Inner Peace'
    };

    // Random placement within safe zone
    const randomX = Math.floor(Math.random() * 70) + 15;
    const randomY = Math.floor(Math.random() * 65) + 15;

    // Connect to closest star
    const nearestStar = stars[Math.floor(Math.random() * stars.length)];

    const newStar: IntentionStar = {
      id: `star-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: labels[newCategory],
      color: colors[newCategory],
      x: randomX,
      y: randomY,
      magnitude: 3,
      affirmation: newAffirmation.trim(),
      completedActions: 0,
      totalActions: 5,
      streakDays: 1,
      recommendedFreq: frequencies[newCategory],
      connectedTo: [nearestStar.id]
    };

    setStars((prev) => [...prev, newStar]);
    setNewTitle('');
    setNewAffirmation('');
    setIsAddModalOpen(false);
    setActiveStar(newStar);
  };

  // Launch Session Tuned to this Star
  const handleLaunchStarSession = (star: IntentionStar) => {
    const track: SessionTrack = {
      id: `session-tune-${star.id}`,
      title: `${star.recommendedFreq} Hz — ${star.title}`,
      creator: 'Orbit Celestial Engine',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      category: star.categoryLabel,
      duration: 900,
      carrierFreq: star.recommendedFreq,
      binauralFreq: 6.0,
      spokenAffirmations: [star.affirmation]
    };

    player.play(track);
    player.openFullscreen();
  };

  return (
    <div className="universe-page">
      {/* Top Header Bar */}
      <header className="universe-header">
        <div className="universe-header__info">
          <div className="universe-header__badge">Interactive Orbit Cosmos</div>
          <h1 className="universe-header__title">My Celestial Universe</h1>
          <p className="universe-header__subtitle">
            Every intention is a shining star. As you complete aligned actions and maintain your daily ritual,
            your stars burn brighter and weave golden constellations across your reality.
          </p>
        </div>

        {/* Global Stats Counters */}
        <div className="universe-stats-box">
          <div className="u-stat">
            <span className="u-stat__val">{universeStats.totalStars}</span>
            <span className="u-stat__lbl">Intentions</span>
          </div>
          <div className="u-stat-divider" />
          <div className="u-stat">
            <span className="u-stat__val">{universeStats.totalManifested}</span>
            <span className="u-stat__lbl">Actions Done</span>
          </div>
          <div className="u-stat-divider" />
          <div className="u-stat">
            <span className="u-stat__val">{universeStats.maxStreak}d</span>
            <span className="u-stat__lbl">Peak Streak</span>
          </div>
        </div>
      </header>

      {/* Control Bar: Filter Pills & Add Star Button */}
      <nav className="universe-controls" aria-label="Universe filter controls">
        <div className="universe-filter-group" role="tablist" aria-label="Pillars filter">
          {(
            [
              { key: 'all', label: 'All Constellations' },
              { key: 'wealth', label: 'Wealth (528Hz)' },
              { key: 'health', label: 'Health (432Hz)' },
              { key: 'love', label: 'Love (639Hz)' },
              { key: 'focus', label: 'Focus (396Hz)' },
              { key: 'peace', label: 'Peace (174Hz)' }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              className={`filter-pill ${selectedCategory === item.key ? 'is-active' : ''}`}
              onClick={() => setSelectedCategory(item.key)}
              role="tab"
              aria-selected={selectedCategory === item.key}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="add-star-btn"
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Ignite a new intention star"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ignite New Intention
        </button>
      </nav>

      {/* Main Celestial Canvas Container */}
      <main className="universe-canvas-frame">
        {/* Background Ambient Cosmic Nebulae */}
        <div className="nebula nebula--gold" />
        <div className="nebula nebula--purple" />
        <div className="nebula nebula--cyan" />

        {/* SVG Layer for Constellation Web Lines */}
        <svg className="constellation-svg" aria-hidden="true">
          {constellationLines.map((line) => (
            <line
              key={line.key}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke={line.color}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.45"
            />
          ))}
        </svg>

        {/* Interactive Star Nodes */}
        <div className="stars-layer" role="region" aria-label="Interactive constellation stars">
          {filteredStars.map((star) => {
            const isCurrent = activeStar?.id === star.id;
            const sizePx = 28 + star.magnitude * 6;

            return (
              <button
                key={star.id}
                className={`celestial-star ${isCurrent ? 'is-active' : ''}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  color: star.color,
                  boxShadow: `0 0 ${16 + star.magnitude * 6}px ${star.color}80`
                }}
                onClick={() => setActiveStar(star)}
                aria-label={`Intention star: ${star.title}, Category: ${star.categoryLabel}, ${star.completedActions} of ${star.totalActions} actions complete`}
              >
                <div className="star-core" style={{ background: star.color }} />
                <div className="star-halo" style={{ borderColor: star.color }} />
                <span className="star-label" style={{ color: star.color }}>
                  {star.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Helper Hint */}
        <div className="universe-canvas__hint" aria-hidden="true">
          ✦ Click any glowing star to inspect intention, launch tuned frequency, or log progress
        </div>
      </main>

      {/* Active Star Inspector Modal / Drawer */}
      {activeStar && (
        <div className="star-inspector-overlay" onClick={() => setActiveStar(null)}>
          <div
            className="star-inspector"
            style={{ borderColor: activeStar.color }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspector-title"
          >
            <button
              className="inspector-close-btn"
              onClick={() => setActiveStar(null)}
              aria-label="Close star details"
            >
              ✕
            </button>

            <div className="inspector-header">
              <span
                className="inspector-badge"
                style={{ background: `${activeStar.color}25`, color: activeStar.color }}
              >
                {activeStar.categoryLabel}
              </span>
              <span className="inspector-badge inspector-badge--freq">
                {activeStar.recommendedFreq} Hz Harmonic
              </span>
            </div>

            <h2 id="inspector-title" className="inspector-title">{activeStar.title}</h2>

            {/* Affirmation Block */}
            <div
              className="inspector-affirmation"
              style={{ borderLeftColor: activeStar.color, background: `${activeStar.color}15` }}
            >
              <span className="inspector-affirmation-label" style={{ color: activeStar.color }}>
                Living Affirmation:
              </span>
              <p className="inspector-affirmation-text">"{activeStar.affirmation}"</p>
            </div>

            {/* Momentum Progress Meter */}
            <div className="inspector-progress-block">
              <div className="inspector-progress-row">
                <span className="progress-label">Aligned Action Velocity</span>
                <span className="progress-val">
                  {activeStar.completedActions} / {activeStar.totalActions} done
                </span>
              </div>
              <div className="inspector-bar-track">
                <div
                  className="inspector-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((activeStar.completedActions / activeStar.totalActions) * 100))}%`,
                    background: activeStar.color
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="inspector-actions">
              <button
                className="inspector-launch-btn"
                onClick={() => handleLaunchStarSession(activeStar)}
                style={{ background: `linear-gradient(135deg, ${activeStar.color} 0%, #7c3aed 100%)` }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Tune {activeStar.recommendedFreq}Hz Soundscape
              </button>

              <button
                className="inspector-secondary-btn"
                onClick={() => navigate('/actions')}
              >
                View Aligned Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Intention Modal */}
      {isAddModalOpen && (
        <div className="star-inspector-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="add-star-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-modal-title"
          >
            <div className="modal-header">
              <h2 id="add-modal-title" className="modal-title">Ignite New Intention Star</h2>
              <button
                className="modal-close"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStar} className="add-star-form">
              <label className="form-field">
                <span className="form-label">Core Intention / Goal</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Launching my AI agency and signing 5 clients"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label className="form-field">
                <span className="form-label">Pillar of Reality</span>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                >
                  <option value="wealth">Wealth & Success (528 Hz)</option>
                  <option value="health">Health & Vitality (432 Hz)</option>
                  <option value="love">Love & Magnetism (639 Hz)</option>
                  <option value="focus">Purpose & Focus (396 Hz)</option>
                  <option value="peace">Inner Peace (174 Hz)</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">Present-Tense Affirmation</span>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g., I am leading a flourishing agency that delivers monumental value."
                  value={newAffirmation}
                  onChange={(e) => setNewAffirmation(e.target.value)}
                  required
                />
              </label>

              <div className="form-buttons">
                <button
                  type="button"
                  className="form-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="form-submit-btn">
                  Ignite Star in Cosmos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelestialUniversePage;
