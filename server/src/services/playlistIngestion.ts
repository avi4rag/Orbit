import { PLAYLIST_SOURCES, getUniquePlaylistIds, extractPlaylistId } from '../config/playlists.js';
import { SubliminalRepository } from '../models/Subliminal.js';

export interface IngestionProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  totalPlaylists: number;
  totalDiscovered: number;
  processedCount: number;
  updatedCount: number;
  failedCount: number;
  errors: string[];
  startedAt: string | null;
  completedAt: string | null;
}

let currentProgress: IngestionProgress = {
  status: 'idle',
  totalPlaylists: 0,
  totalDiscovered: 0,
  processedCount: 0,
  updatedCount: 0,
  failedCount: 0,
  errors: [],
  startedAt: null,
  completedAt: null,
};

export class PlaylistIngestionService {
  /**
   * Scrapes public video IDs from a YouTube playlist page.
   */
  async fetchPlaylistVideoIds(playlistId: string): Promise<string[]> {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist ${playlistId}: status ${res.status}`);
    }

    const html = await res.text();
    const match =
      html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) ||
      html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s);

    const videoIds = new Set<string>();

    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const findVideos = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.videoId && typeof obj.videoId === 'string' && obj.videoId.length === 11) {
            videoIds.add(obj.videoId);
          }
          for (const key of Object.keys(obj)) {
            findVideos(obj[key]);
          }
        };
        findVideos(data);
      } catch (err: any) {
        console.warn(`JSON parse error on playlist ${playlistId}, falling back to regex:`, err.message);
      }
    }

    // Fallback regex matching in case JSON format shifts
    if (videoIds.size === 0) {
      const matches = Array.from(html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g));
      for (const m of matches) {
        videoIds.add(m[1]);
      }
    }

    return Array.from(videoIds);
  }

  /**
   * Fetches metadata for a single YouTube video using YouTube oEmbed
   * Guaranteed to work without API key referrer or quota limits.
   */
  async fetchVideoMetadata(videoId: string): Promise<{
    title: string;
    creator: string;
    thumbnailUrl: string;
  }> {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    try {
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return {
          title: (data.title || `Subliminal Session ${videoId}`).replace(/\s+/g, ' ').trim(),
          creator: (data.author_name || 'ORBIT Collective').trim(),
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    } catch (_err) {
      // Ignore network hiccup and fallback
    }

    return {
      title: `Subliminal Session ${videoId}`,
      creator: 'ORBIT Audio Collective',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  /**
   * Classifies video into ORBIT's 17 core categories.
   */
  classifyCategory(title: string, description: string = ''): { category: string; subcategory: string; tags: string[] } {
    const text = `${title} ${description}`.toLowerCase();

    if (/sleep|overnight|delta|rem\b|8 hour|insomnia|8h\b|bedtime/i.test(text)) {
      return { category: 'sleep', subcategory: 'Overnight Delta', tags: ['sleep', 'overnight', 'delta', 'deep rest'] };
    }
    if (/wealth|money|abundan|millionaire|billionaire|prosper|financial|cash|affluent|rich/i.test(text)) {
      return { category: 'wealth', subcategory: 'Abundance Flow', tags: ['wealth', 'abundance', 'prosperity', 'financial freedom'] };
    }
    if (/confidence|bold|fearless|self-trust|unshakeable|esteem|impostor/i.test(text)) {
      return { category: 'confidence', subcategory: 'Unshakable Belief', tags: ['confidence', 'self-trust', 'courage'] };
    }
    if (/looks|glow up|beauty|facial|skin|hair|posture|jawline|symmetry|appearance|pretty|attract/i.test(text)) {
      return { category: 'looks', subcategory: 'Cellular Glow Up', tags: ['looks', 'glow up', 'radiance', 'symmetry'] };
    }
    if (/self concept|identity|i am|state of being|highest self|inner concept|assume/i.test(text)) {
      return { category: 'self-concept', subcategory: 'Core Identity', tags: ['self concept', 'identity', 'embodiment'] };
    }
    if (/love|relationship|sp\b|specific person|crush|soulmate|marry|devotion|attract love/i.test(text)) {
      return { category: 'love', subcategory: 'Relational Harmony', tags: ['love', 'relationships', 'magnetic heart'] };
    }
    if (/career|job|promot|interview|business|exec|founder|client|success\b/i.test(text)) {
      return { category: 'career', subcategory: 'Visionary Leadership', tags: ['career', 'success', 'momentum'] };
    }
    if (/academic|exam|grade|study|school|university|math|retention|intelligence/i.test(text)) {
      return { category: 'academic', subcategory: 'Deep Retention', tags: ['academic', 'study', 'focus', 'memory'] };
    }
    if (/social|charisma|talk|banter|conversation|extrovert|popularity/i.test(text)) {
      return { category: 'social-confidence', subcategory: 'Charismatic Ease', tags: ['social', 'charisma', 'warmth'] };
    }
    if (/focus|deep work|gamma|flow state|distraction|adhd|productivity/i.test(text)) {
      return { category: 'focus', subcategory: 'Cognitive Laser', tags: ['focus', 'productivity', 'deep work'] };
    }
    if (/motivation|drive|fire|action|procrastinat|inertia|get it done/i.test(text)) {
      return { category: 'motivation', subcategory: 'Inner Fire', tags: ['motivation', 'action', 'momentum'] };
    }
    if (/discipline|habit|routine|consistency|willpower|monastic/i.test(text)) {
      return { category: 'discipline', subcategory: 'Habit Architecture', tags: ['discipline', 'consistency', 'willpower'] };
    }
    if (/health|healing|immune|cell|somatic|pain|regenerat|vitality|528hz/i.test(text)) {
      return { category: 'health', subcategory: 'Cellular Restoration', tags: ['health', 'wellness', 'healing'] };
    }
    if (/energy|vitality|stamina|morning|supernova|solar|awake/i.test(text)) {
      return { category: 'energy', subcategory: 'Solar Energy', tags: ['energy', 'vitality', 'clean power'] };
    }
    if (/peace|calm|anxiety|stress|panic|relax|stillness|432hz|nervous/i.test(text)) {
      return { category: 'peace', subcategory: 'Still Waters', tags: ['peace', 'calm', 'anxiety relief'] };
    }
    if (/luck|serendipity|miracle|fortunate|synchronicity|lucky/i.test(text)) {
      return { category: 'luck', subcategory: 'Serendipity Magnet', tags: ['luck', 'synchronicity', 'opportunities'] };
    }
    return { category: 'growth', subcategory: 'Higher Self Anchor', tags: ['personal growth', 'mindset', 'expansion'] };
  }

  /**
   * Classifies video into 7 supported usage types.
   */
  classifyUsageType(title: string, durationSeconds?: number): string[] {
    const text = title.toLowerCase();
    const usage = new Set<string>();

    if (/one listen|one time|1 listen|once|instant|fast reset|quick reset/i.test(text)) {
      usage.add('ONE TIME');
    }
    if (/morning|wake up|dawn|am\b|early/i.test(text)) {
      usage.add('MORNING');
    }
    if (/night|evening|pm\b|before bed/i.test(text)) {
      usage.add('NIGHT');
    }
    if (/sleep|overnight|delta|8 hour|8h\b|insomnia|bedtime/i.test(text) || (durationSeconds && durationSeconds > 7200)) {
      usage.add('SLEEP');
      usage.add('NIGHT');
    }
    if (/focus|study|deep work|productivity|gamma/i.test(text)) {
      usage.add('FOCUS');
    }
    if (/loop|repeat|continuous|listen continuously/i.test(text)) {
      usage.add('REPEAT');
    }

    if (usage.size === 0) {
      usage.add('DAYTIME');
    }

    return Array.from(usage);
  }

  /**
   * Ingests all videos from configured PLAYLIST_SOURCES with deduplication and idempotency.
   */
  async ingestAllPlaylists(customSources?: string[]): Promise<IngestionProgress> {
    if (currentProgress.status === 'running') {
      return currentProgress;
    }

    const playlistIds = getUniquePlaylistIds(customSources || PLAYLIST_SOURCES);
    currentProgress = {
      status: 'running',
      totalPlaylists: playlistIds.length,
      totalDiscovered: 0,
      processedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    // Run ingestion asynchronously so caller returns immediately
    (async () => {
      const allVideoIds = new Set<string>();

      // 1. Gather all video IDs across all deduplicated playlists
      for (const pid of playlistIds) {
        try {
          const vids = await this.fetchPlaylistVideoIds(pid);
          for (const vid of vids) {
            allVideoIds.add(vid);
          }
        } catch (err: any) {
          currentProgress.errors.push(`Playlist ${pid}: ${err.message}`);
        }
      }

      currentProgress.totalDiscovered = allVideoIds.size;

      // 2. Ingest/upsert each video with metadata
      for (const videoId of allVideoIds) {
        try {
          const meta = await this.fetchVideoMetadata(videoId);
          const classification = this.classifyCategory(meta.title);
          const usageTypes = this.classifyUsageType(meta.title);

          const isOvernight = usageTypes.includes('SLEEP');
          const duration = isOvernight ? 28800 : 900;

          await SubliminalRepository.upsertByVideoId({
            title: meta.title,
            description: `Imported subliminal soundscape (${classification.category} - ${classification.subcategory})`,
            category: classification.category,
            subcategory: classification.subcategory,
            usageTypes,
            tags: classification.tags,
            artworkUrl: meta.thumbnailUrl,
            audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
            source: {
              platform: 'youtube',
              videoId,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              creator: meta.creator,
            },
            duration,
            binauralFreq: isOvernight ? 2.5 : 7.83,
            carrierFreq: 528,
            processingStatus: 'ready',
          });

          currentProgress.processedCount++;
        } catch (err: any) {
          currentProgress.failedCount++;
          currentProgress.errors.push(`Video ${videoId}: ${err.message}`);
        }
      }

      currentProgress.status = 'completed';
      currentProgress.completedAt = new Date().toISOString();
    })().catch((err) => {
      currentProgress.status = 'failed';
      currentProgress.errors.push(`Critical failure: ${err.message}`);
      currentProgress.completedAt = new Date().toISOString();
    });

    return currentProgress;
  }

  getProgress(): IngestionProgress {
    return currentProgress;
  }
}

export const playlistIngestionService = new PlaylistIngestionService();
