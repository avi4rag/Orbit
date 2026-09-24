import { Router, Request, Response } from 'express';
import { catalogManager, SEED_SESSIONS, type AudioMetadata } from '../services/catalogService.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const catalogRouter = Router();

// Get all active providers info (§3.2 & §3.3)
catalogRouter.get('/providers', (_req: Request, res: Response) => {
  res.json(catalogManager.getProvidersInfo());
});

// Get all sessions with filtering across providers
catalogRouter.get('/sessions', async (req: Request, res: Response) => {
  const { category, mode, search } = req.query;

  const results = await catalogManager.getAllSessions({
    category: typeof category === 'string' ? category : undefined,
    mode: typeof mode === 'string' ? mode : undefined,
    search: typeof search === 'string' ? search : undefined,
  });

  res.json({ sessions: results });
});

// Get session by ID across providers
catalogRouter.get('/sessions/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = await catalogManager.getSessionById(id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Related sessions in the same category or mood
  const allSessions = await catalogManager.getAllSessions();
  const related = allSessions
    .filter((s) => s.id !== id && (s.category === session.category || s.mood === session.mood))
    .slice(0, 3);

  res.json({ session, related });
});

// Get visual assets with theme filter
catalogRouter.get('/visuals', async (req: Request, res: Response) => {
  const { theme } = req.query;
  const visuals = await catalogManager.getVisuals(typeof theme === 'string' ? theme : undefined);
  res.json({ visuals });
});

// Ingest authorized YouTube track (§3.2 YouTubeIngestionAdapter)
catalogRouter.post('/youtube-preview', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { url, title, creator, category, duration, description, spokenAffirmations, thenAction } = req.body;
    if (!url || !title || !creator || !category) {
      res.status(400).json({ error: 'url, title, creator, and category are required' });
      return;
    }

    const result = await catalogManager.youtubeAdapter.ingestAuthorizedTrack({
      url,
      title,
      creator,
      category,
      duration: Number(duration) || 600,
      description: description || 'Ingested from YouTube for personal alignment and focus.',
      spokenAffirmations: Array.isArray(spokenAffirmations) ? spokenAffirmations : [],
      thenAction: thenAction || 'Identify your single most aligned next step.',
    });

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json({ session: result.session });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to ingest YouTube track' });
  }
});

// Register user-uploaded audio session (§3.2 UserUploadedAudioProvider)
catalogRouter.post('/user-upload', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionData, ownershipConfirmed } = req.body;
    if (!ownershipConfirmed) {
      res.status(400).json({ error: 'You must confirm ownership/licensing rights of the uploaded audio.' });
      return;
    }

    const payload: AudioMetadata = {
      ...sessionData,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source: 'user-uploaded',
      credits: `User-provided audio uploaded by ${req.user.email || req.user._id}. Rights confirmed.`,
    };

    const result = await catalogManager.userAudioProvider.registerUserSession(payload);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json({ session: result.session });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register user audio session' });
  }
});

// Toggle session favorite
catalogRouter.post('/favorites/:id/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const sessionId = req.params.id as string;

    const exists = await catalogManager.getSessionById(sessionId);
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
