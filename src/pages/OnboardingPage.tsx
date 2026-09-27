import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coins,
  Briefcase,
  Flame,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IntentionBreakdown, type IntentionAnalysisData, type ConceptItem } from '../components/session/IntentionBreakdown';
import { SessionCustomizerModal } from '../components/session/SessionCustomizerModal';
import './OnboardingPage.css';

interface CategoryOption {
  id: string;
  title: string;
  desc: string;
  icon: React.FC<{ size: number }>;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'wealth',
    title: 'Wealth & Financial Sovereignty',
    desc: 'Compounding abundance, mindful stewardship, and sovereign peace.',
    icon: Coins,
  },
  {
    id: 'career',
    title: 'Calling & Creative Mastery',
    desc: 'Effortless execution, high-impact craft, and recognized leadership.',
    icon: Briefcase,
  },
  {
    id: 'confidence',
    title: 'Unshakable Certainty & Presence',
    desc: 'Dissolving self-doubt and stepping into magnetic self-assurance.',
    icon: Flame,
  },
  {
    id: 'focus',
    title: 'Deep Clarity & Cognitive Flow',
    desc: 'Laser mental stillness, eliminating friction and overthinking.',
    icon: Brain,
  },
  {
    id: 'love',
    title: 'Devoted Harmony & Connection',
    desc: 'Attracting and nurturing mutual, elevating, and authentic relationships.',
    icon: Heart,
  },
  {
    id: 'vitality',
    title: 'Peak Energy & Somatic Radiance',
    desc: 'Cellular glow, restorative physical vitality, and inner stamina.',
    icon: Zap,
  },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  // 6 Onboarding Questions State
  const [step, setStep] = useState(1);
  const [desiredOutcome, setDesiredOutcome] = useState('Unshakable mental clarity and compounding creative momentum');
  const [desiredIdentity, setDesiredIdentity] = useState('A calm, prolific creator who executes with quiet sovereignty');
  const [emotionalState, setEmotionalState] = useState('Grounded, serene, expansive certainty');
  const [currentBlock, setCurrentBlock] = useState('Overthinking, hesitation, and self-imposed pressure');
  const [dailyAction, setDailyAction] = useState('1 hour of uninterrupted morning deep work');
  const [selectedCategory, setSelectedCategory] = useState('focus');

  // Analysis & Concept States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<IntentionAnalysisData | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const handleNext = () => {
    if (step < 6) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteQuestions();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteQuestions = async () => {
    setIsAnalyzing(true);
    try {
      const payload = {
        desiredOutcome,
        desiredIdentity,
        emotionalState,
        currentBlock,
        dailyAction,
        category: selectedCategory
      };

      const res: any = await api.analyzeIntention(payload);
      if (res?.success && res.data) {
        setAnalysisData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to analyze intention');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback analysis if offline
      setAnalysisData({
        coreShift: `Transforming from "${currentBlock}" into "${desiredIdentity}".`,
        keyThemes: ['Sovereign Calm', 'Effortless Flow', 'Identity Alignment'],
        recommendedFocus: `Anchor daily with: "${dailyAction}".`,
        concepts: [
          {
            id: 'sovereign-momentum',
            title: 'Sovereign Flow: Unshakable Certainty',
            tagline: 'Quiet the mental noise and align with effortless execution.',
            description: 'A deep acoustic journey weaving gentle rain and calming frequencies to dissolve hesitation.',
            targetOutcome: desiredOutcome,
            category: selectedCategory,
            suggestedDuration: 5,
            suggestedAmbience: 'rain-light',
            suggestedFrequencyHz: 432
          },
          {
            id: 'deep-grounding-alignment',
            title: 'Earth Anchor: Cellular Peace',
            tagline: 'Step into complete somatic stability and creative poise.',
            description: 'Rich rain on glass layered with low frequencies to center your nervous system.',
            targetOutcome: desiredOutcome,
            category: selectedCategory,
            suggestedDuration: 10,
            suggestedAmbience: 'rain-window',
            suggestedFrequencyHz: 528
          }
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConceptSelect = (concept: ConceptItem) => {
    setSelectedConcept(concept);
    setIsCustomizerOpen(true);
  };

  const handleSessionSuccess = async (_session: any) => {
    // Mark user as onboarded in storage and AuthContext
    const userId = user?.id || user?.email || 'current';
    localStorage.setItem(`orbit_onboarded_${userId}`, 'true');
    updateUserLocal({ onboarded: true });

    // Close modal and navigate to universe/subliminals
    setIsCustomizerOpen(false);
    navigate('/subliminals');
  };

  // If analysis is ready, show Intention Breakdown Screen
  if (analysisData) {
    return (
      <div className="orbit-onboarding-container">
        <div className="orbit-onboarding-wrapper">
          <IntentionBreakdown
            analysis={analysisData}
            onSelectConcept={handleConceptSelect}
            onBack={() => setAnalysisData(null)}
          />

          {selectedConcept && (
            <SessionCustomizerModal
              concept={selectedConcept}
              answers={{
                desiredOutcome,
                desiredIdentity,
                emotionalState,
                currentBlock,
                dailyAction,
                category: selectedCategory
              }}
              isOpen={isCustomizerOpen}
              onClose={() => setIsCustomizerOpen(false)}
              onSuccess={handleSessionSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  // Analyzing state screen
  if (isAnalyzing) {
    return (
      <div className="orbit-onboarding-container">
        <div className="orbit-onboarding-wrapper text-center py-20 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-cyan-400 animate-spin" />
            <Sparkles size={36} className="text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Synthesizing Your Neural Architecture
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Analyzing your core desired identity and subconscious friction points with Gemini...
          </p>
        </div>
      </div>
    );
  }

  const stepLabels = ['Outcome', 'Identity', 'Feeling', 'Friction', 'Anchor', 'Sphere'];
  const progressPercent = ((step - 1) / (stepLabels.length - 1)) * 100;

  return (
    <div className="orbit-onboarding-container">
      <div className="orbit-onboarding-wrapper">
        {/* Progress Stepper */}
        <div className="orbit-onboarding-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={6}>
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
                className={`orbit-onboarding-step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="orbit-onboarding-step-dot">
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className="orbit-onboarding-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Card Body */}
        <div className="orbit-onboarding-card p-8 rounded-2xl bg-[#0b0d26]/80 border border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in">
          {/* Question 1: Desired Outcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Step 1 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">What reality are you calling in?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Describe the tangible outcome, achievement, or life reality you are choosing to manifest.
                </p>
              </div>

              <textarea
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                placeholder="e.g. Unshakable creative momentum, financial freedom, sovereign peace..."
              />
            </div>
          )}

          {/* Question 2: Desired Identity */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Step 2 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">Who do you become when this is your truth?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Shift from "trying to get" to the core identity statement of the person who naturally has it.
                </p>
              </div>

              <textarea
                value={desiredIdentity}
                onChange={(e) => setDesiredIdentity(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                placeholder="e.g. I am a prolific, grounded creator who executes effortlessly..."
              />
            </div>
          )}

          {/* Question 3: Emotional State */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Step 3 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">What is your primary feeling in this state?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Name the emotional frequency and somatic texture of this reality.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  'Grounded, serene certainty',
                  'Quiet, unshakable confidence',
                  'Expansive creative ecstasy',
                  'Deep somatic peace and ease',
                  'Magnetic, effortless presence',
                  'Laser-clear mental stillness'
                ].map((feel) => (
                  <button
                    key={feel}
                    type="button"
                    onClick={() => setEmotionalState(feel)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      emotionalState === feel
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {feel}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={emotionalState}
                onChange={(e) => setEmotionalState(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-emerald-400 text-white text-xs focus:outline-none transition-all mt-2"
                placeholder="Or type a custom emotional state..."
              />
            </div>
          )}

          {/* Question 4: Current Block */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">Step 4 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">What internal friction are you releasing?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Be honest about the recurrent thought loop, hesitation, or fear ORBIT will gently dissolve.
                </p>
              </div>

              <textarea
                value={currentBlock}
                onChange={(e) => setCurrentBlock(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-rose-400 text-white text-sm focus:outline-none transition-all placeholder-gray-500 leading-relaxed"
                placeholder="e.g. Overthinking decisions, imposter feelings, procrastination loop..."
              />
            </div>
          )}

          {/* Question 5: Daily Anchoring Action */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Step 5 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">What single action anchors this daily?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A tangible, effortless daily micro-habit that locks your physical body into this frequency.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  '1 hour of morning uninterrupted creative deep work',
                  '15-minute silent walk listening to subliminal audio',
                  'Writing down 3 moments where reality is already shifting',
                  'Starting my day before opening any digital feeds'
                ].map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setDailyAction(act)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      dailyAction === act
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={dailyAction}
                onChange={(e) => setDailyAction(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-amber-400 text-white text-xs focus:outline-none transition-all mt-2"
                placeholder="Or define your own daily micro-habit..."
              />
            </div>
          )}

          {/* Question 6: Category Focus */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Step 6 of 6</span>
                <h2 className="text-2xl font-bold text-white mt-1">Select your primary energetic sphere</h2>
                <p className="text-sm text-gray-400 mt-1">
                  This fine-tunes the subconscious vocabulary and acoustic resonance of your sessions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSel = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isSel
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSel ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-gray-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{cat.title}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
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
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {step === 6 ? (
                <>
                  <Sparkles size={16} /> Synthesize Intention
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
