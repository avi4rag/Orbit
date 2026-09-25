import { Router, Request, Response } from 'express';
import { SubliminalRepository } from '../models/Subliminal.js';
import { UserRepository } from '../models/User.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const subliminalsRouter = Router();

const CATEGORY_META: Record<string, { title: string; tagline: string; accentColor: string; gradient: string }> = {
  wealth: {
    title: 'Wealth & Abundance',
    tagline: 'Align your neural pathways with compounding abundance, sovereign wealth, and prosperity consciousness.',
    accentColor: '#fbbf24',
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(180, 83, 9, 0.4) 100%)',
  },
  confidence: {
    title: 'Confidence',
    tagline: 'Dissolve self-doubt and anchor into unshakable, calm self-assurance and magnetic presence.',
    accentColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(3, 105, 161, 0.4) 100%)',
  },
  looks: {
    title: 'Looks & Appearance',
    tagline: 'Cultivate radiant cellular glow, magnetic posture, symmetry, and authentic physical vitality.',
    accentColor: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(159, 18, 57, 0.4) 100%)',
  },
  'self-concept': {
    title: 'Self Concept',
    tagline: 'Shift the foundational blueprint of who you believe you are in this reality.',
    accentColor: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(88, 28, 135, 0.4) 100%)',
  },
  love: {
    title: 'Love & Relationships',
    tagline: 'Harmonize your relational field to attract and nurture mutual, elevating, and authentic devotion.',
    accentColor: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(157, 23, 77, 0.4) 100%)',
  },
  career: {
    title: 'Career & Success',
    tagline: 'Elevate into high-impact creative leadership, professional mastery, and effortless opportunities.',
    accentColor: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(49, 46, 129, 0.4) 100%)',
  },
  academic: {
    title: 'Academic Success',
    tagline: 'Unlock photographic memory retention, calm exam composure, and effortless intellectual clarity.',
    accentColor: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(12, 74, 110, 0.4) 100%)',
  },
  motivation: {
    title: 'Motivation',
    tagline: 'Ignite unstoppable internal drive that turns passive intention into effortless daily momentum.',
    accentColor: '#f97316',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(154, 52, 18, 0.4) 100%)',
  },
  discipline: {
    title: 'Discipline',
    tagline: 'Embody frictionless consistency, structured execution, and the elimination of procrastination.',
    accentColor: '#84cc16',
    gradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.3) 0%, rgba(77, 124, 15, 0.4) 100%)',
  },
  'social-confidence': {
    title: 'Social Confidence',
    tagline: 'Command effortless charisma, social ease, witty conversational flow, and magnetic warmth.',
    accentColor: '#14b8a6',
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(19, 78, 74, 0.4) 100%)',
  },
  focus: {
    title: 'Focus & Productivity',
    tagline: 'Enter deep flow states with zero cognitive drift, razor-sharp attention, and high output.',
    accentColor: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(22, 78, 99, 0.4) 100%)',
  },
  health: {
    title: 'Health & Wellness',
    tagline: 'Revitalize cellular repair, somatic balance, radiant digestion, and vibrant longevity.',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.4) 100%)',
  },
  energy: {
    title: 'Energy',
    tagline: 'Infuse your body and mind with clean, vibrant, caffeine-free aliveness throughout your day.',
    accentColor: '#eab308',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(113, 63, 18, 0.4) 100%)',
  },
  peace: {
    title: 'Peace & Calm',
    tagline: 'Anchor into profound inner stillness, somatic safety, and complete release of tension.',
    accentColor: '#818cf8',
    gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.3) 0%, rgba(49, 46, 129, 0.4) 100%)',
  },
  sleep: {
    title: 'Sleep',
    tagline: 'Subconscious reprogramming while you sleep; delta-wave soundscapes and overnight loops.',
    accentColor: '#4f46e5',
    gradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(30, 27, 75, 0.6) 100%)',
  },
  luck: {
    title: 'Luck / Opportunities',
    tagline: 'Synchronize with beneficial synchronicities, serendipitous timing, and golden encounters.',
    accentColor: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 83, 45, 0.4) 100%)',
  },
  growth: {
    title: 'Personal Growth',
    tagline: 'Radical mindset expansion, dissolving limiting beliefs, and stepping into your highest self.',
    accentColor: '#d946ef',
    gradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.3) 0%, rgba(112, 26, 117, 0.4) 100%)',
  },
};

// GET /api/subliminals/categories
subliminalsRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const all = await SubliminalRepository.findAll({});
    const categories = Object.entries(CATEGORY_META).map(([slug, meta]) => {
      const count = all.filter((s: any) => s.category === slug).length;
      return {
        slug,
        ...meta,
        sessionCount: count,
      };
    });
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories.' });
  }
});

// GET /api/subliminals
subliminalsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, usageType, search, sort, limit, offset } = req.query;
    const subliminals = await SubliminalRepository.findAll({
      category: category as string,
      usageType: usageType as string,
      search: search as string,
      sort: sort as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json({
      subliminals,
      total: subliminals.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch subliminals.' });
  }
});

// GET /api/subliminals/category/:slug
subliminalsRouter.get('/category/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const meta = CATEGORY_META[slug];
    if (!meta) {
      res.status(404).json({ error: `Category '${slug}' not found.` });
      return;
    }

    const { usageType, search, sort } = req.query;
    const subliminals = await SubliminalRepository.findAll({
      category: slug,
      usageType: usageType as string,
      search: search as string,
      sort: sort as any,
    });

    res.json({
      category: {
        slug,
        ...meta,
        sessionCount: subliminals.length,
      },
      subliminals,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch category subliminals.' });
  }
});

// GET /api/subliminals/:id
subliminalsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const subliminal = await SubliminalRepository.findById(req.params.id);
    if (!subliminal) {
      res.status(404).json({ error: 'Subliminal session not found.' });
      return;
    }
    res.json({ subliminal });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve session.' });
  }
});

// POST /api/subliminals/:id/play
subliminalsRouter.post('/:id/play', async (req: Request, res: Response) => {
  try {
    const updated = await SubliminalRepository.incrementPlay(req.params.id);
    res.json({ success: true, session: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record play.' });
  }
});

// POST /api/subliminals/:id/favorite (Toggle favorite)
subliminalsRouter.post('/:id/favorite', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserRepository.findById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const favId = req.params.id;
    const favorites = user.favorites || [];
    const index = favorites.indexOf(favId);
    let isFavorite = false;

    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(favId);
      isFavorite = true;
    }

    user.favorites = favorites;
    await user.save();

    res.json({ isFavorite, favorites: user.favorites });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle favorite.' });
  }
});
