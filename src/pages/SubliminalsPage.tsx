import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Plus, Play, Pause, Clock, Radio, RefreshCw,
  AlertTriangle, CheckCircle, Loader2, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import { api } from '../services/api';
import './SubliminalsPage.css';

// ── Types ──────────────────────────────────────────────────────────────────────
type SessionStatus =
  | 'PENDING'
  | 'GENERATING_SCRIPT'
  | 'GENERATING_VOICE'
  | 'MIXING_AUDIO'
  | 'COMPLETED'
  | 'FAILED';

interface PersonalizedSession {
  _id: string;
  title: string;
  category: string;
  status: SessionStatus;
  error?: string;
  intention: {
    desiredOutcome: string;
    desiredIdentity: string;
    emotionalState: string;
    currentBlock: string;
    dailyAction: string;
    category: string;
  };
  settings: {
    durationMinutes: number;
    usageContext: string;
    ambienceTrackId: string;
    frequencyHz?: number;
    voiceId: string;
    ttsProvider: 'elevenlabs' | 'azure';
    subliminalIntensity: 'subtle' | 'balanced' | 'prominent';
  };
  script: {
    affirmations: string[];
    rawText: string;
    tone: string;
  };
  audio: {
    url: string;
    durationSeconds: number;
    fileSizeBytes: number;
  };
  createdAt: string;
}

// ── Deterministic Artwork ─────────────────────────────────────────────────────
const CATEGORY_PALETTES: Record<string, { from: string; to: string; accent: string; symbol: string }> = {
  'manifestation':   { from: '#4c1d95', to: '#0c0a1e', accent: '#a78bfa', symbol: '✦' },
  'wealth':          { from: '#713f12', to: '#0c0a1e', accent: '#fbbf24', symbol: '◈' },
  'confidence':      { from: '#164e63', to: '#0c0a1e', accent: '#38bdf8', symbol: '◉' },
  'looks':           { from: '#831843', to: '#0c0a1e', accent: '#f43f5e', symbol: '◈' },
  'self-concept':    { from: '#581c87', to: '#0c0a1e', accent: '#d946ef', symbol: '◎' },
  'love':            { from: '#831843', to: '#0c0a1e', accent: '#ec4899', symbol: '♡' },
  'career':          { from: '#1e1b4b', to: '#0c0a1e', accent: '#818cf8', symbol: '◇' },
  'academic':        { from: '#0c4a6e', to: '#0c0a1e', accent: '#0ea5e9', symbol: '◆' },
  'motivation':      { from: '#7c2d12', to: '#0c0a1e', accent: '#f97316', symbol: '▲' },
  'discipline':      { from: '#14532d', to: '#0c0a1e', accent: '#4ade80', symbol: '▶' },
  'focus':           { from: '#0e7490', to: '#0c0a1e', accent: '#06b6d4', symbol: '◎' },
  'peace':           { from: '#1e3a5f', to: '#0c0a1e', accent: '#60a5fa', symbol: '~' },
  'health':          { from: '#064e3b', to: '#0c0a1e', accent: '#10b981', symbol: '✦' },
  'energy':          { from: '#713f12', to: '#0c0a1e', accent: '#eab308', symbol: '⚡' },
  'sleep':           { from: '#1e1b4b', to: '#060612', accent: '#818cf8', symbol: '☾' },
  'luck':            { from: '#065f46', to: '#0c0a1e', accent: '#34d399', symbol: '✦' },
  'growth':          { from: '#4a1d96', to: '#0c0a1e', accent: '#a78bfa', symbol: '∞' },
};

function getCategoryPalette(category: string) {
  const key = category.toLowerCase().replace(/ /g, '-');
  return CATEGORY_PALETTES[key] || CATEGORY_PALETTES['manifestation'];
}

