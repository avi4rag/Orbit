import { Router } from 'express';
import {
  getSessionCatalog,
  analyzeIntention,
  createSession,
  getSessionById,
  listSessions
} from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/catalog', getSessionCatalog);
router.post('/analyze-intention', analyzeIntention);

// Authenticated routes - user must be logged in
router.post('/', requireAuth, createSession);
router.get('/', requireAuth, listSessions);
router.get('/:id', requireAuth, getSessionById);

export default router;
