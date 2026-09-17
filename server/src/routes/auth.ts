import { Router, Request, Response } from 'express';
import { UserRepository } from '../models/User.js';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const user = await UserRepository.create({ email, password, name });
    const token = generateToken(user.id || (user as any)._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user.id || (user as any)._id,
        name: user.name,
        email: user.email,
        goals: user.goals,
        preferences: user.preferences,
        streak: user.streak,
        favorites: user.favorites,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const userId = user.id || (user as any)._id.toString();
    const token = generateToken(userId);

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        goals: user.goals,
        preferences: user.preferences,
        streak: user.streak,
        favorites: user.favorites,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

// Demo Guest Sign In
authRouter.post('/demo', async (req: Request, res: Response) => {
  try {
    const demoEmail = 'traveler@orbit.cosmos';
    let user = await UserRepository.findByEmail(demoEmail);
    if (!user) {
      user = await UserRepository.create({
        email: demoEmail,
        password: 'orbit-cosmic-experience',
        name: 'Cosmic Traveler',
      });
    }

    const userId = user.id || (user as any)._id.toString();
    const token = generateToken(userId);

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        goals: user.goals,
        preferences: user.preferences,
        streak: user.streak,
        favorites: user.favorites,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create demo session.' });
  }
});

// Current Authenticated User
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  res.json({
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
});
