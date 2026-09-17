import { Router, Request, Response } from 'express';
import { AIService, PersonalizationInput } from '../services/aiService.js';

export const aiRouter = Router();

// Server-Side AI Personalization Proxy
aiRouter.post('/personalize', async (req: Request, res: Response) => {
  try {
    const {
      goal,
      category,
      desiredLifestyle,
      currentMood,
      preferredMood,
      durationMinutes,
      visualizationStyle,
      affirmationStyle,
    } = req.body;

    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'A valid goal string is required.' });
      return;
    }

    const input: PersonalizationInput = {
      goal,
      category,
      desiredLifestyle,
      currentMood,
      preferredMood,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 15,
      visualizationStyle,
      affirmationStyle,
    };

    const bundle = await AIService.generateBundle(input);

    res.json({
      success: true,
      bundle,
      meta: {
        enforcesProductLanguageContract: true,
        enforcesActionRequirement: true,
        scientificDisclaimer:
          'This experience is designed for visualization, affirmations, reflection, and personal motivation. Manifestation is a philosophical framework, not a guarantee that thoughts alone cause external events. Always pair intention with consistent action.',
      },
    });
  } catch (error: any) {
    console.error('[AI Proxy Error]', error);
    res.status(500).json({ error: error.message || 'Failed to generate personalization bundle.' });
  }
});

// "Already Have It" Reframe Generator
aiRouter.post('/reframe', (req: Request, res: Response) => {
  const { statement } = req.body;
  if (!statement || typeof statement !== 'string') {
    res.status(400).json({ error: 'Statement is required.' });
    return;
  }

  // Transform "I want X" or "I hope to get X" into "I am already becoming / living as..."
  let reframed = statement
    .replace(/^i want to become /i, 'I am already becoming ')
    .replace(/^i want to be /i, 'I am already stepping into the identity of ')
    .replace(/^i want /i, 'I am already aligning my thoughts and actions with ')
    .replace(/^i hope to /i, 'I am deliberately taking daily steps to ')
    .replace(/^i wish i had /i, 'I cultivate the discipline and mindset of having ');

  if (reframed === statement) {
    reframed = `I am living in alignment with the habits, actions, and mindset of ${statement}.`;
  }

  res.json({
    original: statement,
    reframed,
    coreEquation: 'INTENTION + BELIEF/VISUALIZATION + CONSISTENT ACTION + PATIENCE + REFLECTION',
  });
});
