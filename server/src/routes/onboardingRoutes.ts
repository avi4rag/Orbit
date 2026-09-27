import { Router } from 'express';
import {
  submitOnboardingAnswers,
  getLatestOnboarding,
  getOnboardingById
} from '../controllers/onboardingController.js';

const router = Router();

router.post('/submit', submitOnboardingAnswers);
router.get('/latest', getLatestOnboarding);
router.get('/:id', getOnboardingById);

export default router;