function SessionArtwork({ category, size = 64 }: { category: string; size?: number }) {
  const pal = getCategoryPalette(category);
  return (
    <div
      className="session-artwork"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${pal.from} 0%, #0c0a1e 100%)`,
        border: `1px solid ${pal.accent}30`,
        borderRadius: size * 0.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.38,
        color: pal.accent,
        boxShadow: `0 0 ${size * 0.3}px ${pal.accent}18`,
        userSelect: 'none',
      }}
    >
      {pal.symbol}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; pulse: boolean }> = {
  PENDING:           { label: 'Queued',            color: '#94a3b8', pulse: false },
  GENERATING_SCRIPT: { label: 'Writing Script…',   color: '#a78bfa', pulse: true  },
  GENERATING_VOICE:  { label: 'Generating Voice…', color: '#60a5fa', pulse: true  },
  MIXING_AUDIO:      { label: 'Mixing Audio…',     color: '#34d399', pulse: true  },
  COMPLETED:         { label: 'Ready to Play',     color: '#4ade80', pulse: false },
  FAILED:            { label: 'Generation Failed', color: '#f87171', pulse: false },
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
  return (
    <span
      className={`session-status-badge ${cfg.pulse ? 'session-status-badge--pulse' : ''}`}
      style={{ '--badge-color': cfg.color } as React.CSSProperties}
    >
      <span className="session-status-badge__dot" />
      {cfg.label}
    </span>
  );
}

