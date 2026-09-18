import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlayer, SessionTrack } from '../context/PlayerContext';
import './SessionDetailPage.css';

// ── Types ──────────────────────────────────────────────────────────
export type GuidanceMode = 'guided' | 'ambient' | 'binaural' | 'affirmation_loop' | 'timer';

export interface DetailedSession extends SessionTrack {
  longDescription: string;
  benefits: string[];
  brainwaveType: 'Delta (0.5–4Hz)' | 'Theta (4–8Hz)' | 'Alpha (8–12Hz)' | 'Beta (12–30Hz)' | 'Gamma (30–100Hz)';
  targetState: string;
  recommendedTime: 'Morning' | 'Anytime' | 'Focus Hour' | 'Night';
  rating: number;
  listenCount: number;
  tags: string[];
}

// ── Catalog Seed Database ──────────────────────────────────────────
const DETAILED_SESSIONS: Record<string, DetailedSession> = {
  'session-1': {
    id: 'session-1',
    title: '528 Hz Abundance & Transformation',
    creator: 'Dr. Elena Vance',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    category: 'Wealth & Success',
    duration: 1200, // 20 min
    carrierFreq: 528,
    binauralFreq: 6.0,
    brainwaveType: 'Theta (4–8Hz)',
    targetState: 'Subconscious Reprogramming & Abundance Induction',
    recommendedTime: 'Morning',
    rating: 4.9,
    listenCount: 14200,
    tags: ['528Hz', 'Solfeggio', 'Theta Waves', 'Wealth', 'Transformation'],
    longDescription:
      'Immerse your consciousness in 528 Hz — historically known as the Miracle Tone. Engineered with a subtle 6.0 Hz theta binaural beat, this soundscape dissolves scarcity barriers and grounds you in the felt reality of limitless wealth, overflowing opportunities, and financial freedom.',
    benefits: [
      'Dissolves unconscious fear around money and success',
      'Harmonizes heart-brain coherence during visualization',
      'Induces profound theta trance within 4 minutes',
      'Reinforces unshakeable confidence in your high-impact ventures'
    ],
    spokenAffirmations: [
      'Wealth and abundance flow to me from multiple unexpected sources.',
      'I am completely worthy of extraordinary prosperity and joy.',
      'Money is a neutral energy that magnifies my positive impact on the world.',
      'Every project I launch generates monumental value and gratitude.',
      'I live in relentless gratitude for the abundance already in my possession.'
    ]
  },
  'session-2': {
    id: 'session-2',
    title: '432 Hz Deep Cellular Healing & Serenity',
    creator: 'Mira Thorne',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Health & Vitality',
    duration: 1500, // 25 min
    carrierFreq: 432,
    binauralFreq: 4.5,
    brainwaveType: 'Theta (4–8Hz)',
    targetState: 'Cellular Restoration & Deep Parasympathetic Calm',
    recommendedTime: 'Anytime',
    rating: 4.95,
    listenCount: 22400,
    tags: ['432Hz', 'Healing', 'Parasympathetic', 'Vitality', 'Peace'],
    longDescription:
      'Acoustically aligned to 432 Hz mathematical harmonic resonance. Combined with warm analog drone layers and gentle 4.5 Hz theta waves, this session signals your nervous system to downregulate cortisol and activate innate cellular self-repair.',
    benefits: [
      'Releases chronic nervous tension and somatic stress patterns',
      'Restores effortless diaphragmatic breathing rhythm',
      'Amplifies cellular energy and daily vitality',
      'Calms mental chatter for deep introspective stillness'
    ],
    spokenAffirmations: [
      'Every cell in my body vibrates with radiant vitality and wholeness.',
      'I release all stored stress and welcome infinite healing calm.',
      'My health is a natural state of vibrant, effortless harmony.',
      'I nourish my physical vessel with loving respect and pure nourishment.'
    ]
  },
  'session-3': {
    id: 'session-3',
    title: '639 Hz Magnetic Heart & Harmonious Bonds',
    creator: 'Aiden Brooks',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    category: 'Love & Magnetism',
    duration: 1080, // 18 min
    carrierFreq: 639,
    binauralFreq: 7.83, // Schumann Resonance
    brainwaveType: 'Alpha (8–12Hz)',
    targetState: 'Heart-Brain Coherence & Interpersonal Magnetism',
    recommendedTime: 'Morning',
    rating: 4.88,
    listenCount: 9800,
    tags: ['639Hz', 'Schumann', 'Love', 'Relationships', 'Alpha Waves'],
    longDescription:
      'Engineered around the 639 Hz Solfeggio frequency and the 7.83 Hz Earth Schumann Resonance. Cultivates an expansive magnetic aura, opens the heart center, and aligns your interpersonal frequency to attract genuine, uplifting, high-integrity connections.',
    benefits: [
      'Fosters deep empathy, compassion, and emotional sovereignty',
      'Harmonizes strained relationships and dissolves past grievances',
      'Attracts soul-aligned collaborators, friends, and romantic partners',
      'Strengthens radiant self-love without seeking external validation'
    ],
    spokenAffirmations: [
      'I am a magnetic beacon for profound love, respect, and understanding.',
      'I welcome soul-aligned connections that elevate and inspire me.',
      'My heart is unconditionally open, resilient, and safe.',
      'I radiate genuine warmth and attract people who honor my highest self.'
    ]
  },
  'session-4': {
    id: 'session-4',
    title: 'Alpha Flow & Unstoppable Focus (10 Hz)',
    creator: 'Dr. Marcus Vance',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Purpose & Focus',
    duration: 2700, // 45 min
    carrierFreq: 396,
    binauralFreq: 10.0,
    brainwaveType: 'Alpha (8–12Hz)',
    targetState: 'Effortless Deep Work & Flow State Induction',
    recommendedTime: 'Focus Hour',
    rating: 4.92,
    listenCount: 18700,
    tags: ['10Hz', 'Flow State', 'Alpha Waves', 'Productivity', 'Deep Work'],
    longDescription:
      'Designed specifically to accompany your Aligned Action Power Hours. A crisp 10.0 Hz alpha pulse paired with grounding sub-bass creates a cocoon of laser clarity where distractions evaporate and complex work unfolds with relaxed momentum.',
    benefits: [
      'Eliminates digital distraction impulses and task-switching friction',
      'Sustains high cognitive endurance without caffeine jitters',
      'Anchors your mind into flow state within 3 minutes of listening',
      'Directly bridges your visualization into tangible executed results'
    ],
    spokenAffirmations: [
      'I execute high-priority actions with absolute clarity and calm speed.',
      'My focus is deep, uninterrupted, and deeply fulfilling.',
      'Every hour of focused work compounds into monumental long-term results.',
      'I do not wait for motivation; my disciplined actions generate inspiration.'
    ]
  },
  'session-5': {
    id: 'session-5',
    title: 'Delta Deep Slumber & Astral Reset',
    creator: 'Kaelen Raine',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'Inner Peace',
    duration: 3600, // 60 min
    carrierFreq: 174,
    binauralFreq: 2.0,
    brainwaveType: 'Delta (0.5–4Hz)',
    targetState: 'Stage 4 Slow-Wave Sleep & Subconscious Integration',
    recommendedTime: 'Night',
    rating: 4.97,
    listenCount: 31000,
    tags: ['Delta Waves', '174Hz', 'Sleep', 'Night Reset', 'Slow Wave'],
    longDescription:
      'A deep journey into slow-wave delta frequencies (2.0 Hz) layered beneath dark organic cosmic pads. Designed to be played at bedtime, it gently carries you past insomnia barriers and programs your subconscious while you rest deeply.',
    benefits: [
      'Dramatically accelerates time-to-sleep and eliminates bedtime overthinking',
      'Enhances Stage 4 slow-wave sleep and physical recovery',
      'Integrates daytime visualizations into permanent subconscious identity',
      'Wake up feeling rejuvenated, centered, and fully replenished'
    ],
    spokenAffirmations: [
      'I release today with peace and surrender into restorative rest.',
      'My subconscious mind organizes my intentions into physical reality as I sleep.',
      'I am completely safe, held, and at ease.',
      'Tomorrow brings boundless vitality, clarity, and inspired momentum.'
    ]
  }
};

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = usePlayer();

  const [selectedMode, setSelectedMode] = useState<GuidanceMode>('guided');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [selectedAffirmationIndex, setSelectedAffirmationIndex] = useState<number | null>(null);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Retrieve track data or fallback
  const session: DetailedSession = useMemo(() => {
    if (id && DETAILED_SESSIONS[id]) {
      return DETAILED_SESSIONS[id];
    }
    // Fallback if ID is unknown
    return {
      ...DETAILED_SESSIONS['session-1'],
      id: id || 'custom-session',
      title: id ? `Session #${id}` : 'Custom Soundscape'
    };
  }, [id]);

  const isCurrentTrack = player.currentTrack?.id === session.id;
  const isPlayingNow = isCurrentTrack && player.isPlaying;

  // Handle Play/Pause
  const handleTogglePlayback = () => {
    if (isPlayingNow) {
      player.pause();
    } else if (isCurrentTrack) {
      player.resume();
    } else {
      player.play({
        id: session.id,
        title: session.title,
        creator: session.creator,
        thumbnail: session.thumbnail,
        category: session.category,
        duration: session.duration,
        carrierFreq: session.carrierFreq,
        binauralFreq: session.binauralFreq,
        spokenAffirmations: selectedMode === 'ambient' ? [] : session.spokenAffirmations
      });
    }
  };

  const handleLaunchFullscreen = () => {
    if (!isCurrentTrack) {
      handleTogglePlayback();
    }
    player.openFullscreen();
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  return (
    <div className="session-detail">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="session-detail__toast" role="status" aria-live="polite">
          Link copied to clipboard! Share the frequency.
        </div>
      )}

      {/* Top Breadcrumbs */}
      <nav className="session-detail__nav" aria-label="Breadcrumb">
        <button
          className="session-detail__back-btn"
          onClick={() => navigate('/explore')}
          aria-label="Back to explore catalog"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Soundscapes
        </button>
        <span className="session-detail__sep" aria-hidden="true">/</span>
        <span className="session-detail__curr-crumb">{session.category}</span>
        <span className="session-detail__sep" aria-hidden="true">/</span>
        <span className="session-detail__title-crumb">{session.title}</span>
      </nav>

      {/* Hero Banner Section */}
      <header className="session-hero">
        <div className="session-hero__backdrop" style={{ backgroundImage: `url(${session.thumbnail})` }} />
        <div className="session-hero__overlay" />

        <div className="session-hero__content">
          <div className="session-hero__badges">
            <span className="badge badge--category">{session.category}</span>
            <span className="badge badge--carrier">{session.carrierFreq} Hz Solfeggio</span>
            <span className="badge badge--brainwave">{session.brainwaveType}</span>
            <span className="badge badge--time">Best: {session.recommendedTime}</span>
          </div>

          <h1 className="session-hero__title">{session.title}</h1>
          <p className="session-hero__creator">Engineered by <strong>{session.creator}</strong></p>

          <div className="session-hero__meta-stats">
            <span className="meta-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatTime(session.duration)}
            </span>
            <span className="meta-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {session.rating} ({session.listenCount.toLocaleString()} journeys)
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="session-hero__actions">
            <button
              className={`session-btn session-btn--primary ${isPlayingNow ? 'is-playing' : ''}`}
              onClick={handleTogglePlayback}
              aria-label={isPlayingNow ? 'Pause session playback' : 'Start listening to this session'}
            >
              {isPlayingNow ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                  Pause Session
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {isCurrentTrack ? 'Resume Journey' : 'Begin Experience'}
                </>
              )}
            </button>

            <button
              className="session-btn session-btn--fullscreen"
              onClick={handleLaunchFullscreen}
              aria-label="Open immersive fullscreen mode"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              Fullscreen Immersion
            </button>

            <button
              className={`session-btn session-btn--icon ${isBookmarked ? 'is-active' : ''}`}
              onClick={() => setIsBookmarked(!isBookmarked)}
              aria-label={isBookmarked ? 'Remove from favorites' : 'Save to favorites'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button
              className="session-btn session-btn--icon"
              onClick={handleCopyShare}
              aria-label="Share session link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Details & Interactive Tabs */}
      <main className="session-grid">
        {/* Left Column: Description & Acoustic Specs */}
        <section className="session-col session-col--primary" aria-label="Acoustic specs and benefits">
          {/* Guidance Mode Selector */}
          <div className="panel panel--mode-select">
            <h2 className="panel__title">Guidance Mode</h2>
            <p className="panel__subtitle">Customize how the soundscape delivers audio & affirmations.</p>
            <div className="mode-options" role="radiogroup" aria-label="Guidance mode options">
              <button
                className={`mode-btn ${selectedMode === 'guided' ? 'is-selected' : ''}`}
                onClick={() => setSelectedMode('guided')}
                role="radio"
                aria-checked={selectedMode === 'guided'}
              >
                <span className="mode-btn__icon">🎙️</span>
                <div className="mode-btn__info">
                  <strong>Guided Spoken</strong>
                  <span>Synthesized voice + frequency beds</span>
                </div>
              </button>

              <button
                className={`mode-btn ${selectedMode === 'ambient' ? 'is-selected' : ''}`}
                onClick={() => setSelectedMode('ambient')}
                role="radio"
                aria-checked={selectedMode === 'ambient'}
              >
                <span className="mode-btn__icon">🌌</span>
                <div className="mode-btn__info">
                  <strong>Pure Solfeggio</strong>
                  <span>Instrumental frequency drone only</span>
                </div>
              </button>

              <button
                className={`mode-btn ${selectedMode === 'binaural' ? 'is-selected' : ''}`}
                onClick={() => setSelectedMode('binaural')}
                role="radio"
                aria-checked={selectedMode === 'binaural'}
              >
                <span className="mode-btn__icon">🎧</span>
                <div className="mode-btn__info">
                  <strong>Binaural Focus</strong>
                  <span>Stereo headphone wave beats</span>
                </div>
              </button>

              <button
                className={`mode-btn ${selectedMode === 'affirmation_loop' ? 'is-selected' : ''}`}
                onClick={() => setSelectedMode('affirmation_loop')}
                role="radio"
                aria-checked={selectedMode === 'affirmation_loop'}
              >
                <span className="mode-btn__icon">🔁</span>
                <div className="mode-btn__info">
                  <strong>Identity Loop</strong>
                  <span>Continuous subliminal affirmation stream</span>
                </div>
              </button>
            </div>
          </div>

          {/* Description & Neurological Mechanics */}
          <div className="panel">
            <h2 className="panel__title">Neurological Architecture</h2>
            <p className="panel__text">{session.longDescription}</p>

            <h3 className="panel__h3">Key Shifts & Benefits</h3>
            <ul className="benefits-list">
              {session.benefits.map((b, idx) => (
                <li key={idx} className="benefit-item">
                  <span className="benefit-check" aria-hidden="true">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Frequency & Brainwave Tech Specs */}
          <div className="panel panel--specs">
            <h2 className="panel__title">Frequency Calibration</h2>
            <div className="specs-grid">
              <div className="spec-card">
                <span className="spec-label">Carrier Frequency</span>
                <span className="spec-value">{session.carrierFreq} Hz</span>
                <span className="spec-desc">Harmonic resonant tone</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">Binaural Beat Pulse</span>
                <span className="spec-value">{session.binauralFreq} Hz</span>
                <span className="spec-desc">{session.brainwaveType}</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">Target Neurological State</span>
                <span className="spec-value spec-value--state">{session.targetState}</span>
                <span className="spec-desc">Verified EEG pattern</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Affirmations & Connected Aligned Action */}
        <aside className="session-col session-col--secondary" aria-label="Spoken affirmations and actions">
          {/* Spoken Affirmations Reader */}
          <div className="panel panel--affirmations">
            <div className="panel__header-row">
              <h2 className="panel__title">Spoken Affirmations</h2>
              <span className="badge badge--pill">{session.spokenAffirmations?.length || 0} mantras</span>
            </div>
            <p className="panel__subtitle">
              Repeat these aloud or internally during the visualization phase.
            </p>

            <div className="affirmations-list" role="list">
              {session.spokenAffirmations?.map((aff, i) => (
                <div
                  key={i}
                  role="listitem"
                  tabIndex={0}
                  className={`aff-card ${selectedAffirmationIndex === i ? 'is-selected' : ''}`}
                  onClick={() => setSelectedAffirmationIndex(selectedAffirmationIndex === i ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedAffirmationIndex(selectedAffirmationIndex === i ? null : i);
                    }
                  }}
                  aria-label={`Affirmation ${i + 1}: ${aff}`}
                >
                  <span className="aff-num">0{i + 1}</span>
                  <p className="aff-text">"{aff}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Aligned Action Banner */}
          <div className="panel panel--action-bridge">
            <div className="action-bridge__icon" aria-hidden="true">⚡</div>
            <h3 className="action-bridge__title">Manifestation Demands Action</h3>
            <p className="action-bridge__text">
              Anchor this internal energetic shift with at least one high-integrity physical step today.
            </p>
            <Link to="/actions" className="action-bridge__btn">
              Open Aligned Action Board
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SessionDetailPage;
