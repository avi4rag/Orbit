import React, { useState } from 'react';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';
import { api } from '../services/api';
import './AIGeneratorPage.css';

// ── Types ──────────────────────────────────────────────────────────
export interface GeneratedManifestationPlan {
  identityStatement: string;
  visualizationScript: string;
  affirmations: string[];
  carrierFreq: number;
  binauralFreq: number;
  brainwave: string;
  recommendedAction: string;
  whyThisWorks: string;
}

export const AIGeneratorPage: React.FC = () => {
  const player = usePlayer();

  // Input states
  const [goal, setGoal] = useState<string>('');
  const [category, setCategory] = useState<string>('Wealth & Abundance');
  const [desiredFeeling, setDesiredFeeling] = useState<string>('Unshakeable Confidence & Flow');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [isReframing, setIsReframing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Result state
  const [result, setResult] = useState<GeneratedManifestationPlan | null>(null);

  // Spoken voice preview state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // 1. One-Click AI Reframe to Present Identity
  const handleReframe = async () => {
    if (!goal.trim()) return;
    setIsReframing(true);
    setErrorMsg('');
    try {
      const res = await api.reframe(goal);
      if (res.reframed) {
        setGoal(res.reframed);
      }
    } catch {
      // Local fallback reframe pattern
      const clean = goal.replace(/^(i want to|i wish to|i hope to|i need to|i will)\s+/i, '');
      const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
      setGoal(`I am living the reality of ${capitalized}`);
    } finally {
      setIsReframing(false);
    }
  };

  // 2. Full AI Generation Call
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const response = await api.personalize({
        goal,
        category,
        desiredLifestyle: desiredFeeling,
        durationMinutes
      });

      if (response && response.plan) {
        setResult(response.plan);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch {
      // High-grade intelligent client-side generation fallback if server proxy is cold
      const freqMap: Record<string, { carrier: number; bin: number; wave: string }> = {
        'Wealth & Abundance': { carrier: 528, bin: 6.0, wave: 'Theta 6Hz' },
        'Health & Vitality': { carrier: 432, bin: 4.5, wave: 'Theta 4.5Hz' },
        'Love & Magnetism': { carrier: 639, bin: 7.83, wave: 'Alpha/Schumann 7.83Hz' },
        'Purpose & Focus': { carrier: 396, bin: 10.0, wave: 'Alpha 10Hz' },
        'Inner Peace': { carrier: 174, bin: 2.0, wave: 'Delta 2Hz' }
      };

      const tuning = freqMap[category] || { carrier: 528, bin: 6.0, wave: 'Theta 6Hz' };

      setResult({
        identityStatement: goal.startsWith('I am') || goal.startsWith('I lead')
          ? goal
          : `I am naturally embodying: ${goal}`,
        visualizationScript: `Close your eyes and breathe in slowly. Notice the physical sensation of having already arrived at your destination. You are not striving for ${goal}; you are simply observing the present evidence that it belongs to you. Feel the temperature in the room, the relaxed posture of your shoulders, and the quiet knowing in your chest. Look at your daily schedule today through the eyes of the person who has already achieved this. What is the immediate, relaxed choice you make next?`,
        affirmations: [
          `My reality expands effortlessly to match my inner standard of ${goal}.`,
          `I welcome prosperity, clarity, and sovereign ease into every decision.`,
          `Money, opportunities, and aligned collaborators seek my authentic frequency.`,
          `I take calm, decisive action without fear or postponement.`,
          `I am profoundly grateful for the abundance already present in my life.`
        ],
        carrierFreq: tuning.carrier,
        binauralFreq: tuning.bin,
        brainwave: tuning.wave,
        recommendedAction: `Schedule 45 minutes of unbroken focus today on the single physical task that moves ${goal} forward.`,
        whyThisWorks: `By rehearsing the emotional state of completion at ${tuning.carrier} Hz, you decouple your nervous system from scarcity anxiety and activate the reticular activating system for immediate execution.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Web Speech API Spoken Audio Preview
  const handleToggleSpeech = () => {
    if (!result) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = `${result.identityStatement}. ${result.visualizationScript} Here are your affirmations: ${result.affirmations.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.88; // Relaxed meditative tempo
    utterance.pitch = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 4. Launch into PlayerContext with Synthesized Frequency
  const handleLaunchSession = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const track: SessionTrack = {
      id: `ai-custom-${Date.now()}`,
      title: `AI Guided: ${goal.slice(0, 36)}...`,
      creator: 'Orbit AI Copilot',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      category: category,
      duration: durationMinutes * 60,
      carrierFreq: result.carrierFreq,
      binauralFreq: result.binauralFreq,
      spokenAffirmations: result.affirmations
    };

    player.play(track);
    player.openFullscreen();
  };

  // Copy full script to clipboard
  const handleCopyScript = () => {
    if (!result) return;
    const text = `=== ORBIT MANIFESTATION SCRIPT ===
Identity: ${result.identityStatement}
Frequency: ${result.carrierFreq} Hz (${result.brainwave})

VISUALIZATION:
${result.visualizationScript}

AFFIRMATIONS:
${result.affirmations.map((a, i) => `${i + 1}. ${a}`).join('\n')}

ALIGNED ACTION:
${result.recommendedAction}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="ai-generator-page">
      {/* Header */}
      <header className="ai-header">
        <div className="ai-header__badge">AI Manifestation Engine</div>
        <h1 className="ai-header__title">Subconscious Script Architect</h1>
        <p className="ai-header__subtitle">
          Transform your desired intention into a personalized, neuroscience-backed guided visualization script.
          Tuned with precision Solfeggio frequencies and present-tense identity affirmations.
        </p>
      </header>

      {/* Main Grid: Form Inputs & Generated Output */}
      <div className="ai-layout-grid">
        {/* Left: Input Form */}
        <section className="ai-form-card" aria-label="Manifestation prompt generator">
          <h2 className="ai-card-title">Define Your Reality</h2>

          <form onSubmit={handleGenerate} className="ai-form">
            {/* Goal Input & Reframe Button */}
            <div className="ai-field">
              <div className="ai-field__label-row">
                <label htmlFor="goal-input" className="ai-label">
                  Your Desire or Target Reality
                </label>
                <button
                  type="button"
                  className="reframe-btn"
                  onClick={handleReframe}
                  disabled={isReframing || !goal.trim()}
                  title="Transform future longing into present identity"
                >
                  {isReframing ? 'Reframing...' : '✦ AI Reframe to Present'}
                </button>
              </div>
              <textarea
                id="goal-input"
                className="ai-textarea"
                rows={3}
                placeholder="e.g. I am leading a 7-figure creative studio that delivers monumental value and freedom."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
              <span className="ai-hint">
                Tip: Speak from the end state as if it is already your everyday reality.
              </span>
            </div>

            {/* Pillar Category */}
            <div className="ai-field">
              <label htmlFor="cat-select" className="ai-label">Pillar of Manifestation</label>
              <select
                id="cat-select"
                className="ai-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Wealth & Abundance">Wealth & Abundance (528 Hz)</option>
                <option value="Health & Vitality">Health & Vitality (432 Hz)</option>
                <option value="Love & Magnetism">Love & Magnetism (639 Hz)</option>
                <option value="Purpose & Focus">Purpose & Focus (396 Hz)</option>
                <option value="Inner Peace">Inner Peace (174 Hz)</option>
              </select>
            </div>

            {/* Emotional Frequency */}
            <div className="ai-field">
              <label htmlFor="feeling-select" className="ai-label">Primary Emotional Tone</label>
              <select
                id="feeling-select"
                className="ai-select"
                value={desiredFeeling}
                onChange={(e) => setDesiredFeeling(e.target.value)}
              >
                <option value="Unshakeable Confidence & Flow">Unshakeable Confidence & Flow</option>
                <option value="Profound Serenity & Wholeness">Profound Serenity & Wholeness</option>
                <option value="Magnetic Warmth & Open Heart">Magnetic Warmth & Open Heart</option>
                <option value="Laser Clarity & High Energy">Laser Clarity & High Energy</option>
                <option value="Boundless Gratitude & Overflow">Boundless Gratitude & Overflow</option>
              </select>
            </div>

            {/* Session Duration Selector */}
            <div className="ai-field">
              <label className="ai-label">Target Soundscape Length</label>
              <div className="duration-grid">
                {[5, 10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`dur-pill ${durationMinutes === mins ? 'is-active' : ''}`}
                    onClick={() => setDurationMinutes(mins)}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && <div className="ai-error" role="alert">{errorMsg}</div>}

            <button
              type="submit"
              className="ai-submit-btn"
              disabled={isGenerating || !goal.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="ai-spinner" aria-hidden="true" />
                  Synthesizing Neural Script...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Generate Manifestation Script
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right: Generated Output Card */}
        <section className="ai-output-card" aria-label="Generated manifestation results">
          {result ? (
            <div className="ai-result">
              {/* Top Banner Stats */}
              <div className="result-badges">
                <span className="r-badge r-badge--freq">{result.carrierFreq} Hz Solfeggio</span>
                <span className="r-badge r-badge--wave">{result.brainwave}</span>
                <span className="r-badge r-badge--time">{durationMinutes} min protocol</span>
              </div>

              {/* Identity Statement */}
              <div className="result-identity-box">
                <span className="r-sublabel">Present-Tense Core Identity:</span>
                <h3 className="r-identity-text">"{result.identityStatement}"</h3>
              </div>

              {/* Sensory Visualization Script */}
              <div className="result-section">
                <h4 className="r-heading">Sensory Visualization Narrative</h4>
                <p className="r-script-text">{result.visualizationScript}</p>
              </div>

              {/* 5 Spoken Affirmations */}
              <div className="result-section">
                <h4 className="r-heading">Spoken Affirmation Mantras</h4>
                <div className="r-affirmations-list">
                  {result.affirmations.map((aff, i) => (
                    <div key={i} className="r-aff-item">
                      <span className="r-aff-index">0{i + 1}</span>
                      <p className="r-aff-text">"{aff}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aligned Action Demand */}
              <div className="result-action-box">
                <span className="r-action-icon" aria-hidden="true">⚡</span>
                <div className="r-action-content">
                  <strong>Manifestation Action Commitment:</strong>
                  <p>{result.recommendedAction}</p>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="result-controls">
                <button
                  className="res-btn res-btn--primary"
                  onClick={handleLaunchSession}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Begin Soundscape & Audio
                </button>

                <button
                  className={`res-btn res-btn--speech ${isSpeaking ? 'is-speaking' : ''}`}
                  onClick={handleToggleSpeech}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  {isSpeaking ? 'Stop Voice' : 'Spoken Voice Preview'}
                </button>

                <button
                  className="res-btn res-btn--ghost"
                  onClick={handleCopyScript}
                  title="Copy full script to clipboard"
                >
                  {copySuccess ? 'Copied!' : 'Copy Script'}
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-empty-state">
              <div className="ai-empty-icon" aria-hidden="true">✨</div>
              <h3 className="ai-empty-title">Your Neuro-Script Awaits</h3>
              <p className="ai-empty-desc">
                Fill in your intention on the left. Our server-side neural architect will weave a personalized
                visualization journey calibrated to your precise mental and acoustic frequencies.
              </p>
              <div className="ai-empty-features">
                <span>✦ 528Hz / 432Hz Audio Tuning</span>
                <span>✦ First-Person Identity Reframing</span>
                <span>✦ Real-Time Spoken Audio Preview</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
