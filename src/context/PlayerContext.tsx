import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { spokenAffirmationEngine } from '../services/audio/SpokenAffirmationEngine';
import { webAudioEngine, resolveAtmosphereTexture } from '../services/audio/WebAudioEngine';

export interface SessionTrack {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  category: string;
  duration: number;       // seconds
  sourceDuration?: number;
  audioUrl?: string;      // authentic MP3 streaming URL
  audioStorageKey?: string;
  processingStatus?:
    | 'PENDING'
    | 'PROCESSING'
    | 'DOWNLOADING'
    | 'CONVERTING'
    | 'UPLOADING'
    | 'COMPLETED'
    | 'FAILED'
    | 'ready'
    | 'processing';
  processingError?: string;
  audioFileHash?: string; // SHA-256 fingerprint
  binauralFreq?: number;
  carrierFreq?: number;
  atmosphere?: string;
  voiceStyle?: string;
  intensity?: 'subtle' | 'balanced' | 'prominent';
  spokenAffirmations?: string[];
}

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;
export type SleepTimer = 5 | 15 | 30 | 45 | 60 | null;

interface PlayerState {
  isPlaying: boolean;
  currentTrack: SessionTrack | null;
  queue: SessionTrack[];
  elapsed: number;           // seconds
  volume: number;            // 0-1
  speed: PlaybackSpeed;
  isMuted: boolean;
  sleepTimer: SleepTimer;
  sleepRemainingSeconds: number | null;
  activeAffirmation: string | null;
  isFullscreen: boolean;
  audioError: string | null;
}

