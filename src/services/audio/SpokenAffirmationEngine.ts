/**
 * Orbit Spoken Affirmation Engine
 * High-fidelity speech synthesizer using Web Speech API (SpeechSynthesis)
 * Supports custom voice styles (Bella/Calm, Antoni/Warm, Adam/Deep, Arnold/Neutral),
 * subliminal intensity volume scaling, continuous meditative looping, and live word tracking.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceStyle?: 'Calm' | 'Warm' | 'Deep' | 'Gentle' | 'Neutral' | string;
  loop?: boolean;
}

export class SpokenAffirmationEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private loopSequence: boolean = true;
  private sequenceTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      try {
        this.voices = this.synth.getVoices();
        this.synth.onvoiceschanged = () => {
          if (this.synth) {
            this.voices = this.synth.getVoices();
          }
        };
      } catch {
        // Ignore initialization sandbox constraints
      }
    }
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const current = this.synth.getVoices();
    if (current && current.length) {
      this.voices = current;
    }
    const enVoices = this.voices.filter(v => v.lang && v.lang.startsWith('en'));
    return enVoices.length > 0 ? enVoices : this.voices;
  }

  public pickVoiceForStyle(style?: string): SpeechSynthesisVoice | null {
    const all = this.getAvailableVoices();
    if (!all.length) return null;

    const lower = (style || 'calm').toLowerCase();

    if (lower.includes('deep') || lower.includes('adam')) {
      const male = all.find(v => /david|alex|daniel|george|guy|male/i.test(v.name));
      if (male) return male;
    } else if (lower.includes('warm') || lower.includes('antoni')) {
      const warm = all.find(v => /natural|oliver|arthur|richard/i.test(v.name));
      if (warm) return warm;
    } else if (lower.includes('calm') || lower.includes('bella') || lower.includes('gentle')) {
      const female = all.find(v => /samantha|karen|victoria|moira|zira|female/i.test(v.name));
      if (female) return female;
    }

    // Default to first english voice or system voice
    return all[0] || null;
  }

  public speakAffirmation(
    text: string,
    options: SpeechOptions = {},
    onEnd?: () => void,
    onWord?: (word: string, index: number) => void
  ) {
    if (!this.synth || !this.isSupported) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    const styleLower = (options.voiceStyle || 'calm').toLowerCase();

    // Default pitch and rate tuned for sovereign, calm subconscious immersion
    if (styleLower.includes('deep')) {
      utterance.pitch = options.pitch ?? 0.88;
      utterance.rate = options.rate ?? 0.82;
    } else if (styleLower.includes('warm')) {
      utterance.pitch = options.pitch ?? 0.98;
      utterance.rate = options.rate ?? 0.85;
    } else if (styleLower.includes('gentle')) {
      utterance.pitch = options.pitch ?? 1.08;
      utterance.rate = options.rate ?? 0.80;
    } else {
      utterance.pitch = options.pitch ?? 1.04;
      utterance.rate = options.rate ?? 0.82;
    }

    utterance.volume = options.volume !== undefined ? Math.max(0, Math.min(1, options.volume)) : 0.65;
    utterance.lang = options.lang || 'en-US';

    const selectedVoice = this.pickVoiceForStyle(options.voiceStyle);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (onWord) {
      utterance.addEventListener('boundary', (e) => {
        if (e.name === 'word') {
          const word = text.slice(e.charIndex, e.charIndex + (e.charLength || 6));
          onWord(word, e.charIndex);
        }
      });
    }

    utterance.addEventListener('end', () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    });

    utterance.addEventListener('error', () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    });

    this.currentUtterance = utterance;
    this.isPlaying = true;

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[Orbit SpeechSynthesis] speak error:', err);
      if (onEnd) onEnd();
    }
  }

  public speakSequence(
    affirmations: string[],
    options: SpeechOptions = {},
    onAffirmationChange?: (index: number, text: string) => void,
    onComplete?: () => void,
    pauseBetweenMs = 2800
  ) {
    if (!affirmations || !affirmations.length) return;
    this.stop();

    this.queue = [...affirmations];
    this.loopSequence = options.loop !== false;
    let idx = 0;

    const speakNext = () => {
      if (!this.isPlaying || !this.queue.length) return;

      if (idx >= this.queue.length) {
        if (this.loopSequence) {
          idx = 0;
          this.sequenceTimer = setTimeout(speakNext, 3500);
          return;
        }
        this.isPlaying = false;
        if (onComplete) onComplete();
        return;
      }

      const text = this.queue[idx];
      if (onAffirmationChange) onAffirmationChange(idx, text);

      this.speakAffirmation(text, options, () => {
        idx++;
        this.sequenceTimer = setTimeout(speakNext, pauseBetweenMs);
      });
    };

    this.isPlaying = true;
    speakNext();
  }

  public setVolume(vol: number) {
    if (this.currentUtterance) {
      this.currentUtterance.volume = Math.max(0, Math.min(1, vol));
    }
  }

  public pause() {
    if (this.synth) {
      try {
        this.synth.pause();
      } catch {}
    }
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  public resume() {
    if (this.synth) {
      try {
        this.synth.resume();
      } catch {}
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.queue = [];
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}

export const spokenAffirmationEngine = new SpokenAffirmationEngine();
