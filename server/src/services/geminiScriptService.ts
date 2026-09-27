import { GoogleGenAI } from '@google/genai';

export interface IntentionAnswers {
  desiredOutcome: string;
  desiredIdentity: string;
  emotionalState: string;
  currentBlock: string;
  dailyAction: string;
  category?: string;
}

export interface SessionConcept {
  id: string;
  title: string;
  tagline: string;
  description: string;
  targetOutcome: string;
  category: string;
  suggestedDuration: number;
  suggestedAmbience: string;
  suggestedFrequencyHz?: number;
}

export interface IntentionAnalysis {
  coreShift: string;
  keyThemes: string[];
  recommendedFocus: string;
  concepts: SessionConcept[];
}

export interface AffirmationScriptResult {
  title: string;
  tone: string;
  affirmations: string[];
  rawText: string;
}

export class GeminiScriptService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment.');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const isTransient = err?.status === 503 || err?.status === 429 || err?.message?.includes('high demand');
        if (isTransient && attempt < retries) {
          console.warn(`[Gemini] Transient error (${err.message}), retrying attempt ${attempt + 1}/${retries} in ${delayMs}ms...`);
          await new Promise(r => setTimeout(r, delayMs * attempt));
          continue;
        }
        throw err;
      }
    }
    throw new Error('Gemini API call failed after retries');
  }

  /**
   * Analyzes user answers to the 6 onboarding questions and generates 6-8 personalized session concepts
   */
  async analyzeIntentionAndGenerateConcepts(answers: IntentionAnswers): Promise<IntentionAnalysis> {
    const prompt = `
You are an expert cosmic & subconscious alignment architect for ORBIT.
Analyze the user's personal intention inputs:
- Desired Outcome: "${answers.desiredOutcome}"
- Desired Identity: "${answers.desiredIdentity}"
- Emotional State: "${answers.emotionalState}"
- Current Obstacle/Block: "${answers.currentBlock}"
- Daily Anchoring Action: "${answers.dailyAction}"
- Preferred Category: "${answers.category || 'Manifestation'}"

Generate a structured JSON analysis with:
1. "coreShift": A powerful 1-sentence breakdown of their subconscious transformation (from their block to their identity).
2. "keyThemes": 3 to 4 concise thematic keywords.
3. "recommendedFocus": Practical advice for daily integration.
4. "concepts": Exactly 6 distinct session concepts. Each concept must have:
   - "id": kebab-case string identifier (e.g. "quantum-confidence-anchoring")
   - "title": Captivating, cosmic, elegant title (e.g. "Solar Radiance: Unshakable Certainty")
   - "tagline": A crisp, inspiring 1-sentence promise.
   - "description": 2-sentence description of the subliminal journey.
   - "targetOutcome": Specific emotional/reality result.
   - "category": Category string.
   - "suggestedDuration": Number (5, 10, or 15).
   - "suggestedAmbience": One of: "rain-light", "rain-window", "rain-lluvia", "noise-brown", "noise-pink".
   - "suggestedFrequencyHz": One of: 432, 528, 396, 639, 741.

Return ONLY valid JSON matching this schema:
{
  "coreShift": string,
  "keyThemes": string[],
  "recommendedFocus": string,
  "concepts": [
    {
      "id": string,
      "title": string,
      "tagline": string,
      "description": string,
      "targetOutcome": string,
      "category": string,
      "suggestedDuration": number,
      "suggestedAmbience": string,
      "suggestedFrequencyHz": number
    }
  ]
}
`.trim();

    const response = await this.callWithRetry(() =>
      this.getClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      })
    );

    const text = response.text || '{}';
    return JSON.parse(text) as IntentionAnalysis;
  }

  /**
   * Generates a subliminal affirmation script strictly adhering to Orbit's 4 core rules:
   * 1. Present tense ONLY ("I am", "I naturally", "I choose", "Every day I")
   * 2. ZERO negative or negation words (NO "not", "no", "never", "stop", "quit", "lack", "struggle", "anxiety", "fear")
   * 3. Emotion-grounded and identity-focused
   * 4. Spacious, poetic, rhythmic cadence suitable for subliminal looping
   */
  async generateAffirmationScript(params: {
    concept: Partial<SessionConcept>;
    answers: IntentionAnswers;
    intensity?: 'subtle' | 'balanced' | 'prominent';
  }): Promise<AffirmationScriptResult> {
    const { concept, answers, intensity = 'subtle' } = params;

    const prompt = `
You are the master voice and subconscious scriptwriter for ORBIT.
Write a personalized subliminal affirmation script for the session:
Title: "${concept.title || 'Cosmic Realization'}"
Target Outcome: "${concept.targetOutcome || answers.desiredOutcome}"
Desired Identity: "${answers.desiredIdentity}"
Emotional Tone: "${answers.emotionalState}"
Subliminal Intensity: "${intensity}"

STRICT SCRIPTWRITING MANDATES:
1. PRESENT TENSE ONLY: Every sentence must start with or center on present reality ("I am", "I now embody", "I naturally attract", "I walk with", "Every cell of my being resonates with").
2. ABSOLUTELY ZERO NEGATIONS OR NEGATIVE WORDS:
   Do NOT use: "no", "not", "never", "won't", "can't", "stop", "quit", "leave behind", "fear", "anxiety", "lack", "doubt", "pain", "struggle", "block".
   Instead of "I am free of fear", write "I embody calm, sovereign peace."
   Instead of "I no longer doubt myself", write "My self-trust is unwavering and clear."
3. EMOTION & IDENTITY BASED: Fuse sensory feelings with clear self-identity.
4. RHYTHMIC AND SPACIOUS: Craft 12 to 18 distinct affirmations that loop gracefully.

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "tone": string,
  "affirmations": string[]
}
`.trim();

    const response = await this.callWithRetry(() =>
      this.getClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      })
    );

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    const affirmations: string[] = Array.isArray(parsed.affirmations) ? parsed.affirmations : [];
    // Ensure affirmations are clean and spaced
    const rawText = affirmations.join(' ... ... ');

    return {
      title: parsed.title || concept.title || 'Personalized Alignment',
      tone: parsed.tone || 'Calm, grounded, sovereign',
      affirmations,
      rawText
    };
  }
}
