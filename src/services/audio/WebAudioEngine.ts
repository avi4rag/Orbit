/**
 * Orbit Web Audio API Acoustic Engine
 * Generates real-time binaural beats, Solfeggio frequencies, and celestial noise textures
 */

export class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private droneOsc: OscillatorNode | null = null;
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
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setFrequencies(carrierFreq: number, binauralFreq: number = 6.0) {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    if (this.leftOsc) {
      this.leftOsc.frequency.setTargetAtTime(carrierFreq, now, 0.2);
    }
    if (this.rightOsc) {
      this.rightOsc.frequency.setTargetAtTime(carrierFreq + binauralFreq, now, 0.2);
    }
    if (this.droneOsc) {
      this.droneOsc.frequency.setTargetAtTime(carrierFreq / 4, now, 0.2);
    }
  }

  public startSoundscape(options: {
    carrierFreq?: number;
    binauralFreq?: number;
    includeNoise?: boolean;
    includeDrone?: boolean;
  }) {
    this.initContext();
    this.stopSoundscape(); // clear any existing sound

    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const carrier = options.carrierFreq || 528;
    const binaural = options.binauralFreq || 6; // 6Hz Theta

    // 1. Binaural Stereo Routing (Left: Carrier, Right: Carrier + Binaural)
    const merger = this.ctx.createChannelMerger(2);

    // Left Ear
    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(carrier, now);
    const leftGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0, now);
    leftGain.gain.linearRampToValueAtTime(0.35, now + 1.5);
    this.leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0); // connect to left channel

    // Right Ear
    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(carrier + binaural, now);
    const rightGain = this.ctx.createGain();
    rightGain.gain.setValueAtTime(0, now);
    rightGain.gain.linearRampToValueAtTime(0.35, now + 1.5);
    this.rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1); // connect to right channel

    merger.connect(this.masterGain);

    this.leftOsc.start(now);
    this.rightOsc.start(now);

    // 2. Cosmic Ambient Drone (Sub-harmonic fundamental for warmth)
    if (options.includeDrone !== false) {
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(carrier / 4, now); // 2 octaves below
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(320, now);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0, now);
      droneGain.gain.linearRampToValueAtTime(0.2, now + 2);

      this.droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain);
      this.droneOsc.start(now);
    }

    // 3. Cosmic Brown Noise Texture (Gentle space surf)
    if (options.includeNoise !== false) {
      this.noiseNode = this.createBrownNoiseNode(this.ctx);
      if (this.noiseNode) {
        this.noiseNode.connect(this.masterGain);
      }
    }

    this.isRunning = true;
  }

  public stopSoundscape() {
    if (!this.ctx || !this.isRunning) return;

    const now = this.ctx.currentTime;

    try {
      if (this.leftOsc) {
        this.leftOsc.stop(now + 0.5);
        this.leftOsc.disconnect();
        this.leftOsc = null;
      }
      if (this.rightOsc) {
        this.rightOsc.stop(now + 0.5);
        this.rightOsc.disconnect();
        this.rightOsc = null;
      }
      if (this.droneOsc) {
        this.droneOsc.stop(now + 0.5);
        this.droneOsc.disconnect();
        this.droneOsc = null;
      }
      if (this.noiseNode) {
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
    } catch {
      // ignore clean stops
    }

    this.isRunning = false;
  }

  public pause() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private createBrownNoiseNode(ctx: AudioContext): AudioNode {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    return gain;
  }
}

export const webAudioEngine = new WebAudioEngine();
