import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ActionRepository } from '../models/Action.js';

export const actionsRouter = Router();

// Get user's actions
actionsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const actions = await ActionRepository.getByUserId(userId);
  res.json({ actions });
});

// Create new aligned action
actionsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { goalId, goalTitle, category, text, priority, dueDate, status, vitalityPoints } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Action text is required.' });
      return;
    }

    const newAction = await ActionRepository.create(userId, {
      goalId,
      goalTitle,
      category: category || 'career',
      text: text.trim(),
      priority: priority || 'medium',
      dueDate,
      status: status || 'todo',
      vitalityPoints: vitalityPoints ? Number(vitalityPoints) : 15,
    });

    res.status(201).json({ message: 'Aligned action logged.', action: newAction });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create action.' });
  }
});

// Update action (status, priority, note, dueDate, etc.)
actionsRouter.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const updates = req.body;

    const action = await ActionRepository.update(userId, id, updates);
    if (!action) {
      res.status(404).json({ error: 'Action not found.' });
      return;
    }

    // If marked completed/done, boost vitality
    const user = req.user;
    if ((action.status === 'completed' || action.status === 'done') && user?.goals) {
      const match =
        user.goals.find((g: any) => g.id === action.goalId) ||
        user.goals.find((g: any) => g.category === action.category);
      if (match) {
        match.vitality = Math.min(100, (match.vitality || 0) + (action.vitalityPoints || 15));
        if (typeof user.save === 'function') await user.save();
      }
    }

    res.json({ message: 'Action updated successfully.', action });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update action.' });
  }
});

// Toggle action completion & reflection
actionsRouter.patch('/:id/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { reflectionNote } = req.body;

    const action = await ActionRepository.toggleStatus(userId, id, reflectionNote);
    if (!action) {
      res.status(404).json({ error: 'Action not found.' });
      return;
    }

    // If completed, boost the user's corresponding goal planet vitality
    const user = req.user;
    if (action.status === 'completed' && user.goals) {
      const match =
        user.goals.find((g: any) => g.id === action.goalId) ||
        user.goals.find((g: any) => g.category === action.category);
      if (match) {
        match.vitality = Math.min(100, (match.vitality || 0) + (action.vitalityPoints || 15));
        await user.save();
      }
    }

    res.json({
      message: action.status === 'completed' ? 'Action completed! Celestial vitality surged.' : 'Action reverted to pending.',
      action,
      goals: user.goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update action.' });
  }
});

// Delete action
actionsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    await ActionRepository.delete(userId, id);
    res.json({ message: 'Action deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete action.' });
  }
});
