import { Router } from 'express';
import {
  getSessionCatalog,
  analyzeIntention,
  createSession,
  getSessionById,
  listSessions
} from '../controllers/sessionController.js';

const router = Router();

router.get('/catalog', getSessionCatalog);
router.post('/analyze-intention', analyzeIntention);
router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSessionById);

export default router;
