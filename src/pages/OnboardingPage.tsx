import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Coins,
  Sparkles,
  Heart,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Orbit,
  Flame,
  Zap,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './OnboardingPage.css';

interface CategoryOption {
  id: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
  title: string;
  desc: string;
  icon: React.FC<{ size: number; color?: string }>;
  suggestedGoal: string;
  suggestedIdentity: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'wealth',
    title: 'Wealth & Financial Sovereignty',
    desc: 'Dissolving scarcity and stepping into grounded financial freedom and abundance.',
    icon: Coins,
    suggestedGoal: 'Financial freedom and abundant passive income streams',
    suggestedIdentity: 'I am a creator and natural steward of sustainable wealth.',
  },
  {
    id: 'career',
    title: 'Calling & Creative Mastery',
    desc: 'Leading work that fulfills your highest creative and professional potential.',
    icon: Briefcase,
    suggestedGoal: 'Leading visionary creative work that creates lasting global value',
    suggestedIdentity: 'I am disciplined, visionary, and deeply valued for my craft.',
  },
  {
    id: 'peace',
    title: 'Inner Stillness & Clarity',
    desc: 'Untangling mental friction, living centered in present calm and grounded focus.',
    icon: Sparkles,
    suggestedGoal: 'Unshakable peace of mind and calm sovereign presence',
    suggestedIdentity: 'I am centered, unreactive, and anchored in quiet self-assurance.',
  },
  {
    id: 'confidence',
    title: 'Vitality & Unshakable Trust',
    desc: 'Reclaiming high physical energy, deep somatic confidence, and authentic self-trust.',
    icon: Flame,
    suggestedGoal: 'Peak physical vitality and radical belief in my capabilities',
    suggestedIdentity: 'I am strong, resilient, and trust my intuition completely.',
  },
  {
    id: 'love',
    title: 'Deep Connection & Harmony',
    desc: 'Attracting and cultivating authentic, mutual, and elevating relationships.',
    icon: Heart,
    suggestedGoal: 'Deep, honest, supportive love and lifelong collaborative bonds',
    suggestedIdentity: 'I am worthy of authentic connection and bring openness to every interaction.',
  },
  {
    id: 'travel',
    title: 'Freedom & Exploration',
    desc: 'Designing an unconstrained life of geographic mobility, beauty, and discovery.',
    icon: Compass,
    suggestedGoal: 'A flexible life of worldwide exploration and location independence',
    suggestedIdentity: 'I am adaptable, free, and live life as an expansive adventure.',
  },
];

const EMOTIONAL_FREQUENCIES = [
  {
    name: 'Grounded Serenity',
    frequency: '432 Hz',
    desc: 'Earth resonance, emotional equilibrium, calm assurance',
    color: '#38bdf8',
  },
  {
    name: 'Radiant Transformation',
    frequency: '528 Hz',
    desc: 'Miracle tone, deep cellular harmony, high vitality',
    color: '#10b981',
  },
  {
    name: 'Harmonious Connection',
    frequency: '639 Hz',
    desc: 'Interpersonal resonance, empathy, magnetic presence',
    color: '#8b5cf6',
  },
  {
    name: 'Sovereign Purpose',
    frequency: '741 Hz',
    desc: 'Intuition, mental clarity, dissolving imposter syndrome',
    color: '#fbbf24',
  },
];

