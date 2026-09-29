export interface OnboardingAnswersPayload {
  desire: string;
  specificIntention: string;
  identity: string;
  feelings: string;
  currentBlock: string;
  action: string;
}

export interface SessionConcept {
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

/**
 * Generates 8 deterministic, psychologically-aligned concepts based on the 6 onboarding answers.
 * Guarantees zero blocking even when the offline fallback is active.
 */
export function generateDeterministicConcepts(answers: OnboardingAnswersPayload): SessionConcept[] {
  const desire = answers.desire?.trim() || 'Focus & Productivity';
  const specificIntention = answers.specificIntention?.trim() || 'Unshakable mental clarity and creative momentum';
  const identity = answers.identity?.trim() || 'A focused and disciplined creator';
  const feelings = answers.feelings?.trim() || 'Focused, Calm, Confident, Energized';
  const currentBlock = answers.currentBlock?.trim() || 'Overthinking';
  const action = answers.action?.trim() || 'Consistently working on meaningful projects';

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
      recommendedDuration: 20,
      recommendedVoiceStyle: 'Calm'
    },
    {
      id: 'sovereign-alignment',
      title: 'Sovereign Alignment',
      description: `Harmonizes your thoughts, emotions, and physical actions into complete synchrony with ${specificIntention}.`,
      category: desire,
      rationale: `Elevates overall vibrational coherence and purpose.`,
      recommendedAtmosphere: 'Pink Flow',
      recommendedUsage: 'Meditation',
      recommendedDuration: 15,
      recommendedVoiceStyle: 'Warm'
    }
  ];
}
