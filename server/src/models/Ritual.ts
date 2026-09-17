import mongoose, { Document, Schema } from 'mongoose';
import { isDbConnected } from '../db.js';

export interface IRitual extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  morning?: {
    goalId: string;
    goalTitle: string;
    affirmation: string;
    visualization: string;
    plannedAction: string;
    completedAt: Date;
  };
  evening?: {
    completedAction: string;
    reflection: string;
    gratitudeList: string[];
    tomorrowIntention: string;
    completedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RitualSchema = new Schema<IRitual>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    morning: {
      goalId: String,
      goalTitle: String,
      affirmation: String,
      visualization: String,
      plannedAction: String,
      completedAt: Date,
    },
    evening: {
      completedAction: String,
      reflection: String,
      gratitudeList: [String],
      tomorrowIntention: String,
      completedAt: Date,
    },
  },
  { timestamps: true }
);

export const RitualModel = mongoose.model<IRitual>('Ritual', RitualSchema);

// In-Memory Fallback
const memoryRituals: Map<string, any> = new Map();

export const RitualRepository = {
  async findByDate(userId: string, date: string) {
    if (isDbConnected()) {
      return RitualModel.findOne({ userId, date });
    }
    const key = `${userId}_${date}`;
    return memoryRituals.get(key) || null;
  },

  async saveMorning(userId: string, date: string, data: any) {
    if (isDbConnected()) {
      let ritual = await RitualModel.findOne({ userId, date });
      if (!ritual) {
        ritual = new RitualModel({ userId, date, morning: { ...data, completedAt: new Date() } });
      } else {
        ritual.morning = { ...data, completedAt: new Date() };
      }
      return ritual.save();
    }

    const key = `${userId}_${date}`;
    const existing = memoryRituals.get(key) || { id: 'rit_' + Date.now(), userId, date };
    existing.morning = { ...data, completedAt: new Date() };
    memoryRituals.set(key, existing);
    return existing;
  },

  async saveEvening(userId: string, date: string, data: any) {
    if (isDbConnected()) {
      let ritual = await RitualModel.findOne({ userId, date });
      if (!ritual) {
        ritual = new RitualModel({ userId, date, evening: { ...data, completedAt: new Date() } });
      } else {
        ritual.evening = { ...data, completedAt: new Date() };
      }
      return ritual.save();
    }

    const key = `${userId}_${date}`;
    const existing = memoryRituals.get(key) || { id: 'rit_' + Date.now(), userId, date };
    existing.evening = { ...data, completedAt: new Date() };
    memoryRituals.set(key, existing);
    return existing;
  },
};
