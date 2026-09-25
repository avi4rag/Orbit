import mongoose, { Document, Schema } from 'mongoose';
import { isDbConnected } from '../db.js';

export interface ISubliminal extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  usageTypes: string[];
  tags: string[];
  artworkUrl: string;
  audioUrl: string;
  source: {
    platform: string;
    videoId?: string;
    url: string;
    creator: string;
  };
  duration: number;
  binauralFreq?: number;
  carrierFreq?: number;
  spokenAffirmations?: string[];
  processingStatus: 'ready' | 'processing';
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubliminalSchema = new Schema<ISubliminal>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: 'General' },
    usageTypes: [{ type: String, index: true }],
    tags: [{ type: String, index: true }],
    artworkUrl: { type: String, required: true },
    audioUrl: { type: String, required: true },
    source: {
      platform: { type: String, default: 'youtube' },
      videoId: { type: String, index: true },
      url: { type: String, required: true },
      creator: { type: String, default: 'ORBIT Audio Collective' },
    },
    duration: { type: Number, default: 600 },
    binauralFreq: { type: Number, default: 7.83 },
    carrierFreq: { type: Number, default: 432 },
    spokenAffirmations: [{ type: String }],
    processingStatus: { type: String, enum: ['ready', 'processing'], default: 'ready' },
    playCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate imports based on videoId (§11)
SubliminalSchema.index({ 'source.videoId': 1 }, { unique: true, sparse: true });

export const SubliminalModel = mongoose.model<ISubliminal>('Subliminal', SubliminalSchema);

