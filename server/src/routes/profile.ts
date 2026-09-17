import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const profileRouter = Router();

// Get profile
profileRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  res.json({
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    goals: user.goals,
    preferences: user.preferences,
    streak: user.streak,
    favorites: user.favorites,
  });
});

// Update preferences / name
profileRouter.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { name, preferences } = req.body;

    if (name) user.name = name;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        goals: user.goals,
        preferences: user.preferences,
        streak: user.streak,
        favorites: user.favorites,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

// Add goal
profileRouter.post('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { title, category, identityStatement } = req.body;

    if (!title || !category) {
      res.status(400).json({ error: 'Goal title and category are required.' });
      return;
    }

    const newGoal = {
      id: 'goal-' + Date.now(),
      title,
      category,
      identityStatement: identityStatement || `I am already aligning with my highest potential in ${title}.`,
      vitality: 30,
    };

    user.goals.push(newGoal);
    await user.save();

    res.status(201).json({ message: 'Goal added successfully.', goal: newGoal, goals: user.goals });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add goal.' });
  }
});

// Update goal / vitality
profileRouter.put('/goals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title, identityStatement, vitality } = req.body;

    const goal = user.goals.find((g: any) => g.id === id);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found.' });
      return;
    }

    if (title !== undefined) goal.title = title;
    if (identityStatement !== undefined) goal.identityStatement = identityStatement;
    if (vitality !== undefined) goal.vitality = Math.min(100, Math.max(0, vitality));

    await user.save();

    res.json({ message: 'Goal updated successfully.', goal, goals: user.goals });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update goal.' });
  }
});

// Delete goal
profileRouter.delete('/goals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    user.goals = user.goals.filter((g: any) => g.id !== id);
    await user.save();

    res.json({ message: 'Goal removed successfully.', goals: user.goals });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete goal.' });
  }
});
