import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer, SessionTrack } from '../context/PlayerContext';
import './SessionModesPage.css';

// ── Types ──────────────────────────────────────────────────────────
export interface ModeStep {
  title: string;
  durationMin: number;
  description: string;
}

export interface SessionModeDef {
  id: string;
  name: string;
  shortSubtitle: string;
  icon: string;
  colorAccent: string;
  gradientBg: string;
  defaultDurationMin: number;
  durationOptions: number[];
  frequencyCarrier: number;
  binauralBeat: number;
  brainwave: string;
  description: string;
  idealTimeOfDay: string;
  steps: ModeStep[];
  coreAffirmation: string;
  thumbnail: string;
}

export const SESSION_MODES: SessionModeDef[] = [
  {
    id: 'mode-morning',
    name: 'Morning Alignment',
    shortSubtitle: 'Intention setting & identity priming',
    icon: '☀️',
    colorAccent: '#f59e0b',
    gradientBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    defaultDurationMin: 10,
    durationOptions: [5, 10, 15],
    frequencyCarrier: 528,
    binauralBeat: 10.0,
    brainwave: 'Alpha (10 Hz)',
    idealTimeOfDay: 'Within 30 mins of waking',
    description:
      'Begin your day by claiming your state of consciousness before external inputs take hold. Blends uplifting 528 Hz transformation tones with a 10 Hz alpha wave to sharpen focus and ignite inspired enthusiasm.',
    coreAffirmation: 'I step into this day as the conscious architect of my reality.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    steps: [
      { title: 'Somatic Grounding', durationMin: 2, description: 'Deep box breathing to center the nervous system.' },
      { title: 'Identity Declaration', durationMin: 5, description: 'Feeling the reality of your core intention as already complete.' },
      { title: 'Aligned Action Anchor', durationMin: 3, description: 'Selecting your #1 physical needle-mover for today.' }
    ]
  },
  {
    id: 'mode-visualization',
    name: 'Deep Visualization',
    shortSubtitle: 'Subconscious reality immersion',
    icon: '👁️',
    colorAccent: '#8b5cf6',
    gradientBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    defaultDurationMin: 20,
    durationOptions: [15, 20, 30],
    frequencyCarrier: 432,
    binauralBeat: 6.0,
    brainwave: 'Theta (6 Hz)',
    idealTimeOfDay: 'Midday or late afternoon recharge',
    description:
      'A deep journey into 6.0 Hz theta consciousness where neuroplasticity peaks. Designed to bridge the gap between imagination and physical reality by embedding vivid emotional sensory anchors into your nervous system.',
    coreAffirmation: 'My desired reality is already alive and breathing in my current awareness.',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    steps: [
      { title: 'Parasympathetic Induction', durationMin: 4, description: 'Dropping critical factor defenses with progressive relaxation.' },
      { title: 'First-Person Sensory Immersion', durationMin: 12, description: 'Living through the sights, sounds, and emotions of your realized dream.' },
      { title: 'Cellular Gratitude Seal', durationMin: 4, description: 'Locking the emotional signature into somatic memory.' }
    ]
  },
  {
    id: 'mode-affirmation',
    name: 'Affirmation Immersion',
    shortSubtitle: 'Belief reprogramming & magnetics',
    icon: '🎙️',
    colorAccent: '#06b6d4',
    gradientBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    defaultDurationMin: 15,
    durationOptions: [10, 15, 25],
    frequencyCarrier: 639,
    binauralBeat: 7.83,
    brainwave: 'Schumann Resonance (7.83 Hz)',
    idealTimeOfDay: 'During morning walk or transition periods',
    description:
      'Immerse yourself in spoken affirmations tuned to 639 Hz heart coherence and the 7.83 Hz Earth Schumann Resonance. Neutralizes limiting internal dialogue and installs empowering core beliefs.',
    coreAffirmation: 'I am completely worthy of extraordinary prosperity, love, and joy.',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    steps: [
      { title: 'Receptive Induction', durationMin: 2, description: 'Opening subconscious channels through resonant acoustic chords.' },
      { title: 'Spoken Mantra Stream', durationMin: 10, description: 'Repeating present-tense declarations with deep emotional conviction.' },
      { title: 'Coherence Lock', durationMin: 3, description: 'Internal silent resonance to integrate new neural pathways.' }
    ]
  },
  {
    id: 'mode-powerhour',
    name: 'Aligned Action Power Hour',
    shortSubtitle: 'Binaural focus for physical execution',
    icon: '⚡',
    colorAccent: '#ec4899',
    gradientBg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    defaultDurationMin: 45,
    durationOptions: [25, 45, 60],
    frequencyCarrier: 396,
    binauralBeat: 14.0,
    brainwave: 'Beta / High Alpha (14 Hz)',
    idealTimeOfDay: 'Deep work sprint block',
    description:
      'Because manifestation without action is merely daydreaming. This mode pairs 14 Hz focus binaural beats with uninterrupted ambient soundscapes to support intense, single-task execution sprints.',
    coreAffirmation: 'I execute high-priority actions with absolute clarity and relentless momentum.',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    steps: [
      { title: 'Target Selection', durationMin: 2, description: 'Defining the single high-leverage task to conquer.' },
      { title: 'Deep Work Sprint', durationMin: 40, description: 'Unbroken, distraction-free creative or strategic execution.' },
      { title: 'Momentum Logging', durationMin: 3, description: 'Checking off completed aligned actions on your board.' }
    ]
  },
  {
    id: 'mode-evening',
    name: 'Evening Integration & Gratitude',
    shortSubtitle: 'Delta surrender & sleep handoff',
    icon: '🌙',
    colorAccent: '#6366f1',
    gradientBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    defaultDurationMin: 15,
    durationOptions: [10, 15, 30],
    frequencyCarrier: 174,
    binauralBeat: 2.0,
    brainwave: 'Delta (2 Hz)',
    idealTimeOfDay: 'In bed before sleep',
    description:
      'Surrender the day’s friction and hand your intentions over to the subconscious mind. Gentle 2 Hz delta pulses induce deep parasympathetic relaxation, guiding you smoothly into restorative slow-wave sleep.',
    coreAffirmation: 'I surrender today with peace. My sleep builds my future.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    steps: [
      { title: 'Daily Friction Release', durationMin: 3, description: 'Surrendering what did not happen and releasing mental tension.' },
      { title: '3-Point Felt Gratitude', durationMin: 6, description: 'Reliving 3 specific wins from the day with genuine gratitude.' },
      { title: 'Subconscious Sleep Handoff', durationMin: 6, description: 'Falling asleep steeped in the feeling of the desired wish fulfilled.' }
    ]
  }
];

