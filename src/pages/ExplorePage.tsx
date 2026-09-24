import React, { useState, useEffect, useCallback } from 'react';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import './ExplorePage.css';

// ── Types ──────────────────────────────────────────────────────────────
type Category = 'all' | 'focus' | 'sleep' | 'meditation' | 'confidence' | 'healing';
type SortKey  = 'popular' | 'duration' | 'newest';

interface CatalogItem {
  id: string;
  title: string;
  creator: string;
  category: string;
  duration: number;
  binauralFreq: number;
  carrierFreq: number;
  thumbnail: string;
  description: string;
  plays: number;
  isFavorite: boolean;
  spokenAffirmations: string[];
  tags: string[];
}

// ── Seed data (mirrors server catalog) ────────────────────────────────
const SEED_CATALOG: CatalogItem[] = [
  {
    id: 'deep-focus-40hz',
    title: 'Deep Focus — Gamma 40 Hz',
    creator: 'Orbit',
    category: 'focus',
    duration: 1800,
    binauralFreq: 40,
    carrierFreq: 200,
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
    description: 'Gamma binaural beats at 40 Hz for peak cognitive performance and flow state entry.',
    plays: 14820,
    isFavorite: false,
    spokenAffirmations: ['My mind is sharp and clear.', 'I enter deep focus effortlessly.', 'I am in perfect flow.'],
    tags: ['gamma', 'productivity', 'flow'],
  },
  {
    id: 'sleep-delta-2hz',
    title: 'Deep Sleep — Delta 2 Hz',
    creator: 'Orbit',
    category: 'sleep',
    duration: 3600,
    binauralFreq: 2,
    carrierFreq: 100,
    thumbnail: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&q=80',
    description: 'Delta wave induction for deep restorative sleep. Brown noise + 2 Hz binaural carrier.',
    plays: 21450,
    isFavorite: false,
    spokenAffirmations: ['I release the day with gratitude.', 'My body heals as I rest.', 'Peace flows through me.'],
    tags: ['delta', 'sleep', 'rest'],
  },
  {
    id: 'solfeggio-528',
    title: 'Solfeggio 528 Hz — DNA Repair',
    creator: 'Orbit',
    category: 'healing',
    duration: 2700,
    binauralFreq: 6,
    carrierFreq: 528,
    thumbnail: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&q=80',
    description: 'The "love frequency" — 528 Hz carrier with theta binaural layer for deep inner healing.',
    plays: 18200,
    isFavorite: false,
    spokenAffirmations: ['I am whole and healed.', 'Love radiates from within me.', 'My body knows how to heal.'],
    tags: ['solfeggio', 'healing', 'theta'],
  },
  {
    id: 'alpha-confidence',
    title: 'Unshakeable Confidence — Alpha 10 Hz',
    creator: 'Orbit',
    category: 'confidence',
    duration: 1200,
    binauralFreq: 10,
    carrierFreq: 432,
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    description: 'Alpha waves at 432 Hz carrier — the "natural tuning" frequency for calm, grounded self-belief.',
    plays: 9340,
    isFavorite: false,
    spokenAffirmations: ['I am confident in every room I enter.', 'I already have what I need.', 'I believe in my abilities completely.'],
    tags: ['alpha', 'confidence', '432hz'],
  },
  {
    id: 'theta-meditation',
    title: 'Deep Meditation — Theta 6 Hz',
    creator: 'Orbit',
    category: 'meditation',
    duration: 2400,
    binauralFreq: 6,
    carrierFreq: 396,
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    description: 'Theta at 396 Hz — the liberation frequency. Deep meditative state for insight and creative breakthrough.',
    plays: 12870,
    isFavorite: false,
    spokenAffirmations: ['I am at peace.', 'Clarity flows to me naturally.', 'I trust the process of life.'],
    tags: ['theta', 'meditation', 'solfeggio'],
  },
  {
    id: 'morning-abundance',
    title: 'Morning Abundance — Beta 18 Hz',
    creator: 'Orbit',
    category: 'confidence',
    duration: 900,
    binauralFreq: 18,
    carrierFreq: 741,
    thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80',
    description: 'Beta wave activation for a powerful morning ritual. 741 Hz awakening frequency.',
    plays: 7650,
    isFavorite: false,
    spokenAffirmations: ['Today I create what I vision.', 'Abundance is my natural state.', 'I act with purpose and power.'],
    tags: ['beta', 'morning', 'abundance'],
  },
  {
    id: 'sleep-healing-396',
    title: 'Night Healing — Solfeggio 396 Hz',
    creator: 'Orbit',
    category: 'sleep',
    duration: 3000,
    binauralFreq: 3,
    carrierFreq: 396,
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80',
    description: 'Liberation frequency 396 Hz with delta waves — release fear and guilt as you drift to sleep.',
    plays: 8920,
    isFavorite: false,
    spokenAffirmations: ['I release all fear from today.', 'I am safe.', 'Tomorrow I rise renewed.'],
    tags: ['delta', 'sleep', 'solfeggio'],
  },
  {
    id: 'focus-852',
    title: 'Awakened Intuition — 852 Hz',
    creator: 'Orbit',
    category: 'focus',
    duration: 2100,
    binauralFreq: 14,
    carrierFreq: 852,
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
    description: '852 Hz — return to spiritual order, clarity of mind, and heightened intuition for decision-making.',
    plays: 6380,
    isFavorite: false,
    spokenAffirmations: ['I trust my intuition completely.', 'The right answers come to me clearly.', 'I see solutions others miss.'],
    tags: ['solfeggio', 'intuition', 'alpha'],
  },
];

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'all',        label: 'All',        emoji: '✦' },
  { key: 'focus',      label: 'Focus',      emoji: '🎯' },
  { key: 'sleep',      label: 'Sleep',      emoji: '🌙' },
  { key: 'meditation', label: 'Meditation', emoji: '🧘' },
  { key: 'confidence', label: 'Confidence', emoji: '⚡' },
  { key: 'healing',    label: 'Healing',    emoji: '💚' },
];

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

