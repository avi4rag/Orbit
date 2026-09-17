import { Router, Request, Response } from 'express';
import { SEED_SESSIONS, SEED_VISUALS } from '../services/catalogService.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const catalogRouter = Router();

// Get all sessions with filtering
catalogRouter.get('/sessions', (req: Request, res: Response) => {
  const { category, mode, search } = req.query;

  let results = [...SEED_SESSIONS];

  if (category && typeof category === 'string') {
    results = results.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  if (mode && typeof mode === 'string') {
    results = results.filter((s) => s.defaultMode.toLowerCase() === mode.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ sessions: results });
});

// Get session by ID
catalogRouter.get('/sessions/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = SEED_SESSIONS.find((s) => s.id === id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Related sessions in the same category or mood
  const related = SEED_SESSIONS.filter(
    (s) => s.id !== id && (s.category === session.category || s.mood === session.mood)
  ).slice(0, 3);

  res.json({ session, related });
});

// Get visual assets with theme filter
catalogRouter.get('/visuals', (req: Request, res: Response) => {
  const { theme } = req.query;
  let visuals = [...SEED_VISUALS];

  if (theme && typeof theme === 'string') {
    visuals = visuals.filter((v) => v.theme.toLowerCase() === theme.toLowerCase());
  }

  res.json({ visuals });
});

// Toggle session favorite
catalogRouter.post('/favorites/:id/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const sessionId = req.params.id as string;

    const exists = SEED_SESSIONS.some((s) => s.id === sessionId);
    if (!exists) {
      res.status(404).json({ error: 'Session not found in catalog' });
      return;
    }

    user.favorites = user.favorites || [];
    const index = user.favorites.indexOf(sessionId);
    let isFavorited = false;

    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorited = false;
    } else {
      user.favorites.push(sessionId);
      isFavorited = true;
    }

    await user.save();

    res.json({
      message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
      isFavorited,
      favorites: user.favorites,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle favorite' });
  }
});
