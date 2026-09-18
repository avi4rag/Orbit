import React, { useState, useEffect, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import './RitualPage.css';

// ── Types ──────────────────────────────────────────────────────────────
type RitualPhase = 'morning' | 'evening';
type StepStatus  = 'pending' | 'active' | 'done';

interface RitualStep {
  id: string;
  label: string;
  prompt: string;
  durationSec: number;
  emoji: string;
  status: StepStatus;
  userInput?: string;
}

// ── Ritual definitions ─────────────────────────────────────────────────
const MORNING_STEPS: RitualStep[] = [
  { id: 'gratitude',    label: 'Three Gratitudes',     emoji: '🙏', durationSec: 60,  status: 'pending', prompt: 'Name three things you are already grateful for — specific, personal, present tense.' },
  { id: 'identity',     label: 'Identity Statement',   emoji: '🌟', durationSec: 90,  status: 'pending', prompt: 'Who are you, right now, in your desired reality? Write it in first-person present tense.' },
  { id: 'vision',       label: 'Vivid Visualization',  emoji: '🌌', durationSec: 300, status: 'pending', prompt: 'Close your eyes. Inhabit your desired life for 5 minutes. What do you see, feel, hear?' },
  { id: 'affirmation',  label: 'Core Affirmation',     emoji: '⚡', durationSec: 60,  status: 'pending', prompt: 'Write your single most powerful affirmation — say it aloud 10 times as you write.' },
  { id: 'action',       label: 'Today\'s #1 Action',   emoji: '🎯', durationSec: 60,  status: 'pending', prompt: 'What is the ONE action today that moves you closer to your vision? Make it 100% controllable.' },
];

const EVENING_STEPS: RitualStep[] = [
  { id: 'wins',         label: 'Today\'s Wins',        emoji: '🏆', durationSec: 60,  status: 'pending', prompt: 'What did you do today that your future self would be proud of? Even small counts.' },
  { id: 'gratitude_e',  label: 'Evening Gratitude',    emoji: '🌙', durationSec: 60,  status: 'pending', prompt: 'What unexpected good happened today? Find gratitude in one moment you almost missed.' },
  { id: 'release',      label: 'Release & Let Go',     emoji: '💨', durationSec: 90,  status: 'pending', prompt: 'What worry, regret, or resistance are you choosing to release before sleep?' },
  { id: 'dream_set',    label: 'Dream Intention',      emoji: '✨', durationSec: 60,  status: 'pending', prompt: 'Set a sleep intention: what insight or feeling do you want to wake up with?' },
  { id: 'tomorrow',     label: 'Tomorrow\'s Identity', emoji: '🌅', durationSec: 60,  status: 'pending', prompt: 'Who do you wake up as tomorrow? Describe your morning self in one sentence.' },
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Component ──────────────────────────────────────────────────────────
const RitualPage: React.FC = () => {
  const player = usePlayer();
  const [phase, setPhase] = useState<RitualPhase>('morning');
  const [steps, setSteps] = useState<RitualStep[]>(MORNING_STEPS.map(s => ({ ...s })));
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [ritualComplete, setRitualComplete] = useState(false);
  const [streak, setStreak] = useState(7); // demo streak value
  const [inputVal, setInputVal] = useState('');

  const activeStep = currentIdx !== null ? steps[currentIdx] : null;

  // Auto-detect phase from time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const detectedPhase: RitualPhase = hour < 14 ? 'morning' : 'evening';
    setPhase(detectedPhase);
    setSteps((detectedPhase === 'morning' ? MORNING_STEPS : EVENING_STEPS).map(s => ({ ...s })));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isRunning, timeLeft]);

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (isRunning && timeLeft === 0 && currentIdx !== null) {
      markStepDone(currentIdx);
    }
  }, [timeLeft, isRunning, currentIdx]);

  const startStep = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setTimeLeft(steps[idx].durationSec);
    setIsRunning(true);
    setInputVal('');
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === idx ? 'active' : i < idx ? 'done' : 'pending',
    })));
  }, [steps]);

  const markStepDone = useCallback((idx: number) => {
    setIsRunning(false);
    setSteps(prev => {
      const next = prev.map((s, i) => i === idx
        ? { ...s, status: 'done' as StepStatus, userInput: inputVal }
        : s
      );
      // Check if all done
      if (next.every(s => s.status === 'done')) {
        setTimeout(() => setRitualComplete(true), 400);
      }
      return next;
    });
    const nextIdx = idx + 1;
    if (nextIdx < steps.length) {
      setTimeout(() => startStep(nextIdx), 800);
    } else {
      setCurrentIdx(null);
    }
  }, [inputVal, steps.length, startStep]);

  const beginRitual = () => startStep(0);

  const resetRitual = () => {
    setSteps((phase === 'morning' ? MORNING_STEPS : EVENING_STEPS).map(s => ({ ...s })));
    setCurrentIdx(null);
    setIsRunning(false);
    setRitualComplete(false);
    setTimeLeft(0);
    setInputVal('');
  };

  const switchPhase = (p: RitualPhase) => {
    setPhase(p);
    setSteps((p === 'morning' ? MORNING_STEPS : EVENING_STEPS).map(s => ({ ...s })));
    setCurrentIdx(null);
    setIsRunning(false);
    setRitualComplete(false);
    setTimeLeft(0);
  };

  const completedCount = steps.filter(s => s.status === 'done').length;
  const progress = (completedCount / steps.length) * 100;

  // Play ambient session when ritual starts
  const startAmbient = () => {
    player.play({
      id: phase === 'morning' ? 'morning-abundance' : 'sleep-delta-2hz',
      title: phase === 'morning' ? 'Morning Ritual Ambient' : 'Evening Ritual Ambient',
      creator: 'Orbit',
      thumbnail: phase === 'morning'
        ? 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80'
        : 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&q=80',
      category: phase,
      duration: 1800,
      binauralFreq: phase === 'morning' ? 18 : 2,
      carrierFreq: phase === 'morning' ? 741 : 100,
      spokenAffirmations: phase === 'morning'
        ? ['I am already living my vision.', 'Today I act with purpose.', 'I attract what I consistently work toward.']
        : ['I release today with gratitude.', 'I rest deeply and wake renewed.', 'Peace is my natural state.'],
    });
  };

  return (
    <div className={`ritual ritual--${phase}`}>
      {/* Header */}
      <section className="ritual__header" aria-labelledby="ritual-heading">
        <div className="ritual__header-inner">

          {/* Phase switcher */}
          <div className="ritual__phase-toggle" role="group" aria-label="Ritual phase">
            <button
              className={`ritual__phase-btn ${phase === 'morning' ? 'is-active' : ''}`}
              onClick={() => switchPhase('morning')}
              aria-pressed={phase === 'morning'}
            >
              🌅 Morning Launch
            </button>
            <button
              className={`ritual__phase-btn ${phase === 'evening' ? 'is-active' : ''}`}
              onClick={() => switchPhase('evening')}
              aria-pressed={phase === 'evening'}
            >
              🌙 Evening Reflection
            </button>
          </div>

          <h1 id="ritual-heading" className="ritual__title">
            {phase === 'morning' ? 'Identity Launch Protocol' : 'Gratitude & Release Protocol'}
          </h1>
          <p className="ritual__subtitle">
            {phase === 'morning'
              ? '5 steps · ~10 min · Wire the belief before the world gets in.'
              : '5 steps · ~6 min · Close the loop. Release the resistance. Rest restored.'}
          </p>

          {/* Streak badge */}
          <div className="ritual__streak" aria-label={`Current streak: ${streak} days`}>
            🔥 {streak} day streak
          </div>
        </div>
      </section>

      <div className="ritual__body">
        {/* Left — step list */}
        <aside className="ritual__steps-panel" aria-label="Ritual steps">
          <nav aria-label="Step progress">
            <ol className="ritual__step-list">
              {steps.map((step, i) => (
                <li
                  key={step.id}
                  className={`ritual__step ritual__step--${step.status} ${currentIdx === i ? 'is-current' : ''}`}
                  aria-current={currentIdx === i ? 'step' : undefined}
                >
                  <div className="ritual__step-icon" aria-hidden="true">
                    {step.status === 'done' ? '✓' : step.emoji}
                  </div>
                  <div className="ritual__step-meta">
                    <span className="ritual__step-label">{step.label}</span>
                    <span className="ritual__step-duration">{formatTime(step.durationSec)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Progress bar */}
          <div
            className="ritual__progress-wrap"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Ritual progress: ${completedCount} of ${steps.length} steps done`}
          >
            <div className="ritual__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="ritual__progress-label">
            {completedCount} / {steps.length} steps complete
          </p>
        </aside>

        {/* Right — active step workspace */}
        <main className="ritual__workspace">
          {ritualComplete ? (
            <div className="ritual__complete" role="status" aria-live="polite">
              <div className="ritual__complete-icon" aria-hidden="true">✨</div>
              <h2 className="ritual__complete-title">
                {phase === 'morning' ? 'You are launched.' : 'You are restored.'}
              </h2>
              <p className="ritual__complete-body">
                {phase === 'morning'
                  ? 'Your identity is set. Your action is clear. Go build the life you just visualized.'
                  : 'The day is closed with gratitude. Rest now — you showed up.'}
              </p>
              <div className="ritual__complete-actions">
                <button className="ritual__complete-btn ritual__complete-btn--primary" onClick={resetRitual}>
                  Run Again
                </button>
                <button
                  className="ritual__complete-btn ritual__complete-btn--secondary"
                  onClick={() => switchPhase(phase === 'morning' ? 'evening' : 'morning')}
                >
                  Switch to {phase === 'morning' ? '🌙 Evening' : '🌅 Morning'}
                </button>
              </div>
            </div>
          ) : currentIdx === null ? (
            <div className="ritual__start-panel">
              <div className="ritual__start-icon" aria-hidden="true">
                {phase === 'morning' ? '🌅' : '🌙'}
              </div>
              <h2 className="ritual__start-title">Ready to begin?</h2>
              <p className="ritual__start-body">
                Each step has a guided timer. You can write your reflections directly here.
                Ambient {phase === 'morning' ? 'activation' : 'relaxation'} music will play automatically.
              </p>
              <div className="ritual__start-actions">
                <button
                  className="ritual__start-btn"
                  onClick={() => { beginRitual(); startAmbient(); }}
                  aria-label={`Begin ${phase} ritual`}
                >
                  ✦ Begin Ritual
                </button>
              </div>
            </div>
          ) : activeStep ? (
            <div className="ritual__active-step" aria-label={`Active step: ${activeStep.label}`}>
              {/* Step header */}
              <div className="ritual__active-header">
                <span className="ritual__active-emoji" aria-hidden="true">{activeStep.emoji}</span>
                <div>
                  <h2 className="ritual__active-title">{activeStep.label}</h2>
                  <p className="ritual__active-step-num">
                    Step {(currentIdx ?? 0) + 1} of {steps.length}
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="ritual__timer" aria-live="polite" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
                <svg className="ritual__timer-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="ritual__timer-bg" cx="50" cy="50" r="44" />
                  <circle
                    className="ritual__timer-progress"
                    cx="50" cy="50" r="44"
                    style={{
                      strokeDashoffset: 276.46 * (1 - timeLeft / activeStep.durationSec),
                    }}
                  />
                </svg>
                <span className="ritual__timer-display">{formatTime(timeLeft)}</span>
              </div>

              {/* Prompt */}
              <div className="ritual__prompt">
                <p className="ritual__prompt-text">{activeStep.prompt}</p>
              </div>

              {/* Journal input */}
              <div className="ritual__input-wrap">
                <label className="ritual__input-label" htmlFor="ritual-journal">
                  Your reflection:
                </label>
                <textarea
                  id="ritual-journal"
                  className="ritual__textarea"
                  rows={4}
                  placeholder="Write freely. No judgment. Present tense. First person…"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  aria-label="Step reflection journal"
                />
              </div>

              {/* Controls */}
              <div className="ritual__controls">
                <button
                  className="ritual__ctrl-btn ritual__ctrl-btn--pause"
                  onClick={() => setIsRunning(r => !r)}
                  aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
                  aria-pressed={!isRunning}
                >
                  {isRunning ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button
                  className="ritual__ctrl-btn ritual__ctrl-btn--done"
                  onClick={() => markStepDone(currentIdx!)}
                  aria-label="Mark step complete and continue"
                >
                  Done ✓
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default RitualPage;