const MICRO_ACTIONS = [
  'Commit to a 10-minute Morning Identity launch tomorrow',
  'Clear physical distractions from my creative workspace',
  'Complete one high-priority aligned task without multitasking',
  'Take a 15-minute contemplative walk listening to Solfeggio audio',
  'Write down 3 moments where reality has already begun shifting',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption['id']>('wealth');
  const [realityGoal, setRealityGoal] = useState('Financial freedom and abundant passive income streams');
  const [futureLifeVision, setFutureLifeVision] = useState(
    'I wake up without an alarm, centered and free. My schedule is sovereign, my work generates high impact, and I invest in what I believe in with effortless confidence.'
  );
  const [identityStatement, setIdentityStatement] = useState('I am a creator and natural steward of sustainable wealth.');
  const [selectedFrequency, setSelectedFrequency] = useState('528 Hz');
  const [selectedAction, setSelectedAction] = useState(MICRO_ACTIONS[0]);

  const handleCategorySelect = (cat: CategoryOption) => {
    setSelectedCategory(cat.id);
    setRealityGoal(cat.suggestedGoal);
    setIdentityStatement(cat.suggestedIdentity);
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      // 1. Add primary goal to user's universe simulation
      await api.addGoal(realityGoal, selectedCategory, identityStatement);

      // 2. Update user preferences
      await api.updateProfile(undefined, {
        preferredMood: selectedFrequency,
        preferredDuration: 15,
        visualizationStyle: 'embodied',
        affirmationStyle: 'present-tense',
      });

      // 3. Mark user as onboarded in storage and AuthContext
      const userId = user?.id || user?.email || 'current';
      localStorage.setItem(`orbit_onboarded_${userId}`, 'true');
      updateUserLocal({ onboarded: true });

      // 4. Redirect to celestial universe
      navigate('/app');
    } catch (err) {
      console.warn('Onboarding save error:', err);
      // Fallback: still mark onboarded locally so user can continue
      const userId = user?.id || user?.email || 'current';
      localStorage.setItem(`orbit_onboarded_${userId}`, 'true');
      updateUserLocal({ onboarded: true });
      navigate('/app');
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ['Reality Shift', 'Future Memory', 'Identity', 'Frequency', 'Action Anchor'];
  const progressPercent = ((step - 1) / (stepLabels.length - 1)) * 100;

  return (
    <div className="orbit-onboarding-container">
      <div className="orbit-onboarding-wrapper">
        {/* Stepper Progress */}
        <div className="orbit-onboarding-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
          <div className="orbit-onboarding-progress-bar-bg" />
          <div
            className="orbit-onboarding-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />

          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;

            return (
              <div
                key={label}
                className={`orbit-onboarding-step-indicator ${
                  isCompleted ? 'completed' : isActive ? 'active' : ''
                }`}
              >
                <div className="orbit-onboarding-step-dot">
                  {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                </div>
                <span className="orbit-onboarding-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Step Content Card */}
        <div className="orbit-onboarding-card">
          {/* STEP 1: What do you want to change in your reality? */}
          {step === 1 && (
            <div>
              <div className="orbit-onboarding-step-badge">
                <Orbit size={14} />
                <span>Step 1 of 5 • Prime Your Universe</span>
              </div>
              <h1 className="orbit-onboarding-question">
                What do you want to change in your reality?
              </h1>
              <p className="orbit-onboarding-subtitle">
                Select the pillar of life you are currently ready to transform. This will become your primary celestial focal planet.
              </p>

              <div className="orbit-category-grid">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      className={`orbit-category-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      <div className="orbit-category-icon-wrapper">
                        <Icon size={20} color={isSelected ? '#ffffff' : 'var(--celestial-cyan)'} />
                      </div>
                      <div>
                        <div className="orbit-category-title">{cat.title}</div>
                        <div className="orbit-category-desc">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Refine your reality shift statement:
                </label>
                <input
                  type="text"
                  className="orbit-onboarding-input"
                  value={realityGoal}
                  onChange={(e) => setRealityGoal(e.target.value)}
                  placeholder="e.g. Achieving location-independent financial abundance"
                />
              </div>
            </div>
          )}

          {/* STEP 2: What would your life look like if you already had it? */}
          {step === 2 && (
            <div>
              <div className="orbit-onboarding-step-badge">
                <Sparkles size={14} />
                <span>Step 2 of 5 • The Somatic Vision</span>
              </div>
              <h1 className="orbit-onboarding-question">
                What would your life look like if you already had it?
              </h1>
              <p className="orbit-onboarding-subtitle">
                Do not view it as a far-off hope. Ground yourself in the vivid reality that it has already manifested. What sensory details fill your day?
              </p>

              <div className="orbit-prompt-pills">
                <button
                  type="button"
                  className="orbit-prompt-pill"
                  onClick={() =>
                    setFutureLifeVision(
                      'I wake up calmly in a light-filled space. My time is sovereign, and my work is a joyful reflection of my natural curiosity.'
                    )
                  }
                >
                  🌅 Peaceful Morning Routine
                </button>
                <button
                  type="button"
                  className="orbit-prompt-pill"
                  onClick={() =>
                    setFutureLifeVision(
                      'I walk into rooms with calm certitude. I lead creative projects effortlessly, surrounded by trusted peers who challenge and support me.'
                    )
                  }
                >
                  💼 Sovereign Creative Flow
                </button>
                <button
                  type="button"
                  className="orbit-prompt-pill"
                  onClick={() =>
                    setFutureLifeVision(
                      'My bank balance is abundant and steadily compounding. Money is an easy, stress-free tool for security, generosity, and freedom.'
                    )
                  }
                >
                  💎 Effortless Abundance
                </button>
              </div>

              <textarea
                className="orbit-onboarding-textarea"
                value={futureLifeVision}
                onChange={(e) => setFutureLifeVision(e.target.value)}
                placeholder="Describe your reality in present tense... Where are you? What are you doing? How does your day unfold?"
              />
            </div>
          )}

          {/* STEP 3: Who are you in that reality? */}
          {step === 3 && (
            <div>
              <div className="orbit-onboarding-step-badge">
                <Zap size={14} />
                <span>Step 3 of 5 • Identity Shift</span>
              </div>
              <h1 className="orbit-onboarding-question">
                Who are you in that reality?
              </h1>
              <p className="orbit-onboarding-subtitle">
                Manifestation is an identity shift, never wishful thinking. You do not attract what you want; you attract what you embody.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  'I am a creator and natural steward of sustainable wealth.',
                  'I am disciplined, focused, and deeply confident in my execution.',
                  'I am centered, sovereign, and calm amidst any external turbulence.',
                  'I am courageous and embrace aligned action without hesitation.',
                ].map((statement) => (
                  <button
                    key={statement}
                    type="button"
                    onClick={() => setIdentityStatement(statement)}
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      background: identityStatement === statement ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: identityStatement === statement ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: identityStatement === statement ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    "{statement}"
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Or write your own present-tense "I AM" statement:
                </label>
                <input
                  type="text"
                  className="orbit-onboarding-input"
                  value={identityStatement}
                  onChange={(e) => setIdentityStatement(e.target.value)}
                  placeholder="I am..."
                />
              </div>
            </div>
          )}

          {/* STEP 4: How does that version of you feel? */}
          {step === 4 && (
            <div>
              <div className="orbit-onboarding-step-badge">
                <Volume2 size={14} />
                <span>Step 4 of 5 • Emotional Frequency</span>
              </div>
              <h1 className="orbit-onboarding-question">
                How does that version of you feel?
              </h1>
              <p className="orbit-onboarding-subtitle">
                Tune your inner state. Select the primary emotional frequency that represents the embodiment of your achieved desire.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {EMOTIONAL_FREQUENCIES.map((freq) => {
                  const isSelected = selectedFrequency === freq.frequency;

                  return (
                    <button
                      key={freq.name}
                      type="button"
                      onClick={() => setSelectedFrequency(freq.frequency)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `1px solid ${freq.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                          {freq.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: freq.color,
                          }}
                        >
                          {freq.frequency}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        {freq.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: What are you willing to do to move toward it? */}
          {step === 5 && (
            <div>
              <div className="orbit-onboarding-step-badge">
                <CheckCircle2 size={14} />
                <span>Step 5 of 5 • The Controllable Action Anchor</span>
              </div>
              <h1 className="orbit-onboarding-question">
                What are you willing to do to move toward it?
              </h1>
              <p className="orbit-onboarding-subtitle">
                <strong>Manifestation is not a replacement for action.</strong> Thought primes the compass, but consistent disciplined execution moves the ship. Choose your first reality anchor:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {MICRO_ACTIONS.map((action) => {
                  const isSelected = selectedAction === action;

                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setSelectedAction(action)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #38bdf8' : '2px solid rgba(255, 255, 255, 0.2)',
                          background: isSelected ? '#38bdf8' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0b0d21' }} />}
                      </div>
                      <span>{action}</span>
                    </button>
                  );
                })}
              </div>

              {/* Standing Formula reminder */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  fontSize: '0.825rem',
                  color: 'var(--celestial-gold)',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span>⚡</span>
                <span>
                  <strong>The ORBIT Equation:</strong> INTENTION + BELIEF + CONSISTENT ACTION + PATIENCE + REFLECTION
                </span>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="orbit-onboarding-footer">
            {step > 1 ? (
              <button type="button" className="orbit-btn-back" onClick={handleBack} disabled={submitting}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              className="orbit-btn-next"
              onClick={handleNext}
              disabled={submitting || (step === 1 && !realityGoal.trim())}
            >
              <span>{submitting ? 'Creating Celestial Universe...' : step === 5 ? 'Enter My Universe' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
