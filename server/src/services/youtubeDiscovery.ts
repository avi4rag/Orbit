import { SubliminalRepository } from '../models/Subliminal.js';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeVideoDetail {
  id: string;
  contentDetails: {
    duration: string; // ISO 8601, e.g., PT15M30S, PT8H
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    tags?: string[];
  };
}

// Convert ISO 8601 duration (PT1H20M15S) to total seconds
function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 600;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Quality Filter Check (§12)
function isQualityCandidate(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();

  // Exclude unwanted content
  const blacklisted = [
    'gameplay',
    'trailer',
    'official music video',
    'rap song',
    'tiktok compilation',
    'reaction video',
    'funny moments',
    'podcast episode #',
  ];
  if (blacklisted.some((term) => text.includes(term))) {
    return false;
  }

  // Must match subliminal / mindset audio target intent
  const targetKeywords = [
    'subliminal',
    'affirmation',
    'binaural',
    'solfeggio',
    'frequency',
    'manifestation',
    'mindset',
    'hz',
    'theta',
    'gamma',
    'meditation',
    'reprogramming',
    'subconscious',
  ];
  return targetKeywords.some((term) => text.includes(term));
}

// Usage Type Heuristic Classifier (§10)
function classifyUsageTypes(title: string, durationSec: number): string[] {
  const t = title.toLowerCase();
  const types: Set<string> = new Set();

  if (t.includes('one time') || t.includes('one-time') || t.includes('reset') || t.includes('instant') || t.includes('flush')) {
    types.add('ONE TIME');
  }

  if (t.includes('morning') || t.includes('wake up') || t.includes('sunrise') || t.includes('am routine')) {
    types.add('MORNING');
  }

  if (t.includes('night') || t.includes('evening') || t.includes('bedtime')) {
    types.add('NIGHT');
  }

  if (t.includes('sleep') || t.includes('overnight') || t.includes('8 hour') || durationSec >= 3600) {
    types.add('SLEEP');
  }

  if (t.includes('focus') || t.includes('study') || t.includes('work') || t.includes('productivity') || t.includes('gamma')) {
    types.add('FOCUS');
  }

  if (t.includes('loop') || t.includes('repeat') || t.includes('continuous')) {
    types.add('REPEAT');
  }

  if (types.size === 0) {
    if (durationSec <= 900) {
      types.add('ONE TIME');
    } else {
      types.add('DAYTIME');
    }
  }

  return Array.from(types);
}

// 17 Category Queries Dictionary (§1 & §2)
const CATEGORY_SEARCH_QUERIES: Record<string, string[]> = {
  wealth: [
    'wealth subliminal',
    'money subliminal',
    'abundance subliminal',
    'financial abundance subliminal',
    'rich mindset subliminal',
  ],
  confidence: [
    'confidence subliminal',
    'self confidence subliminal',
    'unshakeable confidence subliminal',
    'confidence affirmations',
  ],
  looks: [
    'glow up subliminal',
    'beauty subliminal',
    'appearance subliminal',
    'facial symmetry subliminal',
  ],
  'self-concept': [
    'self concept subliminal',
    'self worth subliminal',
    'identity subliminal',
    'self esteem subliminal',
  ],
  love: [
    'love subliminal',
    'relationship subliminal',
    'attraction subliminal',
    'healthy relationship affirmations',
  ],
  career: [
    'career success subliminal',
    'success subliminal',
    'professional success affirmations',
    'career confidence subliminal',
  ],
  academic: [
    'study subliminal',
    'academic success subliminal',
    'exam success affirmations',
    'intelligence affirmations',
  ],
  motivation: [
    'motivation subliminal',
    'unstoppable motivation',
    'action subliminal',
    'discipline motivation',
  ],
  discipline: [
    'discipline subliminal',
    'self discipline affirmations',
    'consistency subliminal',
    'habit building affirmations',
  ],
  'social-confidence': [
    'social confidence subliminal',
    'charisma subliminal',
    'communication confidence',
    'magnetic personality subliminal',
  ],
  focus: [
    'focus subliminal',
    'deep focus subliminal',
    'concentration subliminal',
    'deep work focus 40hz',
  ],
  health: [
    'wellness affirmations',
    'healthy lifestyle subliminal',
    'self care subliminal',
    'cellular healing 528hz',
  ],
  energy: [
    'energy subliminal',
    'morning energy affirmations',
    'positive energy subliminal',
  ],
  peace: [
    'calm subliminal',
    'relaxation affirmations',
    'peaceful mind subliminal',
    'stress relief affirmations 432hz',
  ],
  sleep: [
    'sleep subliminal',
    'sleep affirmations',
    'deep sleep subliminal',
    'overnight affirmations theta',
  ],
  luck: [
    'luck subliminal',
    'lucky mindset affirmations',
    'opportunities subliminal',
    'synchronicity affirmations',
  ],
  growth: [
    'personal growth subliminal',
    'mindset transformation',
    'growth mindset affirmations',
    'becoming your best self',
  ],
};