// ── Component ──────────────────────────────────────────────────────────
const ExplorePage: React.FC = () => {
  const player = usePlayer();
  const [catalog, setCatalog] = useState<CatalogItem[]>(SEED_CATALOG);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [sort, setSort] = useState<SortKey>('popular');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Try fetching live catalog from server; fall back to seed data
  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setCatalog(data); })
      .catch(() => {/* use seed */});
  }, []);

  const filtered = useCallback(() => {
    let list = [...catalog];
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      );
    }
    switch (sort) {
      case 'popular':  list.sort((a, b) => b.plays - a.plays); break;
      case 'duration': list.sort((a, b) => b.duration - a.duration); break;
      case 'newest':   list.reverse(); break;
    }
    return list;
  }, [catalog, activeCategory, search, sort]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePlay = (item: CatalogItem) => {
    const track: SessionTrack = {
      id: item.id,
      title: item.title,
      creator: item.creator,
      thumbnail: item.thumbnail,
      category: item.category,
      duration: item.duration,
      binauralFreq: item.binauralFreq,
      carrierFreq: item.carrierFreq,
      spokenAffirmations: item.spokenAffirmations,
    };
    player.currentTrack?.id === item.id && player.isPlaying
      ? player.pause()
      : player.play(track);
  };

  const results = filtered();

  return (
    <div className="explore">
      {/* Header */}
      <section className="explore__header" aria-labelledby="explore-heading">
        <div className="explore__header-inner">
          <h1 id="explore-heading" className="explore__title">
            Celestial Soundscapes
          </h1>
          <p className="explore__subtitle">
            Binaural beats · Solfeggio frequencies · Spoken affirmations — crafted to shift your inner state.
          </p>

          {/* Search */}
          <div className="explore__search-wrap">
            <label htmlFor="explore-search" className="sr-only">Search soundscapes</label>
            <span className="explore__search-icon" aria-hidden="true">🔍</span>
            <input
              id="explore-search"
              className="explore__search"
              type="search"
              placeholder="Search by title, tag, or frequency…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search soundscapes"
            />
          </div>
        </div>
      </section>

      <div className="explore__body">
        {/* Sidebar filters */}
        <aside className="explore__sidebar" aria-label="Filter soundscapes">
          <nav aria-label="Category filter">
            <h2 className="explore__filter-heading">Category</h2>
            <ul className="explore__cat-list" role="list">
              {CATEGORIES.map(c => (
                <li key={c.key}>
                  <button
                    className={`explore__cat-btn ${activeCategory === c.key ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory(c.key)}
                    aria-pressed={activeCategory === c.key}
                    aria-label={`Filter by ${c.label}`}
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="explore__sort-section" role="group" aria-label="Sort order">
            <h2 className="explore__filter-heading">Sort By</h2>
            {(['popular', 'duration', 'newest'] as SortKey[]).map(s => (
              <button
                key={s}
                className={`explore__sort-btn ${sort === s ? 'is-active' : ''}`}
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </aside>

        {/* Catalog grid */}
        <main id="main-catalog" aria-label={`${results.length} soundscapes`}>
          <div className="explore__stats" aria-live="polite" aria-atomic="true">
            <span>{results.length} session{results.length !== 1 ? 's' : ''}</span>
            {search && <span className="explore__stats-query">for "{search}"</span>}
          </div>

          {results.length === 0 ? (
            <div className="explore__empty" role="status">
              <span aria-hidden="true">🪐</span>
              <p>No sessions found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="explore__grid" role="list">
              {results.map((item, i) => {
                const isPlaying = player.currentTrack?.id === item.id && player.isPlaying;
                const isFav = favorites.has(item.id);
                return (
                  <article
                    key={item.id}
                    className={`session-card ${isPlaying ? 'is-playing' : ''}`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                    role="listitem"
                    aria-label={`${item.title} — ${formatDuration(item.duration)}`}
                  >
                    {/* Thumbnail */}
                    <div className="session-card__img-wrap">
                      <img
                        className="session-card__img"
                        src={item.thumbnail}
                        alt=""
                        loading="lazy"
                      />
                      {/* Play overlay */}
                      <button
                        className="session-card__play-overlay"
                        onClick={() => handlePlay(item)}
                        aria-label={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                        aria-pressed={isPlaying}
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>

                      {/* Category badge */}
                      <span className={`session-card__cat-badge session-card__cat-badge--${item.category}`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="session-card__body">
                      <h3 className="session-card__title">{item.title}</h3>
                      <p className="session-card__desc">{item.description}</p>

                      <div className="session-card__meta">
                        <span className="session-card__freq" aria-label={`${item.binauralFreq} Hz binaural, ${item.carrierFreq} Hz carrier`}>
                          🎵 {item.binauralFreq} Hz · {item.carrierFreq} Hz
                        </span>
                        <span className="session-card__duration" aria-label={`Duration: ${formatDuration(item.duration)}`}>
                          ⏱ {formatDuration(item.duration)}
                        </span>
                        <span className="session-card__plays" aria-label={`${item.plays.toLocaleString()} plays`}>
                          ▶ {item.plays.toLocaleString()}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="session-card__tags" aria-label="Tags">
                        {item.tags.map(t => (
                          <button
                            key={t}
                            className="session-card__tag"
                            onClick={() => setSearch(t)}
                            aria-label={`Filter by tag: ${t}`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="session-card__footer">
                        <button
                          className={`session-card__fav ${isFav ? 'is-fav' : ''}`}
                          onClick={() => toggleFavorite(item.id)}
                          aria-label={isFav ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
                          aria-pressed={isFav}
                        >
                          {isFav ? '♥' : '♡'} {isFav ? 'Saved' : 'Save'}
                        </button>
                        <button
                          className="session-card__play-btn"
                          onClick={() => handlePlay(item)}
                          aria-label={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                          aria-pressed={isPlaying}
                        >
                          {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExplorePage;
