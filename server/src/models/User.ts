import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { isDbConnected } from '../db.js';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  goals: Array<{
    id: string;
    title: string;
    category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
    identityStatement: string;
    vitality: number; // 0 - 100 for celestial planet rendering
  }>;
  preferences: {
    preferredDuration: number;
    visualizationStyle: 'first-person' | 'observer';
    affirmationStyle: 'direct' | 'gentle' | 'declarative';
    preferredMood: string;
  };
  streak: {
    current: number;
    longest: number;
    lastRitualDate: string | null;
  };
  favorites: string[];
  recentlyPlayed: Array<{
    subliminalId: string;
    playedAt: Date;
    progress?: number;
    completed?: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    goals: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        category: {
          type: String,
          enum: ['career', 'wealth', 'peace', 'confidence', 'love', 'travel'],
          required: true,
        },
        identityStatement: { type: String, default: '' },
        vitality: { type: Number, default: 20 },
      },
    ],
    preferences: {
      preferredDuration: { type: Number, default: 15 },
      visualizationStyle: { type: String, default: 'first-person' },
      affirmationStyle: { type: String, default: 'declarative' },
      preferredMood: { type: String, default: 'clarity' },
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastRitualDate: { type: String, default: null },
    },
    favorites: [{ type: String }],
    recentlyPlayed: [
      {
        subliminalId: { type: String, required: true },
        playedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// In-Memory Fallback Store for offline resilience
export interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  goals: Array<{
    id: string;
    title: string;
    category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
    identityStatement: string;
    vitality: number;
  }>;
  preferences: {
    preferredDuration: number;
    visualizationStyle: 'first-person' | 'observer';
    affirmationStyle: 'direct' | 'gentle' | 'declarative';
    preferredMood: string;
  };
  streak: {
    current: number;
    longest: number;
    lastRitualDate: string | null;
  };
  favorites: string[];
  recentlyPlayed: Array<{
    subliminalId: string;
    playedAt: Date;
    progress?: number;
    completed?: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const memoryUsers: Map<string, MemoryUser> = new Map();

export const UserRepository = {
  async findByEmail(email: string) {
    if (isDbConnected()) {
      return UserModel.findOne({ email: email.toLowerCase() });
    }
    const user = Array.from(memoryUsers.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return null;
    return {
      ...user,
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, user.passwordHash),
      save: async function () {
        this.updatedAt = new Date();
        memoryUsers.set(this.id, { ...this });
        return this;
      },
    };
  },

  async findById(id: string) {
    if (isDbConnected()) {
      return UserModel.findById(id);
    }
    const user = memoryUsers.get(id);
    if (!user) return null;
    return {
      ...user,
      save: async function () {
        this.updatedAt = new Date();
        memoryUsers.set(this.id, { ...this });
        return this;
      },
    };
  },

  async create(data: { email: string; password: string; name: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const defaultGoals = [
      {
        id: 'goal-1',
        title: 'Master Creative Leadership',
        category: 'career' as const,
        identityStatement: 'I am already becoming the person who leads with calm confidence.',
        vitality: 45,
      },
      {
        id: 'goal-2',
        title: 'Financial Independence & Abundance',
        category: 'wealth' as const,
        identityStatement: 'I live with financial security, mindful stewardship, and freedom.',
        vitality: 35,
      },
      {
        id: 'goal-3',
        title: 'Deep Daily Tranquility',
        category: 'peace' as const,
        identityStatement: 'I am grounded in quiet clarity and unshakeable focus.',
        vitality: 60,
      },
    ];

    if (isDbConnected()) {
      return UserModel.create({
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        goals: defaultGoals,
      });
    }

    const id = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newUser: MemoryUser = {
      id,
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      goals: defaultGoals,
      preferences: {
        preferredDuration: 15,
        visualizationStyle: 'first-person',
        affirmationStyle: 'declarative',
        preferredMood: 'clarity',
      },
      streak: { current: 1, longest: 1, lastRitualDate: new Date().toISOString().split('T')[0] },
      favorites: ['session-wealth-abundance', 'session-theta-clarity'],
      recentlyPlayed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(id, newUser);
    return {
      ...newUser,
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, newUser.passwordHash),
      save: async function () {
        memoryUsers.set(this.id, { ...this });
        return this;
      },
    };
  },
};
