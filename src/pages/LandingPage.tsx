import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const AFFIRMATIONS = [
  'I am already living my dream life.',
  'Abundance flows to me effortlessly.',
  'I attract what I consistently act toward.',
  'My reality is shaped by my dominant thoughts and daily actions.',
  'I am the architect of my own universe.',
];

interface MorphPreset {
  id: string;
  category: string;
  icon: string;
  chasing: {
    statement: string;
    mindset: string;
    pitfall: string;
    feeling: string;
  };
  inhabiting: {
    statement: string;
    mindset: string;
    action: string;
    frequency: string;
    feeling: string;
  };
}

const MORPH_PRESETS: MorphPreset[] = [
  {
    id: 'wealth',
    category: 'Financial Freedom',
    icon: '💎',
    chasing: {
      statement: 'I hope I become wealthy someday so I never have to worry about bills.',
      mindset: 'Future Longing & Scarcity',
      pitfall: 'Focuses on what is missing now; breeds financial anxiety and reactive impulse spending.',
      feeling: 'Anxious · Chasing · Deferred Life',
    },
    inhabiting: {
      statement: 'I am already a conscious steward of financial security and mindful freedom.',
      mindset: 'Present Identity & Stewardship',
      action: 'Set up an automated $25 savings transfer or audit 3 non-essential subscriptions today.',
      frequency: '528 Hz Solfeggio + 6 Hz Theta',
      feeling: 'Composed · Disciplined · Empowered',
    },
  },
  {
    id: 'career',
    category: 'Professional Mastery',
    icon: '⚡',
    chasing: {
      statement: 'I want to be recognized as a senior leader and get that big promotion next year.',
      mindset: 'External Validation Seeking',
      pitfall: 'Waits for external permission before executing with excellence and ownership.',
      feeling: 'Restless · Impostor Syndrome · Hesitant',
    },
    inhabiting: {
      statement: 'I already lead with composure, craftsmanship, and decisive ownership in every task.',
      mindset: 'Internal Standard of Craftsmanship',
      action: 'Ship one high-leverage proposal or resolve a blocker for a colleague before 3 PM.',
      frequency: '432 Hz + 10 Hz Alpha Flow',
      feeling: 'Focused · Decisive · Capable',
    },
  },
  {
    id: 'peace',
    category: 'Inner Peace & Calm',
    icon: '🌊',
    chasing: {
      statement: 'I need life to slow down and stop being so stressful before I can feel peaceful.',
      mindset: 'Conditional Serenity',
      pitfall: 'Makes your state of mind hostage to external chaos and notifications.',
      feeling: 'Overwhelmed · Reactive · Frustrated',
    },
    inhabiting: {
      statement: 'Peace is my baseline. I respond to external demands from a center of quiet stillness.',
      mindset: 'Unshakable Present Grounding',
      action: 'Take 5 conscious box-breaths and step away from all screens for a 10-minute walk.',
      frequency: '174 Hz Deep Calm + 4 Hz Delta',
      feeling: 'Serene · Unhurried · Grounded',
    },
  },
  {
    id: 'confidence',
    category: 'Unshakeable Confidence',
    icon: '🏔',
    chasing: {
      statement: 'I will feel confident once everyone likes me and I never make mistakes.',
      mindset: 'Perfectionism & Fear of Failure',
      pitfall: 'Avoids bold decisions; paralyzes progress in over-analysis.',
      feeling: 'Self-Doubt · Shrinking · Procrastination',
    },
    inhabiting: {
      statement: 'I trust my resilience. I act with the confidence of someone who learns from mistakes.',
      mindset: 'Self-Trust & Active Courage',
      action: 'Speak up in your next meeting or send that email you have been putting off.',
      frequency: '396 Hz Liberation + 12 Hz Alpha',
      feeling: 'Courageous · Authentic · Bold',
    },
  },
];

const PILLARS = [
  { icon: '🎧', title: 'Binaural Soundscapes', desc: 'Solfeggio frequencies + binaural beats tuned to focus, calm, or deep sleep.' },
  { icon: '🌌', title: 'Celestial Universe', desc: 'Visualize your goals as orbiting planets in your personal cosmos.' },
  { icon: '📿', title: 'Daily Rituals', desc: 'Morning identity launch and evening reflection loops to wire the belief.' },
  { icon: '⚡', title: 'Aligned Action Board', desc: 'Convert visions into 100% controllable daily micro-actions.' },
  { icon: '🤖', title: 'AI Personalization', desc: 'Server-side AI crafts affirmations from your goals — never a cookie-cutter script.' },
];