// Rich Curated Seed Library across all 17 categories (§1 & §8)
const SEED_SUBLIMINALS = [
  // 1. WEALTH & ABUNDANCE
  {
    id: 'sub-wealth-01',
    slug: 'quantum-wealth-frequency',
    title: 'Quantum Wealth & Instant Abundance Reset',
    description: 'Binaural 888 Hz golden frequency designed to align neural pathways with effortless wealth and overflow.',
    category: 'wealth',
    subcategory: 'Abundance Flow',
    usageTypes: ['ONE TIME', 'MORNING'],
    tags: ['wealth', 'abundance', '888hz', 'money mindset'],
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    source: { platform: 'youtube', videoId: 'dQw4w9WgXcQ', url: 'https://youtube.com', creator: 'Cosmic Abundance Labs' },
    duration: 720,
    binauralFreq: 8,
    carrierFreq: 888,
    processingStatus: 'ready' as const,
    playCount: 14200,
  },
  {
    id: 'sub-wealth-02',
    slug: 'overnight-millionaire-subconscious',
    title: 'Overnight Financial Sovereignty Sleep Stream',
    description: 'Subconscious deep sleep theta reprogramming for unyielding prosperity consciousness.',
    category: 'wealth',
    subcategory: 'Money Mindset',
    usageTypes: ['NIGHT', 'SLEEP'],
    tags: ['wealth', 'sleep', 'theta', 'overnight'],
    artworkUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_wealth_02', url: 'https://youtube.com', creator: 'Aura Frequency' },
    duration: 28800,
    binauralFreq: 4.5,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 28900,
  },

  // 2. CONFIDENCE
  {
    id: 'sub-conf-01',
    slug: 'unshakeable-confidence-reset',
    title: 'Unshakeable Core Confidence Reset',
    description: 'A 12-minute sovereign reset to erase social hesitation, impostor feelings, and second-guessing.',
    category: 'confidence',
    subcategory: 'Unshakable Belief',
    usageTypes: ['ONE TIME', 'MORNING'],
    tags: ['confidence', 'self-trust', 'reset', 'alpha'],
    artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_conf_01', url: 'https://youtube.com', creator: 'Sovereign Mind' },
    duration: 720,
    binauralFreq: 10,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 31200,
  },

  // 3. LOOKS & APPEARANCE
  {
    id: 'sub-looks-01',
    slug: 'cellular-glow-up-symmetry',
    title: 'Cellular Glow Up & Radiant Presence',
    description: 'Somatic frequency session designed around physical revitalization, symmetry, and luminous aura.',
    category: 'looks',
    subcategory: 'Glow Up',
    usageTypes: ['DAYTIME', 'REPEAT'],
    tags: ['glow up', 'beauty', 'vitality', 'mirrors'],
    artworkUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    source: { platform: 'youtube', videoId: 'yt_looks_01', url: 'https://youtube.com', creator: 'Ethereal Harmonics' },
    duration: 900,
    binauralFreq: 7.83,
    carrierFreq: 639,
    processingStatus: 'ready' as const,
    playCount: 19800,
  },

  // 4. SELF CONCEPT
  {
    id: 'sub-self-01',
    slug: 'sovereign-self-concept-mastery',
    title: 'Subconscious Identity & Self-Worth Anchor',
    description: 'Rewire the foundational baseline: you do not attract what you want, you attract what you embody.',
    category: 'self-concept',
    subcategory: 'Core Identity',
    usageTypes: ['MORNING', 'DAYTIME', 'REPEAT'],
    tags: ['self concept', 'identity', 'worth', 'embodiment'],
    artworkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_self_01', url: 'https://youtube.com', creator: 'Orbit Original' },
    duration: 1200,
    binauralFreq: 6.5,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 42100,
  },

  // 5. LOVE & RELATIONSHIPS
  {
    id: 'sub-love-01',
    slug: 'magnetic-relational-harmony',
    title: 'Magnetic Heart Resonance & Relational Harmony',
    description: '639 Hz Solfeggio frequency to dissolve relational anxiety, open vulnerability, and cultivate deep devotion.',
    category: 'love',
    subcategory: 'Deep Connection',
    usageTypes: ['NIGHT', 'DAYTIME'],
    tags: ['love', 'harmony', '639hz', 'relationships'],
    artworkUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_love_01', url: 'https://youtube.com', creator: 'Heartwave Frequency' },
    duration: 1500,
    binauralFreq: 6.0,
    carrierFreq: 639,
    processingStatus: 'ready' as const,
    playCount: 22400,
  },

  // 6. CAREER & SUCCESS
  {
    id: 'sub-career-01',
    slug: 'visionary-creative-impact',
    title: 'Visionary Career Mastery & Upward Momentum',
    description: 'High-gamma focus session designed for creative executives, founders, and ambitious creators.',
    category: 'career',
    subcategory: 'Visionary Leadership',
    usageTypes: ['FOCUS', 'DAYTIME'],
    tags: ['career', 'success', 'gamma', 'leadership'],
    artworkUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_career_01', url: 'https://youtube.com', creator: 'Executive Mind' },
    duration: 2700,
    binauralFreq: 40,
    carrierFreq: 741,
    processingStatus: 'ready' as const,
    playCount: 16700,
  },

  // 7. ACADEMIC SUCCESS
  {
    id: 'sub-academic-01',
    slug: 'deep-retention-analytical-clarity',
    title: 'Deep Information Retention & Exam Composure',
    description: 'Bilateral audio stimulation to maximize memory encoding, conceptual clarity, and calm testing recall.',
    category: 'academic',
    subcategory: 'Deep Retention',
    usageTypes: ['FOCUS', 'REPEAT'],
    tags: ['academic', 'study', 'memory', 'beta'],
    artworkUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    source: { platform: 'youtube', videoId: 'yt_acad_01', url: 'https://youtube.com', creator: 'Scholastic Binaural' },
    duration: 3600,
    binauralFreq: 14,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 25300,
  },

  // 8. MOTIVATION
  {
    id: 'sub-motivation-01',
    slug: 'instant-action-fire-reset',
    title: 'Instant Action Fire & Inertia Breaker',
    description: 'A 10-minute high-tempo neural reset to destroy paralysis by analysis and initiate clean execution.',
    category: 'motivation',
    subcategory: 'Inner Fire',
    usageTypes: ['ONE TIME', 'MORNING'],
    tags: ['motivation', 'action', 'reset', 'dopamine'],
    artworkUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_mot_01', url: 'https://youtube.com', creator: 'Momentum Protocol' },
    duration: 600,
    binauralFreq: 18,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 38100,
  },

  // 9. DISCIPLINE
  {
    id: 'sub-discipline-01',
    slug: 'frictionless-daily-consistency',
    title: 'Monastic Discipline & Frictionless Execution',
    description: 'Eliminate emotional resistance to hard work. Build identity around reliable, disciplined follow-through.',
    category: 'discipline',
    subcategory: 'Habit Architecture',
    usageTypes: ['MORNING', 'DAYTIME', 'REPEAT'],
    tags: ['discipline', 'habits', 'consistency', 'willpower'],
    artworkUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_disc_01', url: 'https://youtube.com', creator: 'Stoic Frequency' },
    duration: 1800,
    binauralFreq: 12,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 19400,
  },

  // 10. SOCIAL CONFIDENCE
  {
    id: 'sub-social-01',
    slug: 'charismatic-magnetism-ease',
    title: 'Charismatic Magnetism & Social Ease',
    description: 'Dissolve social performance anxiety. Radiate warmth, witty banter, and relaxed room command.',
    category: 'social-confidence',
    subcategory: 'Charismatic Ease',
    usageTypes: ['ONE TIME', 'DAYTIME'],
    tags: ['social', 'charisma', 'warmth', 'reset'],
    artworkUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_soc_01', url: 'https://youtube.com', creator: 'Charisma Wave' },
    duration: 840,
    binauralFreq: 9.5,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 33700,
  },

  // 11. FOCUS & PRODUCTIVITY
  {
    id: 'sub-focus-01',
    slug: 'deep-work-flow-state',
    title: 'Deep Work Flow State & Cognitive Laser',
    description: 'Pure 40 Hz Gamma binaural soundscape to hold uninterrupted attention across complex deep work tasks.',
    category: 'focus',
    subcategory: 'Flow State',
    usageTypes: ['FOCUS', 'REPEAT'],
    tags: ['focus', 'gamma', 'deep work', 'productivity'],
    artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_foc_01', url: 'https://youtube.com', creator: 'Flowstate Labs' },
    duration: 2700,
    binauralFreq: 40,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 46200,
  },

  // 12. HEALTH & WELLNESS
  {
    id: 'sub-health-01',
    slug: 'somatic-repair-cellular-harmony',
    title: 'Cellular Restoration & Somatic Balance',
    description: '528 Hz miracle tone designed for nervous system down-regulation, tissue regeneration, and deep calm.',
    category: 'health',
    subcategory: 'Cellular Regeneration',
    usageTypes: ['DAYTIME', 'NIGHT'],
    tags: ['health', 'wellness', '528hz', 'somatic'],
    artworkUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_health_01', url: 'https://youtube.com', creator: 'Somatic Healing' },
    duration: 1800,
    binauralFreq: 7.83,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 18300,
  },

  // 13. ENERGY
  {
    id: 'sub-energy-01',
    slug: 'morning-supernova-clean-energy',
    title: 'Morning Supernova & Caffeine-Free Vitality',
    description: 'High-frequency solar audio designed to clear morning grogginess and activate clean biological stamina.',
    category: 'energy',
    subcategory: 'Morning Charge',
    usageTypes: ['MORNING', 'ONE TIME'],
    tags: ['energy', 'vitality', 'morning', 'solar'],
    artworkUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_nrg_01', url: 'https://youtube.com', creator: 'Solar Frequency' },
    duration: 600,
    binauralFreq: 15,
    carrierFreq: 741,
    processingStatus: 'ready' as const,
    playCount: 27900,
  },

  // 14. PEACE & CALM
  {
    id: 'sub-peace-01',
    slug: 'still-waters-anxiety-dissolver',
    title: 'Still Waters: Acute Anxiety & Stress Dissolver',
    description: 'A 15-minute sanctuary session using 432 Hz theta tones to soothe nervous tension and restore stillness.',
    category: 'peace',
    subcategory: 'Still Waters',
    usageTypes: ['ONE TIME', 'NIGHT', 'DAYTIME'],
    tags: ['peace', 'calm', 'anxiety relief', '432hz'],
    artworkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_peace_01', url: 'https://youtube.com', creator: 'Quiet Cosmos' },
    duration: 900,
    binauralFreq: 5.5,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 39500,
  },

  // 15. SLEEP
  {
    id: 'sub-sleep-01',
    slug: 'delta-overnight-reprogramming',
    title: 'Delta Deep Sleep 8-Hour Overhaul',
    description: 'Uninterrupted 8-hour delta wave loop for restorative REM sleep and deep subconscious alignment.',
    category: 'sleep',
    subcategory: 'Delta Deep Sleep',
    usageTypes: ['NIGHT', 'SLEEP'],
    tags: ['sleep', 'overnight', 'delta', 'rest'],
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_slp_01', url: 'https://youtube.com', creator: 'Midnight Orbit' },
    duration: 28800,
    binauralFreq: 2.5,
    carrierFreq: 432,
    processingStatus: 'ready' as const,
    playCount: 52400,
  },

  // 16. LUCK / OPPORTUNITIES
  {
    id: 'sub-luck-01',
    slug: 'golden-synchronicity-serendipity',
    title: 'Golden Synchronicity & Fortunate Timing',
    description: 'Attune to harmonic coincidence, unexpected opportunities, and effortless serendipity in your reality.',
    category: 'luck',
    subcategory: 'Serendipity Magnet',
    usageTypes: ['MORNING', 'DAYTIME'],
    tags: ['luck', 'synchronicity', 'serendipity', 'opportunities'],
    artworkUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/ambient_stream.ogg',
    source: { platform: 'youtube', videoId: 'yt_luck_01', url: 'https://youtube.com', creator: 'Aura Portals' },
    duration: 1080,
    binauralFreq: 8.5,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 21900,
  },

  // 17. PERSONAL GROWTH
  {
    id: 'sub-growth-01',
    slug: 'quantum-identity-transcendence',
    title: 'Quantum Identity Shift & Highest Self Anchor',
    description: 'Break generational conditioning and step boldly into the expanded version of you that already exists.',
    category: 'growth',
    subcategory: 'Higher Self Anchor',
    usageTypes: ['MORNING', 'NIGHT', 'REPEAT'],
    tags: ['personal growth', 'mindset', 'transformation', 'quantum'],
    artworkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/humming_room.ogg',
    source: { platform: 'youtube', videoId: 'yt_growth_01', url: 'https://youtube.com', creator: 'Orbit Original' },
    duration: 1320,
    binauralFreq: 7.0,
    carrierFreq: 528,
    processingStatus: 'ready' as const,
    playCount: 34100,
  },
];

