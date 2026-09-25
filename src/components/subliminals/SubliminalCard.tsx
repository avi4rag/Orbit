import React, { useState } from 'react';
import { Play, Pause, Heart, Loader2 } from 'lucide-react';
import type { SubliminalSession } from '../../types/subliminal';
import { UsageBadge } from './UsageBadge';
import { usePlayer, type SessionTrack } from '../../context/PlayerContext';
import { api } from '../../services/api';
import './SubliminalCard.css';

interface SubliminalCardProps {
  session: SubliminalSession;
  onPlay?: (session: SubliminalSession) => void;
  onFavoriteToggle?: (sessionId: string, isFav: boolean) => void;
}

export const SubliminalCard: React.FC<SubliminalCardProps> = ({
  session,
  onPlay,
  onFavoriteToggle,
}) => {
  const player = usePlayer();
  const [isFavorite, setIsFavorite] = useState<boolean>(!!session.isFavorite);

  const isCurrentTrack = player.currentTrack?.id === session.id;
  const isCurrentlyPlaying = isCurrentTrack && player.isPlaying;

  const isPlayable = Boolean(
    session.audioUrl &&
    session.audioUrl.trim() !== '' &&
    (session.processingStatus === 'COMPLETED' || session.processingStatus === 'ready')
  );

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isPlayable) {
      return;
    }

    if (isCurrentlyPlaying) {
      player.pause();
      return;
    }

    if (isCurrentTrack && !player.isPlaying) {
      player.resume();
      return;
    }

    const track: SessionTrack = {
      id: session.id,
      title: session.title,
      creator: session.source?.creator || 'ORBIT Subliminal',
      thumbnail: session.artworkUrl,
      category: session.categoryTitle || session.category,
      duration: session.duration,
      audioUrl: session.audioUrl,
      processingStatus: session.processingStatus,
      audioFileHash: session.audioFileHash,
      binauralFreq: session.binauralFreq || 7.83,
      carrierFreq: session.carrierFreq || 432,
      spokenAffirmations: session.spokenAffirmations || [],
    };

    player.play(track);
    api.recordSubliminalPlay(session.id).catch(() => {});
    if (onPlay) onPlay(session);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      await api.toggleSubliminalFavorite(session.id);
      if (onFavoriteToggle) onFavoriteToggle(session.id, nextState);
    } catch {
      setIsFavorite(!nextState); // rollback on error
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    }
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  const primaryUsage = session.usageTypes?.[0] || 'ONE TIME';

  return (
    <div
      className={`orbit-subliminal-card ${isCurrentlyPlaying ? 'is-active-playing' : ''} ${!isPlayable ? 'is-processing' : ''}`}
      onClick={handlePlayClick}
      role="article"
      tabIndex={isPlayable ? 0 : -1}
      onKeyDown={(e) => {
        if (isPlayable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handlePlayClick(e as any);
        }
      }}
      aria-label={`${session.title} by ${session.source?.creator || 'ORBIT'}${!isPlayable ? ' (Audio is being processed)' : ''}`}
    >
      {/* Artwork Section */}
      <div className="orbit-subliminal-artwork-wrapper">
        <img
          src={session.artworkUrl}
          alt={session.title}
          className="orbit-subliminal-artwork"
          loading="lazy"
        />
        <div className="orbit-subliminal-overlay" />

        {/* Favorite Icon Button */}
        <button
          type="button"
          className={`orbit-subliminal-fav-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={15} fill={isFavorite ? '#f43f5e' : 'none'} />
        </button>

        {/* Active Playing Equalizer Animation */}
        {isCurrentlyPlaying && (
          <div className="orbit-subliminal-playing-indicator" title="Currently playing">
            <span className="orbit-subliminal-eq-bar" />
            <span className="orbit-subliminal-eq-bar" />
            <span className="orbit-subliminal-eq-bar" />
          </div>
        )}

        {/* Play Action or Status Badge */}
        {isPlayable ? (
          <button
            type="button"
            className="orbit-subliminal-play-btn"
            onClick={handlePlayClick}
            aria-label={isCurrentlyPlaying ? 'Pause session' : 'Play session'}
          >
            {isCurrentlyPlaying ? (
              <Pause size={18} fill="#ffffff" />
            ) : (
              <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </button>
        ) : (
          <div
            className="orbit-subliminal-processing-badge"
            title={session.processingStatus === 'FAILED' ? 'Audio unavailable' : 'Audio is still being processed'}
          >
            {session.processingStatus === 'FAILED' ? (
              'Audio unavailable'
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={11} className="spin-animate" /> Processing
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="orbit-subliminal-info">
        <h3 className="orbit-subliminal-title" title={session.title}>
          {session.title}
        </h3>
        <p className="orbit-subliminal-subcategory">
          {session.subcategory || session.categoryTitle}
        </p>

        {/* Footer */}
        <div className="orbit-subliminal-footer">
          <UsageBadge type={primaryUsage} />
          <span className="orbit-subliminal-duration">
            {isPlayable ? formatDuration(session.duration) : 'Processing'}
          </span>
        </div>
      </div>
    </div>
  );
};