// ── Format Helpers ────────────────────────────────────────────────────────────
function formatDuration(seconds: number) {
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

function formatAmbienceLabel(trackId: string) {
  return trackId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Session Card ──────────────────────────────────────────────────────────────
interface SessionCardProps {
  session: PersonalizedSession;
  isCurrentlyPlaying: boolean;
  isPlaying: boolean;
  onPlay: (session: PersonalizedSession) => void;
  onPause: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session, isCurrentlyPlaying, isPlaying, onPlay, onPause
}) => {
  const pal = getCategoryPalette(session.category);
  const isCompleted = session.status === 'COMPLETED';
  const isGenerating = ['PENDING', 'GENERATING_SCRIPT', 'GENERATING_VOICE', 'MIXING_AUDIO'].includes(session.status);
  const isFailed = session.status === 'FAILED';
  const duration = session.audio?.durationSeconds || session.settings?.durationMinutes * 60 || 300;

  const handleButtonClick = () => {
    if (!isCompleted) return;
    if (isCurrentlyPlaying && isPlaying) {
      onPause();
    } else {
      onPlay(session);
    }
  };

  return (
    <div
      className={`session-card ${isCurrentlyPlaying ? 'session-card--active' : ''} ${isCompleted ? 'session-card--playable' : ''}`}
      style={{ '--card-accent': pal.accent } as React.CSSProperties}
    >
      {/* Active glow ring */}
      {isCurrentlyPlaying && <div className="session-card__active-ring" />}

      <div className="session-card__inner">
        {/* Artwork */}
        <div className="session-card__artwork-wrap">
          <SessionArtwork category={session.category} size={72} />
          {isCurrentlyPlaying && isPlaying && (
            <div className="session-card__playing-indicator">
              <span /><span /><span />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="session-card__content">
          <div className="session-card__header">
            <h3 className="session-card__title">{session.title}</h3>
            <StatusBadge status={session.status} />
          </div>

          {/* Intention snippet */}
          <p className="session-card__intention">
            {session.intention?.desiredIdentity || session.script?.affirmations?.[0] || 'Personalized subconscious session'}
          </p>

          {/* Meta row */}
          <div className="session-card__meta">
            <span className="session-card__meta-item">
              <Clock size={11} />
              {formatDuration(duration)}
            </span>
            {session.settings?.frequencyHz && (
              <span className="session-card__meta-item">
                <Radio size={11} />
                {session.settings.frequencyHz} Hz
              </span>
            )}
            <span className="session-card__meta-item">
              <Zap size={11} />
              {session.settings?.subliminalIntensity || 'subtle'}
            </span>
            <span className="session-card__meta-item session-card__meta-item--ambience">
              {formatAmbienceLabel(session.settings?.ambienceTrackId || 'rain')}
            </span>
          </div>
        </div>

        {/* Play button */}
        <div className="session-card__actions">
          {isCompleted ? (
            <button
              type="button"
              className={`session-card__play-btn ${isCurrentlyPlaying ? 'session-card__play-btn--active' : ''}`}
              onClick={handleButtonClick}
              aria-label={isCurrentlyPlaying && isPlaying ? 'Pause session' : `Play ${session.title}`}
            >
              {isCurrentlyPlaying && isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          ) : isGenerating ? (
            <div className="session-card__generating-icon">
              <Loader2 size={20} className="session-card__spin" />
            </div>
          ) : isFailed ? (
            <div className="session-card__failed-icon" title={session.error}>
              <AlertTriangle size={20} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {isFailed && session.error && (
        <p className="session-card__error">
          {session.error}
        </p>
      )}
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => (
  <div className="subliminals-empty">
    <div className="subliminals-empty__orb" />
    <div className="subliminals-empty__icon">
      <Sparkles size={36} />
    </div>
    <h2 className="subliminals-empty__title">
      Your Personalized Sessions Will Appear Here
    </h2>
    <p className="subliminals-empty__subtitle">
      {isLoggedIn
        ? "You haven't generated any sessions yet. Take the intention questionnaire to create your first personalized subliminal audio session."
        : "Sign in to access your personalized AI-generated subliminal sessions."}
    </p>
    <Link to="/onboarding" className="subliminals-empty__cta">
      <Sparkles size={16} />
      Create My First Session
    </Link>
  </div>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div className="subliminals-skeleton-list">
    {[0, 1, 2].map((i) => (
      <div key={i} className="session-card-skeleton">
        <div className="session-card-skeleton__artwork" />
        <div className="session-card-skeleton__lines">
          <div className="session-card-skeleton__line session-card-skeleton__line--title" />
          <div className="session-card-skeleton__line session-card-skeleton__line--sub" />
          <div className="session-card-skeleton__line session-card-skeleton__line--meta" />
        </div>
        <div className="session-card-skeleton__btn" />
      </div>
    ))}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export const SubliminalsPage: React.FC = () => {
  const { user } = useAuth();
  const player = usePlayer();

  const [sessions, setSessions] = useState<PersonalizedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-poll for in-progress sessions every 4 seconds
  const [pollActive, setPollActive] = useState(false);

  const loadSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await api.listPersonalizedSessions();
      if (res?.sessions) {
        setSessions(res.sessions as PersonalizedSession[]);
        // Activate polling if any session is still processing
        const hasProcessing = (res.sessions as PersonalizedSession[]).some(
          (s) => !['COMPLETED', 'FAILED'].includes(s.status)
        );
        setPollActive(hasProcessing);
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Failed to load sessions');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Poll every 4 seconds while any session is processing
  useEffect(() => {
    if (!pollActive) return;
    const timer = setInterval(() => {
      loadSessions(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [pollActive, loadSessions]);

  const handlePlay = useCallback((session: PersonalizedSession) => {
    if (session.status !== 'COMPLETED' || !session.audio?.url) return;
    const pal = getCategoryPalette(session.category);
    const track: SessionTrack = {
      id: session._id,
      title: session.title,
      creator: 'ORBIT · AI Session',
      thumbnail: '',
      category: session.category,
      duration: session.audio.durationSeconds || session.settings.durationMinutes * 60,
      audioUrl: session.audio.url,
      processingStatus: 'COMPLETED',
      spokenAffirmations: session.script?.affirmations || [],
    };
    // Store accent color as data attribute so MiniPlayer can use it
    (track as any).__accentColor = pal.accent;
    player.play(track);
  }, [player]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSessions();
  };

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const activeSessions = sessions.filter((s) => !['COMPLETED', 'FAILED'].includes(s.status));
  const failedSessions = sessions.filter((s) => s.status === 'FAILED');

  return (
    <div className="orbit-subliminals-page">
      {/* Background glows */}
      <div className="orbit-subliminals-page__glow orbit-subliminals-page__glow--1" />
      <div className="orbit-subliminals-page__glow orbit-subliminals-page__glow--2" />
      <div className="orbit-subliminals-page__glow orbit-subliminals-page__glow--3" />

      <div className="orbit-subliminals-page__container">

        {/* ── Hero Header ────────────────────────────────────────────────────── */}
        <header className="subliminals-header">
          <div className="subliminals-header__badge">
            <Radio size={13} className="subliminals-header__badge-icon" />
            <span>REALITY ARCHITECTURE</span>
          </div>
          <div className="subliminals-header__title-row">
            <div>
              <h1 className="subliminals-header__title">
                Your <span className="subliminals-header__title-accent">Sessions</span>
              </h1>
              <p className="subliminals-header__subtitle">
                AI-generated subliminal audio crafted around your specific intentions.
                Each session is uniquely yours.
              </p>
            </div>
            <div className="subliminals-header__actions">
              <button
                type="button"
                className="subliminals-header__refresh-btn"
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                aria-label="Refresh sessions"
                title="Refresh"
              >
                <RefreshCw size={16} className={isRefreshing ? 'subliminals-header__spin' : ''} />
              </button>
              <Link to="/onboarding" className="subliminals-header__create-btn">
                <Plus size={16} />
                <span>New Session</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
        {!loading && sessions.length > 0 && (
          <div className="subliminals-stats">
            <div className="subliminals-stats__item">
              <span className="subliminals-stats__value">{sessions.length}</span>
              <span className="subliminals-stats__label">Total Sessions</span>
            </div>
            <div className="subliminals-stats__divider" />
            <div className="subliminals-stats__item">
              <span className="subliminals-stats__value subliminals-stats__value--green">{completedSessions.length}</span>
              <span className="subliminals-stats__label">Ready to Play</span>
            </div>
            <div className="subliminals-stats__divider" />
            <div className="subliminals-stats__item">
              <span className="subliminals-stats__value subliminals-stats__value--purple">{activeSessions.length}</span>
              <span className="subliminals-stats__label">Generating</span>
            </div>
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="subliminals-error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button type="button" className="subliminals-error__retry" onClick={() => loadSessions()}>
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState isLoggedIn={Boolean(user)} />
        ) : (
          <div className="subliminals-content">

            {/* ── Active/Generating Sessions ──────────────────────────────────── */}
            {activeSessions.length > 0 && (
              <section className="subliminals-section">
                <div className="subliminals-section__header">
                  <div className="subliminals-section__title-group">
                    <Loader2 size={18} className="subliminals-section__spin subliminals-section__generating-icon" />
                    <h2 className="subliminals-section__title">Generating Now</h2>
                  </div>
                  <span className="subliminals-section__badge subliminals-section__badge--live">LIVE</span>
                </div>
                <p className="subliminals-section__subtitle">
                  These sessions are being crafted. They will appear as ready once complete — usually within 1–2 minutes.
                </p>
                <div className="subliminals-list">
                  {activeSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      isCurrentlyPlaying={player.currentTrack?.id === session._id}
                      isPlaying={player.isPlaying}
                      onPlay={handlePlay}
                      onPause={player.pause}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Completed Sessions ──────────────────────────────────────────── */}
            {completedSessions.length > 0 && (
              <section className="subliminals-section">
                <div className="subliminals-section__header">
                  <div className="subliminals-section__title-group">
                    <CheckCircle size={18} className="subliminals-section__completed-icon" />
                    <h2 className="subliminals-section__title">Ready to Play</h2>
                  </div>
                  <span className="subliminals-section__count">{completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="subliminals-list">
                  {completedSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      isCurrentlyPlaying={player.currentTrack?.id === session._id}
                      isPlaying={player.isPlaying}
                      onPlay={handlePlay}
                      onPause={player.pause}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Failed Sessions ─────────────────────────────────────────────── */}
            {failedSessions.length > 0 && (
              <section className="subliminals-section subliminals-section--collapsed">
                <div className="subliminals-section__header">
                  <div className="subliminals-section__title-group">
                    <AlertTriangle size={16} className="subliminals-section__failed-icon" />
                    <h2 className="subliminals-section__title subliminals-section__title--muted">Failed Sessions</h2>
                  </div>
                  <span className="subliminals-section__count subliminals-section__count--red">{failedSessions.length}</span>
                </div>
                <p className="subliminals-section__subtitle">
                  These sessions encountered an error during generation. Create a new session to try again.
                </p>
                <div className="subliminals-list">
                  {failedSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      isCurrentlyPlaying={false}
                      isPlaying={false}
                      onPlay={handlePlay}
                      onPause={player.pause}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Create New CTA ──────────────────────────────────────────────── */}
            <div className="subliminals-cta-card">
              <div className="subliminals-cta-card__glow" />
              <div className="subliminals-cta-card__content">
                <div className="subliminals-cta-card__icon">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="subliminals-cta-card__title">Create a New Personalized Session</h3>
                  <p className="subliminals-cta-card__text">
                    Answer 6 questions about your current intention and ORBIT's AI will generate a completely unique subliminal audio session — your voice, your frequency, your reality.
                  </p>
                </div>
              </div>
              <Link to="/onboarding" className="subliminals-cta-card__btn">
                Begin Intention Questionnaire
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubliminalsPage;
