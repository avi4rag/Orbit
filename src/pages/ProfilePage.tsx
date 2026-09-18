import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './ProfilePage.css';

// ── Types ──────────────────────────────────────────────────────────
export interface UserGoal {
  id: string;
  title: string;
  category: string;
  identityStatement: string;
  vitality: number; // 0-100
}

export interface UserPreferences {
  defaultFrequency: number;
  binauralBalance: number;
  spokenVoiceBalance: number;
  ambientBalance: number;
  morningReminderTime: string;
  eveningReminderTime: string;
  reduceMotion: boolean;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // User Profile State
  const [userName, setUserName] = useState<string>('Cosmic Voyager');
  const [userEmail, setUserEmail] = useState<string>('seeker@orbit.space');
  const [memberSince] = useState<string>('September 2026');
  const [tier] = useState<string>('Master Architect');

  // Stats
  const [stats, setStats] = useState({
    totalMinutes: 480,
    currentStreak: 14,
    actionsCompleted: 32,
    activeStars: 6
  });

  // Goals
  const [goals, setGoals] = useState<UserGoal[]>([
    {
      id: 'g-1',
      title: '7-Figure Creative Studio',
      category: 'Wealth & Success',
      identityStatement: 'I lead an agency that creates monumental value and total freedom.',
      vitality: 88
    },
    {
      id: 'g-2',
      title: 'Peak Cellular Vitality',
      category: 'Health & Vitality',
      identityStatement: 'Every cell in my body vibrates with effortless health and vigor.',
      vitality: 94
    },
    {
      id: 'g-3',
      title: 'Unshakeable Emotional Peace',
      category: 'Inner Peace',
      identityStatement: 'I am the calm stillness that transforms all turbulence into clarity.',
      vitality: 76
    }
  ]);

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultFrequency: 528,
    binauralBalance: 75,
    spokenVoiceBalance: 85,
    ambientBalance: 65,
    morningReminderTime: '07:30',
    eveningReminderTime: '21:45',
    reduceMotion: false
  });

  // Form states
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Wealth & Success');
  const [newGoalIdentity, setNewGoalIdentity] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string>('');

  // Fetch from server on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await api.getProfile();
      if (profile) {
        if (profile.name) setUserName(profile.name);
        if (profile.email) setUserEmail(profile.email);
        if (profile.preferences) setPreferences((prev) => ({ ...prev, ...profile.preferences }));
        if (profile.goals && profile.goals.length > 0) {
          setGoals(profile.goals);
        }
        if (profile.stats) {
          setStats((prev) => ({ ...prev, ...profile.stats }));
        }
      }
    } catch {
      // Keep local defaults
    }
  };

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(''), 3000);
  };

  // Add new Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      await api.addGoal(newGoalTitle, newGoalCategory, newGoalIdentity);
      showToast('New goal ignited in your profile!');
    } catch {
      // Local fallback
    }

    const newGoalItem: UserGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      identityStatement: newGoalIdentity.trim() || `I am living the reality of ${newGoalTitle.trim()}`,
      vitality: 50
    };

    setGoals((prev) => [newGoalItem, ...prev]);
    setNewGoalTitle('');
    setNewGoalIdentity('');
  };

  // Save Preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile(userName, preferences);
      showToast('Acoustic preferences saved successfully.');
    } catch {
      showToast('Preferences updated locally.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {statusToast && (
        <div className="profile-toast" role="status" aria-live="polite">
          {statusToast}
        </div>
      )}

      {/* Profile Header Banner */}
      <header className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <span>{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="profile-badge-pill">{tier}</span>
        </div>

        <div className="profile-hero__meta">
          <h1 className="profile-name">{userName}</h1>
          <p className="profile-email">{userEmail} • Member since {memberSince}</p>
          <div className="profile-action-links">
            <button
              className="p-link-btn"
              onClick={() => navigate('/app')}
            >
              View Constellations
            </button>
            <button
              className="p-link-btn p-link-btn--subtle"
              onClick={() => navigate('/actions')}
            >
              Aligned Actions
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="profile-stats-grid" aria-label="Manifestation statistics">
        <div className="p-stat-card">
          <span className="p-stat-icon" aria-hidden="true">⏱️</span>
          <div className="p-stat-data">
            <strong className="p-stat-num">{stats.totalMinutes}m</strong>
            <span className="p-stat-lbl">Conscious Audio</span>
          </div>
        </div>

        <div className="p-stat-card">
          <span className="p-stat-icon" aria-hidden="true">🔥</span>
          <div className="p-stat-data">
            <strong className="p-stat-num">{stats.currentStreak} Days</strong>
            <span className="p-stat-lbl">Daily Ritual Streak</span>
          </div>
        </div>

        <div className="p-stat-card">
          <span className="p-stat-icon" aria-hidden="true">⚡</span>
          <div className="p-stat-data">
            <strong className="p-stat-num">{stats.actionsCompleted}</strong>
            <span className="p-stat-lbl">Actions Completed</span>
          </div>
        </div>

        <div className="p-stat-card">
          <span className="p-stat-icon" aria-hidden="true">🌌</span>
          <div className="p-stat-data">
            <strong className="p-stat-num">{goals.length}</strong>
            <span className="p-stat-lbl">Active Pillars</span>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Goals & Audio Engine Preferences */}
      <div className="profile-grid">
        {/* Left: Goals & Identity Statements */}
        <section className="profile-panel" aria-label="Goals and intentions">
          <h2 className="panel-heading">Active Intentions & Pillars</h2>
          <p className="panel-sub">
            The core realities you are currently embodying. High vitality reflects consistent aligned action.
          </p>

          <div className="goals-list">
            {goals.map((g) => (
              <div key={g.id} className="goal-card">
                <div className="goal-card__top">
                  <span className="goal-cat-badge">{g.category}</span>
                  <span className="goal-vitality-badge">{g.vitality}% Vitality</span>
                </div>
                <h3 className="goal-title">{g.title}</h3>
                <p className="goal-identity">"{g.identityStatement}"</p>
                <div className="goal-bar">
                  <div className="goal-bar-fill" style={{ width: `${g.vitality}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Goal Form */}
          <form onSubmit={handleAddGoal} className="add-goal-form">
            <h3 className="add-goal-title">Ignite New Intention Goal</h3>
            <div className="goal-form-fields">
              <input
                type="text"
                className="p-input"
                placeholder="Target Reality (e.g. Master Pianist)"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                required
              />
              <select
                className="p-select"
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
              >
                <option value="Wealth & Success">Wealth & Success (528Hz)</option>
                <option value="Health & Vitality">Health & Vitality (432Hz)</option>
                <option value="Love & Magnetism">Love & Magnetism (639Hz)</option>
                <option value="Purpose & Focus">Purpose & Focus (396Hz)</option>
                <option value="Inner Peace">Inner Peace (174Hz)</option>
              </select>
              <input
                type="text"
                className="p-input"
                placeholder="Present-tense statement (e.g. I express effortless music)"
                value={newGoalIdentity}
                onChange={(e) => setNewGoalIdentity(e.target.value)}
              />
              <button type="submit" className="add-goal-btn">
                Add Intention to Profile
              </button>
            </div>
          </form>
        </section>

        {/* Right: Audio Calibration & Preferences */}
        <section className="profile-panel" aria-label="Audio preferences">
          <h2 className="panel-heading">Acoustic Neuro-Calibration</h2>
          <p className="panel-sub">
            Customize how Orbit mixes Solfeggio carriers, binaural beat pulses, and spoken identity affirmations.
          </p>

          <div className="pref-group">
            <label className="pref-label">
              <span>Default Resonant Frequency</span>
              <select
                className="p-select"
                value={preferences.defaultFrequency}
                onChange={(e) => setPreferences({ ...preferences, defaultFrequency: Number(e.target.value) })}
              >
                <option value={528}>528 Hz — Transformation & Abundance</option>
                <option value={432}>432 Hz — Cellular Healing & Calm</option>
                <option value={639}>639 Hz — Heart Coherence & Magnetism</option>
                <option value={396}>396 Hz — Fear Dissolution & Grounding</option>
                <option value={174}>174 Hz — Deep Delta Sleep Surrender</option>
              </select>
            </label>

            {/* Binaural Slider */}
            <div className="pref-slider-block">
              <div className="slider-header">
                <span className="slider-lbl">Binaural Beat Presence</span>
                <span className="slider-val">{preferences.binauralBalance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="p-range"
                value={preferences.binauralBalance}
                onChange={(e) => setPreferences({ ...preferences, binauralBalance: Number(e.target.value) })}
              />
            </div>

            {/* Spoken Voice Slider */}
            <div className="pref-slider-block">
              <div className="slider-header">
                <span className="slider-lbl">Spoken Affirmation Volume</span>
                <span className="slider-val">{preferences.spokenVoiceBalance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="p-range"
                value={preferences.spokenVoiceBalance}
                onChange={(e) => setPreferences({ ...preferences, spokenVoiceBalance: Number(e.target.value) })}
              />
            </div>

            {/* Ambient Drone Slider */}
            <div className="pref-slider-block">
              <div className="slider-header">
                <span className="slider-lbl">Ambient Cosmic Drone Layer</span>
                <span className="slider-val">{preferences.ambientBalance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="p-range"
                value={preferences.ambientBalance}
                onChange={(e) => setPreferences({ ...preferences, ambientBalance: Number(e.target.value) })}
              />
            </div>

            {/* Morning & Evening Times */}
            <div className="time-pickers-row">
              <label className="time-label">
                <span>Morning Alignment Time</span>
                <input
                  type="time"
                  className="p-time-input"
                  value={preferences.morningReminderTime}
                  onChange={(e) => setPreferences({ ...preferences, morningReminderTime: e.target.value })}
                />
              </label>

              <label className="time-label">
                <span>Evening Surrender Time</span>
                <input
                  type="time"
                  className="p-time-input"
                  value={preferences.eveningReminderTime}
                  onChange={(e) => setPreferences({ ...preferences, eveningReminderTime: e.target.value })}
                />
              </label>
            </div>

            {/* Save Button */}
            <button
              className="save-pref-btn"
              onClick={handleSavePreferences}
              disabled={isSaving}
            >
              {isSaving ? 'Syncing...' : 'Save Neuro-Preferences'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
