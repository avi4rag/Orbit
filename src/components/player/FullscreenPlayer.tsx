import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer, type PlaybackSpeed, type SleepTimer } from '../../context/PlayerContext';
import { trapFocus } from '../../utils/a11y';
import './FullscreenPlayer.css';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5];
const SLEEP_OPTIONS: { label: string; value: SleepTimer }[] = [
  { label: 'Off', value: null },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const FullscreenPlayer: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;
  const dialogRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showQueue, setShowQueue] = useState(false);

  const progress = track ? (player.elapsed / track.duration) * 100 : 0;

  // Focus trap
  useEffect(() => {
    if (player.isFullscreen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [player.isFullscreen]);

  // Keyboard handler (Escape closes)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (dialogRef.current) {
      trapFocus(dialogRef.current, e.nativeEvent);
    }
    switch (e.key) {
      case 'Escape':
        player.closeFullscreen();
        break;
      case ' ':
      case 'k':
        e.preventDefault();
        player.isPlaying ? player.pause() : player.resume();
        break;
      case 'ArrowRight':
        e.preventDefault();
        player.seek(Math.min(player.elapsed + 10, track?.duration ?? 0));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        player.seek(Math.max(player.elapsed - 10, 0));
        break;
      case 'm':
        player.toggleMute();
        break;
    }
  }, [player, track]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    player.seek(Math.floor(ratio * track.duration));
  }, [track, player]);

  if (!player.isFullscreen || !track) return null;

  return (
    <div
      className="fs-player-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) player.closeFullscreen(); }}
      aria-modal="true"
      role="dialog"
      aria-label={`Now playing: ${track.title}`}
    >
      <div
        className="fs-player"
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Top Header Bar */}
        <div className="fs-player__top-bar">
          <button
            className="fs-player__close"
            onClick={player.closeFullscreen}
            aria-label="Close full player"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
            </svg>
            Minimize
          </button>

          <button
            type="button"
            className={`fs-player__queue-toggle ${showQueue ? 'is-active' : ''}`}
            onClick={() => setShowQueue(!showQueue)}
            aria-label={`Up next queue, ${player.queue.length} items`}
            aria-expanded={showQueue}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/>
            </svg>
            Queue ({player.queue.length})
          </button>
        </div>

        {showQueue ? (
          <div className="fs-player__queue-panel" role="region" aria-label="Play Queue">
            <div className="fs-player__queue-header">
              <span className="fs-player__queue-title">Up Next ({player.queue.length})</span>
              {player.queue.length > 0 && (
                <button
                  type="button"
                  className="fs-player__queue-clear-btn"
                  onClick={player.clearQueue}
                  aria-label="Clear all tracks in queue"
                >
                  Clear All
                </button>
              )}
            </div>

            {player.queue.length === 0 ? (
              <div className="fs-player__queue-empty">
                <p>Your queue is empty</p>
                <span>Add any session from Explore to line it up next.</span>
              </div>
            ) : (
              <ul className="fs-player__queue-list">
                {player.queue.map((item, idx) => (
                  <li key={`${item.id}-${idx}`} className="fs-player__queue-item">
                    <img src={item.thumbnail} alt="" className="fs-player__queue-thumb" />
                    <div className="fs-player__queue-item-info">
                      <span className="fs-player__queue-item-title">{item.title}</span>
                      <span className="fs-player__queue-item-meta">{item.creator} • {formatTime(item.duration)}</span>
                    </div>
                    <div className="fs-player__queue-item-actions">
                      <button
                        type="button"
                        className="fs-player__queue-item-btn play-now"
                        onClick={() => {
                          player.play(item);
                          player.removeFromQueue(idx);
                        }}
                        aria-label={`Play ${item.title} now`}
                        title="Play now"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="fs-player__queue-item-btn remove"
                        onClick={() => player.removeFromQueue(idx)}
                        aria-label={`Remove ${item.title} from queue`}
                        title="Remove from queue"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            {/* Artwork */}
            <div className="fs-player__artwork-wrapper">
              <img
                className={`fs-player__artwork ${player.isPlaying ? 'is-playing' : ''}`}
                src={track.thumbnail}
                alt={`${track.title} session artwork`}
              />
              {/* Pulsing aura */}
              <div className={`fs-player__aura ${player.isPlaying ? 'is-playing' : ''}`} aria-hidden="true" />
            </div>

            {/* Title */}
            <div className="fs-player__info">
              <h2 className="fs-player__title">{track.title}</h2>
              <p className="fs-player__creator">{track.creator}</p>
              <span className="fs-player__category">{track.category}</span>
            </div>

            {/* Active affirmation */}
            {player.activeAffirmation && (
              <blockquote
                className="fs-player__affirmation"
                aria-live="polite"
                aria-label="Current affirmation"
              >
                &ldquo;{player.activeAffirmation}&rdquo;
              </blockquote>
            )}
          </>
        )}

        {/* Progress */}
        <div className="fs-player__progress-section">
          <span className="fs-player__time-label">{formatTime(player.elapsed)}</span>
          <div
            className="fs-player__progress"
            ref={progressRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuenow={Math.floor(player.elapsed)}
            aria-valuemin={0}
            aria-valuemax={track.duration}
            onClick={handleProgressClick}
          >
            <div className="fs-player__progress-fill" style={{ width: `${progress}%` }} />
            <div className="fs-player__progress-thumb" style={{ left: `${progress}%` }} />
          </div>
          <span className="fs-player__time-label">{formatTime(track.duration)}</span>
        </div>

        {/* Main controls */}
        <div className="fs-player__controls" role="group" aria-label="Playback controls">
          <button
            className="fs-player__ctrl"
            onClick={() => player.seek(Math.max(player.elapsed - 10, 0))}
            aria-label="Rewind 10 seconds"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>

          <button
            className="fs-player__ctrl fs-player__ctrl--play"
            onClick={player.isPlaying ? player.pause : player.resume}
            aria-label={player.isPlaying ? 'Pause' : 'Play'}
            aria-pressed={player.isPlaying}
          >
            {player.isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            className="fs-player__ctrl"
            onClick={() => player.seek(Math.min(player.elapsed + 10, track.duration))}
            aria-label="Forward 10 seconds"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/>
            </svg>
          </button>
        </div>

        {/* Secondary controls row */}
        <div className="fs-player__secondary">
          {/* Volume */}
          <div className="fs-player__volume-group">
            <button
              className="fs-player__ctrl-sm"
              onClick={player.toggleMute}
              aria-label={player.isMuted ? 'Unmute' : 'Mute'}
              aria-pressed={player.isMuted}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {player.isMuted
                  ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                }
              </svg>
            </button>
            <input
              className="fs-player__volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={player.isMuted ? 0 : player.volume}
              onChange={e => player.setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>

          {/* Speed picker */}
          <div className="fs-player__speed-group" role="group" aria-label="Playback speed">
            {SPEEDS.map(s => (
              <button
                key={s}
                className={`fs-player__speed-btn ${player.speed === s ? 'is-active' : ''}`}
                onClick={() => player.setSpeed(s)}
                aria-pressed={player.speed === s}
                aria-label={`${s}x speed`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Sleep timer */}
          <div className="fs-player__sleep-group" role="group" aria-label="Sleep timer">
            <span className="fs-player__secondary-label">🌙</span>
            <select
              className="fs-player__sleep-select"
              value={player.sleepTimer ?? 'null'}
              onChange={e => {
                const val = e.target.value;
                player.setSleepTimer(val === 'null' ? null : Number(val) as SleepTimer);
              }}
              aria-label="Sleep timer"
            >
              {SLEEP_OPTIONS.map(o => (
                <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Solfeggio Tuner */}
        <div className="fs-player__freq-switcher" role="group" aria-label="Solfeggio Frequency Switcher">
          <span className="fs-player__freq-label">Frequency:</span>
          {[
            { freq: 528, label: '528Hz Transformation' },
            { freq: 432, label: '432Hz Healing' },
            { freq: 639, label: '639Hz Heart' },
            { freq: 396, label: '396Hz Focus' },
            { freq: 174, label: '174Hz Sleep' },
          ].map(f => (
            <button
              key={f.freq}
              className={`fs-player__freq-chip ${track.carrierFreq === f.freq ? 'is-active' : ''}`}
              onClick={() => player.setFrequency(f.freq, track.binauralFreq || 6.0)}
              aria-label={`Switch to ${f.label}`}
              title={f.label}
            >
              {f.freq}Hz
            </button>
          ))}
        </div>

        {/* Binaural info badge */}
        {(track.binauralFreq || track.carrierFreq) && (
          <div className="fs-player__binaural-badge" aria-label={`Binaural beat: ${track.binauralFreq}Hz at ${track.carrierFreq}Hz carrier`}>
            <span>Binaural</span>
            <span className="fs-player__binaural-freq">{track.binauralFreq}Hz</span>
            <span className="fs-player__binaural-sep">/</span>
            <span className="fs-player__binaural-freq">{track.carrierFreq}Hz carrier</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenPlayer;
