import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './OnboardingPage.css';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  // 6 Onboarding Question State Variables (Phase 1 & 3 specification)
  const [step, setStep] = useState(1);
  const [desire, setDesire] = useState('Focus & Productivity');
  const [specificIntention, setSpecificIntention] = useState(
    'I want to develop unshakable mental clarity and consistent creative momentum.'
  );
  const [identity, setIdentity] = useState('A focused and disciplined creator.');
  const [feelings, setFeelings] = useState('Focused, Calm, Confident, Energized');
  const [currentBlock, setCurrentBlock] = useState('Overthinking');
  const [action, setAction] = useState('Consistently working on meaningful projects.');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMessage(null);
    if (step < 6) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteQuestions();
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) {
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
        // Persist latest onboarding ID to localStorage
        localStorage.setItem('orbit_latest_onboarding_id', res.onboardingId);

        // Mark user as onboarded locally
        const userId = user?.id || user?.email || 'current';
        localStorage.setItem(`orbit_onboarded_${userId}`, 'true');
        updateUserLocal({ onboarded: true });

        // Navigate immediately to /subliminals/create with full state
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

  // Quick feelings helper
  const toggleFeeling = (tag: string) => {
    const currentList = feelings
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let updated: string[];
    if (currentList.includes(tag)) {
      updated = currentList.filter(s => s !== tag);
    } else {
      updated = [...currentList, tag];
    }
    setFeelings(updated.join(', '));
  };

  const currentFeelingsList = feelings
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const stepLabels = ['Outcome', 'Intention', 'Identity', 'Feelings', 'Block', 'Action'];
  const progressPercent = ((step - 1) / (stepLabels.length - 1)) * 100;

  // Loading Screen while generating concepts
  if (isSubmitting) {
    return (
      <div className="orbit-onboarding-container">
        <div className="orbit-onboarding-wrapper text-center py-24 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-cyan-400 animate-spin" />
            <Sparkles size={36} className="text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Synthesizing Your Neural Architecture
          </h2>
          <p className="text-sm text-cyan-300 font-medium mt-2">
            Saving answers to MongoDB & generating 6–10 personalized session concepts...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Connecting directly to Orbit Intention Engine
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orbit-onboarding-container">
      <div className="orbit-onboarding-wrapper">
        {/* Header Breadcrumb */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-cyan-400 mb-3 font-mono">
            <Sparkles size={13} />
            <span>ORBIT INTENTION ONBOARDING</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Architect Your New Reality
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-2 max-w-lg mx-auto">
            Six precise questions to map your subconscious landscape and generate custom subliminal soundscapes.
          </p>
        </div>

        {/* Progress Stepper */}
        <div
          className="orbit-onboarding-progress"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={6}
        >
          <div className="orbit-onboarding-progress-bar-bg" />
          <div
            className="orbit-onboarding-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />

          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div
                key={label}
                className={`orbit-onboarding-step-indicator ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
                onClick={() => {
                  if (stepNum < step) setStep(stepNum);
                }}
              >
                <div className="orbit-onboarding-step-dot">
                  {isCompleted ? <CheckCircle2 size={12} className="text-cyan-400" /> : stepNum}
                </div>
                <span className="orbit-onboarding-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs animate-shake">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Error during submission:</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="orbit-onboarding-card p-6 md:p-8 rounded-2xl bg-[#0b0d26]/80 border border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in">
          {/* Question 1: Desired Outcome (desire) */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Compass size={14} /> Question 1 of 6 · Desired Outcome
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">What reality are you choosing to manifest?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Select your primary domain of focus or type your custom outcome.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  'Focus & Productivity',
                  'Wealth & Abundance',
                  'Confidence & Presence',
                  'Creative Mastery',
                  'Deep Peace & Stillness',
                  'Health & Vitality'
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDesire(opt)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      desire === opt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Custom Outcome or Refinement:
                </label>
                <input
                  type="text"
                  value={desire}
                  onChange={e => setDesire(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500"
                  placeholder="e.g. Focus & Productivity, Financial Freedom, Magnetic Confidence..."
                />
              </div>
            </div>
          )}

          {/* Question 2: Specific Intention (specificIntention) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                  <Brain size={14} /> Question 2 of 6 · Specific Intention
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">What is your specific intention?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Define the exact tangible breakthrough, clarity, or shift you want this audio to anchor.
                </p>
              </div>

              <textarea
                value={specificIntention}
                onChange={e => setSpecificIntention(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                placeholder="e.g. I want to develop unshakable mental clarity and consistent creative momentum."
              />

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-500 self-center">Suggestions:</span>
                {[
                  'I want to develop unshakable mental clarity and consistent creative momentum.',
                  'I want to attract sovereign wealth and elevate my standard of living effortlessly.',
                  'I want to dissolve all social anxiety and command calm magnetic respect.'
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSpecificIntention(sug)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all text-[11px]"
                  >
                    "{sug.slice(0, 38)}..."
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 3: Identity (identity) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <Flame size={14} /> Question 3 of 6 · Desired Identity
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Who do you become when this is your truth?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Subconscious shifts happen at identity level. Name who you already are in this reality.
                </p>
              </div>

              <textarea
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-emerald-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                placeholder="e.g. A focused and disciplined creator."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'A focused and disciplined creator.',
                  'A calm, prolific builder executing with quiet sovereignty.',
                  'A financially free, abundant visionary.',
                  'An unshakeable, centered leader.'
                ].map(idOption => (
                  <button
                    key={idOption}
                    type="button"
                    onClick={() => setIdentity(idOption)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      identity === idOption
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    "{idOption}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 4: Feelings (feelings) */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap size={14} /> Question 4 of 6 · Emotional Frequency
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">What feelings do you want to embody?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Select the key somatic frequencies or type your specific emotional texture.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  'Focused',
                  'Calm',
                  'Confident',
                  'Energized',
                  'Grounded',
                  'Serene',
                  'Inspired',
                  'Abundant',
                  'Magnetic',
                  'Peaceful'
                ].map(tag => {
                  const isSelected = currentFeelingsList.includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFeeling(tag)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Custom Feeling Array (comma-separated):
                </label>
                <input
                  type="text"
                  value={feelings}
                  onChange={e => setFeelings(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-amber-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500"
                  placeholder="Focused, Calm, Confident, Energized"
                />
              </div>
            </div>
          )}

          {/* Question 5: Current Block (currentBlock) */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <Shield size={14} /> Question 5 of 6 · Current Block
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">What internal block are you releasing?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Name the hesitation, resistance loop, or friction point this session will dissolve.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  'Overthinking',
                  'Hesitation',
                  'Procrastination',
                  'Self-Doubt',
                  'Mental Fog',
                  'Burnout & Tension'
                ].map(blockOpt => (
                  <button
                    key={blockOpt}
                    type="button"
                    onClick={() => setCurrentBlock(blockOpt)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      currentBlock === blockOpt
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-md shadow-rose-500/10'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {blockOpt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Custom Block or Thought Loop:
                </label>
                <textarea
                  value={currentBlock}
                  onChange={e => setCurrentBlock(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-rose-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                  placeholder="e.g. Overthinking, second-guessing decisions, feeling overwhelmed..."
                />
              </div>
            </div>
          )}

          {/* Question 6: Action (action) */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Layers size={14} /> Question 6 of 6 · Anchoring Action
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">What action anchors this daily?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A tangible, realistic micro-action that grounds this state into physical physical execution.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  'Consistently working on meaningful projects.',
                  '1 hour of morning uninterrupted creative deep work.',
                  '15-minute daily subliminal audio alignment session.',
                  'Starting my morning with clear prioritized execution.'
                ].map(actOpt => (
                  <button
                    key={actOpt}
                    type="button"
                    onClick={() => setAction(actOpt)}
                    className={`w-full p-3.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      action === actOpt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {actOpt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Custom Daily Action:
                </label>
                <input
                  type="text"
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500"
                  placeholder="e.g. Consistently working on meaningful projects."
                />
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {step === 6 ? (
                <>
                  <Sparkles size={16} /> Generate Personalized Concepts
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
