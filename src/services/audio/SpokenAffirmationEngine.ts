/**
 * Orbit Spoken Affirmation Engine
 * Combines Web Speech API (SpeechSynthesis) with ambient Web Audio to produce
 * spoken affirmations layered over binaural drone backgrounds. (§3.2)
 */

export interface SpeechOptions {
  rate?: number;   // 0.1 - 2 (default 0.85 for soothing cadence)
  pitch?: number;  // 0 - 2 (default 1.1 for warm resonance)
  volume?: number; // 0 - 1
  lang?: string;
  voiceURI?: string;
}

export class SpokenAffirmationEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private onWordCallback?: (word: string, index: number) => void;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
  }

  public speakAffirmation(
    text: string,
    options: SpeechOptions = {},
    onEnd?: () => void,
    onWord?: (word: string, index: number) => void
  ) {
    if (!this.synth || !this.isSupported) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? 'en-US';

    // Prefer a soothing female voice when available
    const voices = this.getAvailableVoices();
    const preferred =
      voices.find(v => v.name.toLowerCase().includes('samantha')) ||
      voices.find(v => v.name.toLowerCase().includes('karen')) ||
      voices.find(v => v.name.toLowerCase().includes('moira')) ||
      voices.find(v => /female|woman/i.test(v.name)) ||
      voices[0];

    if (preferred) utterance.voice = preferred;

    // Live caption word tracking
    if (onWord) {
      this.onWordCallback = onWord;
      utterance.addEventListener('boundary', (e) => {
        if (e.name === 'word') {
          const word = text.slice(e.charIndex, e.charIndex + e.charLength);
          onWord(word, e.charIndex);
        }
      });
    }

    utterance.addEventListener('end', () => {
      this.isPlaying = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    });

    utterance.addEventListener('error', () => {
      this.isPlaying = false;
      this.currentUtterance = null;
    });

    this.currentUtterance = utterance;
    this.isPlaying = true;
    this.synth.speak(utterance);
  }

  public speakSequence(
    affirmations: string[],
    options: SpeechOptions = {},
    onAffirmationChange?: (index: number, text: string) => void,
    onComplete?: () => void,
    pauseBetweenMs = 2500
  ) {
    if (!affirmations.length) return;
    this.queue = [...affirmations];
    let idx = 0;

    const speakNext = () => {
      if (idx >= this.queue.length) {
        if (onComplete) onComplete();
        return;
      }
      const text = this.queue[idx];
      if (onAffirmationChange) onAffirmationChange(idx, text);
      this.speakAffirmation(text, options, () => {
        idx++;
        setTimeout(speakNext, pauseBetweenMs);
      });
    };

    speakNext();
  }

  public pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && !this.isPlaying) {
      this.synth.resume();
      this.isPlaying = true;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.isPlaying = false;
    this.queue = [];
    this.onWordCallback = undefined;
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}

export const spokenAffirmationEngine = new SpokenAffirmationEngine();