// In-Memory Repository
let memorySubliminals: any[] = [...SEED_SUBLIMINALS];

export const SubliminalRepository = {
  async findAll(query: {
    category?: string;
    usageType?: string;
    search?: string;
    sort?: 'recommended' | 'popular' | 'duration' | 'newest';
    limit?: number;
    offset?: number;
  }) {
    if (isDbConnected()) {
      const filter: any = {};
      if (query.category && query.category !== 'all') {
        filter.category = query.category;
      }
      if (query.usageType && query.usageType !== 'All') {
        filter.usageTypes = query.usageType;
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ title: regex }, { description: regex }, { tags: regex }, { subcategory: regex }];
      }
      const q = SubliminalModel.find(filter);
      if (query.sort === 'popular') q.sort({ playCount: -1 });
      else if (query.sort === 'duration') q.sort({ duration: 1 });
      else if (query.sort === 'newest') q.sort({ createdAt: -1 });
      else q.sort({ playCount: -1 });

      if (query.limit) q.limit(query.limit);
      if (query.offset) q.skip(query.offset);
      return q.lean();
    }

    // In-memory fallback
    let list = [...memorySubliminals];
    if (query.category && query.category !== 'all') {
      list = list.filter((s) => s.category === query.category);
    }
    if (query.usageType && query.usageType !== 'All') {
      list = list.filter((s) => s.usageTypes?.includes(query.usageType));
    }
    if (query.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          s.subcategory?.toLowerCase().includes(q)
      );
    }
    if (query.sort === 'popular') {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (query.sort === 'duration') {
      list.sort((a, b) => a.duration - b.duration);
    } else if (query.sort === 'newest') {
      list.reverse();
    } else {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }

    const offset = query.offset || 0;
    const limit = query.limit || list.length;
    return list.slice(offset, offset + limit);
  },

  async findById(id: string) {
    if (isDbConnected()) {
      return SubliminalModel.findById(id).lean();
    }
    return memorySubliminals.find((s) => s.id === id || s._id?.toString() === id);
  },

  async findBySlug(slug: string) {
    if (isDbConnected()) {
      return SubliminalModel.findOne({ slug }).lean();
    }
    return memorySubliminals.find((s) => s.slug === slug);
  },

  async incrementPlay(id: string) {
    if (isDbConnected()) {
      return SubliminalModel.findByIdAndUpdate(id, { $inc: { playCount: 1 } }, { new: true });
    }
    const item = memorySubliminals.find((s) => s.id === id || s._id?.toString() === id);
    if (item) {
      item.playCount = (item.playCount || 0) + 1;
    }
    return item;
  },

  async upsertByVideoId(data: any) {
    if (isDbConnected()) {
      if (data.source?.videoId) {
        return SubliminalModel.findOneAndUpdate(
          { 'source.videoId': data.source.videoId },
          { $set: data },
          { upsert: true, new: true }
        );
      }
      return SubliminalModel.create(data);
    }

    const idx = memorySubliminals.findIndex(
      (s) => s.source?.videoId && s.source.videoId === data.source?.videoId
    );
    if (idx >= 0) {
      memorySubliminals[idx] = { ...memorySubliminals[idx], ...data, updatedAt: new Date() };
      return memorySubliminals[idx];
    }
    const newDoc = {
      ...data,
      id: 'sub-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memorySubliminals.unshift(newDoc);
    return newDoc;
  },
};
