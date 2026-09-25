import mongoose, { Document, Schema } from 'mongoose';
import { isDbConnected } from '../db.js';

export interface ISubliminal extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  usageTypes: string[];
  tags: string[];
  artworkUrl: string;
  audioUrl: string;
  source: {
    platform: string;
    videoId?: string;
    url: string;
    creator: string;
  };
  duration: number;
  binauralFreq?: number;
  carrierFreq?: number;
  spokenAffirmations?: string[];
  processingStatus: 'ready' | 'processing';
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubliminalSchema = new Schema<ISubliminal>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: 'General' },
    usageTypes: [{ type: String, index: true }],
    tags: [{ type: String, index: true }],
    artworkUrl: { type: String, required: true },
    audioUrl: { type: String, required: true },
    source: {
      platform: { type: String, default: 'youtube' },
      videoId: { type: String, index: true },
      url: { type: String, required: true },
      creator: { type: String, default: 'ORBIT Audio Collective' },
    },
    duration: { type: Number, default: 600 },
    binauralFreq: { type: Number, default: 7.83 },
    carrierFreq: { type: Number, default: 432 },
    spokenAffirmations: [{ type: String }],
    processingStatus: { type: String, enum: ['ready', 'processing'], default: 'ready' },
    playCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate imports based on videoId (§11)
SubliminalSchema.index({ 'source.videoId': 1 }, { unique: true, sparse: true });

export const SubliminalModel = mongoose.model<ISubliminal>('Subliminal', SubliminalSchema);

import { SEED_SUBLIMINALS } from '../data/seedSubliminals.js';

// In-Memory Repository initialized with all imported playlist subliminals
let memorySubliminals: any[] = [...SEED_SUBLIMINALS];

export const SubliminalRepository = {
  async findAll(query: {
    category?: string;
    usageType?: string;
    search?: string;
    sort?: 'recommended' | 'popular' | 'duration' | 'newest';
    limit?: number;
    offset?: number;
  }) {
    if (isDbConnected()) {
      const filter: any = {};
      if (query.category && query.category !== 'all') {
        filter.category = query.category;
      }
      if (query.usageType && query.usageType !== 'All') {
        filter.usageTypes = query.usageType;
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ title: regex }, { description: regex }, { tags: regex }, { subcategory: regex }];
      }
      const q = SubliminalModel.find(filter);
      if (query.sort === 'popular') q.sort({ playCount: -1 });
      else if (query.sort === 'duration') q.sort({ duration: 1 });
      else if (query.sort === 'newest') q.sort({ createdAt: -1 });
      else q.sort({ playCount: -1 });

      if (query.limit) q.limit(query.limit);
      if (query.offset) q.skip(query.offset);
      return q.lean();
    }

    // In-memory fallback
    let list = [...memorySubliminals];
    if (query.category && query.category !== 'all') {
      list = list.filter((s) => s.category === query.category);
    }
    if (query.usageType && query.usageType !== 'All') {
      list = list.filter((s) => s.usageTypes?.includes(query.usageType));
    }
    if (query.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          s.subcategory?.toLowerCase().includes(q)
      );
    }
    if (query.sort === 'popular') {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (query.sort === 'duration') {
      list.sort((a, b) => a.duration - b.duration);
    } else if (query.sort === 'newest') {
      list.reverse();
    } else {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }

    const offset = query.offset || 0;
    const limit = query.limit || list.length;
    return list.slice(offset, offset + limit);
  },

  async findById(id: string) {
    if (isDbConnected()) {
      return SubliminalModel.findById(id).lean();
    }
    return memorySubliminals.find((s) => s.id === id || s._id?.toString() === id);
  },

  async findBySlug(slug: string) {
    if (isDbConnected()) {
      return SubliminalModel.findOne({ slug }).lean();
    }
    return memorySubliminals.find((s) => s.slug === slug);
  },

  async incrementPlay(id: string) {
    if (isDbConnected()) {
      return SubliminalModel.findByIdAndUpdate(id, { $inc: { playCount: 1 } }, { new: true });
    }
    const item = memorySubliminals.find((s) => s.id === id || s._id?.toString() === id);
    if (item) {
      item.playCount = (item.playCount || 0) + 1;
    }
    return item;
  },

  async upsertByVideoId(data: any) {
    if (isDbConnected()) {
      if (data.source?.videoId) {
        return SubliminalModel.findOneAndUpdate(
          { 'source.videoId': data.source.videoId },
          { $set: data },
          { upsert: true, new: true }
        );
      }
      return SubliminalModel.create(data);
    }

    const idx = memorySubliminals.findIndex(
      (s) => s.source?.videoId && s.source.videoId === data.source?.videoId
    );
    if (idx >= 0) {
      memorySubliminals[idx] = { ...memorySubliminals[idx], ...data, updatedAt: new Date() };
      return memorySubliminals[idx];
    }
    const newDoc = {
      ...data,
      id: 'sub-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memorySubliminals.unshift(newDoc);
    return newDoc;
  },
};
