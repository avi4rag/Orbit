import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Waves,
  Clock,
  Sliders,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Volume2,
  Mic
} from 'lucide-react';
import { api } from '../services/api';
import { usePlayer, type SessionTrack } from '../context/PlayerContext';

export interface ConceptItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rationale: string;
  recommendedAtmosphere: string;
  recommendedUsage: string;
  recommendedDuration: number;
  recommendedVoiceStyle: string;
}

export const CreateSessionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { play } = usePlayer();

  // State loaded from navigation or fetched from latest MongoDB record
  const [onboardingId, setOnboardingId] = useState<string>(location.state?.onboardingId || '');
  const [answers, setAnswers] = useState<any>(location.state?.answers || null);
  const [concepts, setConcepts] = useState<ConceptItem[]>(location.state?.concepts || []);
  const [isLoading, setIsLoading] = useState<boolean>(!location.state?.concepts);

  // Selected Concept for Phase 8 Customization
  const [selectedConcept, setSelectedConcept] = useState<ConceptItem | null>(null);

  // Ambience Preview Audio element
  const [previewingAmbience, setPreviewingAmbience] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Customization Form State (Phase 8)
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);

  const [usageContext, setUsageContext] = useState<string>('Focus');
  const [ambienceTrackId, setAmbienceTrackId] = useState<string>('rain-light');
  const [frequencyOption, setFrequencyOption] = useState<string>('432');
  const [customFrequency, setCustomFrequency] = useState<string>('');
  const [ttsProvider, setTtsProvider] = useState<'elevenlabs' | 'azure'>('elevenlabs');
  const [voiceStyle, setVoiceStyle] = useState<string>('Calm');
  const [intensity, setIntensity] = useState<'Normal' | 'Soft' | 'Very Soft'>('Soft');

  // Generation Pipeline State (Phase 9)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pipelineStatus, setPipelineStatus] = useState<string>('IDLE');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [completedSession, setCompletedSession] = useState<any | null>(null);

  // Load onboarding data if navigated directly
  useEffect(() => {
    let isMounted = true;
    if (!concepts.length) {
      setIsLoading(true);
      const savedId = localStorage.getItem('orbit_latest_onboarding_id');
      const fetchPromise = savedId ? api.getOnboarding(savedId) : api.getLatestOnboarding();

      fetchPromise
        .then((res: any) => {
          if (isMounted && res?.success) {
            setOnboardingId(res.onboardingId);
            setAnswers(res.answers);
            setConcepts(res.concepts || []);
          }
        })
        .catch((err) => {
          console.warn('[CreateSessionPage] Load onboarding error:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // When a concept is chosen, populate recommended defaults
  const handleChooseConcept = (concept: ConceptItem) => {
    setSelectedConcept(concept);
    setDurationMinutes(concept.recommendedDuration || 15);
    setIsCustomDuration(false);
    setUsageContext(concept.recommendedUsage || 'Focus');
    setVoiceStyle(concept.recommendedVoiceStyle || 'Calm');

    // Map recommended atmosphere
    if (concept.recommendedAtmosphere?.includes('Window')) {
      setAmbienceTrackId('rain-window');
    } else if (concept.recommendedAtmosphere?.includes('Forest')) {
      setAmbienceTrackId('rain-lluvia');
    } else if (concept.recommendedAtmosphere?.includes('Brown')) {
      setAmbienceTrackId('noise-brown');
    } else if (concept.recommendedAtmosphere?.includes('Pink')) {
      setAmbienceTrackId('noise-pink');
    } else {
      setAmbienceTrackId('rain-light');
    }

    // Scroll smoothly to customization section
    setTimeout(() => {
      document.getElementById('customization-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Preview Atmosphere Audio
  const handleToggleAtmospherePreview = (atmosphereName: string) => {
    if (previewingAmbience === atmosphereName) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingAmbience(null);
      return;
    }

    let audioSrc = '/media/ambience/rain/light-rain-ambient.mp3';
    if (atmosphereName.includes('Window')) audioSrc = '/media/ambience/rain/rain-on-the-window.mp3';
    if (atmosphereName.includes('Forest') || atmosphereName.includes('lluvia')) audioSrc = '/media/ambience/rain/lluvia-rain.mp3';

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
    }
    previewAudioRef.current.src = audioSrc;
    previewAudioRef.current.volume = 0.4;
    previewAudioRef.current.play().catch(console.warn);
    setPreviewingAmbience(atmosphereName);
  };

  // Phase 9: Audio Generation Trigger
  const handleStartGeneration = async () => {
    if (!selectedConcept) return;

    setIsGenerating(true);
    setGenerationError(null);
    setPipelineStatus('GENERATING_SCRIPT');

    const effectiveDuration = isCustomDuration
      ? Math.max(1, parseInt(customDuration, 10) || 15)
      : durationMinutes;

    let frequencyHz: number | undefined = undefined;
    if (frequencyOption === 'Custom') {
      frequencyHz = parseInt(customFrequency, 10) || undefined;
    } else if (frequencyOption !== 'None') {
      frequencyHz = parseInt(frequencyOption, 10) || undefined;
    }

    // Map voice style to real TTS voice id
    let voiceId = 'bella'; // Soft
    if (voiceStyle === 'Deep') voiceId = 'adam';
    if (voiceStyle === 'Warm') voiceId = 'antoni';
    if (voiceStyle === 'Neutral') voiceId = 'arnold';
    if (voiceStyle === 'Gentle') voiceId = 'bella';
    if (voiceStyle === 'Calm') voiceId = 'bella';

    const intensityMapped = intensity === 'Very Soft' ? 'subtle' : intensity === 'Soft' ? 'balanced' : 'prominent';

    try {
      const res: any = await api.createPersonalizedSession({
        concept: {
          title: selectedConcept.title,
          targetOutcome: selectedConcept.description,
          category: selectedConcept.category || answers?.desire || 'Focus'
        },
        answers: {
          ...(answers || {
            desiredOutcome: selectedConcept.category,
            desiredIdentity: selectedConcept.title,
            emotionalState: 'Calm, Centered',
            currentBlock: 'Overthinking',
            dailyAction: 'Consistent creative focus',
            category: selectedConcept.category
          }),
          onboardingId: onboardingId || undefined
        },
        settings: {
          durationMinutes: effectiveDuration,
          usageContext: usageContext.toLowerCase(),
          ambienceTrackId,
          frequencyHz,
          voiceId,
          ttsProvider,
          subliminalIntensity: intensityMapped
        }
      });

      if (!res?.success || !res?.session?._id) {
        throw new Error(res?.message || 'Failed to initialize session generation');
      }

      const sessionId = res.session._id;

      // Poll session status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes: any = await api.getSession(sessionId);
          const s = pollRes?.session;
          if (!s) return;

          setPipelineStatus(s.status);

          if (s.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setCompletedSession(s);
          } else if (s.status === 'FAILED') {
            clearInterval(pollInterval);
            setGenerationError(s.error || 'Generation encountered an error. Please retry.');
          }
        } catch (err) {
          console.warn('[Poll Error]', err);
        }
      }, 2000);

    } catch (err: any) {
      console.error('[Generation Error]', err);
      setGenerationError(err.message || 'Error creating session');
      setPipelineStatus('FAILED');
    }
  };

  const handlePlayNow = () => {
    if (!completedSession) return;
    const track: SessionTrack = {
      id: completedSession._id,
      title: completedSession.title,
      creator: 'Orbit AI',
      category: completedSession.category || 'Manifestation',
      duration: completedSession.audio.durationSeconds,
      audioUrl: completedSession.audio.url,
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      spokenAffirmations: completedSession.script?.affirmations || []
    };
    play(track);
    navigate('/subliminals');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060713] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white tracking-wide">Retrieving Your Intention Profile...</h2>
        <p className="text-xs text-gray-400 mt-1">Connecting to MongoDB Atlas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060713] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Top Breadcrumb & Intention Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Re-take Intention Questionnaire
          </Link>
          {answers && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                Outcome: {answers.desire}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
                Releasing: {answers.currentBlock}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                Identity: {answers.identity}
              </span>
            </div>
          )}
        </div>

        {/* Phase 4 Header: Exact copy required */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Personalized Subconscious Architect
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
            YOUR ORBIT SESSIONS
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-medium">
            Based on what you shared, here are a few directions you can explore.
          </p>
        </div>

        {/* Phase 5 & 6: 6–10 Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {concepts.map((concept, index) => {
            const isSelected = selectedConcept?.id === concept.id;
            return (
              <div
                key={concept.id || index}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/40 to-indigo-950/40 border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Concept #{index + 1} • {concept.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} className="text-cyan-400" />
                      {concept.recommendedDuration} min
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{concept.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{concept.description}</p>

                  {/* Why it was selected */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300">
                    <strong className="text-cyan-300">Why this was selected: </strong>
                    {concept.rationale}
                  </div>

                  {/* Recommendations */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      Atmosphere: <strong className="text-gray-200">{concept.recommendedAtmosphere}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      Usage: <strong className="text-gray-200">{concept.recommendedUsage}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      Voice: <strong className="text-gray-200">{concept.recommendedVoiceStyle}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Actions: Preview Atmosphere & Choose */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleAtmospherePreview(concept.recommendedAtmosphere)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    {previewingAmbience === concept.recommendedAtmosphere ? (
                      <>
                        <Pause size={14} className="text-cyan-400" /> Stop Preview
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} className="text-cyan-400" /> Preview Atmosphere
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChooseConcept(concept)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                        : 'bg-white/10 hover:bg-cyan-500 hover:text-black text-white'
                    }`}
                  >
                    {isSelected ? '✓ Chosen' : 'Choose →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase 8: Customization Section ("Make It Yours") */}
        {selectedConcept && (
          <div
            id="customization-section"
            className="p-8 rounded-3xl bg-gradient-to-b from-[#0e122b] to-[#07091a] border border-cyan-500/40 shadow-2xl space-y-8 animate-fade-in"
          >
            <div className="border-b border-white/10 pb-6">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                Phase 8 Customization
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Customize: "{selectedConcept.title}"
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Fine-tune every acoustic and subliminal parameter before creating your session.
              </p>
            </div>

            {/* 1. DURATION */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" /> Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(mins);
                      setIsCustomDuration(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      durationMinutes === mins && !isCustomDuration
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isCustomDuration
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-gray-400'
                  }`}
                >
                  Custom
                </button>
              </div>
              {isCustomDuration && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Enter minutes (e.g. 25)"
                    className="p-2.5 rounded-xl bg-white/[0.05] border border-cyan-400 text-white text-xs w-48 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">minutes</span>
                </div>
              )}
            </div>

            {/* 2. USAGE */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-purple-400" /> Usage
              </label>
              <div className="flex flex-wrap gap-2">
                {['Morning', 'Daytime', 'Focus', 'Evening', 'Night', 'Sleep / Overnight', 'Repeat / Anytime'].map(
                  (u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUsageContext(u)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        usageContext === u
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
                          : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {u}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 3. AMBIENCE */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Waves size={16} className="text-emerald-400" /> Ambience Catalogue
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'rain-light', name: 'Gentle Rain', desc: 'Soft soothing rainfall' },
                  { id: 'rain-window', name: 'Rain on the Window', desc: 'Warm intimate drops on glass' },
                  { id: 'rain-lluvia', name: 'Deep Forest Rain', desc: 'Rich immersive shower' },
                  { id: 'noise-brown', name: 'Cosmic Brown Noise', desc: 'Warm low rumble for deep work' },
                  { id: 'noise-pink', name: 'Pink Flow', desc: 'Natural balanced breeze' }
                ].map((amb) => (
                  <button
                    key={amb.id}
                    type="button"
                    onClick={() => setAmbienceTrackId(amb.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      ambienceTrackId === amb.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{amb.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{amb.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. FREQUENCY */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" /> Frequency
                </span>
                <span className="text-[10px] text-gray-400 lowercase">subtle sine wave harmonic</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['None', '432', '528', '639', '741', '852', 'Custom'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequencyOption(freq)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      frequencyOption === freq
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {freq === 'None' || freq === 'Custom' ? freq : `${freq} Hz`}
                  </button>
                ))}
              </div>
              {frequencyOption === 'Custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    value={customFrequency}
                    onChange={(e) => setCustomFrequency(e.target.value)}
                    placeholder="Enter Hz (e.g. 963)"
                    className="p-2.5 rounded-xl bg-white/[0.05] border border-amber-400 text-white text-xs w-48 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">Hz</span>
                </div>
              )}
            </div>

            {/* 5. TTS PROVIDER & 6. VOICE & 7. INTENSITY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* TTS Provider */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  TTS Provider
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'elevenlabs', label: 'ElevenLabs' },
                    { id: 'azure', label: 'Microsoft Azure' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTtsProvider(p.id as any)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        ttsProvider === p.id
                          ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                          : 'bg-white/[0.03] border-white/10 text-gray-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic size={14} className="text-blue-400" /> Voice Style
                </label>
                <select
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#14162e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {['Calm', 'Soft', 'Warm', 'Deep', 'Neutral', 'Gentle'].map((v) => (
                    <option key={v} value={v}>
                      {v} Voice
                    </option>
                  ))}
                </select>
              </div>

              {/* Intensity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Intensity
                </label>
                <div className="flex gap-2">
                  {(['Normal', 'Soft', 'Very Soft'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`flex-1 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
                        intensity === lvl
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-white/[0.03] border-white/10 text-gray-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase 9: Real-time Audio Generation Progress */}
            {isGenerating && (
              <div className="p-6 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                    Audio Pipeline Synthesis
                  </h4>
                  <span className="text-xs text-cyan-300 font-mono uppercase">{pipelineStatus}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    pipelineStatus === 'GENERATING_SCRIPT'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                      : pipelineStatus === 'GENERATING_VOICE' || pipelineStatus === 'MIXING_AUDIO' || pipelineStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}>
                    <CheckCircle2 size={14} /> 1. Gemini Script
                  </div>
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    pipelineStatus === 'GENERATING_VOICE'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                      : pipelineStatus === 'MIXING_AUDIO' || pipelineStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}>
                    <CheckCircle2 size={14} /> 2. {ttsProvider === 'azure' ? 'Azure' : 'ElevenLabs'} TTS
                  </div>
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    pipelineStatus === 'MIXING_AUDIO'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                      : pipelineStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}>
                    <CheckCircle2 size={14} /> 3. FFmpeg Mixer
                  </div>
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    pipelineStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}>
                    <CheckCircle2 size={14} /> 4. Audio Ready
                  </div>
                </div>

                {generationError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{generationError}</span>
                  </div>
                )}

                {pipelineStatus === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={handlePlayNow}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 animate-bounce"
                  >
                    <Play size={18} /> Play Now in Orbit
                  </button>
                )}
              </div>
            )}

            {/* Action Bar */}
            {!isGenerating && (
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedConcept(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  ← Choose Another Concept
                </button>
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                >
                  <Sparkles size={16} /> GENERATE SESSION
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSessionPage;
