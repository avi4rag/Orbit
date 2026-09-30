/**
 * Orbit Web Audio API Acoustic Engine
 * Generates real-time binaural beats, Solfeggio frequencies, and procedural ambient soundbeds:
 * - Cosmic Brown Noise (deep planetary calm)
 * - Pink Flow (natural organic breeze)
 * - Ocean Waves (rhythmic harmonic wave swells)
 * - Celestial Drone (multi-harmonic resonant chords)
 * - Rain Textures (gentle rain showers)
 */

export type AmbientTexture = 'brown' | 'pink' | 'ocean' | 'drone' | 'rain' | 'none';

export function resolveAtmosphereTexture(atmosphere?: string): AmbientTexture {
  if (!atmosphere) return 'brown';
  const lower = atmosphere.toLowerCase();
  if (lower.includes('window') || lower.includes('rain') || lower.includes('lluvia') || lower.includes('forest')) return 'rain';
  if (lower.includes('ocean') || lower.includes('wave') || lower.includes('water') || lower.includes('surf')) return 'ocean';
  if (lower.includes('pink') || lower.includes('breeze') || lower.includes('flow')) return 'pink';
  if (lower.includes('drone') || lower.includes('celestial') || lower.includes('space')) return 'drone';
  if (lower.includes('brown') || lower.includes('ground') || lower.includes('earth')) return 'brown';
  return 'brown';
}

export class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private harmonicOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private noiseSources: AudioBufferSourceNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private isRunning: boolean = false;
  private currentVolume: number = 0.8;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.warn);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
      } catch {
        this.masterGain.gain.value = this.currentVolume;
      }
    }
  }

  public setFrequencies(carrierFreq: number, binauralFreq: number = 6.0) {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    try {
      if (this.leftOsc) {
        this.leftOsc.frequency.setTargetAtTime(carrierFreq, now, 0.2);
      }
      if (this.rightOsc) {
        this.rightOsc.frequency.setTargetAtTime(carrierFreq + binauralFreq, now, 0.2);
      }
    } catch {
      // Ignore rapid parameter change bounds
    }
  }

  public startSoundscape(options: {
    carrierFreq?: number;
    binauralFreq?: number;
    texture?: AmbientTexture;
    includeNoise?: boolean;
    includeDrone?: boolean;
  }) {
    this.initContext();
    this.stopSoundscape();

    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.currentVolume, now);

    const carrier = options.carrierFreq || 528;
    const binaural = options.binauralFreq || 6;
    const texture = options.texture || (options.includeNoise !== false ? 'brown' : 'none');

    // 1. Binaural Stereo Routing (Left: Carrier, Right: Carrier + Binaural)
    const merger = this.ctx.createChannelMerger(2);

    // Left Ear
    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(carrier, now);
    const leftGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.001, now);
    leftGain.gain.exponentialRampToValueAtTime(0.28, now + 1.2);
    this.leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    // Right Ear
    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(carrier + binaural, now);
    const rightGain = this.ctx.createGain();
    rightGain.gain.setValueAtTime(0.001, now);
    rightGain.gain.exponentialRampToValueAtTime(0.28, now + 1.2);
    this.rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.masterGain);
    this.leftOsc.start(now);
    this.rightOsc.start(now);

    // 2. Procedural Ambient Texture Layer
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.75, now + 1.5);
    this.ambientGain.connect(this.masterGain);

    if (texture !== 'none') {
      this.attachAmbientTexture(texture, carrier);
    }

    this.isRunning = true;
  }

  private attachAmbientTexture(texture: AmbientTexture, carrier: number) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    if (texture === 'brown') {
      // Deep warm brown noise (planetary rumble)
      const noise = this.createNoiseSource('brown');
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      this.noiseSources.push(noise);

    } else if (texture === 'pink') {
      // Organic pink noise breeze
      const noise = this.createNoiseSource('pink');
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.Q.setValueAtTime(0.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      this.noiseSources.push(noise);

    } else if (texture === 'ocean') {
      // Rhythmic ocean surf swells
      const noise = this.createNoiseSource('pink');
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);

      const waveGain = this.ctx.createGain();
      waveGain.gain.setValueAtTime(0.2, now);

      // Low frequency oscillator for wave swells (0.12 Hz = ~8.3 sec per wave cycle)
      this.lfoOsc = this.ctx.createOscillator();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.12, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.18, now);

      this.lfoOsc.connect(lfoGain);
      lfoGain.connect(waveGain.gain);
      this.lfoOsc.start(now);

      noise.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.ambientGain);
      this.noiseSources.push(noise);

    } else if (texture === 'rain') {
      // Gentle soft rainfall drops
      const noise = this.createNoiseSource('pink');
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      this.noiseSources.push(noise);

    } else if (texture === 'drone') {
      // Harmonic celestial chord (octaves and fifths)
      const baseFreq = carrier > 200 ? carrier / 4 : 108;
      const harmonics = [baseFreq, baseFreq * 1.5, baseFreq * 2];

      harmonics.forEach(freq => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.12, now);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.ambientGain);

        osc.start(now);
        this.harmonicOscs.push(osc);
      });
    }
  }

  public stopSoundscape() {
    if (!this.ctx || !this.isRunning) return;

    const now = this.ctx.currentTime;

    try {
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0.001, now, 0.08);
      }

      setTimeout(() => {
        try {
          if (this.leftOsc) {
            this.leftOsc.stop();
            this.leftOsc.disconnect();
            this.leftOsc = null;
          }
          if (this.rightOsc) {
            this.rightOsc.stop();
            this.rightOsc.disconnect();
            this.rightOsc = null;
          }
          if (this.lfoOsc) {
            this.lfoOsc.stop();
            this.lfoOsc.disconnect();
            this.lfoOsc = null;
          }
          this.harmonicOscs.forEach(o => {
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
          this.harmonicOscs = [];

          this.noiseSources.forEach(s => {
            try {
              s.stop();
              s.disconnect();
            } catch {}
          });
          this.noiseSources = [];

          if (this.ambientGain) {
            this.ambientGain.disconnect();
            this.ambientGain = null;
          }

          if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
          }
        } catch {
          // ignore clean disconnect
        }
      }, 120);

    } catch {
      // ignore clean stops
    }

    this.isRunning = false;
  }

  public pause() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(console.warn);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.warn);
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private createNoiseSource(type: 'brown' | 'pink'): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const bufferSize = 3 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    } else {
      // Pink noise using 3-pole filter approximation
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start(0);
    return source;
  }
}

export const webAudioEngine = new WebAudioEngine();
