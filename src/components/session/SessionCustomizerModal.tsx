import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  Waves,
  Mic,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  Sun,
  Brain,
  Moon,
  Footprints
} from 'lucide-react';
import type { ConceptItem } from './IntentionBreakdown';
import { api } from '../../services/api';
import { usePlayer, type SessionTrack } from '../../context/PlayerContext';

interface SessionCustomizerModalProps {
  concept: ConceptItem;
  answers: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: any) => void;
}

export const SessionCustomizerModal: React.FC<SessionCustomizerModalProps> = ({
  concept,
  answers,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { play } = usePlayer();

  // Settings State
  const [durationMinutes, setDurationMinutes] = useState<number>(concept.suggestedDuration || 5);
  const [usageContext, setUsageContext] = useState<string>('focus');
  const [ambienceTrackId, setAmbienceTrackId] = useState<string>(concept.suggestedAmbience || 'rain-light');
  const [frequencyHz, setFrequencyHz] = useState<number | undefined>(concept.suggestedFrequencyHz || 432);
  const [voiceId, setVoiceId] = useState<string>('bella');
  const [ttsProvider, setTtsProvider] = useState<'elevenlabs' | 'azure'>('elevenlabs');
  const [subliminalIntensity, setSubliminalIntensity] = useState<'subtle' | 'balanced' | 'prominent'>('subtle');

  // Catalog options fetched from backend
  const [ambienceOptions, setAmbienceOptions] = useState<any[]>([]);
  const [voiceOptions, setVoiceOptions] = useState<any[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<any[]>([]);

  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('IDLE'); // SCRIPT -> VOICE -> MIX -> DONE
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedSession, setCompletedSession] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getSessionCatalog().then((res: any) => {
      if (mounted && res?.success) {
        setAmbienceOptions(res.ambience || []);
        setVoiceOptions(res.voices || []);
        setFrequencyOptions(res.frequencies || []);
      }
    }).catch(console.warn);
    return () => { mounted = false; };
  }, []);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setCurrentStep('GENERATING_SCRIPT');

    try {
      const normalizedAnswers = {
        desiredOutcome:
          answers?.desiredOutcome ||
          answers?.specificIntention ||
          answers?.desire ||
          concept.targetOutcome ||
          concept.description ||
          concept.title ||
          'Optimal mental clarity and self-realization',
        desiredIdentity:
          answers?.desiredIdentity ||
          answers?.identity ||
          concept.title ||
          'Aligned & Focused Creator',
        emotionalState:
          answers?.emotionalState ||
          answers?.feelings ||
          'Calm, Centered, Confident',
        currentBlock:
          answers?.currentBlock ||
          'Overthinking',
        dailyAction:
          answers?.dailyAction ||
          answers?.action ||
          'Consistent creative focus',
        category:
          concept.category ||
          answers?.category ||
          answers?.desire ||
          'Focus'
      };

      const res: any = await api.createPersonalizedSession({
        concept,
        answers: normalizedAnswers,
        settings: {
          durationMinutes,
          usageContext,
          ambienceTrackId,
          frequencyHz: frequencyHz || undefined,
          voiceId,
          ttsProvider,
          subliminalIntensity
        }
      });

      if (!res?.success || !res?.session?._id) {
        throw new Error(res?.message || 'Failed to initialize session generation');
      }

      const sessionId = res.session._id;

      // Poll session status until completed or failed
      const pollInterval = setInterval(async () => {
        try {
          const pollRes: any = await api.getSession(sessionId);
          const s = pollRes?.session;
          if (!s) return;

          setCurrentStep(s.status);

          if (s.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setCompletedSession(s);
            onSuccess(s);
          } else if (s.status === 'FAILED') {
            clearInterval(pollInterval);
            setErrorMsg(s.error || 'Audio generation encountered an error. Please retry.');
          }
        } catch (err: any) {
          console.warn('[Poll Error]', err);
        }
      }, 2000);

    } catch (err: any) {
      console.error('[Generation Error]', err);
      setErrorMsg(err.message || 'Error creating session');
      setCurrentStep('FAILED');
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
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      spokenAffirmations: completedSession.script?.affirmations || []
    };

    play(track);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0b0d1e] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
              Make It Yours
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{concept.title}</h3>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Active Generation Progress Screen */}
          {isGenerating ? (
            <div className="py-8 px-4 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles size={32} className="text-cyan-300 animate-pulse" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Synthesizing Your Session</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Constructing personalized subconscious affirmations and harmonic soundscape.
                </p>
              </div>

              {/* Steps Progress */}
              <div className="max-w-md mx-auto space-y-3 text-left">
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  currentStep === 'GENERATING_SCRIPT'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : currentStep === 'GENERATING_VOICE' || currentStep === 'MIXING_AUDIO' || currentStep === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-400'
                }`}>
                  <CheckCircle2 size={18} className={currentStep === 'GENERATING_VOICE' || currentStep === 'MIXING_AUDIO' || currentStep === 'COMPLETED' ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className="text-xs font-semibold">1. Crafting Subconscious Script with Gemini</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  currentStep === 'GENERATING_VOICE'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : currentStep === 'MIXING_AUDIO' || currentStep === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-400'
                }`}>
                  <CheckCircle2 size={18} className={currentStep === 'MIXING_AUDIO' || currentStep === 'COMPLETED' ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className="text-xs font-semibold">2. Synthesizing Vocal Resonance ({voiceId})</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  currentStep === 'MIXING_AUDIO'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : currentStep === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-400'
                }`}>
                  <CheckCircle2 size={18} className={currentStep === 'COMPLETED' ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className="text-xs font-semibold">3. Layering Real Rain & Harmonic Frequency (FFmpeg)</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  currentStep === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-bold'
                    : 'bg-white/[0.02] border-white/5 text-gray-400'
                }`}>
                  <CheckCircle2 size={18} className={currentStep === 'COMPLETED' ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className="text-xs">4. High-Fidelity Audio Master Ready</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 max-w-md mx-auto">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {currentStep === 'COMPLETED' && (
                <button
                  onClick={handlePlayNow}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 mx-auto animate-bounce"
                >
                  <Play size={18} /> Play Now in Orbit
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Duration Selector */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Clock size={14} className="text-cyan-400" /> Session Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        durationMinutes === mins
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                          : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage Context */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Sliders size={14} className="text-purple-400" /> Usage Context
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'focus', label: 'Deep Focus', icon: Brain },
                    { id: 'meditation', label: 'Meditation', icon: Waves },
                    { id: 'sleep', label: 'Sleep & Rest', icon: Moon },
                    { id: 'morning', label: 'Morning Awakening', icon: Sun },
                    { id: 'walking', label: 'Active Movement', icon: Footprints },
                  ].map((ctx) => {
                    const Icon = ctx.icon;
                    return (
                      <button
                        key={ctx.id}
                        onClick={() => setUsageContext(ctx.id)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                          usageContext === ctx.id
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{ctx.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambience Track */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Waves size={14} className="text-emerald-400" /> Background Ambience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(ambienceOptions.length > 0 ? ambienceOptions : [
                    { id: 'rain-light', name: 'Gentle Rain', description: 'Soft soothing rainfall' },
                    { id: 'rain-window', name: 'Rain on Window', description: 'Warm rhythmic drops on glass' },
                    { id: 'rain-lluvia', name: 'Deep Forest Rain', description: 'Immersive forest showers' },
                    { id: 'noise-brown', name: 'Cosmic Brown Noise', description: 'Deep low frequency rumble' }
                  ]).map((amb) => (
                    <button
                      key={amb.id}
                      onClick={() => setAmbienceTrackId(amb.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        ambienceTrackId === amb.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{amb.name}</div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">{amb.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Solfeggio / Harmonic Frequency */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> Harmonic Frequency
                  </span>
                  <span className="text-[10px] text-gray-400 lowercase">subtle sine wave alignment</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFrequencyHz(undefined)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      !frequencyHz
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    None (Natural)
                  </button>
                  {(frequencyOptions.length > 0 ? frequencyOptions : [
                    { hz: 432, label: '432 Hz', intent: 'Deep grounding' },
                    { hz: 528, label: '528 Hz', intent: 'Transformation' },
                    { hz: 639, label: '639 Hz', intent: 'Heart resonance' },
                    { hz: 741, label: '741 Hz', intent: 'Clarity' },
                    { hz: 396, label: '396 Hz', intent: 'Release' },
                  ]).map((freq) => (
                    <button
                      key={freq.hz}
                      onClick={() => setFrequencyHz(freq.hz)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                        frequencyHz === freq.hz
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold">{freq.label}</div>
                      <div className="text-[10px] text-gray-400 truncate">{freq.intent}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice & Intensity */}
              <div className="grid grid-cols-2 gap-4">
                {/* Voice */}
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Mic size={14} className="text-blue-400" /> Voice Character
                  </label>
                  <select
                    value={voiceId}
                    onChange={(e) => {
                      const v = voiceOptions.find(o => o.id === e.target.value);
                      setVoiceId(e.target.value);
                      if (v?.provider) setTtsProvider(v.provider);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#14162e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {(voiceOptions.length > 0 ? voiceOptions : [
                      { id: 'bella', name: 'Bella', label: 'Soft & Gentle' },
                      { id: 'adam', name: 'Adam', label: 'Deep & Grounded' },
                      { id: 'antoni', name: 'Antoni', label: 'Warm & Calm' },
                      { id: 'arnold', name: 'Arnold', label: 'Strong & Focused' },
                    ]).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.label})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subliminal Intensity */}
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Sliders size={14} className="text-cyan-400" /> Subliminal Layering
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['subtle', 'balanced', 'prominent'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSubliminalIntensity(lvl)}
                        className={`py-2.5 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                          subliminalIntensity === lvl
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isGenerating && (
          <div className="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleStartGeneration}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles size={16} /> Generate Audio Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
