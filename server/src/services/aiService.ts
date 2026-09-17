export interface PersonalizationInput {
  goal: string;
  category?: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
  desiredLifestyle?: string;
  currentMood?: string;
  preferredMood?: string;
  durationMinutes?: number;
  visualizationStyle?: 'first-person' | 'observer';
  affirmationStyle?: 'direct' | 'gentle' | 'declarative';
}

export interface CanonicalBundle {
  originalGoal: string;
  reframedGoal?: string;
  isReframed: boolean;
  visualization: string;
  affirmations: string[];
  alignedAction: string;
  reflection: string;
  category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
  recommendedSessionIds: string[];
}

// Detection for unrealistic, supernatural, or guaranteed claims
const DELUSIONAL_PATTERNS = [
  /billionaire overnight/i,
  /win the lottery/i,
  /make (someone|her|him|everyone) love me/i,
  /cure (cancer|disease|illness) with mind/i,
  /instant wealth/i,
  /universe will give me anything without working/i,
  /never have to work/i,
  /supernatural/i,
  /telepathy/i,
  /fly without plane/i,
];

function sanitizeAndReframe(goal: string): { reframed: string; isReframed: boolean } {
  for (const pattern of DELUSIONAL_PATTERNS) {
    if (pattern.test(goal)) {
      if (/billionaire|lottery|wealth/i.test(goal)) {
        return {
          reframed: 'Cultivate deep financial stewardship, disciplined value creation, and mastery of income-generating skills.',
          isReframed: true,
        };
      }
      if (/love/i.test(goal)) {
        return {
          reframed: 'Cultivate emotional availability, compassionate communication, and authentic self-respect in relationships.',
          isReframed: true,
        };
      }
      if (/cure|disease/i.test(goal)) {
        return {
          reframed: 'Support my physical vitality and mental tranquility alongside professional healthcare and healthy daily habits.',
          isReframed: true,
        };
      }
      return {
        reframed: 'Develop consistent habits, deep focus, and emotional composure aligned with personal growth.',
        isReframed: true,
      };
    }
  }
  return { reframed: goal, isReframed: false };
}

function detectCategory(goal: string): 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel' {
  const lower = goal.toLowerCase();
  if (/money|wealth|finance|income|rich|invest|saving|debt/i.test(lower)) return 'wealth';
  if (/career|job|engineer|business|founder|work|promote|company|code|design/i.test(lower)) return 'career';
  if (/peace|calm|anxiety|stress|sleep|meditat|zen|rest|tranquil/i.test(lower)) return 'peace';
  if (/confiden|speak|courage|lead|imposter|power|assert/i.test(lower)) return 'confidence';
  if (/love|relation|partner|marry|date|friend|heart/i.test(lower)) return 'love';
  if (/travel|explore|world|nomad|flight|adventure|nature/i.test(lower)) return 'travel';
  return 'career';
}

