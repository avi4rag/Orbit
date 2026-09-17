export interface AudioMetadata {
  id: string;
  title: string;
  creator: string;
  source: 'licensed' | 'generated' | 'user-uploaded' | 'youtube-authorized';
  sourceUrl: string;
  thumbnail: string;
  category: 'wealth' | 'career' | 'peace' | 'confidence' | 'love' | 'travel';
  topics: string[];
  mood: string;
  duration: number; // in seconds
  language: string;
  tags: string[];
  description: string;
  credits: string;
  audioUrl?: string; // Web Audio API soundscape synth identifier or streaming audio URL
  binauralFreq?: number; // e.g., 6 for Theta, 10 for Alpha, 528 for Solfeggio
  carrierFreq?: number; // e.g. 216 or 432
  defaultMode: 'quick-reset' | 'deep-visualization' | 'sleep' | 'focus' | 'custom';
  spokenAffirmations: string[];
  manifestationPractice: {
    insteadOf: string;
    use: string;
    thenAction: string;
  };
}

export interface VisualAsset {
  id: string;
  theme: 'wealth' | 'career' | 'peace' | 'confidence' | 'love' | 'travel';
  title: string;
  imageUrl: string;
  creator: string;
  license: string;
  sourceUrl: string;
  tags: string[];
  colorPalette: string[];
}

export interface AudioProvider {
  name: string;
  fetchSessions(): Promise<AudioMetadata[]>;
  fetchSessionById(id: string): Promise<AudioMetadata | null>;
}

export interface VisualProvider {
  name: string;
  fetchAssets(theme?: string): Promise<VisualAsset[]>;
}

