import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Waves,
  Clock,
  Sliders,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Volume2,
  Mic,
  Target,
  TrendingUp,
  Star,
  Wand2,
  Moon,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import './CreateSessionPage.css';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ConceptItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rationale: string;
  recommendedAtmosphere: string;
  recommendedUsage: string;
  recommendedDuration: number;
  recommendedVoiceStyle: string;
}

// ── Deterministic category artwork ────────────────────────────────────────────
function getCategoryArtwork(category: string, index: number): React.ReactNode {
  const cat = (category || '').toLowerCase();

  const configs: Record<string, { bg: string; accent: string; icon: React.ReactNode }> = {
    focus:      { bg: 'rgba(37,99,235,0.22)',   accent: '#3b82f6', icon: <Target size={20} /> },
    wealth:     { bg: 'rgba(109,40,217,0.22)',  accent: '#8b5cf6', icon: <TrendingUp size={20} /> },
    confidence: { bg: 'rgba(251,191,36,0.15)',  accent: '#fbbf24', icon: <Star size={20} /> },
    creative:   { bg: 'rgba(236,72,153,0.18)',  accent: '#ec4899', icon: <Wand2 size={20} /> },
    peace:      { bg: 'rgba(56,189,248,0.15)',  accent: '#38bdf8', icon: <Moon size={20} /> },
    health:     { bg: 'rgba(16,185,129,0.18)',  accent: '#10b981', icon: <Zap size={20} /> },
    block:      { bg: 'rgba(244,63,94,0.15)',   accent: '#f43f5e', icon: <Shield size={20} /> },
  };

  const key = Object.keys(configs).find(k => cat.includes(k)) || '';
  const cfg = configs[key] || {
    bg: `rgba(${60 + (index * 37) % 120}, ${20 + (index * 53) % 80}, ${140 + (index * 29) % 100}, 0.2)`,
    accent: '#8b5cf6',
    icon: <Sparkles size={20} />
  };

  return (
    <div
      className="cs-card__artwork-inner"
      style={{ background: `radial-gradient(ellipse at 60% 50%, ${cfg.bg} 0%, rgba(6,7,19,0.6) 80%)` }}
    >
      {/* Orbital rings */}
      <svg style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
           width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="28" stroke={cfg.accent} strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="36" cy="36" r="16" stroke={cfg.accent} strokeWidth="0.75" opacity="0.6" />
        <circle cx="36" cy="36" r="5" fill={cfg.accent} opacity="0.7" />
        <circle cx="64" cy="36" r="3" fill={cfg.accent} opacity="0.8" />
      </svg>
      {/* Icon */}
      <div style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: 10,
        background: `${cfg.accent}22`, border: `1px solid ${cfg.accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.accent
      }}>
        {cfg.icon}
      </div>
    </div>
  );
}

// ── Concept Card ──────────────────────────────────────────────────────────────
interface ConceptCardProps {
  concept: ConceptItem;
  index: number;
  total: number;
  isSelected: boolean;
  isFirst: boolean;
  previewingAmbience: string | null;
  onChoose: (concept: ConceptItem) => void;
  onPreview: (atmosphere: string) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({
  concept, index, total, isSelected, isFirst,
  previewingAmbience, onChoose, onPreview
}) => {
  const isPreviewing = previewingAmbience === concept.recommendedAtmosphere;

  return (
    <div className={`cs-card ${isSelected ? 'cs-card--selected' : ''}`}>
      {/* Artwork strip */}
      <div className="cs-card__artwork">
        {getCategoryArtwork(concept.category, index)}
      </div>

      <div className="cs-card__body">
        {/* Top row: index / total, category badge, duration */}
        <div className="cs-card__toprow">
          <span className="cs-card__num">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span className="cs-card__category">{concept.category}</span>
          <span className="cs-card__duration">
            <Clock size={11} />
            {concept.recommendedDuration} min
          </span>
        </div>

        {/* Recommendation badge for first concept */}
        {isFirst && (
          <div className="cs-card__rec-badge">
            <Sparkles size={9} />
            ORBIT'S RECOMMENDATION
          </div>
        )}

        {/* Title */}
        <h3 className="cs-card__title">{concept.title}</h3>

        {/* Description */}
        <p className="cs-card__desc">{concept.description}</p>

        {/* Why selected */}
        {concept.rationale && (
          <div className="cs-card__why">
            <span className="cs-card__why-label">WHY ORBIT SELECTED THIS</span>
            <p className="cs-card__why-text">{concept.rationale}</p>
          </div>
        )}

        {/* Metadata grid */}
        <div className="cs-card__meta">
          <div className="cs-card__meta-item">
            <span className="cs-card__meta-label">
              <Waves size={11} />
              Atmosphere
            </span>
            <span className="cs-card__meta-val">{concept.recommendedAtmosphere}</span>
          </div>
          <div className="cs-card__meta-item">
            <span className="cs-card__meta-label">
              <Sliders size={11} />
              Usage
            </span>
            <span className="cs-card__meta-val">{concept.recommendedUsage}</span>
          </div>
          <div className="cs-card__meta-item">
            <span className="cs-card__meta-label">
              <Mic size={11} />
              Voice
            </span>
            <span className="cs-card__meta-val">{concept.recommendedVoiceStyle}</span>
          </div>
        </div>
      </div>

      {/* Footer: actions */}
      <div className="cs-card__footer">
        <button
          type="button"
          className={`cs-btn-preview ${isPreviewing ? 'cs-btn-preview--active' : ''}`}
          onClick={() => onPreview(concept.recommendedAtmosphere)}
          aria-label={isPreviewing ? 'Stop atmosphere preview' : 'Preview atmosphere'}
        >
          {isPreviewing ? (
            <><Pause size={13} /> Stop</>
          ) : (
            <><Volume2 size={13} /> Preview</>
          )}
        </button>

        <button
          type="button"
          className={`cs-btn-choose ${isSelected ? 'cs-btn-choose--chosen' : ''}`}
          onClick={() => onChoose(concept)}
          aria-pressed={isSelected}
        >
          {isSelected ? (
            <><CheckCircle2 size={14} /> Chosen</>
          ) : (
            <>Choose This Session <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const CreateSessionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { play } = usePlayer();

  // ── State (identical to original) ─────────────────────────────────────────
  const [onboardingId, setOnboardingId] = useState<string>(location.state?.onboardingId || '');
  const [answers, setAnswers] = useState<any>(location.state?.answers || null);
  const [concepts, setConcepts] = useState<ConceptItem[]>(location.state?.concepts || []);
  const [isLoading, setIsLoading] = useState<boolean>(!location.state?.concepts);

  const [selectedConcept, setSelectedConcept] = useState<ConceptItem | null>(null);

  const [previewingAmbience, setPreviewingAmbience] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);

  const [usageContext, setUsageContext] = useState<string>('Focus');
  const [ambienceTrackId, setAmbienceTrackId] = useState<string>('rain-light');
  const [frequencyOption, setFrequencyOption] = useState<string>('432');
  const [customFrequency, setCustomFrequency] = useState<string>('');
  const [ttsProvider, setTtsProvider] = useState<'elevenlabs' | 'azure'>('elevenlabs');
  const [voiceStyle, setVoiceStyle] = useState<string>('Calm');
  const [intensity, setIntensity] = useState<'Normal' | 'Soft' | 'Very Soft'>('Soft');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pipelineStatus, setPipelineStatus] = useState<string>('IDLE');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [completedSession, setCompletedSession] = useState<any | null>(null);

  // ── Load onboarding if navigated directly ─────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    if (!concepts.length) {
      setIsLoading(true);
      const savedId = localStorage.getItem('orbit_latest_onboarding_id');
      const fetchPromise = savedId ? api.getOnboarding(savedId) : api.getLatestOnboarding();

      fetchPromise
        .then((res: any) => {
          if (isMounted && res?.success) {
            setOnboardingId(res.onboardingId);
            setAnswers(res.answers);
            setConcepts(res.concepts || []);
          }
        })
        .catch((err) => {
          console.warn('[CreateSessionPage] Load onboarding error:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // ── Handlers (identical to original) ──────────────────────────────────────
  const handleChooseConcept = (concept: ConceptItem) => {
    setSelectedConcept(concept);
    setDurationMinutes(concept.recommendedDuration || 15);
    setIsCustomDuration(false);
    setUsageContext(concept.recommendedUsage || 'Focus');
    setVoiceStyle(concept.recommendedVoiceStyle || 'Calm');

    if (concept.recommendedAtmosphere?.includes('Window')) {
      setAmbienceTrackId('rain-window');
    } else if (concept.recommendedAtmosphere?.includes('Forest')) {
      setAmbienceTrackId('rain-lluvia');
    } else if (concept.recommendedAtmosphere?.includes('Brown')) {
      setAmbienceTrackId('noise-brown');
    } else if (concept.recommendedAtmosphere?.includes('Pink')) {
      setAmbienceTrackId('noise-pink');
    } else {
      setAmbienceTrackId('rain-light');
    }

    setTimeout(() => {
      document.getElementById('customization-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleToggleAtmospherePreview = (atmosphereName: string) => {
    if (previewingAmbience === atmosphereName) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingAmbience(null);
      return;
    }

    let audioSrc = '/media/ambience/rain/light-rain-ambient.mp3';
    if (atmosphereName.includes('Window')) audioSrc = '/media/ambience/rain/rain-on-the-window.mp3';
    if (atmosphereName.includes('Forest') || atmosphereName.includes('lluvia')) audioSrc = '/media/ambience/rain/lluvia-rain.mp3';

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
    }
    previewAudioRef.current.src = audioSrc;
    previewAudioRef.current.volume = 0.4;
    previewAudioRef.current.play().catch(console.warn);
    setPreviewingAmbience(atmosphereName);
  };

  const handleStartGeneration = async () => {
    if (!selectedConcept) return;

    setIsGenerating(true);
    setGenerationError(null);
    setPipelineStatus('GENERATING_SCRIPT');

    const effectiveDuration = isCustomDuration
      ? Math.max(1, parseInt(customDuration, 10) || 15)
      : durationMinutes;

    let frequencyHz: number | undefined = undefined;
    if (frequencyOption === 'Custom') {
      frequencyHz = parseInt(customFrequency, 10) || undefined;
    } else if (frequencyOption !== 'None') {
      frequencyHz = parseInt(frequencyOption, 10) || undefined;
    }

    let voiceId = 'bella';
    if (voiceStyle === 'Deep') voiceId = 'adam';
    if (voiceStyle === 'Warm') voiceId = 'antoni';
    if (voiceStyle === 'Neutral') voiceId = 'arnold';
    if (voiceStyle === 'Gentle') voiceId = 'bella';
    if (voiceStyle === 'Calm') voiceId = 'bella';

    const intensityMapped = intensity === 'Very Soft' ? 'subtle' : intensity === 'Soft' ? 'balanced' : 'prominent';

    try {
      const res: any = await api.createPersonalizedSession({
        concept: {
          title: selectedConcept.title,
          targetOutcome: selectedConcept.description,
          category: selectedConcept.category || answers?.desire || 'Focus'
        },
        answers: {
          ...(answers || {
            desiredOutcome: selectedConcept.category,
            desiredIdentity: selectedConcept.title,
            emotionalState: 'Calm, Centered',
            currentBlock: 'Overthinking',
            dailyAction: 'Consistent creative focus',
            category: selectedConcept.category
          }),
          onboardingId: onboardingId || undefined
        },
        settings: {
          durationMinutes: effectiveDuration,
          usageContext: usageContext.toLowerCase(),
          ambienceTrackId,
          frequencyHz,
          voiceId,
          ttsProvider,
          subliminalIntensity: intensityMapped
        }
      });

      if (!res?.success || !res?.session?._id) {
        throw new Error(res?.message || 'Failed to initialize session generation');
      }

      const sessionId = res.session._id;

      const pollInterval = setInterval(async () => {
        try {
          const pollRes: any = await api.getSession(sessionId);
          const s = pollRes?.session;
          if (!s) return;

          setPipelineStatus(s.status);

          if (s.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setCompletedSession(s);
          } else if (s.status === 'FAILED') {
            clearInterval(pollInterval);
            setGenerationError(s.error || 'Generation encountered an error. Please retry.');
          }
        } catch (err) {
          console.warn('[Poll Error]', err);
        }
      }, 2000);

    } catch (err: any) {
      console.error('[Generation Error]', err);
      setGenerationError(err.message || 'Error creating session');
      setPipelineStatus('FAILED');
    }
  };

  const handlePlayNow = () => {
    if (!completedSession) return;
    const track: SessionTrack = {
      id: completedSession._id,
      title: completedSession.title,
      creator: 'Orbit AI',
      category: completedSession.category || 'Manifestation',
      duration: completedSession.audio.durationSeconds,
      audioUrl: completedSession.audio.url,
      thumbnail: undefined,
      spokenAffirmations: completedSession.script?.affirmations || []
    };
    play(track);
    navigate('/subliminals');
  };

  // Helper: get pipeline step state
  const getPipelineStepClass = (stepStatus: string, afterStatuses: string[]) => {
    if (pipelineStatus === stepStatus) return 'cust-pipeline__step--active';
    if (afterStatuses.includes(pipelineStatus)) return 'cust-pipeline__step--done';
    return 'cust-pipeline__step--idle';
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="cs-loading">
        <div className="cs-loading__ring" />
        <p className="cs-loading__title">Retrieving Your Intention Profile…</p>
        <p className="cs-loading__sub">Connecting to Atlas</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cs-page">
      <div className="cs-inner">

        {/* ── Top Nav ─────────────────────────────────────────────────────── */}
        <div className="cs-topbar">
          <Link to="/onboarding" className="cs-back-link">
            <ArrowLeft size={14} />
            Back to Intention
          </Link>
        </div>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="cs-header">
          <div className="cs-header__badge">
            <Sparkles size={12} />
            PERSONALIZED SUBLIMINAL ARCHITECT
          </div>
          <h1 className="cs-header__title">YOUR ORBIT SESSIONS</h1>
          <p className="cs-header__sub">
            Based on what you shared, here are a few directions you can explore.
          </p>
        </div>

        {/* ── Intention Summary ────────────────────────────────────────────── */}
        {answers && (
          <div className="cs-intention">
            <div className="cs-intention__eyebrow">YOUR CURRENT DIRECTION</div>
            <div className="cs-intention__row">
              {answers.desire && (
                <div className="cs-intention__field">
                  <span className="cs-intention__key">Outcome</span>
                  <span className="cs-intention__val cs-intention__val--outcome">{answers.desire}</span>
                </div>
              )}
              {answers.identity && (
                <div className="cs-intention__field">
                  <span className="cs-intention__key">Identity</span>
                  <span className="cs-intention__val cs-intention__val--identity">{answers.identity}</span>
                </div>
              )}
              {answers.currentBlock && (
                <div className="cs-intention__field">
                  <span className="cs-intention__key">Releasing</span>
                  <span className="cs-intention__val cs-intention__val--block">{answers.currentBlock}</span>
                </div>
              )}
              {answers.action && (
                <div className="cs-intention__field">
                  <span className="cs-intention__key">Daily Action</span>
                  <span className="cs-intention__val">{answers.action}</span>
                </div>
              )}
            </div>
            {answers.feelings && (
              <div className="cs-intention__feelings">
                {answers.feelings.split(',').map((f: string) => f.trim()).filter(Boolean).map((tag: string) => (
                  <span key={tag} className="cs-intention__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Concepts ─────────────────────────────────────────────────────── */}
        <div>
          <div className="cs-section-header" style={{ marginBottom: '1.25rem' }}>
            <span className="cs-section-eyebrow">DIRECTIONS FOR YOUR SESSION</span>
            <h2 className="cs-section-title">Choose a Path</h2>
            <p className="cs-section-sub">
              ORBIT found these directions based on your intention, identity, and current focus.
            </p>
          </div>

          {/* Empty state */}
          {!isLoading && concepts.length === 0 && (
            <div className="cs-empty">
              <div className="cs-empty__icon">
                <Sparkles size={28} />
              </div>
              <h3 className="cs-empty__title">Your Next Direction</h3>
              <p className="cs-empty__text">
                Complete your intention questionnaire to let ORBIT build personalized session directions.
              </p>
              <Link to="/onboarding" className="cs-btn-action">
                <RefreshCw size={15} />
                Take Intention Questionnaire
              </Link>
            </div>
          )}

          {/* Skeleton loading */}
          {isLoading && (
            <div className="cs-skeleton-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="cs-skeleton-card" />
              ))}
            </div>
          )}

          {/* Real concept cards */}
          {concepts.length > 0 && (
            <div className="cs-grid">
              {concepts.map((concept, index) => (
                <ConceptCard
                  key={concept.id || index}
                  concept={concept}
                  index={index}
                  total={concepts.length}
                  isSelected={selectedConcept?.id === concept.id}
                  isFirst={index === 0}
                  previewingAmbience={previewingAmbience}
                  onChoose={handleChooseConcept}
                  onPreview={handleToggleAtmospherePreview}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Customization Panel ──────────────────────────────────────────── */}
        {selectedConcept && (
          <div id="customization-section" className="cust-panel">

            {/* Header */}
            <div className="cust-header">
              <div className="cust-eyebrow">MAKE IT YOURS</div>
              <h2 className="cust-title">{selectedConcept.title}</h2>
              <p className="cust-sub">Fine-tune every acoustic and subliminal parameter before generating your session.</p>
            </div>

            {/* 1. Duration */}
            <div>
              <div className="cust-label">
                <Clock size={14} style={{ color: '#67e8f9' }} />
                Duration
              </div>
              <div className="cust-chips">
                {[5, 10, 15, 20, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => { setDurationMinutes(mins); setIsCustomDuration(false); }}
                    className={`cust-chip cust-chip--cyan ${durationMinutes === mins && !isCustomDuration ? 'cust-chip--active' : ''}`}
                  >
                    {mins} min
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`cust-chip cust-chip--cyan ${isCustomDuration ? 'cust-chip--active' : ''}`}
                >
                  Custom
                </button>
              </div>
              {isCustomDuration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDuration}
                    onChange={e => setCustomDuration(e.target.value)}
                    placeholder="e.g. 25"
                    className="cust-input"
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>minutes</span>
                </div>
              )}
            </div>

            {/* 2. Usage */}
            <div>
              <div className="cust-label">
                <Sliders size={14} style={{ color: '#c4b5fd' }} />
                Usage Context
              </div>
              <div className="cust-chips">
                {['Morning', 'Daytime', 'Focus', 'Evening', 'Night', 'Sleep / Overnight', 'Repeat / Anytime'].map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUsageContext(u)}
                    className={`cust-chip ${usageContext === u ? 'cust-chip--active' : ''}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ambience */}
            <div>
              <div className="cust-label">
                <Waves size={14} style={{ color: '#6ee7b7' }} />
                Ambience
              </div>
              <div className="cust-ambience-grid">
                {[
                  { id: 'rain-light',  name: 'Gentle Rain',        desc: 'Soft soothing rainfall' },
                  { id: 'rain-window', name: 'Rain on the Window', desc: 'Warm intimate drops on glass' },
                  { id: 'rain-lluvia', name: 'Deep Forest Rain',   desc: 'Rich immersive shower' },
                  { id: 'noise-brown', name: 'Cosmic Brown Noise', desc: 'Warm low rumble for deep work' },
                  { id: 'noise-pink',  name: 'Pink Flow',          desc: 'Natural balanced breeze' }
                ].map(amb => (
                  <button
                    key={amb.id}
                    type="button"
                    onClick={() => setAmbienceTrackId(amb.id)}
                    className={`cust-ambience-card ${ambienceTrackId === amb.id ? 'cust-ambience-card--active' : ''}`}
                  >
                    <div className="cust-ambience-card__name">{amb.name}</div>
                    <div className="cust-ambience-card__desc">{amb.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Frequency */}
            <div>
              <div className="cust-label" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} style={{ color: '#fde68a' }} />
                  Frequency
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  subtle sine wave harmonic
                </span>
              </div>
              <div className="cust-chips">
                {['None', '432', '528', '639', '741', '852', 'Custom'].map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequencyOption(freq)}
                    className={`cust-chip cust-chip--amber ${frequencyOption === freq ? 'cust-chip--active' : ''}`}
                  >
                    {freq === 'None' || freq === 'Custom' ? freq : `${freq} Hz`}
                  </button>
                ))}
              </div>
              {frequencyOption === 'Custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem' }}>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    value={customFrequency}
                    onChange={e => setCustomFrequency(e.target.value)}
                    placeholder="e.g. 963"
                    className="cust-input"
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Hz</span>
                </div>
              )}
            </div>

            {/* 5–7. TTS, Voice, Intensity */}
            <div className="cust-settings-row">
              {/* TTS Provider */}
              <div className="cust-field">
                <div className="cust-label">TTS Provider</div>
                <div className="cust-chips" style={{ gap: '0.4rem' }}>
                  {[{ id: 'elevenlabs', label: 'ElevenLabs' }, { id: 'azure', label: 'Azure' }].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTtsProvider(p.id as any)}
                      className={`cust-chip ${ttsProvider === p.id ? 'cust-chip--active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Style */}
              <div className="cust-field">
                <div className="cust-label">
                  <Mic size={14} />
                  Voice Style
                </div>
                <select
                  value={voiceStyle}
                  onChange={e => setVoiceStyle(e.target.value)}
                  className="cust-select"
                >
                  {['Calm', 'Soft', 'Warm', 'Deep', 'Neutral', 'Gentle'].map(v => (
                    <option key={v} value={v}>{v} Voice</option>
                  ))}
                </select>
              </div>

              {/* Intensity */}
              <div className="cust-field">
                <div className="cust-label">Intensity</div>
                <div className="cust-chips" style={{ gap: '0.4rem' }}>
                  {(['Normal', 'Soft', 'Very Soft'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`cust-chip ${intensity === lvl ? 'cust-chip--active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generation pipeline progress */}
            {isGenerating && (
              <div className="cust-pipeline">
                <div className="cust-pipeline__head">
                  <h4 className="cust-pipeline__title">
                    <Sparkles size={16} style={{ color: '#67e8f9', animation: 'ob-pulse 2s ease-in-out infinite' }} />
                    Audio Pipeline Synthesis
                  </h4>
                  <span className="cust-pipeline__status">{pipelineStatus}</span>
                </div>

                <div className="cust-pipeline__steps">
                  <div className={`cust-pipeline__step ${getPipelineStepClass('GENERATING_SCRIPT', ['GENERATING_VOICE', 'MIXING_AUDIO', 'COMPLETED'])}`}>
                    <CheckCircle2 size={13} /> 1. Gemini Script
                  </div>
                  <div className={`cust-pipeline__step ${getPipelineStepClass('GENERATING_VOICE', ['MIXING_AUDIO', 'COMPLETED'])}`}>
                    <CheckCircle2 size={13} /> 2. {ttsProvider === 'azure' ? 'Azure' : 'ElevenLabs'} TTS
                  </div>
                  <div className={`cust-pipeline__step ${getPipelineStepClass('MIXING_AUDIO', ['COMPLETED'])}`}>
                    <CheckCircle2 size={13} /> 3. FFmpeg Mixer
                  </div>
                  <div className={`cust-pipeline__step ${getPipelineStepClass('COMPLETED', [])}`}>
                    <CheckCircle2 size={13} /> 4. Audio Ready
                  </div>
                </div>

                {generationError && (
                  <div className="cust-pipeline__error">
                    <AlertCircle size={14} />
                    {generationError}
                  </div>
                )}

                {pipelineStatus === 'COMPLETED' && (
                  <button type="button" className="cust-btn-play" onClick={handlePlayNow}>
                    <Play size={18} />
                    Play Now in Orbit
                  </button>
                )}
              </div>
            )}

            {/* Action bar */}
            {!isGenerating && (
              <div className="cust-action-bar">
                <button
                  type="button"
                  className="cust-btn-back"
                  onClick={() => setSelectedConcept(null)}
                >
                  <ArrowLeft size={14} />
                  Choose Another
                </button>
                <button
                  type="button"
                  className="cust-btn-generate"
                  onClick={handleStartGeneration}
                >
                  <Sparkles size={16} />
                  GENERATE SESSION
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSessionPage;
