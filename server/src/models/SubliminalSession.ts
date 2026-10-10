import mongoose, { Document, Schema } from 'mongoose';

export type SessionStage =
  | 'PENDING'
  | 'GENERATING_SCRIPT'
  | 'GENERATING_VOICE'
  | 'GENERATING_MUSIC'
  | 'MIXING_AUDIO'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'FAILED';

export interface ISubliminalSession extends Document {
  userId?: mongoose.Types.ObjectId | string;
  title: string;
  category: string;
  status: SessionStage;
  failedStage?: SessionStage | string;
  errorCode?: string;
  errorMessage?: string;
  error?: string; // backwards compatibility
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
    ttsProvider: 'azure';
    musicProvider: 'elevenlabs' | 'ambience_catalog';
    allowAmbienceFallback?: boolean;
    subliminalIntensity: 'subtle' | 'balanced' | 'prominent';
  };
  script: {
    title?: string;
    tone?: string;
    affirmations: string[];
    identityStatements?: string[];
    visualizationPrompts?: string[];
    actionAnchors?: string[];
    closingStatements?: string[];
    rawText: string;
  };
  audio: {
    url: string;
    storageKey?: string;
    durationSeconds: number;
    fileSizeBytes: number;
    voiceDurationSeconds?: number;
    musicDurationSeconds?: number;
    voiceProvider?: string;
    musicProvider?: string;
    musicPrompt?: string;
    sha256?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubliminalSessionSchema = new Schema<ISubliminalSession>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'General Alignment' },
    status: {
      type: String,
      enum: [
        'PENDING',
        'GENERATING_SCRIPT',
        'GENERATING_VOICE',
        'GENERATING_MUSIC',
        'MIXING_AUDIO',
        'UPLOADING',
        'COMPLETED',
        'FAILED'
      ],
      default: 'PENDING',
      index: true
    },
    failedStage: { type: String },
    errorCode: { type: String },
    errorMessage: { type: String },
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
      voiceId: { type: String, default: 'en-US-JennyNeural' },
      ttsProvider: { type: String, default: 'azure' },
      musicProvider: { type: String, default: 'elevenlabs' },
      allowAmbienceFallback: { type: Boolean, default: true },
      subliminalIntensity: {
        type: String,
        enum: ['subtle', 'balanced', 'prominent'],
        default: 'subtle'
      }
    },
    script: {
      title: { type: String },
      tone: { type: String },
      affirmations: [{ type: String }],
      identityStatements: [{ type: String }],
      visualizationPrompts: [{ type: String }],
      actionAnchors: [{ type: String }],
      closingStatements: [{ type: String }],
      rawText: { type: String }
    },
    audio: {
      url: { type: String, default: '' },
      storageKey: { type: String },
      durationSeconds: { type: Number, default: 0 },
      fileSizeBytes: { type: Number, default: 0 },
      voiceDurationSeconds: { type: Number, default: 0 },
      musicDurationSeconds: { type: Number, default: 0 },
      voiceProvider: { type: String, default: 'azure' },
      musicProvider: { type: String, default: 'elevenlabs' },
      musicPrompt: { type: String },
      sha256: { type: String }
    }
  },
  { timestamps: true }
);

export const SubliminalSession = mongoose.model<ISubliminalSession>('SubliminalSession', SubliminalSessionSchema);