const SOCIAL_PROOF = [
  { name: 'Aisha M.', handle: '@aisha_rises', text: 'Orbit replaced my 30-minute doom-scroll with 20 minutes of visualization. My morning clarity is unreal.' },
  { name: 'Dev R.', handle: '@devbuilds', text: 'The action board is the differentiator — manifestation without a task list is just daydreaming. Orbit gets it.' },
  { name: 'Sophie L.', handle: '@sophielives', text: 'The binaural session before bed changed my sleep quality in 5 days. The affirmations feel personal, not generic.' },
];

const LandingPage: React.FC = () => {
  const affirmIdx = useRef(0);
  const affirmEl = useRef<HTMLSpanElement>(null);
  const [activePresetId, setActivePresetId] = useState('wealth');
  const [isInhabiting, setIsInhabiting] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customResult, setCustomResult] = useState<{ statement: string; action: string } | null>(null);

  const activePreset = MORPH_PRESETS.find((p) => p.id === activePresetId) || MORPH_PRESETS[0];

  const handleCustomReframe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const clean = customInput.trim().replace(/^(I want to|I wish I could|I hope I|I will)\s+/i, '');
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    setCustomResult({
      statement: `I am already showing up as the person who embodies ${capitalized.toLowerCase()}. My daily choices prove it.`,
      action: `Identify the single next 15-minute action that moves you closer to ${capitalized.toLowerCase()} and execute it today.`,
    });
    setIsInhabiting(true);
  };

  useEffect(() => {
    const cycle = () => {
      if (!affirmEl.current) return;
      affirmEl.current.classList.remove('affirmation--visible');
      setTimeout(() => {
        affirmIdx.current = (affirmIdx.current + 1) % AFFIRMATIONS.length;
        if (affirmEl.current) {
          affirmEl.current.textContent = AFFIRMATIONS[affirmIdx.current];
          affirmEl.current.classList.add('affirmation--visible');
        }
      }, 400);
    };

    if (affirmEl.current) {
      affirmEl.current.textContent = AFFIRMATIONS[0];
      affirmEl.current.classList.add('affirmation--visible');
    }

    const timer = setInterval(cycle, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-heading">
        {/* Cosmic particle canvas bg */}
        <div className="hero__starfield" aria-hidden="true">
          {Array.from({ length: 80 }).map((_, i) => (
            <span key={i} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: Math.random() * 0.7 + 0.2,
            }} />
          ))}
        </div>

        <div className="hero__inner">
          <div className="hero__eyebrow">
            <span className="hero__badge">✦ Law of Attraction · Reimagined</span>
          </div>

          <h1 id="hero-heading" className="hero__headline">
            Live From The Reality<br />
            <span className="hero__headline--gradient">You Already Have.</span>
          </h1>

          <p className="hero__subline">
            Stop chasing. Start <em>inhabiting</em>. Orbit reprograms your default mental state
            through binaural soundscapes, spoken affirmations, and daily micro-actions —
            because <strong>intention without action is just a wish.</strong>
          </p>

          {/* Rotating affirmation */}
          <div className="hero__affirmation-wrap" aria-live="polite" aria-label="Rotating affirmation">
            <span className="hero__affirmation-quote">&ldquo;</span>
            <span className="hero__affirmation-text affirmation--visible" ref={affirmEl} />
            <span className="hero__affirmation-quote">&rdquo;</span>
          </div>

          <div className="hero__cta-row">
            <Link to="/app" className="cta-btn cta-btn--primary" aria-label="Start your free Orbit session">
              ✦ Begin Your Session
            </Link>
            <Link to="/explore" className="cta-btn cta-btn--secondary" aria-label="Explore soundscapes and visualizations">
              Explore Soundscapes →
            </Link>
          </div>

          <p className="hero__disclaimer">
            ⚠ Manifestation is not a replacement for action. Everything here is a tool for clarity and motivation.
          </p>
        </div>

        {/* Floating orb decoration */}
        <div className="hero__orb hero__orb--1" aria-hidden="true" />
        <div className="hero__orb hero__orb--2" aria-hidden="true" />
        <div className="hero__orb hero__orb--3" aria-hidden="true" />
      </section>

      {/* ── EQUATION BANNER ── */}
      <section className="equation-banner" aria-label="Orbit formula">
        <div className="equation-banner__inner">
          <span className="eq-step">INTENTION</span>
          <span className="eq-op">+</span>
          <span className="eq-step">BELIEF &amp; VISUALIZATION</span>
          <span className="eq-op">+</span>
          <span className="eq-step">CONSISTENT ACTION</span>
          <span className="eq-op">+</span>
          <span className="eq-step">PATIENCE</span>
          <span className="eq-op">+</span>
          <span className="eq-step">REFLECTION</span>
          <span className="eq-op">=</span>
          <span className="eq-result">ORBIT</span>
        </div>
      </section>

      {/* ── THE CORE REFRAME: INTERACTIVE MORPH (§2.4 & §2.5) ── */}
      <section className="morph-section" aria-labelledby="morph-heading">
        <div className="morph-section__header">
          <span className="morph-section__badge">✦ The Core Reframe (§2.4)</span>
          <h2 id="morph-heading" className="section-heading">
            Stop Thinking About Getting It in the Future.<br />
            <span className="hero__headline--gradient">Inhabit It Right Now.</span>
          </h2>
          <p className="section-subheading">
            Experience the fundamental mental shift that separates wishing from reality.
            Toggle between the <em>chasing state</em> and the <em>inhabiting state</em>.
          </p>
        </div>

        {/* Category Selector */}
        <div className="morph-categories" role="tablist" aria-label="Manifestation Categories">
          {MORPH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              role="tab"
              aria-selected={activePresetId === preset.id}
              className={`morph-cat-btn ${activePresetId === preset.id ? 'is-active' : ''}`}
              onClick={() => {
                setActivePresetId(preset.id);
                setCustomResult(null);
              }}
            >
              <span className="morph-cat-icon">{preset.icon}</span>
              <span className="morph-cat-title">{preset.category}</span>
            </button>
          ))}
        </div>

        {/* Toggle Switch */}
        <div className="morph-toggle-container">
          <div className="morph-toggle-track" role="radiogroup" aria-label="Mindset State">
            <button
              type="button"
              role="radio"
              aria-checked={!isInhabiting}
              className={`morph-toggle-btn chasing ${!isInhabiting ? 'is-selected' : ''}`}
              onClick={() => setIsInhabiting(false)}
            >
              1. The Chasing State (Lack &amp; Future)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isInhabiting}
              className={`morph-toggle-btn inhabiting ${isInhabiting ? 'is-selected' : ''}`}
              onClick={() => setIsInhabiting(true)}
            >
              2. The Inhabiting State (Present &amp; Action)
            </button>
          </div>
        </div>

        {/* Morph Card Display */}
        <div className="morph-card-wrapper">
          <div className={`morph-card ${isInhabiting ? 'morph-card--inhabiting' : 'morph-card--chasing'}`}>
            <div className="morph-card__glow" aria-hidden="true" />
            <div className="morph-card__header">
              <span className="morph-card__state-pill">
                {isInhabiting ? '✨ Inhabiting Reality (Orbit)' : '⏳ Chasing Mindset (Someday...)'}
              </span>
              <span className="morph-card__feeling-tag">
                {isInhabiting ? activePreset.inhabiting.feeling : activePreset.chasing.feeling}
              </span>
            </div>

            <blockquote className="morph-card__quote">
              &ldquo;
              {customResult && isInhabiting
                ? customResult.statement
                : isInhabiting
                ? activePreset.inhabiting.statement
                : activePreset.chasing.statement}
              &rdquo;
            </blockquote>

            <div className="morph-card__details">
              <div className="morph-card__detail-item">
                <span className="morph-detail-label">Underlying Psychology</span>
                <p className="morph-detail-value">
                  {isInhabiting ? activePreset.inhabiting.mindset : activePreset.chasing.mindset}
                </p>
              </div>

              {isInhabiting ? (
                <>
                  <div className="morph-card__detail-item action-highlight">
                    <span className="morph-detail-label">⚡ Today's Aligned Action (Controllable)</span>
                    <p className="morph-detail-value">
                      {customResult ? customResult.action : activePreset.inhabiting.action}
                    </p>
                  </div>
                  <div className="morph-card__detail-item">
                    <span className="morph-detail-label">🎵 Recommended Soundscape Frequency</span>
                    <p className="morph-detail-value">{activePreset.inhabiting.frequency}</p>
                  </div>
                </>
              ) : (
                <div className="morph-card__detail-item warning-highlight">
                  <span className="morph-detail-label">⚠ The Trap of "Chasing"</span>
                  <p className="morph-detail-value">{activePreset.chasing.pitfall}</p>
                </div>
              )}
            </div>

            <div className="morph-card__cta-row">
              <button
                type="button"
                className="morph-flip-btn"
                onClick={() => setIsInhabiting(!isInhabiting)}
              >
                {isInhabiting ? '← View Chasing Perspective' : '✨ Morph to Inhabiting Reality →'}
              </button>
              <Link to="/app" className="morph-session-link">
                Launch Session with This Reframe ✦
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Custom Reframe Sandbox */}
        <div className="morph-sandbox">
          <h3 className="morph-sandbox__title">Try Your Own Goal</h3>
          <p className="morph-sandbox__desc">
            Type what you have been chasing into the box below. We will instantly morph it into an active identity statement and a concrete next action.
          </p>
          <form className="morph-sandbox__form" onSubmit={handleCustomReframe}>
            <input
              type="text"
              className="morph-sandbox__input"
              placeholder="e.g. I want to build a successful startup and achieve financial freedom..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              aria-label="Enter your current aspiration"
            />
            <button type="submit" className="morph-sandbox__btn">
              ⚡ Reframe to Present State
            </button>
          </form>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="pillars" aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="section-heading">Everything You Need to Inhabit Your Vision</h2>
        <p className="section-subheading">Five systems. One daily practice. Zero magical thinking.</p>
        <div className="pillars__grid">
          {PILLARS.map((p) => (
            <article key={p.title} className="pillar-card">
              <div className="pillar-card__icon" aria-hidden="true">{p.icon}</div>
              <h3 className="pillar-card__title">{p.title}</h3>
              <p className="pillar-card__desc">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── DREAM + ACTION SPLIT ── */}
      <section className="dream-action" aria-labelledby="dream-action-heading">
        <div className="dream-action__inner">
          <div className="dream-action__col dream-action__col--dream">
            <div className="dream-action__emoji" aria-hidden="true">🌙</div>
            <h3 className="dream-action__col-title">Dream</h3>
            <ul className="dream-action__list">
              <li>Visualize as if it's already real</li>
              <li>Binaural frequency sessions</li>
              <li>Spoken identity affirmations</li>
              <li>Gratitude journalling</li>
            </ul>
          </div>

          <div className="dream-action__divider" aria-hidden="true">
            <span className="dream-action__plus">+</span>
            <span className="dream-action__not">≠ Instead Of</span>
          </div>

          <div className="dream-action__col dream-action__col--action">
            <div className="dream-action__emoji" aria-hidden="true">⚡</div>
            <h3 className="dream-action__col-title">Action</h3>
            <ul className="dream-action__list">
              <li>Controllable daily micro-tasks</li>
              <li>Aligned Action Board tracking</li>
              <li>Progress check-ins</li>
              <li>Habit-based goal systems</li>
            </ul>
          </div>
        </div>
        <p id="dream-action-heading" className="dream-action__mantra">
          Dream + Action. <strong>Not</strong> Dream <em>instead of</em> Action.
        </p>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="testimonials" aria-labelledby="testimonials-heading">
        <h2 id="testimonials-heading" className="section-heading">What Orbiters Are Saying</h2>
        <div className="testimonials__grid">
          {SOCIAL_PROOF.map((t) => (
            <blockquote key={t.handle} className="testimonial-card">
              <p className="testimonial-card__text">&ldquo;{t.text}&rdquo;</p>
              <footer className="testimonial-card__footer">
                <strong className="testimonial-card__name">{t.name}</strong>
                <span className="testimonial-card__handle">{t.handle}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta" aria-labelledby="final-cta-heading">
        <div className="final-cta__orb" aria-hidden="true" />
        <h2 id="final-cta-heading" className="final-cta__heading">
          Your desired reality is not in the future.<br />
          <span className="final-cta__highlight">It's in your next decision.</span>
        </h2>
        <Link to="/app" className="cta-btn cta-btn--primary cta-btn--large" aria-label="Start your Orbit session now">
          ✦ Start Your First Session — Free
        </Link>
        <p className="final-cta__note">No credit card. No ads. No manifesting-without-moving propaganda.</p>
      </section>

    </div>
  );
};

export default LandingPage;