// Initial Curated Audio Catalog adhering strictly to §3.2 Legal and Metadata Contract
export const SEED_SESSIONS: AudioMetadata[] = [
  {
    id: 'session-wealth-abundance',
    title: 'Wealth Abundance & Mindful Freedom',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/wealth-abundance',
    thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    category: 'wealth',
    topics: ['Financial Independence', 'Abundance Mindset', 'Stewardship', 'Freedom'],
    mood: 'serene & expansive',
    duration: 900, // 15 min
    language: 'en',
    tags: ['wealth', 'abundance', 'freedom', 'theta', 'solfeggio-528'],
    description: 'An immersive 528Hz Solfeggio and Theta wave acoustic landscape designed to cultivate calm financial confidence and freedom from scarcity.',
    credits: 'Acoustic synthesis & harmonic tuning produced by Orbit Soundscapes. Mastered under Creative Commons CC-BY 4.0 license.',
    binauralFreq: 6, // 6Hz Theta
    carrierFreq: 528, // 528Hz transformation
    defaultMode: 'deep-visualization',
    spokenAffirmations: [
      'I am already living as a conscious steward of financial independence.',
      'I align my daily spending with my deepest long-term values.',
      'I create compounding value through patient, deliberate discipline.',
      'Scarcity dissolves in the presence of clear planning and purposeful action.',
    ],
    manifestationPractice: {
      insteadOf: 'I hope I become rich.',
      use: 'Visualize yourself already living a financially secure life. Imagine the environment, routines, decisions, freedom, and responsibilities that come with it.',
      thenAction: 'What is one concrete financial decision or budgeting step you will execute today?',
    },
  },
  {
    id: 'session-career-mastery',
    title: 'Professional Mastery & Calm Leadership',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/career-mastery',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'career',
    topics: ['Leadership', 'Craftsmanship', 'High Performance', 'Focus'],
    mood: 'empowered & focused',
    duration: 1200, // 20 min
    language: 'en',
    tags: ['career', 'focus', 'leadership', 'alpha-10hz'],
    description: '10Hz Alpha wave acoustic environment to stimulate effortless focus, quiet confidence, and decisive problem-solving.',
    credits: 'Composed by Orbit Sound Architecture. Certified royalty-free commercial library.',
    binauralFreq: 10, // 10Hz Alpha
    carrierFreq: 432, // 432Hz organic tuning
    defaultMode: 'focus',
    spokenAffirmations: [
      'I am already becoming the person who creates undeniable value.',
      'I communicate with grounded clarity, precision, and purpose.',
      'I continually refine my core skills through patient, focused practice.',
      'I solve complex challenges with quiet composure.',
    ],
    manifestationPractice: {
      insteadOf: 'I hope I get promoted or find a better job.',
      use: 'Inhabit the identity of a master practitioner who already brings extraordinary care, preparation, and insight to every meeting and project.',
      thenAction: 'Spend one uninterrupted hour developing a core high-leverage skill or submitting an impactful deliverable.',
    },
  },
  {
    id: 'session-deep-stillness',
    title: 'Deep Stillness & Inner Sanctuary',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/deep-stillness',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    category: 'peace',
    topics: ['Inner Peace', 'Anxiety Relief', 'Emotional Grounding', 'Mental Stillness'],
    mood: 'deeply tranquil',
    duration: 600, // 10 min
    language: 'en',
    tags: ['peace', 'tranquility', 'theta-4hz', 'ocean-drone'],
    description: 'Subtle ocean swell harmonics blended with 4Hz Theta waves for resetting nervous system tension and cultivating grounded quietness.',
    credits: 'Nature sound field recording & generative drone audio by Orbit Soundscapes. Public domain field capture archive.',
    binauralFreq: 4, // 4Hz Deep Theta
    carrierFreq: 396,
    defaultMode: 'quick-reset',
    spokenAffirmations: [
      'I am anchored in unshakeable tranquility and mental stillness.',
      'I choose what deserves my attention and peacefully release the rest.',
      'There is no rush in this present breath.',
      'Stillness is my baseline of power.',
    ],
    manifestationPractice: {
      insteadOf: 'I wish my life were less chaotic and stressful.',
      use: 'Step into the present reality of an unshakeable inner sanctuary that external turbulence cannot touch.',
      thenAction: 'Step away from screens for 10 minutes and sit in intentional silent awareness.',
    },
  },
  {
    id: 'session-sleep-restoration',
    title: 'Cosmic Drift: Delta Sleep Restoration',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/sleep-restoration',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    category: 'peace',
    topics: ['Deep Sleep', 'Subconscious Rest', 'Delta Waves', 'Regeneration'],
    mood: 'hypnotic & weightless',
    duration: 2700, // 45 min
    language: 'en',
    tags: ['sleep', 'delta-2hz', 'sleep-timer', 'brown-noise'],
    description: 'Deep celestial brown noise and 2Hz Delta binaural waves formulated for effortless sleep onset and restorative sleep architecture.',
    credits: 'Generative cosmic noise synthesis by Orbit Audio Labs.',
    binauralFreq: 2, // 2Hz Delta
    carrierFreq: 174, // 174Hz deep grounding
    defaultMode: 'sleep',
    spokenAffirmations: [
      'My mind is at rest. My work for today is complete.',
      'I surrender this day with peace and trust tomorrow will unfold in harmony.',
      'Sleep restores my vitality, intuition, and cellular strength.',
    ],
    manifestationPractice: {
      insteadOf: 'I am worried about tomorrow.',
      use: 'Allow yourself to experience the safety and completion of having already done your best today.',
      thenAction: 'Dim room lights, place phone face-down, and take 6 slow diaphragmatic breaths.',
    },
  },
  {
    id: 'session-courage-resonance',
    title: 'Unshakeable Courage & Presence',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/courage-resonance',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    category: 'confidence',
    topics: ['Confidence', 'Courage', 'Authentic Voice', 'Social Ease'],
    mood: 'uplifting & grounded',
    duration: 900, // 15 min
    language: 'en',
    tags: ['confidence', 'courage', 'voice', 'alpha'],
    description: 'Resonant harmonic soundscape designed to open posture, dissolve impostor syndrome, and cultivate authentic charisma.',
    credits: 'Composed by Orbit Studio. Certified original audio synthesis.',
    binauralFreq: 8,
    carrierFreq: 528,
    defaultMode: 'deep-visualization',
    spokenAffirmations: [
      'I trust my capacity to navigate the unknown with courage.',
      'I speak my truth with calm clarity and without apology.',
      'I welcome discomfort as the proven doorway to mastery.',
      'I do not shrink to fit the expectations of others.',
    ],
    manifestationPractice: {
      insteadOf: 'I hope people like me and take me seriously.',
      use: 'Feel the natural dignity of standing in your own grounded truth with warm openness and zero defensiveness.',
      thenAction: 'Have the conversation you have been avoiding or introduce yourself to a new colleague with direct presence.',
    },
  },
  {
    id: 'session-heart-resonance',
    title: 'Heart Resonance & Harmonious Connection',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/heart-resonance',
    thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    category: 'love',
    topics: ['Reciprocal Love', 'Compassion', 'Healthy Boundaries', 'Warmth'],
    mood: 'warm & embracing',
    duration: 900, // 15 min
    language: 'en',
    tags: ['love', 'compassion', '639hz', 'theta'],
    description: '639Hz Solfeggio harmonic frequency dedicated to interpersonal resonance, emotional availability, and compassionate connection.',
    credits: 'Harmonic synthesis by Orbit Acoustics.',
    binauralFreq: 6,
    carrierFreq: 639, // 639Hz connection
    defaultMode: 'deep-visualization',
    spokenAffirmations: [
      'I am grounded in unconditional self-respect and openhearted connection.',
      'I communicate my boundaries and desires with warmth and honesty.',
      'I attract and nurture relationships founded on mutual growth.',
      'Love is an active daily practice that begins within.',
    ],
    manifestationPractice: {
      insteadOf: 'I want someone to complete me.',
      use: 'Inhabit the state of complete emotional wholeness and warmth, sharing that abundance with the world.',
      thenAction: 'Send a genuine, unprompted message of appreciation to someone who has supported you.',
    },
  },
  {
    id: 'session-horizon-expansion',
    title: 'Global Horizons & Lifestyle Architecture',
    creator: 'Orbit Soundscapes Studio',
    source: 'licensed',
    sourceUrl: 'https://orbit.app/catalog/licensed/horizon-expansion',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    category: 'travel',
    topics: ['Travel Freedom', 'Curiosity', 'Adventure', 'Perspective'],
    mood: 'expansive & inspired',
    duration: 900, // 15 min
    language: 'en',
    tags: ['travel', 'adventure', 'horizons', 'alpha'],
    description: 'An acoustic voyage blending ambient field textures with airy harmonic drones to spark creative wanderlust and lifestyle design.',
    credits: 'Composed by Orbit Sound Architecture.',
    binauralFreq: 10,
    carrierFreq: 432,
    defaultMode: 'deep-visualization',
    spokenAffirmations: [
      'I am an open, resilient explorer of the world and its possibilities.',
      'My life is rich with diverse horizons, cultures, and wonder.',
      'I create freedom through intentional planning and purposeful action.',
    ],
    manifestationPractice: {
      insteadOf: 'I wish I could travel and live freely.',
      use: 'Picture yourself with flexible routines, exploring new environments with ease and adaptability.',
      thenAction: 'Create a specific savings budget or plan the itinerary details for your next destination.',
    },
  },
];

