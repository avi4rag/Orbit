import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Filter, X, Compass, Radio, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import { api } from '../services/api';
import type { SubliminalSession, UsageType } from '../types/subliminal';
import { CATEGORY_DEFINITIONS } from '../types/subliminal';
import { SubliminalCard } from '../components/subliminals/SubliminalCard';
import { SubliminalRail } from '../components/subliminals/SubliminalRail';
import { SubliminalDrawer } from '../components/subliminals/SubliminalDrawer';
import './SubliminalsPage.css';

const USAGE_FILTERS: (UsageType | 'All')[] = [
  'All',
  'MORNING',
  'DAYTIME',
  'ONE TIME',
  'NIGHT',
  'SLEEP',
  'FOCUS',
  'REPEAT',
];

const LOCAL_STORAGE_RECENT_KEY = 'orbit_recently_played_ids';

export const SubliminalsPage: React.FC = () => {
  const { user } = useAuth();
  const { play } = usePlayer();

  const [allSessions, setAllSessions] = useState<SubliminalSession[]>([]);
  const [recentlyPlayedSessions, setRecentlyPlayedSessions] = useState<SubliminalSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsage, setSelectedUsage] = useState<UsageType | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  const railsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      setLoading(true);
      try {
        const res = await api.getSubliminals();
        if (isMounted && res?.subliminals) {
          const sessions: SubliminalSession[] = res.subliminals;
          setAllSessions(sessions);

          // Attempt to load recently played from server or fallback to local storage
          try {
            const recentRes = await api.getRecentlyPlayed();
            if (isMounted && recentRes?.sessions && recentRes.sessions.length > 0) {
              setRecentlyPlayedSessions(recentRes.sessions);
            } else {
              // LocalStorage fallback
              const savedIdsJson = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
              if (savedIdsJson) {
                const ids: string[] = JSON.parse(savedIdsJson);
                const matched = ids
                  .map((id) => sessions.find((s) => s.id === id))
                  .filter((s): s is SubliminalSession => Boolean(s));
                if (matched.length > 0 && isMounted) {
                  setRecentlyPlayedSessions(matched);
                }
              }
            }
          } catch {
            const savedIdsJson = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
            if (savedIdsJson) {
              const ids: string[] = JSON.parse(savedIdsJson);
              const matched = ids
                .map((id) => sessions.find((s) => s.id === id))
                .filter((s): s is SubliminalSession => Boolean(s));
              if (matched.length > 0 && isMounted) {
                setRecentlyPlayedSessions(matched);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch subliminals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlay = (session: SubliminalSession) => {
    const track: SessionTrack = {
      id: session.id,
      title: session.title,
      creator: session.source?.creator || 'Orbit Audio',
      category: session.category,
      duration: session.duration,
      binauralFreq: session.binauralFreq || 7.83,
      carrierFreq: session.carrierFreq || 432,
      thumbnail: session.artworkUrl,
      spokenAffirmations: session.spokenAffirmations,
    };
    play(track);

    // Track recently played in state and localStorage
    setRecentlyPlayedSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== session.id);
      const updated = [session, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(
          LOCAL_STORAGE_RECENT_KEY,
          JSON.stringify(updated.map((s) => s.id))
        );
      } catch {
        // Ignore local storage error
      }
      return updated;
    });

    api.recordSubliminalPlay(session.id, { progress: 0, completed: false }).catch(() => {});
  };

  const handleDrawerSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedUsage('All');
    setFilterFavoritesOnly(false);
  };

  const handleDrawerSelectUsage = (usage: UsageType | 'All') => {
    setSelectedUsage(usage);
    setFilterFavoritesOnly(false);
  };

  const handleDrawerSelectDiscover = (tab: 'made-for-you' | 'recent' | 'favorites' | 'all') => {
    if (tab === 'all') {
      setSelectedCategory('all');
      setSelectedUsage('All');
      setSearchQuery('');
      setFilterFavoritesOnly(false);
    } else if (tab === 'favorites') {
      setFilterFavoritesOnly(true);
      setSelectedCategory('all');
      setSelectedUsage('All');
    } else if (tab === 'made-for-you') {
      setSelectedCategory('all');
      setSelectedUsage('All');
      setFilterFavoritesOnly(false);
      const el = document.getElementById('made-for-you-rail');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'recent') {
      setSelectedCategory('all');
      setSelectedUsage('All');
      setFilterFavoritesOnly(false);
      const el = document.getElementById('recent-rail');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered sessions for Search, Usage, Category, or Favorites selection
  const filteredSessions = useMemo(() => {
    return allSessions.filter((session) => {
      const matchesSearch =
        !searchQuery ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        session.categoryTitle?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUsage =
        selectedUsage === 'All' ||
        session.usageTypes.includes(selectedUsage as UsageType);

      const matchesCategory =
        selectedCategory === 'all' || session.category === selectedCategory;

      const matchesFavorite = !filterFavoritesOnly || Boolean(session.isFavorite);

      return matchesSearch && matchesUsage && matchesCategory && matchesFavorite;
    });
  }, [allSessions, searchQuery, selectedUsage, selectedCategory, filterFavoritesOnly]);

  // Personalized "Made For You" selection attuned to onboarding goals
  const personalizedSessions = useMemo(() => {
    if (!allSessions.length) return [];
    const goalCategory = user?.goals?.[0]?.category || 'wealth';
    const matched = allSessions.filter(
      (s) =>
        s.category === goalCategory ||
        s.tags?.some((t) => goalCategory.toLowerCase().includes(t.toLowerCase()))
    );
    return matched.length > 0 ? matched : allSessions.slice(0, 10);
  }, [allSessions, user?.goals]);

  // One-time sessions
  const oneTimeSessions = useMemo(() => {
    return allSessions.filter((s) => s.usageTypes.includes('ONE TIME'));
  }, [allSessions]);

  // Usage rails
  const nightSessions = useMemo(() => {
    return allSessions.filter((s) => s.usageTypes.includes('NIGHT'));
  }, [allSessions]);

  const sleepSessions = useMemo(() => {
    return allSessions.filter((s) => s.usageTypes.includes('SLEEP'));
  }, [allSessions]);

  const focusSessions = useMemo(() => {
    return allSessions.filter(
      (s) => s.usageTypes.includes('FOCUS') || s.category === 'focus'
    );
  }, [allSessions]);

  // 17 Category Rails
  const wealthSessions = useMemo(() => allSessions.filter((s) => s.category === 'wealth'), [allSessions]);
  const confidenceSessions = useMemo(() => allSessions.filter((s) => s.category === 'confidence' || s.category === 'social-confidence'), [allSessions]);
  const looksSessions = useMemo(() => allSessions.filter((s) => s.category === 'looks'), [allSessions]);
  const selfConceptSessions = useMemo(() => allSessions.filter((s) => s.category === 'self-concept'), [allSessions]);
  const loveSessions = useMemo(() => allSessions.filter((s) => s.category === 'love'), [allSessions]);
  const careerSessions = useMemo(() => allSessions.filter((s) => s.category === 'career'), [allSessions]);
  const academicSessions = useMemo(() => allSessions.filter((s) => s.category === 'academic'), [allSessions]);
  const motivationSessions = useMemo(() => allSessions.filter((s) => s.category === 'motivation' || s.category === 'discipline'), [allSessions]);
  const peaceSessions = useMemo(() => allSessions.filter((s) => s.category === 'peace' || s.category === 'health'), [allSessions]);
  const energySessions = useMemo(() => allSessions.filter((s) => s.category === 'energy'), [allSessions]);
  const luckSessions = useMemo(() => allSessions.filter((s) => s.category === 'luck'), [allSessions]);
  const growthSessions = useMemo(() => allSessions.filter((s) => s.category === 'growth'), [allSessions]);

  const isFiltering =
    searchQuery.trim().length > 0 ||
    selectedUsage !== 'All' ||
    selectedCategory !== 'all' ||
    filterFavoritesOnly;

  return (
    <div className="orbit-subliminals-page">
      {/* Subliminal Library Burger Menu Side Drawer */}
      <SubliminalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeCategory={selectedCategory}
        activeUsage={selectedUsage}
        onSelectCategory={handleDrawerSelectCategory}
        onSelectUsage={handleDrawerSelectUsage}
        onSelectDiscover={handleDrawerSelectDiscover}
      />

      {/* Dynamic Cosmic Background Glows */}
      <div className="orbit-subliminals-page__glow orbit-subliminals-page__glow--1" />
      <div className="orbit-subliminals-page__glow orbit-subliminals-page__glow--2" />

      <div className="orbit-subliminals-page__container">
        {/* Header Hero Section */}
        <header className="orbit-subliminals-hero">
          <div className="orbit-subliminals-top-bar">
            {/* Library Burger Menu Button */}
            <button
              type="button"
              className="orbit-subliminals-burger-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open subliminal library menu"
            >
              <Menu className="w-4 h-4 text-violet-300" />
              <span>Library</span>
            </button>

            <div className="orbit-subliminals-hero__badge">
              <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>REALITY ARCHITECTURE</span>
            </div>
          </div>

          <h1 className="orbit-subliminals-hero__title">
            Your Reality <span className="orbit-subliminals-hero__title-accent">Library</span>
          </h1>

          <p className="orbit-subliminals-hero__subtitle">
            Explore sessions aligned with the reality you're choosing to live from.
          </p>

          {/* Search Bar */}
          <div className="orbit-subliminals-search">
            <Search className="orbit-subliminals-search__icon" />
            <input
              type="text"
              className="orbit-subliminals-search__input"
              placeholder="Search subliminals, goals, moods, frequencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="orbit-subliminals-search__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Usage Type Filters */}
          <div className="orbit-subliminals-usage-bar">
            <div className="orbit-subliminals-usage-bar__label">
              <Filter className="w-3.5 h-3.5" />
              <span>Intended Situation:</span>
            </div>
            <div className="orbit-subliminals-usage-bar__pills">
              {USAGE_FILTERS.map((filter) => {
                const isActive = selectedUsage === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`orbit-usage-filter-btn ${
                      isActive ? 'orbit-usage-filter-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedUsage(filter);
                      setFilterFavoritesOnly(false);
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Content Body */}
        {loading ? (
          <div className="orbit-subliminals-loading">
            <div className="orbit-subliminals-loading__spinner" />
            <p>Tuning neural frequencies...</p>
          </div>
        ) : isFiltering ? (
          /* Filtered Results View */
          <section className="orbit-subliminals-filtered">
            <div className="orbit-subliminals-filtered__header">
              <div>
                <h2 className="orbit-subliminals-filtered__title">Search & Filter Results</h2>
                <p className="orbit-subliminals-filtered__subtitle">
                  Showing {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'} matching your criteria
                </p>
              </div>
              <button
                type="button"
                className="orbit-subliminals-filtered__reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUsage('All');
                  setSelectedCategory('all');
                }}
              >
                Reset All Filters
              </button>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="orbit-subliminals-grid">
                {filteredSessions.map((session) => (
                  <SubliminalCard
                    key={session.id}
                    session={session}
                    onPlay={handlePlay}
                  />
                ))}
              </div>
            ) : (
              <div className="orbit-subliminals-empty">
                <Compass className="w-12 h-12 text-slate-500 mb-3" />
                <h3>No resonant sessions found</h3>
                <p>Try searching with broader terms or removing usage filters.</p>
                <button
                  type="button"
                  className="orbit-subliminals-empty__btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedUsage('All');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Spotify-Style Horizontal Rails View */
          <div className="orbit-subliminals-rails" ref={railsContainerRef}>
            {/* 1. Made For You */}
            <div id="made-for-you-rail">
              <SubliminalRail
                title="Made For You"
                subtitle="Personalized recommendations attuned to your chosen reality baseline and daily focus."
                sessions={personalizedSessions}
                onPlay={handlePlay}
                accentColor="#a855f7"
              />
            </div>

            {/* 2. Recently Played (Rendered only when history exists) */}
            {recentlyPlayedSessions.length > 0 && (
              <div id="recent-rail">
                <SubliminalRail
                  title="Recently Played"
                  subtitle="Jump back into your recent alignment frequencies and subconscious reprogramming."
                  sessions={recentlyPlayedSessions}
                  onPlay={handlePlay}
                  accentColor="#38bdf8"
                />
              </div>
            )}

            {/* 3. One-Time Alignment Sessions */}
            <SubliminalRail
              title="One-Time Alignment Resets"
              subtitle="Short, high-intensity shifts (10–15 min) for immediate state change before important events."
              sessions={oneTimeSessions}
              onPlay={handlePlay}
              accentColor="#f59e0b"
            />

            {/* 4. Wealth & Abundance */}
            <SubliminalRail
              title="Wealth & Sovereign Abundance"
              subtitle="Compounding prosperity consciousness, money magnet frequencies, and overflow."
              categorySlug="wealth"
              sessions={wealthSessions}
              onPlay={handlePlay}
              accentColor="#fbbf24"
            />

            {/* 5. Core Confidence & Charisma */}
            <SubliminalRail
              title="Confidence & Magnetic Presence"
              subtitle="Dissolve social anxiety, imposter feelings, and anchor into unshakeable self-trust."
              categorySlug="confidence"
              sessions={confidenceSessions}
              onPlay={handlePlay}
              accentColor="#38bdf8"
            />

            {/* 6. Looks & Physical Vitality */}
            <SubliminalRail
              title="Looks & Cellular Vitality"
              subtitle="Cellular repair frequencies, somatic symmetry, radiant glow, and effortless magnetism."
              categorySlug="looks"
              sessions={looksSessions}
              onPlay={handlePlay}
              accentColor="#f43f5e"
            />

            {/* 7. Self Concept & Identity */}
            <SubliminalRail
              title="Self Concept & Quantum Identity"
              subtitle="You do not attract what you want; you attract who you are. Rewire the foundational blueprint."
              categorySlug="self-concept"
              sessions={selfConceptSessions}
              onPlay={handlePlay}
              accentColor="#d946ef"
            />

            {/* 8. Love & Relational Harmony */}
            <SubliminalRail
              title="Love & Relational Harmony"
              subtitle="639 Hz heart-chakra resonance, secure attachment, and magnetic devotion."
              categorySlug="love"
              sessions={loveSessions}
              onPlay={handlePlay}
              accentColor="#ec4899"
            />

            {/* 9. Career & Execution */}
            <SubliminalRail
              title="Career Mastery & Executive Momentum"
              subtitle="Strategic leadership, fearless negotiation, and frictionless daily discipline."
              categorySlug="career"
              sessions={careerSessions}
              onPlay={handlePlay}
              accentColor="#8b5cf6"
            />

            {/* 10. Academic Success & Cognitive Mastery */}
            <SubliminalRail
              title="Academic Success & Brain Booster"
              subtitle="Genius-level memory retention, rapid exam mastery, and effortless comprehension."
              categorySlug="academic"
              sessions={academicSessions}
              onPlay={handlePlay}
              accentColor="#6366f1"
            />

            {/* 11. Motivation & Iron Discipline */}
            <SubliminalRail
              title="Motivation & Iron Discipline"
              subtitle="Obliterate procrastination, build unstoppable momentum, and execute with precision."
              categorySlug="motivation"
              sessions={motivationSessions}
              onPlay={handlePlay}
              accentColor="#ea580c"
            />

            {/* 12. Deep Work & Focus */}
            <SubliminalRail
              title="Focus & Cognitive Laser"
              subtitle="High-gamma 40 Hz binaural beats for deep flow states, memory retention, and zero distraction."
              categorySlug="focus"
              sessions={focusSessions}
              onPlay={handlePlay}
              accentColor="#06b6d4"
            />

            {/* 13. Peace & Somatic Stillness */}
            <SubliminalRail
              title="Peace, Calm & Nervous System Reset"
              subtitle="Gentle 432 Hz theta soundscapes to dissolve stress, panic, and bodily tension."
              categorySlug="peace"
              sessions={peaceSessions}
              onPlay={handlePlay}
              accentColor="#10b981"
            />

            {/* 14. Energy & Pranic Vitality */}
            <SubliminalRail
              title="Energy & Boundless Vitality"
              subtitle="Recharge mitochondria, dissolve chronic fatigue, and radiate vibrant daily stamina."
              categorySlug="energy"
              sessions={energySessions}
              onPlay={handlePlay}
              accentColor="#eab308"
            />

            {/* 15. Luck & Serendipitous Opportunities */}
            <SubliminalRail
              title="Luck & Serendipitous Opportunities"
              subtitle="Align with synchronicity, unexpected windfalls, and high-probability timelines."
              categorySlug="luck"
              sessions={luckSessions}
              onPlay={handlePlay}
              accentColor="#14b8a6"
            />

            {/* 16. Personal Growth & Evolution */}
            <SubliminalRail
              title="Personal Growth & Spiritual Expansion"
              subtitle="Break generational patterns, awaken intuition, and align with your highest timeline."
              categorySlug="growth"
              sessions={growthSessions}
              onPlay={handlePlay}
              accentColor="#a855f7"
            />

            {/* 17. Night Sessions */}
            <SubliminalRail
              title="Night Sessions & Twilight Wind Down"
              subtitle="Calming evening frequencies to quiet the conscious mind before entering restorative sleep."
              sessions={nightSessions}
              onPlay={handlePlay}
              accentColor="#818cf8"
            />

            {/* 18. Sleep & Overnight Reprogramming */}
            <SubliminalRail
              title="Sleep & Overnight Delta Waves"
              subtitle="Uninterrupted delta loops for subconscious reprogramming while your body and mind rest."
              categorySlug="sleep"
              sessions={sleepSessions}
              onPlay={handlePlay}
              accentColor="#4f46e5"
            />

            {/* Visual Category Discovery Grid (Pinterest / Spotify Explore Matrix) */}
            <section className="orbit-subliminals-categories-section">
              <div className="orbit-subliminals-categories-section__header">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Explore All 17 Spheres of Reality
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Select a category to view full dedicated catalogs, filter by usage, and search specific intents.
                </p>
              </div>

              <div className="orbit-categories-browse-grid">
                {Object.values(CATEGORY_DEFINITIONS).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/subliminals/category/${cat.slug}`}
                    className="orbit-category-tile"
                    style={
                      {
                        '--category-accent': cat.accentColor,
                        '--category-gradient': cat.gradient,
                      } as React.CSSProperties
                    }
                  >
                    <div className="orbit-category-tile__backdrop" />
                    <div className="orbit-category-tile__content">
                      <span
                        className="orbit-category-tile__dot"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      <h3 className="orbit-category-tile__title">{cat.title}</h3>
                      <p className="orbit-category-tile__tagline">{cat.tagline}</p>
                      <div className="orbit-category-tile__footer">
                        <span className="orbit-category-tile__explore-link">
                          Explore Catalog →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubliminalsPage;
