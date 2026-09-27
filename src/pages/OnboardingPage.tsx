import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Brain,
  CheckCircle2,
  AlertCircle,
  Compass,
  Flame,
  Zap,
  Shield,
  Layers,
  Target,
  TrendingUp,
  Star,
  Wand2,
  Moon,
  Heart,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './OnboardingPage.css';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OptionCardProps {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: (value: string) => void;
}

// ── Reusable Option Card ──────────────────────────────────────────────────────
const OptionCard: React.FC<OptionCardProps> = ({ value, label, sublabel, icon, selected, onSelect }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    className={`ob-option-card ${selected ? 'ob-option-card--selected' : ''}`}
    onClick={() => onSelect(value)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(value); } }}
  >
    <div className="ob-option-card__check">
      {selected ? <Check size={11} strokeWidth={3} /> : null}
    </div>
    {icon && (
      <div className={`ob-option-card__icon ${selected ? 'ob-option-card__icon--selected' : ''}`}>
        {icon}
      </div>
    )}
    <div className="ob-option-card__body">
      <span className="ob-option-card__label">{label}</span>
      {sublabel && <span className="ob-option-card__sublabel">{sublabel}</span>}
    </div>
  </button>
);

// ── Feeling Chip ──────────────────────────────────────────────────────────────
interface FeelingChipProps {
  tag: string;
  selected: boolean;
  onToggle: (tag: string) => void;
}

const FeelingChip: React.FC<FeelingChipProps> = ({ tag, selected, onToggle }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={selected}
    className={`ob-feeling-chip ${selected ? 'ob-feeling-chip--selected' : ''}`}
    onClick={() => onToggle(tag)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(tag); } }}
  >
    {selected && <Check size={10} strokeWidth={3} className="ob-feeling-chip__check" />}
    {tag}
  </button>
);

// ── Suggestion Pill ───────────────────────────────────────────────────────────
interface SuggestionPillProps {
  text: string;
  onClick: () => void;
}

