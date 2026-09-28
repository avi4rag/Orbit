import mongoose, { Document, Schema } from 'mongoose';

export interface ISubliminalSession extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  category: string;
  status: 'PENDING' | 'GENERATING_SCRIPT' | 'GENERATING_VOICE' | 'MIXING_AUDIO' | 'COMPLETED' | 'FAILED';
  error?: string;
  intention: {
    desiredOutcome: string;
    desiredIdentity: string;
    emotionalState: string;
    currentBlock: string;
    dailyAction: string;
    category: string;
  };
  settings: {
    durationMinutes: number;
    usageContext: 'sleep' | 'focus' | 'meditation' | 'walking' | 'morning';
    ambienceTrackId: string;
    frequencyHz?: number;
    voiceId: string;
    ttsProvider: 'elevenlabs' | 'azure';
    subliminalIntensity: 'subtle' | 'balanced' | 'prominent';
  };
  script: {
    affirmations: string[];
    rawText: string;
    tone: string;
  };
  audio: {
    url: string;
    durationSeconds: number;
    fileSizeBytes: number;
    voiceDurationSeconds?: number;
    sha256?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubliminalSessionSchema = new Schema<ISubliminalSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'General Alignment' },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATING_SCRIPT', 'GENERATING_VOICE', 'MIXING_AUDIO', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    error: { type: String },
    intention: {
      desiredOutcome: { type: String, default: 'Optimal mental clarity and self-realization' },
      desiredIdentity: { type: String, default: 'Aligned & Focused Creator' },
      emotionalState: { type: String, default: 'Calm, Centered, Confident' },
      currentBlock: { type: String, default: 'Overthinking' },
      dailyAction: { type: String, default: 'Consistent creative focus' },
      category: { type: String, default: 'Manifestation' }
    },
    settings: {
      durationMinutes: { type: Number, default: 5 },
      usageContext: {
        type: String,
        enum: ['sleep', 'focus', 'meditation', 'walking', 'morning'],
        default: 'meditation'
      },
      ambienceTrackId: { type: String, default: 'rain-light' },
      frequencyHz: { type: Number },
      voiceId: { type: String, default: 'bella' },
      ttsProvider: { type: String, enum: ['elevenlabs', 'azure'], default: 'elevenlabs' },
      subliminalIntensity: {
        type: String,
        enum: ['subtle', 'balanced', 'prominent'],
        default: 'subtle'
      }
    },
    script: {
      affirmations: [{ type: String }],
      rawText: { type: String },
      tone: { type: String }
    },
    audio: {
      url: { type: String, default: '' },
      durationSeconds: { type: Number, default: 0 },
      fileSizeBytes: { type: Number, default: 0 },
      voiceDurationSeconds: { type: Number, default: 0 },
      sha256: { type: String }
    }
  },
  { timestamps: true }
);

export const SubliminalSession = mongoose.model<ISubliminalSession>('SubliminalSession', SubliminalSessionSchema);
