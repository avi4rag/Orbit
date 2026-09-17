import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { webAudioEngine } from '../services/audio/WebAudioEngine';
import { spokenAffirmationEngine } from '../services/audio/SpokenAffirmationEngine';

export interface SessionTrack {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  category: string;
  duration: number;       // seconds
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
  skipNext: () => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
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
  });

  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const affirmationIndexRef = useRef(0);
  const affirmationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync MediaSession API (lock screen / headphone controls)
  const syncMediaSession = useCallback((track: SessionTrack, playing: boolean) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.creator,
      album: 'Orbit — Celestial Soundscapes',
      artwork: [{ src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }, []);

  const startElapsedTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setState(prev => ({ ...prev, elapsed: elapsedRef.current }));
    }, 1000);
  }, []);

  const stopElapsedTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
    stopElapsedTimer();
    stopAffirmationCycle();
    webAudioEngine.stopSoundscape();

    elapsedRef.current = 0;

    // Start audio synthesis
    webAudioEngine.setVolume(state.volume);
    webAudioEngine.startSoundscape({
      carrierFreq: track.carrierFreq || 528,
      binauralFreq: track.binauralFreq || 6,
      includeNoise: true,
      includeDrone: true,
    });

    // Start spoken affirmations if available
    if (track.spokenAffirmations?.length) {
      startAffirmationCycle(track.spokenAffirmations);
      // Delay spoken voice 5s to let the ambient drone settle
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
    }));

    startElapsedTimer();
    syncMediaSession(track, true);
  }, [state.volume, startElapsedTimer, stopElapsedTimer, stopAffirmationCycle, startAffirmationCycle, syncMediaSession]);

  const pause = useCallback(() => {
    webAudioEngine.pause();
    spokenAffirmationEngine.pause();
    stopElapsedTimer();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, false);
      return { ...prev, isPlaying: false };
    });
  }, [stopElapsedTimer, syncMediaSession]);

  const resume = useCallback(() => {
    webAudioEngine.resume();
    spokenAffirmationEngine.resume();
    startElapsedTimer();
    setState(prev => {
      if (prev.currentTrack) syncMediaSession(prev.currentTrack, true);
      return { ...prev, isPlaying: true };
    });
  }, [startElapsedTimer, syncMediaSession]);

  const stop = useCallback(() => {
    webAudioEngine.stopSoundscape();
    spokenAffirmationEngine.stop();
    stopElapsedTimer();
    stopAffirmationCycle();
    elapsedRef.current = 0;
    setState(prev => ({ ...prev, isPlaying: false, currentTrack: null, elapsed: 0, activeAffirmation: null }));
  }, [stopElapsedTimer, stopAffirmationCycle]);

  const seek = useCallback((seconds: number) => {
    elapsedRef.current = seconds;
    setState(prev => ({ ...prev, elapsed: seconds }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    webAudioEngine.setVolume(clamped);
    setState(prev => ({ ...prev, volume: clamped, isMuted: clamped === 0 }));
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const muted = !prev.isMuted;
      webAudioEngine.setVolume(muted ? 0 : prev.volume);
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
      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current!);
        stop();
        setState(prev => ({ ...prev, sleepTimer: null, sleepRemainingSeconds: null }));
      }
    }, 1000);
  }, [stop]);

  const addToQueue = useCallback((track: SessionTrack) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const skipNext = useCallback(() => {
    setState(prev => {
      if (!prev.queue.length) return prev;
      const [next, ...rest] = prev.queue;
      play(next);
      return { ...prev, queue: rest };
    });
  }, [play]);

  const openFullscreen = useCallback(() => setState(prev => ({ ...prev, isFullscreen: true })), []);
  const closeFullscreen = useCallback(() => setState(prev => ({ ...prev, isFullscreen: false })), []);

  // MediaSession action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', resume);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('stop', stop);
    navigator.mediaSession.setActionHandler('nexttrack', skipNext);
  }, [resume, pause, stop, skipNext]);

  return (
    <PlayerContext.Provider value={{
      ...state,
      play, pause, resume, stop, seek,
      setVolume, setSpeed, toggleMute, setSleepTimer,
      addToQueue, skipNext, openFullscreen, closeFullscreen,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
