import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { RitualRepository } from '../models/Ritual.js';

export const ritualsRouter = Router();

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get today's ritual state
ritualsRouter.get('/today', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const today = getTodayString();
  const ritual = await RitualRepository.findByDate(userId, today);
  res.json({
    date: today,
    ritual,
    streak: req.user.streak,
  });
});

// Submit Morning Ritual
ritualsRouter.post('/morning', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = req.user;
    const today = getTodayString();
    const { goalId, goalTitle, affirmation, visualization, plannedAction } = req.body;

    if (!affirmation || !plannedAction) {
      res.status(400).json({ error: 'Affirmation and planned action are required.' });
      return;
    }

    const ritual = await RitualRepository.saveMorning(userId, today, {
      goalId,
      goalTitle,
      affirmation,
      visualization,
      plannedAction,
    });

    // Update streak
    const lastDate = user.streak?.lastRitualDate;
    const currentStreak = user.streak?.current || 0;
    const longestStreak = user.streak?.longest || 0;

    let newStreak = currentStreak;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      user.streak = {
        current: newStreak,
        longest: Math.max(longestStreak, newStreak),
        lastRitualDate: today,
      };
    }

    // Boost vitality for associated goal planet
    if (goalId && user.goals) {
      const goal = user.goals.find((g: any) => g.id === goalId);
      if (goal) {
        goal.vitality = Math.min(100, (goal.vitality || 0) + 10);
      }
    }

    await user.save();

    res.json({
      message: 'Morning ritual completed. You are aligned with your chosen reality.',
      ritual,
      streak: user.streak,
      goals: user.goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record morning ritual.' });
  }
});

// Submit Evening Ritual
ritualsRouter.post('/evening', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = req.user;
    const today = getTodayString();
    const { completedAction, reflection, gratitudeList, tomorrowIntention } = req.body;

    if (!reflection) {
      res.status(400).json({ error: 'Reflection is required.' });
      return;
    }

    const ritual = await RitualRepository.saveEvening(userId, today, {
      completedAction: completedAction || 'Taken aligned mindful action.',
      reflection,
      gratitudeList: Array.isArray(gratitudeList) ? gratitudeList : [],
      tomorrowIntention: tomorrowIntention || '',
    });

    // Boost overall vitality slightly for mindful reflection
    if (user.goals) {
      user.goals.forEach((g: any) => {
        g.vitality = Math.min(100, (g.vitality || 0) + 5);
      });
      await user.save();
    }

    res.json({
      message: 'Evening reflection completed. Rest in the knowledge of your forward movement.',
      ritual,
      streak: user.streak,
      goals: user.goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record evening ritual.' });
  }
});
