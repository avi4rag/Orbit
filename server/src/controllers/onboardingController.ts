import { Request, Response } from 'express';
import { OnboardingAnswer } from '../models/OnboardingAnswer.js';
import { ConceptGeneratorService, OnboardingAnswersPayload } from '../services/conceptGeneratorService.js';
import { UserModel } from '../models/User.js';

const conceptService = new ConceptGeneratorService();

export async function submitOnboardingAnswers(req: Request, res: Response) {
  try {
    const { desire, specificIntention, identity, feelings, currentBlock, action } = req.body;

    if (!desire || !specificIntention || !identity || !currentBlock || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required onboarding answers: desire, specificIntention, identity, currentBlock, action.'
      });
    }

    const payload: OnboardingAnswersPayload = {
      desire: String(desire).trim(),
      specificIntention: String(specificIntention).trim(),
      identity: String(identity).trim(),
      feelings: String(feelings || 'Calm, Centered, Confident').trim(),
      currentBlock: String(currentBlock).trim(),
      action: String(action).trim()
    };

    // 1. Generate 6–10 personalized concepts immediately (fast, without audio generation)
    const concepts = await conceptService.generateConcepts(payload);

    // 2. Persist onboarding answers in MongoDB
    const userId = (req as any).user?.id || (req as any).user?._id;

    const onboardingDoc = new OnboardingAnswer({
      userId: userId || undefined,
      desire: payload.desire,
      specificIntention: payload.specificIntention,
      identity: payload.identity,
      feelings: payload.feelings,
      currentBlock: payload.currentBlock,
      action: payload.action,
      concepts
    });

    await onboardingDoc.save();
    console.log(`[Onboarding] Saved answers to MongoDB: ${onboardingDoc._id} (${concepts.length} concepts)`);

    // If authenticated user, also sync to User model
    if (userId) {
      try {
        await UserModel.findByIdAndUpdate(userId, {
          $set: {
            'goals.0': {
              id: `goal-${Date.now()}`,
              title: payload.specificIntention,
              category: mapCategory(payload.desire),
              identityStatement: payload.identity,
              vitality: 50
            }
          }
        });
      } catch (uErr) {
        console.warn('[Onboarding] User profile sync notice:', uErr);
      }
    }

    return res.status(201).json({
      success: true,
      onboardingId: onboardingDoc._id,
      answers: {
        desire: onboardingDoc.desire,
        specificIntention: onboardingDoc.specificIntention,
        identity: onboardingDoc.identity,
        feelings: onboardingDoc.feelings,
        currentBlock: onboardingDoc.currentBlock,
        action: onboardingDoc.action
      },
      concepts: onboardingDoc.concepts
    });
  } catch (err: any) {
    console.error('[submitOnboardingAnswers error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error processing onboarding'
    });
  }
}

export async function getLatestOnboarding(req: Request, res: Response) {
  try {
    const doc = await OnboardingAnswer.findOne().sort({ createdAt: -1 });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'No onboarding answers found.' });
    }
    return res.json({
      success: true,
      onboardingId: doc._id,
      answers: {
        desire: doc.desire,
        specificIntention: doc.specificIntention,
        identity: doc.identity,
        feelings: doc.feelings,
        currentBlock: doc.currentBlock,
        action: doc.action
      },
      concepts: doc.concepts
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOnboardingById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await OnboardingAnswer.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Onboarding record not found.' });
    }
    return res.json({
      success: true,
      onboardingId: doc._id,
      answers: {
        desire: doc.desire,
        specificIntention: doc.specificIntention,
        identity: doc.identity,
        feelings: doc.feelings,
        currentBlock: doc.currentBlock,
        action: doc.action
      },
      concepts: doc.concepts
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function mapCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes('wealth')) return 'wealth';
  if (c.includes('career') || c.includes('focus') || c.includes('productivity')) return 'career';
  if (c.includes('peace') || c.includes('stillness')) return 'peace';
  if (c.includes('confidence')) return 'confidence';
  if (c.includes('love')) return 'love';
  return 'career';
}
