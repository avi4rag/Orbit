/**
 * ORBIT SUBLIMINAL LIBRARY — DATA TAXONOMY & TYPES
 * Drives both client rendering and backend discovery/classification
 */

export type UsageType =
  | 'ONE TIME'
  | 'MORNING'
  | 'DAYTIME'
  | 'NIGHT'
  | 'SLEEP'
  | 'FOCUS'
  | 'REPEAT';

export type CategorySlug =
  | 'wealth'
  | 'confidence'
  | 'looks'
  | 'self-concept'
  | 'love'
  | 'career'
  | 'academic'
  | 'motivation'
  | 'discipline'
  | 'social-confidence'
  | 'focus'
  | 'health'
  | 'energy'
  | 'peace'
  | 'sleep'
  | 'luck'
  | 'growth';

export interface CategoryDefinition {
  slug: CategorySlug;
  title: string;
  tagline: string;
  searchIntents: string[];
  subcategories: string[];
  accentColor: string;
  gradient: string;
  artworkKeywords: string[];
}

export interface SubliminalSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  categoryTitle: string;
  subcategory: string;
  usageTypes: UsageType[];
  tags: string[];
  artworkUrl: string;
  audioUrl: string;
  source: {
    platform: 'youtube' | 'curated' | 'synthesizer';
    videoId?: string;
    url: string;
    creator: string;
  };
  duration: number; // in seconds
  binauralFreq?: number;
  carrierFreq?: number;
  spokenAffirmations?: string[];
  processingStatus: 'ready' | 'processing';
  playCount: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 17 Core Content Categories with search vocabularies (§1 & §2)
 */
