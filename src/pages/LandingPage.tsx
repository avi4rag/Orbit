import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const AFFIRMATIONS = [
  'I am already living my dream life.',
  'Abundance flows to me effortlessly.',
  'I attract what I consistently act toward.',
  'My reality is shaped by my dominant thoughts and daily actions.',
  'I am the architect of my own universe.',
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