const SuggestionPill: React.FC<SuggestionPillProps> = ({ text, onClick }) => (
  <button type="button" className="ob-suggestion-pill" onClick={onClick}>
    {text.length > 40 ? text.slice(0, 38) + '…' : text}
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  // ── State (identical to original — no logic changes) ──────────────────────
  const [step, setStep] = useState(1);
  const [desire, setDesire] = useState('Focus & Productivity');
  const [specificIntention, setSpecificIntention] = useState(
    'I want to develop unshakable mental clarity and consistent creative momentum.'
  );
  const [identity, setIdentity] = useState('A focused and disciplined creator.');
  const [feelings, setFeelings] = useState('Focused, Calm, Confident, Energized');
  const [currentBlock, setCurrentBlock] = useState('Overthinking');
  const [action, setAction] = useState('Consistently working on meaningful projects.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // For enter-animation between steps
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleFeeling = (tag: string) => {
    const currentList = feelings.split(',').map(s => s.trim()).filter(Boolean);
    let updated: string[];
    if (currentList.includes(tag)) {
      updated = currentList.filter(s => s !== tag);
    } else {
      updated = [...currentList, tag];
    }
    setFeelings(updated.join(', '));
  };

  const currentFeelingsList = feelings.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const validateStep = (): boolean => {
    switch (step) {
      case 1: if (!desire.trim()) { setValidationMsg('Choose or describe your desired outcome to continue.'); return false; } break;
      case 2: if (!specificIntention.trim()) { setValidationMsg('Share your specific intention to continue.'); return false; } break;
      case 3: if (!identity.trim()) { setValidationMsg('Describe who you become to continue.'); return false; } break;
      case 4: if (!feelings.trim()) { setValidationMsg('Select at least one feeling to continue.'); return false; } break;
      case 5: if (!currentBlock.trim()) { setValidationMsg('Name the block you\'re releasing to continue.'); return false; } break;
      case 6: if (!action.trim()) { setValidationMsg('Define your anchoring action to continue.'); return false; } break;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMessage(null);
    setValidationMsg(null);
    if (!validateStep()) return;
    if (step < 6) {
      setAnimDir('forward');
      setAnimKey(k => k + 1);
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteQuestions();
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setValidationMsg(null);
    if (step > 1) {
      setAnimDir('back');
      setAnimKey(k => k + 1);
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteQuestions = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      desire: desire.trim() || 'Focus & Productivity',
      specificIntention: specificIntention.trim() || 'Unshakable mental clarity and creative momentum.',
      identity: identity.trim() || 'A focused and disciplined creator.',
      feelings: feelings.trim() || 'Focused, Calm, Confident, Energized',
      currentBlock: currentBlock.trim() || 'Overthinking',
      action: action.trim() || 'Consistently working on meaningful projects.'
    };

    console.log('[Onboarding] Submitting answers to backend:', payload);

    try {
      const res: any = await api.submitOnboarding(payload);
      console.log('[Onboarding] Server response:', res);

      if (res?.success && res.onboardingId) {
        localStorage.setItem('orbit_latest_onboarding_id', res.onboardingId);
        const userId = user?.id || user?.email || 'current';
        localStorage.setItem(`orbit_onboarded_${userId}`, 'true');
        updateUserLocal({ onboarded: true });

        navigate('/subliminals/create', {
          state: {
            onboardingId: res.onboardingId,
            answers: res.answers || payload,
            concepts: res.concepts || []
          }
        });
      } else {
        throw new Error(res?.message || 'Failed to save onboarding answers on the server');
      }
    } catch (err: any) {
      console.error('[Onboarding] Submission failed:', err);
      setErrorMessage(
        err.message ||
          'Failed to save onboarding answers. Check that the server is running on port 4000 and connected to MongoDB.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Outcome', 'Intention', 'Identity', 'Feelings', 'Block', 'Action'];
  const progressPercent = ((step - 1) / (stepLabels.length - 1)) * 100;

  // ── Loading Screen ─────────────────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="ob-container">
        <div className="ob-loading">
          <div className="ob-loading__spinner">
            <div className="ob-loading__ring" />
            <Sparkles size={32} className="ob-loading__icon" />
          </div>
          <h2 className="ob-loading__title">Synthesizing Your Neural Architecture</h2>
          <p className="ob-loading__subtitle">
            Saving answers &amp; generating personalized session concepts…
          </p>
          <div className="ob-loading__pulse">
            <span className="ob-loading__dot" />
            Connecting to Orbit Intention Engine
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="ob-container">
      {/* Ambient background glows */}
      <div className="ob-glow ob-glow--1" />
      <div className="ob-glow ob-glow--2" />
      <div className="ob-glow ob-glow--3" />

      <div className="ob-wrapper">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <header className="ob-header">
          <div className="ob-header__badge">
            <Sparkles size={12} />
            <span>ORBIT INTENTION CALIBRATION</span>
          </div>
          <h1 className="ob-header__title">Architect Your New Reality</h1>
          <p className="ob-header__subtitle">
            Six precise questions to map your subconscious landscape and generate custom subliminal soundscapes.
          </p>
        </header>

        {/* ── Progress Stepper ─────────────────────────────────────────────── */}
        <div
          className="ob-progress"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={6}
          aria-label={`Step ${step} of 6: ${stepLabels[step - 1]}`}
        >
          {/* Track */}
          <div className="ob-progress__track">
            <div className="ob-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Step nodes */}
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <button
                key={label}
                type="button"
                className={`ob-progress__step ${isActive ? 'ob-progress__step--active' : ''} ${isCompleted ? 'ob-progress__step--done' : ''}`}
                onClick={() => { if (stepNum < step) { setAnimDir('back'); setAnimKey(k => k + 1); setStep(stepNum); } }}
                aria-label={`${isCompleted ? 'Go back to' : ''} Step ${stepNum}: ${label}`}
                disabled={stepNum > step}
              >
                <div className="ob-progress__dot">
                  {isCompleted
                    ? <Check size={11} strokeWidth={3} />
                    : <span>{String(stepNum).padStart(2, '0')}</span>
                  }
                </div>
                <span className="ob-progress__label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="ob-error-banner" role="alert">
            <AlertCircle size={18} className="ob-error-banner__icon" />
            <div>
              <div className="ob-error-banner__title">Submission error</div>
              <div className="ob-error-banner__body">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* ── Question Card ─────────────────────────────────────────────────── */}
        <div
          ref={cardRef}
          key={animKey}
          className={`ob-card ob-card--anim-${animDir}`}
        >

          {/* ── STEP 1: Desired Outcome ────────────────────────────────────── */}
          {step === 1 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--cyan">
                  <Compass size={13} />
                  <span>QUESTION 01 · DESIRED OUTCOME</span>
                </div>
                <h2 className="ob-step__question">What reality are you choosing to manifest?</h2>
                <p className="ob-step__hint">Select your primary domain of focus, or type your custom outcome below.</p>
              </div>

              <div className="ob-option-grid ob-option-grid--3">
                {([
                  { value: 'Focus & Productivity', label: 'Focus & Productivity', sublabel: 'Clarity · Deep Work', icon: <Target size={18} /> },
                  { value: 'Wealth & Abundance',   label: 'Wealth & Abundance',   sublabel: 'Growth · Prosperity', icon: <TrendingUp size={18} /> },
                  { value: 'Confidence & Presence', label: 'Confidence & Presence', sublabel: 'Radiance · Magnetism', icon: <Star size={18} /> },
                  { value: 'Creative Mastery',     label: 'Creative Mastery',     sublabel: 'Vision · Expression', icon: <Wand2 size={18} /> },
                  { value: 'Deep Peace & Stillness', label: 'Deep Peace & Stillness', sublabel: 'Calm · Stillness', icon: <Moon size={18} /> },
                  { value: 'Health & Vitality',    label: 'Health & Vitality',    sublabel: 'Energy · Radiance', icon: <Zap size={18} /> },
                ] as const).map(opt => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    icon={opt.icon}
                    selected={desire === opt.value}
                    onSelect={setDesire}
                  />
                ))}
              </div>

              <div className="ob-field">
                <label className="ob-field__label" htmlFor="custom-desire">
                  Custom outcome or refinement
                </label>
                <input
                  id="custom-desire"
                  type="text"
                  value={desire}
                  onChange={e => setDesire(e.target.value)}
                  className="ob-input"
                  placeholder="e.g. Magnetic confidence, financial freedom, deep creative flow…"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Specific Intention ─────────────────────────────────── */}
          {step === 2 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--purple">
                  <Brain size={13} />
                  <span>QUESTION 02 · SPECIFIC INTENTION</span>
                </div>
                <h2 className="ob-step__question">What is your specific intention?</h2>
                <p className="ob-step__hint">Define the exact tangible breakthrough or shift you want this audio to anchor.</p>
              </div>

              <div className="ob-field">
                <textarea
                  id="specific-intention"
                  value={specificIntention}
                  onChange={e => setSpecificIntention(e.target.value)}
                  rows={4}
                  className="ob-textarea"
                  placeholder="e.g. I want to develop unshakable mental clarity and consistent creative momentum."
                />
              </div>

              <div className="ob-suggestions">
                <span className="ob-suggestions__label">Suggestions</span>
                {[
                  'I want to develop unshakable mental clarity and consistent creative momentum.',
                  'I want to attract sovereign wealth and elevate my standard of living effortlessly.',
                  'I want to dissolve all social anxiety and command calm magnetic respect.'
                ].map((sug, i) => (
                  <SuggestionPill key={i} text={sug} onClick={() => setSpecificIntention(sug)} />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Identity ───────────────────────────────────────────── */}
          {step === 3 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--emerald">
                  <Flame size={13} />
                  <span>QUESTION 03 · DESIRED IDENTITY</span>
                </div>
                <h2 className="ob-step__question">Who do you become when this is your truth?</h2>
                <p className="ob-step__hint">Subconscious shifts happen at identity level. Name who you already are in this reality.</p>
              </div>

              <div className="ob-field">
                <textarea
                  id="identity"
                  value={identity}
                  onChange={e => setIdentity(e.target.value)}
                  rows={3}
                  className="ob-textarea"
                  placeholder="e.g. A focused and disciplined creator."
                />
              </div>

              <div className="ob-option-grid ob-option-grid--2">
                {[
                  { value: 'A focused and disciplined creator.', label: 'A focused and disciplined creator.' },
                  { value: 'A calm, prolific builder executing with quiet sovereignty.', label: 'A calm, prolific builder executing with quiet sovereignty.' },
                  { value: 'A financially free, abundant visionary.', label: 'A financially free, abundant visionary.' },
                  { value: 'An unshakeable, centered leader.', label: 'An unshakeable, centered leader.' },
                ].map(opt => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    selected={identity === opt.value}
                    onSelect={setIdentity}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4: Feelings / Emotional Frequency ─────────────────────── */}
          {step === 4 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--amber">
                  <Zap size={13} />
                  <span>QUESTION 04 · EMOTIONAL FREQUENCY</span>
                </div>
                <h2 className="ob-step__question">What feelings do you want to embody?</h2>
                <p className="ob-step__hint">Select the somatic frequencies your session will anchor. Choose as many as resonate.</p>
              </div>

              <div className="ob-feelings-grid">
                {['Focused', 'Calm', 'Confident', 'Energized', 'Grounded', 'Serene', 'Inspired', 'Abundant', 'Magnetic', 'Peaceful'].map(tag => (
                  <FeelingChip
                    key={tag}
                    tag={tag}
                    selected={currentFeelingsList.includes(tag.toLowerCase())}
                    onToggle={toggleFeeling}
                  />
                ))}
              </div>

              <div className="ob-field">
                <label className="ob-field__label" htmlFor="custom-feelings">
                  Custom feeling array <span className="ob-field__label-hint">(comma-separated)</span>
                </label>
                <input
                  id="custom-feelings"
                  type="text"
                  value={feelings}
                  onChange={e => setFeelings(e.target.value)}
                  className="ob-input"
                  placeholder="Focused, Calm, Confident, Energized"
                />
              </div>
            </div>
          )}

          {/* ── STEP 5: Current Block ──────────────────────────────────────── */}
          {step === 5 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--rose">
                  <Shield size={13} />
                  <span>QUESTION 05 · CURRENT BLOCK</span>
                </div>
                <h2 className="ob-step__question">What internal block are you releasing?</h2>
                <p className="ob-step__hint">Name the hesitation, resistance loop, or friction point this session will dissolve.</p>
              </div>

              <div className="ob-option-grid ob-option-grid--3">
                {[
                  { value: 'Overthinking',      label: 'Overthinking',       sublabel: 'Racing thoughts' },
                  { value: 'Hesitation',        label: 'Hesitation',         sublabel: 'Fear of starting' },
                  { value: 'Procrastination',   label: 'Procrastination',    sublabel: 'Avoidance patterns' },
                  { value: 'Self-Doubt',        label: 'Self-Doubt',         sublabel: 'Inner critic' },
                  { value: 'Mental Fog',        label: 'Mental Fog',         sublabel: 'Scattered focus' },
                  { value: 'Burnout & Tension', label: 'Burnout & Tension',  sublabel: 'Chronic fatigue' },
                ].map(opt => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={currentBlock === opt.value}
                    onSelect={setCurrentBlock}
                  />
                ))}
              </div>

              <div className="ob-field">
                <label className="ob-field__label" htmlFor="custom-block">
                  Custom block or thought loop
                </label>
                <textarea
                  id="custom-block"
                  value={currentBlock}
                  onChange={e => setCurrentBlock(e.target.value)}
                  rows={3}
                  className="ob-textarea"
                  placeholder="e.g. Overthinking, second-guessing decisions, feeling overwhelmed…"
                />
              </div>
            </div>
          )}

          {/* ── STEP 6: Anchoring Action ───────────────────────────────────── */}
          {step === 6 && (
            <div className="ob-step">
              <div className="ob-step__header">
                <div className="ob-step__badge ob-step__badge--cyan">
                  <Layers size={13} />
                  <span>QUESTION 06 · ANCHORING ACTION</span>
                </div>
                <h2 className="ob-step__question">What action anchors this daily?</h2>
                <p className="ob-step__hint">A tangible micro-action that grounds this state into physical execution each day.</p>
              </div>

              <div className="ob-option-grid ob-option-grid--1">
                {[
                  'Consistently working on meaningful projects.',
                  '1 hour of morning uninterrupted creative deep work.',
                  '15-minute daily subliminal audio alignment session.',
                  'Starting my morning with clear prioritized execution.',
                ].map(actOpt => (
                  <OptionCard
                    key={actOpt}
                    value={actOpt}
                    label={actOpt}
                    selected={action === actOpt}
                    onSelect={setAction}
                  />
                ))}
              </div>

              <div className="ob-field">
                <label className="ob-field__label" htmlFor="custom-action">
                  Custom daily action
                </label>
                <input
                  id="custom-action"
                  type="text"
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="ob-input"
                  placeholder="e.g. Morning 20-minute journal + subliminal session…"
                />
              </div>

              {/* Final step CTA summary */}
              <div className="ob-final-summary">
                <Heart size={16} className="ob-final-summary__icon" />
                <p className="ob-final-summary__text">
                  ORBIT will use these six answers to generate 6–10 personalized subliminal session concepts tailored uniquely for you.
                </p>
              </div>
            </div>
          )}

          {/* ── Validation Message ──────────────────────────────────────────── */}
          {validationMsg && (
            <div className="ob-validation" role="alert">
              <AlertCircle size={14} />
              {validationMsg}
            </div>
          )}

          {/* ── Navigation Footer ──────────────────────────────────────────── */}
          <div className="ob-footer">
            {step > 1 ? (
              <button type="button" className="ob-btn-back" onClick={handleBack}>
                <ArrowLeft size={15} />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              className={`ob-btn-next ${step === 6 ? 'ob-btn-next--final' : ''}`}
              onClick={handleNext}
            >
              {step === 6 ? (
                <>
                  <Sparkles size={16} />
                  Generate My Session Concepts
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Step counter ────────────────────────────────────────────────── */}
        <div className="ob-step-counter" aria-live="polite">
          {step} of 6 · {stepLabels[step - 1]}
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;