export const CATEGORY_DEFINITIONS: Record<CategorySlug, CategoryDefinition> = {
  wealth: {
    slug: 'wealth',
    title: 'Wealth & Abundance',
    tagline: 'Align your neural pathways with compounding abundance, sovereign wealth, and prosperity consciousness.',
    searchIntents: [
      'wealth subliminal',
      'money subliminal',
      'abundance subliminal',
      'financial abundance subliminal',
      'rich mindset subliminal',
      'millionaire mindset subliminal',
      'prosperity subliminal',
      'money affirmations',
      'abundance affirmations',
    ],
    subcategories: ['Money Mindset', 'Abundance Flow', 'Financial Freedom', 'Prosperity Magnet'],
    accentColor: '#fbbf24',
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(180, 83, 9, 0.4) 100%)',
    artworkKeywords: ['gold', 'cosmic luxury', 'galaxies', 'wealth symbolism'],
  },
  confidence: {
    slug: 'confidence',
    title: 'Confidence',
    tagline: 'Dissolve self-doubt and anchor into unshakable, calm self-assurance and magnetic presence.',
    searchIntents: [
      'confidence subliminal',
      'self confidence subliminal',
      'unshakeable confidence subliminal',
      'powerful confidence subliminal',
      'confidence affirmations',
      'social confidence subliminal',
    ],
    subcategories: ['Unshakable Belief', 'Self-Trust', 'Core Esteem', 'Radiant Aura'],
    accentColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(3, 105, 161, 0.4) 100%)',
    artworkKeywords: ['powerful silhouettes', 'light and shadow', 'celestial energy', 'deep blue'],
  },
  looks: {
    slug: 'looks',
    title: 'Looks & Appearance',
    tagline: 'Cultivate radiant cellular glow, magnetic posture, symmetry, and authentic physical vitality.',
    searchIntents: [
      'beauty subliminal',
      'glow up subliminal',
      'appearance subliminal',
      'physical attractiveness subliminal',
      'facial beauty subliminal',
      'self image subliminal',
      'glow up affirmations',
    ],
    subcategories: ['Glow Up', 'Radiant Vitality', 'Harmonious Symmetry', 'Physical Poise'],
    accentColor: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(159, 18, 57, 0.4) 100%)',
    artworkKeywords: ['mirrors', 'concentrated light', 'celestial beauty', 'soft gradients'],
  },
  'self-concept': {
    slug: 'self-concept',
    title: 'Self Concept',
    tagline: 'Shift the foundational blueprint of who you believe you are in this reality.',
    searchIntents: [
      'self concept subliminal',
      'self worth subliminal',
      'self love subliminal',
      'identity subliminal',
      'self esteem subliminal',
      'powerful self concept affirmations',
    ],
    subcategories: ['Core Identity', 'Inherent Worth', 'Sovereign Self', 'Subconscious Blueprint'],
    accentColor: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(88, 28, 135, 0.4) 100%)',
    artworkKeywords: ['identity', 'reflection', 'abstract silhouettes', 'cosmic transformation'],
  },
  love: {
    slug: 'love',
    title: 'Love & Relationships',
    tagline: 'Harmonize your relational field to attract and nurture mutual, elevating, and authentic devotion.',
    searchIntents: [
      'love subliminal',
      'relationship subliminal',
      'attraction subliminal',
      'self love subliminal',
      'healthy relationship affirmations',
      'romantic confidence subliminal',
    ],
    subcategories: ['Deep Connection', 'Magnetic Harmony', 'Secure Attachment', 'Unconditional Devotion'],
    accentColor: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(157, 23, 77, 0.4) 100%)',
    artworkKeywords: ['celestial connection', 'intertwined stars', 'paired forms'],
  },
  career: {
    slug: 'career',
    title: 'Career & Success',
    tagline: 'Elevate into high-impact creative leadership, professional mastery, and effortless opportunities.',
    searchIntents: [
      'success subliminal',
      'career success subliminal',
      'professional success affirmations',
      'productivity subliminal',
      'career confidence subliminal',
      'success mindset subliminal',
    ],
    subcategories: ['Visionary Leadership', 'Creative Mastery', 'Promotion & Impact', 'Professional Respect'],
    accentColor: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(49, 46, 129, 0.4) 100%)',
    artworkKeywords: ['futuristic architecture', 'upward movement', 'celestial spire'],
  },
  academic: {
    slug: 'academic',
    title: 'Academic Success',
    tagline: 'Unlock photographic memory retention, calm exam composure, and effortless intellectual clarity.',
    searchIntents: [
      'study subliminal',
      'academic success subliminal',
      'exam success affirmations',
      'focus study subliminal',
      'intelligence affirmations',
      'concentration subliminal',
    ],
    subcategories: ['Deep Retention', 'Exam Composure', 'Analytical Precision', 'Accelerated Learning'],
    accentColor: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(12, 74, 110, 0.4) 100%)',
    artworkKeywords: ['geometric intelligence', 'celestial books', 'prism light'],
  },
  motivation: {
    slug: 'motivation',
    title: 'Motivation',
    tagline: 'Ignite unstoppable internal drive that turns passive intention into effortless daily momentum.',
    searchIntents: [
      'motivation subliminal',
      'unstoppable motivation',
      'discipline motivation',
      'action subliminal',
      'productivity affirmations',
    ],
    subcategories: ['Inner Fire', 'Action Bias', 'Overcoming Inertia', 'Resilient Drive'],
    accentColor: '#f97316',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(154, 52, 18, 0.4) 100%)',
    artworkKeywords: ['cosmic flame', 'rising sun', 'kinetic momentum'],
  },
  discipline: {
    slug: 'discipline',
    title: 'Discipline',
    tagline: 'Embody frictionless consistency, structured execution, and the elimination of procrastination.',
    searchIntents: [
      'discipline subliminal',
      'self discipline affirmations',
      'consistency subliminal',
      'habit building affirmations',
      'procrastination subliminal',
    ],
    subcategories: ['Frictionless Execution', 'Habit Architecture', 'Monastic Focus', 'Reliable Willpower'],
    accentColor: '#84cc16',
    gradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.3) 0%, rgba(77, 124, 15, 0.4) 100%)',
    artworkKeywords: ['geometric pillars', 'unbending stone', 'pure alignment'],
  },
  'social-confidence': {
    slug: 'social-confidence',
    title: 'Social Confidence',
    tagline: 'Command effortless charisma, social ease, witty conversational flow, and magnetic warmth.',
    searchIntents: [
      'social confidence subliminal',
      'charisma subliminal',
      'communication confidence',
      'social anxiety confidence',
      'magnetic personality subliminal',
    ],
    subcategories: ['Charismatic Ease', 'Social Calm', 'Magnetic Warmth', 'Eloquent Flow'],
    accentColor: '#14b8a6',
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(19, 78, 74, 0.4) 100%)',
    artworkKeywords: ['warm celestial glow', 'expanding ripples', 'harmonic waves'],
  },
  focus: {
    slug: 'focus',
    title: 'Focus & Productivity',
    tagline: 'Enter deep flow states with zero cognitive drift, razor-sharp attention, and high output.',
    searchIntents: [
      'focus subliminal',
      'deep focus subliminal',
      'concentration subliminal',
      'productivity subliminal',
      'study focus',
      'work focus',
    ],
    subcategories: ['Flow State', 'Cognitive Laser', 'Zero Distraction', 'Peak Efficiency'],
    accentColor: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(22, 78, 99, 0.4) 100%)',
    artworkKeywords: ['geometric forms', 'concentrated light', 'minimalist singularity'],
  },
  health: {
    slug: 'health',
    title: 'Health & Wellness',
    tagline: 'Revitalize cellular repair, somatic balance, radiant digestion, and vibrant longevity.',
    searchIntents: [
      'wellness affirmations',
      'healthy lifestyle subliminal',
      'self care subliminal',
      'wellness mindset',
      'healthy habits affirmations',
    ],
    subcategories: ['Cellular Regeneration', 'Somatic Balance', 'Vital Immunity', 'Nervous System Rest'],
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.4) 100%)',
    artworkKeywords: ['vital emerald', 'living leaves', 'pure water ripples'],
  },
  energy: {
    slug: 'energy',
    title: 'Energy',
    tagline: 'Infuse your body and mind with clean, vibrant, caffeine-free aliveness throughout your day.',
    searchIntents: [
      'energy subliminal',
      'morning energy affirmations',
      'motivation energy',
      'positive energy subliminal',
    ],
    subcategories: ['Morning Charge', 'Clean Stamina', 'Electrified Focus', 'Sustained Aliveness'],
    accentColor: '#eab308',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(113, 63, 18, 0.4) 100%)',
    artworkKeywords: ['supernova burst', 'golden solar flares', 'high frequency'],
  },
  peace: {
    slug: 'peace',
    title: 'Peace & Calm',
    tagline: 'Anchor into profound inner stillness, somatic safety, and complete release of tension.',
    searchIntents: [
      'calm subliminal',
      'relaxation affirmations',
      'peaceful mind subliminal',
      'stress relief affirmations',
      'inner peace subliminal',
    ],
    subcategories: ['Still Waters', 'Anxiety Relief', 'Sovereign Silence', 'Deep Grounding'],
    accentColor: '#818cf8',
    gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.3) 0%, rgba(49, 46, 129, 0.4) 100%)',
    artworkKeywords: ['nebula clouds', 'cosmic ocean', 'starlight stillness'],
  },
  sleep: {
    slug: 'sleep',
    title: 'Sleep',
    tagline: 'Subconscious reprogramming while you sleep; delta-wave soundscapes and overnight loops.',
    searchIntents: [
      'sleep subliminal',
      'sleep affirmations',
      'deep sleep subliminal',
      'relaxing sleep audio',
      'overnight affirmations',
    ],
    subcategories: ['Delta Deep Sleep', 'Overnight Reprogramming', 'Dream Harmony', 'Lucid Rest'],
    accentColor: '#4f46e5',
    gradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(30, 27, 75, 0.6) 100%)',
    artworkKeywords: ['crescent moon', 'star constellations', 'midnight blue'],
  },
  luck: {
    slug: 'luck',
    title: 'Luck / Opportunities',
    tagline: 'Synchronize with beneficial synchronicities, serendipitous timing, and golden encounters.',
    searchIntents: [
      'luck subliminal',
      'lucky mindset affirmations',
      'opportunities subliminal',
      'synchronicity affirmations',
      'positive opportunities',
    ],
    subcategories: ['Serendipity Magnet', 'Golden Timing', 'Unseen Assistance', 'Expansive Synchronicity'],
    accentColor: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 83, 45, 0.4) 100%)',
    artworkKeywords: ['celestial four-leaf motif', 'starlight portals', 'radiant luck'],
  },
  growth: {
    slug: 'growth',
    title: 'Personal Growth',
    tagline: 'Radical mindset expansion, dissolving limiting beliefs, and stepping into your highest self.',
    searchIntents: [
      'personal growth subliminal',
      'mindset transformation',
      'growth mindset affirmations',
      'personal development subliminal',
      'becoming your best self',
    ],
    subcategories: ['Quantum Shift', 'Transcending Limits', 'Embodied Mastery', 'Higher Self Anchor'],
    accentColor: '#d946ef',
    gradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.3) 0%, rgba(112, 26, 117, 0.4) 100%)',
    artworkKeywords: ['blooming galaxy', 'spiraling ascension', 'infinite horizons'],
  },
};

