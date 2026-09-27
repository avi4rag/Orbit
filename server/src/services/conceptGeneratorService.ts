import { GoogleGenAI } from '@google/genai';
import { ISessionConcept } from '../models/OnboardingAnswer.js';

export interface OnboardingAnswersPayload {
  desire: string;
  specificIntention: string;
  identity: string;
  feelings: string;
  currentBlock: string;
  action: string;
}

export class ConceptGeneratorService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    }
    return this.ai;
  }

  /**
   * Generates 8 personalized concepts from the 6 onboarding answers.
   */
  async generateConcepts(answers: OnboardingAnswersPayload): Promise<ISessionConcept[]> {
    const client = this.getClient();
    if (client) {
      try {
        const prompt = `
You are the master reality and subconscious architect for ORBIT.
Given the user's verified onboarding profile:
- Desired Outcome / Primary Area: "${answers.desire}"
- Specific Intention: "${answers.specificIntention}"
- Target Identity Statement: "${answers.identity}"
- Emotional State & Feelings: "${answers.feelings}"
- Current Obstacle / Internal Block: "${answers.currentBlock}"
- Daily Action Anchor: "${answers.action}"

Generate exactly 8 distinct, deeply relevant session concepts.
Each concept must address their block ("${answers.currentBlock}") and realign their subconscious with their desired identity ("${answers.identity}").

Return ONLY valid JSON matching this exact array structure:
[
  {
    "id": "kebab-case-identifier",
    "title": "Cosmic, evocative title (e.g. Unshakable Mental Clarity)",
    "description": "2-sentence vivid description of the subconscious shift",
    "category": "${answers.desire}",
    "rationale": "Why this was selected for your intention",
    "recommendedAtmosphere": "One of: Gentle Rain, Rain on the Window, Deep Forest Rain, Cosmic Brown Noise, Pink Flow",
    "recommendedUsage": "One of: Morning, Daytime, Focus, Evening, Night, Sleep / Overnight, Repeat / Anytime",
    "recommendedDuration": 15,
    "recommendedVoiceStyle": "One of: Calm, Soft, Warm, Deep, Neutral, Gentle"
  }
]
`.trim();

        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '[]';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed as ISessionConcept[];
        }
      } catch (err: any) {
        console.warn(`[ConceptGenerator] Gemini generation notice (${err.message}), utilizing deterministic engine...`);
      }
    }

    // Deterministic High-Quality Generator Fallback (Guarantees zero blocking)
    return this.generateDeterministicConcepts(answers);
  }

  private generateDeterministicConcepts(answers: OnboardingAnswersPayload): ISessionConcept[] {
    const { desire, specificIntention, identity, feelings, currentBlock, action } = answers;

    return [
      {
        id: 'unshakable-mental-clarity',
        title: 'Unshakable Mental Clarity',
        description: `Dissolves the internal friction of ${currentBlock}. Centers your focus entirely on ${specificIntention}.`,
        category: desire,
        rationale: `Directly neutralizes ${currentBlock} by anchoring daily calm.`,
        recommendedAtmosphere: 'Gentle Rain',
        recommendedUsage: 'Focus',
        recommendedDuration: 15,
        recommendedVoiceStyle: 'Calm'
      },
      {
        id: 'creative-momentum',
        title: 'Creative Momentum',
        description: `Bridges the gap between intention and sovereign execution. Locks in your daily ritual: ${action}.`,
        category: desire,
        rationale: `Builds steady compounding flow around ${action}.`,
        recommendedAtmosphere: 'Rain on the Window',
        recommendedUsage: 'Daytime',
        recommendedDuration: 20,
        recommendedVoiceStyle: 'Warm'
      },
      {
        id: 'focused-creator-identity',
        title: 'Focused Creator Identity',
        description: `Subconsciously embeds your chosen truth: "${identity}". Effortless alignment without struggle.`,
        category: desire,
        rationale: `Reinforces "${identity}" as your default psychological state.`,
        recommendedAtmosphere: 'Cosmic Brown Noise',
        recommendedUsage: 'Morning',
        recommendedDuration: 10,
        recommendedVoiceStyle: 'Deep'
      },
      {
        id: 'confident-execution',
        title: 'Confident Execution',
        description: `Replaces hesitation with grounded somatic certainty. Radiates the feelings of ${feelings}.`,
        category: desire,
        rationale: `Aligns emotional frequency with ${feelings}.`,
        recommendedAtmosphere: 'Pink Flow',
        recommendedUsage: 'Daytime',
        recommendedDuration: 15,
        recommendedVoiceStyle: 'Neutral'
      },
      {
        id: 'consistent-creative-discipline',
        title: 'Consistent Creative Discipline',
        description: `Transforms motivation into effortless cellular habit. Anchored in "${action}" day after day.`,
        category: desire,
        rationale: `Automates willpower through rhythmic subconscious repetition.`,
        recommendedAtmosphere: 'Deep Forest Rain',
        recommendedUsage: 'Morning',
        recommendedDuration: 15,
        recommendedVoiceStyle: 'Gentle'
      },
      {
        id: 'overthinking-reset',
        title: 'Overthinking Reset',
        description: `Acoustic frequency therapy designed to quiet rapid analytical loops and restore stillness.`,
        category: desire,
        rationale: `Specifically dismantles ${currentBlock} at the nervous system level.`,
        recommendedAtmosphere: 'Gentle Rain',
        recommendedUsage: 'Evening',
        recommendedDuration: 10,
        recommendedVoiceStyle: 'Soft'
      },
      {
        id: 'deep-work-identity',
        title: 'Deep Work Identity',
        description: `An immersive focus chamber training your neural pathways to remain centered during creative craft.`,
        category: desire,
        rationale: `Pairs ${action} with expansive cognitive clarity.`,
        recommendedAtmosphere: 'Cosmic Brown Noise',
        recommendedUsage: 'Focus',
        recommendedDuration: 30,
        recommendedVoiceStyle: 'Calm'
      },
      {
        id: 'calm-focus',
        title: 'Calm Focus & Sovereignty',
        description: `Sustained alpha-rhythm alignment ensuring your mind remains spacious, unbothered, and clear.`,
        category: desire,
        rationale: `Sustains long-term peace while executing ${specificIntention}.`,
        recommendedAtmosphere: 'Pink Flow',
        recommendedUsage: 'Repeat / Anytime',
        recommendedDuration: 20,
        recommendedVoiceStyle: 'Gentle'
      }
    ];
  }
}
