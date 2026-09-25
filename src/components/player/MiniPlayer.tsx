import React, { useCallback, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import './MiniPlayer.css';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const MiniPlayer: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = track ? (player.elapsed / track.duration) * 100 : 0;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    player.seek(Math.floor(ratio * track.duration));
  }, [track, player]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
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

  if (!track) return null;

  return (
    <div
      className="mini-player"
      role="region"
      aria-label="Now playing bar"
      onKeyDown={handleKeyDown}
    >
      {/* Progress scrubber */}
      <div
        className="mini-player__progress"
        ref={progressRef}
        role="progressbar"
        aria-valuenow={Math.floor(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Playback progress: ${formatTime(player.elapsed)} of ${formatTime(track.duration)}`}
        onClick={handleProgressClick}
        tabIndex={0}
      >
        <div className="mini-player__progress-fill" style={{ width: `${progress}%` }} />
        <div
          className="mini-player__progress-thumb"
          style={{ left: `${progress}%` }}
          role="slider"
          aria-valuenow={Math.floor(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mini-player__body">
        {/* Track info */}
        <button
          className="mini-player__track-info"
          onClick={player.openFullscreen}
          aria-label={`Open full player for ${track.title}`}
        >
          <img
            className="mini-player__thumb"
            src={track.thumbnail}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div className="mini-player__meta">
            <span className="mini-player__title">{track.title}</span>
            <span className="mini-player__creator">{track.creator}</span>
          </div>
        </button>

        {/* Active affirmation ticker or audio error */}
        {player.audioError ? (
          <div
            className="mini-player__affirmation"
            style={{ color: '#f87171' }}
            aria-live="assertive"
          >
            <span className="mini-player__affirmation-text">⚠️ {player.audioError}</span>
          </div>
        ) : player.activeAffirmation ? (
          <div
            className="mini-player__affirmation"
            aria-live="polite"
            aria-label="Current affirmation"
          >
            <span className="mini-player__affirmation-text">{player.activeAffirmation}</span>
          </div>
        ) : null}

        {/* Controls */}
        <div className="mini-player__controls" role="group" aria-label="Playback controls">
          <button
            className="mini-player__btn"
            onClick={() => player.seek(Math.max(player.elapsed - 10, 0))}
            aria-label="Rewind 10 seconds"
            title="–10s"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-3.26L9 13.25V12.5l1.85-.61h.05V16zm4.3-1.39c0 .94-.19 1.64-.56 2.09-.37.44-.92.66-1.65.66-.72 0-1.27-.22-1.65-.67-.38-.44-.58-1.12-.58-2.04V13.1c0-.95.19-1.65.56-2.1.37-.44.93-.66 1.66-.66.72 0 1.27.22 1.65.67.38.44.57 1.12.57 2.04V14.61zm-.92-1.74c0-.58-.08-1-.24-1.27-.16-.27-.41-.41-.75-.41s-.58.13-.74.4c-.16.27-.25.67-.25 1.21v2.05c0 .58.08 1.01.24 1.28s.41.41.76.41.59-.13.75-.39c.16-.27.24-.69.24-1.26V12.87z"/>
            </svg>
          </button>

          <button
            className="mini-player__btn mini-player__btn--play"
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
            className="mini-player__btn"
            onClick={() => player.seek(Math.min(player.elapsed + 10, track.duration))}
            aria-label="Forward 10 seconds"
            title="+10s"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2zm-4.85 3H12v-3.26L11 13.25V12.5l1.85-.61h.05V16h1.25v.75h-.05zm4.3-1.39c0 .94-.19 1.64-.56 2.09-.37.44-.92.66-1.65.66-.72 0-1.27-.22-1.65-.67-.38-.44-.58-1.12-.58-2.04V13.1c0-.95.19-1.65.56-2.1.37-.44.93-.66 1.66-.66.72 0 1.27.22 1.65.67.38.44.57 1.12.57 2.04v1.5zm-.91-1.74c0-.58-.08-1-.24-1.27-.16-.27-.41-.41-.75-.41s-.58.13-.74.4c-.16.27-.25.67-.25 1.21v2.05c0 .58.08 1.01.24 1.28s.41.41.76.41.59-.13.75-.39c.16-.27.24-.69.24-1.26v-2.02z"/>
            </svg>
          </button>

          <button
            className="mini-player__btn"
            onClick={player.toggleMute}
            aria-label={player.isMuted ? 'Unmute' : 'Mute'}
            aria-pressed={player.isMuted}
          >
            {player.isMuted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>

          <button
            className="mini-player__btn mini-player__btn--expand"
            onClick={player.openFullscreen}
            aria-label="Open full player"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>

          {/* Time display */}
          <span className="mini-player__time" aria-live="off" aria-label="Elapsed time">
            {formatTime(player.elapsed)} / {formatTime(track.duration)}
          </span>
        </div>
      </div>

      {/* Sleep timer badge */}
      {player.sleepRemainingSeconds !== null && (
        <div className="mini-player__sleep-badge" aria-live="polite" aria-label={`Sleep timer: ${formatTime(player.sleepRemainingSeconds)} remaining`}>
          🌙 {formatTime(player.sleepRemainingSeconds)}
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;