/**
 * Reusable classification helper based on metadata & title (§10)
 */
export function classifyUsageTypes(title: string, durationSec: number = 600, tags: string[] = []): UsageType[] {
  const t = title.toLowerCase();
  const allTags = tags.map((s) => s.toLowerCase());
  const types: Set<UsageType> = new Set();

  if (t.includes('one time') || t.includes('one-time') || t.includes('reset') || t.includes('instant') || t.includes('flush')) {
    types.add('ONE TIME');
  }

  if (t.includes('morning') || t.includes('wake up') || t.includes('sunrise') || allTags.includes('morning')) {
    types.add('MORNING');
  }

  if (t.includes('night') || t.includes('evening') || t.includes('bedtime') || allTags.includes('night')) {
    types.add('NIGHT');
  }

  if (t.includes('sleep') || t.includes('overnight') || t.includes('8 hour') || durationSec >= 3600) {
    types.add('SLEEP');
  }

  if (t.includes('focus') || t.includes('study') || t.includes('work') || t.includes('productivity') || t.includes('gamma')) {
    types.add('FOCUS');
  }

  if (t.includes('loop') || t.includes('repeat') || t.includes('repetition') || allTags.includes('repeat')) {
    types.add('REPEAT');
  }

  // Default if none explicitly detected
  if (types.size === 0) {
    if (durationSec <= 900) {
      types.add('ONE TIME');
    } else {
      types.add('DAYTIME');
    }
  }

  return Array.from(types);
}
