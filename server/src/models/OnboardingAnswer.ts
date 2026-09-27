import mongoose, { Document, Schema } from 'mongoose';

export interface ISessionConcept {
  id: string;
  title: string;
  description: string;
  category: string;
  rationale: string;
  recommendedAtmosphere: string;
  recommendedUsage: string;
  recommendedDuration: number;
  recommendedVoiceStyle: string;
}

export interface IOnboardingAnswer extends Document {
  userId?: mongoose.Types.ObjectId;
  desire: string;
  specificIntention: string;
  identity: string;
  feelings: string;
  currentBlock: string;
  action: string;
  concepts: ISessionConcept[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionConceptSchema = new Schema<ISessionConcept>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    rationale: { type: String, required: true },
    recommendedAtmosphere: { type: String, default: 'Gentle Rain' },
    recommendedUsage: { type: String, default: 'Focus' },
    recommendedDuration: { type: Number, default: 15 },
    recommendedVoiceStyle: { type: String, default: 'Calm & Grounded' }
  },
  { _id: false }
);

const OnboardingAnswerSchema = new Schema<IOnboardingAnswer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    desire: { type: String, required: true, trim: true },
    specificIntention: { type: String, required: true, trim: true },
    identity: { type: String, required: true, trim: true },
    feelings: { type: String, required: true, trim: true },
    currentBlock: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    concepts: [SessionConceptSchema]
  },
  { timestamps: true }
);

export const OnboardingAnswer = mongoose.model<IOnboardingAnswer>(
  'OnboardingAnswer',
  OnboardingAnswerSchema
);
