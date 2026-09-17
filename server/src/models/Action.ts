import mongoose, { Document, Schema } from 'mongoose';
import { isDbConnected } from '../db.js';

export interface IAlignedAction extends Document {
  userId: string;
  goalId?: string;
  goalTitle?: string;
  category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
  text: string;
  status: 'pending' | 'completed';
  reflectionNote?: string;
  vitalityPoints: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAlignedAction>(
  {
    userId: { type: String, required: true, index: true },
    goalId: String,
    goalTitle: String,
    category: {
      type: String,
      enum: ['career', 'wealth', 'peace', 'confidence', 'love', 'travel'],
      default: 'career',
    },
    text: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    reflectionNote: String,
    vitalityPoints: { type: Number, default: 15 },
    completedAt: Date,
  },
  { timestamps: true }
);

export const ActionModel = mongoose.model<IAlignedAction>('Action', ActionSchema);

// In-Memory Fallback
const memoryActions: Map<string, any[]> = new Map();

export const ActionRepository = {
  async getByUserId(userId: string) {
    if (isDbConnected()) {
      return ActionModel.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryActions.get(userId) || [];
  },

  async create(userId: string, data: any) {
    if (isDbConnected()) {
      return ActionModel.create({
        userId,
        ...data,
        status: 'pending',
        vitalityPoints: data.vitalityPoints || 15,
      });
    }

    const id = 'act_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const newAct = {
      _id: id,
      id,
      userId,
      ...data,
      status: 'pending',
      vitalityPoints: data.vitalityPoints || 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const list = memoryActions.get(userId) || [];
    list.unshift(newAct);
    memoryActions.set(userId, list);
    return newAct;
  },

  async toggleStatus(userId: string, actionId: string, reflectionNote?: string) {
    if (isDbConnected()) {
      const act = await ActionModel.findOne({ _id: actionId, userId });
      if (!act) return null;
      act.status = act.status === 'completed' ? 'pending' : 'completed';
      act.completedAt = act.status === 'completed' ? new Date() : undefined;
      if (reflectionNote !== undefined) act.reflectionNote = reflectionNote;
      await act.save();
      return act;
    }

    const list = memoryActions.get(userId) || [];
    const act = list.find((a) => a.id === actionId || a._id === actionId);
    if (!act) return null;
    act.status = act.status === 'completed' ? 'pending' : 'completed';
    act.completedAt = act.status === 'completed' ? new Date() : undefined;
    if (reflectionNote !== undefined) act.reflectionNote = reflectionNote;
    act.updatedAt = new Date();
    return act;
  },

  async delete(userId: string, actionId: string) {
    if (isDbConnected()) {
      return ActionModel.deleteOne({ _id: actionId, userId });
    }
    const list = memoryActions.get(userId) || [];
    const filtered = list.filter((a) => a.id !== actionId && a._id !== actionId);
    memoryActions.set(userId, filtered);
    return true;
  },
};
