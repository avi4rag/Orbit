import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Compass,
  Radio,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import { api } from '../services/api';
import type { SubliminalSession, UsageType, CategorySlug } from '../types/subliminal';
import { CATEGORY_DEFINITIONS } from '../types/subliminal';
import { SubliminalCard } from '../components/subliminals/SubliminalCard';
import './CategoryPage.css';

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

type SortOption = 'recommended' | 'popular' | 'duration-asc' | 'duration-desc' | 'newest';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { play } = usePlayer();

  const categorySlug = (slug as CategorySlug) || 'wealth';
  const categoryMeta = CATEGORY_DEFINITIONS[categorySlug] || {
    slug: categorySlug,
    title: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' '),
    tagline: 'Subconscious audio alignment sessions for this pillar of reality.',
    searchIntents: [],
    subcategories: ['General', 'Resets'],
    accentColor: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
    artworkKeywords: ['cosmos', 'frequencies'],
  };

  const [sessions, setSessions] = useState<SubliminalSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsage, setSelectedUsage] = useState<UsageType | 'All'>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategorySessions = async () => {
      setLoading(true);
      try {
        const res = await api.getSubliminalCategory(categorySlug);
        if (isMounted && res?.subliminals) {
          setSessions(res.subliminals);
        }
      } catch (err) {
        console.error('Failed to fetch category sessions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategorySessions();
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

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
  };

  const handleDiscoverMore = async () => {
    setIsDiscovering(true);
    setDiscoveryMessage(null);
    try {
      const res = await api.getSubliminals({ category: categorySlug, limit: 12 });
      if (res?.subliminals && res.subliminals.length > 0) {
        setSessions(res.subliminals);
        setDiscoveryMessage(`Catalog synchronized! ${res.subliminals.length} sessions available.`);
      } else {
        setDiscoveryMessage('All current YouTube frequencies for this category are up to date.');
      }
    } catch (_err) {
      setDiscoveryMessage('Network offline or backend synchronizing in background.');
    } finally {
      setIsDiscovering(false);
      setTimeout(() => setDiscoveryMessage(null), 4000);
    }
  };

  // Filter & Sort Sessions
  const displaySessions = useMemo(() => {
    let list = sessions.filter((session) => {
      const matchesSearch =
        !searchQuery ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesUsage =
        selectedUsage === 'All' ||
        session.usageTypes.includes(selectedUsage as UsageType);

      const matchesSubcategory =
        selectedSubcategory === 'all' ||
        session.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase();

      return matchesSearch && matchesUsage && matchesSubcategory;
    });

    switch (sortBy) {
      case 'popular':
        list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        break;
      case 'duration-asc':
        list.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration-desc':
        list.sort((a, b) => b.duration - a.duration);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'recommended':
      default:
        // Keep default curated priority
        break;
    }

    return list;
  }, [sessions, searchQuery, selectedUsage, selectedSubcategory, sortBy]);

  return (
    <div
      className="orbit-category-page"
      style={
        {
          '--category-accent': categoryMeta.accentColor,
          '--category-gradient': categoryMeta.gradient,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Cosmic Ambient Glows */}
      <div className="orbit-category-page__glow" />

      <div className="orbit-category-page__container">
        {/* Back Link */}
        <div className="orbit-category-page__nav">
          <Link to="/subliminals" className="orbit-category-page__back-link">
            <ArrowLeft className="w-4 h-4" />
            <span>Reality Library</span>
          </Link>
        </div>

        {/* Category Header Banner */}
        <header className="orbit-category-header">
          <div className="orbit-category-header__badge">
            <span
              className="orbit-category-header__dot"
              style={{ backgroundColor: categoryMeta.accentColor }}
            />
            <span>REALITY PILLAR</span>
          </div>

          <h1 className="orbit-category-header__title">{categoryMeta.title}</h1>
          <p className="orbit-category-header__tagline">{categoryMeta.tagline}</p>

          <div className="orbit-category-header__stats">
            <span className="orbit-category-stat">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{sessions.length} Curated Sessions</span>
            </span>
            <span className="orbit-category-stat">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span>Binaural & Solfeggio Audio</span>
            </span>
          </div>

          {/* Subcategories Chips */}
          {categoryMeta.subcategories && categoryMeta.subcategories.length > 0 && (
            <div className="orbit-category-subcats">
              <button
                type="button"
                className={`orbit-category-subcat-chip ${
                  selectedSubcategory === 'all' ? 'orbit-category-subcat-chip--active' : ''
                }`}
                onClick={() => setSelectedSubcategory('all')}
              >
                All Subcategories
              </button>
              {categoryMeta.subcategories.map((subcat) => (
                <button
                  key={subcat}
                  type="button"
                  className={`orbit-category-subcat-chip ${
                    selectedSubcategory === subcat ? 'orbit-category-subcat-chip--active' : ''
                  }`}
                  onClick={() => setSelectedSubcategory(subcat)}
                >
                  {subcat}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Filter & Search Toolbar */}
        <div className="orbit-category-toolbar">
          {/* Search Bar */}
          <div className="orbit-category-search">
            <Search className="orbit-category-search__icon" />
            <input
              type="text"
              className="orbit-category-search__input"
              placeholder={`Search within ${categoryMeta.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="orbit-category-sort">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="orbit-category-sort__select"
            >
              <option value="recommended">Recommended</option>
              <option value="popular">Most Played</option>
              <option value="duration-asc">Shortest First</option>
              <option value="duration-desc">Longest First</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Usage Filters Pills */}
        <div className="orbit-category-usage-bar">
          <div className="orbit-category-usage-bar__label">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Intended Situation:</span>
          </div>
          <div className="orbit-category-usage-bar__pills">
            {USAGE_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`orbit-category-usage-btn ${
                  selectedUsage === f ? 'orbit-category-usage-btn--active' : ''
                }`}
                onClick={() => setSelectedUsage(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Actions */}
        <div className="orbit-category-results-bar">
          <span className="orbit-category-results-count">
            Showing {displaySessions.length} session{displaySessions.length === 1 ? '' : 's'}
          </span>

          <button
            type="button"
            className="orbit-category-sync-btn"
            onClick={handleDiscoverMore}
            disabled={isDiscovering}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>{isDiscovering ? 'Synchronizing Frequencies...' : 'Sync YouTube Discovery'}</span>
          </button>
        </div>

        {discoveryMessage && (
          <div className="orbit-category-notice animate-fade-in">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>{discoveryMessage}</span>
          </div>
        )}

        {/* Card Grid */}
        {loading ? (
          <div className="orbit-category-loading">
            <div className="orbit-category-loading__spinner" />
            <p>Harmonizing session frequencies...</p>
          </div>
        ) : displaySessions.length > 0 ? (
          <div className="orbit-category-grid">
            {displaySessions.map((session) => (
              <SubliminalCard
                key={session.id}
                session={session}
                onPlay={handlePlay}
              />
            ))}
          </div>
        ) : (
          <div className="orbit-category-empty">
            <Compass className="w-12 h-12 text-slate-500 mb-3" />
            <h3>No matching sessions found</h3>
            <p>Adjust your search query or reset situational filters.</p>
            <button
              type="button"
              className="orbit-category-empty__btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedUsage('All');
                setSelectedSubcategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