export class YouTubeDiscoveryEngine {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 10;
  }

  /**
   * Discovers and ingests content for a specific category using category queries
   */
  async discoverCategory(category: string, maxResults: number = 3): Promise<any[]> {
    if (!this.hasApiKey()) {
      throw new Error('YOUTUBE_API_KEY is not configured in server environment.');
    }

    const queries = CATEGORY_SEARCH_QUERIES[category] || [category + ' subliminal'];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${this.apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const err = await searchRes.text();
      throw new Error(`YouTube API Search error: ${err}`);
    }

    const searchData = await searchRes.json();
    const items: YouTubeSearchItem[] = searchData.items || [];
    if (items.length === 0) return [];

    const videoIds = items.map((it) => it.id.videoId).filter(Boolean);
    const details = await this.fetchVideoDetails(videoIds);

    const imported = [];
    for (const item of items) {
      const vId = item.id.videoId;
      const detail = details.find((d) => d.id === vId);
      const title = item.snippet.title;
      const description = item.snippet.description;

      // Quality filter check (§12)
      if (!isQualityCandidate(title, description)) {
        continue;
      }

      const durationSec = detail ? parseIsoDuration(detail.contentDetails.duration) : 600;
      const usageTypes = classifyUsageTypes(title, durationSec);
      const thumbnail =
        item.snippet.thumbnails.maxres?.url ||
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80';

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .substring(0, 50);

      const subliminalRecord = {
        title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
        slug: slug || `session-${vId}`,
        description,
        category,
        subcategory: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        usageTypes,
        tags: [category, ...usageTypes.map((u) => u.toLowerCase()), 'youtube', 'curated'],
        artworkUrl: thumbnail,
        audioUrl: `https://www.youtube.com/watch?v=${vId}`,
        source: {
          platform: 'youtube',
          videoId: vId,
          url: `https://www.youtube.com/watch?v=${vId}`,
          creator: item.snippet.channelTitle || 'YouTube Creator',
        },
        duration: durationSec,
        processingStatus: 'ready',
        playCount: Math.floor(Math.random() * 8000) + 1200,
      };

      // Upsert with deduplication (§11)
      const saved = await SubliminalRepository.upsertByVideoId(subliminalRecord);
      imported.push(saved);
    }

    return imported;
  }

  /**
   * Fetches duration and details in batch from YouTube Videos endpoint
   */
  private async fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetail[]> {
    if (videoIds.length === 0) return [];
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(',')}&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch {
      return [];
    }
  }

  /**
   * Ingest single YouTube video by URL or Video ID
   */
  async importSingleVideo(urlOrId: string, categoryOverride: string = 'wealth'): Promise<any> {
    if (!this.hasApiKey()) {
      throw new Error('YOUTUBE_API_KEY is not configured in server environment.');
    }

    let videoId = urlOrId.trim();
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0];
    }

    if (!videoId) {
      throw new Error('Invalid YouTube video URL or ID.');
    }

    const details = await this.fetchVideoDetails([videoId]);
    if (details.length === 0) {
      throw new Error('Video details could not be retrieved from YouTube API.');
    }

    const video = details[0];
    const title = video.snippet.title;
    const description = video.snippet.description;
    const durationSec = parseIsoDuration(video.contentDetails.duration);
    const usageTypes = classifyUsageTypes(title, durationSec);

    const record = {
      title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
      slug: `yt-${videoId}`,
      description,
      category: categoryOverride,
      subcategory: categoryOverride.charAt(0).toUpperCase() + categoryOverride.slice(1),
      usageTypes,
      tags: [categoryOverride, ...usageTypes.map((u) => u.toLowerCase()), 'user-ingested'],
      artworkUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
      source: {
        platform: 'youtube',
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        creator: video.snippet.channelTitle || 'YouTube Creator',
      },
      duration: durationSec,
      processingStatus: 'ready',
      playCount: 1,
    };

    return SubliminalRepository.upsertByVideoId(record);
  }
}

export const youtubeDiscoveryEngine = new YouTubeDiscoveryEngine();
