import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { spokenAffirmationEngine } from '../services/audio/SpokenAffirmationEngine';

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
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const affirmationIndexRef = useRef(0);
  const affirmationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      console.error('[Orbit AudioPlayer] HTMLAudioElement error event:', err);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        audioError: 'Audio playback failed or media is unavailable.',
      }));
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
      audio.pause();
      audio.src = '';
    };
  }, [syncMediaSession, skipNext]);

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

    // STRICT CHECK: Disallow fake/placeholder playback
    const isStillProcessing =
      track.processingStatus === 'PENDING' ||
      track.processingStatus === 'PROCESSING' ||
      track.processingStatus === 'DOWNLOADING' ||
      track.processingStatus === 'CONVERTING' ||
      track.processingStatus === 'UPLOADING' ||
      track.processingStatus === 'processing';

    if (!track.audioUrl || track.audioUrl.trim() === '' || isStillProcessing || track.processingStatus === 'FAILED') {
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

    if (audio) {
      audio.pause();
      // Ensure source URL is clean
      audio.src = track.audioUrl;
      audio.playbackRate = state.speed;
      audio.volume = state.isMuted ? 0 : state.volume;
      audio.load();

      audio.play().catch(err => {
        if (err.name === 'AbortError') {
          // Play was superseded by another play or pause - benign in browser audio
          return;
        }
        console.warn('[Orbit AudioPlayer] Play promise error:', err);
        setState(prev => ({ ...prev, isPlaying: false, audioError: 'Unable to stream audio. Please try again.' }));
      });
    }

    // Start spoken affirmations if available
    if (track.spokenAffirmations?.length) {
      startAffirmationCycle(track.spokenAffirmations);
      setTimeout(() => {
        if (spokenAffirmationEngine.supported) {
          spokenAffirmationEngine.speakSequence(
            track.spokenAffirmations!,
            { rate: 0.82, pitch: 1.1 },
            (_idx, text) => setState(prev => ({ ...prev, activeAffirmation: text })),
            undefined,
            3000
          );
        }
      }, 5000);
    }

    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentTrack: track,
      elapsed: 0,
      audioError: null,
    }));

    syncMediaSession(track, true);
  }, [state.speed, state.volume, state.isMuted, stopAffirmationCycle, startAffirmationCycle, syncMediaSession]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    spokenAffirmationEngine.pause();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, false);
      return { ...prev, isPlaying: false };
    });
  }, [syncMediaSession]);

  const resume = useCallback(() => {
    if (!state.currentTrack?.audioUrl) {
      return;
    }
    audioRef.current?.play().catch(err => {
      console.warn('[Orbit AudioPlayer] Resume error:', err);
    });
    spokenAffirmationEngine.resume();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, true);
      return { ...prev, isPlaying: true };
    });
  }, [state.currentTrack, syncMediaSession]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    spokenAffirmationEngine.stop();
    stopAffirmationCycle();
    elapsedRef.current = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTrack: null,
      elapsed: 0,
      activeAffirmation: null,
      audioError: null,
    }));
  }, [stopAffirmationCycle]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
    elapsedRef.current = seconds;
    setState(prev => ({ ...prev, elapsed: seconds }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
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
      if (remaining <= 10 && remaining > 0 && audioRef.current) {
        const ratio = remaining / 10;
        audioRef.current.volume = state.volume * ratio;
      }

      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current!);
        stop();
        if (audioRef.current) {
          audioRef.current.volume = state.volume;
        }
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