export class AIService {
  static async generateBundle(input: PersonalizationInput): Promise<CanonicalBundle> {
    const rawGoal = input.goal.trim();
    const { reframed, isReframed } = sanitizeAndReframe(rawGoal);
    const category = input.category || detectCategory(reframed);
    const style = input.affirmationStyle || 'declarative';
    const visStyle = input.visualizationStyle || 'first-person';

    // If GEMINI_API_KEY is available in environment, we can invoke Gemini API server-side
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const bundle = await this.callGeminiAPI(apiKey, {
          rawGoal,
          reframedGoal: reframed,
          category,
          style,
          visStyle,
          currentMood: input.currentMood || 'calm',
          desiredLifestyle: input.desiredLifestyle || '',
        });
        if (bundle) return bundle;
      } catch (err) {
        console.warn('[AIService] Gemini API call failed, falling back to heuristic engine:', err);
      }
    }

    // High quality contextual synthesis adhering strictly to §1 and §5
    return this.generateHeuristicBundle(rawGoal, reframed, isReframed, category, style, visStyle);
  }

  private static async callGeminiAPI(apiKey: string, context: any): Promise<CanonicalBundle | null> {
    const prompt = `
You are the AI Visualization Engine for Orbit, an app built on the core reframe:
"Think about your desire from the perspective that it is already part of your life, rather than constantly thinking about getting it in the future."
Core equation: INTENTION + BELIEF/VISUALIZATION + CONSISTENT ACTION + PATIENCE + REFLECTION.

CRITICAL RULES:
1. Manifestation is NOT a replacement for action.
2. NO guaranteed outcomes. Never promise supernatural, medical, or guaranteed external results.
3. Keep the aligned action strictly controllable (habits, skills, communication, study).
4. Return ONLY valid JSON in this exact structure:
{
  "visualization": "...",
  "affirmations": ["...", "...", "..."],
  "alignedAction": "...",
  "reflection": "..."
}

User Context:
- Goal: "${context.reframedGoal}"
- Category: "${context.category}"
- Visualization Style: "${context.visStyle}"
- Affirmation Style: "${context.style}"
- Current Mood: "${context.currentMood}"
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return {
      originalGoal: context.rawGoal,
      reframedGoal: context.reframedGoal !== context.rawGoal ? context.reframedGoal : undefined,
      isReframed: context.reframedGoal !== context.rawGoal,
      visualization: parsed.visualization,
      affirmations: parsed.affirmations || [],
      alignedAction: parsed.alignedAction,
      reflection: parsed.reflection,
      category: context.category,
      recommendedSessionIds: this.getRecommendedSessions(context.category),
    };
  }

  private static generateHeuristicBundle(
    rawGoal: string,
    reframed: string,
    isReframed: boolean,
    category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel',
    style: 'direct' | 'gentle' | 'declarative',
    visStyle: 'first-person' | 'observer'
  ): CanonicalBundle {
    const templates: Record<string, {
      visFirst: string;
      visObserver: string;
      affDeclarative: string[];
      affGentle: string[];
      affDirect: string[];
      action: string;
      reflection: string;
    }> = {
      career: {
        visFirst: `You open your workstation with steady clarity. You feel the natural confidence of someone who has earned their seat at the table. Notice the calm rhythm of your breath, the clarity of your communication, and the quiet satisfaction of solving meaningful challenges.`,
        visObserver: `Observe yourself in your chosen craft, moving with composed mastery and deliberate intent. Watch how colleagues listen to your insight, and observe how your calm preparation dismantles obstacles effortlessly.`,
        affDeclarative: [
          'I am already becoming the person who creates undeniable value.',
          'I communicate with grounded clarity, precision, and purpose.',
          'I continually refine my core skills through patient, focused practice.',
        ],
        affGentle: [
          'Step by step, I am stepping into my natural professional competence.',
          'It is safe to trust my knowledge and speak with authentic presence.',
          'Every effort I invest today gently strengthens my craft.',
        ],
        affDirect: [
          'Execute with precision. Solve the hardest problem first.',
          'My discipline speaks louder than words.',
          'I meet challenges with immediate, focused capability.',
        ],
        action: 'Dedicate one uninterrupted hour today to deliberate practice or building a core portfolio capability.',
        reflection: 'What decision did you make today that your future, established self would be proud of?',
      },
      wealth: {
        visFirst: `You review your accounts and investments with grounded gratitude and serene detachment. There is no frantic scarcity, only the quiet dignity of sustainable freedom, generous stewardship, and well-managed resources.`,
        visObserver: `Look at yourself making measured, strategic financial choices. Notice the relaxed posture, the absence of panic, and the steady discipline in allocating capital and building lasting assets.`,
        affDeclarative: [
          'I am already living as a conscious steward of financial independence.',
          'I align my daily spending with my deepest long-term values.',
          'I create scalable value that earns compounding returns through patience.',
        ],
        affGentle: [
          'I gently release the mindset of scarcity and embrace responsible planning.',
          'I am worthy of security, stability, and peace of mind.',
          'With every mindful choice, my financial baseline expands.',
        ],
        affDirect: [
          'Control expenses ruthlessly. Invest consistently in high-leverage assets.',
          'Wealth is the reward for discipline, not wishful thinking.',
          'I manage my capital with absolute intention.',
        ],
        action: 'Review your weekly spending, log every line item, and automate one recurring transfer toward long-term savings or investment.',
        reflection: 'How did you treat your resources today with the mindset of someone who is already financially secure?',
      },
      peace: {
        visFirst: `Feel the weight lifting from your shoulders. Your breath flows slow and deep. The urgent noise of the external world slows to a murmur. You inhabit an inner sanctuary that no outside chaos can disturb.`,
        visObserver: `Watch yourself moving through a demanding environment with unruffled grace. Notice how storms of urgency wash over you without penetrating your centered calmness.`,
        affDeclarative: [
          'I am anchored in unshakeable tranquility and mental stillness.',
          'I choose what deserves my attention and release the rest.',
          'My calm presence transforms every room I enter.',
        ],
        affGentle: [
          'It is okay to pause. There is no rush in this present breath.',
          'I grant myself permission to let go of what I cannot control.',
          'Softly, peace returns to my mind and body.',
        ],
        affDirect: [
          'Breathe. Still the mind. Refuse unnecessary agitation.',
          'I protect my mental peace with absolute firmness.',
          'Stillness is power.',
        ],
        action: 'Take 10 minutes away from all screens to walk outdoors or sit in silent sensory presence.',
        reflection: 'What stress or expectation did you consciously let go of today?',
      },
      confidence: {
        visFirst: `Stand tall in your mind's eye. Feel your spine align, your shoulders drop, and your voice resonate from your diaphragm. You do not need to prove anything; your presence is quiet, steady, and certain.`,
        visObserver: `Watch yourself step into a room of peers. Notice the natural warmth in your gaze, the steady pacing of your words, and the ease with which you hold space for yourself.`,
        affDeclarative: [
          'I trust my capacity to navigate the unknown with courage.',
          'I speak my truth with calm clarity and without hesitation.',
          'I welcome discomfort as the proven doorway to growth.',
        ],
        affGentle: [
          'I honor my voice and know my perspective is valuable.',
          'I allow myself to be seen authentically and without pretense.',
          'I am capable of doing hard things one moment at a time.',
        ],
        affDirect: [
          'Own the room. Doubt is just an invitation to take action.',
          'I do not shrink to make others comfortable.',
          'Courage precedes competence.',
        ],
        action: 'Initiate one high-stakes conversation or volunteer to present your work before a group.',
        reflection: 'Where did you choose courage over convenience today?',
      },
      love: {
        visFirst: `Feel a warm, golden resonance in your chest. You are emotionally whole, open, and secure. You radiate genuine empathy, attentive listening, and healthy boundaries that invite deep reciprocal affection.`,
        visObserver: `Observe yourself in conversation with people you cherish. Notice the genuine eye contact, the patient active listening, and the freedom from emotional defensiveness.`,
        affDeclarative: [
          'I am grounded in unconditional self-respect and openhearted connection.',
          'I communicate my boundaries and desires with warmth and honesty.',
          'I attract and nurture relationships founded on mutual growth.',
        ],
        affGentle: [
          'I am worthy of receiving deep, reciprocal kindness.',
          'My heart is safe, open, and at peace.',
          'I bring patience and compassion to every relationship.',
        ],
        affDirect: [
          'Listen deeply. Give honest appreciation without expectation.',
          'I build connection through genuine vulnerability.',
          'Love is an active daily practice, not passive sentiment.',
        ],
        action: 'Reach out to someone you care for with a specific, unsolicited message of sincere gratitude and appreciation.',
        reflection: 'How did you show authentic emotional presence to someone you care about today?',
      },
      travel: {
        visFirst: `You feel the fresh breeze of an unfamiliar land. The scents of a new city, the horizon stretching over ocean waters, and the thrill of curiosity awaken your senses. You are an agile explorer of life.`,
        visObserver: `Watch yourself navigating an airport terminal or scenic mountain ridge with ease, openness, and adaptive joy.`,
        affDeclarative: [
          'I am an open, resilient explorer of the world and its possibilities.',
          'My life is rich with diverse horizons, cultures, and wonder.',
          'I create freedom through intentional planning and purposeful action.',
        ],
        affGentle: [
          'New adventures are gently unfolding in my path.',
          'I welcome novel perspectives with curiosity and warmth.',
          'The world is welcoming and full of beauty to discover.',
        ],
        affDirect: [
          'Break routines. Seek expanding horizons.',
          'Freedom is created through deliberate lifestyle architecture.',
          'I explore the world with active curiosity and respect.',
        ],
        action: 'Research the logistical requirements (budget, dates, itinerary) for your next destination and take one booking step.',
        reflection: 'What new perspective or horizon did you open your mind to today?',
      },
    };

    const t = templates[category] || templates.career;
    const visualization = visStyle === 'first-person' ? t.visFirst : t.visObserver;
    const affirmations =
      style === 'direct' ? t.affDirect : style === 'gentle' ? t.affGentle : t.affDeclarative;

    return {
      originalGoal: rawGoal,
      reframedGoal: isReframed ? reframed : undefined,
      isReframed,
      visualization,
      affirmations,
      alignedAction: t.action,
      reflection: t.reflection,
      category,
      recommendedSessionIds: this.getRecommendedSessions(category),
    };
  }

  private static getRecommendedSessions(category: string): string[] {
    const map: Record<string, string[]> = {
      wealth: ['session-wealth-abundance', 'session-theta-clarity', 'session-focus-flow'],
      career: ['session-career-mastery', 'session-focus-flow', 'session-morning-intention'],
      peace: ['session-deep-stillness', 'session-sleep-restoration', 'session-432hz-harmony'],
      confidence: ['session-courage-resonance', 'session-morning-intention', 'session-theta-clarity'],
      love: ['session-heart-resonance', 'session-deep-stillness', 'session-432hz-harmony'],
      travel: ['session-horizon-expansion', 'session-morning-intention', 'session-focus-flow'],
    };
    return map[category] || ['session-wealth-abundance', 'session-morning-intention'];
  }
}