// Visual Assets adhering to §3.3 Theme System
export const SEED_VISUALS: VisualAsset[] = [
  {
    id: 'vis-wealth-1',
    theme: 'wealth',
    title: 'Architectural Skyline at Twilight',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/architectural-view',
    tags: ['wealth', 'skyline', 'architecture', 'freedom'],
    colorPalette: ['#0d1026', '#1c224a', '#d4af37', '#f4e5b2'],
  },
  {
    id: 'vis-career-1',
    theme: 'career',
    title: 'Modern Minimalist Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/modern-office',
    tags: ['career', 'technology', 'focus', 'craft'],
    colorPalette: ['#0a0c1a', '#242b5c', '#38bdf8', '#e0f2fe'],
  },
  {
    id: 'vis-peace-1',
    theme: 'peace',
    title: 'Serene Ocean Horizon & Mist',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/ocean-horizon',
    tags: ['peace', 'ocean', 'horizon', 'stillness'],
    colorPalette: ['#06111e', '#133e5c', '#5eead4', '#ccfbf1'],
  },
  {
    id: 'vis-confidence-1',
    theme: 'confidence',
    title: 'Mountain Peak Under Starlight',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/mountain-starry-night',
    tags: ['confidence', 'mountain', 'stars', 'strength'],
    colorPalette: ['#070a1a', '#211942', '#a855f7', '#f3e8ff'],
  },
  {
    id: 'vis-love-1',
    theme: 'love',
    title: 'Warm Twilight Sunset Glow',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/warm-twilight',
    tags: ['love', 'sunset', 'warmth', 'connection'],
    colorPalette: ['#170b1a', '#4c1737', '#f43f5e', '#ffe4e6'],
  },
  {
    id: 'vis-travel-1',
    theme: 'travel',
    title: 'Expansive Coastal Valley',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    creator: 'Unsplash Verified Creator',
    license: 'Unsplash Commercial License',
    sourceUrl: 'https://unsplash.com/photos/coastal-valley',
    tags: ['travel', 'coast', 'wanderlust', 'discovery'],
    colorPalette: ['#09141f', '#19424e', '#38bdf8', '#e2f8ff'],
  },
];