interface PlayerContextType extends PlayerState {
  play: (track: SessionTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: SleepTimer) => void;
  addToQueue: (track: SessionTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  skipNext: () => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
  setFrequency: (carrier: number, binaural?: number) => void;
  clearAudioError: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    queue: [],
    elapsed: 0,
    volume: 0.8,
    speed: 1,
    isMuted: false,
    sleepTimer: null,
    sleepRemainingSeconds: null,
    activeAffirmation: null,
    isFullscreen: false,
    audioError: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elapsedRef = useRef(0);
  const currentTrackRef = useRef<SessionTrack | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const affirmationIndexRef = useRef(0);
  const affirmationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syntheticTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync MediaSession API (lock screen / headphone controls / progress bar)
  const syncMediaSession = useCallback((track: SessionTrack, playing: boolean, currentElapsed?: number) => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.creator,
        album: 'Orbit — Celestial Soundscapes',
        artwork: [
          { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        ],
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      if ('setPositionState' in navigator.mediaSession && track.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: track.duration,
          playbackRate: state.speed,
          position: Math.min(track.duration, currentElapsed ?? elapsedRef.current),
        });
      }
    } catch {
      // Ignore unsupported browser features
    }
  }, [state.speed]);

  const clearAudioError = useCallback(() => {
    setState(prev => ({ ...prev, audioError: null }));
  }, []);

  const skipNext = useCallback(() => {
    setState(prev => {
      if (!prev.queue.length) return prev;
      const [next, ...rest] = prev.queue;
      // Trigger play on next track
      setTimeout(() => {
        play(next);
      }, 0);
      return { ...prev, queue: rest };
    });
  }, []);

  const stopSyntheticPlayback = useCallback(() => {
    webAudioEngine.stopSoundscape();
    if (syntheticTimerRef.current) {
      clearInterval(syntheticTimerRef.current);
      syntheticTimerRef.current = null;
    }
  }, []);

  const startSyntheticPlayback = useCallback((track: SessionTrack) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const texture = resolveAtmosphereTexture(track.atmosphere || track.title || track.category);
      webAudioEngine.startSoundscape({
        carrierFreq: track.carrierFreq || 432,
        binauralFreq: track.binauralFreq || 6,
        texture,
        includeNoise: true,
        includeDrone: true,
      });
      webAudioEngine.setVolume(state.isMuted ? 0 : state.volume);

      if (syntheticTimerRef.current) clearInterval(syntheticTimerRef.current);
      syntheticTimerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        const cur = elapsedRef.current;
        setState(prev => {
          if (prev.currentTrack && cur % 5 === 0) {
            syncMediaSession(prev.currentTrack, true, cur);
          }
          if (cur >= (prev.currentTrack?.duration || 900)) {
            if (syntheticTimerRef.current) clearInterval(syntheticTimerRef.current);
            skipNext();
          }
          return { ...prev, elapsed: cur, isPlaying: true, audioError: null };
        });
      }, 1000);
    } catch (err) {
      console.warn('[Orbit AudioPlayer] WebAudioEngine start error:', err);
    }
  }, [state.isMuted, state.volume, syncMediaSession, skipNext]);

  const startSyntheticPlaybackRef = useRef(startSyntheticPlayback);
  startSyntheticPlaybackRef.current = startSyntheticPlayback;

  // Initialize native HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!audio.paused) {
        const cur = Math.floor(audio.currentTime);
        elapsedRef.current = cur;
        setState(prev => {
          if (prev.currentTrack && cur % 5 === 0) {
            syncMediaSession(prev.currentTrack, true, cur);
          }
          return { ...prev, elapsed: cur };
        });
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const dur = Math.round(audio.duration);
        setState(prev => prev.currentTrack ? {
          ...prev,
          currentTrack: { ...prev.currentTrack, duration: dur }
        } : prev);
      }
    };

    const onPlay = () => setState(prev => ({ ...prev, isPlaying: true, audioError: null }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const onEnded = () => {
      skipNext();
    };

    const onError = () => {
      const err = audio.error;
      console.warn('[Orbit AudioPlayer] HTMLAudioElement error event, engaging WebAudio synthesizer fallback:', err);
      const cur = currentTrackRef.current;
      if (cur) {
        startSyntheticPlaybackRef.current(cur);
        setState(prev => ({
          ...prev,
          isPlaying: true,
          audioError: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          audioError: 'Audio playback failed or media is unavailable.',
        }));
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      stopSyntheticPlayback();
      audio.pause();
      audio.src = '';
    };
  }, [syncMediaSession, skipNext, stopSyntheticPlayback]);

  // Restore last session on relaunch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('orbit_last_played_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.track && parsed.elapsed !== undefined) {
          elapsedRef.current = parsed.elapsed;
          setState(prev => ({
            ...prev,
            currentTrack: parsed.track,
            elapsed: parsed.elapsed,
            volume: parsed.volume ?? prev.volume,
          }));
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist session to local storage for resume-on-relaunch
  useEffect(() => {
    if (state.currentTrack) {
      try {
        localStorage.setItem('orbit_last_played_session', JSON.stringify({
          track: state.currentTrack,
          elapsed: state.elapsed,
          volume: state.volume,
          timestamp: Date.now(),
        }));
      } catch {
        // Ignore quota errors
      }
    }
  }, [state.currentTrack, state.elapsed, state.volume]);

  const startAffirmationCycle = useCallback((affirmations: string[]) => {
    if (!affirmations.length) return;
    if (affirmationIntervalRef.current) clearInterval(affirmationIntervalRef.current);

    affirmationIndexRef.current = 0;
    setState(prev => ({ ...prev, activeAffirmation: affirmations[0] }));

    // Rotate affirmations every 25 seconds (displayed in mini/full player)
    affirmationIntervalRef.current = setInterval(() => {
      affirmationIndexRef.current = (affirmationIndexRef.current + 1) % affirmations.length;
      setState(prev => ({ ...prev, activeAffirmation: affirmations[affirmationIndexRef.current] }));
    }, 25000);
  }, []);

  const stopAffirmationCycle = useCallback(() => {
    if (affirmationIntervalRef.current) {
      clearInterval(affirmationIntervalRef.current);
      affirmationIntervalRef.current = null;
    }
    spokenAffirmationEngine.stop();
    setState(prev => ({ ...prev, activeAffirmation: null }));
  }, []);

  const play = useCallback((track: SessionTrack) => {
    stopAffirmationCycle();
    stopSyntheticPlayback();
    currentTrackRef.current = track;

    // STRICT CHECK: Disallow fake/placeholder playback
    const isStillProcessing =
      track.processingStatus === 'PENDING' ||
      track.processingStatus === 'PROCESSING' ||
      track.processingStatus === 'DOWNLOADING' ||
      track.processingStatus === 'CONVERTING' ||
      track.processingStatus === 'UPLOADING' ||
      track.processingStatus === 'processing';

    if (isStillProcessing || track.processingStatus === 'FAILED') {
      const msg = isStillProcessing
        ? 'Audio is still being processed.'
        : track.processingError || 'Audio unavailable.';
      console.warn(`[Orbit AudioPlayer] Play blocked for "${track.title}": ${msg}`);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        audioError: msg,
      }));
      return;
    }

    elapsedRef.current = 0;
    const audio = audioRef.current;

    // 1. Ambience & Frequency Soundbed Layer
    if (!track.audioUrl || track.audioUrl.trim() === '') {
      console.info(`[Orbit AudioPlayer] Audio stream URL empty, starting acoustic synthesizer for "${track.title}"`);
      startSyntheticPlayback(track);
    } else if (audio) {
      audio.pause();
      // Ensure source URL is clean
      audio.src = track.audioUrl;
      audio.playbackRate = state.speed;
      audio.volume = state.isMuted ? 0 : state.volume;
      audio.load();

      audio.play().catch(err => {
        if (err.name === 'AbortError') {
          return;
        }
        console.warn('[Orbit AudioPlayer] Stream playback error, engaging WebAudio synthesizer fallback:', err);
        startSyntheticPlayback(track);
        setState(prev => ({ ...prev, isPlaying: true, audioError: null }));
      });

      // Layer in pure Solfeggio carrier frequency harmonic underneath the audio stream if frequency is specified
      if (track.carrierFreq) {
        webAudioEngine.startSoundscape({
          carrierFreq: track.carrierFreq,
          binauralFreq: track.binauralFreq || 6,
          texture: 'none',
        });
        webAudioEngine.setVolume(state.isMuted ? 0 : state.volume * 0.25);
      }
    }

    // 2. Subliminal Spoken Affirmations Layer (Trigger immediately inside user click gesture)
    if (track.spokenAffirmations && track.spokenAffirmations.length > 0) {
      startAffirmationCycle(track.spokenAffirmations);
      const intensity = track.intensity || 'balanced';
      const speechVolume = intensity === 'subtle' ? 0.35 : intensity === 'balanced' ? 0.55 : 0.85;
      spokenAffirmationEngine.speakSequence(
        track.spokenAffirmations,
        {
          voiceStyle: track.voiceStyle || 'Calm',
          volume: state.isMuted ? 0 : state.volume * speechVolume,
          loop: true,
        },
        (_idx, text) => setState(prev => ({ ...prev, activeAffirmation: text }))
      );
    }

    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentTrack: track,
      elapsed: 0,
      audioError: null,
    }));

    syncMediaSession(track, true);
  }, [state.speed, state.volume, state.isMuted, stopAffirmationCycle, stopSyntheticPlayback, startSyntheticPlayback, startAffirmationCycle, syncMediaSession]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    webAudioEngine.pause();
    if (syntheticTimerRef.current) {
      clearInterval(syntheticTimerRef.current);
      syntheticTimerRef.current = null;
    }
    spokenAffirmationEngine.pause();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, false);
      return { ...prev, isPlaying: false };
    });
  }, [syncMediaSession]);

  const resume = useCallback(() => {
    if (webAudioEngine.getIsRunning()) {
      webAudioEngine.resume();
      if (syntheticTimerRef.current) clearInterval(syntheticTimerRef.current);
      syntheticTimerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        const cur = elapsedRef.current;
        setState(prev => {
          if (prev.currentTrack && cur % 5 === 0) {
            syncMediaSession(prev.currentTrack, true, cur);
          }
          if (cur >= (prev.currentTrack?.duration || 900)) {
            if (syntheticTimerRef.current) clearInterval(syntheticTimerRef.current);
            skipNext();
          }
          return { ...prev, elapsed: cur, isPlaying: true, audioError: null };
        });
      }, 1000);
    } else if (state.currentTrack?.audioUrl) {
      audioRef.current?.play().catch(err => {
        console.warn('[Orbit AudioPlayer] Resume error, falling back to WebAudio:', err);
        if (state.currentTrack) {
          startSyntheticPlayback(state.currentTrack);
        }
      });
    } else if (state.currentTrack) {
      startSyntheticPlayback(state.currentTrack);
    }

    spokenAffirmationEngine.resume();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, true);
      return { ...prev, isPlaying: true, audioError: null };
    });
  }, [state.currentTrack, syncMediaSession, skipNext, startSyntheticPlayback]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSyntheticPlayback();
    spokenAffirmationEngine.stop();
    stopAffirmationCycle();
    elapsedRef.current = 0;
    currentTrackRef.current = null;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTrack: null,
      elapsed: 0,
      activeAffirmation: null,
      audioError: null,
    }));
  }, [stopAffirmationCycle, stopSyntheticPlayback]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && !webAudioEngine.getIsRunning()) {
      try {
        audioRef.current.currentTime = seconds;
      } catch {
        // Ignore seek error before loaded
      }
    }
    elapsedRef.current = seconds;
    setState(prev => ({ ...prev, elapsed: seconds }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    webAudioEngine.setVolume(clamped);
    spokenAffirmationEngine.setVolume(clamped * 0.7);
    setState(prev => ({ ...prev, volume: clamped, isMuted: clamped === 0 }));
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setState(prev => ({ ...prev, speed }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const muted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.muted = muted;
      }
      webAudioEngine.setVolume(muted ? 0 : prev.volume);
      spokenAffirmationEngine.setVolume(muted ? 0 : prev.volume * 0.7);
      return { ...prev, isMuted: muted };
    });
  }, []);

  const setSleepTimer = useCallback((minutes: SleepTimer) => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    if (!minutes) {
      setState(prev => ({ ...prev, sleepTimer: null, sleepRemainingSeconds: null }));
      return;
    }

    let remaining = minutes * 60;
    setState(prev => ({ ...prev, sleepTimer: minutes, sleepRemainingSeconds: remaining }));

    sleepIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setState(prev => ({ ...prev, sleepRemainingSeconds: remaining }));

      // Gentle audio fadeout in final 10 seconds for serene sleep transition
      if (remaining <= 10 && remaining > 0) {
        const ratio = remaining / 10;
        if (audioRef.current) {
          audioRef.current.volume = state.volume * ratio;
        }
        webAudioEngine.setVolume(state.volume * ratio);
      }

      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current!);
        stop();
        if (audioRef.current) {
          audioRef.current.volume = state.volume;
        }
        webAudioEngine.setVolume(state.volume);
        setState(prev => ({ ...prev, sleepTimer: null, sleepRemainingSeconds: null }));
      }
    }, 1000);
  }, [stop, state.volume]);

  const addToQueue = useCallback((track: SessionTrack) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, queue: [] }));
  }, []);

  const openFullscreen = useCallback(() => setState(prev => ({ ...prev, isFullscreen: true })), []);
  const closeFullscreen = useCallback(() => setState(prev => ({ ...prev, isFullscreen: false })), []);

  const setFrequency = useCallback((carrier: number, binaural: number = 6.0) => {
    webAudioEngine.setFrequencies(carrier, binaural);
    setState(prev => prev.currentTrack ? {
      ...prev,
      currentTrack: { ...prev.currentTrack, carrierFreq: carrier, binauralFreq: binaural }
    } : prev);
  }, []);

  // MediaSession action handlers (play, pause, stop, skip, and scrubbing)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('stop', stop);
      navigator.mediaSession.setActionHandler('nexttrack', skipNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        seek(Math.max(0, elapsedRef.current - skip));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 10;
        if (state.currentTrack) {
          seek(Math.min(state.currentTrack.duration, elapsedRef.current + skip));
        }
      });
    } catch {
      // Ignore unsupported browser features
    }
  }, [resume, pause, stop, skipNext, seek, state.currentTrack]);

  return (
    <PlayerContext.Provider value={{
      ...state,
      play, pause, resume, stop, seek,
      setVolume, setSpeed, toggleMute, setSleepTimer,
      addToQueue, removeFromQueue, clearQueue, skipNext, openFullscreen, closeFullscreen,
      setFrequency, clearAudioError,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