export const SessionModesPage: React.FC = () => {
  const navigate = useNavigate();
  const player = usePlayer();

  const [activeModeId, setActiveModeId] = useState<string>('mode-morning');
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({
    'mode-morning': 10,
    'mode-visualization': 20,
    'mode-affirmation': 15,
    'mode-powerhour': 45,
    'mode-evening': 15
  });

  const activeMode = useMemo(() => {
    return SESSION_MODES.find((m) => m.id === activeModeId) || SESSION_MODES[0];
  }, [activeModeId]);

  const currentDuration = selectedDurations[activeMode.id] || activeMode.defaultDurationMin;

  const handleDurationChange = (modeId: string, durationMin: number) => {
    setSelectedDurations((prev) => ({ ...prev, [modeId]: durationMin }));
  };

  const handleLaunchMode = (mode: SessionModeDef) => {
    const chosenDuration = selectedDurations[mode.id] || mode.defaultDurationMin;
    const track: SessionTrack = {
      id: mode.id,
      title: `${mode.name} (${chosenDuration}m)`,
      creator: 'Orbit Sound Lab',
      thumbnail: mode.thumbnail,
      category: mode.name,
      duration: chosenDuration * 60,
      carrierFreq: mode.frequencyCarrier,
      binauralFreq: mode.binauralBeat,
      spokenAffirmations: [mode.coreAffirmation]
    };

    player.play(track);
    player.openFullscreen();
  };

  return (
    <div className="modes-page">
      {/* Page Header */}
      <header className="modes-header">
        <div className="modes-header__badge">Architecture of Awareness</div>
        <h1 className="modes-header__title">The 5 Session Modes</h1>
        <p className="modes-header__subtitle">
          Specific acoustic neuro-states matched to every phase of your daily manifestation practice.
          From morning identity priming to deep focus sprints and evening sleep handoffs.
        </p>
      </header>

      {/* Mode Selector Cards Grid */}
      <section className="modes-nav-grid" aria-label="Session modes navigation">
        {SESSION_MODES.map((mode) => {
          const isSelected = mode.id === activeModeId;
          const isPlaying = player.currentTrack?.id === mode.id && player.isPlaying;

          return (
            <button
              key={mode.id}
              className={`mode-nav-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setActiveModeId(mode.id)}
              style={{
                borderColor: isSelected ? mode.colorAccent : undefined,
                background: isSelected ? mode.gradientBg : undefined
              }}
              aria-pressed={isSelected}
            >
              <div className="mode-nav-card__top">
                <span className="mode-nav-card__icon" aria-hidden="true">{mode.icon}</span>
                {isPlaying && (
                  <span className="mode-nav-card__playing-dot" title="Currently Playing" />
                )}
              </div>
              <h2 className="mode-nav-card__name">{mode.name}</h2>
              <span className="mode-nav-card__freq">{mode.brainwave}</span>
            </button>
          );
        })}
      </section>

      {/* Active Mode Deep Dive Section */}
      <main className="mode-detail-card" style={{ borderColor: activeMode.colorAccent }}>
        <div className="mode-detail-card__header">
          <div className="mode-detail-card__tag-row">
            <span
              className="mode-detail-card__badge"
              style={{ background: `${activeMode.colorAccent}25`, color: activeMode.colorAccent }}
            >
              {activeMode.idealTimeOfDay}
            </span>
            <span className="mode-detail-card__badge mode-detail-card__badge--dim">
              Carrier: {activeMode.frequencyCarrier} Hz
            </span>
            <span className="mode-detail-card__badge mode-detail-card__badge--dim">
              Binaural: {activeMode.binauralBeat} Hz ({activeMode.brainwave})
            </span>
          </div>

          <h2 className="mode-detail-card__title">
            <span className="mode-icon-lg">{activeMode.icon}</span>
            {activeMode.name}
          </h2>
          <p className="mode-detail-card__desc">{activeMode.description}</p>
        </div>

        {/* Step Breakdown Timeline */}
        <section className="mode-timeline">
          <h3 className="mode-section-title">Session Flow & Protocol</h3>
          <div className="mode-steps-list">
            {activeMode.steps.map((step, idx) => (
              <div key={idx} className="mode-step-row">
                <div
                  className="mode-step-index"
                  style={{ background: `${activeMode.colorAccent}30`, color: activeMode.colorAccent }}
                >
                  {idx + 1}
                </div>
                <div className="mode-step-content">
                  <div className="mode-step-title-row">
                    <strong className="mode-step-name">{step.title}</strong>
                    <span className="mode-step-mins">{step.durationMin} min</span>
                  </div>
                  <p className="mode-step-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Identity Mantra */}
        <div
          className="mode-mantra-box"
          style={{
            borderLeftColor: activeMode.colorAccent,
            background: `${activeMode.colorAccent}10`
          }}
        >
          <span className="mode-mantra-label" style={{ color: activeMode.colorAccent }}>
            Core Identity Anchor:
          </span>
          <p className="mode-mantra-text">"{activeMode.coreAffirmation}"</p>
        </div>

        {/* Duration Picker & Launch Action */}
        <div className="mode-action-bar">
          <div className="mode-duration-picker">
            <span className="mode-duration-label">Select Session Length:</span>
            <div className="mode-duration-buttons">
              {activeMode.durationOptions.map((mins) => (
                <button
                  key={mins}
                  className={`duration-chip ${currentDuration === mins ? 'is-active' : ''}`}
                  onClick={() => handleDurationChange(activeMode.id, mins)}
                  style={{
                    borderColor: currentDuration === mins ? activeMode.colorAccent : undefined,
                    background: currentDuration === mins ? `${activeMode.colorAccent}25` : undefined
                  }}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div className="mode-action-buttons">
            <button
              className="mode-launch-btn"
              onClick={() => handleLaunchMode(activeMode)}
              style={{
                background: `linear-gradient(135deg, ${activeMode.colorAccent} 0%, #7c3aed 100%)`
              }}
              aria-label={`Begin ${activeMode.name} session for ${currentDuration} minutes`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Begin {currentDuration}m Session
            </button>

            <button
              className="mode-secondary-btn"
              onClick={() => navigate('/explore')}
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionModesPage;
